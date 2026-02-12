from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofSocial"])


# ---- Schemas ----

class PostCreate(BaseModel):
    content: Optional[str] = None
    photo_url: Optional[str] = None
    dog_id: Optional[int] = None


class CommentCreate(BaseModel):
    content: str


# ---- Feed ----

@router.get("/social/feed")
def get_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    followed_ids = [
        f.followed_id
        for f in db.query(models.Follow).filter(
            models.Follow.follower_id == current_user.id
        ).all()
    ]
    feed_user_ids = followed_ids + [current_user.id]
    posts = (
        db.query(models.Post)
        .filter(models.Post.user_id.in_(feed_user_ids))
        .order_by(models.Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    results = []
    for post in posts:
        user = db.query(models.User).filter(models.User.id == post.user_id).first()
        liked = (
            db.query(models.PostLike)
            .filter(
                models.PostLike.post_id == post.id,
                models.PostLike.user_id == current_user.id,
            )
            .first()
            is not None
        )
        results.append({
            "id": post.id,
            "user_id": post.user_id,
            "user_name": user.full_name if user else None,
            "user_avatar": user.avatar_url if user else None,
            "dog_id": post.dog_id,
            "content": post.content,
            "photo_url": post.photo_url,
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "liked_by_me": liked,
            "created_at": post.created_at.isoformat() if post.created_at else None,
        })
    return results


# ---- Posts CRUD ----

@router.post("/social/posts")
def create_post(
    data: PostCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not data.content and not data.photo_url:
        raise HTTPException(
            status_code=400, detail="Le post doit contenir du texte ou une photo"
        )
    if data.dog_id:
        dog = db.query(models.Dog).filter(
            models.Dog.id == data.dog_id, models.Dog.owner_id == current_user.id
        ).first()
        if not dog:
            raise HTTPException(status_code=404, detail="Chien non trouve")
    post = models.Post(
        user_id=current_user.id,
        dog_id=data.dog_id,
        content=data.content,
        photo_url=data.photo_url,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {
        "id": post.id,
        "user_id": post.user_id,
        "dog_id": post.dog_id,
        "content": post.content,
        "photo_url": post.photo_url,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "created_at": post.created_at.isoformat() if post.created_at else None,
    }


@router.get("/social/posts/{post_id}")
def get_post_detail(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouve")
    user = db.query(models.User).filter(models.User.id == post.user_id).first()
    liked = (
        db.query(models.PostLike)
        .filter(
            models.PostLike.post_id == post.id,
            models.PostLike.user_id == current_user.id,
        )
        .first()
        is not None
    )
    comments = (
        db.query(models.PostComment)
        .filter(models.PostComment.post_id == post_id)
        .order_by(models.PostComment.created_at.asc())
        .all()
    )
    comments_list = []
    for c in comments:
        c_user = db.query(models.User).filter(models.User.id == c.user_id).first()
        comments_list.append({
            "id": c.id,
            "user_id": c.user_id,
            "user_name": c_user.full_name if c_user else None,
            "user_avatar": c_user.avatar_url if c_user else None,
            "content": c.content,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return {
        "id": post.id,
        "user_id": post.user_id,
        "user_name": user.full_name if user else None,
        "user_avatar": user.avatar_url if user else None,
        "dog_id": post.dog_id,
        "content": post.content,
        "photo_url": post.photo_url,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "liked_by_me": liked,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "comments": comments_list,
    }


@router.delete("/social/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.Post).filter(
        models.Post.id == post_id, models.Post.user_id == current_user.id
    ).first()
    if not post:
        raise HTTPException(
            status_code=404, detail="Post non trouve ou non autorise"
        )
    db.query(models.PostLike).filter(models.PostLike.post_id == post_id).delete()
    db.query(models.PostComment).filter(
        models.PostComment.post_id == post_id
    ).delete()
    db.delete(post)
    db.commit()
    return {"status": "deleted"}


# ---- Likes ----

@router.post("/social/posts/{post_id}/like")
def toggle_like(
    post_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouve")
    existing = db.query(models.PostLike).filter(
        models.PostLike.post_id == post_id,
        models.PostLike.user_id == current_user.id,
    ).first()
    if existing:
        db.delete(existing)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"status": "unliked", "likes_count": post.likes_count}
    else:
        like = models.PostLike(post_id=post_id, user_id=current_user.id)
        db.add(like)
        post.likes_count = post.likes_count + 1
        db.commit()
        return {"status": "liked", "likes_count": post.likes_count}


# ---- Comments ----

@router.post("/social/posts/{post_id}/comment")
def add_comment(
    post_id: int,
    data: CommentCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post non trouve")
    comment = models.PostComment(
        post_id=post_id,
        user_id=current_user.id,
        content=data.content,
    )
    db.add(comment)
    post.comments_count = post.comments_count + 1
    db.commit()
    db.refresh(comment)
    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "created_at": comment.created_at.isoformat() if comment.created_at else None,
    }


# ---- Follow ----

@router.post("/social/follow/{user_id}")
def toggle_follow(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Vous ne pouvez pas vous suivre vous-meme",
        )
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    existing = db.query(models.Follow).filter(
        models.Follow.follower_id == current_user.id,
        models.Follow.followed_id == user_id,
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "unfollowed"}
    else:
        follow = models.Follow(follower_id=current_user.id, followed_id=user_id)
        db.add(follow)
        db.commit()
        return {"status": "followed"}


# ---- Profile & Followers ----

@router.get("/social/profile/{user_id}")
def get_social_profile(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    post_count = db.query(func.count(models.Post.id)).filter(
        models.Post.user_id == user_id
    ).scalar()
    followers_count = db.query(func.count(models.Follow.id)).filter(
        models.Follow.followed_id == user_id
    ).scalar()
    following_count = db.query(func.count(models.Follow.id)).filter(
        models.Follow.follower_id == user_id
    ).scalar()
    is_following = (
        db.query(models.Follow)
        .filter(
            models.Follow.follower_id == current_user.id,
            models.Follow.followed_id == user_id,
        )
        .first()
        is not None
    )
    posts = (
        db.query(models.Post)
        .filter(models.Post.user_id == user_id)
        .order_by(models.Post.created_at.desc())
        .limit(50)
        .all()
    )
    posts_list = [
        {
            "id": p.id,
            "content": p.content,
            "photo_url": p.photo_url,
            "likes_count": p.likes_count,
            "comments_count": p.comments_count,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in posts
    ]
    return {
        "id": user.id,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "city": user.city,
        "post_count": post_count,
        "followers_count": followers_count,
        "following_count": following_count,
        "is_following": is_following,
        "posts": posts_list,
    }


@router.get("/social/followers/{user_id}")
def list_followers(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    follows = (
        db.query(models.Follow)
        .filter(models.Follow.followed_id == user_id)
        .order_by(models.Follow.created_at.desc())
        .all()
    )
    results = []
    for f in follows:
        follower = db.query(models.User).filter(
            models.User.id == f.follower_id
        ).first()
        if follower:
            results.append({
                "id": follower.id,
                "full_name": follower.full_name,
                "avatar_url": follower.avatar_url,
                "city": follower.city,
            })
    return results


@router.get("/social/following/{user_id}")
def list_following(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    follows = (
        db.query(models.Follow)
        .filter(models.Follow.follower_id == user_id)
        .order_by(models.Follow.created_at.desc())
        .all()
    )
    results = []
    for f in follows:
        followed = db.query(models.User).filter(
            models.User.id == f.followed_id
        ).first()
        if followed:
            results.append({
                "id": followed.id,
                "full_name": followed.full_name,
                "avatar_url": followed.avatar_url,
                "city": followed.city,
            })
    return results

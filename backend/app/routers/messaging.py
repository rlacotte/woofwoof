from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/api", tags=["messaging"])


def user_in_match(user: models.User, match: models.Match, db: Session) -> bool:
    my_dog_ids = [d.id for d in user.dogs]
    return match.dog_1_id in my_dog_ids or match.dog_2_id in my_dog_ids


@router.post("/messages", response_model=schemas.MessageOut)
def send_message(
    data: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match = db.query(models.Match).filter(models.Match.id == data.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match non trouvé")
    if not user_in_match(current_user, match, db):
        raise HTTPException(status_code=403, detail="Non autorisé")

    msg = models.Message(
        match_id=data.match_id,
        sender_id=current_user.id,
        content=data.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/messages/{match_id}", response_model=list[schemas.MessageOut])
def get_messages(
    match_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match non trouvé")
    if not user_in_match(current_user, match, db):
        raise HTTPException(status_code=403, detail="Non autorisé")

    messages = (
        db.query(models.Message)
        .filter(models.Message.match_id == match_id)
        .order_by(models.Message.created_at.asc())
        .all()
    )

    # mark unread messages as read
    for msg in messages:
        if msg.sender_id != current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()

    return messages

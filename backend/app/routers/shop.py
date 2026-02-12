from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from .. import models

router = APIRouter(prefix="/api", tags=["WoofShop"])


# ---- Schemas ----

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class OrderCreate(BaseModel):
    shipping_address: str


# ---- Products ----

@router.get("/shop/products")
def list_products(
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    if min_price is not None:
        query = query.filter(models.Product.price >= min_price)
    if max_price is not None:
        query = query.filter(models.Product.price <= max_price)
    if search:
        query = query.filter(
            models.Product.name.ilike(f"%{search}%")
            | models.Product.description.ilike(f"%{search}%")
        )
    if sort_by == "price_asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.Product.price.desc())
    elif sort_by == "rating":
        query = query.order_by(models.Product.rating.desc())
    elif sort_by == "newest":
        query = query.order_by(models.Product.created_at.desc())
    else:
        query = query.order_by(models.Product.created_at.desc())
    products = query.offset(skip).limit(limit).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "category": p.category,
            "image_url": p.image_url,
            "stock": p.stock,
            "rating": p.rating,
            "brand": p.brand,
            "is_featured": p.is_featured,
        }
        for p in products
    ]


@router.get("/shop/products/{product_id}")
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(
        models.Product.id == product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouve")
    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "image_url": product.image_url,
        "stock": product.stock,
        "rating": product.rating,
        "brand": product.brand,
        "is_featured": product.is_featured,
        "created_at": product.created_at.isoformat() if product.created_at else None,
    }


@router.get("/shop/categories")
def list_categories(
    db: Session = Depends(get_db),
):
    categories = (
        db.query(models.Product.category)
        .distinct()
        .order_by(models.Product.category)
        .all()
    )
    return [c[0] for c in categories]


# ---- Cart ----

@router.get("/shop/cart")
def get_cart(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    cart_items = []
    total = 0.0
    for item in items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        if product:
            subtotal = product.price * item.quantity
            total += subtotal
            cart_items.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name,
                "product_image": product.image_url,
                "price": product.price,
                "quantity": item.quantity,
                "subtotal": round(subtotal, 2),
            })
    return {"items": cart_items, "total": round(total, 2)}


@router.post("/shop/cart")
def add_to_cart(
    data: CartItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(models.Product).filter(
        models.Product.id == data.product_id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produit non trouve")
    if product.stock < data.quantity:
        raise HTTPException(status_code=400, detail="Stock insuffisant")
    existing = db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id,
        models.CartItem.product_id == data.product_id,
    ).first()
    if existing:
        existing.quantity += data.quantity
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "product_id": existing.product_id,
            "quantity": existing.quantity,
        }
    else:
        cart_item = models.CartItem(
            user_id=current_user.id,
            product_id=data.product_id,
            quantity=data.quantity,
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        return {
            "id": cart_item.id,
            "product_id": cart_item.product_id,
            "quantity": cart_item.quantity,
        }


@router.put("/shop/cart/{item_id}")
def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouve dans le panier")
    if data.quantity <= 0:
        db.delete(item)
        db.commit()
        return {"status": "removed"}
    product = db.query(models.Product).filter(
        models.Product.id == item.product_id
    ).first()
    if product and product.stock < data.quantity:
        raise HTTPException(status_code=400, detail="Stock insuffisant")
    item.quantity = data.quantity
    db.commit()
    db.refresh(item)
    return {
        "id": item.id,
        "product_id": item.product_id,
        "quantity": item.quantity,
    }


@router.delete("/shop/cart/{item_id}")
def remove_from_cart(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouve dans le panier")
    db.delete(item)
    db.commit()
    return {"status": "removed"}


# ---- Orders ----

@router.post("/shop/orders")
def place_order(
    data: OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Votre panier est vide")

    total = 0.0
    order_items_data = []
    for item in cart_items:
        product = db.query(models.Product).filter(
            models.Product.id == item.product_id
        ).first()
        if not product:
            raise HTTPException(
                status_code=400,
                detail=f"Produit {item.product_id} non trouve",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuffisant pour {product.name}",
            )
        subtotal = product.price * item.quantity
        total += subtotal
        order_items_data.append({
            "product_id": product.id,
            "quantity": item.quantity,
            "price": product.price,
        })

    order = models.Order(
        user_id=current_user.id,
        total=round(total, 2),
        status="pending",
        shipping_address=data.shipping_address,
    )
    db.add(order)
    db.flush()

    for oi_data in order_items_data:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=oi_data["product_id"],
            quantity=oi_data["quantity"],
            price=oi_data["price"],
        )
        db.add(order_item)
        product = db.query(models.Product).filter(
            models.Product.id == oi_data["product_id"]
        ).first()
        if product:
            product.stock -= oi_data["quantity"]

    db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).delete()
    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "total": order.total,
        "status": order.status,
        "shipping_address": order.shipping_address,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.get("/shop/orders")
def get_orders(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == current_user.id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    results = []
    for order in orders:
        items = db.query(models.OrderItem).filter(
            models.OrderItem.order_id == order.id
        ).all()
        items_list = []
        for item in items:
            product = db.query(models.Product).filter(
                models.Product.id == item.product_id
            ).first()
            items_list.append({
                "id": item.id,
                "product_id": item.product_id,
                "product_name": product.name if product else None,
                "product_image": product.image_url if product else None,
                "quantity": item.quantity,
                "price": item.price,
            })
        results.append({
            "id": order.id,
            "total": order.total,
            "status": order.status,
            "shipping_address": order.shipping_address,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": items_list,
        })
    return results

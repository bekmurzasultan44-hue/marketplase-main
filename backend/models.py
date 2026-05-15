from sqlalchemy import Column, Integer, String, Float
from database import Base

# --- ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ ---
# Полностью соответствует структуре из db.json (users)
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True) # "u1", "u2" и т.д.
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String) # admin, seller, buyer
    avatar = Column(String)
    
    # Поля для продавцов (могут быть пустыми для обычных юзеров)
    sales = Column(Integer, default=0, nullable=True)
    rating = Column(Float, nullable=True)
    specialty = Column(String, nullable=True)
    createdAt = Column(String) # Дата в формате "2026-01-01"

# --- ТАБЛИЦА ТОВАРОВ ---
# Полностью соответствует структуре из db.json (products)
class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True) # "p100", "p101"
    title = Column(String, index=True)
    sellerId = Column(String)
    sellerName = Column(String)
    price = Column(Float)
    currency = Column(String, default="ETH")
    image = Column(String)
    desc = Column(String) # Важно: именно "desc", как у Данияра
    rating = Column(Float)
    sales = Column(Integer)
    status = Column(String, default="active")
    createdAt = Column(String)
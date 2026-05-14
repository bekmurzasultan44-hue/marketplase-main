from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Импортируем твои настройки базы и модели
import models
from database import engine, SessionLocal

# Создаем таблицы в базе данных (если их еще нет)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Функция для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Главная страница (теперь просто JSON, как хотел Данияр)
@app.get("/")
async def read_root():
    return {"status": "success", "message": "Backend API is running"}

# 2. Пример эндпоинта для получения данных (измени 'Item' на свою модель, если надо)
@app.get("/items", response_model=List[dict]) # заменяем dict на свою схему, если есть
async def get_items(db: Session = Depends(get_db)):
    # Здесь мы просто берем всё из таблицы, которую ты создал
    # Замени models.Item на то название, которое у тебя в models.py
    items = db.query(models.Item).all()
    return items


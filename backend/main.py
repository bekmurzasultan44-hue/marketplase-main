from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, database

app = FastAPI()

# Разрешаем фронтенду (8080) обращаться к бэкенду (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создаем таблицы
models.Base.metadata.create_all(bind=database.engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Фронтенд Данияра ищет товары тут:
@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()

# Фронтенд ищет пользователей тут:
@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

# На всякий случай оставляем эндпоинт для всей базы
@app.get("/api/db")
def get_full_db(db: Session = Depends(get_db)):
    return {
        "users": db.query(models.User).all(),
        "products": db.query(models.Product).all()
    }
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, get_db

# Создаем таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI() # <--- ПРОВЕРЬ ЭТУ СТРОКУ, ОНА ДОЛЖНА БЫТЬ ТАКОЙ

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "PlayToys API is running"}

@app.get("/items")
def read_items(db: Session = Depends(get_db)):
    items = db.query(models.Product).all()
    return items
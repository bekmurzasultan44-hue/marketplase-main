from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import os

# Если у тебя есть база данных, импорты ниже должны остаться
# from database import engine, SessionLocal
# import models

app = FastAPI()

# Эндпоинт для главной страницы (Витрина сайта)
@app.get("/", response_class=HTMLResponse)
async def read_root():
    # Мы ищем папку templates рядом с файлом main.py
    # Если папка templates лежит внутри папки backend, путь подстроится автоматически
    current_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(current_dir, "templates", "index.html")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return """
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1>Ошибка: Файл index.html не найден</h1>
                <p>Убедись, что папка <b>templates</b> лежит в той же папке, что и <b>main.py</b></p>
            </body>
        </html>
        """

# Твой существующий эндпоинт для получения товаров из базы
@app.get("/items")
async def read_items():
    # Здесь твоя логика получения данных из БД
    # Пока возвращаем пустой список для примера, если базы нет
    return [] 

# Если у тебя были другие эндпоинты (POST и т.д.), просто оставь их ниже
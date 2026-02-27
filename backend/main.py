from fastapi import FastAPI, HTTPException, Request
import logging
import os
from fastapi.middleware.cors import CORSMiddleware
from db import users_collection, lessons_collection
from auth import hash_password, verify_password, create_token
from gemini_service import generate_lesson
from models import get_teaching_style

app = FastAPI()

# Enable CORS so the frontend can access the API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register
@app.post("/register")
def register(user: dict, request: Request):
    logging.info("Register request from %s: %s", request.client.host if request.client else "unknown", user.get("email"))

    existing = users_collection.find_one({"email": user["email"]})
    if existing:
        logging.info("Registration failed - user exists: %s", user.get("email"))
        raise HTTPException(status_code=400, detail="User exists")

    users_collection.insert_one({
        "name": user.get("name"),
        "email": user.get("email"),
        "password": hash_password(user.get("password"))
    })

    logging.info("User registered: %s", user.get("email"))
    return {"message": "Registered successfully"}


# Login
@app.post("/login")
def login(user: dict, request: Request):
    logging.info("Login attempt from %s: %s", request.client.host if request.client else "unknown", user.get("email"))

    db_user = users_collection.find_one({"email": user.get("email")})

    if not db_user or not verify_password(user.get("password"), db_user.get("password")):
        logging.info("Login failed for %s", user.get("email"))
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"email": user.get("email")})
    logging.info("Login successful for %s", user.get("email"))
    return {"token": token}


# Generate Lesson
@app.post("/generate")
def generate(data: dict, request: Request):
    logging.info("Generate request from %s: %s", request.client.host if request.client else "unknown", data.get("email"))

    topic = data.get("topic")
    grade_raw = data.get("grade")
    email = data.get("email")

    if not topic or not grade_raw or not email:
        logging.info("Generate missing fields: %s", {"topic": bool(topic), "grade": bool(grade_raw), "email": bool(email)})
        raise HTTPException(status_code=400, detail="Missing topic, grade, or email")

    try:
        grade = int(grade_raw)
    except (ValueError, TypeError):
        logging.exception("Invalid grade value: %s", grade_raw)
        raise HTTPException(status_code=400, detail="Grade must be a number")

    teaching_style = get_teaching_style(grade)

    try:
        lesson = generate_lesson(topic, grade)
    except Exception as e:
        logging.exception("Lesson generation failed for %s (%s)", topic, email)
        raise HTTPException(status_code=500, detail=str(e) or "Generation service error")

    lessons_collection.insert_one({
        "email": email,
        "topic": topic,
        "grade": grade,
        "lesson": lesson
    })

    return {"lesson": lesson}


# Get User Lessons
@app.get("/lessons/{email}")
def get_lessons(email: str):
    lessons = list(lessons_collection.find({"email": email}, {"_id": 0}))
    return lessons


@app.get("/user/{email}")
def get_user(email: str):
    user = users_collection.find_one({"email": email}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Development-only: list available generative models to help debug model names
@app.get("/debug/models")
def list_models():
    try:
        import google.generativeai as genai

        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set in environment")

        genai.configure(api_key=api_key)
        raw = genai.list_models()

        names = []
        try:
            for m in raw:
                if isinstance(m, dict):
                    names.append(m.get("name") or m.get("id") or str(m))
                else:
                    names.append(getattr(m, "name", None) or str(m))
        except Exception:
            names = [str(raw)]

        return {"models": names}
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Failed to list models")
        raise HTTPException(status_code=500, detail=str(e))
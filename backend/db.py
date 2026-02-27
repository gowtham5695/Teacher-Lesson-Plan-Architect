from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["lesson_plan_db"]

users_collection = db["users"]
lessons_collection = db["lessons"]


print("MongoDB Connected Successfully ✅")
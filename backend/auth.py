import bcrypt
from jose import jwt

SECRET_KEY = "supersecret"

def hash_password(password: str) -> str:
    """Return a UTF-8 string of the bcrypt hash (safe to store in MongoDB)."""
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(password: str, hashed) -> bool:
    """Accept hashed as bytes or UTF-8 string and verify the password."""
    if isinstance(hashed, str):
        hashed = hashed.encode("utf-8")
    return bcrypt.checkpw(password.encode("utf-8"), hashed)

def create_token(data: dict) -> str:
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")
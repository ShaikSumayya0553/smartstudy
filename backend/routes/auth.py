import os
import datetime
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from passlib.context import CryptContext
from database.db import get_collection
from models.schemas import UserRegister, UserLogin, Token, UserResponse
import uuid

router = APIRouter(prefix="/api/auth", tags=["Auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "smartstudy-super-secret-jwt-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token payload")
        
        users_col = get_collection("users")
        user = users_col.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

@router.post("/register", response_model=Token)
def register(user_in: UserRegister):
    users_col = get_collection("users")
    
    # Check existing email or username
    if users_col.find_one({"email": user_in.email}):
        raise HTTPException(status_code=400, detail="User with this email already exists")
    if users_col.find_one({"username": user_in.username}):
        raise HTTPException(status_code=400, detail="Username is already taken")

    user_id = str(uuid.uuid4())
    now_str = datetime.datetime.utcnow().isoformat()
    
    user_doc = {
        "id": user_id,
        "email": user_in.email.lower(),
        "username": user_in.username,
        "full_name": user_in.full_name or "Student",
        "hashed_password": hash_password(user_in.password),
        "created_at": now_str
    }
    users_col.insert_one(user_doc)

    access_token = create_access_token({"sub": user_id, "username": user_in.username})
    user_resp = UserResponse(
        id=user_id,
        email=user_doc["email"],
        username=user_doc["username"],
        full_name=user_doc["full_name"],
        created_at=now_str
    )
    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    users_col = get_collection("users")
    query = credentials.email.lower()
    
    user = users_col.find_one({"$or": [{"email": query}, {"username": query}]})
    if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Incorrect email/username or password")

    access_token = create_access_token({"sub": user["id"], "username": user["username"]})
    user_resp = UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user.get("full_name", "Student"),
        created_at=user.get("created_at", "")
    )
    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        username=current_user["username"],
        full_name=current_user.get("full_name", "Student"),
        created_at=current_user.get("created_at", "")
    )

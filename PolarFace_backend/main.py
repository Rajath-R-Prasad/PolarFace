from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
import face_recognition
from passlib.context import CryptContext
import numpy as np
import io
from PIL import Image
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database setup
DATABASE_URL = "sqlite:///./facial_recognition.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SQLAlchemy User Model
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    face_encoding = Column(LargeBinary, nullable=True)

Base.metadata.create_all(bind=engine)

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserDetails(BaseModel):
    id: int
    username: str


# FastAPI app
app = FastAPI(title="Facial Recognition API", version="1.0.0")

origins = [
    "http://localhost",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19001", 
    "http://10.0.2.2:8081",
    "http://10.0.2.2:19000",
    "http://10.0.2.2:19001",
    "exp://10.166.158.46:8081"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Utility functions
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def preprocess_image(image_data: bytes):
    """Preprocess image for better face recognition"""
    try:
        # Convert to PIL Image for preprocessing
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Resize if too large (face_recognition works better with smaller images)
        max_size = 1024
        if pil_image.width > max_size or pil_image.height > max_size:
            pil_image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Convert back to bytes
        img_byte_arr = io.BytesIO()
        pil_image.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        
        return face_recognition.load_image_file(img_byte_arr)
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        # Fallback to original method
        return face_recognition.load_image_file(io.BytesIO(image_data))

# API Routes
@app.get("/")
async def root():
    return {"message": "Facial Recognition API is running"}

@app.post("/register/")
async def register(
    db: Session = Depends(get_db), 
    username: str = Form(...), 
    password: str = Form(...), 
    file: UploadFile = File(...)
):
    logger.info(f"Registration attempt for username: {username}")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Check if username already exists
    db_user = get_user_by_username(db, username=username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(password)

    try:
       
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        image = preprocess_image(image_data)
        face_encodings = face_recognition.face_encodings(image, model='large')  

        if not face_encodings:
            raise HTTPException(status_code=400, detail="No face found in the image. Please ensure your face is clearly visible.")

        if len(face_encodings) > 1:
            logger.warning(f"Multiple faces detected for user {username}")
            # Use the largest face (first one returned by face_recognition)
        
        face_encoding = face_encodings[0].tobytes()

        db_user = User(username=username, hashed_password=hashed_password, face_encoding=face_encoding)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        logger.info(f"User {username} registered successfully")
        return {"username": username, "message": "Registration successful"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error for {username}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")

@app.post("/login/")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Password login attempt for username: {user.username}")
    
    db_user = get_user_by_username(db, username=user.username)
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        logger.warning(f"Failed login attempt for username: {user.username}")
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    logger.info(f"Successful password login for username: {user.username}")
    return {"message": "Login successful", "username": user.username}

@app.post("/login/face")
async def login_face(db: Session = Depends(get_db), file: UploadFile = File(...)):
    logger.info("Face login attempt")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Face recognition
        image_data = await file.read()
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")
        
        image = preprocess_image(image_data)
        login_face_encodings = face_recognition.face_encodings(image, model='large')

        if not login_face_encodings:
            raise HTTPException(status_code=400, detail="No face found in the image. Please ensure your face is clearly visible.")

        login_face_encoding = login_face_encodings[0]

        # Get all users with face encodings
        users = db.query(User).filter(User.face_encoding.isnot(None)).all()
        
        if not users:
            raise HTTPException(status_code=401, detail="No registered faces found")

        best_match = None
        best_distance = float('inf')
        tolerance = 0.6  # Adjust this value for stricter/looser matching

        for user in users:
            stored_face_encoding = np.frombuffer(user.face_encoding, dtype=np.float64)
            
            # Calculate face distance (lower is better)
            face_distance = face_recognition.face_distance([stored_face_encoding], login_face_encoding)[0]
            
            if face_distance < tolerance and face_distance < best_distance:
                best_distance = face_distance
                best_match = user

        if best_match:
            logger.info(f"Successful face login for username: {best_match.username} (distance: {best_distance:.3f})")
            return {
                "message": "Login successful", 
                "username": best_match.username,
                "confidence": round((1 - best_distance) * 100, 1)
            }
        else:
            logger.warning("Face not recognized")
            raise HTTPException(status_code=401, detail="Face not recognized")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Face login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during face login")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "facial-recognition-api"}

@app.get("/users/{username}", response_model=UserDetails)
async def get_user_details(username: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching details for user: {username}")
    db_user = get_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/users/{username}")
async def delete_user(username: str, db: Session = Depends(get_db)):
    logger.info(f"Attempting to delete user: {username}")
    db_user = get_user_by_username(db, username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    logger.info(f"User {username} deleted successfully")
    return {"message": f"User {username} deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
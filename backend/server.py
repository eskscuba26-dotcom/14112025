from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Shipment Models
class Shipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # Sevkiyat Tarihi
    customer: str  # Müşteri Adı
    product_type: str  # Ürün Tipi (Normal Ürün (Metre) vs.)
    color: str  # RENK - YENİ ALAN!
    thickness: str  # Kalınlık (mm)
    width: str  # En (cm)
    length: str  # Metre (m)
    quantity: int  # Adet
    square_meter: float  # Metrekare (m²)
    waybill_no: str = ""  # İrsaliye No
    plate: str = ""  # Plaka
    driver: str = ""  # Sürücü
    description: str = ""  # Ürün Açıklaması
    notes: str = ""  # Notlar
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShipmentCreate(BaseModel):
    date: str
    customer: str
    product_type: str
    color: str  # RENK - YENİ ALAN!
    thickness: str
    width: str
    length: str
    quantity: int
    square_meter: float
    waybill_no: str = ""
    plate: str = ""
    driver: str = ""
    description: str = ""
    notes: str = ""

class ShipmentUpdate(BaseModel):
    date: str = None
    customer: str = None
    product_type: str = None
    color: str = None  # RENK - YENİ ALAN!
    thickness: str = None
    width: str = None
    length: str = None
    quantity: int = None
    square_meter: float = None
    waybill_no: str = None
    plate: str = None
    driver: str = None
    description: str = None
    notes: str = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Shipment Routes
@api_router.get("/shipments", response_model=List[Shipment])
async def get_shipments():
    """Tüm sevkiyatları getir"""
    shipments = await db.shipments.find({}, {"_id": 0}).to_list(10000)
    
    for shipment in shipments:
        if isinstance(shipment.get('created_at'), str):
            shipment['created_at'] = datetime.fromisoformat(shipment['created_at'])
    
    return shipments

@api_router.post("/shipments", response_model=Shipment)
async def create_shipment(input: ShipmentCreate):
    """Yeni sevkiyat kaydı oluştur"""
    shipment_dict = input.model_dump()
    shipment_obj = Shipment(**shipment_dict)
    
    # Convert to dict and serialize datetime
    doc = shipment_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.shipments.insert_one(doc)
    return shipment_obj

@api_router.put("/shipments/{shipment_id}", response_model=Shipment)
async def update_shipment(shipment_id: str, input: ShipmentUpdate):
    """Sevkiyat kaydını güncelle"""
    # Get existing shipment
    existing = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if not existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Sevkiyat bulunamadı")
    
    # Update only provided fields
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if update_data:
        await db.shipments.update_one({"id": shipment_id}, {"$set": update_data})
    
    # Get updated shipment
    updated = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    return Shipment(**updated)

@api_router.delete("/shipments/{shipment_id}")
async def delete_shipment(shipment_id: str):
    """Sevkiyat kaydını sil"""
    result = await db.shipments.delete_one({"id": shipment_id})
    
    if result.deleted_count == 0:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Sevkiyat bulunamadı")
    
    return {"message": "Sevkiyat başarıyla silindi", "id": shipment_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
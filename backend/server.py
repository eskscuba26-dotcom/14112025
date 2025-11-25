from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
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


# ==================== MODELS ====================

# User Model
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str  # In production, this should be hashed
    role: str = "Yönetici"  # Yönetici, Kullanıcı
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "Yönetici"


# Üretim Girişi (Production Entry) Model
class ProductionEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tarih: str  # Date
    makine: str  # MAKİNE 1, MAKİNE 2, MAKİNE 3
    kalinlik: float  # Thickness (mm)
    en: float  # Width (cm)
    boy: float  # Length (cm)
    adet: int  # Quantity
    metrekare: float  # Square meters (calculated)
    masura: Optional[int] = None  # Masura
    m_adet: Optional[int] = None  # M.Adet
    model: Optional[str] = None
    gaz_agirligi: float  # Gas weight (kg)
    renk: Optional[str] = None  # Color (Sarı, Mavi, etc.)
    notlar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductionEntryCreate(BaseModel):
    tarih: str
    makine: str
    kalinlik: float
    en: float
    boy: float
    adet: int
    metrekare: float
    masura: Optional[int] = None
    m_adet: Optional[int] = None
    model: Optional[str] = None
    gaz_agirligi: float
    renk: Optional[str] = None
    notlar: Optional[str] = None


# Kesilmiş Ürün (Cut Product) Model
class CutProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ana_urun_id: str  # Reference to production entry
    boyut: str  # Dimensions (e.g., "100x200")
    kalinlik: float  # Thickness (mm)
    en: float  # Width (cm)
    boy: float  # Length (cm)
    adet: int  # Quantity
    metrekare: float  # Square meters
    kullanilan: int  # Used quantity
    tarih: str  # Cut date
    durum: str = "Onaylı"  # Status
    renk: Optional[str] = None  # Color - ADDED!
    notlar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CutProductCreate(BaseModel):
    ana_urun_id: str
    boyut: str
    kalinlik: float
    en: float
    boy: float
    adet: int
    metrekare: float
    kullanilan: int
    tarih: str
    durum: str = "Onaylı"
    renk: Optional[str] = None  # Color - ADDED!
    notlar: Optional[str] = None


# Sevkiyat (Shipment) Model
class Shipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sevkiyat_tarihi: str
    musteri_adi: str
    urun_tipi: str  # "Normal Ürün (Metre)" or "Kesim"
    kalinlik: float  # Thickness (mm)
    en: float  # Width (cm)
    metre: Optional[float] = None  # For normal products
    boy: Optional[float] = None  # For cut products
    adet: int
    metrekare: float
    irsaliye_no: Optional[str] = None
    plaka: Optional[str] = None
    surucu: Optional[str] = None
    urun_aciklamasi: Optional[str] = None
    renk: Optional[str] = None  # Color - ADDED!
    notlar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShipmentCreate(BaseModel):
    sevkiyat_tarihi: str
    musteri_adi: str
    urun_tipi: str
    kalinlik: float
    en: float
    metre: Optional[float] = None
    boy: Optional[float] = None
    adet: int
    metrekare: float
    irsaliye_no: Optional[str] = None
    plaka: Optional[str] = None
    surucu: Optional[str] = None
    urun_aciklamasi: Optional[str] = None
    renk: Optional[str] = None  # Color - ADDED!
    notlar: Optional[str] = None


# Hammadde (Raw Material) Model
class RawMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    malzeme_adi: str  # GAZ, PETKİM, ESTOL, TALK, MASURA, SARI RENK, etc.
    miktar: float
    birim: str  # kg, adet, etc.
    tedarikci: Optional[str] = None
    alim_tarihi: str
    birim_fiyat: float
    para_birimi: str = "TRY"  # TRY, USD, EUR
    toplam_maliyet: float  # Calculated
    notlar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RawMaterialCreate(BaseModel):
    malzeme_adi: str
    miktar: float
    birim: str
    tedarikci: Optional[str] = None
    alim_tarihi: str
    birim_fiyat: float
    para_birimi: str = "TRY"
    toplam_maliyet: float
    notlar: Optional[str] = None


# Gaz Girişi (Gas Entry) Model
class GasEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tarih: str
    toplam_gaz: float  # Total gas (kg)
    notlar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GasEntryCreate(BaseModel):
    tarih: str
    toplam_gaz: float
    notlar: Optional[str] = None


# Ekstra Malzeme (Extra Material) Model
class ExtraMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    malzeme_adi: str
    miktar: float
    birim: str
    alim_tarihi: str
    birim_fiyat: float
    para_birimi: str = "TRY"
    notlar: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExtraMaterialCreate(BaseModel):
    malzeme_adi: str
    miktar: float
    birim: str
    alim_tarihi: str
    birim_fiyat: float
    para_birimi: str = "TRY"
    notlar: Optional[str] = None


# Kur (Exchange Rate) Model
class ExchangeRate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tarih: str
    usd: float
    eur: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExchangeRateCreate(BaseModel):
    tarih: str
    usd: float
    eur: float


# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login endpoint"""
    user = await db.users.find_one({"username": credentials.username}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    
    if user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Şifre hatalı")
    
    return {
        "success": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"]
        }
    }


@api_router.post("/auth/register", response_model=User)
async def register(input: UserCreate):
    """Register new user"""
    # Check if user already exists
    existing = await db.users.find_one({"username": input.username}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor")
    
    user_dict = input.model_dump()
    user_obj = User(**user_dict)
    
    doc = user_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj


@api_router.get("/users", response_model=List[User])
async def get_users():
    """Get all users"""
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users


@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete user"""
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"success": True}


# ==================== PRODUCTION ENTRY ENDPOINTS ====================

@api_router.post("/production", response_model=ProductionEntry)
async def create_production(input: ProductionEntryCreate):
    """Create production entry"""
    prod_dict = input.model_dump()
    prod_obj = ProductionEntry(**prod_dict)
    
    doc = prod_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.production_entries.insert_one(doc)
    return prod_obj


@api_router.get("/production", response_model=List[ProductionEntry])
async def get_production():
    """Get all production entries"""
    entries = await db.production_entries.find({}, {"_id": 0}).to_list(10000)
    for entry in entries:
        if isinstance(entry['created_at'], str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    return entries


@api_router.get("/production/{prod_id}", response_model=ProductionEntry)
async def get_production_by_id(prod_id: str):
    """Get production entry by ID"""
    entry = await db.production_entries.find_one({"id": prod_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    if isinstance(entry['created_at'], str):
        entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    return entry


@api_router.put("/production/{prod_id}", response_model=ProductionEntry)
async def update_production(prod_id: str, input: ProductionEntryCreate):
    """Update production entry"""
    update_data = input.model_dump()
    result = await db.production_entries.update_one(
        {"id": prod_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    entry = await db.production_entries.find_one({"id": prod_id}, {"_id": 0})
    if isinstance(entry['created_at'], str):
        entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    return entry


@api_router.delete("/production/{prod_id}")
async def delete_production(prod_id: str):
    """Delete production entry"""
    result = await db.production_entries.delete_one({"id": prod_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"success": True}


# ==================== CUT PRODUCT ENDPOINTS ====================

@api_router.post("/cut-products", response_model=CutProduct)
async def create_cut_product(input: CutProductCreate):
    """Create cut product"""
    cut_dict = input.model_dump()
    cut_obj = CutProduct(**cut_dict)
    
    doc = cut_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.cut_products.insert_one(doc)
    return cut_obj


@api_router.get("/cut-products", response_model=List[CutProduct])
async def get_cut_products():
    """Get all cut products"""
    products = await db.cut_products.find({}, {"_id": 0}).to_list(10000)
    for product in products:
        if isinstance(product['created_at'], str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products


@api_router.put("/cut-products/{cut_id}", response_model=CutProduct)
async def update_cut_product(cut_id: str, input: CutProductCreate):
    """Update cut product"""
    update_data = input.model_dump()
    result = await db.cut_products.update_one(
        {"id": cut_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    product = await db.cut_products.find_one({"id": cut_id}, {"_id": 0})
    if isinstance(product['created_at'], str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product


@api_router.delete("/cut-products/{cut_id}")
async def delete_cut_product(cut_id: str):
    """Delete cut product"""
    result = await db.cut_products.delete_one({"id": cut_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"success": True}


# ==================== SHIPMENT ENDPOINTS ====================

@api_router.post("/shipments", response_model=Shipment)
async def create_shipment(input: ShipmentCreate):
    """Create shipment"""
    shipment_dict = input.model_dump()
    shipment_obj = Shipment(**shipment_dict)
    
    doc = shipment_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.shipments.insert_one(doc)
    return shipment_obj


@api_router.get("/shipments", response_model=List[Shipment])
async def get_shipments():
    """Get all shipments"""
    shipments = await db.shipments.find({}, {"_id": 0}).to_list(10000)
    for shipment in shipments:
        if isinstance(shipment['created_at'], str):
            shipment['created_at'] = datetime.fromisoformat(shipment['created_at'])
    return shipments


@api_router.put("/shipments/{shipment_id}", response_model=Shipment)
async def update_shipment(shipment_id: str, input: ShipmentCreate):
    """Update shipment"""
    update_data = input.model_dump()
    result = await db.shipments.update_one(
        {"id": shipment_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    shipment = await db.shipments.find_one({"id": shipment_id}, {"_id": 0})
    if isinstance(shipment['created_at'], str):
        shipment['created_at'] = datetime.fromisoformat(shipment['created_at'])
    return shipment


@api_router.delete("/shipments/{shipment_id}")
async def delete_shipment(shipment_id: str):
    """Delete shipment"""
    result = await db.shipments.delete_one({"id": shipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"success": True}


# ==================== RAW MATERIAL ENDPOINTS ====================

@api_router.post("/raw-materials", response_model=RawMaterial)
async def create_raw_material(input: RawMaterialCreate):
    """Create raw material"""
    material_dict = input.model_dump()
    material_obj = RawMaterial(**material_dict)
    
    doc = material_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.raw_materials.insert_one(doc)
    return material_obj


@api_router.get("/raw-materials", response_model=List[RawMaterial])
async def get_raw_materials():
    """Get all raw materials"""
    materials = await db.raw_materials.find({}, {"_id": 0}).to_list(10000)
    for material in materials:
        if isinstance(material['created_at'], str):
            material['created_at'] = datetime.fromisoformat(material['created_at'])
    return materials


@api_router.put("/raw-materials/{material_id}", response_model=RawMaterial)
async def update_raw_material(material_id: str, input: RawMaterialCreate):
    """Update raw material"""
    update_data = input.model_dump()
    result = await db.raw_materials.update_one(
        {"id": material_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    material = await db.raw_materials.find_one({"id": material_id}, {"_id": 0})
    if isinstance(material['created_at'], str):
        material['created_at'] = datetime.fromisoformat(material['created_at'])
    return material


@api_router.delete("/raw-materials/{material_id}")
async def delete_raw_material(material_id: str):
    """Delete raw material"""
    result = await db.raw_materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"success": True}


# ==================== GAS ENTRY ENDPOINTS ====================

@api_router.post("/gas-entries", response_model=GasEntry)
async def create_gas_entry(input: GasEntryCreate):
    """Create gas entry"""
    gas_dict = input.model_dump()
    gas_obj = GasEntry(**gas_dict)
    
    doc = gas_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.gas_entries.insert_one(doc)
    return gas_obj


@api_router.get("/gas-entries", response_model=List[GasEntry])
async def get_gas_entries():
    """Get all gas entries"""
    entries = await db.gas_entries.find({}, {"_id": 0}).to_list(10000)
    for entry in entries:
        if isinstance(entry['created_at'], str):
            entry['created_at'] = datetime.fromisoformat(entry['created_at'])
    return entries


@api_router.delete("/gas-entries/{entry_id}")
async def delete_gas_entry(entry_id: str):
    """Delete gas entry"""
    result = await db.gas_entries.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"success": True}


# ==================== EXTRA MATERIAL ENDPOINTS ====================

@api_router.post("/extra-materials", response_model=ExtraMaterial)
async def create_extra_material(input: ExtraMaterialCreate):
    """Create extra material"""
    extra_dict = input.model_dump()
    extra_obj = ExtraMaterial(**extra_dict)
    
    doc = extra_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.extra_materials.insert_one(doc)
    return extra_obj


@api_router.get("/extra-materials", response_model=List[ExtraMaterial])
async def get_extra_materials():
    """Get all extra materials"""
    materials = await db.extra_materials.find({}, {"_id": 0}).to_list(10000)
    for material in materials:
        if isinstance(material['created_at'], str):
            material['created_at'] = datetime.fromisoformat(material['created_at'])
    return materials


@api_router.delete("/extra-materials/{material_id}")
async def delete_extra_material(material_id: str):
    """Delete extra material"""
    result = await db.extra_materials.delete_one({"id": material_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"success": True}


# ==================== EXCHANGE RATE ENDPOINTS ====================

@api_router.post("/exchange-rates", response_model=ExchangeRate)
async def create_exchange_rate(input: ExchangeRateCreate):
    """Create exchange rate"""
    rate_dict = input.model_dump()
    rate_obj = ExchangeRate(**rate_dict)
    
    doc = rate_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.exchange_rates.insert_one(doc)
    return rate_obj


@api_router.get("/exchange-rates", response_model=List[ExchangeRate])
async def get_exchange_rates():
    """Get all exchange rates"""
    rates = await db.exchange_rates.find({}, {"_id": 0}).to_list(10000)
    for rate in rates:
        if isinstance(rate['created_at'], str):
            rate['created_at'] = datetime.fromisoformat(rate['created_at'])
    return rates


@api_router.get("/exchange-rates/latest")
async def get_latest_exchange_rate():
    """Get latest exchange rate"""
    rates = await db.exchange_rates.find({}, {"_id": 0}).sort("created_at", -1).limit(1).to_list(1)
    if not rates:
        return {"usd": 1.0, "eur": 1.0}
    return {"usd": rates[0]["usd"], "eur": rates[0]["eur"]}


# ==================== DASHBOARD/STATISTICS ENDPOINTS ====================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    production_count = await db.production_entries.count_documents({})
    cut_products_count = await db.cut_products.count_documents({})
    shipments_count = await db.shipments.count_documents({})
    raw_materials_count = await db.raw_materials.count_documents({})
    gas_entries_count = await db.gas_entries.count_documents({})
    
    # Calculate raw material stock status
    raw_materials = await db.raw_materials.find({}, {"_id": 0}).to_list(10000)
    production_entries = await db.production_entries.find({}, {"_id": 0}).to_list(10000)
    
    # Group by material name
    material_stock = {}
    for mat in raw_materials:
        name = mat["malzeme_adi"].upper()
        if name not in material_stock:
            material_stock[name] = {"alinan": 0, "kullanilan": 0}
        material_stock[name]["alinan"] += mat["miktar"]
    
    # Calculate used materials from production
    total_gaz_kullanilan = sum(entry.get("gaz_agirligi", 0) for entry in production_entries)
    
    # Simplified calculation (you may need to adjust based on actual formulas)
    if "GAZ" in material_stock:
        material_stock["GAZ"]["kullanilan"] = total_gaz_kullanilan
    
    # Calculate remaining
    for name in material_stock:
        material_stock[name]["kalan"] = material_stock[name]["alinan"] - material_stock[name]["kullanilan"]
    
    return {
        "uretim_kayitlari": production_count,
        "kesilmis_urunler": cut_products_count,
        "sevkiyatlar": shipments_count,
        "hammaddeler": raw_materials_count,
        "gaz_girisleri": gas_entries_count,
        "maliyet_analizleri": 0,
        "hammadde_stok": material_stock
    }


@api_router.get("/production-stock")
async def get_production_stock():
    """Get production stock (with color information)"""
    # Get all production entries
    productions = await db.production_entries.find({}, {"_id": 0}).to_list(10000)
    
    # Get all shipments
    shipments = await db.shipments.find({}, {"_id": 0}).to_list(10000)
    
    # Get all cut products
    cuts = await db.cut_products.find({}, {"_id": 0}).to_list(10000)
    
    # Calculate stock: group by kalinlik, en, boy, renk
    stock_dict = {}
    
    for prod in productions:
        key = f"{prod['kalinlik']}-{prod['en']}-{prod['boy']}-{prod.get('renk', 'Normal')}"
        if key not in stock_dict:
            stock_dict[key] = {
                "kalinlik": prod["kalinlik"],
                "en": prod["en"],
                "boy": prod["boy"],
                "renk": prod.get("renk"),
                "adet": 0,
                "metrekare": 0
            }
        stock_dict[key]["adet"] += prod["adet"]
        stock_dict[key]["metrekare"] += prod["metrekare"]
    
    # Subtract shipments
    for ship in shipments:
        key = f"{ship['kalinlik']}-{ship['en']}-{ship.get('boy', 0)}-{ship.get('renk', 'Normal')}"
        if key in stock_dict:
            stock_dict[key]["adet"] -= ship["adet"]
            stock_dict[key]["metrekare"] -= ship["metrekare"]
    
    # Subtract cuts
    for cut in cuts:
        key = f"{cut['kalinlik']}-{cut['en']}-{cut['boy']}-{cut.get('renk', 'Normal')}"
        if key in stock_dict:
            stock_dict[key]["adet"] -= cut["kullanilan"]
            stock_dict[key]["metrekare"] -= cut["metrekare"]
    
    return list(stock_dict.values())


# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "SAR Ambalaj ERP API", "version": "1.0"}


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

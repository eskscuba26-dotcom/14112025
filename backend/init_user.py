"""Initialize default user for the system"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def init_user():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if user exists
    existing = await db.users.find_one({"username": "mehmet"})
    
    if not existing:
        import uuid
        from datetime import datetime, timezone
        
        user_doc = {
            "id": str(uuid.uuid4()),
            "username": "mehmet",
            "password": "141413DOa.",
            "role": "Yönetici",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.users.insert_one(user_doc)
        print("✅ Default user 'mehmet' created successfully!")
    else:
        print("ℹ️  User 'mehmet' already exists")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_user())

import os
import logging
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "smartstudy")

logger = logging.getLogger("smartstudy.db")

class Database:
    client: MongoClient = None
    db = None

db_instance = Database()

def get_database():
    if db_instance.db is not None:
        return db_instance.db
    
    try:
        logger.info(f"Connecting to MongoDB at {MONGODB_URI}...")
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=3000)
        # Test connection
        client.admin.command('ping')
        db_instance.client = client
        db_instance.db = client[DB_NAME]
        logger.info("Successfully connected to MongoDB!")
        return db_instance.db
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB ({e}). Operating in memory mode.")
        # Create an in-memory dictionary store for collections to guarantee app stability
        class MemoryCollection:
            def __init__(self, name):
                self.name = name
                self.data = []

            def insert_one(self, doc):
                import uuid
                if "_id" not in doc:
                    doc["_id"] = str(uuid.uuid4())
                self.data.append(doc)
                class InsertResult:
                    inserted_id = doc["_id"]
                return InsertResult()

            def find_one(self, filter_dict):
                for doc in self.data:
                    match = True
                    for k, v in filter_dict.items():
                        if doc.get(k) != v:
                            match = False
                            break
                    if match:
                        return doc
                return None

            def find(self, filter_dict=None, sort=None):
                filter_dict = filter_dict or {}
                results = []
                for doc in self.data:
                    match = True
                    for k, v in filter_dict.items():
                        if doc.get(k) != v:
                            match = False
                            break
                    if match:
                        results.append(doc)
                return results

            def update_one(self, filter_dict, update_dict):
                doc = self.find_one(filter_dict)
                if doc:
                    if "$set" in update_dict:
                        doc.update(update_dict["$set"])
                    if "$push" in update_dict:
                        for k, v in update_dict["$push"].items():
                            if k not in doc:
                                doc[k] = []
                            doc[k].append(v)
                return doc

            def delete_one(self, filter_dict):
                doc = self.find_one(filter_dict)
                if doc:
                    self.data.remove(doc)
                return doc

            def count_documents(self, filter_dict=None):
                return len(self.find(filter_dict))

        class MemoryDB:
            def __init__(self):
                self.collections = {}

            def __getitem__(self, item):
                if item not in self.collections:
                    self.collections[item] = MemoryCollection(item)
                return self.collections[item]

        db_instance.db = MemoryDB()
        return db_instance.db

def get_collection(name: str):
    db = get_database()
    return db[name]

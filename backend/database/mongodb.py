import os
import json
import logging
from motor.motor_asyncio import AsyncIOMotorClient

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "pulsereview_ai")

# Fallback file path
FALLBACK_FILE = os.path.join(os.path.dirname(__file__), "mock_db.json")

class MockCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name
        
    def _read_data(self):
        if not os.path.exists(FALLBACK_FILE):
            return {}
        try:
            with open(FALLBACK_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return {}
            
    def _write_data(self, data):
        try:
            with open(FALLBACK_FILE, "w") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error writing fallback db: {e}")

    async def find_one(self, filter_query):
        data = self._read_data()
        col_data = data.get(self.name, [])
        for item in col_data:
            match = True
            for k, v in filter_query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                return item
        return None

    async def insert_one(self, document):
        data = self._read_data()
        if self.name not in data:
            data[self.name] = []
        if "_id" in document:
            document["_id"] = str(document["_id"])
        data[self.name].append(document)
        self._write_data(data)
        
        class InsertResult:
            def __init__(self, inserted_id):
                self.inserted_id = inserted_id
        return InsertResult(document.get("_id", "mock_id"))

    async def update_one(self, filter_query, update, upsert=False):
        data = self._read_data()
        col_data = data.get(self.name, [])
        found = False
        
        set_fields = update.get("$set", {})
        push_fields = update.get("$push", {})
        
        for item in col_data:
            match = True
            for k, v in filter_query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                item.update(set_fields)
                for k, v in push_fields.items():
                    if k not in item:
                        item[k] = []
                    item[k].append(v)
                found = True
                break
                
        if not found and upsert:
            new_item = {**filter_query, **set_fields}
            for k, v in push_fields.items():
                new_item[k] = [v]
            col_data.append(new_item)
            
        data[self.name] = col_data
        self._write_data(data)
        return True

    def find(self, filter_query=None):
        filter_query = filter_query or {}
        data = self._read_data()
        col_data = data.get(self.name, [])
        results = []
        for item in col_data:
            match = True
            for k, v in filter_query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                results.append(item)
        
        class Cursor:
            def __init__(self, items):
                self.items = items
            def sort(self, *args, **kwargs):
                # Simple mock sort (dummy)
                return self
            async def to_list(self, length=None):
                return self.items[:length] if length else self.items
                
        return Cursor(results)

class MockDatabase:
    def __init__(self):
        self.client = None
        
    def __getitem__(self, name):
        return MockCollection(self, name)

# Real or Mock DB
db_instance = None
client_instance = None
is_mock_db = False

def init_db():
    global db_instance, client_instance, is_mock_db
    # Try connecting to motor
    try:
        logger.info(f"Connecting to MongoDB at {MONGODB_URI}...")
        client_instance = AsyncIOMotorClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
        # Check connection status using standard PyMongo method
        db_instance = client_instance[DATABASE_NAME]
        is_mock_db = False
        logger.info("Successfully connected to MongoDB.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB: {e}. Falling back to JSON mock database.")
        db_instance = MockDatabase()
        is_mock_db = True

def get_db():
    global db_instance
    if db_instance is None:
        init_db()
    return db_instance

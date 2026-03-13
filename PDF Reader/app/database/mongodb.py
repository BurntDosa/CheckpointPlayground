from pymongo import MongoClient

client = MongoClient("mongodb://mongodb:27017")
db = client["pdf_db"]
chunks_collection = db["chunks"]

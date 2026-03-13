from qdrant_client import QdrantClient

qdrant = QdrantClient(host="qdrant", port=6333)
COLLECTION = "pdf_chunks"

def init_collection():
    if not qdrant.collection_exists(COLLECTION):
        qdrant.create_collection(
            collection_name=COLLECTION,
            vectors_config={"size": 384, "distance": "Cosine"}
        )

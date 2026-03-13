import uuid
from qdrant_client.models import PointStruct
from qdrant_client.models import SearchRequest

from app.database.mongodb import chunks_collection
from app.database.qdrant import qdrant, COLLECTION
from app.services.embeddings import get_embedding


def index_chunks(pdf_id, page, chunks):
    for chunk in chunks:
        chunk_id = str(uuid.uuid4())
        embedding = get_embedding(chunk)

        chunks_collection.insert_one({
            "_id": chunk_id,
            "pdf_id": pdf_id,
            "page": page,
            "text": chunk
        })

        qdrant.upsert(
            collection_name=COLLECTION,
            points=[
                PointStruct(
                    id=chunk_id,
                    vector=embedding,
                    payload={"pdf_id": pdf_id, "page": page}
                )
            ]
        )


def search_query(query, top_k=5):
    query_embedding = get_embedding(query)

    hits = qdrant.search(
        collection_name=COLLECTION,
        query_vector=query_embedding,
        limit=top_k,
        with_payload=True
    )

    results = []
    for hit in hits:
        chunk = chunks_collection.find_one({"_id": hit.id})

        if not chunk:
            continue
        
        results.append({
            "text": chunk["text"],
            "page": chunk["page"],
            "score": hit.score
        })

    return results

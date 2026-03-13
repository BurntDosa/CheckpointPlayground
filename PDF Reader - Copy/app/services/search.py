import uuid
from qdrant_client.models import PointStruct
from qdrant_client.models import SearchRequest
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.database.mongodb import chunks_collection
from app.database.qdrant import qdrant, COLLECTION
from app.services.embeddings import get_embeddings

import math

def index_chunks(pdf_id, page, chunks):

#Index all chunks from a page in ONE embedding batch

    embeddings = get_embeddings(chunks)

    for chunk, embedding in zip(chunks, embeddings):
        chunk_id = str(uuid.uuid4())

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



def search_query(query, pdf_id, top_k=5, prefetch_k=20):
    query_embedding = get_embeddings(query)[0]

    pdf_filter = Filter(
        must=[
            FieldCondition(
                key="pdf_id",
                match=MatchValue(value=pdf_id)
            )
        ]
    )

    hits = qdrant.search(
        collection_name=COLLECTION,
        query_vector=query_embedding,
        limit=prefetch_k,
        query_filter=pdf_filter
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

    reranked = rerank_results(query, results)
    return reranked[:top_k]



def rerank_results(query: str, results: list[dict]) -> list[dict]:

    query_terms = set(query.lower().split())

    reranked = []

    for r in results:
        text = r["text"].lower()
        words = text.split()

        # Keyword overlap score
        overlap = sum(1 for w in query_terms if w in words)
        keyword_score = overlap / max(len(query_terms), 1)

        # Length penalty (prefer medium-sized chunks)
        length_penalty = 1 / math.log(len(words) + 10)

        # Final score
        final_score = (
            0.7 * r["score"] +
            0.2 * keyword_score +
            0.1 * length_penalty
        )

        r["final_score"] = round(final_score, 4)
        reranked.append(r)

    # Sort by final_score
    reranked.sort(key=lambda x: x["final_score"], reverse=True)

    return reranked

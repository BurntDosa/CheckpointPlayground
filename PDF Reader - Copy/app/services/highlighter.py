from sentence_transformers import util
from app.services.embeddings import get_embeddings
from nltk.tokenize import sent_tokenize
import torch

def extract_highlight_sentences(
    query: str,
    chunks: list[dict],
    top_n: int = 2
):
    #highlights top sentences with confidence levels

    query_embedding = get_embeddings(query)[0]
    highlights = []

    for chunk in chunks:
        sentences = sent_tokenize(chunk["text"])
        if not sentences:
            continue

        sentence_embeddings = get_embeddings(sentences)

        similarities = util.cos_sim(
            query_embedding,
            sentence_embeddings
        )[0]

        #Normalize similarities in 0–1 range
        min_sim = similarities.min()
        max_sim = similarities.max()
        normalized = (similarities - min_sim) / (max_sim - min_sim + 1e-8)

        top_indices = torch.argsort(normalized, descending=True)[:top_n]

        weighted_sentences = [
            {
                "sentence": sentences[i],
                "confidence": round(normalized[i].item(), 3)
            }
            for i in top_indices
        ]

        highlights.append({
            "page": chunk["page"],
            "highlights": weighted_sentences
        })

    return highlights

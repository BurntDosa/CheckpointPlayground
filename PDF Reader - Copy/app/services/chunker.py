import nltk
from nltk.tokenize import sent_tokenize

def chunk_text(
    text: str,
    max_words: int = 900,
    overlap_sentences: int = 3
):
    
#sentence based chunking with overlap

    sentences = sent_tokenize(text)

    chunks = []
    current_chunk = []
    current_word_count = 0

    for sentence in sentences:
        word_count = len(sentence.split())

        # If adding this sentence exceeds limit, finalize chunk
        if current_word_count + word_count > max_words:
            chunks.append(" ".join(current_chunk))

            # Overlap last N sentences
            current_chunk = current_chunk[-overlap_sentences:]
            current_word_count = sum(len(s.split()) for s in current_chunk)

        current_chunk.append(sentence)
        current_word_count += word_count

    # Add last chunk
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

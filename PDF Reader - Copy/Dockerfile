FROM python:3.11-slim

WORKDIR /app

# Install CPU-only torch FIRST
RUN pip install --no-cache-dir torch==2.2.2+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python - <<EOF
import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
EOF

COPY app app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV PORT=8080
EXPOSE 8080

# One worker keeps the startup log readable (the planted error appears once).
CMD ["sh", "-c", "gunicorn --workers 1 --bind 0.0.0.0:${PORT} app:app"]

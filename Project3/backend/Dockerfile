# Builder stage
FROM python:3.12-slim as builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
COPY app ./app
ENV DATA_DIR=/data
ENV OUTPUT_DIR=/output
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

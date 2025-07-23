FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app/
COPY ./data /data/

EXPOSE 5000

CMD ["python", "-u", "/app/app.py"]

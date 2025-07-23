FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install gunicorn

RUN pip install python-dotenv

COPY . .

EXPOSE 4205

ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:4205", "app:app"]

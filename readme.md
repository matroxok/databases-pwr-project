# Databases PWr hotel-app

Get started

```bash
git clone https://github.com/matroxok/hotel-app.git
```

## Backend

```
[ .env dev backend ]

FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/hotel_db
```

- Python
- Django , Django-Ninja

```bash
python -m venv venv
./venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

api: http://localhost:8000/api/docs
```

## Frontend

```
[ .env dev frontend ]

API_URL=http://localhost:8000/api
```

- Next.js
- shadcn
- tailwind
- pnpm
- zod
- zustand

```bash
pnpm / npm install 
pnpm dev / npm run dev

site: http://localhost:3000

```

## Database

```bash
docker compose up -d

database port: 5432
```

- Docker
- Postgresql + pgadmin

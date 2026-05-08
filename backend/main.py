from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, mapping, statements, notes, export

app = FastAPI(title="Financial Statement Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(mapping.router)
app.include_router(statements.router)
app.include_router(notes.router)
app.include_router(export.router)


@app.get("/")
def root():
    return {"status": "ok", "app": "Financial Statement Generator"}

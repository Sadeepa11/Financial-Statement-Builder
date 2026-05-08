from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class AccountMapping(BaseModel):
    account_code: str
    account_name: str
    statement: str        # "balance_sheet" | "income_statement" | "cash_flow" | "equity"
    category: str         # e.g. "Current Assets"
    subcategory: str      # e.g. "Cash and Cash Equivalents"
    sign: int = 1         # 1 = normal, -1 = negate (contra accounts)


class MappingTemplate(BaseModel):
    entity_name: str
    mappings: List[AccountMapping]


class MappingRequest(BaseModel):
    session_id: str
    mappings: List[AccountMapping]


class GenerateRequest(BaseModel):
    session_id: str
    entity_name: str
    period_end: str
    currency: str = "USD"
    comparative_session_id: Optional[str] = None


class NoteContent(BaseModel):
    note_number: int
    title: str
    body: str


class NotesRequest(BaseModel):
    session_id: str
    notes: List[NoteContent]


class ExportRequest(BaseModel):
    session_id: str
    format: str           # "excel" | "pdf" | "word"
    entity_name: str
    period_end: str
    currency: str = "USD"
    include_notes: bool = True

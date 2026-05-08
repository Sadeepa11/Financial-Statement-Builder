from __future__ import annotations

import pandas as pd
import io
import csv as _csv
from typing import Dict, List, Any, Tuple, Optional
from pathlib import Path


COMMON_CODE_HEADERS    = ["account code", "account no", "account number", "code", "gl code",
                          "account id", "acc code", "acct code", "acct no", "acct #", "no"]
COMMON_NAME_HEADERS    = ["account name", "account description", "description", "name",
                          "account", "acc name", "gl name", "account title", "title",
                          "ledger name", "ledger", "particulars"]
COMMON_DEBIT_HEADERS   = ["debit", "dr", "debit amount", "debit balance", "debits"]
COMMON_CREDIT_HEADERS  = ["credit", "cr", "credit amount", "credit balance", "credits"]
COMMON_BALANCE_HEADERS = ["balance", "amount", "net balance", "closing balance",
                          "net amount", "total", "movement", "ending balance",
                          "closing", "net", "bal"]


def _normalize(s: str) -> str:
    return str(s).strip().lower()


def _find_column(headers: List[str], candidates: List[str]) -> Optional[str]:
    # exact match first
    for h in headers:
        if _normalize(h) in candidates:
            return h
    # substring match
    for h in headers:
        nh = _normalize(h)
        for c in candidates:
            if c in nh:
                return h
    return None


# ── CSV helpers ──────────────────────────────────────────────────────────────

def _detect_delimiter(raw: bytes) -> str:
    """Sniff the delimiter from the first 4 KB."""
    sample = raw[:4096].decode("utf-8", errors="replace")
    try:
        dialect = _csv.Sniffer().sniff(sample, delimiters=",;\t|")
        return dialect.delimiter
    except Exception:
        return ","


def _read_csv_robust(raw: bytes) -> pd.DataFrame:
    """Try multiple encodings and delimiters until one works cleanly."""
    delimiter = _detect_delimiter(raw)
    encodings = ["utf-8-sig", "utf-8", "cp1252", "latin-1", "iso-8859-1"]
    last_err: Exception = Exception("unknown")
    for enc in encodings:
        try:
            df = pd.read_csv(
                io.BytesIO(raw),
                header=None,
                sep=delimiter,
                encoding=enc,
                dtype=str,          # keep everything as string to avoid type coercion
                keep_default_na=False,
                skip_blank_lines=True,
            )
            if df.shape[1] >= 2:   # at least 2 columns — looks like real data
                return df
        except Exception as e:
            last_err = e
            continue
    raise ValueError(f"Could not parse CSV file: {last_err}")


# ── Header detection ─────────────────────────────────────────────────────────

_HEADER_KEYWORDS = {"account", "code", "name", "debit", "credit", "balance",
                    "amount", "description", "ledger", "particulars", "no", "dr", "cr"}


def _detect_header_row(df: pd.DataFrame) -> int:
    """Return the index of the row that looks most like a header."""
    best_score, best_row = 0, 0
    for i in range(min(10, len(df))):
        row_vals = [_normalize(str(v)) for v in df.iloc[i].tolist()]
        score = sum(
            any(kw in cell for kw in _HEADER_KEYWORDS)
            for cell in row_vals if cell
        )
        if score > best_score:
            best_score, best_row = score, i
            if score >= 2:          # good enough — stop early
                break
    return best_row


# ── Public entry point ───────────────────────────────────────────────────────

def parse_file(file_bytes: bytes, filename: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    ext = Path(filename).suffix.lower()

    if ext in [".xlsx", ".xls"]:
        df = pd.read_excel(io.BytesIO(file_bytes), header=None, dtype=str)
    elif ext == ".csv":
        df = _read_csv_robust(file_bytes)
    else:
        raise ValueError(f"Unsupported file type '{ext}'. Upload a CSV, XLS, or XLSX file.")

    if df.empty:
        raise ValueError("The file appears to be empty.")

    # Locate and promote the header row
    header_row = _detect_header_row(df)
    df.columns = [str(v).strip() for v in df.iloc[header_row].tolist()]
    df = df.iloc[header_row + 1:].reset_index(drop=True)

    # Drop completely blank rows and columns
    df = df.replace("", None)
    df = df.dropna(how="all").dropna(axis=1, how="all")

    if df.empty:
        raise ValueError("No data rows found after the header row.")

    headers = list(df.columns)
    meta: Dict[str, Any] = {
        "detected_columns": headers,
        "code_col":    _find_column(headers, COMMON_CODE_HEADERS),
        "name_col":    _find_column(headers, COMMON_NAME_HEADERS),
        "debit_col":   _find_column(headers, COMMON_DEBIT_HEADERS),
        "credit_col":  _find_column(headers, COMMON_CREDIT_HEADERS),
        "balance_col": _find_column(headers, COMMON_BALANCE_HEADERS),
        "row_count":   len(df),
    }
    return df, meta


# ── Numeric helper ───────────────────────────────────────────────────────────

def _to_float(val: Any) -> float:
    if val is None or (isinstance(val, str) and val.strip() in ("", "nan", "None", "-")):
        return 0.0
    cleaned = str(val).replace(",", "").replace("$", "").replace("(", "-").replace(")", "").strip()
    try:
        return float(cleaned)
    except (ValueError, TypeError):
        return 0.0


# ── Trial balance ────────────────────────────────────────────────────────────

def extract_trial_balance(df: pd.DataFrame, meta: Dict) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    code_col    = meta.get("code_col")
    name_col    = meta.get("name_col")
    debit_col   = meta.get("debit_col")
    credit_col  = meta.get("credit_col")
    balance_col = meta.get("balance_col")

    # If no name column found, try the first non-numeric column
    if not name_col and df.shape[1] >= 1:
        for col in df.columns:
            sample = df[col].dropna().head(5)
            if sample.apply(lambda v: not str(v).replace(",", "").replace(".", "").replace("-", "").isnumeric()).all():
                name_col = col
                break

    for _, row in df.iterrows():
        account_code = str(row[code_col]).strip() if code_col and row.get(code_col) is not None else ""
        account_name = str(row[name_col]).strip() if name_col and row.get(name_col) is not None else ""

        if not account_name or account_name.lower() in ("nan", "none", ""):
            continue

        # Derive balance
        if balance_col and row.get(balance_col) is not None:
            balance = _to_float(row[balance_col])
        elif debit_col and credit_col:
            dr = _to_float(row.get(debit_col))
            cr = _to_float(row.get(credit_col))
            balance = dr - cr
        else:
            # Last resort: sum all numeric columns
            balance = 0.0
            for col in df.columns:
                if col not in (code_col, name_col):
                    balance += _to_float(row.get(col))

        records.append({
            "account_code": account_code,
            "account_name": account_name,
            "balance": round(balance, 2),
        })
    return records


# ── AR aging ─────────────────────────────────────────────────────────────────

def extract_ar_aging(df: pd.DataFrame, meta: Dict) -> List[Dict[str, Any]]:
    headers     = list(df.columns)
    bucket_cols = [h for h in headers if any(x in _normalize(h) for x in ["current", "30", "60", "90", "120", "over", "aged"])]
    name_col    = meta.get("name_col") or headers[0]
    total_col   = _find_column(headers, COMMON_BALANCE_HEADERS)
    records: List[Dict[str, Any]] = []

    for _, row in df.iterrows():
        customer = str(row.get(name_col, "")).strip()
        if not customer or customer.lower() in ("nan", "none", "total", ""):
            continue
        buckets = {bc: _to_float(row.get(bc)) for bc in bucket_cols}
        total   = _to_float(row.get(total_col)) if total_col else sum(buckets.values())
        records.append({"customer": customer, "buckets": buckets, "total": round(total, 2)})
    return records


# ── AP aging ─────────────────────────────────────────────────────────────────

def extract_ap_aging(df: pd.DataFrame, meta: Dict) -> List[Dict[str, Any]]:
    headers     = list(df.columns)
    bucket_cols = [h for h in headers if any(x in _normalize(h) for x in ["current", "30", "60", "90", "120", "over", "aged"])]
    name_col    = meta.get("name_col") or headers[0]
    total_col   = _find_column(headers, COMMON_BALANCE_HEADERS)
    records: List[Dict[str, Any]] = []

    for _, row in df.iterrows():
        vendor = str(row.get(name_col, "")).strip()
        if not vendor or vendor.lower() in ("nan", "none", "total", ""):
            continue
        buckets = {bc: _to_float(row.get(bc)) for bc in bucket_cols}
        total   = _to_float(row.get(total_col)) if total_col else sum(buckets.values())
        records.append({"vendor": vendor, "buckets": buckets, "total": round(total, 2)})
    return records


# ── Fixed assets ─────────────────────────────────────────────────────────────

def extract_fixed_assets(df: pd.DataFrame, meta: Dict) -> List[Dict[str, Any]]:
    headers  = list(df.columns)
    name_col = (meta.get("name_col")
                or _find_column(headers, ["asset name", "asset description", "description"])
                or headers[0])
    cost_col = _find_column(headers, ["cost", "original cost", "gross cost", "gross value", "historical cost"])
    depr_col = _find_column(headers, ["accumulated depreciation", "acc depr", "accum depr", "depreciation"])
    nbv_col  = _find_column(headers, ["net book value", "nbv", "net value", "carrying value", "written down value"])
    records: List[Dict[str, Any]] = []

    for _, row in df.iterrows():
        asset_name = str(row.get(name_col, "")).strip()
        if not asset_name or asset_name.lower() in ("nan", "none", "total", ""):
            continue
        cost = _to_float(row.get(cost_col))
        depr = _to_float(row.get(depr_col))
        nbv  = _to_float(row.get(nbv_col)) if nbv_col else (cost - depr)
        records.append({"asset_name": asset_name, "cost": cost, "accumulated_depreciation": depr, "net_book_value": nbv})
    return records

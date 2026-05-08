from typing import List, Dict, Any
from models.schemas import AccountMapping
from models.chart_of_accounts import CHART_OF_ACCOUNTS


def generate_statements(
    trial_balance: List[Dict[str, Any]],
    mappings: List[AccountMapping],
    entity_name: str,
    period_end: str,
    currency: str = "USD",
) -> Dict[str, Any]:
    mapping_index = {m.account_code or m.account_name: m for m in mappings}

    buckets: Dict[str, Dict[str, Dict[str, float]]] = {
        "balance_sheet": {},
        "income_statement": {},
        "cash_flow": {},
        "equity": {},
        "unmapped": {"Unmapped": {"Unmapped": 0.0}},
    }

    line_items: Dict[str, List[Dict]] = {
        "balance_sheet": [],
        "income_statement": [],
        "cash_flow": [],
        "equity": [],
        "unmapped": [],
    }

    for entry in trial_balance:
        key = entry.get("account_code") or entry.get("account_name")
        mapping = mapping_index.get(key) or _find_by_name(mapping_index, entry.get("account_name", ""))
        balance = entry.get("balance", 0.0)

        if mapping and mapping.statement != "unmapped":
            stmt = mapping.statement
            cat = mapping.category
            sub = mapping.subcategory
            signed_balance = balance * mapping.sign
        else:
            stmt = "unmapped"
            cat = "Unmapped"
            sub = "Unmapped"
            signed_balance = balance

        if cat not in buckets.get(stmt, {}):
            buckets.setdefault(stmt, {})[cat] = {}
        if sub not in buckets[stmt][cat]:
            buckets[stmt][cat][sub] = 0.0
        buckets[stmt][cat][sub] += signed_balance

        line_items.setdefault(stmt, []).append({
            "account_code": entry.get("account_code", ""),
            "account_name": entry.get("account_name", ""),
            "category": cat,
            "subcategory": sub,
            "balance": round(signed_balance, 2),
        })

    balance_sheet = _build_balance_sheet(buckets.get("balance_sheet", {}))
    income_statement = _build_income_statement(buckets.get("income_statement", {}))
    cash_flow = _build_cash_flow(buckets.get("cash_flow", {}), income_statement)
    equity_statement = _build_equity_statement(buckets.get("equity", {}), income_statement)

    return {
        "entity_name": entity_name,
        "period_end": period_end,
        "currency": currency,
        "balance_sheet": balance_sheet,
        "income_statement": income_statement,
        "cash_flow": cash_flow,
        "equity_statement": equity_statement,
        "unmapped": line_items.get("unmapped", []),
        "line_items": line_items,
    }


def _find_by_name(mapping_index: Dict, name: str):
    return mapping_index.get(name)


def _build_balance_sheet(buckets: Dict) -> Dict:
    sections = {}
    for category, subcats in buckets.items():
        items = [{"label": k, "amount": round(v, 2)} for k, v in subcats.items()]
        total = round(sum(v for v in subcats.values()), 2)
        sections[category] = {"items": items, "total": total}

    total_assets = round(
        sum(sections.get(c, {}).get("total", 0) for c in ["Current Assets", "Non-Current Assets"]),
        2,
    )
    total_current_liab = sections.get("Current Liabilities", {}).get("total", 0)
    total_noncurrent_liab = sections.get("Non-Current Liabilities", {}).get("total", 0)
    total_liabilities = round(total_current_liab + total_noncurrent_liab, 2)
    total_equity = sections.get("Equity", {}).get("total", 0)
    total_liab_equity = round(total_liabilities + total_equity, 2)
    balance_check = round(total_assets - total_liab_equity, 2)

    return {
        "sections": sections,
        "total_assets": total_assets,
        "total_current_liabilities": round(total_current_liab, 2),
        "total_non_current_liabilities": round(total_noncurrent_liab, 2),
        "total_liabilities": total_liabilities,
        "total_equity": round(total_equity, 2),
        "total_liabilities_and_equity": total_liab_equity,
        "balance_check": balance_check,
    }


def _build_income_statement(buckets: Dict) -> Dict:
    sections = {}
    for category, subcats in buckets.items():
        items = [{"label": k, "amount": round(v, 2)} for k, v in subcats.items()]
        total = round(sum(v for v in subcats.values()), 2)
        sections[category] = {"items": items, "total": total}

    revenue = sections.get("Revenue", {}).get("total", 0)
    cogs = sections.get("Cost of Sales", {}).get("total", 0)
    gross_profit = round(revenue - cogs, 2)

    opex = sections.get("Operating Expenses", {}).get("total", 0)
    ebit = round(gross_profit - opex, 2)

    finance_costs = sections.get("Finance Costs", {}).get("total", 0)
    ebt = round(ebit - finance_costs, 2)

    tax = sections.get("Income Tax", {}).get("total", 0)
    net_income = round(ebt - tax, 2)

    other_income_items = sections.get("Revenue", {}).get("items", [])
    other_income = sum(i["amount"] for i in other_income_items if "other" in i["label"].lower())

    return {
        "sections": sections,
        "revenue": round(revenue, 2),
        "cost_of_sales": round(cogs, 2),
        "gross_profit": gross_profit,
        "operating_expenses": round(opex, 2),
        "ebit": ebit,
        "finance_costs": round(finance_costs, 2),
        "ebt": ebt,
        "income_tax": round(tax, 2),
        "net_income": net_income,
    }


def _build_cash_flow(buckets: Dict, income_stmt: Dict) -> Dict:
    sections = {}
    for category, subcats in buckets.items():
        items = [{"label": k, "amount": round(v, 2)} for k, v in subcats.items()]
        total = round(sum(v for v in subcats.values()), 2)
        sections[category] = {"items": items, "total": total}

    # If no cash flow data uploaded, build indirect method shell from P&L
    if not sections:
        net_income = income_stmt.get("net_income", 0)
        sections["Operating Activities"] = {
            "items": [
                {"label": "Net Income", "amount": net_income},
                {"label": "Adjustments (enter manually)", "amount": 0},
            ],
            "total": net_income,
        }
        sections["Investing Activities"] = {"items": [], "total": 0}
        sections["Financing Activities"] = {"items": [], "total": 0}

    operating = sections.get("Operating Activities", {}).get("total", 0)
    investing = sections.get("Investing Activities", {}).get("total", 0)
    financing = sections.get("Financing Activities", {}).get("total", 0)
    net_change = round(operating + investing + financing, 2)

    return {
        "sections": sections,
        "net_cash_operating": round(operating, 2),
        "net_cash_investing": round(investing, 2),
        "net_cash_financing": round(financing, 2),
        "net_change_in_cash": net_change,
    }


def _build_equity_statement(buckets: Dict, income_stmt: Dict) -> Dict:
    net_income = income_stmt.get("net_income", 0)
    sections = {}
    for category, subcats in buckets.items():
        items = [{"label": k, "amount": round(v, 2)} for k, v in subcats.items()]
        total = round(sum(v for v in subcats.values()), 2)
        sections[category] = {"items": items, "total": total}

    changes = sections.get("Changes in Equity", {}).get("items", [])
    opening = next((i["amount"] for i in changes if "opening" in i["label"].lower()), 0)
    dividends = next((i["amount"] for i in changes if "dividend" in i["label"].lower()), 0)
    other = sum(i["amount"] for i in changes if "opening" not in i["label"].lower() and "dividend" not in i["label"].lower() and "net profit" not in i["label"].lower())
    closing = round(opening + net_income - dividends + other, 2)

    return {
        "sections": sections,
        "opening_equity": round(opening, 2),
        "net_income": round(net_income, 2),
        "dividends": round(dividends, 2),
        "other_movements": round(other, 2),
        "closing_equity": closing,
    }

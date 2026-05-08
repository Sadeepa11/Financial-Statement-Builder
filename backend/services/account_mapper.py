from fuzzywuzzy import fuzz
from typing import List, Dict, Any
from models.chart_of_accounts import CHART_OF_ACCOUNTS


def suggest_mappings(accounts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    suggestions = []
    for acc in accounts:
        name = acc.get("account_name", "")
        code = acc.get("account_code", "")
        suggestion = _find_best_match(name, code)
        suggestions.append({
            **acc,
            "suggested_statement": suggestion["statement"],
            "suggested_category": suggestion["category"],
            "suggested_subcategory": suggestion["subcategory"],
            "confidence": suggestion["confidence"],
            "sign": suggestion["sign"],
        })
    return suggestions


def _find_best_match(name: str, code: str) -> Dict:
    best = {"statement": "", "category": "", "subcategory": "", "confidence": 0, "sign": 1}
    search_text = f"{name} {code}".lower()

    for statement, categories in CHART_OF_ACCOUNTS.items():
        for category, subcategories in categories.items():
            for subcategory, keywords in subcategories.items():
                for kw in keywords:
                    # Exact substring match → high confidence
                    if kw in search_text:
                        score = 95
                    else:
                        score = fuzz.partial_ratio(kw, search_text)

                    if score > best["confidence"]:
                        best = {
                            "statement": statement,
                            "category": category,
                            "subcategory": subcategory,
                            "confidence": score,
                            "sign": _default_sign(category, subcategory),
                        }

    # Low confidence → leave unmapped
    if best["confidence"] < 45:
        best = {"statement": "unmapped", "category": "Unmapped", "subcategory": "Unmapped", "confidence": best["confidence"], "sign": 1}

    return best


def _default_sign(category: str, subcategory: str) -> int:
    # Accumulated Depreciation and contra accounts are naturally credit → negate on BS
    if "accumulated depreciation" in subcategory.lower():
        return -1
    return 1


def get_all_categories() -> Dict:
    result = {}
    for statement, categories in CHART_OF_ACCOUNTS.items():
        result[statement] = {}
        for category, subcategories in categories.items():
            result[statement][category] = list(subcategories.keys())
    return result

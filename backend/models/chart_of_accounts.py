CHART_OF_ACCOUNTS = {
    "balance_sheet": {
        "Current Assets": {
            "Cash and Cash Equivalents": ["cash", "bank", "petty cash", "cash at bank", "cash on hand", "money market"],
            "Accounts Receivable": ["accounts receivable", "trade receivable", "debtors", "ar", "trade debtors", "receivable"],
            "Inventory": ["inventory", "stock", "goods", "merchandise", "raw material", "wip", "finished goods", "work in progress"],
            "Prepaid Expenses": ["prepaid", "prepayment", "advance payment", "deposits paid", "advance"],
            "Other Current Assets": ["other current", "short term", "current tax asset", "vat receivable", "gst receivable"],
        },
        "Non-Current Assets": {
            "Property, Plant and Equipment": ["ppe", "property", "plant", "equipment", "machinery", "vehicle", "furniture", "building", "land", "leasehold", "fixture"],
            "Accumulated Depreciation": ["accumulated depreciation", "accumulated amortisation", "accumulated amortization", "depreciation provision"],
            "Intangible Assets": ["intangible", "goodwill", "patent", "trademark", "software", "license", "copyright", "intellectual property"],
            "Investments": ["investment", "equity investment", "associate", "subsidiary", "long term investment"],
            "Deferred Tax Asset": ["deferred tax asset", "dta"],
            "Other Non-Current Assets": ["other non-current", "long term deposit", "long-term prepayment"],
        },
        "Current Liabilities": {
            "Accounts Payable": ["accounts payable", "trade payable", "creditors", "ap", "trade creditors"],
            "Accrued Liabilities": ["accrued", "accrual", "accrued expense", "accrued liabilities"],
            "Short-term Borrowings": ["overdraft", "short term loan", "bank overdraft", "credit facility", "current portion"],
            "Deferred Revenue": ["deferred revenue", "unearned revenue", "advance received", "contract liability"],
            "Tax Payable": ["tax payable", "income tax payable", "vat payable", "gst payable", "sales tax payable"],
            "Other Current Liabilities": ["other current liab", "dividend payable", "wages payable", "payroll"],
        },
        "Non-Current Liabilities": {
            "Long-term Borrowings": ["long term loan", "long-term debt", "mortgage", "bond payable", "debenture", "long term borrowing"],
            "Deferred Tax Liability": ["deferred tax liability", "dtl"],
            "Other Non-Current Liabilities": ["other non-current liab", "provision", "lease liability"],
        },
        "Equity": {
            "Share Capital": ["share capital", "common stock", "ordinary shares", "paid-in capital", "issued capital"],
            "Retained Earnings": ["retained earnings", "retained profit", "accumulated profit", "accumulated deficit"],
            "Other Reserves": ["reserve", "revaluation reserve", "translation reserve", "other comprehensive", "additional paid"],
        },
    },
    "income_statement": {
        "Revenue": {
            "Sales Revenue": ["sales", "revenue", "turnover", "income from operations", "service revenue", "net sales", "gross sales"],
            "Other Income": ["other income", "miscellaneous income", "gain on sale", "interest income", "dividend income", "rental income"],
        },
        "Cost of Sales": {
            "Cost of Goods Sold": ["cost of goods sold", "cogs", "cost of sales", "cost of revenue", "direct cost", "cost of services"],
        },
        "Operating Expenses": {
            "Salaries and Wages": ["salary", "salaries", "wages", "payroll", "staff cost", "employee benefit", "remuneration", "compensation"],
            "Rent and Occupancy": ["rent", "lease expense", "occupancy", "premises"],
            "Depreciation and Amortisation": ["depreciation", "amortisation", "amortization", "d&a"],
            "Marketing and Advertising": ["marketing", "advertising", "promotion", "sales and marketing"],
            "Professional Fees": ["professional fee", "legal", "audit", "consulting", "advisory"],
            "General and Administrative": ["general", "administrative", "admin", "office", "utilities", "insurance", "travel", "telephone", "it expense", "software expense"],
            "Bad Debt Expense": ["bad debt", "doubtful debt", "credit loss", "provision for bad"],
        },
        "Finance Costs": {
            "Interest Expense": ["interest expense", "finance cost", "finance charge", "bank charge", "interest on loan"],
        },
        "Income Tax": {
            "Income Tax Expense": ["income tax", "tax expense", "current tax", "deferred tax expense"],
        },
    },
    "cash_flow": {
        "Operating Activities": {
            "Cash from Operations": ["operating", "cash from operations", "net cash operating"],
        },
        "Investing Activities": {
            "Capital Expenditure": ["capex", "capital expenditure", "purchase of ppe", "purchase of assets"],
            "Proceeds from Asset Sales": ["proceeds from sale", "disposal of assets"],
            "Investments": ["investment acquired", "purchase of investment"],
        },
        "Financing Activities": {
            "Borrowings": ["proceeds from borrowing", "loan proceeds", "new loan"],
            "Repayments": ["repayment", "loan repayment", "debt repayment"],
            "Dividends Paid": ["dividend paid", "dividends"],
            "Equity Raised": ["equity raised", "share issuance", "capital contribution"],
        },
    },
    "equity": {
        "Changes in Equity": {
            "Opening Balance": ["opening balance", "opening equity"],
            "Net Profit": ["net profit", "net income", "profit for the year"],
            "Dividends": ["dividend", "distribution"],
            "Share Issuance": ["share issuance", "new shares"],
            "Other": ["other movement", "other changes"],
        },
    },
}

STATEMENT_LABELS = {
    "balance_sheet": "Balance Sheet",
    "income_statement": "Income Statement",
    "cash_flow": "Cash Flow Statement",
    "equity": "Statement of Changes in Equity",
}

NORMAL_BALANCE = {
    "Current Assets": "debit",
    "Non-Current Assets": "debit",
    "Accumulated Depreciation": "credit",
    "Current Liabilities": "credit",
    "Non-Current Liabilities": "credit",
    "Equity": "credit",
    "Revenue": "credit",
    "Cost of Sales": "debit",
    "Operating Expenses": "debit",
    "Finance Costs": "debit",
    "Income Tax": "debit",
}

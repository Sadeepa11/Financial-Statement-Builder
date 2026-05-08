"""Quick smoke-test — run: python test_parse.py"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))

from services.data_parser import parse_file, extract_trial_balance

SAMPLE = b"""Account Code,Account Name,Debit,Credit
1001,Cash at Bank,125000,
1002,Petty Cash,2500,
1010,Accounts Receivable,380000,
1020,Inventory,95000,
2001,Accounts Payable,,145000
4001,Sales Revenue,,985000
5001,Cost of Goods Sold,620000,
"""

try:
    df, meta = parse_file(SAMPLE, "test.csv")
    records  = extract_trial_balance(df, meta)
    print(f"OK — parsed {len(records)} accounts")
    for r in records[:5]:
        print(f"  {r['account_code']:6} | {r['account_name']:<35} | {r['balance']:>12,.2f}")
except Exception as e:
    print(f"FAIL: {e}")
    import traceback; traceback.print_exc()

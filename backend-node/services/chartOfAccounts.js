const CHART = {
  balance_sheet: {
    'Current Assets': {
      'Cash and Cash Equivalents': ['cash','bank','petty cash','cash at bank','cash on hand','money market','cheque'],
      'Accounts Receivable': ['accounts receivable','trade receivable','debtors','trade debtors','receivable','debtor'],
      'Inventory': ['inventory','stock','goods','merchandise','raw material','wip','finished goods','work in progress'],
      'Prepaid Expenses': ['prepaid','prepayment','advance payment','deposit paid','advance'],
      'Other Current Assets': ['other current','vat receivable','gst receivable','input tax','tax refund'],
    },
    'Non-Current Assets': {
      'Property, Plant and Equipment': ['property','plant','equipment','machinery','vehicle','furniture','building','land','leasehold','fixture','ppe'],
      'Accumulated Depreciation': ['accumulated depreciation','accumulated amortisation','accumulated amortization','depreciation provision'],
      'Intangible Assets': ['intangible','goodwill','patent','trademark','software','license','copyright'],
      'Investments': ['investment','equity investment','associate','subsidiary','long term investment'],
      'Deferred Tax Asset': ['deferred tax asset','dta'],
      'Other Non-Current Assets': ['other non-current','long term deposit'],
    },
    'Current Liabilities': {
      'Accounts Payable': ['accounts payable','trade payable','creditors','trade creditors','payable','creditor'],
      'Accrued Liabilities': ['accrued','accrual','accrued expense','accrued liabilities'],
      'Short-term Borrowings': ['overdraft','short term loan','bank overdraft','current portion','revolving'],
      'Deferred Revenue': ['deferred revenue','unearned revenue','advance received','contract liability'],
      'Tax Payable': ['tax payable','income tax payable','vat payable','gst payable','sales tax payable','paye'],
      'Other Current Liabilities': ['other current liab','dividend payable','wages payable','payroll liab'],
    },
    'Non-Current Liabilities': {
      'Long-term Borrowings': ['long term loan','long-term debt','mortgage','bond payable','debenture','long term borrowing'],
      'Deferred Tax Liability': ['deferred tax liability','dtl'],
      'Other Non-Current Liabilities': ['other non-current liab','provision','lease liability'],
    },
    'Equity': {
      'Share Capital': ['share capital','common stock','ordinary shares','paid-in capital','issued capital'],
      'Retained Earnings': ['retained earnings','retained profit','accumulated profit','accumulated deficit','retained'],
      'Other Reserves': ['reserve','revaluation','translation reserve','other comprehensive','additional paid'],
    },
  },
  income_statement: {
    'Revenue': {
      'Sales Revenue': ['sales','revenue','turnover','service revenue','net sales','gross sales','income from'],
      'Other Income': ['other income','miscellaneous income','gain on sale','interest income','dividend income','rental income'],
    },
    'Cost of Sales': {
      'Cost of Goods Sold': ['cost of goods sold','cogs','cost of sales','cost of revenue','direct cost','cost of services'],
    },
    'Operating Expenses': {
      'Salaries and Wages': ['salary','salaries','wages','payroll','staff cost','employee','remuneration','compensation'],
      'Rent and Occupancy': ['rent','lease expense','occupancy','premises'],
      'Depreciation and Amortisation': ['depreciation','amortisation','amortization','d&a'],
      'Marketing and Advertising': ['marketing','advertising','promotion'],
      'Professional Fees': ['professional fee','legal','audit','consulting','advisory'],
      'General and Administrative': ['general','administrative','admin','office','utilities','insurance','travel','telephone','it expense'],
      'Bad Debt Expense': ['bad debt','doubtful debt','credit loss'],
    },
    'Finance Costs': {
      'Interest Expense': ['interest expense','finance cost','finance charge','bank charge','interest on loan'],
    },
    'Income Tax': {
      'Income Tax Expense': ['income tax','tax expense','current tax'],
    },
  },
  cash_flow: {
    'Operating Activities': { 'Cash from Operations': ['operating','cash from operations'] },
    'Investing Activities': {
      'Capital Expenditure': ['capex','capital expenditure','purchase of ppe','purchase of assets'],
      'Proceeds from Asset Sales': ['proceeds from sale','disposal'],
    },
    'Financing Activities': {
      'Borrowings': ['proceeds from borrowing','loan proceeds','new loan'],
      'Repayments': ['repayment','loan repayment'],
      'Dividends Paid': ['dividend paid','dividends'],
    },
  },
  equity: {
    'Changes in Equity': {
      'Opening Balance': ['opening balance','opening equity'],
      'Net Profit': ['net profit','net income','profit for the year'],
      'Dividends': ['dividend','distribution'],
      'Other': ['other movement','other changes'],
    },
  },
};

module.exports = { CHART };

from typing import Dict, Any, List


def generate_default_notes(
    statements: Dict[str, Any],
    ar_data: List[Dict] = None,
    ap_data: List[Dict] = None,
    fixed_assets: List[Dict] = None,
) -> List[Dict[str, Any]]:
    notes = []
    note_num = 1

    notes.append({
        "note_number": note_num,
        "title": "Basis of Preparation",
        "body": (
            f"These financial statements have been prepared for {statements.get('entity_name', '[Entity Name]')} "
            f"for the period ending {statements.get('period_end', '[Period End]')}. "
            "The financial statements have been prepared on a going concern basis and in accordance with "
            "applicable accounting standards. The historical cost convention has been used unless otherwise stated. "
            "All amounts are presented in " + statements.get('currency', 'USD') + " unless otherwise indicated."
        ),
    })
    note_num += 1

    notes.append({
        "note_number": note_num,
        "title": "Summary of Significant Accounting Policies",
        "body": (
            "<p><strong>Revenue Recognition</strong><br/>"
            "Revenue is recognised when it is probable that economic benefits will flow to the entity and "
            "the amount of revenue can be measured reliably.</p>"
            "<p><strong>Property, Plant and Equipment</strong><br/>"
            "PPE is stated at cost less accumulated depreciation and impairment losses. "
            "Depreciation is charged on a straight-line basis over the estimated useful lives of the assets.</p>"
            "<p><strong>Inventories</strong><br/>"
            "Inventories are measured at the lower of cost and net realisable value. "
            "Cost is determined on a first-in, first-out (FIFO) basis.</p>"
            "<p><strong>Trade Receivables</strong><br/>"
            "Trade receivables are recognised initially at fair value and subsequently measured at amortised cost, "
            "net of provision for expected credit losses.</p>"
            "<p><strong>Trade Payables</strong><br/>"
            "Trade payables are obligations to pay for goods or services that have been acquired in the ordinary "
            "course of business. They are recognised at amortised cost.</p>"
            "<p><strong>Income Tax</strong><br/>"
            "Current and deferred tax is recognised in the income statement except to the extent that it relates "
            "to items recognised directly in equity.</p>"
        ),
    })
    note_num += 1

    # PPE Note
    if fixed_assets:
        total_cost = sum(a.get("cost", 0) for a in fixed_assets)
        total_depr = sum(a.get("accumulated_depreciation", 0) for a in fixed_assets)
        total_nbv = sum(a.get("net_book_value", 0) or (a.get("cost", 0) - a.get("accumulated_depreciation", 0)) for a in fixed_assets)

        rows = "".join(
            f"<tr><td>{a['asset_name']}</td><td>{a.get('cost',0):,.2f}</td>"
            f"<td>({a.get('accumulated_depreciation',0):,.2f})</td>"
            f"<td>{a.get('net_book_value', a.get('cost',0)-a.get('accumulated_depreciation',0)):,.2f}</td></tr>"
            for a in fixed_assets
        )
        body = (
            f"<table><thead><tr><th>Asset</th><th>Cost</th><th>Accum. Depreciation</th><th>Net Book Value</th></tr></thead>"
            f"<tbody>{rows}"
            f"<tr><td><strong>Total</strong></td><td><strong>{total_cost:,.2f}</strong></td>"
            f"<td><strong>({total_depr:,.2f})</strong></td><td><strong>{total_nbv:,.2f}</strong></td></tr>"
            f"</tbody></table>"
        )
        notes.append({"note_number": note_num, "title": "Property, Plant and Equipment", "body": body})
        note_num += 1

    # AR Aging Note
    if ar_data:
        total_ar = sum(a.get("total", 0) for a in ar_data)
        buckets_set = list({k for a in ar_data for k in a.get("buckets", {}).keys()})
        bucket_totals = {b: sum(a.get("buckets", {}).get(b, 0) for a in ar_data) for b in buckets_set}
        bucket_headers = "".join(f"<th>{b}</th>" for b in buckets_set)
        bucket_footer = "".join(f"<td><strong>{bucket_totals[b]:,.2f}</strong></td>" for b in buckets_set)

        rows = "".join(
            f"<tr><td>{a['customer']}</td>"
            + "".join(f"<td>{a.get('buckets',{}).get(b,0):,.2f}</td>" for b in buckets_set)
            + f"<td>{a['total']:,.2f}</td></tr>"
            for a in ar_data[:20]
        )
        body = (
            f"<table><thead><tr><th>Customer</th>{bucket_headers}<th>Total</th></tr></thead>"
            f"<tbody>{rows}<tr><td><strong>Total</strong></td>{bucket_footer}"
            f"<td><strong>{total_ar:,.2f}</strong></td></tr></tbody></table>"
        )
        notes.append({"note_number": note_num, "title": "Trade Receivables Aging Analysis", "body": body})
        note_num += 1

    # AP Aging Note
    if ap_data:
        total_ap = sum(a.get("total", 0) for a in ap_data)
        buckets_set = list({k for a in ap_data for k in a.get("buckets", {}).keys()})
        bucket_totals = {b: sum(a.get("buckets", {}).get(b, 0) for a in ap_data) for b in buckets_set}
        bucket_headers = "".join(f"<th>{b}</th>" for b in buckets_set)
        bucket_footer = "".join(f"<td><strong>{bucket_totals[b]:,.2f}</strong></td>" for b in buckets_set)

        rows = "".join(
            f"<tr><td>{a['vendor']}</td>"
            + "".join(f"<td>{a.get('buckets',{}).get(b,0):,.2f}</td>" for b in buckets_set)
            + f"<td>{a['total']:,.2f}</td></tr>"
            for a in ap_data[:20]
        )
        body = (
            f"<table><thead><tr><th>Vendor</th>{bucket_headers}<th>Total</th></tr></thead>"
            f"<tbody>{rows}<tr><td><strong>Total</strong></td>{bucket_footer}"
            f"<td><strong>{total_ap:,.2f}</strong></td></tr></tbody></table>"
        )
        notes.append({"note_number": note_num, "title": "Trade Payables Aging Analysis", "body": body})
        note_num += 1

    # Related party placeholder
    notes.append({
        "note_number": note_num,
        "title": "Related Party Transactions",
        "body": (
            "[Describe any transactions between the entity and related parties, including directors, shareholders, "
            "or other entities under common control. Include the nature of the relationship, amount of transactions, "
            "and outstanding balances.]"
        ),
    })
    note_num += 1

    # Tax note placeholder
    notes.append({
        "note_number": note_num,
        "title": "Income Tax",
        "body": (
            "The tax expense for the period comprises current and deferred tax. "
            "[Insert applicable tax rate]. "
            "[Describe any deferred tax assets or liabilities, tax loss carryforwards, or unrecognised deferred tax assets.]"
        ),
    })

    return notes

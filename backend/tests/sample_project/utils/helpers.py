def validate_card(card_number: str) -> bool:
    digits = card_number.replace("-", "").replace(" ", "")
    return len(digits) == 16 and digits.isdigit()

def format_currency(amount: float) -> str:
    return f"${amount:,.2f}"

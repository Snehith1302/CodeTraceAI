from utils.helpers import format_currency

def send_receipt(user_id: str, amount: float):
    formatted = format_currency(amount)
    print(f"Sent receipt for {formatted} to {user_id}")

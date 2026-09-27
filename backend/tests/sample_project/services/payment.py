from utils.helpers import validate_card, format_currency

class PaymentProcessor:
    def process_payment(self, user_id: str, amount: float) -> bool:
        formatted = format_currency(amount)
        print(f"Processing payment {formatted} for {user_id}")
        if validate_card("1234-5678-9012-3456"):
            self.record_transaction(user_id, amount)
            return True
        return False

    def record_transaction(self, user_id: str, amount: float):
        print(f"Recorded transaction for {user_id}: {amount}")

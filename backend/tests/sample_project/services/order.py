from services.payment import PaymentProcessor
from services.notification import send_receipt

def checkout_flow(user_id: str, amount: float) -> bool:
    processor = PaymentProcessor()
    success = processor.process_payment(user_id, amount)
    if success:
        send_receipt(user_id, amount)
    return success

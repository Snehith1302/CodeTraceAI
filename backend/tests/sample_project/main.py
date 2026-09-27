from services.order import checkout_flow

def run_main():
    print("Starting order processing...")
    checkout_flow("user_101", 149.99)

if __name__ == "__main__":
    run_main()

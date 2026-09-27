# Intentionally invalid Python file for testing syntax error warnings
def bad_function_syntax(
    x = 10
    # pyrefly: ignore [parse-error]
    print("missing closing paren and colon"
# pyrefly: ignore [parse-error]

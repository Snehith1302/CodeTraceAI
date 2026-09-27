import pytest
from app.parser.ast_walker import parse_file_ast

def test_parse_functions_and_methods():
    code = """
import os

class PaymentProcessor:
    def process(self, amount):
        self.log(amount)

    async def async_refund(self, tx_id):
        pass

def top_level_func():
    p = PaymentProcessor()
    p.process(100)
"""
    result = parse_file_ast("services/payment.py", "services.payment", code)

    assert result.warning is None
    assert len(result.nodes) == 3

    node_ids = {n.id for n in result.nodes}
    assert "services.payment.PaymentProcessor.process" in node_ids
    assert "services.payment.PaymentProcessor.async_refund" in node_ids
    assert "services.payment.top_level_func" in node_ids

    # Check method properties
    process_node = next(n for n in result.nodes if n.name == "process")
    assert process_node.class_name == "PaymentProcessor"
    assert not process_node.is_async

    refund_node = next(n for n in result.nodes if n.name == "async_refund")
    assert refund_node.is_async

def test_parse_calls_enclosing_scope():
    code = """
def caller_func():
    target_func()
"""
    result = parse_file_ast("utils/test.py", "utils.test", code)

    assert len(result.calls) == 1
    call = result.calls[0]
    assert call.caller_id == "utils.test.caller_func"
    assert call.callee_name == "target_func"

def test_syntax_error_graceful_handling():
    code = """
def bad_func(
    print("missing colon"
"""
    result = parse_file_ast("broken.py", "broken", code)

    assert result.warning is not None
    assert "SyntaxError" in result.warning
    assert len(result.nodes) == 0
    assert len(result.calls) == 0

"""
Simple test for GCP ADK Client
"""
import logging
from dotenv import load_dotenv
load_dotenv()  # Load .env file first!

# Enable debug logging to see what's happening
logging.basicConfig(level=logging.DEBUG, format='%(name)s - %(levelname)s - %(message)s')

from integrations.adk_client_gcp import call_adk

# Test query
query = "Is the COVID-19 vaccine safe?"

# Metadata
metadata = {
    "channel": "test",
    "user": {"id": "test-user"}
}

print(f"Query: {query}\n")
print("Calling GCP ADK...\n")

try:
    result = call_adk(query, metadata)
    
    print("=" * 60)
    print("RESULT:")
    print("=" * 60)
    print(f"Verdict: {result['verdict']}")
    print(f"Confidence: {result['confidence']}")
    print(f"\nResponse:\n{result['raw_final']}")
    print("=" * 60)
    
except Exception as e:
    print(f"Error: {e}")

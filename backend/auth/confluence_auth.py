# ai/auth/confluence_auth.py

import os
import base64
from dotenv import load_dotenv

load_dotenv()

def get_confluence_auth_header():
    """
    Returns the headers required to authenticate with Confluence REST API
    using HTTP Basic Auth (email + API token).
    """
    email = os.getenv("CONFLUENCE_EMAIL")
    token = os.getenv("CONFLUENCE_API_TOKEN")

    if not email or not token:
        raise RuntimeError("Confluence credentials not set in environment variables")

    # Create the HTTP Basic Auth header
    auth_str = f"{email}:{token}"
    encoded = base64.b64encode(auth_str.encode()).decode()

    return {
        "Authorization": f"Basic {encoded}",
        "Accept": "application/json"
    }

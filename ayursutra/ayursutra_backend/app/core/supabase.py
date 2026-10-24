from typing import Optional
from .config import settings

_supabase_client = None

def get_supabase_client():
    """
    Returns a singleton Supabase client instance if the SDK is available and configured.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and (settings.SUPABASE_SECRET_KEY or settings.SUPABASE_KEY or settings.SUPABASE_PUBLISHABLE_KEY):
        try:
            from supabase import create_client, Client
            key = settings.SUPABASE_SECRET_KEY or settings.SUPABASE_KEY or settings.SUPABASE_PUBLISHABLE_KEY
            _supabase_client = create_client(settings.SUPABASE_URL, key)
            return _supabase_client
        except ImportError:
            return None
    return None

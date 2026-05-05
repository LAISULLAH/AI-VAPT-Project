"""
Basic test suite for AI VAPT Backend
Tests core functionality and error handling
"""

import asyncio
import pytest
import logging
from datetime import datetime
from unittest.mock import patch, MagicMock, AsyncMock

from core.scan_manager import (
    start_scan, cleanup_expired_scans, cleanup_expired_events,
    SCAN_STORE, EVENT_STORE, SCAN_TIMESTAMPS, EVENT_TIMESTAMPS,
    SCAN_TTL, EVENT_TTL, emit_event
)
from main import is_valid_target, enforce_rate_limit, ACCESS_LOG

logger = logging.getLogger(__name__)


class TestScanInitialization:
    """Test scan initialization and management"""
    
    def test_start_scan(self):
        """Test that scan is properly initialized"""
        target = "example.com"
        scan_id = start_scan(target)
        
        assert scan_id in SCAN_STORE
        assert SCAN_STORE[scan_id]["target"] == target
        assert SCAN_STORE[scan_id]["status"] == "running"
        assert scan_id in SCAN_TIMESTAMPS
        
        # Cleanup
        SCAN_STORE.pop(scan_id, None)
        SCAN_TIMESTAMPS.pop(scan_id, None)
    
    def test_start_scan_creates_timestamp(self):
        """Test that scan timestamp is tracked"""
        scan_id = start_scan("test.com")
        
        assert scan_id in SCAN_TIMESTAMPS
        assert isinstance(SCAN_TIMESTAMPS[scan_id], datetime)
        
        # Cleanup
        SCAN_STORE.pop(scan_id, None)
        SCAN_TIMESTAMPS.pop(scan_id, None)


class TestDataCleanup:
    """Test TTL-based cleanup functionality"""
    
    def test_cleanup_expired_scans(self):
        """Test that expired scans are removed"""
        from datetime import timedelta
        
        scan_id = start_scan("test.com")
        # Artificially age the scan beyond TTL
        SCAN_TIMESTAMPS[scan_id] = datetime.now() - SCAN_TTL - timedelta(hours=1)
        
        # Run cleanup
        cleaned = cleanup_expired_scans()
        
        assert scan_id not in SCAN_STORE
        assert scan_id not in SCAN_TIMESTAMPS
        assert cleaned == 1
    
    def test_cleanup_preserves_recent_scans(self):
        """Test that recent scans are not cleaned up"""
        scan_id = start_scan("test.com")
        
        # Run cleanup (should not remove recent scan)
        cleaned = cleanup_expired_scans()
        
        assert scan_id in SCAN_STORE
        assert cleaned == 0
        
        # Cleanup
        SCAN_STORE.pop(scan_id, None)
        SCAN_TIMESTAMPS.pop(scan_id, None)


class TestValidation:
    """Test input validation"""
    
    def test_valid_domain(self):
        """Test valid domain validation"""
        assert is_valid_target("example.com") == True
        assert is_valid_target("sub.example.co.uk") == True
    
    def test_valid_public_ip(self):
        """Test valid public IP validation"""
        assert is_valid_target("8.8.8.8") == True
        assert is_valid_target("1.1.1.1") == True
    
    def test_invalid_private_ips(self):
        """Test that private IPs are rejected"""
        assert is_valid_target("127.0.0.1") == False
        assert is_valid_target("192.168.1.1") == False
        assert is_valid_target("10.0.0.1") == False
        assert is_valid_target("172.16.0.1") == False
    
    def test_invalid_targets(self):
        """Test invalid target rejection"""
        assert is_valid_target("") == False
        assert is_valid_target("a") == False
        assert is_valid_target(None) == False
        assert is_valid_target("invalid_domain") == False
    
    def test_multicast_rejected(self):
        """Test that multicast addresses are rejected"""
        assert is_valid_target("224.0.0.1") == False


class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limit_below_threshold(self):
        """Test that requests below threshold pass"""
        from fastapi import HTTPException
        
        client_ip = "test-ip-1"
        ACCESS_LOG.pop(client_ip, None)
        
        # Should not raise exception for first few requests
        try:
            for _ in range(5):
                enforce_rate_limit(client_ip)
            success = True
        except HTTPException:
            success = False
        
        assert success == True
        ACCESS_LOG.pop(client_ip, None)
    
    def test_rate_limit_enforced(self):
        """Test that rate limit is enforced"""
        from fastapi import HTTPException
        
        client_ip = "test-ip-2"
        ACCESS_LOG.pop(client_ip, None)
        
        # Fill up to the limit
        for _ in range(8):
            enforce_rate_limit(client_ip)
        
        # Next request should be rate limited
        with pytest.raises(HTTPException) as exc_info:
            enforce_rate_limit(client_ip)
        
        assert exc_info.value.status_code == 429
        ACCESS_LOG.pop(client_ip, None)


class TestEventEmission:
    """Test event emission and tracking"""
    
    @pytest.mark.asyncio
    async def test_emit_event_creates_store(self):
        """Test that emit_event creates event store with timestamp"""
        scan_id = "test-scan-123"
        EVENT_STORE.pop(scan_id, None)
        EVENT_TIMESTAMPS.pop(scan_id, None)
        
        await emit_event(scan_id, "test_event", {"data": "test"})
        
        assert scan_id in EVENT_STORE
        assert scan_id in EVENT_TIMESTAMPS
        assert len(EVENT_STORE[scan_id]) > 0
        
        # Cleanup
        EVENT_STORE.pop(scan_id, None)
        EVENT_TIMESTAMPS.pop(scan_id, None)
    
    @pytest.mark.asyncio
    async def test_emit_event_appends_to_store(self):
        """Test that emit_event appends to existing store"""
        scan_id = "test-scan-456"
        EVENT_STORE.pop(scan_id, None)
        EVENT_TIMESTAMPS.pop(scan_id, None)
        
        await emit_event(scan_id, "event1", None)
        await emit_event(scan_id, "event2", None)
        
        assert len(EVENT_STORE[scan_id]) == 2
        assert EVENT_STORE[scan_id][0]["event"] == "event1"
        assert EVENT_STORE[scan_id][1]["event"] == "event2"
        
        # Cleanup
        EVENT_STORE.pop(scan_id, None)
        EVENT_TIMESTAMPS.pop(scan_id, None)


class TestErrorHandling:
    """Test error handling in core functions"""
    
    def test_invalid_target_types(self):
        """Test that invalid target types are handled"""
        assert is_valid_target(123) == False
        assert is_valid_target([]) == False
        assert is_valid_target({}) == False
    
    def test_cleanup_with_empty_stores(self):
        """Test cleanup functions with empty stores"""
        # Should not raise exceptions
        cleaned_scans = cleanup_expired_scans()
        cleaned_events = cleanup_expired_events()
        
        assert cleaned_scans == 0
        assert cleaned_events == 0


# Fixtures for async tests
@pytest.fixture
def event_loop():
    """Provide event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])

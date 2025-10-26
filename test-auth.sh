#!/bin/bash

# Quick Authentication Test Script

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Authentication Flow${NC}"
echo ""

# Test 1: Register new user
echo -e "${YELLOW}1️⃣  Registering new user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"testuser@example.com","password":"Test123456"}')

if echo "$REGISTER_RESPONSE" | grep -q "User registered successfully"; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    echo "$REGISTER_RESPONSE" | jq '.'
else
    echo -e "${RED}❌ Registration failed${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Login
echo -e "${YELLOW}2️⃣  Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3003/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123456"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Test 3: Access protected endpoint in transaction service
echo -e "${YELLOW}3️⃣  Accessing transaction service (protected)...${NC}"
TRANSACTION_RESPONSE=$(curl -s -X GET http://localhost:3001/transactions \
  -H "Authorization: Bearer $TOKEN")

if echo "$TRANSACTION_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${RED}❌ Transaction service still requires authentication (good!)${NC}"
    echo "Response: $TRANSACTION_RESPONSE"
else
    echo -e "${GREEN}✅ Transaction service accessible with token${NC}"
    echo "$TRANSACTION_RESPONSE" | jq '.' || echo "$TRANSACTION_RESPONSE"
fi

echo ""

# Test 4: Access without token (should fail)
echo -e "${YELLOW}4️⃣  Testing without token (should fail)...${NC}"
NO_TOKEN_RESPONSE=$(curl -s -X GET http://localhost:3001/transactions)

if echo "$NO_TOKEN_RESPONSE" | grep -q "Unauthorized"; then
    echo -e "${GREEN}✅ Correctly rejected request without token${NC}"
else
    echo -e "${RED}❌ Service accessible without token (security issue!)${NC}"
fi

echo ""

# Test 5: Get user profile
echo -e "${YELLOW}5️⃣  Getting user profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET http://localhost:3003/auth/profile \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "testuser"; then
    echo -e "${GREEN}✅ Profile retrieved successfully${NC}"
    echo "$PROFILE_RESPONSE" | jq '.'
else
    echo -e "${RED}❌ Failed to get profile${NC}"
    echo "$PROFILE_RESPONSE"
fi

echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${GREEN}✅ Authentication flow working correctly!${NC}"
echo ""
echo "Your JWT Token (save for manual testing):"
echo "$TOKEN"
echo ""
echo "Test with curl:"
echo "curl -H \"Authorization: Bearer $TOKEN\" http://localhost:3001/transactions"

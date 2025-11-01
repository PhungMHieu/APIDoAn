#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URLs
AUTH_URL="http://localhost:3003"
TRANSACTION_URL="http://localhost:3001"

echo -e "${YELLOW}=== Testing Transaction Service with User Tracking ===${NC}\n"

# Step 1: Register a test user
echo -e "${YELLOW}Step 1: Registering test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@#",
    "username": "testuser"
  }')

echo "Register Response: $REGISTER_RESPONSE"

# Step 2: Login to get JWT token
echo -e "\n${YELLOW}Step 2: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test123!@#"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract access token (auth service returns "access_token" not "accessToken")
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}Failed to get access token. Please check if auth service is running.${NC}"
  exit 1
fi

echo -e "${GREEN}Access Token obtained successfully!${NC}"
echo "Token: ${ACCESS_TOKEN:0:20}..."

# Step 3: Create a transaction
echo -e "\n${YELLOW}Step 3: Creating a transaction...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "${TRANSACTION_URL}/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "amount": 50000,
    "category": "Food",
    "note": "Lunch with friends",
    "dateTime": "2024-11-01T12:00:00Z"
  }')

echo "Create Response: $CREATE_RESPONSE"

# Extract transaction ID
TRANSACTION_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$TRANSACTION_ID" ]; then
  echo -e "${RED}Failed to create transaction${NC}"
  exit 1
fi

echo -e "${GREEN}Transaction created successfully!${NC}"
echo "Transaction ID: $TRANSACTION_ID"

# Step 4: Get my transactions with full details
echo -e "\n${YELLOW}Step 4: Getting my transactions with full details...${NC}"
MY_TRANSACTIONS=$(curl -s -X GET "${TRANSACTION_URL}/transactions/my" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "My Transactions: $MY_TRANSACTIONS"

# Step 4.5: Get my transaction IDs only
echo -e "\n${YELLOW}Step 4.5: Getting my transaction IDs only...${NC}"
MY_IDS_RESPONSE=$(curl -s -X GET "${TRANSACTION_URL}/transactions/my/ids" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "My Transaction IDs: $MY_IDS_RESPONSE"

# Step 5: Update the transaction
echo -e "\n${YELLOW}Step 5: Updating the transaction...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "${TRANSACTION_URL}/transactions/${TRANSACTION_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -d '{
    "amount": 75000,
    "note": "Lunch with friends (updated)"
  }')

echo "Update Response: $UPDATE_RESPONSE"

# Step 6: Try to access transaction details
echo -e "\n${YELLOW}Step 6: Getting transaction details...${NC}"
GET_RESPONSE=$(curl -s -X GET "${TRANSACTION_URL}/transactions/${TRANSACTION_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Transaction Details: $GET_RESPONSE"

# Step 7: Get all transactions
echo -e "\n${YELLOW}Step 7: Getting all transactions...${NC}"
ALL_RESPONSE=$(curl -s -X GET "${TRANSACTION_URL}/transactions" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "All Transactions: $ALL_RESPONSE"

# Step 8: Test with another user (should fail to update/delete)
echo -e "\n${YELLOW}Step 8: Testing permission with another user...${NC}"
echo "Registering second user..."
REGISTER2_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "password": "Test123!@#",
    "username": "testuser2"
  }')

echo "Login as second user..."
LOGIN2_RESPONSE=$(curl -s -X POST "${AUTH_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "password": "Test123!@#"
  }')

ACCESS_TOKEN2=$(echo $LOGIN2_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Try to update first user's transaction (should fail)..."
FAIL_UPDATE=$(curl -s -X PUT "${TRANSACTION_URL}/transactions/${TRANSACTION_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ACCESS_TOKEN2}" \
  -d '{
    "amount": 100000
  }')

echo "Expected Failure Response: $FAIL_UPDATE"

# Step 9: Delete the transaction (with correct user)
echo -e "\n${YELLOW}Step 9: Deleting the transaction...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "${TRANSACTION_URL}/transactions/${TRANSACTION_ID}" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

echo "Delete Response: $DELETE_RESPONSE"

echo -e "\n${GREEN}=== All tests completed ===${NC}"

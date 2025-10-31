#!/bin/bash

# Test Swagger Bearer Auth Configuration
# This script verifies that all services have Bearer Auth button in Swagger UI

echo "🔐 Testing Swagger Bearer Auth Configuration"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_bearer_auth() {
    local service_name=$1
    local port=$2
    local url="http://localhost:${port}/api-json"
    
    echo -n "📋 Checking ${service_name} (port ${port})... "
    
    # Check if service is running
    if ! curl -s -f "${url}" > /dev/null 2>&1; then
        echo -e "${RED}❌ Service not reachable${NC}"
        return 1
    fi
    
    # Check for Bearer Auth in Swagger spec
    local has_bearer=$(curl -s "${url}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    schemes = data.get('components', {}).get('securitySchemes', {})
    if 'JWT-auth' in schemes:
        scheme = schemes['JWT-auth']
        if scheme.get('type') == 'http' and scheme.get('scheme') == 'bearer':
            print('true')
        else:
            print('false')
    else:
        print('false')
except:
    print('false')
" 2>/dev/null)
    
    if [ "$has_bearer" == "true" ]; then
        echo -e "${GREEN}✅ Bearer Auth configured${NC}"
        return 0
    else
        echo -e "${RED}❌ Bearer Auth NOT configured${NC}"
        return 1
    fi
}

# Test all services
echo "Testing microservices..."
echo ""

check_bearer_auth "Auth Service      " 3003
auth_result=$?

check_bearer_auth "Transaction Service" 3001
trans_result=$?

check_bearer_auth "Account Service   " 3002
account_result=$?

check_bearer_auth "API Gateway       " 3000
gateway_result=$?

echo ""
echo "=============================================="

# Summary
total=4
passed=$((4 - auth_result - trans_result - account_result - gateway_result))

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ All services ($passed/$total) have Bearer Auth configured!${NC}"
    echo ""
    echo "📚 You can now:"
    echo "  1. Open Swagger UI for any service"
    echo "  2. Click 'Authorize' button (🔓 lock icon)"
    echo "  3. Paste your JWT token"
    echo "  4. Test protected endpoints"
    echo ""
    echo "Services:"
    echo "  • Auth:        http://localhost:3003/api"
    echo "  • Transaction: http://localhost:3001/api"
    echo "  • Account:     http://localhost:3002/api"
    echo "  • Gateway:     http://localhost:3000/api"
    exit 0
else
    echo -e "${RED}❌ $((total - passed))/$total services missing Bearer Auth${NC}"
    echo ""
    echo "Fix required in main.ts files:"
    echo "  Add .addBearerAuth({...}, 'JWT-auth') to DocumentBuilder"
    exit 1
fi

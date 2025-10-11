#!/bin/bash

# Tạo database PostgreSQL cho ứng dụng My Finance

echo "Đang tạo database my_finance_db..."

# Kết nối đến PostgreSQL và tạo database
psql -U postgres -c "CREATE DATABASE my_finance_db;"

echo "Database my_finance_db đã được tạo thành công!"
echo "Cấu hình kết nối trong file .env:"
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
echo "DB_USERNAME=postgres"
echo "DB_PASSWORD=kakachiz"
echo "DB_NAME=my_finance_db"
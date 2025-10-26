# 🍎 Native macOS Database Setup Guide

## 📋 Cài đặt Databases trên macOS

### 1. PostgreSQL
```bash
# Cài qua Homebrew
brew install postgresql@15
brew services start postgresql@15

# Hoặc cài PostgreSQL.app
# Download từ: https://postgresapp.com/

# Tạo database và user
psql postgres
CREATE DATABASE transaction_db;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE transaction_db TO postgres;
\q
```

### 2. MongoDB
```bash
# Cài qua Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Tạo admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "admin123",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Tạo database
use account_db
db.createCollection("accounts")
exit
```

### 3. MySQL
```bash
# Cài qua Homebrew
brew install mysql@8.0
brew services start mysql@8.0

# Hoặc cài MySQL từ Oracle
# Download từ: https://dev.mysql.com/downloads/mysql/

# Setup database và user
mysql -u root -p
CREATE DATABASE gateway_db;
CREATE USER 'mysql_user'@'localhost' IDENTIFIED BY 'mysql123';
GRANT ALL PRIVILEGES ON gateway_db.* TO 'mysql_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 🔧 Kiểm tra Services

### Check running services
```bash
# PostgreSQL
brew services list | grep postgresql
# Hoặc: ps aux | grep postgres

# MongoDB  
brew services list | grep mongodb
# Hoặc: ps aux | grep mongod

# MySQL
brew services list | grep mysql
# Hoặc: ps aux | grep mysqld
```

### Test Connections
```bash
# PostgreSQL
psql -h localhost -p 5432 -U postgres -d transaction_db

# MongoDB
mongosh "mongodb://admin:admin123@localhost:27017/account_db"

# MySQL
mysql -h localhost -P 3306 -u mysql_user -p gateway_db
```

## 🚀 Start/Stop Services

### Start All
```bash
brew services start postgresql@15
brew services start mongodb-community@7.0
brew services start mysql@8.0
```

### Stop All
```bash
brew services stop postgresql@15
brew services stop mongodb-community@7.0
brew services stop mysql@8.0
```

### Auto-start on Boot
```bash
# Enable auto-start
brew services start postgresql@15  # Tự động start
brew services start mongodb-community@7.0
brew services start mysql@8.0

# Disable auto-start  
brew services stop postgresql@15   # Chỉ stop, không auto-start
```

## 🎯 Default Ports & Paths

| Database | Port | Config File | Data Directory |
|----------|------|-------------|----------------|
| PostgreSQL | 5432 | `/usr/local/var/postgres/postgresql.conf` | `/usr/local/var/postgres/` |
| MongoDB | 27017 | `/usr/local/etc/mongod.conf` | `/usr/local/var/mongodb/` |
| MySQL | 3306 | `/usr/local/etc/my.cnf` | `/usr/local/var/mysql/` |

## 🔍 Troubleshooting

### Port Conflicts
```bash
# Check what's using default ports
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB  
lsof -i :3306  # MySQL

# Kill conflicting processes
sudo lsof -t -i:5432 | xargs kill -9
```

### Service Won't Start
```bash
# Check logs
tail -f /usr/local/var/log/postgres.log     # PostgreSQL
tail -f /usr/local/var/log/mongodb/mongo.log # MongoDB
tail -f /usr/local/var/mysql/*.err          # MySQL

# Restart services
brew services restart postgresql@15
brew services restart mongodb-community@7.0
brew services restart mysql@8.0
```

### Permission Issues
```bash
# Fix PostgreSQL permissions
sudo chown -R $(whoami) /usr/local/var/postgres/

# Fix MongoDB permissions  
sudo chown -R $(whoami) /usr/local/var/mongodb/

# Fix MySQL permissions
sudo chown -R $(whoami) /usr/local/var/mysql/
```

## 📱 GUI Management Tools

### PostgreSQL
```bash
# pgAdmin 4
brew install --cask pgadmin4
# Hoặc: https://www.pgadmin.org/download/

# Postico (macOS native)
# Download từ: https://eggerapps.at/postico/
```

### MongoDB
```bash
# MongoDB Compass
brew install --cask mongodb-compass
# Hoặc: https://www.mongodb.com/products/compass

# Connection string: mongodb://admin:admin123@localhost:27017/account_db
```

### MySQL
```bash
# Sequel Pro (free, macOS native)
brew install --cask sequel-pro

# MySQL Workbench
brew install --cask mysqlworkbench

# TablePlus (paid, excellent UI)
brew install --cask tableplus
```

---
*Native macOS database setup complete! 🚀*
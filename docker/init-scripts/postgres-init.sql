-- Initialize PostgreSQL database for Transaction Service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table (matching TransactionEntity)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    note TEXT,
    "dateTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, "dateTime");
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_dateTime ON transactions("dateTime");
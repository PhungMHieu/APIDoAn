-- Initialize PostgreSQL database for Transaction Service
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table first (required for foreign key)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_createdAt ON transactions("createdAt");
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_userId ON transactions("userId");

-- Insert sample users first
INSERT INTO users (id, name, email, password) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'John Doe', 'john@example.com', '$2b$10$hash1'),
('550e8400-e29b-41d4-a716-446655440001', 'Jane Smith', 'jane@example.com', '$2b$10$hash2')
ON CONFLICT (email) DO NOTHING;

-- Insert sample data
INSERT INTO transactions (title, amount, category, type, description, "userId") VALUES
('Monthly Salary', 1500.00, 'Salary', 'income', 'Monthly salary payment', '550e8400-e29b-41d4-a716-446655440000'),
('Lunch', 50.00, 'Food', 'expense', 'Lunch at restaurant', '550e8400-e29b-41d4-a716-446655440000'),
('Bus Pass', 200.00, 'Transport', 'expense', 'Monthly bus pass', '550e8400-e29b-41d4-a716-446655440000'),
('Movie Tickets', 100.00, 'Entertainment', 'expense', 'Cinema tickets', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;
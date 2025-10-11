-- Initialize MySQL database for API Gateway
USE gateway_db;

-- Create gateway logs table
CREATE TABLE IF NOT EXISTS gateway_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    method VARCHAR(10) NOT NULL,
    url VARCHAR(500) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    user_agent TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create API keys table for authentication
CREATE TABLE IF NOT EXISTS api_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL
);

-- Create indexes
CREATE INDEX idx_gateway_logs_created_at ON gateway_logs(created_at);
CREATE INDEX idx_gateway_logs_status_code ON gateway_logs(status_code);
CREATE INDEX idx_api_keys_api_key ON api_keys(api_key);

-- Insert sample API keys
INSERT INTO api_keys (key_name, api_key, is_active) VALUES
('Development Key', 'dev-api-key-12345', TRUE),
('Production Key', 'prod-api-key-67890', TRUE),
('Test Key', 'test-api-key-abcde', TRUE)
ON DUPLICATE KEY UPDATE key_name = VALUES(key_name);

-- Insert sample logs
INSERT INTO gateway_logs (request_id, method, url, status_code, response_time_ms, user_agent, ip_address) VALUES
(UUID(), 'GET', '/api/transactions', 200, 150, 'Mozilla/5.0', '127.0.0.1'),
(UUID(), 'POST', '/api/transactions', 201, 200, 'Mozilla/5.0', '127.0.0.1'),
(UUID(), 'GET', '/api/accounts', 200, 120, 'Mozilla/5.0', '127.0.0.1');
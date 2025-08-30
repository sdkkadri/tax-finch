-- Database initialization script
-- Sets timezone to UTC and performs basic setup

-- Set timezone to UTC
SET timezone = 'UTC';

-- Create extension if not exists (useful for UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set default timezone for the session
ALTER DATABASE postgres SET timezone TO 'UTC';

-- Set timezone for all new connections
ALTER SYSTEM SET timezone TO 'UTC';

-- Reload configuration
SELECT pg_reload_conf();

-- Insert default order statuses
INSERT INTO order_statuses (id, name, description, is_active) VALUES
(1, 'Pending', 'Order has been placed but not yet processed', true),
(2, 'Processing', 'Order is being prepared and processed', true),
(3, 'Shipped', 'Order has been shipped to the customer', true),
(4, 'Delivered', 'Order has been successfully delivered', true),
(5, 'Cancelled', 'Order has been cancelled', false),
(6, 'Refunded', 'Order has been refunded', false),
(7, 'Completed', 'Order has been completed', true)
ON CONFLICT (id) DO NOTHING;


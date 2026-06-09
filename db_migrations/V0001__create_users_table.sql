CREATE TABLE t_p48470894_whatsapp_alternative.users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 20),
  phone VARCHAR(20) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
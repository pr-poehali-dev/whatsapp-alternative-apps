CREATE TABLE t_p48470894_whatsapp_alternative.orders (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  address TEXT,
  workers_count INTEGER NOT NULL DEFAULT 1,
  work_date VARCHAR(50) NOT NULL,
  work_time VARCHAR(50),
  description TEXT NOT NULL,
  rate INTEGER NOT NULL,
  min_hours INTEGER NOT NULL DEFAULT 2,
  contact_name VARCHAR(150),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p48470894_whatsapp_alternative.responses (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES t_p48470894_whatsapp_alternative.orders(id),
  user_id INTEGER NOT NULL REFERENCES t_p48470894_whatsapp_alternative.users(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(order_id, user_id)
);
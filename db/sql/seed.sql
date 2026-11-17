-- Sample data (password_hash values are placeholders; replace with real bcrypt hashes)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
  ('Admin User',  'admin@park.com',   '9000000001', 'placeholder_hash', 'admin'),
  ('Ravi Kumar',  'ravi@example.com', '9000000002', 'placeholder_hash', 'driver'),
  ('Anita Rao',   'anita@example.com','9000000003', 'placeholder_hash', 'driver'),
  ('Gate Staff',  'staff@park.com',   '9000000004', 'placeholder_hash', 'attendant')
ON CONFLICT (email) DO NOTHING;

INSERT INTO vehicles (user_id, plate_number, type, make, model)
SELECT u.id, v.plate, v.type, v.make, v.model
FROM (VALUES
  ('ravi@example.com',  'KA01AB1234', 'car',  'Honda',  'City'),
  ('ravi@example.com',  'KA01CD5678', 'bike', 'Yamaha', 'R15'),
  ('anita@example.com', 'KA05EF9012', 'ev',   'Tata',   'Nexon EV')
) AS v(email, plate, type, make, model)
JOIN users u ON u.email = v.email
ON CONFLICT (plate_number) DO NOTHING;

INSERT INTO parking_lots (name, address, city, hourly_rate)
SELECT * FROM (VALUES
  ('MG Road Lot',     '12 MG Road',    'Bengaluru', 40.00),
  ('Indiranagar Lot', '100 Feet Road', 'Bengaluru', 30.00)
) AS l(name, address, city, hourly_rate)
WHERE NOT EXISTS (SELECT 1 FROM parking_lots);

-- 10 slots per lot: A1..A10
INSERT INTO parking_slots (lot_id, slot_number, slot_type)
SELECT l.id, 'A' || n,
  CASE WHEN n = 1 THEN 'disabled'
       WHEN n IN (2,3) THEN 'ev'
       WHEN n BETWEEN 4 AND 5 THEN 'compact'
       ELSE 'regular' END
FROM parking_lots l, generate_series(1, 10) AS n
ON CONFLICT (lot_id, slot_number) DO NOTHING;

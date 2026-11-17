-- Parking Management Schema

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  phone         VARCHAR(20),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'driver'
                CHECK (role IN ('driver', 'attendant', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id           SERIAL PRIMARY KEY,
  user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plate_number VARCHAR(20) UNIQUE NOT NULL,
  type         VARCHAR(20) NOT NULL DEFAULT 'car'
               CHECK (type IN ('bike', 'car', 'suv', 'ev')),
  make         VARCHAR(50),
  model        VARCHAR(50),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_lots (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  address     TEXT NOT NULL,
  city        VARCHAR(80) NOT NULL,
  hourly_rate NUMERIC(8,2) NOT NULL CHECK (hourly_rate >= 0),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_slots (
  id          SERIAL PRIMARY KEY,
  lot_id      INT NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
  slot_number VARCHAR(10) NOT NULL,
  slot_type   VARCHAR(20) NOT NULL DEFAULT 'regular'
              CHECK (slot_type IN ('regular', 'compact', 'ev', 'disabled')),
  status      VARCHAR(20) NOT NULL DEFAULT 'available'
              CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  UNIQUE (lot_id, slot_number)
);

CREATE TABLE IF NOT EXISTS reservations (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  slot_id    INT NOT NULL REFERENCES parking_slots(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time   TIMESTAMPTZ NOT NULL,
  status     VARCHAR(20) NOT NULL DEFAULT 'confirmed'
             CHECK (status IN ('confirmed', 'cancelled', 'completed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS parking_sessions (
  id         SERIAL PRIMARY KEY,
  vehicle_id INT NOT NULL REFERENCES vehicles(id),
  slot_id    INT NOT NULL REFERENCES parking_slots(id),
  entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_time  TIMESTAMPTZ,
  amount     NUMERIC(10,2),
  status     VARCHAR(20) NOT NULL DEFAULT 'active'
             CHECK (status IN ('active', 'completed'))
);

CREATE TABLE IF NOT EXISTS payments (
  id         SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES parking_sessions(id) ON DELETE CASCADE,
  amount     NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  method     VARCHAR(20) CHECK (method IN ('cash', 'card', 'upi', 'wallet')),
  status     VARCHAR(20) NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One active session per vehicle / per slot
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_session_vehicle
  ON parking_sessions(vehicle_id) WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_session_slot
  ON parking_sessions(slot_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_vehicles_user      ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_slots_lot_status   ON parking_slots(lot_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_slot  ON reservations(slot_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_payments_session   ON payments(session_id);

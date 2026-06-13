-- ─────────────────────────────────────────────────────────────────────────────
--  RIFA 2026 — Esquema inicial
--  Ejecuta esto en el SQL Editor de Supabase (o via CLI).
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tabla: raffle_numbers ────────────────────────────────────────────────────
CREATE TABLE raffle_numbers (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  number     INTEGER     NOT NULL UNIQUE CHECK (number >= 1 AND number <= 200),
  status     TEXT        NOT NULL DEFAULT 'available'
                         CHECK (status IN ('available', 'reserved', 'sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabla: buyers ────────────────────────────────────────────────────────────
CREATE TABLE buyers (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name  TEXT        NOT NULL,
  phone      TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  comments   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabla: reservations ──────────────────────────────────────────────────────
CREATE TABLE reservations (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id       UUID        NOT NULL REFERENCES buyers(id),
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','pending_cash','confirmed','rejected','expired')),
  payment_method TEXT        NOT NULL CHECK (payment_method IN ('transfer','cash')),
  total_amount   INTEGER     NOT NULL,
  expires_at     TIMESTAMPTZ NOT NULL,
  confirmed_at   TIMESTAMPTZ,
  rejected_at    TIMESTAMPTZ,
  admin_notes    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Tabla: reservation_numbers ───────────────────────────────────────────────
CREATE TABLE reservation_numbers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  number_id      UUID NOT NULL REFERENCES raffle_numbers(id),
  UNIQUE (reservation_id, number_id)
);

-- ─── Tabla: notification_log ──────────────────────────────────────────────────
CREATE TABLE notification_log (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  type           TEXT        NOT NULL,
  reservation_id UUID        REFERENCES reservations(id),
  success        BOOLEAN     NOT NULL DEFAULT TRUE,
  error_message  TEXT,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Índices ──────────────────────────────────────────────────────────────────
CREATE INDEX idx_raffle_numbers_status       ON raffle_numbers(status);
CREATE INDEX idx_reservations_status         ON reservations(status);
CREATE INDEX idx_reservations_expires_at     ON reservations(expires_at);
CREATE INDEX idx_reservations_buyer_id       ON reservations(buyer_id);
CREATE INDEX idx_res_numbers_reservation_id  ON reservation_numbers(reservation_id);
CREATE INDEX idx_res_numbers_number_id       ON reservation_numbers(number_id);

-- ─── Trigger updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER raffle_numbers_updated_at
  BEFORE UPDATE ON raffle_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Función atómica para crear reserva (evita race conditions) ───────────────
CREATE OR REPLACE FUNCTION create_reservation(
  p_buyer_name     TEXT,
  p_buyer_phone    TEXT,
  p_buyer_email    TEXT,
  p_buyer_comments TEXT,
  p_payment_method TEXT,
  p_numbers        INTEGER[],
  p_price_per_num  INTEGER,
  p_reserve_mins   INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_buyer_id       UUID;
  v_reservation_id UUID;
  v_expires_at     TIMESTAMPTZ;
  v_total_amount   INTEGER;
  v_number_id      UUID;
  v_num            INTEGER;
  v_status         TEXT;
  v_res_status     TEXT;
BEGIN
  -- Validar que haya al menos un número
  IF array_length(p_numbers, 1) IS NULL THEN
    RAISE EXCEPTION 'Debes seleccionar al menos un número';
  END IF;

  -- Bloquear y validar cada número (FOR UPDATE evita race conditions)
  FOREACH v_num IN ARRAY p_numbers LOOP
    SELECT status INTO v_status
    FROM raffle_numbers
    WHERE number = v_num
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'El número % no existe', v_num;
    END IF;

    IF v_status <> 'available' THEN
      RAISE EXCEPTION 'El número % ya no está disponible', v_num;
    END IF;
  END LOOP;

  -- Calcular monto y expiración
  v_total_amount := array_length(p_numbers, 1) * p_price_per_num;
  v_expires_at   := NOW() + (p_reserve_mins || ' minutes')::INTERVAL;

  -- Estado según método de pago
  v_res_status := CASE
    WHEN p_payment_method = 'cash' THEN 'pending_cash'
    ELSE 'pending'
  END;

  -- Crear comprador
  INSERT INTO buyers (full_name, phone, email, comments)
  VALUES (p_buyer_name, p_buyer_phone, p_buyer_email, NULLIF(p_buyer_comments, ''))
  RETURNING id INTO v_buyer_id;

  -- Crear reserva
  INSERT INTO reservations (buyer_id, status, payment_method, total_amount, expires_at)
  VALUES (v_buyer_id, v_res_status, p_payment_method, v_total_amount, v_expires_at)
  RETURNING id INTO v_reservation_id;

  -- Asociar números y marcarlos como reservados
  FOREACH v_num IN ARRAY p_numbers LOOP
    SELECT id INTO v_number_id FROM raffle_numbers WHERE number = v_num;

    INSERT INTO reservation_numbers (reservation_id, number_id)
    VALUES (v_reservation_id, v_number_id);

    UPDATE raffle_numbers SET status = 'reserved' WHERE id = v_number_id;
  END LOOP;

  RETURN json_build_object(
    'reservation_id', v_reservation_id,
    'buyer_id',       v_buyer_id,
    'expires_at',     v_expires_at,
    'total_amount',   v_total_amount,
    'status',         v_res_status
  );
END;
$$;

-- ─── Insertar 200 números disponibles ────────────────────────────────────────
INSERT INTO raffle_numbers (number, status)
SELECT generate_series(1, 200), 'available'
ON CONFLICT DO NOTHING;

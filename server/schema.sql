CREATE TABLE IF NOT EXISTS products (
 id text PRIMARY KEY, name text NOT NULL, category text NOT NULL, price integer NOT NULL CHECK(price > 0),
 description text NOT NULL, color text NOT NULL, tag text NOT NULL DEFAULT '', available boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS admins (id uuid PRIMARY KEY, email text UNIQUE NOT NULL, password_hash text NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token_hash text PRIMARY KEY, admin_id uuid NOT NULL REFERENCES admins(id), expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS orders (
 id uuid PRIMARY KEY, request_id uuid UNIQUE NOT NULL, payload_hash text NOT NULL, customer_name text NOT NULL,
 phone text NOT NULL, method text NOT NULL CHECK(method IN ('pickup','delivery')), address text NOT NULL, note text NOT NULL,
 items jsonb NOT NULL, subtotal integer NOT NULL CHECK(subtotal >= 0), delivery_fee integer NOT NULL CHECK(delivery_fee >= 0),
 total integer NOT NULL CHECK(total = subtotal + delivery_fee), status text NOT NULL DEFAULT 'new'
 CHECK(status IN ('new','confirmed','preparing','ready','delivering','completed','cancelled')), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);

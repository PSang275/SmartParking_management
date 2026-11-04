-- =============================================================================
-- SMARTPARK WEB (C++ VISUAL STUDIO 2026 & SUPABASE CLOUD)
-- Database Migration: Initial Schema & Seed Data
-- Supabase Project ID: jgvegymigpbgqmoylljf
-- Project URL: https://jgvegymigpbgqmoylljf.supabase.co
-- =============================================================================

-- 1. Create tables for SmartPark System
create table if not exists public.app_users (
    id bigint generated always as identity primary key,
    username text not null unique,
    password_hash text not null,
    full_name text not null,
    phone text,
    email text,
    role text not null default 'CUSTOMER' check (role in ('ADMIN', 'STAFF', 'CUSTOMER')),
    created_at timestamptz not null default now()
);

create table if not exists public.parking_zones (
    id bigint generated always as identity primary key,
    zone_code text not null unique,
    zone_name text not null,
    vehicle_type text not null check (vehicle_type in ('CAR', 'MOTORBIKE')),
    hourly_rate integer not null default 5000,
    overnight_rate integer not null default 30000,
    description text,
    created_at timestamptz not null default now()
);

create table if not exists public.parking_slots (
    id bigint generated always as identity primary key,
    zone_id bigint not null references public.parking_zones(id) on delete cascade,
    slot_code text not null unique,
    vehicle_type text not null check (vehicle_type in ('CAR', 'MOTORBIKE')),
    status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE')),
    current_plate text,
    updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
    id bigint generated always as identity primary key,
    user_id bigint references public.app_users(id) on delete set null,
    owner_name text not null,
    owner_phone text,
    license_plate text not null unique,
    vehicle_type text not null check (vehicle_type in ('CAR', 'MOTORBIKE')),
    brand text,
    color text,
    is_default boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists public.bookings (
    id bigint generated always as identity primary key,
    booking_code text not null unique,
    user_id bigint references public.app_users(id) on delete set null,
    customer_name text not null,
    customer_phone text,
    license_plate text not null,
    vehicle_type text not null check (vehicle_type in ('CAR', 'MOTORBIKE')),
    slot_id bigint not null references public.parking_slots(id) on delete cascade,
    slot_code text not null,
    start_time timestamptz not null default now(),
    end_time timestamptz not null,
    status text not null default 'RESERVED' check (status in ('RESERVED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED')),
    created_at timestamptz not null default now()
);

create table if not exists public.parking_sessions (
    id bigint generated always as identity primary key,
    qr_token text not null unique,
    booking_id bigint references public.bookings(id) on delete set null,
    slot_id bigint not null references public.parking_slots(id) on delete restrict,
    slot_code text not null,
    license_plate text not null,
    vehicle_type text not null check (vehicle_type in ('CAR', 'MOTORBIKE')),
    customer_name text,
    check_in_time timestamptz not null default now(),
    check_out_time timestamptz,
    duration_hours numeric(10,2) default 0,
    fee_amount integer not null default 0,
    payment_method text default 'CASH' check (payment_method in ('CASH', 'QR_TRANSFER')),
    status text not null default 'ACTIVE' check (status in ('ACTIVE', 'COMPLETED')),
    notes text
);

-- 2. Indexes on foreign keys and filtered columns
create index if not exists parking_slots_zone_id_idx on public.parking_slots(zone_id);
create index if not exists parking_slots_status_idx on public.parking_slots(status);
create index if not exists vehicles_user_id_idx on public.vehicles(user_id);
create index if not exists bookings_user_id_idx on public.bookings(user_id);
create index if not exists bookings_slot_id_idx on public.bookings(slot_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists parking_sessions_booking_id_idx on public.parking_sessions(booking_id);
create index if not exists parking_sessions_slot_id_idx on public.parking_sessions(slot_id);
create index if not exists parking_sessions_status_idx on public.parking_sessions(status);

-- 3. Enable RLS and configure policies + grants for REST API access
alter table public.app_users enable row level security;
alter table public.parking_zones enable row level security;
alter table public.parking_slots enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.parking_sessions enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

create policy "allow_public_access_app_users" on public.app_users for all to anon, authenticated using (true) with check (true);
create policy "allow_public_access_parking_zones" on public.parking_zones for all to anon, authenticated using (true) with check (true);
create policy "allow_public_access_parking_slots" on public.parking_slots for all to anon, authenticated using (true) with check (true);
create policy "allow_public_access_vehicles" on public.vehicles for all to anon, authenticated using (true) with check (true);
create policy "allow_public_access_bookings" on public.bookings for all to anon, authenticated using (true) with check (true);
create policy "allow_public_access_parking_sessions" on public.parking_sessions for all to anon, authenticated using (true) with check (true);

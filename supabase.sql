-- Supabase Schema for HotelSathi

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Hotels Table
create table hotels (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid references auth.users(id) not null,
    name text not null,
    phone text,
    email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Rooms Table
create table rooms (
    id uuid primary key default uuid_generate_v4(),
    hotel_id uuid references hotels(id) on delete cascade not null,
    name text not null,
    type text not null,
    price numeric not null,
    status text not null default 'available', -- available, maintenance
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookings Table
create table bookings (
    id uuid primary key default uuid_generate_v4(),
    hotel_id uuid references hotels(id) on delete cascade not null,
    room_id uuid references rooms(id) on delete cascade not null,
    guest_name text not null,
    phone text,
    nationality text,
    check_in date not null,
    check_out date not null,
    status text not null default 'pending', -- pending, confirmed, checked_in, checked_out, cancelled
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Guests Table
create table guests (
    id uuid primary key default uuid_generate_v4(),
    hotel_id uuid references hotels(id) on delete cascade not null,
    name text not null,
    phone text,
    nationality text,
    visit_count integer not null default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies

alter table hotels enable row level security;
alter table rooms enable row level security;
alter table bookings enable row level security;
alter table guests enable row level security;

-- Hotels: Owners can read/update their own hotel, public can read
create policy "Owners can manage their hotel" on hotels
    for all using (auth.uid() = owner_id);

create policy "Public can view hotels" on hotels
    for select using (true);

-- Rooms: Owners can manage rooms, public can view
create policy "Owners can manage their rooms" on rooms
    for all using (
        exists (select 1 from hotels where id = rooms.hotel_id and owner_id = auth.uid())
    );

create policy "Public can view rooms" on rooms
    for select using (true);

-- Bookings: Owners can manage, public can insert (pending requests)
create policy "Owners can manage bookings" on bookings
    for all using (
        exists (select 1 from hotels where id = bookings.hotel_id and owner_id = auth.uid())
    );

create policy "Public can insert bookings" on bookings
    for insert with check (true);

-- Guests: Owners can manage
create policy "Owners can manage guests" on guests
    for all using (
        exists (select 1 from hotels where id = guests.hotel_id and owner_id = auth.uid())
    );

create policy "Public can insert guests" on guests
    for insert with check (true);

create policy "Public can update guest count" on guests
    for update using (true);

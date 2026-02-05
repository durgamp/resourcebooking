-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Reactors Table
create table public.reactors (
  "serialNo" text primary key,
  "maxCapacityLiters" numeric not null,
  "capacityRange" text not null,
  "moc" text not null,
  "agitatorType" text not null,
  "plantName" text not null,
  "blockName" text not null,
  "commissionDate" date not null,
  "notes" text
);

-- Create Bookings Table
create table public.bookings (
  id uuid primary key default uuid_generate_v4(),
  "reactorSerialNo" text references public.reactors("serialNo") on delete cascade,
  team text not null,
  "productName" text not null,
  stage text not null,
  "batchNumber" text not null,
  operation text not null,
  "startDateTime" timestamptz not null,
  "endDateTime" timestamptz not null,
  status text not null,
  "requestedByEmail" text not null,
  "createdAt" timestamptz default now(),
  "updatedAt" timestamptz default now()
);

-- Create Downtime Table
create table public.downtime (
  id uuid primary key default uuid_generate_v4(),
  "reactorSerialNo" text references public.reactors("serialNo") on delete cascade,
  "startDateTime" timestamptz not null,
  "endDateTime" timestamptz not null,
  type text not null,
  reason text not null,
  "updatedByEmail" text not null,
  "updatedAt" timestamptz default now(),
  "isCancelled" boolean default false
);

-- Set up Row Level Security (RLS)
alter table public.reactors enable row level security;
alter table public.bookings enable row level security;
alter table public.downtime enable row level security;

-- Policies for Reactors
create policy "Allow public read access on reactors"
on public.reactors for select using (true);

create policy "Allow public insert access on reactors"
on public.reactors for insert with check (true);

create policy "Allow public update access on reactors"
on public.reactors for update using (true);

create policy "Allow public delete access on reactors"
on public.reactors for delete using (true);

-- Policies for Bookings
create policy "Allow public read access on bookings"
on public.bookings for select using (true);

create policy "Allow public insert access on bookings"
on public.bookings for insert with check (true);

create policy "Allow public update access on bookings"
on public.bookings for update using (true);

create policy "Allow public delete access on bookings"
on public.bookings for delete using (true);

-- Policies for Downtime
create policy "Allow public read access on downtime"
on public.downtime for select using (true);

create policy "Allow public insert access on downtime"
on public.downtime for insert with check (true);

create policy "Allow public update access on downtime"
on public.downtime for update using (true);

create policy "Allow public delete access on downtime"
on public.downtime for delete using (true);

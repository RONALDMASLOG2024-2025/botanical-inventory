-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.plants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  scientific_name text,
  category_id uuid,
  description text,
  habitat text,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  category text,
  care_instructions text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plants_pkey PRIMARY KEY (id),
  CONSTRAINT plants_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text UNIQUE,
  role text DEFAULT 'explorer'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
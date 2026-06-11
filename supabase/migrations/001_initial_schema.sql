-- ============================================================================
-- FurnAI — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Tables:
--   profiles          – Extends Supabase auth.users with app-specific fields
--   designs           – User-created furniture designs with parametric data
--   orders            – Purchase orders linked to designs
--   gallery_items     – Public catalog / showcase items
--   saved_items       – User bookmarks for designs and gallery items
--   order_status_history – Audit trail for order status changes
--
-- All tables use RLS (Row Level Security) with policies scoped to auth.uid().
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- --------------------------------------------------------------------------
-- PROFILES
-- --------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  default_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row whenever a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- --------------------------------------------------------------------------
-- DESIGNS
-- --------------------------------------------------------------------------
CREATE TABLE public.designs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'wardrobe', 'kitchen', 'table', 'sofa',
    'cabinet', 'bed', 'shelves', 'dressing_table'
  )),
  style TEXT,
  params JSONB NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  model_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES public.designs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------------
-- ORDERS
-- --------------------------------------------------------------------------
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'fabricating',
    'quality_check', 'shipped', 'delivered', 'cancelled'
  )),
  production_spec JSONB,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'AED',
  shipping_address JSONB,
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  notes TEXT,
  estimated_delivery TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------------
-- GALLERY ITEMS (public catalog)
-- --------------------------------------------------------------------------
CREATE TABLE public.gallery_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  style TEXT,
  description TEXT,
  params JSONB,
  model_url TEXT,
  thumbnail_url TEXT,
  dimensions JSONB,
  materials TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- --------------------------------------------------------------------------
-- SAVED / BOOKMARKED ITEMS
-- --------------------------------------------------------------------------
CREATE TABLE public.saved_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  design_id UUID REFERENCES public.designs(id) ON DELETE CASCADE,
  gallery_item_id UUID REFERENCES public.gallery_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, design_id),
  UNIQUE(user_id, gallery_item_id)
);


-- --------------------------------------------------------------------------
-- ORDER STATUS HISTORY (audit trail)
-- --------------------------------------------------------------------------
CREATE TABLE public.order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==========================================================================
-- ROW LEVEL SECURITY
-- ==========================================================================
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history  ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Designs: full CRUD on own designs, read access to public designs
CREATE POLICY "Users can view own designs"
  ON public.designs FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create designs"
  ON public.designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON public.designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON public.designs FOR DELETE
  USING (auth.uid() = user_id);

-- Orders: users can view and create their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gallery: publicly readable by everyone (including anonymous)
CREATE POLICY "Anyone can view gallery"
  ON public.gallery_items FOR SELECT
  USING (TRUE);

-- Saved items: users manage their own bookmarks
CREATE POLICY "Users can view own saved items"
  ON public.saved_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save items"
  ON public.saved_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave items"
  ON public.saved_items FOR DELETE
  USING (auth.uid() = user_id);

-- Order status history: users can view history for their own orders
CREATE POLICY "Users can view own order history"
  ON public.order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_id
        AND orders.user_id = auth.uid()
    )
  );


-- ==========================================================================
-- INDEXES
-- ==========================================================================
CREATE INDEX idx_designs_user_id    ON public.designs(user_id);
CREATE INDEX idx_designs_type       ON public.designs(type);
CREATE INDEX idx_orders_user_id     ON public.orders(user_id);
CREATE INDEX idx_orders_status      ON public.orders(status);
CREATE INDEX idx_gallery_type       ON public.gallery_items(type);
CREATE INDEX idx_gallery_featured   ON public.gallery_items(is_featured);

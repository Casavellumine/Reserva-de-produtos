-- ==============================================================================
-- CASA VELLUMINE — Esquema de Banco de Dados Supabase (PostgreSQL)
-- Sistema de Reserva de Produtos e Gestão de Encomendas
-- ==============================================================================

-- 1. Criação da extensão UUID caso ainda não esteja habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Tabela de Categorias
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. Tabela de Produtos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    aroma TEXT DEFAULT '',
    size TEXT DEFAULT '',
    usage_notes TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT true,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    main_photo INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para busca rápida de produtos ativos por categoria
CREATE INDEX IF NOT EXISTS idx_products_active_category ON public.products(active, category);

-- ==============================================================================
-- 4. Tabela de Reservas
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_whatsapp TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gift_wrap BOOLEAN NOT NULL DEFAULT false,
    packages JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'confirmada', 'pronta', 'concluida', 'cancelada'
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para ordenação das reservas por data
CREATE INDEX IF NOT EXISTS idx_reservations_created_at ON public.reservations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- ==============================================================================
-- 5. Trigger para atualização automática do campo updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_products_updated_at ON public.products;
CREATE TRIGGER tr_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_reservations_updated_at ON public.reservations;
CREATE TRIGGER tr_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. Políticas de Segurança (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- CATEGORIAS:
-- Leitura pública para qualquer visitante
CREATE POLICY "Categorias visíveis para todos" 
    ON public.categories FOR SELECT 
    USING (true);

-- Modificações permitidas apenas para usuários autenticados (administradores)
CREATE POLICY "Apenas admin pode gerenciar categorias" 
    ON public.categories FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- PRODUTOS:
-- Visitantes anônimos podem visualizar apenas produtos ativos
CREATE POLICY "Visitantes podem ver produtos ativos" 
    ON public.products FOR SELECT 
    USING (active = true OR auth.role() = 'authenticated');

-- Administradores autenticados podem inserir, atualizar e excluir produtos
CREATE POLICY "Apenas admin pode gerenciar produtos" 
    ON public.products FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- RESERVAS:
-- Qualquer cliente (público / anônimo) pode enviar (INSERT) uma nova reserva
CREATE POLICY "Clientes podem criar reservas" 
    ON public.reservations FOR INSERT 
    WITH CHECK (true);

-- Apenas o administrador autenticado pode listar, ler e atualizar o status das reservas
CREATE POLICY "Apenas admin pode consultar e gerenciar reservas" 
    ON public.reservations FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Apenas admin pode atualizar status de reservas" 
    ON public.reservations FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Apenas admin pode excluir reservas" 
    ON public.reservations FOR DELETE 
    TO authenticated 
    USING (true);

-- ==============================================================================
-- 7. Dados Iniciais de Demonstração (Seed Data - Casa Vellumine)
-- ==============================================================================

-- Inserindo categorias principais
INSERT INTO public.categories (name) VALUES
    ('Vela Aromática'),
    ('Home Spray'),
    ('Difusor de Varetas'),
    ('Wax Melts')
ON CONFLICT (name) DO NOTHING;

-- Inserindo catálogo inicial de produtos com imagens refinadas
INSERT INTO public.products (name, category, aroma, size, usage_notes, price, active, photos, main_photo) VALUES
(
    'Vela Âmbar & Baunilha Bourbon',
    'Vela Aromática',
    'Âmbar Nobre e Baunilha Bourbon',
    '210g (aproximadamente 40h de queima)',
    'Apare o pavio a 0,5cm antes de reacender. Na primeira queima, deixe formar a piscina completa de cera até a borda.',
    98.00,
    true,
    ARRAY[
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80'
    ],
    0
),
(
    'Vela Flor de Laranjeira & Cedro',
    'Vela Aromática',
    'Flor de Laranjeira com notas amadeiradas de Cedro',
    '180g (aproximadamente 35h de queima)',
    'Não deixe queimar por mais de 4 horas seguidas. Mantenha longe de correntes de ar para queima uniforme.',
    89.00,
    true,
    ARRAY[
        'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
    ],
    0
),
(
    'Vela Lavanda Francesa & Alecrim',
    'Vela Aromática',
    'Lavanda Botânica e Alecrim Fresco',
    '200g (aproximadamente 38h de queima)',
    'Ideal para rituais de autocuidado noturnos e meditação. Queime em superfícies resistentes ao calor.',
    92.00,
    true,
    ARRAY[
        'https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&w=800&q=80'
    ],
    0
),
(
    'Home Spray Bergamota & Chá Branco',
    'Home Spray',
    'Bergamota Italiana e Folhas de Chá Branco',
    '250ml frasco âmbar com gatilho',
    'Borrife a 30cm de tecidos, almofadas, cortinas e tapetes para prolongar a fixação da fragrância.',
    78.00,
    true,
    ARRAY[
        'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=800&q=80'
    ],
    0
),
(
    'Difusor de Varetas Figo & Folhas Verdes',
    'Difusor de Varetas',
    'Figo da Terra com notas verdes frescas',
    '200ml com 6 varetas de fibra de algodão',
    'Vire as varetas 1 vez por semana ou quando desejar intensificar o aroma no ambiente.',
    115.00,
    true,
    ARRAY[
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
    ],
    0
),
(
    'Wax Melts Canela & Especiarias',
    'Wax Melts',
    'Canela Spicy, Noz-Moscada e Cravo',
    '6 cubos aromáticos (75g)',
    'Coloque 1 ou 2 cubos no topo do rechaud cerâmico. O aroma se espalha em poucos minutos com o calor.',
    42.00,
    true,
    ARRAY[
        'https://images.unsplash.com/photo-1605651202774-7d573fd3f12d?auto=format&fit=crop&w=800&q=80'
    ],
    0
);

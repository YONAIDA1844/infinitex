-- ============================================================
-- InfiniteX — Migración 001: Tablas del Agente Tráfico
-- Ejecutar en: Supabase SQL Editor
-- Proyecto: aoueqkinzrhawzfsiulv
-- Schema: test (consistente con el resto del proyecto)
-- ============================================================

-- ── Función de updated_at (compartida) ─────────────────────
CREATE OR REPLACE FUNCTION test.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Tabla: proveedores ──────────────────────────────────────
-- Fábricas y distribuidores externos (~10 registros)

CREATE TABLE IF NOT EXISTS test.proveedores (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre     TEXT        NOT NULL,
    pais       TEXT        NOT NULL,
    contacto   TEXT        NOT NULL,   -- nombre del contacto principal
    email      TEXT,
    whatsapp   TEXT,
    tipo       TEXT        NOT NULL DEFAULT 'fabricante',
                                       -- fabricante | distribuidor | agente | otro
    notas      TEXT,
    activo     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE test.proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proveedores_select" ON test.proveedores
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "proveedores_insert" ON test.proveedores
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "proveedores_update" ON test.proveedores
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "proveedores_delete" ON test.proveedores
    FOR DELETE TO authenticated USING (TRUE);

CREATE TRIGGER trg_proveedores_updated_at
    BEFORE UPDATE ON test.proveedores
    FOR EACH ROW EXECUTE FUNCTION test.set_updated_at();

-- ── Tabla: operadores ───────────────────────────────────────
-- Agentes de aduana y operadores logísticos en destino

CREATE TABLE IF NOT EXISTS test.operadores (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre     TEXT        NOT NULL,
    pais       TEXT        NOT NULL,
    contacto   TEXT        NOT NULL,
    email      TEXT,
    whatsapp   TEXT,
    notas      TEXT,
    activo     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE test.operadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operadores_select" ON test.operadores
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "operadores_insert" ON test.operadores
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "operadores_update" ON test.operadores
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "operadores_delete" ON test.operadores
    FOR DELETE TO authenticated USING (TRUE);

CREATE TRIGGER trg_operadores_updated_at
    BEFORE UPDATE ON test.operadores
    FOR EACH ROW EXECUTE FUNCTION test.set_updated_at();

-- ── Grants ──────────────────────────────────────────────────
GRANT USAGE ON SCHEMA test TO authenticated;
GRANT ALL   ON test.proveedores TO authenticated;
GRANT ALL   ON test.operadores  TO authenticated;

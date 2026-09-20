-- ============================================================
-- ROLE LOGIN HRIS
-- ============================================================

INSERT INTO public.hris_users (
  email,
  nama,
  role,
  status
)
VALUES
  (
    'kusumatirta6@gmail.com',
    'Kusuma Tirta',
    'Super Admin',
    'Aktif'
  ),
  (
    'nvl.nixia@gmail.com',
    'Nixia',
    'Admin',
    'Aktif'
  ),
  (
    'windapermatasari1807@gmail.com',
    'Winda Permatasari',
    'HRD',
    'Aktif'
  )
ON CONFLICT (email) DO UPDATE
SET
  nama = EXCLUDED.nama,
  role = EXCLUDED.role,
  status = EXCLUDED.status;


-- ============================================================
-- PERMISSION SUPER ADMIN
-- ============================================================

INSERT INTO public.hris_role_permissions (
  role_name,
  permission_code
)
VALUES
  ('Super Admin', '*')

ON CONFLICT (role_name, permission_code)
DO NOTHING;


-- ============================================================
-- PERMISSION ADMIN
-- ============================================================

INSERT INTO public.hris_role_permissions (
  role_name,
  permission_code
)
VALUES
  ('Admin', 'people'),
  ('Admin', 'attendance'),
  ('Admin', 'schedule'),
  ('Admin', 'leave'),
  ('Admin', 'payroll'),
  ('Admin', 'talent'),
  ('Admin', 'reports'),
  ('Admin', 'system')

ON CONFLICT (role_name, permission_code)
DO NOTHING;


-- ============================================================
-- PERMISSION HRD
-- ============================================================

INSERT INTO public.hris_role_permissions (
  role_name,
  permission_code
)
VALUES
  ('HRD', 'people'),
  ('HRD', 'attendance'),
  ('HRD', 'schedule'),
  ('HRD', 'leave'),
  ('HRD', 'talent'),
  ('HRD', 'reports')

ON CONFLICT (role_name, permission_code)
DO NOTHING;


-- ============================================================
-- FUNCTION MENGAMBIL ROLE USER LOGIN
-- ============================================================

CREATE OR REPLACE FUNCTION public.hris_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.hris_users
  WHERE lower(email) =
        lower(coalesce(auth.jwt()->>'email', ''))
    AND status = 'Aktif'
  LIMIT 1;
$$;

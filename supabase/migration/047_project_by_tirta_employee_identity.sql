-- ============================================================
-- Project by Tirta | V57 Employee Identity & Registration
-- Safe migration: keeps existing employee relations intact.
-- ============================================================
create extension if not exists pgcrypto;

-- 1) Employee ID must be a unique business identifier.
do $$
begin
  if exists (
    select 1 from public.karyawan
    where id_karyawan is null or btrim(id_karyawan) = ''
  ) then
    update public.karyawan
      set id_karyawan = 'REG-' || upper(substr(replace(id::text,'-',''),1,8))
    where id_karyawan is null or btrim(id_karyawan) = '';
  end if;

  if exists (
    select 1 from (
      select upper(btrim(id_karyawan)) as employee_id, count(*) as total
      from public.karyawan
      group by upper(btrim(id_karyawan))
      having count(*) > 1
    ) d
  ) then
    raise exception 'Migration dihentikan: ditemukan duplicate id_karyawan. Bersihkan duplicate terlebih dahulu.';
  end if;
end $$;

create unique index if not exists ux_karyawan_employee_id_ci
  on public.karyawan (upper(btrim(id_karyawan)));

create index if not exists ix_karyawan_auth_user_id
  on public.karyawan(auth_user_id);

-- 2) Existing modules currently reference id_karyawan.
-- Add ON UPDATE CASCADE so an HR change of Employee ID propagates safely
-- through existing foreign keys instead of breaking historical records.
do $$
declare
  r record;
  del_action text;
  con_cols text;
begin
  for r in
    select
      n.nspname as schema_name,
      c.relname as table_name,
      con.conname as constraint_name,
      a.attname as column_name,
      con.confdeltype
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_class parent on parent.oid = con.confrelid
    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = con.conkey[1]
    join pg_attribute pa on pa.attrelid = con.confrelid and pa.attnum = con.confkey[1]
    where con.contype = 'f'
      and con.confrelid = 'public.karyawan'::regclass
      and array_length(con.conkey,1) = 1
      and array_length(con.confkey,1) = 1
      and pa.attname = 'id_karyawan'
  loop
    del_action := case r.confdeltype
      when 'c' then 'CASCADE'
      when 'n' then 'SET NULL'
      when 'd' then 'SET DEFAULT'
      when 'r' then 'RESTRICT'
      else 'NO ACTION'
    end;

    execute format(
      'alter table %I.%I drop constraint %I',
      r.schema_name, r.table_name, r.constraint_name
    );

    execute format(
      'alter table %I.%I add constraint %I foreign key (%I) references public.karyawan(id_karyawan) on update cascade on delete %s',
      r.schema_name, r.table_name, r.constraint_name, r.column_name, del_action
    );
  end loop;
end $$;

-- 3) Permission specifically for changing Employee ID.
insert into public.hris_permissions(kode,nama,modul)
values ('people.employee_id.write','Mengubah ID Karyawan','people')
on conflict(kode) do nothing;

insert into public.hris_role_permissions(role_name,permission_code)
values
 ('Super Admin','people.employee_id.write'),
 ('Admin','people.employee_id.write'),
 ('HRD','people.employee_id.write')
on conflict(role_name,permission_code) do nothing;

-- 4) Protect Employee ID from self-service changes.
-- Other employee profile updates may remain governed by existing RLS,
-- but changing the business identifier requires explicit permission.
create or replace function public.project_tirta_protect_employee_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.id_karyawan is distinct from new.id_karyawan then
    if not public.hris_has_permission('people.employee_id.write') then
      raise exception 'Perubahan ID Karyawan hanya dapat dilakukan oleh HR/Admin yang berwenang.';
    end if;

    new.id_karyawan := upper(btrim(new.id_karyawan));
    if new.id_karyawan is null or new.id_karyawan = '' then
      raise exception 'ID Karyawan tidak boleh kosong.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_project_tirta_employee_id on public.karyawan;
create trigger trg_project_tirta_employee_id
before update on public.karyawan
for each row execute function public.project_tirta_protect_employee_id();

-- 5) Registration trigger: honor optional Employee ID supplied during signup.
-- If omitted, generate a deterministic unique REG-* business identifier.
create or replace function public.moonhr_create_employee_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := coalesce(new.raw_user_meta_data->>'nama', split_part(new.email,'@',1));
  v_phone text := nullif(new.raw_user_meta_data->>'no_telp','');
  v_address text := nullif(new.raw_user_meta_data->>'alamat_rumah','');
  v_birth date := nullif(new.raw_user_meta_data->>'tanggal_lahir','')::date;
  v_requested_id text := nullif(upper(btrim(new.raw_user_meta_data->>'id_karyawan')),'');
  v_id text;
begin
  v_id := coalesce(v_requested_id, 'REG-' || upper(substr(replace(new.id::text,'-',''),1,8)));

  if exists (select 1 from public.karyawan where upper(btrim(id_karyawan)) = v_id) then
    if exists (select 1 from public.karyawan where auth_user_id = new.id) then
      return new;
    end if;
    raise exception 'ID Karyawan % sudah digunakan.', v_id;
  end if;

  insert into public.karyawan
    (id,id_karyawan,nama,email,no_telp,alamat_rumah,tanggal_lahir,role,status_aktif,status_karyawan,auth_user_id)
  values
    (gen_random_uuid(),v_id,v_name,new.email,v_phone,v_address,v_birth,'karyawan',false,'Menunggu Verifikasi',new.id)
  on conflict (email) do update set
    nama=excluded.nama,
    no_telp=excluded.no_telp,
    alamat_rumah=excluded.alamat_rumah,
    tanggal_lahir=excluded.tanggal_lahir,
    auth_user_id=excluded.auth_user_id;

  return new;
end;
$$;

-- Keep the existing registration trigger name.
drop trigger if exists moonhr_auth_employee_profile on auth.users;
create trigger moonhr_auth_employee_profile
after insert on auth.users
for each row execute function public.moonhr_create_employee_profile();

notify pgrst, 'reload schema';

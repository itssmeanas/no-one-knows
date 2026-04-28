create extension if not exists pgcrypto;

create table public.confessions (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  title text,
  category text not null,
  body text not null,
  visibility text not null default 'public',
  is_anonymous boolean not null default true,
  approval_status text not null default 'approved',
  is_hidden boolean not null default false,
  is_deleted boolean not null default false,
  manage_token_hash text not null,
  felt_count integer not null default 0,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  hidden_at timestamptz,
  deleted_at timestamptz,
  constraint confessions_public_id_length_check check (
    char_length(public_id) between 8 and 32
  ),
  constraint confessions_title_length_check check (
    title is null or char_length(title) <= 80
  ),
  constraint confessions_body_length_check check (
    char_length(body) between 20 and 1000
  ),
  constraint confessions_visibility_check check (
    visibility in ('public', 'private')
  ),
  constraint confessions_approval_status_check check (
    approval_status in ('pending', 'approved', 'rejected')
  ),
  constraint confessions_category_check check (
    category in (
      'I still love them',
      'I lied',
      'I miss someone',
      'I regret it',
      'I am scared',
      'I feel alone',
      'I am pretending',
      'I never told anyone',
      'I wish I could go back',
      'I cannot forgive myself',
      'Other'
    )
  ),
  constraint confessions_felt_count_nonnegative_check check (felt_count >= 0),
  constraint confessions_report_count_nonnegative_check check (report_count >= 0)
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  reaction_type text not null default 'felt_this',
  anonymous_session_id text,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint reactions_reaction_type_check check (
    reaction_type = 'felt_this'
  ),
  constraint reactions_session_or_ip_check check (
    anonymous_session_id is not null or ip_hash is not null
  )
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  confession_id uuid not null references public.confessions(id) on delete cascade,
  reason text not null,
  details text,
  anonymous_session_id text,
  ip_hash text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  constraint reports_reason_check check (
    reason in (
      'Names or personal information',
      'Harassment or revenge posting',
      'Threats or violence',
      'Hate or discrimination',
      'Self-harm concern',
      'Sexual content',
      'Spam',
      'Other'
    )
  ),
  constraint reports_status_check check (
    status in ('pending', 'reviewed', 'dismissed')
  ),
  constraint reports_details_length_check check (
    details is null or char_length(details) <= 500
  )
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values
  ('submissions_enabled', 'true'),
  ('reactions_enabled', 'true'),
  ('approval_mode_enabled', 'false'),
  ('private_confessions_enabled', 'true'),
  ('minimum_confession_length', '20'),
  ('maximum_confession_length', '1000');

create index confessions_public_archive_idx
  on public.confessions (created_at desc)
  where visibility = 'public'
    and approval_status = 'approved'
    and is_hidden = false
    and is_deleted = false;

create index confessions_public_id_idx
  on public.confessions (public_id);

create index confessions_manage_token_hash_idx
  on public.confessions (manage_token_hash);

create index confessions_moderation_idx
  on public.confessions (
    approval_status,
    visibility,
    is_hidden,
    is_deleted,
    created_at desc
  );

create index confessions_category_idx
  on public.confessions (category, created_at desc)
  where visibility = 'public'
    and approval_status = 'approved'
    and is_hidden = false
    and is_deleted = false;

create index reactions_confession_id_idx
  on public.reactions (confession_id);

create unique index reactions_one_session_per_confession_idx
  on public.reactions (confession_id, anonymous_session_id)
  where anonymous_session_id is not null;

create index reports_confession_id_idx
  on public.reports (confession_id);

create index reports_status_created_at_idx
  on public.reports (status, created_at desc);

create index audit_logs_admin_created_at_idx
  on public.audit_logs (admin_user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger confessions_set_updated_at
before update on public.confessions
for each row
execute function public.set_updated_at();

create trigger app_settings_set_updated_at
before update on public.app_settings
for each row
execute function public.set_updated_at();

create or replace function public.increment_confession_felt_count(target_confession_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.confessions
  set felt_count = felt_count + 1
  where id = target_confession_id;
end;
$$;

create or replace function public.increment_confession_report_count(target_confession_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.confessions
  set report_count = report_count + 1
  where id = target_confession_id;
end;
$$;

alter table public.confessions enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "Public can read visible approved public confessions"
on public.confessions
for select
to anon, authenticated
using (
  visibility = 'public'
  and approval_status = 'approved'
  and is_hidden = false
  and is_deleted = false
);

revoke all on table public.confessions from anon, authenticated;
revoke all on table public.reactions from anon, authenticated;
revoke all on table public.reports from anon, authenticated;
revoke all on table public.app_settings from anon, authenticated;
revoke all on table public.audit_logs from anon, authenticated;

grant select (
  id,
  public_id,
  title,
  category,
  body,
  visibility,
  is_anonymous,
  approval_status,
  is_hidden,
  is_deleted,
  felt_count,
  report_count,
  created_at,
  updated_at,
  hidden_at,
  deleted_at
) on public.confessions to anon, authenticated;

grant usage on schema public to anon, authenticated;
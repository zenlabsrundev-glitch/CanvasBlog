
-- Roles enum and table
create type public.app_role as enum ('admin', 'reader');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
on public.profiles for select
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

-- Posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  title text not null,
  excerpt text,
  body_md text not null default '',
  tags text[] not null default '{}',
  cover_color text not null default 'indigo',
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;

create policy "Published posts are viewable by everyone"
on public.posts for select
using (status = 'published' or public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert posts"
on public.posts for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update posts"
on public.posts for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete posts"
on public.posts for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index posts_status_published_at_idx on public.posts (status, published_at desc);
create index posts_tags_idx on public.posts using gin (tags);

-- Comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;

create policy "Comments on published posts are viewable by everyone"
on public.comments for select
using (
  exists (select 1 from public.posts p where p.id = post_id and (p.status = 'published' or public.has_role(auth.uid(), 'admin')))
);

create policy "Authenticated users can insert their own comments"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own comments"
on public.comments for delete
to authenticated
using (auth.uid() = user_id);

create policy "Admins can delete any comment"
on public.comments for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create index comments_post_id_idx on public.comments (post_id, created_at desc);

-- Likes
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
alter table public.likes enable row level security;

create policy "Likes are viewable by everyone"
on public.likes for select
using (true);

create policy "Authenticated users can like"
on public.likes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can unlike their own"
on public.likes for delete
to authenticated
using (auth.uid() = user_id);

-- Bookmarks
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
alter table public.bookmarks enable row level security;

create policy "Users can view their own bookmarks"
on public.bookmarks for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own bookmarks"
on public.bookmarks for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
on public.bookmarks for delete
to authenticated
using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger posts_set_updated_at before update on public.posts
for each row execute function public.set_updated_at();

-- New user trigger: create profile + assign role (first user becomes admin)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
  assigned_role public.app_role;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));

  select count(*) into user_count from public.user_roles where role = 'admin';
  if user_count = 0 then
    assigned_role := 'admin';
  else
    assigned_role := 'reader';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, assigned_role);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

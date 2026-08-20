-- SurplusHub Messenger backend.
-- Requires real Supabase Auth user ids to be stored in messenger_participants.user_id.
-- The frontend uses publishable keys only; service-role keys must remain server-side.

create table if not exists public.messenger_conversations (
  id text primary key,
  listing_ids text[] not null default '{}',
  request_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messenger_participants (
  conversation_id text not null references public.messenger_conversations(id) on delete cascade,
  participant_id text not null,
  user_id text not null,
  role text not null check (role in ('buyer', 'seller')),
  name text not null,
  avatar_text text not null,
  image_url text,
  online boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (conversation_id, participant_id)
);

create table if not exists public.messenger_messages (
  id text primary key,
  conversation_id text not null references public.messenger_conversations(id) on delete cascade,
  sender_participant_id text not null,
  sender_user_id text not null,
  body text not null default '',
  status text not null default 'sent' check (status in ('sending', 'sent', 'failed', 'read')),
  shared_listing jsonb,
  purchase_request jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.messenger_attachments (
  id text primary key,
  message_id text not null references public.messenger_messages(id) on delete cascade,
  kind text not null default 'image' check (kind in ('image')),
  name text not null,
  mime_type text not null,
  size integer not null,
  url text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.messenger_reads (
  conversation_id text not null references public.messenger_conversations(id) on delete cascade,
  participant_id text not null,
  user_id text not null,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, participant_id)
);

create index if not exists messenger_messages_conversation_created_idx
  on public.messenger_messages(conversation_id, created_at);

create index if not exists messenger_participants_user_idx
  on public.messenger_participants(user_id);

alter table public.messenger_conversations enable row level security;
alter table public.messenger_participants enable row level security;
alter table public.messenger_messages enable row level security;
alter table public.messenger_attachments enable row level security;
alter table public.messenger_reads enable row level security;

create policy "Participants can read their conversations"
  on public.messenger_conversations for select
  using (
    exists (
      select 1 from public.messenger_participants p
      where p.conversation_id = id and p.user_id = auth.uid()::text
    )
  );

create policy "Authenticated users can create conversations"
  on public.messenger_conversations for insert
  with check (auth.uid() is not null);

create policy "Participants can update their conversations"
  on public.messenger_conversations for update
  using (
    exists (
      select 1 from public.messenger_participants p
      where p.conversation_id = id and p.user_id = auth.uid()::text
    )
  );

create policy "Participants can read participants"
  on public.messenger_participants for select
  using (
    exists (
      select 1 from public.messenger_participants p
      where p.conversation_id = conversation_id and p.user_id = auth.uid()::text
    )
  );

create policy "Authenticated users can create participants"
  on public.messenger_participants for insert
  with check (auth.uid() is not null);

create policy "Participants can read messages"
  on public.messenger_messages for select
  using (
    exists (
      select 1 from public.messenger_participants p
      where p.conversation_id = conversation_id and p.user_id = auth.uid()::text
    )
  );

create policy "Participants can send messages"
  on public.messenger_messages for insert
  with check (
    sender_user_id = auth.uid()::text and
    exists (
      select 1 from public.messenger_participants p
      where p.conversation_id = conversation_id
        and p.participant_id = sender_participant_id
        and p.user_id = auth.uid()::text
    )
  );

create policy "Participants can read attachments"
  on public.messenger_attachments for select
  using (
    exists (
      select 1
      from public.messenger_messages m
      join public.messenger_participants p on p.conversation_id = m.conversation_id
      where m.id = message_id and p.user_id = auth.uid()::text
    )
  );

create policy "Participants can create attachments"
  on public.messenger_attachments for insert
  with check (
    exists (
      select 1
      from public.messenger_messages m
      join public.messenger_participants p on p.conversation_id = m.conversation_id
      where m.id = message_id and p.user_id = auth.uid()::text
    )
  );

create policy "Users can upsert their read markers"
  on public.messenger_reads for all
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'messenger-attachments',
  'messenger-attachments',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Messenger participants can upload message images"
  on storage.objects for insert
  with check (
    bucket_id = 'messenger-attachments' and auth.uid() is not null
  );

create policy "Messenger images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'messenger-attachments');

do $$
begin
  alter publication supabase_realtime add table public.messenger_messages;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messenger_attachments;
exception
  when duplicate_object then null;
end $$;

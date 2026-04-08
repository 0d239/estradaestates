-- Allow anonymous users to submit leads via the public contact form
create policy "Anyone can submit a lead"
  on public.contacts for insert
  to anon
  with check (type = 'lead');

# Supabase setup

1. Create a project at https://app.supabase.com

2. Use the provided SQL schema located at `docs/schema.sql` to create the database tables and indexes. You can run that script in the Supabase SQL Editor or via psql. The schema includes `categories`, `plants`, and `users` tables and an index to speed up name searches.

3. Create a Storage bucket named `plant-images`.
   - If you want images accessible directly, make it public; otherwise, keep it private and request signed URLs.

4. The repository contains a `.env.local` sample with the provided Supabase URL. Open `.env.local` and paste your project's anon key into `NEXT_PUBLIC_SUPABASE_ANON_KEY` and (optionally) add a server `SUPABASE_KEY` if you need server-side access.

5. (Optional) Enable Google provider under Authentication > Providers to later enable Google sign-in.

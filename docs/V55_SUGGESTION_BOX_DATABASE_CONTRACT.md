# V55 Suggestion Box — Database Contract

Frontend feature only. SQL is intentionally unchanged.

Future Supabase implementation should provide:
- suggestions table with title/content/category/priority/status
- authenticated employee ownership
- anonymous submission flag without exposing employee identity to ordinary users
- Super Admin-only inbox access
- reply/history model
- optional attachment metadata + private storage bucket
- RLS for employee submission/read-own and Super Admin management
- audit events for status/reply/admin actions
- indexes on status, created_at and submitter
- notification event to Super Admin on new submission
- anti-spam/rate limiting strategy

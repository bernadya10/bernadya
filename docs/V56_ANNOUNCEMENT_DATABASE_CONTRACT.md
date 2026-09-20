# V56 Announcement Center — Database Contract

Frontend implementation only; Supabase SQL remains unchanged.

Required future database domains:
- announcements
- announcement_recipients/read receipts
- optional announcement attachments
- audience targeting by all/department/branch/position
- draft/publish/archive/expiry lifecycle
- scheduled publication
- pinning and priority
- RLS: employees can read only eligible published announcements and write only their own read receipt
- HR/Admin/Super Admin permissions for create/update/publish/archive according to role
- read statistics for authorized admins
- audit events for create/update/publish/archive
- notification event on publication
- private storage policy for attachments
- indexes for published_at, expires_at, status and audience lookup

# Project by Tirta — V57 Implementation

Implemented in this archive:

- Reworked public home into a clean Project by Tirta landing page.
- Login now opens as a floating modal over the landing page.
- Added password show/hide and forgot-password request flow.
- Added Remember Me persistence flag.
- Unified Project by Tirta / Moon visual identity and navy-gold-white palette.
- Added optional Employee ID to employee self-registration.
- Added Employee ID validation and normalization.
- Added HR/Admin Employee ID editing in the existing employee editor.
- Added duplicate Employee ID validation before update.
- Added employee export column selector with CSV and Excel-compatible XLS output.
- Added floating role badge in the HR dashboard header.
- Added dedicated `people.employee_id.write` permission.
- Added database protection preventing unauthorized Employee ID changes.
- Added a Supabase migration that makes existing Employee ID foreign-key relations use ON UPDATE CASCADE.
- Registration trigger now honors an optional Employee ID and generates REG-* when omitted.
- Updated employee portal branding and core palette.
- Updated document title/meta branding.

Important database note:
The current project architecture uses `id_karyawan` as a foreign-key business identifier in many HR tables. The migration therefore uses ON UPDATE CASCADE rather than changing all historical relationships to UUID in one destructive migration. This preserves existing records while allowing HR to change the Employee ID.

Migration:
`supabase/migration/047_project_by_tirta_employee_identity.sql`

Build verification:
The source was checked after editing. A full `npm run build` could not complete in this environment because the uploaded archive did not include installed dependencies and the environment could not download the project's Node dependencies. The TypeScript parser reported no JSX syntax errors in the changed files; module/type resolution could not run without node_modules.

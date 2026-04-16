---
name: Authentication & RBAC
description: JWT auth with email+Google OAuth, three roles (admin/team_member/user), approval workflow
type: feature
---
- Auth: Supabase Auth with email+password and Google OAuth (Lovable Cloud managed)
- Roles: admin, team_member, user (stored in user_roles table)
- Status: pending, approved, rejected (stored in profiles table)
- New users default to role=user, status=pending
- Exception: umeshvalvala2004@gmail.com auto-gets role=admin, status=approved
- Only approved users can access telltale content
- Admin can approve/reject users and change roles
- RLS enforced on all tables using has_role() and is_approved() security definer functions
- Leaked password protection (HIBP) enabled

import { useAuth } from "@/hooks/use-auth";
import { Shield, Users, UserCheck, Eye } from "lucide-react";

export function RolePermissionsBanner() {
  const { isAdmin, isTeamMember, isApproved, user } = useAuth();
  if (!user) return null;

  let Icon = Eye;
  let label = "Viewer";
  let tone = "bg-muted/40 border-border text-muted-foreground";
  let actions: string[] = ["View telltales"];

  if (isAdmin) {
    Icon = Shield;
    label = "Admin";
    tone = "bg-primary/5 border-primary/20 text-foreground";
    actions = ["Add", "Edit any", "Delete any", "Manage users", "Manage standards"];
  } else if (isTeamMember) {
    Icon = Users;
    label = "Team Member";
    tone = "bg-status-completed/5 border-status-completed/20 text-foreground";
    actions = ["Add telltales", "Edit any telltale", "Delete any telltale"];
  } else if (isApproved) {
    Icon = UserCheck;
    label = "Approved User";
    tone = "bg-status-ongoing/5 border-status-ongoing/20 text-foreground";
    actions = ["Add telltales", "Edit your own", "Delete your own"];
  } else {
    actions = ["View only — pending approval"];
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 ${tone}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-mono uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">·</span>
      <div className="flex flex-wrap gap-1.5">
        {actions.map((a) => (
          <span key={a} className="text-[11px] px-2 py-0.5 rounded-md bg-background/60 border border-border/60 text-foreground">
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Check, X, Shield, User, Users } from "lucide-react";

type ApprovalStatus = "pending" | "approved" | "rejected";
type AppRole = "admin" | "team_member" | "user";

interface ProfileWithRoles {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  status: ApprovalStatus;
  created_at: string;
  user_roles: { role: AppRole }[];
}

function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async (): Promise<ProfileWithRoles[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProfileWithRoles[];
    },
  });
}

function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: ApprovalStatus }) => {
      const { error } = await supabase.from("profiles").update({ status }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });
}

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Delete existing roles, then insert new one
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: () => toast.error("Failed to update role"),
  });
}

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-status-ongoing/10 text-status-ongoing border-status-ongoing/20" },
  approved: { label: "Approved", className: "bg-status-completed/10 text-status-completed border-status-completed/20" },
  rejected: { label: "Rejected", className: "bg-status-not-started/10 text-status-not-started border-status-not-started/20" },
};

const roleIcons: Record<AppRole, typeof Shield> = {
  admin: Shield,
  team_member: Users,
  user: User,
};

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const updateRole = useUpdateUserRole();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Approve, reject, and manage user roles</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : !users?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
            <div className="divide-y divide-border">
              {users.map((user) => {
                const role = user.user_roles?.[0]?.role || "user";
                const sc = statusConfig[user.status];
                const RoleIcon = roleIcons[role];
                return (
                  <div key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.display_name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className={sc.className}>{sc.label}</Badge>
                      <Select value={role} onValueChange={(v) => updateRole.mutate({ userId: user.user_id, role: v as AppRole })}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="team_member">Team Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      {user.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-8 text-status-completed border-status-completed/20 hover:bg-status-completed/10" onClick={() => updateStatus.mutate({ userId: user.user_id, status: "approved" })}>
                            <Check className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => updateStatus.mutate({ userId: user.user_id, status: "rejected" })}>
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                      {user.status !== "pending" && (
                        <Select value={user.status} onValueChange={(v) => updateStatus.mutate({ userId: user.user_id, status: v as ApprovalStatus })}>
                          <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

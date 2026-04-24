import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproved?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireApproved = false, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, isApproved, isTeamMember, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md space-y-4 p-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireApproved && !isApproved && !isAdmin && !isTeamMember) {
    return <Navigate to="/pending" replace />;
  }

  return <>{children}</>;
}

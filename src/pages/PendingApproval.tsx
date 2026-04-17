import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, LogOut, XCircle } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function PendingApproval() {
  const { profile, signOut, isAdmin, isApproved, isLoading } = useAuth();

  const isRejected = profile?.status === "rejected";

  if (!isLoading && (isAdmin || isApproved)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-4">
        <div className="bg-card border border-border rounded-xl p-8" style={{ boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
          {isRejected ? (
            <>
              <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Access Denied</h2>
              <p className="text-sm text-muted-foreground">Your account request has been rejected. Please contact the administrator for more information.</p>
            </>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-status-ongoing/10 text-status-ongoing flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Pending Approval</h2>
              <p className="text-sm text-muted-foreground">Your account is awaiting admin approval. You'll receive access once your account is verified.</p>
            </>
          )}
        </div>
        <Button variant="outline" onClick={signOut} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
}

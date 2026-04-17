import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AppRole = "admin" | "team_member" | "user";
type ApprovalStatus = "pending" | "approved" | "rejected";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: ApprovalStatus;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  isLoading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isTeamMember: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchProfile = async (userId: string) => {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId),
    ]);

    return {
      profile: (profileData as Profile | null) ?? null,
      roles: (rolesData ?? []).map((r) => r.role as AppRole),
    };
  };

  const refreshProfile = async () => {
    if (!user) return;

    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);

    const nextProfileState = await fetchProfile(user.id);

    if (currentRequestId !== requestIdRef.current) return;

    setProfile(nextProfileState.profile);
    setRoles(nextProfileState.roles);
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      const currentRequestId = ++requestIdRef.current;

      if (!isMounted) return;

      setIsLoading(true);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setRoles([]);
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
        return;
      }

      const nextProfileState = await fetchProfile(nextSession.user.id);

      if (!isMounted || currentRequestId !== requestIdRef.current) return;

      setProfile(nextProfileState.profile);
      setRoles(nextProfileState.roles);
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void applySession(nextSession);
      }
    );

    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      void applySession(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    requestIdRef.current += 1;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setIsLoading(false);
  };

  const isAdmin = roles.includes("admin");
  const isApproved = profile?.status === "approved";
  const isTeamMember = roles.includes("team_member");

  return (
    <AuthContext.Provider
      value={{ user, session, profile, roles, isLoading, isAdmin, isApproved, isTeamMember, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

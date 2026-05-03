// import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import type { Session, User } from "@supabase/supabase-js";

// type AppRole = "admin" | "member";

// interface AuthCtx {
//   user: User | null;
//   session: Session | null;
//   role: AppRole | null;
//   loading: boolean;
//   signOut: () => Promise<void>;
// }

// const Ctx = createContext<AuthCtx>({ user: null, session: null, role: null, loading: true, signOut: async () => {} });

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [session, setSession] = useState<Session | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [role, setRole] = useState<AppRole | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
//       setSession(s);
//       setUser(s?.user ?? null);
//       if (s?.user) {
//         setTimeout(() => fetchRole(s.user.id), 0);
//       } else {
//         setRole(null);
//       }
//     });
//     supabase.auth.getSession().then(({ data }) => {
//       setSession(data.session);
//       setUser(data.session?.user ?? null);
//       if (data.session?.user) fetchRole(data.session.user.id);
//       setLoading(false);
//     });
//     return () => sub.subscription.unsubscribe();
//   }, []);

//   const fetchRole = async (uid: string) => {
//     const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid);
//     if (data?.some((r) => r.role === "admin")) setRole("admin");
//     else if (data?.length) setRole("member");
//     else setRole(null);
//   };

//   const signOut = async () => { await supabase.auth.signOut(); };

//   return <Ctx.Provider value={{ user, session, role, loading, signOut }}>{children}</Ctx.Provider>;
// };

// export const useAuth = () => useContext(Ctx);



import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, getToken, setToken, clearToken, getStoredUser, setStoredUser } from "@/integrations/api/client";

type AppRole = "admin" | "member";

interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
}

interface AuthCtx {
  user: AuthUser | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, role: null, loading: true, signOut: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then((u) => { setUser(u); setStoredUser(u); })
      .catch(() => { clearToken(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    clearToken();
    setUser(null);
    window.location.href = '/auth';
  };

  return (
    <Ctx.Provider value={{ user, role: user?.role ?? null, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
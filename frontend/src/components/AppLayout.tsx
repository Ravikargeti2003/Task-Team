// import { ReactNode } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "@/lib/auth";
// import { Button } from "@/components/ui/button";
// import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, Shield } from "lucide-react";

// const navItems = [
//   { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
//   { to: "/projects", label: "Projects", icon: FolderKanban },
//   { to: "/tasks", label: "My Tasks", icon: CheckSquare },
// ];

// export const AppLayout = ({ children }: { children: ReactNode }) => {
//   const { user, role, signOut } = useAuth();
//   const navigate = useNavigate();

//   const handleSignOut = async () => {
//     await signOut();
//     navigate("/auth");
//   };

//   return (
//     <div className="min-h-screen flex bg-background">
//       <aside className="w-60 border-r border-border flex flex-col bg-sidebar">
//         <div className="px-5 py-5 border-b border-sidebar-border">
//           <div className="flex items-center gap-2">
//             <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">TT</div>
//             <span className="font-semibold tracking-tight">TaskTeam</span>
//           </div>
//         </div>
//         <nav className="flex-1 px-3 py-4 space-y-1">
//           {navItems.map((item) => (
//             <NavLink
//               key={item.to}
//               to={item.to}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
//                   isActive
//                     ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
//                     : "text-sidebar-foreground hover:bg-sidebar-accent/60"
//                 }`
//               }
//             >
//               <item.icon className="h-4 w-4" />
//               {item.label}
//             </NavLink>
//           ))}
//         </nav>
//         <div className="p-3 border-t border-sidebar-border space-y-2">
//           <div className="px-2 py-1">
//             <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
//             {role && (
//               <div className="flex items-center gap-1 mt-1 text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
//                 <Shield className="h-3 w-3" /> {role}
//               </div>
//             )}
//           </div>
//           <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
//             <LogOut className="h-4 w-4 mr-2" /> Sign out
//           </Button>
//         </div>
//       </aside>
//       <main className="flex-1 overflow-auto">
//         <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
//       </main>
//     </div>
//   );
// };




import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, Shield, Menu, X } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">TT</div>
            <span className="font-semibold tracking-tight">TaskTeam</span>
          </div>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="px-2 py-1">
          <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
          {role && (
            <div className="flex items-center gap-1 mt-1 text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
              <Shield className="h-3 w-3" /> {role}
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR — slide in on mobile, always visible on desktop ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 border-r border-border flex flex-col bg-sidebar
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:w-60 lg:z-auto lg:flex
        `}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-mono text-[10px] font-bold">TT</div>
            <span className="font-semibold text-sm tracking-tight">TaskTeam</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
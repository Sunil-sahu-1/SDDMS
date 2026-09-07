import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RoleGuard from "@/components/RoleGuard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard>
      <div className="app-shell min-h-screen lg:flex">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="page-safe mx-auto w-full max-w-[1800px] px-3 py-5 sm:px-5 lg:px-8 lg:py-7">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

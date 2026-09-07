"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { authApi } from "@/services/api";
import { Loading } from "./Loading";

const NORMAL_USER_ROUTES = [
  "/dashboard",
  "/dashboard/complaints",
  "/dashboard/complaints/new",
];

export default function RoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      // Do not render protected dashboard pages until a token exists.
      const token = localStorage.getItem("sddms_access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response: any = await authApi.me();
        const user = response?.data ?? response;

        if (!mounted) return;

        localStorage.setItem(
          "sddms_user",
          JSON.stringify(user),
        );

        if (
          user?.role === "NORMAL_USER" &&
          !NORMAL_USER_ROUTES.some(
            (allowedPath) =>
              path === allowedPath ||
              path.startsWith(`${allowedPath}/`),
          )
        ) {
          router.replace("/dashboard");
          return;
        }

        setReady(true);
      } catch (error) {
        console.error("Dashboard authentication failed:", error);

        if (mounted) {
          localStorage.removeItem("sddms_access_token");
          localStorage.removeItem("sddms_user");
          router.replace("/login");
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [path, router]);

  if (!ready) {
    return <Loading />;
  }

  return <>{children}</>;
}

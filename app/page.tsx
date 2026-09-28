import { redirect } from "next/navigation";

export default function Home() {
  redirect(
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ? "/dashboard" : "/login"
  );
}

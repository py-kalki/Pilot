import { redirect } from "next/navigation";

/**
 * Root of app.usepilot.lat — redirects to /login.
 * Once auth middleware is in place, authenticated users
 * will be redirected to /dashboard instead.
 */
export default function RootPage() {
  redirect("/login");
}

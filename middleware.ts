import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  // Exclude PWA assets (sw.js, manifest) so the auth guard doesn't redirect them
  // to /login — otherwise the service worker/manifest can't load and the app
  // becomes uninstallable. demo.html is public by design: it's the "coba tanpa
  // akun" demo linked from the login screen, and runs on sample data only.
  matcher: ["/((?!login|demo\\.html|api/auth|api/version|_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:png|jpg|jpeg|svg|ico|js|json|webmanifest)).*)"],
};

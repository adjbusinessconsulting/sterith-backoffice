import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  // Exclude PWA assets (sw.js, manifest) so the auth guard doesn't redirect them
  // to /login — otherwise the service worker/manifest can't load and the app
  // becomes uninstallable.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|.*\\.(?:png|jpg|jpeg|svg|ico|js|json|webmanifest)).*)"],
};

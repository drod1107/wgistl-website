import { useRouter } from "next/router";
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();



export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/(api|trpc)(.*)'],
};

export const publicRoutes = ["/", "/login", "/sign-up"];

export function PublicRoute() {
  const router = useRouter();

  if (publicRoutes.includes(router.pathname)) {
    return null; // Allow access to public routes
  }

  return clerkMiddleware(); // Protect other routes
}

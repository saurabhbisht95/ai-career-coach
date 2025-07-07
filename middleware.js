import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",

])

export default clerkMiddleware( async(auth, req) =>{
  const { userId } = await auth()

  if(!userId && isProtectedRoute(req)){
    const { redirectToSignIn } = await auth()

    return redirectToSignIn()
  }

  return NextResponse.next()
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // Match everything except static files
  ],
};

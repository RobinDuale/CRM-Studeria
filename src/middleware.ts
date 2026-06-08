export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/contacts/:path*", "/products/:path*", "/pipeline/:path*", "/invoices/:path*", "/settings/:path*", "/analytics/:path*"],
};

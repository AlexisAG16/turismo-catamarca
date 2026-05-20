import { NextResponse } from "next/server";

const rutasPrivadas = ["/admin", "/itinerario"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const esRutaPrivada = rutasPrivadas.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  );

  if (!esRutaPrivada) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/itinerario/:path*"],
};

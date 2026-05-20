import { verificarToken } from "@/lib/authMiddleware";

export const runtime = "nodejs";

export async function GET(request) {
  const auth = verificarToken(request);

  if (!auth.autorizado) {
    return Response.json({ mensaje: auth.mensaje }, { status: auth.status });
  }

  return Response.json(
    {
      usuario: auth.usuario,
    },
    { status: 200 }
  );
}

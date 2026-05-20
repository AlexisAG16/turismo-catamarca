import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // !! ADVERTENCIA !!
    // Esto permite que los despliegues en producción terminen con éxito
    // aunque tu proyecto tenga errores de TypeScript.
    ignoreBuildErrors: true,
    },
};

export default nextConfig;

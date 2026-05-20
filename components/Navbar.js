"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ITINERARIO_KEY = "itinerario";

const linksPublicos = [
  { href: "/", label: "Inicio" },
  { href: "/circuitos", label: "Explorar Circuitos" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/soporte", label: "Soporte" },
];

const linksAdmin = [
  { href: "/circuitos", label: "Cargar Circuito" },
  { href: "/atractivos", label: "Cargar Atractivo" },
  { href: "/actividades", label: "Cargar Actividad" },
];

function leerCookie(nombre) {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${nombre}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

export default function Navbar() {
  const router = useRouter();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [itinerario, setItinerario] = useState([]);
  const [modalItinerarioAbierto, setModalItinerarioAbierto] = useState(false);

  const isAdmin = isLoggedIn && usuario?.rol === "admin";
  const puedeUsarItinerario = isLoggedIn && usuario?.rol === "usuario";

  useEffect(() => {
    async function cargarEstadoVisual() {
      const token = leerCookie("token");
      const autenticado = Boolean(token);

      if (!autenticado) {
        setIsLoggedIn(false);
        setUsuario(null);
        setItinerario([]);
        setAdminAbierto(false);
        setModalItinerarioAbierto(false);
        localStorage.removeItem("usuario");
        localStorage.removeItem(ITINERARIO_KEY);
        return;
      }

      try {
        const sessionResponse = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok) {
          throw new Error(sessionData.mensaje || "Sesion invalida.");
        }

        setIsLoggedIn(true);
        setUsuario(sessionData.usuario);
        localStorage.setItem("usuario", JSON.stringify(sessionData.usuario));

        if (sessionData.usuario?.rol !== "usuario") {
          setItinerario([]);
          localStorage.removeItem(ITINERARIO_KEY);
          return;
        }

        const itinerarioResponse = await fetch("/api/itinerario", {
          cache: "no-store",
        });
        const itinerarioData = await itinerarioResponse.json();

        if (!itinerarioResponse.ok) {
          throw new Error(
            itinerarioData.mensaje || "No se pudo cargar el itinerario."
          );
        }

        const nuevoItinerario = Array.isArray(itinerarioData.itinerario)
          ? itinerarioData.itinerario
          : [];
        setItinerario(nuevoItinerario);
        localStorage.setItem(ITINERARIO_KEY, JSON.stringify(nuevoItinerario));
      } catch {
        setIsLoggedIn(false);
        setUsuario(null);
        setItinerario([]);
        setAdminAbierto(false);
        setModalItinerarioAbierto(false);
        localStorage.removeItem("usuario");
        localStorage.removeItem(ITINERARIO_KEY);
      }
    }

    cargarEstadoVisual();
    window.addEventListener("focus", cargarEstadoVisual);
    window.addEventListener("storage", cargarEstadoVisual);
    window.addEventListener("itinerario-actualizado", cargarEstadoVisual);

    return () => {
      window.removeEventListener("focus", cargarEstadoVisual);
      window.removeEventListener("storage", cargarEstadoVisual);
      window.removeEventListener("itinerario-actualizado", cargarEstadoVisual);
    };
  }, []);

  function cerrarMenus() {
    setMenuMovilAbierto(false);
    setAdminAbierto(false);
    setModalItinerarioAbierto(false);
  }

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem(ITINERARIO_KEY);
    setIsLoggedIn(false);
    setUsuario(null);
    cerrarMenus();
    router.push("/");
    router.refresh();
  }

  function alternarItinerario() {
    setAdminAbierto(false);
    setModalItinerarioAbierto((abierto) => !abierto);
  }

  function renderLink(link, mobile = false) {
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={cerrarMenus}
        className={
          mobile
            ? "rounded-md px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            : "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
        }
      >
        {link.label}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="relative mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-4 py-3 lg:px-6">
        <Link
          href="/"
          onClick={cerrarMenus}
          className="shrink-0 text-lg font-semibold tracking-tight text-zinc-950"
        >
          Turismo Catamarca
        </Link>

        <div className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
          {linksPublicos.map((link) => renderLink(link))}

          {isAdmin && (
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => {
                  setModalItinerarioAbierto(false);
                  setAdminAbierto((abierto) => !abierto);
                }}
                className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                aria-expanded={adminAbierto}
              >
                Gestion Admin
                <span aria-hidden="true" className="text-xs">
                  v
                </span>
              </button>

              {adminAbierto && (
                <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white p-2 shadow-xl">
                  {linksAdmin.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={cerrarMenus}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          {puedeUsarItinerario && (
            <>
              <span className="max-w-36 truncate text-sm font-medium text-zinc-700">
                {usuario?.nombre || "Usuario"}
              </span>
              <button
                type="button"
                onClick={alternarItinerario}
                className="relative inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
              >
                <span aria-hidden="true">*</span>
                Mi Itinerario
                {itinerario.length > 0 && (
                  <span className="ml-1 rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-semibold text-white">
                    {itinerario.length}
                  </span>
                )}
              </button>
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link
                href="/login"
                onClick={cerrarMenus}
                className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Iniciar Sesion
              </Link>
              <Link
                href="/register"
                onClick={cerrarMenus}
                className="whitespace-nowrap rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <>
              {!puedeUsarItinerario && (
                <span className="max-w-36 truncate text-sm font-medium text-zinc-700">
                  {usuario?.nombre || "Usuario"}
                  {isAdmin ? " - Admin" : ""}
                </span>
              )}
              <button
                type="button"
                onClick={logout}
                className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Cerrar Sesion
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setAdminAbierto(false);
            setModalItinerarioAbierto(false);
            setMenuMovilAbierto((abierto) => !abierto);
          }}
          className="ml-auto flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-zinc-300 lg:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuMovilAbierto}
        >
          <span className={`h-0.5 w-6 rounded bg-zinc-900 transition-all duration-300 ${menuMovilAbierto ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 rounded bg-zinc-900 transition-all duration-300 ${menuMovilAbierto ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 rounded bg-zinc-900 transition-all duration-300 ${menuMovilAbierto ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>

        {menuMovilAbierto && (
          <div className="absolute left-0 top-full z-50 w-full bg-slate-900 px-4 py-4 shadow-xl lg:hidden">
            <div className="flex flex-col gap-1">
              {linksPublicos.map((link) => renderLink(link, true))}

              {isAdmin && (
                <div className="mt-3 border-t border-slate-700 pt-3">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Gestion Admin
                  </p>
                  <div className="flex flex-col gap-1">
                    {linksAdmin.map((link) => renderLink(link, true))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-slate-700 pt-4">
              {!isLoggedIn ? (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    onClick={cerrarMenus}
                    className="rounded-md border border-slate-600 px-3 py-2 text-center text-sm font-medium text-slate-100"
                  >
                    Iniciar Sesion
                  </Link>
                  <Link
                    href="/register"
                    onClick={cerrarMenus}
                    className="rounded-md bg-emerald-700 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2">
                  <p className="px-3 text-sm font-medium text-slate-200">
                    {usuario?.nombre || "Usuario"}
                    {isAdmin ? " - Admin" : ""}
                  </p>
                  {puedeUsarItinerario && (
                    <button
                      type="button"
                      onClick={alternarItinerario}
                      className="rounded-md border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-100"
                    >
                      Mi Itinerario ({itinerario.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-md border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-100"
                  >
                    Cerrar Sesion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {modalItinerarioAbierto && (
          <div className="absolute right-4 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl lg:right-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-950">Mi Itinerario</h2>
              <span className="text-xs text-zinc-500">{itinerario.length}</span>
            </div>

            {itinerario.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Todavia no agregaste atractivos.
              </p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-auto">
                {itinerario.map((atractivo) => (
                  <li
                    key={atractivo._id}
                    className="rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-zinc-950">
                      {atractivo.nombre}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {atractivo.departamento || "Catamarca"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

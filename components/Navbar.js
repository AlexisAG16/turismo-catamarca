"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { emitirToast } from "@/components/toastBus";

const ITINERARIO_KEY = "itinerario";
const TEMA_KEY = "tema";
const TEMA_EVENT = "tema-actualizado";

const linksPublicos = [
  { href: "/", label: "Inicio" },
  { href: "/circuitos", label: "Circuitos" },
  { href: "/atractivos", label: "Atractivos" },
  { href: "/actividades", label: "Actividades" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
  { href: "/soporte", label: "Soporte" },
];

function leerCookie(nombre) {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${nombre}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

function leerJsonLocal(clave, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const valor = window.localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : fallback;
  } catch {
    return fallback;
  }
}

function leerTema() {
  if (typeof window === "undefined") return "light";

  const temaGuardado = window.localStorage.getItem(TEMA_KEY);
  if (temaGuardado === "dark" || temaGuardado === "light") return temaGuardado;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function suscribirTema(callback) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(TEMA_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(TEMA_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function IconoFavorito({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function IconoQuitar({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function IconoSol({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconoLuna({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M20.99 12.79A9 9 0 1 1 11.21 3.01 7 7 0 0 0 20.99 12.79z" />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [itinerario, setItinerario] = useState([]);
  const [actualizandoItinerario, setActualizandoItinerario] = useState("");
  const [modalItinerarioAbierto, setModalItinerarioAbierto] = useState(false);
  const tema = useSyncExternalStore(suscribirTema, leerTema, () => "light");

  const isAdmin = isLoggedIn && usuario?.rol === "admin";
  const puedeUsarItinerario = isLoggedIn && usuario?.rol === "usuario";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
  }, [tema]);

  useEffect(() => {
    async function cargarEstadoVisual() {
      const token = leerCookie("token");
      const autenticado = Boolean(token);

      if (!autenticado) {
        setIsLoggedIn(false);
        setUsuario(null);
        setItinerario([]);
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
          throw new Error(sessionData.mensaje || "Sesión inválida.");
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

        sincronizarItinerario(itinerarioData.itinerario);
      } catch {
        setIsLoggedIn(false);
        setUsuario(null);
        setItinerario([]);
        setModalItinerarioAbierto(false);
        localStorage.removeItem("usuario");
        localStorage.removeItem(ITINERARIO_KEY);
      }
    }

    function sincronizarDesdeLocalStorage() {
      setUsuario(leerJsonLocal("usuario", null));
      setItinerario(leerJsonLocal(ITINERARIO_KEY, []));
    }

    cargarEstadoVisual();
    window.addEventListener("focus", cargarEstadoVisual);
    window.addEventListener("storage", sincronizarDesdeLocalStorage);
    window.addEventListener("itinerario-actualizado", sincronizarDesdeLocalStorage);

    return () => {
      window.removeEventListener("focus", cargarEstadoVisual);
      window.removeEventListener("storage", sincronizarDesdeLocalStorage);
      window.removeEventListener("itinerario-actualizado", sincronizarDesdeLocalStorage);
    };
  }, []);

  function cerrarMenus() {
    setMenuMovilAbierto(false);
    setModalItinerarioAbierto(false);
  }

  function sincronizarItinerario(nuevoItinerario) {
    const valores = Array.isArray(nuevoItinerario) ? nuevoItinerario : [];
    setItinerario(valores);
    localStorage.setItem(ITINERARIO_KEY, JSON.stringify(valores));
  }

  function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem(ITINERARIO_KEY);
    setIsLoggedIn(false);
    setUsuario(null);
    cerrarMenus();
    emitirToast("Sesión cerrada correctamente.", "success");
    router.push("/");
    router.refresh();
  }

  function alternarItinerario() {
    setModalItinerarioAbierto((abierto) => !abierto);
  }

  function alternarTema() {
    const nuevoTema = tema === "dark" ? "light" : "dark";
    localStorage.setItem(TEMA_KEY, nuevoTema);
    document.documentElement.classList.toggle("dark", nuevoTema === "dark");
    window.dispatchEvent(new Event(TEMA_EVENT));
  }

  async function eliminarDelItinerario(atractivoId) {
    if (!atractivoId) return;

    setActualizandoItinerario(atractivoId);

    try {
      const response = await fetch(
        `/api/itinerario?atractivoId=${encodeURIComponent(atractivoId)}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo quitar el atractivo.");
      }

      sincronizarItinerario(data.itinerario);
      window.dispatchEvent(new Event("itinerario-actualizado"));
      emitirToast("Atractivo quitado del itinerario.", "success");
    } catch (error) {
      emitirToast(error.message || "No se pudo actualizar el itinerario.", "error");
    } finally {
      setActualizandoItinerario("");
    }
  }

  async function vaciarItinerario() {
    if (itinerario.length === 0) return;

    setActualizandoItinerario("todos");

    try {
      const response = await fetch("/api/itinerario", { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "No se pudo vaciar el itinerario.");
      }

      sincronizarItinerario(data.itinerario);
      window.dispatchEvent(new Event("itinerario-actualizado"));
      emitirToast("Itinerario vaciado correctamente.", "success");
    } catch (error) {
      emitirToast(error.message || "No se pudo actualizar el itinerario.", "error");
    } finally {
      setActualizandoItinerario("");
    }
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

  function renderInformeLink(mobile = false) {
    if (!isAdmin) return null;

    return (
      <a
        href="/api/informes/excel"
        onClick={cerrarMenus}
        className={
          mobile
            ? "rounded-md px-3 py-2 text-sm font-semibold text-emerald-200 hover:bg-slate-800"
            : "whitespace-nowrap rounded-md border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
        }
      >
        Informe
      </a>
    );
  }

  function renderThemeButton(mobile = false) {
    return (
      <button
        type="button"
        onClick={alternarTema}
        className={
          mobile
            ? "flex items-center justify-between rounded-md border border-slate-600 px-3 py-2 text-sm font-medium text-slate-100"
            : "inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 px-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
        }
        aria-label={tema === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
        title={tema === "dark" ? "Modo claro" : "Modo oscuro"}
      >
        <span className="inline-flex items-center gap-1">
          <IconoSol className={tema === "dark" ? "h-4 w-4 opacity-45" : "h-4 w-4 text-amber-500"} />
          <IconoLuna className={tema === "dark" ? "h-4 w-4 text-sky-300" : "h-4 w-4 opacity-45"} />
        </span>
        {mobile && <span>{tema === "dark" ? "Modo oscuro" : "Modo claro"}</span>}
      </button>
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
          {renderInformeLink()}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
          {renderThemeButton()}

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
                <IconoFavorito className="h-4 w-4 text-rose-600" />
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
                Iniciar sesión
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
                Cerrar sesión
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setModalItinerarioAbierto(false);
            setMenuMovilAbierto((abierto) => !abierto);
          }}
          className="ml-auto flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-zinc-300 lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={menuMovilAbierto}
        >
          <span className={`h-0.5 w-6 rounded bg-zinc-900 transition-all duration-300 dark:bg-white ${menuMovilAbierto ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 rounded bg-zinc-900 transition-all duration-300 dark:bg-white ${menuMovilAbierto ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 rounded bg-zinc-900 transition-all duration-300 dark:bg-white ${menuMovilAbierto ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>

        {menuMovilAbierto && (
          <div className="absolute left-0 top-full z-50 w-full bg-slate-900 px-4 py-4 shadow-xl lg:hidden">
            <div className="flex flex-col gap-1">
              {linksPublicos.map((link) => renderLink(link, true))}
              {renderInformeLink(true)}
            </div>

            <div className="mt-4 border-t border-slate-700 pt-4">
              <div className="mb-2">
                {renderThemeButton(true)}
              </div>

              {!isLoggedIn ? (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    onClick={cerrarMenus}
                    className="rounded-md border border-slate-600 px-3 py-2 text-center text-sm font-medium text-slate-100"
                  >
                    Iniciar sesión
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
                      className="flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-100"
                    >
                      <IconoFavorito className="h-4 w-4 text-rose-300" />
                      Mi Itinerario ({itinerario.length})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-md border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {modalItinerarioAbierto && (
          <div className="absolute right-4 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-80 rounded-lg border border-zinc-200 bg-white p-4 shadow-xl lg:right-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconoFavorito className="h-4 w-4 text-rose-600" />
                <h2 className="text-sm font-semibold text-zinc-950">Mi Itinerario</h2>
              </div>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                {itinerario.length}
              </span>
            </div>

            {itinerario.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Todavía no agregaste atractivos.
              </p>
            ) : (
              <>
                <ul className="max-h-72 space-y-2 overflow-auto pr-1">
                  {itinerario.map((atractivo) => (
                    <li
                      key={atractivo._id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-zinc-100 bg-zinc-50 px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-950">
                          {atractivo.nombre}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {atractivo.departamento || "Catamarca"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarDelItinerario(atractivo._id)}
                        disabled={Boolean(actualizandoItinerario)}
                        className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1 rounded-md border border-red-200 px-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Quitar ${atractivo.nombre} del itinerario`}
                        title="Quitar del itinerario"
                      >
                        <IconoQuitar />
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={vaciarItinerario}
                  disabled={Boolean(actualizandoItinerario)}
                  className="mt-3 w-full rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actualizandoItinerario === "todos"
                    ? "Vaciando..."
                    : "Vaciar itinerario"}
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

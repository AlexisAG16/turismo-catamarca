import Link from "next/link";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLocationDot,
  FaXTwitter,
} from "react-icons/fa6";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/",
    icon: FaFacebookF,
  },
  {
    name: "X",
    href: "https://x.com/",
    icon: FaXTwitter,
  },
  {
    name: "GitHub",
    href: "https://github.com/AlexisAG16/turismo-catamarca",
    icon: FaGithub,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/",
    icon: FaInstagram,
  },
];

const navigationLinks = [
  { name: "Atractivos", href: "/atractivos" },
  { name: "Circuitos", href: "/circuitos" },
  { name: "Actividades", href: "/actividades" },
  { name: "Contacto", href: "/contacto" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <Link
            href="/"
            className="text-lg font-bold text-zinc-950 transition-colors hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
          >
            Turismo Catamarca
          </Link>
          <p className="mt-3 text-sm leading-6">
            Descubrí atractivos, circuitos y actividades para recorrer la
            diversidad natural y cultural de Catamarca.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            <FaLocationDot aria-hidden="true" className="text-emerald-700 dark:text-emerald-400" />
            Catamarca, Argentina
          </p>
        </div>

        <nav aria-label="Enlaces del pie de página">
          <h2 className="text-sm font-bold uppercase text-zinc-950 dark:text-white">
            Explorar
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {navigationLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase text-zinc-950 dark:text-white">
            Seguinos
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {socialLinks.map(({ name, href, icon: Icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                title={name}
                className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-300 bg-white text-zinc-800 transition-colors hover:border-emerald-700 hover:bg-emerald-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-emerald-500 dark:hover:bg-emerald-500 dark:hover:text-zinc-950"
              >
                <Icon aria-hidden="true" className="size-4" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            Verificá horarios, accesos y condiciones antes de realizar cada
            recorrido.
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-4 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {currentYear} Turismo Catamarca. Todos los derechos reservados.</p>
          <p>Información turística de la provincia de Catamarca.</p>
        </div>
      </div>
    </footer>
  );
}

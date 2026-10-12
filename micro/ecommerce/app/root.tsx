import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  useRouteError,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs sticky top-0 z-10">
          <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-sm font-semibold">Micro</span>
              <span>Shop</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link to="/products" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                Catalog
              </Link>
              <Link to="/cart" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                Cart
              </Link>
              <Link to="/orders" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
                Orders
              </Link>
              <Link to="/architecture" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                Architecture
              </Link>
            </div>
          </nav>
        </header>

        <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
          {children}
        </main>

        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-sm text-slate-500 dark:text-slate-400 text-center">
            Microservice Architecture Demo — Node.js Microservices + PostgreSQL (Docker) + React Router Frontend
          </div>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let title = "Error";
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === 'string' ? error.data : error.data?.message || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-lg shadow-xs">
      <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed whitespace-pre-line">
        {message}
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Return Home
        </Link>
        <Link
          to="/architecture"
          className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Check Architecture Status
        </Link>
      </div>
    </div>
  );
}

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  Link,
  data,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { getSessionId } from "./session.server";
import { getCart } from "./services/cart.server";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { sessionId, headers } = getSessionId(request);
  const cartSummary = await getCart(sessionId);

  return data(
    {
      cartCount: cartSummary.itemCount,
    },
    { headers }
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartItemCount={loaderData?.cartCount ?? 0} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 - Page Not Found" : "Application Error";
    details =
      error.status === 404
        ? "The page you are looking for does not exist in this monolithic store."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar cartItemCount={0} />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex p-4 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{message}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">{details}</p>
        
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition shadow-md"
          >
            Back to Home
          </Link>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-xl transition"
          >
            Browse Products
          </Link>
        </div>

        {stack && (
          <div className="mt-12 text-left bg-gray-900 text-rose-300 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <p className="font-bold text-rose-400 mb-2">Stack Trace (Development Mode):</p>
            <pre>{stack}</pre>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

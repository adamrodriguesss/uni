import type { Route } from "./+types/architecture";
import { fetchFromGateway } from "../lib/api.server";
import { Link } from "react-router";

export async function loader() {
  const services = [
    { name: "API Gateway", port: "4000", url: "/health" },
    { name: "Search Service", port: "4001", url: "/api/search/health" },
    { name: "Home Service", port: "4002", url: "/api/home/health" },
    { name: "Cart Service", port: "4003", url: "/api/cart/health" },
    { name: "Checkout Service", port: "4004", url: "/api/checkout/health" },
  ];

  const healthChecks = await Promise.all(
    services.map(async (svc) => {
      try {
        const res = await fetchFromGateway(svc.url);
        return { name: svc.name, port: svc.port, status: "UP" as const, data: res, error: null };
      } catch (e: any) {
        return { name: svc.name, port: svc.port, status: "DOWN" as const, data: null, error: e.message };
      }
    })
  );

  return { healthChecks };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "MicroShop - System Architecture" }];
}

export default function Architecture({ loaderData }: Route.ComponentProps) {
  const { healthChecks } = loaderData;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Microservice Architecture</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Live inspection and system topology for all decoupled services and Docker databases.
        </p>
      </div>
      
      {/* Live Health Status */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Service Health</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Refreshes on page load</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthChecks.map((h) => (
            <div 
              key={h.name} 
              className={`p-5 rounded-xl border transition-all ${
                h.status === 'UP' 
                  ? 'bg-white dark:bg-slate-900 border-green-200 dark:border-green-800/60 shadow-xs' 
                  : 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-800/60 shadow-xs'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{h.name}</h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Port {h.port}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  h.status === 'UP' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300'
                }`}>
                  {h.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-3 break-all">
                {h.status === 'UP' ? JSON.stringify(h.data) : 'Offline or unreachable'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Breakdown Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Specifications</h2>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold">Service Name</th>
                  <th className="p-4 font-semibold">Port</th>
                  <th className="p-4 font-semibold">Database (Docker)</th>
                  <th className="p-4 font-semibold">Responsibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                <tr>
                  <td className="p-4 font-medium">API Gateway</td>
                  <td className="p-4 font-mono text-xs">4000</td>
                  <td className="p-4 text-slate-400">None (Stateless)</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Reverse proxy, routes frontend requests to microservices</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Search Service</td>
                  <td className="p-4 font-mono text-xs">4001</td>
                  <td className="p-4 font-mono text-xs text-blue-600 dark:text-blue-400">search_db (:5433)</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Product catalog search, category filtering &amp; details</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Home Feed Service</td>
                  <td className="p-4 font-mono text-xs">4002</td>
                  <td className="p-4 font-mono text-xs text-green-600 dark:text-green-400">home_db (:5434)</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Curated homepage feeds and featured product ordering</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Cart Service</td>
                  <td className="p-4 font-mono text-xs">4003</td>
                  <td className="p-4 font-mono text-xs text-amber-600 dark:text-amber-400">cart_db (:5435)</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Session-based shopping cart item persistence &amp; totals</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Checkout Service</td>
                  <td className="p-4 font-mono text-xs">4004</td>
                  <td className="p-4 font-mono text-xs text-purple-600 dark:text-purple-400">checkout_db (:5436)</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">Distributed checkout saga &amp; order history management</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

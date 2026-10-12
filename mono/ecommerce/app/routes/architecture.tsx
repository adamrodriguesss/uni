import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/architecture";
import { getDb } from "../db/db.server";
import {
  DatabaseIcon,
  LayersIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PackageIcon,
} from "../components/icons";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Monolithic Architecture Blueprint | MonoStore" },
    {
      name: "description",
      content:
        "Technical breakdown and live PostgreSQL database inspector for the monolithic e-commerce application.",
    },
  ];
}

export async function loader() {
  const db = await getDb();

  const [productsRes, categoriesRes, ordersRes, revenueRes] = await Promise.all([
    db.query<{ count: string }>("SELECT COUNT(*) as count FROM products"),
    db.query<{ count: string }>("SELECT COUNT(*) as count FROM categories"),
    db.query<{ count: string }>("SELECT COUNT(*) as count FROM orders"),
    db.query<{ total: string }>("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders"),
  ]);

  const stats = {
    productCount: parseInt(productsRes.rows[0]?.count || "0", 10),
    categoryCount: parseInt(categoriesRes.rows[0]?.count || "0", 10),
    orderCount: parseInt(ordersRes.rows[0]?.count || "0", 10),
    totalRevenue: parseFloat(revenueRes.rows[0]?.total || "0"),
    dbEngine: process.env.DATABASE_URL ? "PostgreSQL (External / Remote URL)" : "PostgreSQL (Embedded Persistent Engine)",
    runtimeMode: "Single Monolithic Process",
  };

  return { stats };
}

export default function ArchitecturePage() {
  const { stats } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
          <LayersIcon className="w-3.5 h-3.5" /> Architecture Specification &amp; Live Telemetry
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Monolithic E-Commerce Architecture
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          A unified, high-cohesion architectural model where all business domains, controllers, and PostgreSQL persistence operate within a single deployment container.
        </p>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <PackageIcon className="w-4 h-4" /> Products in DB
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.productCount}</div>
          <div className="text-[11px] text-gray-500">Across {stats.categoryCount} categories</div>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckCircleIcon className="w-4 h-4" /> Orders Placed
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.orderCount}</div>
          <div className="text-[11px] text-gray-500">${stats.totalRevenue.toFixed(2)} total revenue</div>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <DatabaseIcon className="w-4 h-4" /> Database Engine
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white truncate">PostgreSQL</div>
          <div className="text-[11px] text-gray-500 truncate">{stats.dbEngine}</div>
        </div>

        <div className="bg-white dark:bg-gray-800/80 p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-xs">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LayersIcon className="w-4 h-4" /> Deployment Unit
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">1 Process</div>
          <div className="text-[11px] text-gray-500">In-process TypeScript calls</div>
        </div>
      </div>

      {/* Layer Architecture Diagram */}
      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200 dark:border-gray-700/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          System Layer Breakdown
        </h2>

        <div className="space-y-4">
          {/* Layer 1 */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                Layer 1: Presentation &amp; SSR
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                React 19 + React Router SSR Controllers
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Route loaders, server actions, and JSX components render unified UI views server-side with zero hydration overhead.
              </p>
            </div>
            <div className="text-xs font-mono bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 border border-indigo-100 dark:border-indigo-900 flex-shrink-0">
              app/routes/*.tsx
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                Layer 2: Domain Business Logic (In-Process)
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                CatalogService, CartService, OrderService
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Domain services call each other via direct TypeScript method invocations without REST/gRPC networking or serialization penalties.
              </p>
            </div>
            <div className="text-xs font-mono bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 border border-sky-100 dark:border-sky-900 flex-shrink-0">
              app/services/*.server.ts
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Layer 3: Single PostgreSQL Data Layer
              </span>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">
                Relational Schema &amp; Transaction Coordinator
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                Unified relational storage ensuring atomic stock reservation, row locking (<code className="font-mono text-[11px]">FOR UPDATE</code>), and zero distributed consistency drift.
              </p>
            </div>
            <div className="text-xs font-mono bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl text-gray-700 dark:text-gray-300 border border-emerald-100 dark:border-emerald-900 flex-shrink-0">
              app/db/schema.sql
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table: Monolith vs Microservices */}
      <div className="bg-white dark:bg-gray-800/80 rounded-3xl border border-gray-200 dark:border-gray-700/80 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Monolithic vs Microservice Architecture Comparison
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Why a monolithic architecture is often faster and simpler to develop, test, and maintain.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-6">Dimension</th>
                <th className="py-3 px-6 text-indigo-600 dark:text-indigo-400">MonoStore (Monolith)</th>
                <th className="py-3 px-6 text-gray-500">Microservices Pattern</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Inter-Service Latency</td>
                <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                  0ms (Direct in-memory function call)
                </td>
                <td className="py-4 px-6">5-50ms+ (HTTP/gRPC network serialization per hop)</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Transaction Safety</td>
                <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                  Native PostgreSQL ACID (BEGIN / COMMIT)
                </td>
                <td className="py-4 px-6">Complex Saga pattern / 2-phase commits with eventual consistency</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Deployment Complexity</td>
                <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                  Single container / process deployment
                </td>
                <td className="py-4 px-6">Kubernetes cluster, service mesh, API gateways, load balancers</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Codebase &amp; Types</td>
                <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                  Unified TypeScript types across all modules
                </td>
                <td className="py-4 px-6">Schema repositories, protobuf generation, version drift</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">Database Management</td>
                <td className="py-4 px-6 font-medium text-emerald-600 dark:text-emerald-400">
                  Single PostgreSQL instance with relational joins
                </td>
                <td className="py-4 px-6">Multiple disparate databases requiring distributed queries</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct DB Insertion Guide */}
      <div className="bg-gray-900 text-gray-100 rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <DatabaseIcon className="w-4 h-4" /> Adding Items Directly to Database
        </div>
        <h3 className="text-xl font-bold text-white">How to Insert New Products in PostgreSQL</h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          Because this is a pure monolithic architecture backed by PostgreSQL, you can insert new products, change inventory counts, or query orders directly with standard SQL statements:
        </p>

        <pre className="bg-black/60 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-gray-800 leading-relaxed">
{`-- Insert a new product directly into PostgreSQL:
INSERT INTO products (name, slug, description, price, category_id, image_url, stock, rating, featured)
VALUES (
  'Studio Monitor Headphones',
  'studio-monitor-headphones',
  'Professional mixing studio headphones with 50mm dynamic drivers.',
  199.99,
  (SELECT id FROM categories WHERE slug = 'audio'),
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  40,
  4.95,
  true
);

-- Update inventory stock directly:
UPDATE products SET stock = stock + 50 WHERE slug = 'studio-monitor-headphones';`}
        </pre>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-600/20"
        >
          <span>Browse the Storefront</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}


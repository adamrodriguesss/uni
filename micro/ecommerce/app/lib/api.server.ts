const GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function fetchFromGateway(path: string, options: RequestInit = {}) {
  const url = `${GATEWAY_URL}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`API Gateway (${path}) returned HTTP ${res.status}: ${errorText || res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    if (err.cause?.code === 'ECONNREFUSED' || err.message?.includes('fetch failed')) {
      throw new Error(`Cannot connect to API Gateway at ${GATEWAY_URL}. Ensure all backend microservices are running (run 'npm run dev' in the micro/ directory).`);
    }
    throw err;
  }
}

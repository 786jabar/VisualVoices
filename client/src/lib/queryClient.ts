import { QueryClient, QueryFunction } from "@tanstack/react-query";

interface ApiRequestOptions extends RequestInit {
  body?: any;
}

// Helper function to normalize URL (string) or RequestInfo object with URL
function normalizeUrlOrRequest(urlOrRequest: string | RequestInfo): RequestInfo {
  return urlOrRequest;
}

// Helper to throw errors for non-ok responses
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Enhanced API request function that supports both string URL + method or request options object
export async function apiRequest<T = any>(
  urlOrRequest: string | RequestInfo,
  options?: ApiRequestOptions
): Promise<T> {
  let fetchOptions: RequestInit = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options
  };
  
  // If body is an object, stringify it
  if (options?.body && typeof options.body === 'object') {
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  // Make the request
  const res = await fetch(normalizeUrlOrRequest(urlOrRequest), fetchOptions);
  
  // Check for errors
  await throwIfResNotOk(res);
  
  // Parse JSON response
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json() as Promise<T>;
  }
  
  return res as unknown as T;
}

// Legacy method (for backward compatibility)
export async function legacyApiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  return fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Custom function to generate poetic summary using the backend
export async function generatePoeticSummary(transcription: string): Promise<string> {
  const data = await apiRequest<{summary: string}>("/api/generate-summary", {
    method: "POST",
    body: { transcription }
  });
  return data.summary;
}

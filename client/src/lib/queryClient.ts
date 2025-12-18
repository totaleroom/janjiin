/**
 * =============================================================================
 * QUERY CLIENT - Janji.in Booking Platform
 * =============================================================================
 * 
 * This module configures TanStack React Query for API data fetching.
 * 
 * FEATURES:
 * - Centralized API request handling
 * - Error parsing from JSON responses
 * - 401 Unauthorized handling options
 * - Query caching and invalidation
 * 
 * API REQUEST FUNCTION:
 * ```typescript
 * // Simple GET request
 * const res = await apiRequest("GET", "/api/users");
 * const users = await res.json();
 * 
 * // POST request with body
 * const res = await apiRequest("POST", "/api/auth/login", { 
 *   email: "test@example.com", 
 *   password: "password" 
 * });
 * ```
 * 
 * QUERY FUNCTION USAGE:
 * ```typescript
 * // Using with React Query hook
 * const { data } = useQuery({
 *   queryKey: ["/api/users"],
 *   queryFn: getQueryFn({ on401: "returnNull" })
 * });
 * ```
 * 
 * DEBUGGING:
 * - Check Network tab for actual request/response
 * - Error messages are parsed from JSON { message: "..." } format
 * - 401 errors can return null or throw based on configuration
 * 
 * @file client/src/lib/queryClient.ts
 * @author Janji.in Team
 * =============================================================================
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Check response status and throw error with parsed message if not OK
 * Attempts to parse JSON error message from response body
 * @param res - Fetch Response object
 * @throws Error with message from response or status text
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.message || res.statusText);
    } catch {
      throw new Error(text || res.statusText);
    }
  }
}

/**
 * Make an API request with proper headers and error handling
 * @param method - HTTP method (GET, POST, PATCH, DELETE)
 * @param url - API endpoint URL
 * @param data - Optional request body (will be JSON stringified)
 * @returns Response object
 * @throws Error if response is not OK
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/** Behavior options for handling 401 Unauthorized responses */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Create a query function for React Query hooks
 * @param options - Configuration options
 * @param options.on401 - How to handle 401 responses: "returnNull" or "throw"
 * @returns Query function compatible with React Query
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

/**
 * Configured React Query client instance
 * 
 * Default settings:
 * - No automatic refetching on window focus
 * - Infinite stale time (manual invalidation required)
 * - No automatic retries on failure
 */
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

import { supabase } from "../lib/supabase";

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  statusCode?: number;
}

/**
 * Centered error mapping helper that translates Supabase / Postgres error codes
 * into elegant, high-clarity, user-friendly notifications.
 */
export function mapSupabaseError(error: { code?: string; message?: string; details?: string }): string {
  const code = String(error.code || "");
  const msg = String(error.message || "").toLowerCase();

  // PGRST205 / PGRST301: Missing Table or expired schema cache
  if (code === "PGRST205" || code === "PGRST301" || code === "42P01" || msg.includes("schema cache") || msg.includes("does not exist")) {
    return "The database schema is currently updating. Please wait a moment and try again.";
  }

  // 42501: RLS / Permission Denied
  if (code === "42501" || msg.includes("permission denied") || msg.includes("violates row-level security")) {
    return "You do not have permission to perform this action. Please sign in and try again.";
  }

  // 23505: Unique Constraint Violation (e.g. Slug already taken)
  if (code === "23505" || msg.includes("duplicate key") || msg.includes("already exists")) {
    if (msg.includes("slug")) {
      return "This custom link/slug is already taken. Please choose another one.";
    }
    return "This record already exists in the database.";
  }

  // 23503: Foreign Key Violation
  if (code === "23503" || msg.includes("foreign key")) {
    return "The request references an item that does not exist or has been deleted.";
  }

  // Fallback to error message or a generic clean notification
  return error.message || "An unexpected error occurred while communicating with the database.";
}

/**
 * Custom fetch client that handles automatic token injection,
 * detailed error logging, and friendly error code mapping.
 */
class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        headers["Authorization"] = `Bearer ${data.session.access_token}`;
      }
    } catch (err) {
      console.warn("Could not retrieve Supabase session token:", err);
    }

    return headers;
  }

  private logDetailedError(endpoint: string, status: number, data: any) {
    console.group(`🚨 [ApiClient Error] Fetch to ${endpoint} failed`);
    console.error(`HTTP Status: ${status}`);
    console.error("Payload/Details:", data);
    console.groupEnd();
  }

  /**
   * Generic request wrapper
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const config: RequestInit = {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(endpoint, config);
      
      let responseData: any;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }

      if (!response.ok) {
        this.logDetailedError(endpoint, response.status, responseData);
        
        // Extract code from backend error
        const errorCode = responseData.code || responseData.details?.code;
        const errorMessage = responseData.error || responseData.message;
        
        // Map common DB errors if code is available
        const friendlyMessage = mapSupabaseError({
          code: errorCode,
          message: errorMessage,
          details: responseData.details
        });

        const errorObj: ApiError = {
          message: friendlyMessage,
          code: errorCode,
          details: responseData.details,
          statusCode: response.status
        };
        throw errorObj;
      }

      return responseData as T;
    } catch (err: any) {
      if (err.message && err.statusCode) {
        // Already mapped ApiError
        throw err;
      }
      
      console.error(`🚨 [ApiClient Network/Crash] on ${endpoint}:`, err);
      throw {
        message: err.message || "Network error. Please check your internet connection.",
        statusCode: 500
      } as ApiError;
    }
  }

  public async get<T = any>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  public async post<T = any>(endpoint: string, body: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  public async put<T = any>(endpoint: string, body: any, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
  }

  public async delete<T = any>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

export const apiClient = new ApiClient();

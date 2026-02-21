function resolveApiBaseUrl(): string {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0'
    ) {
      return 'http://localhost:3000';
    }

    // In non-local environments, default to same-origin API routes.
    return '';
  }

  return 'http://localhost:3000';
}

const API_BASE_URL = resolveApiBaseUrl();

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

function toErrorMessage(errorBody: ApiErrorBody, fallback: string): string {
  if (Array.isArray(errorBody.message)) {
    return errorBody.message.join(', ');
  }

  if (typeof errorBody.message === 'string') {
    return errorBody.message;
  }

  if (typeof errorBody.error === 'string') {
    return errorBody.error;
  }

  return fallback;
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers ?? {});
  const hasBody = options.body !== undefined && options.body !== null;

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: options.cache ?? 'no-cache',
    });
  } catch {
    const target = API_BASE_URL || 'same-origin';
    throw new Error(
      `Unable to reach API at ${target}. Check backend deployment and VITE_API_BASE_URL.`,
    );
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const errorBody = (await response.json()) as ApiErrorBody;
        message = toErrorMessage(errorBody, message);
      } else {
        const responseText = await response.text();
        if (responseText.trim()) {
          message = responseText;
        }
      }
    } catch {
      // Keep the fallback status-based message when body parsing fails.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

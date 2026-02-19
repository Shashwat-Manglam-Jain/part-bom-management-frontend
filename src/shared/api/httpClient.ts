const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      message = toErrorMessage(errorBody, message);
    } catch {
      // Keep the fallback status-based message when body parsing fails.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

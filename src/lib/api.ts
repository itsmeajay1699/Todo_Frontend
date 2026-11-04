export class ApiError extends Error {
  readonly status: number
  readonly messages: string[]

  constructor(status: number, message: string | string[]) {
    const messages = Array.isArray(message) ? message : [message]
    super(messages.join('. '))
    this.name = 'ApiError'
    this.status = status
    this.messages = messages
  }
}

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  method?: Method
  query?: Record<string, string | undefined>
  body?: unknown
}

export type RawResponse = { status: number; data: unknown }

export async function api<T>(path: string, { method = 'GET', query, body }: RequestOptions = {}): Promise<T> {
  const url = `/api${path}${toSearch(query)}`

  let response: RawResponse
  if (import.meta.env.VITE_API_MOCK === 'true') {
    const { handleMockRequest } = await import('@/mocks/handlers')
    response = await handleMockRequest(method, url, body)
  } else {
    response = await send(method, url, body)
  }

  if (response.status >= 400) {
    throw new ApiError(response.status, errorMessage(response))
  }
  return response.data as T
}

async function send(method: Method, url: string, body: unknown): Promise<RawResponse> {
  let res: Response
  try {
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.')
  }

  const text = await res.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : undefined
  } catch {
    data = undefined
  }
  return { status: res.status, data }
}

function errorMessage({ status, data }: RawResponse): string | string[] {
  if (data && typeof data === 'object' && 'message' in data) {
    const { message } = data as { message: unknown }
    if (typeof message === 'string' || Array.isArray(message)) return message
  }
  if (status === 429) return 'Too many attempts. Wait a minute and try again.'
  if (status >= 500) return 'Something went wrong on the server. Try again.'
  return `Request failed (${status})`
}

function toSearch(query: RequestOptions['query']) {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, value)
  }
  const search = params.toString()
  return search ? `?${search}` : ''
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import type { Credentials, User } from './types'

export const meKey = ['auth', 'me'] as const

type UserResponse = { user: User }

async function createGuest() {
  const { user } = await api<UserResponse>('/auth/guest', { method: 'POST' })
  return user
}

async function bootstrapUser() {
  try {
    const { user } = await api<UserResponse>('/auth/me')
    return user
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return createGuest()
    throw error
  }
}

export function useMe() {
  return useQuery({ queryKey: meKey, queryFn: bootstrapUser, staleTime: Infinity, retry: 1 })
}

export function useUser(): User {
  const { data } = useMe()
  if (!data) throw new Error('useUser must be used after the user has loaded')
  return data
}

function useSwitchUser() {
  const queryClient = useQueryClient()
  return (user: User) => {
    queryClient.setQueryData(meKey, user)
    // Tasks belong to the previous user; drop them and refetch whatever is on screen.
    void queryClient.resetQueries({ queryKey: ['tasks'] })
  }
}

export function useLogin() {
  const switchUser = useSwitchUser()
  return useMutation({
    mutationFn: (credentials: Credentials) =>
      api<UserResponse & { mergedTasks: number }>('/auth/login', { method: 'POST', body: credentials }),
    onSuccess: ({ user }) => switchUser(user),
  })
}

export function useSignup() {
  const switchUser = useSwitchUser()
  return useMutation({
    mutationFn: (credentials: Credentials) => api<UserResponse>('/auth/signup', { method: 'POST', body: credentials }),
    onSuccess: ({ user }) => switchUser(user),
  })
}

export function useLogout() {
  const switchUser = useSwitchUser()
  return useMutation({
    mutationFn: async () => {
      await api<void>('/auth/logout', { method: 'POST' })
      return createGuest()
    },
    onSuccess: switchUser,
  })
}

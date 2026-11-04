import { LogIn, LogOut, UserPlus, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout, useUser } from './api'

const GUEST_HINT = 'Only this browser can see your tasks until you sign up.'
const avatarClass =
  'flex size-8 items-center justify-center rounded-full bg-neutral-bg text-meta font-semibold text-fg-secondary uppercase outline-none hover:bg-[#E5E7EB] focus-visible:ring-2 focus-visible:ring-primary/30'

export function AccountMenu({ onLogIn, onSignUp }: { onLogIn: () => void; onSignUp: () => void }) {
  const user = useUser()
  const logout = useLogout()

  if (user.isGuest) {
    return (
      <>
        <div className="hidden items-center gap-1.5 lg:flex">
          <span className="mr-1 text-meta text-fg-muted" title={GUEST_HINT}>
            Guest
          </span>
          <Button variant="ghost" size="sm" onClick={onLogIn}>
            Log in
          </Button>
          <Button size="sm" onClick={onSignUp}>
            Sign up
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger aria-label="Guest account" className={`${avatarClass} lg:hidden`}>
            <UserRound className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <div className="px-2 py-1.5">
              <p className="font-medium">Guest</p>
              <p className="text-meta text-fg-secondary">{GUEST_HINT}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onLogIn}>
              <LogIn />
              Log in
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onSignUp}>
              <UserPlus />
              Sign up
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  const email = user.email ?? ''
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Account" className={avatarClass}>
        {email.charAt(0) || '?'}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={logout.isPending}
          onSelect={() => logout.mutate(undefined, { onError: (error) => toast.error(error.message) })}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

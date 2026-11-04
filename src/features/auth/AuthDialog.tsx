import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog'
import { FieldError, Input, Label } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { useLogin, useSignup } from './api'

export type AuthMode = 'login' | 'signup'

const { VITE_DEMO_EMAIL: demoEmail, VITE_DEMO_PASSWORD: demoPassword } = import.meta.env
const demo = demoEmail && demoPassword ? { email: demoEmail, password: demoPassword } : null

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email')
    .max(254, 'Email is too long')
    .pipe(z.email('Enter a valid email')),
  password: z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters'),
})

type FormValues = z.infer<typeof schema>

type AuthDialogProps = {
  mode: AuthMode | null
  onModeChange: (mode: AuthMode | null) => void
}

export function AuthDialog({ mode, onModeChange }: AuthDialogProps) {
  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && onModeChange(null)}>
      <DialogContent
        title={mode === 'signup' ? 'Create your account' : 'Log in'}
        description="Tasks you added as a guest stay with you."
      >
        {mode ? <AuthForm key={mode} mode={mode} onModeChange={onModeChange} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function AuthForm({ mode, onModeChange }: { mode: AuthMode; onModeChange: (mode: AuthMode | null) => void }) {
  const login = useLogin()
  const signup = useSignup()
  const mutation = mode === 'login' ? login : signup
  const showDemo = mode === 'login' && demo !== null

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: showDemo ? demo : { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (mode === 'login') {
      const { mergedTasks } = await login.mutateAsync(values)
      if (mergedTasks > 0) {
        toast.success(
          `${mergedTasks} ${mergedTasks === 1 ? 'task' : 'tasks'} from this browser ${mergedTasks === 1 ? 'was' : 'were'} added to your account.`,
        )
      }
    } else {
      await signup.mutateAsync(values)
    }
    onModeChange(null)
  })

  return (
    <DialogBody>
      <Segmented
        label="Account"
        value={mode}
        onChange={onModeChange}
        options={[
          { value: 'login', label: 'Log in' },
          { value: 'signup', label: 'Sign up' },
        ]}
        className="mb-4 flex w-full"
      />
      <form onSubmit={(event) => void onSubmit(event).catch(() => undefined)} noValidate className="space-y-3.5">
        <div>
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            autoComplete="email"
            autoFocus
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </div>
        {mutation.error ? (
          <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-meta text-danger">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={mutation.isPending}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </Button>
        {showDemo ? (
          <p className="text-center text-meta text-fg-secondary">Demo account filled in. Tap Log in to try it.</p>
        ) : null}
      </form>
    </DialogBody>
  )
}

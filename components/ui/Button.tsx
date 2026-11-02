import { cn } from '@/lib/cn'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'text-link'

interface ButtonBaseProps {
  variant?: ButtonVariant
  className?: string
}

type ButtonAsButton = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button'; href?: never }

type ButtonAsAnchor = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a'; href: string }

type ButtonProps = ButtonAsButton | ButtonAsAnchor

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    'text-link':
      'inline-flex items-center gap-1 text-accent underline decoration-1 underline-offset-3 hover:text-accent-strong',
  }

  const classes = cn(variants[variant], className)

  if ((props as ButtonAsAnchor).as === 'a') {
    const { as: _as, ...anchorProps } = props as ButtonAsAnchor
    return (
      <a className={classes} {...anchorProps}>
        {children}
      </a>
    )
  }

  const { as: _as, ...buttonProps } = props as ButtonAsButton
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  )
}

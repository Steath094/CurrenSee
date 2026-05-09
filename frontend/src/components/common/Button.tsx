import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'icon'
  | 'nav'
  | 'chip'

type ButtonSize = 'small' | 'medium' | 'large'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  children: ReactNode
  fullWidth?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

function Button({
  active = false,
  children,
  className = '',
  fullWidth = false,
  size = 'medium',
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    active ? 'is-active' : '',
    fullWidth ? 'button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}

export default Button

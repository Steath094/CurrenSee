type IconSize = 'sm' | 'md' | 'lg' | 'xl'

type IconProps = {
  className?: string
  decorative?: boolean
  filled?: boolean
  name: string
  size?: IconSize
  title?: string
}

function Icon({
  className = '',
  decorative = true,
  filled = false,
  name,
  size = 'md',
  title,
}: IconProps) {
  const classes = [
    'material-symbols-outlined',
    'app-icon',
    `app-icon--${size}`,
    filled ? 'app-icon--filled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title ?? name}
      className={classes}
      role={decorative ? undefined : 'img'}
    >
      {name}
    </span>
  )
}

export default Icon

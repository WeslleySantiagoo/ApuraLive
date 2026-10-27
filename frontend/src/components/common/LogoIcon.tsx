interface LogoIconProps {
  className?: string
  color?: string
}

export function LogoIcon({ className = 'w-5 h-5', color = 'currentColor' }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 800 542"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points="400,0 800,412 650.6,541.6 400,130.7 149.4,541.6 0,412"
        fill={color}
      />
    </svg>
  )
}


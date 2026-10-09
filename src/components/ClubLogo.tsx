import Image from 'next/image'

const sizes = {
  sm: { className: 'h-9 w-9', px: 36 },
  md: { className: 'h-16 w-16', px: 64 },
  lg: { className: 'h-20 w-20', px: 80 },
} as const

export function ClubLogo({
  size = 'md',
  className = '',
}: {
  size?: keyof typeof sizes
  className?: string
}) {
  const { className: box, px } = sizes[size]
  return (
    <div className={`${box} relative flex-shrink-0 overflow-hidden rounded-full bg-gold/15 ${className}`}>
      <Image
        src="/logo.png"
        alt="ITJAGUARS FC"
        width={px}
        height={px}
        className="rounded-full object-cover"
      />
    </div>
  )
}

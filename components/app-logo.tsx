"use client"

import Image from "next/image"

export function AppLogo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/images/logo.jpg"
      alt="Feels Moves logo"
      width={size}
      height={size}
      className="rounded-xl"
      priority
    />
  )
}

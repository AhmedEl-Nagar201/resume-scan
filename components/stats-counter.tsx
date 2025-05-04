"use client"

import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

interface StatsCounterProps {
  end: number
  suffix?: string
  label: string
}

export default function StatsCounter({ end, suffix = "", label }: StatsCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))

  useEffect(() => {
    if (isInView) {
      animate(count, end, { duration: 2 })
    }
  }, [count, end, isInView])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2 flex items-end">
        <motion.span>{rounded}</motion.span>
        <span>{suffix}</span>
      </div>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  )
}

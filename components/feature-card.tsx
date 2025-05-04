"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  benefits: string[]
  delay?: number
}

export default function FeatureCard({ icon, title, description, benefits, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full overflow-hidden group hover:shadow-md transition-all duration-300 border">
        <CardHeader className="p-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="mb-4 p-3 rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center text-primary"
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-bold">{title}</h3>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          <p className="text-muted-foreground">{description}</p>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + index * 0.1 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

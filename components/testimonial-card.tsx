"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  rating: number
  delay?: number
}

export default function TestimonialCard({ quote, author, role, rating, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-all duration-300">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="mb-4 text-primary">
            <Quote className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-lg mb-6 flex-grow">{quote}</p>
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{author}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
              <div className="flex">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

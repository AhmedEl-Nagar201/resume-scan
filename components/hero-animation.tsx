"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function HeroAnimation() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/9]">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative w-full h-full"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-xl overflow-hidden border">
              <div className="absolute top-0 left-0 right-0 h-8 bg-muted flex items-center px-3 space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="pt-8 px-4 pb-4">
                <div className="w-full h-full bg-muted/30 rounded-md overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Resume Builder Interface"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 6,
              ease: "easeInOut",
            }}
            className="absolute top-[10%] right-[10%] w-16 h-16 bg-primary/20 rounded-lg shadow-lg"
          />

          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 7,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-[15%] left-[5%] w-12 h-12 bg-primary/30 rounded-full shadow-lg"
          />

          <motion.div
            animate={{
              y: [0, 10, 0],
              x: [0, -10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 5,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-[25%] right-[15%] w-10 h-10 bg-primary/20 rounded-md shadow-lg"
          />
        </motion.div>
      </div>
    </div>
  )
}

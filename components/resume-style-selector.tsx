"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define font options that are ATS-compatible
export const fontOptions = [
  { value: "font-sans", label: "Arial", description: "Modern sans-serif (Default)" },
  { value: "font-serif", label: "Times New Roman", description: "Classic serif" },
  { value: "font-inter", label: "Calibri", description: "Clean and professional" },
  { value: "font-georgia", label: "Georgia", description: "Elegant serif" },
  { value: "font-helvetica", label: "Helvetica", description: "Contemporary sans-serif" },
]

// Define layout styles that are ATS-compatible
export const layoutStyles = [
  { value: "classic", label: "Classic", description: "Traditional resume layout" },
  { value: "modern", label: "Modern", description: "Clean, minimalist design" },
  { value: "professional", label: "Professional", description: "Formal business style" },
]

// Define color schemes
export const colorSchemes = [
  { value: "default", label: "Default Blue", description: "Professional blue accents" },
  { value: "gray", label: "Neutral Gray", description: "Subtle gray accents" },
  { value: "green", label: "Forest Green", description: "Elegant green accents" },
  { value: "burgundy", label: "Burgundy", description: "Classic burgundy accents" },
]

export interface ResumeStyle {
  font: string
  layout: string
  colorScheme: string
}

// Default style to use if none is provided
export const defaultResumeStyle: ResumeStyle = {
  font: "font-sans",
  layout: "classic",
  colorScheme: "default",
}

interface ResumeStyleSelectorProps {
  value?: ResumeStyle
  onChange: (style: ResumeStyle) => void
}

export function ResumeStyleSelector({ value = defaultResumeStyle, onChange }: ResumeStyleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("font")

  // Ensure we have valid values by using the default if any property is missing
  const safeValue: ResumeStyle = {
    font: value?.font || defaultResumeStyle.font,
    layout: value?.layout || defaultResumeStyle.layout,
    colorScheme: value?.colorScheme || defaultResumeStyle.colorScheme,
  }

  const selectedFont = fontOptions.find((font) => font.value === safeValue.font) || fontOptions[0]
  const selectedLayout = layoutStyles.find((layout) => layout.value === safeValue.layout) || layoutStyles[0]
  const selectedColor = colorSchemes.find((color) => color.value === safeValue.colorScheme) || colorSchemes[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <span>Customize Style</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="font">Font</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
          </TabsList>

          <TabsContent value="font" className="p-4 pt-2">
            <Command>
              <CommandInput placeholder="Search fonts..." />
              <CommandList>
                <CommandEmpty>No font found.</CommandEmpty>
                <CommandGroup>
                  {fontOptions.map((font) => (
                    <CommandItem
                      key={font.value}
                      value={font.label}
                      onSelect={() => {
                        onChange({ ...safeValue, font: font.value })
                      }}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className={cn(font.value)}>{font.label}</span>
                        <p className="text-xs text-muted-foreground">{font.description}</p>
                      </div>
                      {safeValue.font === font.value && <Check className="h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </TabsContent>

          <TabsContent value="layout" className="p-4 pt-2">
            <RadioGroup
              value={safeValue.layout}
              onValueChange={(layout) => onChange({ ...safeValue, layout })}
              className="space-y-3"
            >
              {layoutStyles.map((layout) => (
                <div key={layout.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={layout.value} id={`layout-${layout.value}`} />
                  <Label htmlFor={`layout-${layout.value}`} className="flex flex-col">
                    <span>{layout.label}</span>
                    <span className="text-xs text-muted-foreground">{layout.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="color" className="p-4 pt-2">
            <RadioGroup
              value={safeValue.colorScheme}
              onValueChange={(colorScheme) => onChange({ ...safeValue, colorScheme })}
              className="space-y-3"
            >
              {colorSchemes.map((color) => (
                <div key={color.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={color.value} id={`color-${color.value}`} />
                  <Label htmlFor={`color-${color.value}`} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          color.value === "default" && "bg-blue-600",
                          color.value === "gray" && "bg-gray-600",
                          color.value === "green" && "bg-green-700",
                          color.value === "burgundy" && "bg-red-800",
                        )}
                      />
                      <span>{color.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{color.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>
        </Tabs>

        <div className="border-t p-4">
          <div className="text-sm">
            <span className="font-medium">Current Style:</span> {selectedFont?.label}, {selectedLayout?.label},{" "}
            {selectedColor?.label}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All styles are ATS-compatible for optimal parsing by applicant tracking systems.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

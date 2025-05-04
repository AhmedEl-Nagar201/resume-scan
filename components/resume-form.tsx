"use client"

import Link from "next/link"

import { CardDescription } from "@/components/ui/card"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { LinkProps } from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  PlusCircle,
  Trash2,
  Save,
  FileDown,
  Eye,
  EyeOff,
  Upload,
  Download,
  LinkIcon,
  Loader2,
  Briefcase,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ResumePreview from "./resume-preview"
import { toPDF } from "./pdf-export"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  saveResume,
  updateResume,
  getUserResumes,
  deleteResume,
  type ResumeDocument,
  getMostRecentResume,
  autoSaveResume,
} from "@/lib/resume-service"
import { ResumeStyleSelector, type ResumeStyle } from "./resume-style-selector"

// Define types for our resume data
export type ResumeLink = {
  id: number
  name: string
  url: string
}

export type PersonalInfo = {
  fullName: string
  email: string
  phone: string
  address: string
  summary: string
  links: ResumeLink[]
}

export type Education = {
  id: number
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  description: string
  links: ResumeLink[]
}

export type Experience = {
  id: number
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  links: ResumeLink[]
}

export type Skill = {
  id: number
  skill: string
}

export type Language = {
  id: number
  name: string
  proficiency: string
}

export type Award = {
  id: number
  title: string
  issuer: string
  date: string
  description: string
  links: ResumeLink[]
}

export type ResumeData = {
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: Skill[]
  languages: Language[]
  awards: Award[]
  resumeStyle: ResumeStyle
}

// Initial empty resume data
const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    links: [{ id: 1, name: "Portfolio", url: "" }],
  },
  education: [
    {
      id: 1,
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
      links: [],
    },
  ],
  experience: [
    {
      id: 1,
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      links: [],
    },
  ],
  skills: [{ id: 1, skill: "" }],
  languages: [{ id: 1, name: "", proficiency: "Beginner" }],
  awards: [
    {
      id: 1,
      title: "",
      issuer: "",
      date: "",
      description: "",
      links: [],
    },
  ],
  resumeStyle: {
    font: "font-sans",
    layout: "classic",
    colorScheme: "default",
  },
}

// Proficiency levels for languages
const proficiencyLevels = ["Beginner", "Elementary", "Intermediate", "Advanced", "Fluent", "Native"]

// Link component for adding/editing links
interface LinksEditorProps {
  links: ResumeLink[]
  onChange: (links: ResumeLink[]) => void
  addLinkLabel?: string
}

function LinksEditor({ links, onChange, addLinkLabel = "Add Link" }: LinksEditorProps) {
  const handleLinkChange = (id: number, field: string, value: string) => {
    const updatedLinks = links.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    onChange(updatedLinks)
  }

  const addLink = () => {
    const newId = links.length > 0 ? Math.max(...links.map((link) => link.id)) + 1 : 1
    onChange([...links, { id: newId, name: "", url: "" }])
  }

  const removeLink = (id: number) => {
    onChange(links.filter((link) => link.id !== id))
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <div key={link.id} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              value={link.name}
              onChange={(e) => handleLinkChange(link.id, "name", e.target.value)}
              placeholder="Display Name (e.g., GitHub, LinkedIn)"
            />
          </div>
          <div className="flex-1">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
              </span>
              <Input
                value={link.url}
                onChange={(e) => handleLinkChange(link.id, "url", e.target.value)}
                placeholder="https://..."
                className="rounded-l-none"
              />
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(link.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addLink} className="mt-2">
        <PlusCircle className="h-4 w-4 mr-2" />
        {addLinkLabel}
      </Button>
    </div>
  )
}

export interface NextLink
  extends React.ForwardRefExoticComponent<Omit<LinkProps, "ref"> & React.RefAttributes<HTMLAnchorElement>> {}

export default function ResumeForm() {
  const router = useRouter()
  // State for all resume data
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData)

  // Destructure resume data for easier access
  const { personalInfo, education, experience, skills, languages, awards } = resumeData

  // Preview ref for PDF generation
  const resumeRef = useRef<HTMLDivElement>(null)

  // Loading state for PDF generation
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // State for saved resumes
  const [savedResumes, setSavedResumes] = useState<ResumeDocument[]>([])

  // State for current resume name and ID
  const [currentResumeName, setCurrentResumeName] = useState<string>("")
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null)

  // State for file input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoadingResumes, setIsLoadingResumes] = useState(false)

  // Load saved resumes from Firebase on component mount
  useEffect(() => {
    const loadSavedResumes = async () => {
      setIsLoadingResumes(true)
      try {
        // Load all resumes for the dropdown
        const resumes = await getUserResumes()
        setSavedResumes(resumes)

        // Try to get the most recent resume
        const mostRecent = await getMostRecentResume()

        if (mostRecent) {
          setResumeData(mostRecent.data)
          setCurrentResumeName(mostRecent.name)
          setCurrentResumeId(mostRecent.id)

          // Also save to localStorage for backup
          localStorage.setItem("autoSavedResume", JSON.stringify(mostRecent.data))
          localStorage.setItem("currentResumeId", mostRecent.id)
          localStorage.setItem("currentResumeName", mostRecent.name)
        } else {
          // Try to load auto-saved resume from localStorage as fallback
          loadAutoSavedResume()
        }
      } catch (error) {
        console.error("Error loading saved resumes:", error)
        toast({
          title: "Error",
          description: "Failed to load saved resumes. Using local data instead.",
          variant: "destructive",
        })

        // Load from localStorage as fallback
        loadAutoSavedResume()
      } finally {
        setIsLoadingResumes(false)
      }
    }

    loadSavedResumes()
  }, [])

  // Load auto-saved resume from localStorage
  const loadAutoSavedResume = () => {
    try {
      const autoSavedResume = localStorage.getItem("autoSavedResume")
      if (autoSavedResume) {
        const parsedResume = JSON.parse(autoSavedResume)

        // Ensure the parsed resume has all required properties
        const validatedResume = {
          personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            summary: "",
            links: [],
            ...parsedResume.personalInfo,
          },
          education: parsedResume.education || initialResumeData.education,
          experience: parsedResume.experience || initialResumeData.experience,
          skills: parsedResume.skills || initialResumeData.skills,
          languages: parsedResume.languages || initialResumeData.languages,
          awards: parsedResume.awards || initialResumeData.awards,
          resumeStyle: parsedResume.resumeStyle || {
            font: "font-sans",
            layout: "classic",
            colorScheme: "default",
          },
        }

        setResumeData(validatedResume)
        setCurrentResumeName("Autosaved Resume")
      }
    } catch (error) {
      console.error("Error loading auto-saved resume:", error)
      // If there's an error, ensure we still have valid data
      setResumeData(initialResumeData)
    }
  }

  // Auto-save resume data to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("autoSavedResume", JSON.stringify(resumeData))
    } catch (error) {
      console.error("Error auto-saving resume:", error)
    }
  }, [resumeData])

  // Add auto-save functionality when resume data changes
  useEffect(() => {
    // Debounce auto-save to avoid too many writes
    const autoSaveTimer = setTimeout(() => {
      autoSaveResume(resumeData).catch((error) => {
        console.error("Error auto-saving resume:", error)
      })
    }, 2000) // Wait 2 seconds after changes before saving

    return () => clearTimeout(autoSaveTimer)
  }, [resumeData])

  // Handle personal info changes
  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [name]: value,
      },
    }))
  }

  // Handle personal links changes
  const handlePersonalLinksChange = (links: ResumeLink[]) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        links,
      },
    }))
  }

  // Handle education changes
  const handleEducationChange = (id: number, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  // Handle education links changes
  const handleEducationLinksChange = (educationId: number, links: ResumeLink[]) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === educationId ? { ...edu, links } : edu)),
    }))
  }

  // Add new education field
  const addEducation = () => {
    const newId = education.length > 0 ? Math.max(...education.map((edu) => edu.id)) + 1 : 1
    setResumeData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: newId,
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: "",
          links: [],
        },
      ],
    }))
  }

  // Remove education field
  const removeEducation = (id: number) => {
    if (education.length > 1) {
      setResumeData((prev) => ({
        ...prev,
        education: prev.education.filter((edu) => edu.id !== id),
      }))
    }
  }

  // Handle experience changes
  const handleExperienceChange = (id: number, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  // Handle experience links changes
  const handleExperienceLinksChange = (experienceId: number, links: ResumeLink[]) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === experienceId ? { ...exp, links } : exp)),
    }))
  }

  // Add new experience field
  const addExperience = () => {
    const newId = experience.length > 0 ? Math.max(...experience.map((exp) => exp.id)) + 1 : 1
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: newId,
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          description: "",
          links: [],
        },
      ],
    }))
  }

  // Remove experience field
  const removeExperience = (id: number) => {
    if (experience.length > 1) {
      setResumeData((prev) => ({
        ...prev,
        experience: prev.experience.filter((exp) => exp.id !== id),
      }))
    }
  }

  // Handle skills changes
  const handleSkillChange = (id: number, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) => (skill.id === id ? { ...skill, skill: value } : skill)),
    }))
  }

  // Add new skill field
  const addSkill = () => {
    const newId = skills.length > 0 ? Math.max(...skills.map((skill) => skill.id)) + 1 : 1
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, { id: newId, skill: "" }],
    }))
  }

  // Remove skill field
  const removeSkill = (id: number) => {
    if (skills.length > 1) {
      setResumeData((prev) => ({
        ...prev,
        skills: prev.skills.filter((skill) => skill.id !== id),
      }))
    }
  }

  // Handle language changes
  const handleLanguageChange = (id: number, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) => (lang.id === id ? { ...lang, [field]: value } : lang)),
    }))
  }

  // Add new language field
  const addLanguage = () => {
    const newId = languages.length > 0 ? Math.max(...languages.map((lang) => lang.id)) + 1 : 1
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, { id: newId, name: "", proficiency: "Beginner" }],
    }))
  }

  // Remove language field
  const removeLanguage = (id: number) => {
    if (languages.length > 1) {
      setResumeData((prev) => ({
        ...prev,
        languages: prev.languages.filter((lang) => lang.id !== id),
      }))
    }
  }

  // Handle award changes
  const handleAwardChange = (id: number, field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      awards: prev.awards.map((award) => (award.id === id ? { ...award, [field]: value } : award)),
    }))
  }

  // Handle award links changes
  const handleAwardLinksChange = (awardId: number, links: ResumeLink[]) => {
    setResumeData((prev) => ({
      ...prev,
      awards: prev.awards.map((award) => (award.id === awardId ? { ...award, links } : award)),
    }))
  }

  // Add new award field
  const addAward = () => {
    const newId = awards.length > 0 ? Math.max(...awards.map((award) => award.id)) + 1 : 1
    setResumeData((prev) => ({
      ...prev,
      awards: [
        ...prev.awards,
        {
          id: newId,
          title: "",
          issuer: "",
          date: "",
          description: "",
          links: [],
        },
      ],
    }))
  }

  // Remove award field
  const removeAward = (id: number) => {
    if (awards.length > 1) {
      setResumeData((prev) => ({
        ...prev,
        awards: prev.awards.filter((award) => award.id !== id),
      }))
    }
  }

  const handleStyleChange = (resumeStyle: ResumeStyle) => {
    setResumeData((prev) => ({
      ...prev,
      resumeStyle: resumeStyle || {
        font: "font-sans",
        layout: "classic",
        colorScheme: "default",
      },
    }))
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveResumeToFirebase()
  }

  // Generate PDF
  const generatePDF = async () => {
    if (!resumeRef.current) return

    setIsGeneratingPDF(true)
    try {
      // Add a safety check for personalInfo.fullName
      const fileName = personalInfo?.fullName
        ? `${personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`
        : "Resume.pdf"

      await toPDF(resumeRef.current, {
        filename: fileName,
        page: { margin: 20 },
      })

      toast({
        title: "PDF Generated",
        description: "Your resume has been exported as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Save resume to Firebase
  const saveResumeToFirebase = async (name?: string) => {
    try {
      setIsSaving(true)
      const resumeName = name || currentResumeName || `Resume_${new Date().toISOString().slice(0, 10)}`

      if (currentResumeId) {
        // Update existing resume
        await updateResume(currentResumeId, resumeData, resumeName)
      } else {
        // Create new resume
        const newResumeId = await saveResume(resumeData, resumeName)
        setCurrentResumeId(newResumeId)
      }

      setCurrentResumeName(resumeName)

      // Refresh the list of saved resumes
      const resumes = await getUserResumes()
      setSavedResumes(resumes)

      toast({
        title: "Resume Saved",
        description: `Your resume "${resumeName}" has been saved to Firebase.`,
      })
    } catch (error) {
      console.error("Error saving resume to Firebase:", error)
      toast({
        title: "Error",
        description: `Failed to save resume to Firebase: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Load resume from Firebase
  const loadResumeFromFirebase = async (resumeDoc: ResumeDocument) => {
    try {
      setIsLoading(true)
      setResumeData(resumeDoc.data)
      setCurrentResumeName(resumeDoc.name)
      setCurrentResumeId(resumeDoc.id)

      toast({
        title: "Resume Loaded",
        description: `Resume "${resumeDoc.name}" has been loaded.`,
      })
    } catch (error) {
      console.error("Error loading resume from Firebase:", error)
      toast({
        title: "Error",
        description: `Failed to load resume: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete resume from Firebase
  const deleteResumeFromFirebase = async (resumeId: string) => {
    try {
      setIsDeleting(true)
      await deleteResume(resumeId)

      // Refresh the list of saved resumes
      const resumes = await getUserResumes()
      setSavedResumes(resumes)

      // If we deleted the current resume, reset the form
      if (resumeId === currentResumeId) {
        if (resumes.length > 0) {
          // Load the first resume in the list
          setResumeData(resumes[0].data)
          setCurrentResumeName(resumes[0].name)
          setCurrentResumeId(resumes[0].id)
        } else {
          // Reset to initial state
          setResumeData(initialResumeData)
          setCurrentResumeName("")
          setCurrentResumeId(null)
        }
      }

      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting resume from Firebase:", error)
      toast({
        title: "Error",
        description: `Failed to delete resume: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Export resume as JSON file
  const exportResumeAsJSON = () => {
    try {
      const dataStr = JSON.stringify(resumeData, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportName = currentResumeName || `Resume_${new Date().toISOString().slice(0, 10)}`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", `${exportName}.json`)
      linkElement.click()

      toast({
        title: "Resume Exported",
        description: "Your resume has been exported as a JSON file.",
      })
    } catch (error) {
      console.error("Error exporting resume:", error)
      toast({
        title: "Error",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Import resume from JSON file
  const importResumeFromJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target?.result as string) as ResumeData
          setResumeData(importedData)

          // Extract name from filename
          const fileName = file.name.replace(".json", "")
          setCurrentResumeName(fileName)
          setCurrentResumeId(null) // Reset ID since this is a new import

          toast({
            title: "Resume Imported",
            description: "Your resume has been imported successfully.",
          })
        } catch (error) {
          console.error("Error parsing JSON:", error)
          toast({
            title: "Error",
            description: "Failed to parse JSON file. Please check the file format.",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error("Error importing resume:", error)
      toast({
        title: "Error",
        description: "Failed to import resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Prepare resume data for preview
  const resumeDataForPreview = {
    personalInfo,
    education,
    experience,
    skills,
    languages,
    awards,
    resumeStyle: resumeData.resumeStyle,
  }

  return (
    <Tabs defaultValue="form" className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="form">
            <Eye className="h-4 w-4 mr-2" />
            Edit Resume
          </TabsTrigger>
          <TabsTrigger value="preview">
            <EyeOff className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <div className="flex mt-4 sm:mt-0 gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save/Load
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save or Load Resume</DialogTitle>
                <DialogDescription>Save your current resume or load a previously saved one.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Resume Name"
                    value={currentResumeName}
                    onChange={(e) => setCurrentResumeName(e.target.value)}
                  />
                  <Button onClick={() => saveResumeToFirebase(currentResumeName)} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save
                  </Button>
                </div>

                {isLoadingResumes ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : savedResumes.length > 0 ? (
                  <div className="space-y-2">
                    <Label>Saved Resumes</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {savedResumes.map((resume) => (
                        <div key={resume.id} className="flex items-center justify-between p-2 border rounded">
                          <span>{resume.name}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadResumeFromFirebase(resume)}
                              disabled={isLoading}
                            >
                              {isLoading && currentResumeId === resume.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Load
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteResumeFromFirebase(resume.id)}
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-700"
                            >
                              {isDeleting && currentResumeId === resume.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No saved resumes found.</p>
                )}

                <div className="flex flex-col gap-2">
                  <Label>Import/Export</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportResumeAsJSON}>
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                    <Button variant="outline" onClick={triggerFileInput}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import JSON
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={importResumeFromJSON}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" type="button">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={generatePDF} disabled={isGeneratingPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Export as PDF"}
          </Button>
        </div>
      </div>

      <TabsContent value="form" className="space-y-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={personalInfo.fullName}
                    onChange={handlePersonalInfoChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={personalInfo.phone}
                    onChange={handlePersonalInfoChange}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={personalInfo.address}
                    onChange={handlePersonalInfoChange}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Links</Label>
                <LinksEditor
                  links={personalInfo.links}
                  onChange={handlePersonalLinksChange}
                  addLinkLabel="Add Personal Link"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={personalInfo.summary}
                  onChange={handlePersonalInfoChange}
                  placeholder="A brief summary of your professional background and goals"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                      <Input
                        id={`institution-${edu.id}`}
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(edu.id, "institution", e.target.value)}
                        placeholder="University Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                      <Input
                        id={`degree-${edu.id}`}
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                        placeholder="Bachelor of Science"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`fieldOfStudy-${edu.id}`}>Field of Study</Label>
                      <Input
                        id={`fieldOfStudy-${edu.id}`}
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleEducationChange(edu.id, "fieldOfStudy", e.target.value)}
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${edu.id}`}>Start Date</Label>
                      <Input
                        id={`startDate-${edu.id}`}
                        type="month"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(edu.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
                      <Input
                        id={`endDate-${edu.id}`}
                        type="month"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(edu.id, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Links</Label>
                    <LinksEditor
                      links={edu.links}
                      onChange={(links) => handleEducationLinksChange(edu.id, links)}
                      addLinkLabel="Add Education Link"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`eduDescription-${edu.id}`}>Description</Label>
                    <Textarea
                      id={`eduDescription-${edu.id}`}
                      value={edu.description}
                      onChange={(e) => handleEducationChange(edu.id, "description", e.target.value)}
                      placeholder="Relevant coursework, achievements, etc."
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`company-${exp.id}`}>Company</Label>
                      <Input
                        id={`company-${exp.id}`}
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(exp.id, "company", e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`position-${exp.id}`}>Position</Label>
                      <Input
                        id={`position-${exp.id}`}
                        value={exp.position}
                        onChange={(e) => handleExperienceChange(exp.id, "position", e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`expStartDate-${exp.id}`}>Start Date</Label>
                      <Input
                        id={`expStartDate-${exp.id}`}
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(exp.id, "startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`expEndDate-${exp.id}`}>End Date</Label>
                      <Input
                        id={`expEndDate-${exp.id}`}
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(exp.id, "endDate", e.target.value)}
                        placeholder="Present (if current)"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Links</Label>
                    <LinksEditor
                      links={exp.links}
                      onChange={(links) => handleExperienceLinksChange(exp.id, links)}
                      addLinkLabel="Add Work Link"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`expDescription-${exp.id}`}>Description</Label>
                    <Textarea
                      id={`expDescription-${exp.id}`}
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(exp.id, "description", e.target.value)}
                      placeholder="Describe your responsibilities and achievements"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="flex items-center space-x-2">
                    <Input
                      value={skill.skill}
                      onChange={(e) => handleSkillChange(skill.id, e.target.value)}
                      placeholder="e.g., JavaScript, Project Management"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {languages.map((language) => (
                <div key={language.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      value={language.name}
                      onChange={(e) => handleLanguageChange(language.id, "name", e.target.value)}
                      placeholder="e.g., English, Spanish, French"
                    />
                  </div>
                  <div className="w-40">
                    <Select
                      value={language.proficiency}
                      onValueChange={(value) => handleLanguageChange(language.id, "proficiency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Proficiency" />
                      </SelectTrigger>
                      <SelectContent>
                        {proficiencyLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Awards Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Awards & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {awards.map((award) => (
                <div key={award.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`awardTitle-${award.id}`}>Award/Certification Title</Label>
                      <Input
                        id={`awardTitle-${award.id}`}
                        value={award.title}
                        onChange={(e) => handleAwardChange(award.id, "title", e.target.value)}
                        placeholder="e.g., Employee of the Year, AWS Certification"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`awardIssuer-${award.id}`}>Issuing Organization</Label>
                      <Input
                        id={`awardIssuer-${award.id}`}
                        value={award.issuer}
                        onChange={(e) => handleAwardChange(award.id, "issuer", e.target.value)}
                        placeholder="e.g., Amazon Web Services, Company Name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`awardDate-${award.id}`}>Date Received</Label>
                      <Input
                        id={`awardDate-${award.id}`}
                        type="month"
                        value={award.date}
                        onChange={(e) => handleAwardChange(award.id, "date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Links</Label>
                      <LinksEditor
                        links={award.links}
                        onChange={(links) => handleAwardLinksChange(award.id, links)}
                        addLinkLabel="Add Award Link"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`awardDescription-${award.id}`}>Description</Label>
                    <Textarea
                      id={`awardDescription-${award.id}`}
                      value={award.description}
                      onChange={(e) => handleAwardChange(award.id, "description", e.target.value)}
                      placeholder="Brief description of the award or certification"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resume Style Section */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Style</CardTitle>
              <CardDescription>Customize the appearance of your resume</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Choose Font & Style</Label>
                <ResumeStyleSelector value={resumeData.resumeStyle} onChange={handleStyleChange} />
                <p className="text-sm text-muted-foreground mt-2">
                  All styles are ATS-compatible to ensure your resume is properly parsed by applicant tracking systems.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Resume
                </>
              )}
            </Button>
            <Link href="/job-matcher">
              <Button type="button" variant="outline" className="w-full sm:w-auto" size="lg">
                <Briefcase className="h-5 w-5 mr-2" />
                Analyze Resume
              </Button>
            </Link>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="preview" className="space-y-8 mb-8">
        <div className="flex justify-end mb-4">
          <Button onClick={generatePDF} disabled={isGeneratingPDF} className="w-full sm:w-auto">
            <FileDown className="h-5 w-5 mr-2" />
            {isGeneratingPDF ? "Generating PDF..." : "Export as PDF"}
          </Button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <ResumePreview ref={resumeRef} data={resumeDataForPreview} />
        </div>
      </TabsContent>
    </Tabs>
  )
}

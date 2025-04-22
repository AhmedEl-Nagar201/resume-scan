"use client"

import { useState, useEffect } from "react"
import AdminProtectedRoute from "@/components/admin-protected-route"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, RefreshCw, AlertTriangle } from "lucide-react"
import { getPrompts, updatePrompt, resetPromptToDefault } from "@/lib/prompt-service"
import type { Prompt } from "@/lib/prompt-service"
import { useAuth } from "@/contexts/auth-context"

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Load prompts on component mount
  useEffect(() => {
    if (user) {
      loadPrompts()
    }
  }, [user])

  // Load all prompts
  const loadPrompts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const allPrompts = await getPrompts()
      setPrompts(allPrompts)

      // Set the first prompt as active tab if available
      if (allPrompts.length > 0 && !activeTab) {
        setActiveTab(allPrompts[0].id)
      }
    } catch (error) {
      console.error("Error loading prompts:", error)
      setError(error.message || "Failed to load prompts. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load prompts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle prompt content change
  const handlePromptChange = (id: string, content: string) => {
    setPrompts((prevPrompts) => prevPrompts.map((prompt) => (prompt.id === id ? { ...prompt, content } : prompt)))
  }

  // Save prompt changes
  const handleSavePrompt = async (promptId: string) => {
    try {
      setIsSaving(true)
      setError(null)
      const promptToSave = prompts.find((p) => p.id === promptId)

      if (!promptToSave) {
        throw new Error("Prompt not found")
      }

      await updatePrompt(promptId, promptToSave.content)

      toast({
        title: "Success",
        description: "Prompt has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving prompt:", error)
      setError(error.message || "Failed to save prompt. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset prompt to default
  const handleResetPrompt = async (promptId: string) => {
    try {
      setIsResetting(true)
      setError(null)
      await resetPromptToDefault(promptId)

      // Reload prompts to get the default one
      await loadPrompts()

      toast({
        title: "Success",
        description: "Prompt has been reset to default.",
      })
    } catch (error) {
      console.error("Error resetting prompt:", error)
      setError(error.message || "Failed to reset prompt. Please try again.")
      toast({
        title: "Error",
        description: "Failed to reset prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <AdminProtectedRoute>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">AI Prompt Management</h1>
        <p className="text-muted-foreground mb-8">Customize the AI prompts used throughout the application</p>

        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-600">Error</h3>
            </div>
            <p className="mt-2 text-red-600">{error}</p>
            <p className="mt-2 text-red-600">
              You are viewing the default prompts. Changes may not be saved to the database due to permission issues.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 flex flex-wrap h-auto">
              {prompts.map((prompt) => (
                <TabsTrigger key={prompt.id} value={prompt.id} className="mb-2">
                  {prompt.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {prompts.map((prompt) => (
              <TabsContent key={prompt.id} value={prompt.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{prompt.name}</CardTitle>
                    <CardDescription>{prompt.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`prompt-${prompt.id}`}>Prompt Template</Label>
                      <Textarea
                        id={`prompt-${prompt.id}`}
                        value={prompt.content}
                        onChange={(e) => handlePromptChange(prompt.id, e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                      <p className="text-sm text-muted-foreground">
                        Use variables like {"{jobDescription}"}, {"{resumeText}"}, etc. which will be replaced with
                        actual values.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => handleResetPrompt(prompt.id)} disabled={isResetting}>
                      {isResetting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Reset to Default
                    </Button>
                    <Button onClick={() => handleSavePrompt(prompt.id)} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminProtectedRoute>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MoreHorizontal, Plus, Copy, Key, Trash2, Code } from "lucide-react"
import { format } from "date-fns"
import { generateApiKey, getUserApiKeys, updateApiKey, deleteApiKey, type ApiKey } from "@/lib/api-key-service"

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEmbedCodeDialog, setShowEmbedCodeDialog] = useState(false)
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyDomain, setNewKeyDomain] = useState("")
  const [allowResumeBuilder, setAllowResumeBuilder] = useState(true)
  const [allowJobMatcher, setAllowJobMatcher] = useState(true)
  const [embedFeature, setEmbedFeature] = useState<"resume-builder" | "job-matcher">("resume-builder")
  const [embedTheme, setEmbedTheme] = useState<"light" | "dark">("light")
  const router = useRouter()
  const { toast } = useToast()

  // Load API keys on component mount
  useEffect(() => {
    loadApiKeys()
  }, [])

  // Load all API keys for the current user
  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      const keys = await getUserApiKeys()
      setApiKeys(keys)
    } catch (error) {
      console.error("Error loading API keys:", error)
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new API key
  const handleCreateApiKey = async () => {
    try {
      if (!newKeyName.trim()) {
        toast({
          title: "Error",
          description: "Please enter a name for your API key.",
          variant: "destructive",
        })
        return
      }

      if (!newKeyDomain.trim()) {
        toast({
          title: "Error",
          description: "Please enter a domain for your API key.",
          variant: "destructive",
        })
        return
      }

      setIsCreating(true)

      // Determine allowed features
      const allowedFeatures: string[] = []
      if (allowResumeBuilder) allowedFeatures.push("resume-builder")
      if (allowJobMatcher) allowedFeatures.push("job-matcher")

      if (allowedFeatures.length === 0) {
        toast({
          title: "Error",
          description: "Please select at least one feature to enable.",
          variant: "destructive",
        })
        setIsCreating(false)
        return
      }

      const newApiKey = await generateApiKey(newKeyName, newKeyDomain, allowedFeatures)
      setApiKeys((prevKeys) => [newApiKey, ...prevKeys])
      setShowCreateDialog(false)
      setNewKeyName("")
      setNewKeyDomain("")

      toast({
        title: "Success",
        description: "API key created successfully.",
      })
    } catch (error) {
      console.error("Error creating API key:", error)
      toast({
        title: "Error",
        description: `Failed to create API key: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Toggle API key active status
  const toggleApiKeyStatus = async (id: string, isActive: boolean) => {
    try {
      await updateApiKey(id, { isActive })
      setApiKeys((prevKeys) => prevKeys.map((key) => (key.id === id ? { ...key, isActive } : key)))
      toast({
        title: "Success",
        description: `API key ${isActive ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      console.error("Error updating API key:", error)
      toast({
        title: "Error",
        description: "Failed to update API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete an API key
  const handleDeleteApiKey = async (id: string) => {
    try {
      await deleteApiKey(id)
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== id))
      toast({
        title: "Success",
        description: "API key deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Copy API key to clipboard
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: message,
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Error",
          description: "Failed to copy to clipboard.",
          variant: "destructive",
        })
      },
    )
  }

  // Show embed code dialog
  const showEmbedCode = (apiKey: ApiKey, feature: "resume-builder" | "job-matcher") => {
    setSelectedApiKey(apiKey)
    setEmbedFeature(feature)
    setShowEmbedCodeDialog(true)
  }

  // Generate embed code
  const generateEmbedCode = () => {
    if (!selectedApiKey) return ""

    const appUrl = window.location.origin
    const iframeUrl = `${appUrl}/api/embed?key=${selectedApiKey.key}&feature=${embedFeature}&theme=${embedTheme}`

    return `
<!-- Resume Scan ${embedFeature === "resume-builder" ? "Resume Builder" : "Job Matcher"} Widget -->
<div id="resume-scan-widget" style="width: 100%; height: 800px; max-width: 1200px; margin: 0 auto;">
  <iframe 
    src="${iframeUrl}" 
    style="width: 100%; height: 100%; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" 
    title="Resume Scan ${embedFeature === "resume-builder" ? "Resume Builder" : "Job Matcher"}"
    allow="clipboard-write"
  ></iframe>
</div>
<!-- End Resume Scan Widget -->
`
  }

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-muted-foreground mb-8">Manage API keys for embedding Resume Scan features on your website</p>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your API Keys</h2>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New API Key
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No API keys found. Create your first API key to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>{apiKey.name}</TableCell>
                      <TableCell>{apiKey.domain}</TableCell>
                      <TableCell>{format(apiKey.createdAt, "MMM d, yyyy")}</TableCell>
                      <TableCell>{apiKey.lastUsed ? format(apiKey.lastUsed, "MMM d, yyyy") : "Never"}</TableCell>
                      <TableCell>{apiKey.usageCount}</TableCell>
                      <TableCell>
                        <Switch
                          checked={apiKey.isActive}
                          onCheckedChange={(checked) => toggleApiKeyStatus(apiKey.id, checked)}
                          aria-label="Toggle API key status"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => copyToClipboard(apiKey.key, "API key copied to clipboard")}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy API Key
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => showEmbedCode(apiKey, "resume-builder")}>
                              <Code className="h-4 w-4 mr-2" />
                              Resume Builder Embed Code
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => showEmbedCode(apiKey, "job-matcher")}>
                              <Code className="h-4 w-4 mr-2" />
                              Job Matcher Embed Code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteApiKey(apiKey.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete API Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create API Key Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>Create an API key to embed Resume Scan features on your website</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="My Website API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">A descriptive name to help you identify this API key</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyDomain">Domain</Label>
                <Input
                  id="keyDomain"
                  placeholder="example.com"
                  value={newKeyDomain}
                  onChange={(e) => setNewKeyDomain(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  The domain where this API key will be used. Use * for any domain (not recommended).
                </p>
              </div>

              <div className="space-y-2">
                <Label>Allowed Features</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="resumeBuilder"
                      checked={allowResumeBuilder}
                      onCheckedChange={(checked) => setAllowResumeBuilder(!!checked)}
                    />
                    <label
                      htmlFor="resumeBuilder"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Resume Builder
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jobMatcher"
                      checked={allowJobMatcher}
                      onCheckedChange={(checked) => setAllowJobMatcher(!!checked)}
                    />
                    <label
                      htmlFor="jobMatcher"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Job Matcher
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateApiKey} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Create API Key
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Embed Code Dialog */}
        <Dialog open={showEmbedCodeDialog} onOpenChange={setShowEmbedCodeDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Embed Code</DialogTitle>
              <DialogDescription>
                Copy this code and paste it into your website to embed the{" "}
                {embedFeature === "resume-builder" ? "Resume Builder" : "Job Matcher"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <Label htmlFor="embedFeature">Feature</Label>
                  <select
                    id="embedFeature"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={embedFeature}
                    onChange={(e) => setEmbedFeature(e.target.value as "resume-builder" | "job-matcher")}
                  >
                    <option value="resume-builder">Resume Builder</option>
                    <option value="job-matcher">Job Matcher</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="embedTheme">Theme</Label>
                  <select
                    id="embedTheme"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={embedTheme}
                    onChange={(e) => setEmbedTheme(e.target.value as "light" | "dark")}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embedCode">Embed Code</Label>
                <div className="relative">
                  <textarea
                    id="embedCode"
                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    readOnly
                    value={generateEmbedCode()}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateEmbedCode(), "Embed code copied to clipboard")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copy this code and paste it into your website where you want the widget to appear.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmbedCodeDialog(false)}>
                Close
              </Button>
              <Button onClick={() => copyToClipboard(generateEmbedCode(), "Embed code copied to clipboard")}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Documentation Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">API Documentation</h2>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn how to embed Resume Scan features on your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">1. Create an API Key</h3>
                <p className="text-muted-foreground">
                  Create an API key with your domain and select which features you want to enable.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">2. Copy the Embed Code</h3>
                <p className="text-muted-foreground">
                  Click on "Resume Builder Embed Code" or "Job Matcher Embed Code" in the actions menu to get the embed
                  code.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">3. Paste the Code on Your Website</h3>
                <p className="text-muted-foreground">
                  Paste the embed code into your website where you want the widget to appear.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customization Options</CardTitle>
              <CardDescription>Customize the appearance and behavior of the embedded widgets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Theme</h3>
                <p className="text-muted-foreground">
                  Choose between light and dark themes to match your website's design.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Size</h3>
                <p className="text-muted-foreground">
                  Adjust the width and height in the embed code to fit your layout.
                </p>
                <pre className="bg-muted p-2 rounded-md mt-2 text-sm overflow-x-auto">
                  {`<div id="resume-scan-widget" style="width: 100%; height: 800px;">...</div>`}
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security and Best Practices</CardTitle>
              <CardDescription>Keep your integration secure and reliable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Domain Restriction</h3>
                <p className="text-muted-foreground">
                  Always specify your exact domain when creating an API key. Using "*" allows the key to be used on any
                  domain.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">API Key Rotation</h3>
                <p className="text-muted-foreground">
                  Regularly rotate your API keys for enhanced security. Create a new key before deleting an old one to
                  avoid service disruption.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Usage Monitoring</h3>
                <p className="text-muted-foreground">
                  Monitor the usage count of your API keys to detect any unusual activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

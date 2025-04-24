"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserApiKeys, type ApiKey } from "@/lib/api-key-service"
import { Loader2 } from "lucide-react"

export default function TestEmbedPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedKey, setSelectedKey] = useState<string>("")
  const [feature, setFeature] = useState<"resume-builder" | "job-matcher">("resume-builder")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [iframeUrl, setIframeUrl] = useState<string>("")
  const [embedCode, setEmbedCode] = useState<string>("")

  useEffect(() => {
    loadApiKeys()
  }, [])

  useEffect(() => {
    if (selectedKey) {
      generateUrls()
    }
  }, [selectedKey, feature, theme])

  const loadApiKeys = async () => {
    try {
      setIsLoading(true)
      const keys = await getUserApiKeys()
      setApiKeys(keys)

      // Select the first key by default if available
      if (keys.length > 0) {
        setSelectedKey(keys[0].key)
      }
    } catch (error) {
      console.error("Error loading API keys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateUrls = () => {
    const baseUrl = window.location.origin
    const directUrl = `${baseUrl}/api/embed?key=${selectedKey}&feature=${feature}&theme=${theme}`
    setIframeUrl(directUrl)

    const code = `
<!-- Resume Scan ${feature === "resume-builder" ? "Resume Builder" : "Job Matcher"} Widget -->
<div id="resume-scan-widget" style="width: 100%; height: 800px; max-width: 1200px; margin: 0 auto;">
  <iframe 
    src="${directUrl}" 
    style="width: 100%; height: 100%; border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" 
    title="Resume Scan ${feature === "resume-builder" ? "Resume Builder" : "Job Matcher"}"
    allow="clipboard-write"
  ></iframe>
</div>
<!-- End Resume Scan Widget -->
`
    setEmbedCode(code)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Test Embed Functionality</h1>
      <p className="text-muted-foreground mb-8">Test your API keys and embed functionality locally</p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Configure Test</CardTitle>
              <CardDescription>Select an API key and configure the embed options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                {apiKeys.length > 0 ? (
                  <Select value={selectedKey} onValueChange={setSelectedKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an API key" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiKeys.map((key) => (
                        <SelectItem key={key.id} value={key.key}>
                          {key.name} ({key.domain})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center p-4 border rounded-md">
                    <p className="text-muted-foreground">No API keys found</p>
                    <Button className="mt-2" size="sm" asChild>
                      <a href="/api-keys">Create API Key</a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Feature</Label>
                <div className="flex gap-4">
                  <Button
                    variant={feature === "resume-builder" ? "default" : "outline"}
                    onClick={() => setFeature("resume-builder")}
                  >
                    Resume Builder
                  </Button>
                  <Button
                    variant={feature === "job-matcher" ? "default" : "outline"}
                    onClick={() => setFeature("job-matcher")}
                  >
                    Job Matcher
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  <Button variant={theme === "light" ? "default" : "outline"} onClick={() => setTheme("light")}>
                    Light
                  </Button>
                  <Button variant={theme === "dark" ? "default" : "outline"} onClick={() => setTheme("dark")}>
                    Dark
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={!selectedKey} onClick={generateUrls}>
                Generate Embed
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
              <CardDescription>Preview the embed and get the code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {iframeUrl ? (
                <Tabs defaultValue="preview">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="code">Embed Code</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="p-2">
                    <div className="border rounded-lg overflow-hidden" style={{ height: "400px" }}>
                      <iframe
                        src={iframeUrl}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="Embed Preview"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="code">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">{embedCode}</pre>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(embedCode)
                        alert("Embed code copied to clipboard!")
                      }}
                    >
                      Copy Code
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-[400px] border rounded-lg">
                  <p className="text-muted-foreground">Configure and generate the embed to see a preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your API key has the correct domain (use "*" or "localhost" for local testing)</li>
          <li>Check that the feature you're trying to embed is enabled for your API key</li>
          <li>Open your browser's developer console to see any error messages</li>
          <li>If you're still having issues, try creating a new API key specifically for local testing</li>
        </ul>
      </div>
    </div>
  )
}

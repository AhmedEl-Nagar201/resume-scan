"use client"

import { useState, useEffect } from "react"
import AdminProtectedRoute from "@/components/admin-protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  getAllUsers,
  getAllResumes,
  getUserResumesById,
  setUserAsAdmin,
  deleteUserById,
  deleteResume,
  type UserDocument,
  type ResumeDocument,
} from "@/lib/resume-service"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MoreHorizontal, Search, Trash2, FileText, Download, Shield, ShieldOff } from "lucide-react"
import { format } from "date-fns"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<UserDocument[]>([])
  const [resumes, setResumes] = useState<ResumeDocument[]>([])
  const [userResumes, setUserResumes] = useState<ResumeDocument[]>([])
  const [selectedUser, setSelectedUser] = useState<UserDocument | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingResumes, setIsLoadingResumes] = useState(false)
  const [isLoadingUserResumes, setIsLoadingUserResumes] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserResumesDialog, setShowUserResumesDialog] = useState(false)
  const { toast } = useToast()

  // Load users and resumes on component mount
  useEffect(() => {
    loadUsers()
    loadResumes()
  }, [])

  // Filter users and resumes based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredResumes = resumes.filter(
    (resume) =>
      resume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resume.userId && resume.userId.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Load all users
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Load all resumes
  const loadResumes = async () => {
    try {
      setIsLoadingResumes(true)
      const allResumes = await getAllResumes()
      setResumes(allResumes)
    } catch (error) {
      console.error("Error loading resumes:", error)
      toast({
        title: "Error",
        description: "Failed to load resumes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingResumes(false)
    }
  }

  // Load resumes for a specific user
  const loadUserResumes = async (userId: string) => {
    try {
      setIsLoadingUserResumes(true)
      const userResumes = await getUserResumesById(userId)
      setUserResumes(userResumes)
    } catch (error) {
      console.error("Error loading user resumes:", error)
      toast({
        title: "Error",
        description: "Failed to load user resumes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUserResumes(false)
    }
  }

  // Handle setting user as admin
  const handleSetUserAsAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      setIsProcessing(true)
      await setUserAsAdmin(userId, isAdmin)

      // Update local state
      setUsers((prevUsers) => prevUsers.map((user) => (user.id === userId ? { ...user, isAdmin } : user)))

      toast({
        title: "Success",
        description: `User ${isAdmin ? "promoted to admin" : "demoted from admin"} successfully.`,
      })
    } catch (error) {
      console.error("Error setting user as admin:", error)
      toast({
        title: "Error",
        description: `Failed to ${isAdmin ? "promote" : "demote"} user. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    try {
      setIsProcessing(true)
      await deleteUserById(userId)

      // Update local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
      setResumes((prevResumes) => prevResumes.filter((resume) => resume.userId !== userId))

      toast({
        title: "Success",
        description: "User and all associated resumes deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle deleting a resume
  const handleDeleteResume = async (resumeId: string) => {
    try {
      setIsProcessing(true)
      await deleteResume(resumeId)

      // Update local state
      setResumes((prevResumes) => prevResumes.filter((resume) => resume.id !== resumeId))
      setUserResumes((prevResumes) => prevResumes.filter((resume) => resume.id !== resumeId))

      toast({
        title: "Success",
        description: "Resume deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting resume:", error)
      toast({
        title: "Error",
        description: "Failed to delete resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle viewing user resumes
  const handleViewUserResumes = async (user: UserDocument) => {
    setSelectedUser(user)
    await loadUserResumes(user.id)
    setShowUserResumesDialog(true)
  }

  // Export resume as JSON
  const exportResumeAsJSON = (resume: ResumeDocument) => {
    try {
      const dataStr = JSON.stringify(resume.data, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", `${resume.name}.json`)
      linkElement.click()

      toast({
        title: "Success",
        description: "Resume exported as JSON.",
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

  return (
    <AdminProtectedRoute>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage users and resumes</p>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users or resumes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.displayName || "-"}</TableCell>
                              <TableCell>{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                              <TableCell>{format(user.lastLogin, "MMM d, yyyy")}</TableCell>
                              <TableCell>
                                {user.isAdmin ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    Admin
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    User
                                  </span>
                                )}
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
                                    <DropdownMenuItem onClick={() => handleViewUserResumes(user)}>
                                      <FileText className="h-4 w-4 mr-2" />
                                      View Resumes
                                    </DropdownMenuItem>
                                    {user.isAdmin ? (
                                      <DropdownMenuItem onClick={() => handleSetUserAsAdmin(user.id, false)}>
                                        <ShieldOff className="h-4 w-4 mr-2" />
                                        Remove Admin
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleSetUserAsAdmin(user.id, true)}>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Make Admin
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete User
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resumes">
            <Card>
              <CardHeader>
                <CardTitle>Resumes</CardTitle>
                <CardDescription>View and manage all resumes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingResumes ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Public</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResumes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No resumes found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredResumes.map((resume) => (
                            <TableRow key={resume.id}>
                              <TableCell>{resume.name}</TableCell>
                              <TableCell>{resume.userId || "Anonymous"}</TableCell>
                              <TableCell>{format(resume.createdAt, "MMM d, yyyy")}</TableCell>
                              <TableCell>{format(resume.updatedAt, "MMM d, yyyy")}</TableCell>
                              <TableCell>
                                {resume.isPublic ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Public
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                    Private
                                  </span>
                                )}
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
                                    <DropdownMenuItem onClick={() => exportResumeAsJSON(resume)}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Export JSON
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => handleDeleteResume(resume.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete Resume
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Resumes Dialog */}
        <Dialog open={showUserResumesDialog} onOpenChange={setShowUserResumesDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Resumes for {selectedUser?.displayName || selectedUser?.email || "User"}</DialogTitle>
              <DialogDescription>View and manage resumes for this user</DialogDescription>
            </DialogHeader>

            {isLoadingUserResumes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="rounded-md border max-h-[60vh] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Public</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userResumes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No resumes found for this user
                        </TableCell>
                      </TableRow>
                    ) : (
                      userResumes.map((resume) => (
                        <TableRow key={resume.id}>
                          <TableCell>{resume.name}</TableCell>
                          <TableCell>{format(resume.createdAt, "MMM d, yyyy")}</TableCell>
                          <TableCell>{format(resume.updatedAt, "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            {resume.isPublic ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                                Private
                              </span>
                            )}
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
                                <DropdownMenuItem onClick={() => exportResumeAsJSON(resume)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export JSON
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDeleteResume(resume.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Resume
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserResumesDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminProtectedRoute>
  )
}

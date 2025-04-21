"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Loader2, Save, Trash2 } from "lucide-react"
import { updateEmail, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      setEmail(user.email || "")
    }
  }, [user, loading, router])

  const reauthenticate = async () => {
    if (!user || !user.email) return false

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)
      return true
    } catch (error) {
      console.error("Reauthentication error:", error)
      toast({
        title: "Authentication Failed",
        description: "Your current password is incorrect.",
        variant: "destructive",
      })
      return false
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if ((newPassword || email !== user.email) && !currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password to make changes.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      // Only reauthenticate if we're making changes that require it
      if (newPassword || email !== user.email) {
        const isAuthenticated = await reauthenticate()
        if (!isAuthenticated) {
          setIsUpdating(false)
          return
        }
      }

      // Update email if changed
      if (email !== user.email && user.email) {
        await updateEmail(user, email)
      }

      // Update password if provided
      if (newPassword) {
        await updatePassword(user, newPassword)
        setNewPassword("")
        setConfirmPassword("")
      }

      setCurrentPassword("")

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password to delete your account.",
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      const isAuthenticated = await reauthenticate()
      if (!isAuthenticated) {
        setIsDeleting(false)
        return
      }

      await deleteUser(user)
      setShowDeleteDialog(false)

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })

      router.push("/")
    } catch (error: any) {
      console.error("Account deletion error:", error)
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your account details and password</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Required to update email or password"
                  />
                  <p className="text-sm text-muted-foreground">Enter your current password to confirm changes</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div>
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                Deleting your account will permanently remove all your data, including saved resumes. This action cannot
                be undone.
              </p>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                      <Input
                        id="deletePassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

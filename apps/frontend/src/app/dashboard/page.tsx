"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Room {
  id: number
  slug: string
  createdAt: string
  adminId: string
}

export default function Page() {
  const { isAuthenticated, isLoading, userId, token } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoomName, setNewRoomName] = useState("")
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  useEffect(() => {
    if(!isLoading && !isAuthenticated){
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    // Fetch user's rooms
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setRooms(data.rooms)
        }
      } catch (error) {
        console.error('Error fetching rooms:', error)
      }
    }

    if (isAuthenticated && token) {
      fetchRooms()
    }
  }, [isAuthenticated, token])

  const handleCreateRoom = async () => {
    setIsCreatingRoom(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newRoomName })
      })

      if (response.ok) {
        const data = await response.json()
        setRooms(prev => [...prev, data.room])
        toast.success('Room created successfully!')
        setNewRoomName('')
      } else {
        toast.error('Failed to create room')
      }
    } catch (error) {
      console.error('Error creating room:', error)
      toast.error('Error creating room')
    } finally {
      setIsCreatingRoom(false)
    }
  }

  if(isLoading){
    return <div>Loading...</div>
  }

  if(!isAuthenticated){
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create New Room</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Give your room a unique name. This will be used as the room's URL slug.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Enter room name..."
                />
                <DialogFooter>
                  <Button onClick={handleCreateRoom} disabled={isCreatingRoom}>
                    {isCreatingRoom ? 'Creating...' : 'Create Room'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Rooms</CardTitle>
                <CardDescription>Rooms you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rooms.filter(room => room.adminId === userId).map(room => (
                    <div 
                      key={room.id}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/room/${room.slug}`)}
                    >
                      <h3 className="font-medium">{room.slug}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Joined Rooms</CardTitle>
                <CardDescription>Rooms you're participating in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rooms.filter(room => room.adminId !== userId).map(room => (
                    <div 
                      key={room.id}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => router.push(`/room/${room.slug}`)}
                    >
                      <h3 className="font-medium">{room.slug}</h3>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Your recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">{rooms.length}</p>
                    <p className="text-sm text-muted-foreground">Total Rooms</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {rooms.filter(room => room.adminId === userId).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Rooms Created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

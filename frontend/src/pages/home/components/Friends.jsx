import { useState, useEffect } from "react";
import { UserPlus, Users, MessageSquare, Ban, Check, X, Trash2 } from "lucide-react";

export default function Friends({ user }) {
    const [activeSection, setActiveSection] = useState("all")
    const [allUsers, setAllUsers] = useState([])
    const [friends, setFriends] = useState([])
    const [requests, setRequests] = useState([])
    const [addUsername, setAddUsername] = useState("")
    const [blockedUsers, setBlockedUsers] = useState([])

    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function fetchUsers() {
            if (!user) return
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
                headers: { "Authorization": `Bearer ${user}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAllUsers(data.users)
            }
        }
        fetchUsers()
    }, [user])

    useEffect(() => {
        if (!user) return
        setError(null)
        setSuccess(false)

        if (activeSection === "all") {
            fetchFriends()
        } else if (activeSection === "pending") {
            fetchRequests()
        } else if (activeSection === "blocked") {
            fetchBlocked()
        }
    }, [activeSection, user])

    const fetchFriends = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends`, {
                headers: { "Authorization": `Bearer ${user}` }
            })
            const data = await res.json()
            if (res.ok) setFriends(data.friends || []);
        } catch (err) {
            setError("Failed to load friends")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchRequests = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/requests`, {
                headers: { "Authorization": `Bearer ${user}` }
            })
            const data = await res.json()
            if (res.ok) setRequests(data.friendRequests || [])
        } catch (err) {
            setError("Failed to load requests")
        } finally {
            setIsLoading(false)
        }
    }

    const fetchBlocked = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/blocked`, {
                headers: { "Authorization": `Bearer ${user}` }
            })
            const data = await res.json()
            if (res.ok) setBlockedUsers(data.blockedUsers || [])
        } catch (err) {
            setError("Failed to load blocked users")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendRequest = async () => {
        setError(null)
        setSuccess(false)
        setIsLoading(true)

        if (!addUsername.trim()) {
            setError("Please enter a username")
            setIsLoading(false)
            return
        }

        const targetUser = allUsers.find(u => u.username.toLowerCase() === addUsername.trim().toLowerCase())
        if (!targetUser) {
            setError("User not found");
            setIsLoading(false)
            return
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/friends/requests/add/${targetUser.id}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${user}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json()
            if (!res.ok) {
                throw new Error(typeof data.error.message === "string" ? data.error.message : "Failed to send request")
            }

            setSuccess(true)
            setAddUsername("")
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = async (endpoint, method) => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${endpoint}`, {
            method: method,
            headers: { "Authorization": `Bearer ${user}` }
        });
        if (res.ok) {
            if (activeSection === "pending") fetchRequests()
            else if (activeSection === "blocked") fetchBlocked()
            else fetchFriends()
        }
    }

    return (
        <section className="flex-1 flex flex-col bg-zinc-800 min-h-screen">
            <div className="flex items-center justify-between p-8 border-b border-zinc-700">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Friends</h1>
                <div className="flex bg-zinc-900 rounded-lg p-2">
                    <button onClick={() => setActiveSection("all")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${activeSection === "all" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}>All</button>
                    <button onClick={() => setActiveSection("pending")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${activeSection === "pending" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}>
                        Pending {requests.filter(r => r.type === 'received').length > 0 && `(${requests.filter(r => r.type === 'received').length})`}
                    </button>
                    <button onClick={() => setActiveSection("blocked")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${activeSection === "blocked" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}>Blocked</button>
                    <button onClick={() => setActiveSection("add")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${activeSection === "add" ? "bg-green-600 text-white shadow-sm" : "text-zinc-400 hover:text-green-500"}`}>Add Friend</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
                <div className="max-w-4xl">
                    {activeSection === "add" && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-zinc-400 uppercase tracking-wide mb-4">Add Friend</h2>
                            <div className="bg-zinc-900 rounded-lg p-8">
                                <div className="flex flex-col max-w-xl">
                                    <label htmlFor="username" className="text-xl font-medium text-zinc-300 mb-2">Username</label>
                                    <div className="flex gap-4">
                                        <input type="text" id="username" name="username" value={addUsername} onChange={(e) => setAddUsername(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200" />
                                        <button onClick={handleSendRequest}
                                            disabled={isLoading || !addUsername}
                                            className="px-6 py-2 bg-green-600 hover:bg-green-600 disabled:bg-green-800 disabled:opacity-50 text-white rounded-md transition-colors font-medium cursor-pointer"
                                        >
                                            {isLoading ? "Sending..." : "Send Request"}
                                        </button>
                                    </div>
                                    {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                                    {success && <p className="text-sm text-green-400 mt-2">Friend request sent successfully!</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "all" && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-zinc-400 uppercase tracking-wide mb-4">All Friends - {friends.length}</h2>
                            <div className="bg-zinc-900 rounded-lg overflow-hidden">
                                {friends.length === 0 && !isLoading ? (
                                    <div className="p-8 text-center">
                                        <Users className="w-12 h-auto text-zinc-700 mx-auto mb-4" />
                                        <p className="text-zinc-500">You don't have any friends yet.</p>
                                    </div>
                                ) : (
                                    friends && friends.map((friend) => {
                                        return <div key={friend.id} className="flex items-center justify-between p-4 gap-6 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors duration-200">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-white font-medium">{friend.username}</p>
                                                    <p className="text-sm text-zinc-500">{friend.aboutMe}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleAction(`friends/block/${friend.id}`, "PUT")} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-full transition-colors duration-200 cursor-pointer" title="Block">
                                                <Ban className="w-4 h-auto" />
                                            </button>
                                            <button onClick={() => handleAction(`friends/${friend.id}`, "DELETE")} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-full transition-colors duration-200 cursor-pointer" title="Remove">
                                                <Trash2 className="w-4 h-auto" />
                                            </button>
                                        </div>
                                    })
                                )}
                            </div>
                        </div>
                    )}
                    {activeSection === "pending" && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-zinc-400 uppercase tracking-with mb-4">
                                Pending Requests - {requests ? requests.length : 0}
                            </h2>
                            <div className="bg-zinc-900 rounded-lg overflow-hidden">
                                {(!requests || requests.length === 0) && !isLoading ? (
                                    <div className="p-8 text-center">
                                        <p className="text-zinc-500">No pending requests.</p>
                                    </div>
                                ) : (
                                    requests && requests.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-4 gap-6 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors duration-200">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-white font-medium">{req.user.username}</p>
                                                    <p className="text-sm text-zinc-500 capitalize">{req.type} Friend Request</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {req.type === 'received' ? (
                                                    <>
                                                        <button onClick={() => handleAction(`friends/requests/accept/${req.user.id}`, "PUT")} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-green-500 hover:text-green-400 rounded-full transition-colors duration-200 cursor-pointer">
                                                            <Check className="w-4 h-auto" />
                                                        </button>
                                                        <button onClick={() => handleAction(`friends/requests/refuse/${req.user.id}`, "PUT")} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-red-500 hover:text-red-400 rounded-full transition-colors duration-200 cursor-pointer">
                                                            <X className="w-4 h-auto" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => handleAction(`friends/${req.user.id}`, "DELETE")} className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 rounded-full transition-colors duration-200 cursor-pointer">
                                                        <X className="w-4 h-auto" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {activeSection === "blocked" && (
                        <div className="mb-8">
                            <h2 className="font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                                Blocked Users — {blockedUsers ? blockedUsers.length : 0}
                            </h2>
                            <div className="bg-zinc-900 rounded-lg overflow-hidden">
                                {(!blockedUsers || blockedUsers.length === 0) && !isLoading ? (
                                    <div className="p-8 text-center">
                                        <Ban className="w-12 h-auto text-zinc-700 mx-auto mb-4" />
                                        <p className="text-zinc-500">You haven't blocked anyone.</p>
                                    </div>
                                ) : (
                                    blockedUsers && blockedUsers.map((blockedUser) => (
                                        <div key={blockedUser.id} className="flex items-center justify-between p-4 gap-6 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors duration-200">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-white font-medium">{blockedUser.username}</p>
                                                    <p className="text-sm text-zinc-500">Blocked</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAction(`friends/${blockedUser.id}`, "DELETE")}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer"
                                            >
                                                Unblock
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

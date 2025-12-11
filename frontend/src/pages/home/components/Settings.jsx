import { useState, useEffect } from "react";
import { LogOut, X } from "lucide-react";
import useLogout from "../../../hooks/useLogout";

export default function Settings({ user, currentUser }) {
    const { logout } = useLogout()
    const [formData, setFormData] = useState({
        username: '',
        about: ''
    })
    const [originalData, setOriginalData] = useState({
        username: '',
        about: ''
    })
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (currentUser) {
            const data = {
                username: currentUser.username || '',
                about: currentUser.aboutMe || ''
            }
            setFormData(data)
            setOriginalData(data)
        }
    }, [currentUser])

    useEffect(() => {
        const changed = formData.username !== originalData.username || formData.about !== originalData.about
        setHasChanges(changed)
    }, [formData, originalData])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        setError(null)
        setSuccess(false)
    }

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${user}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username: formData.username, about: formData.about })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(typeof data.error.message === "string" ? data.error.message : data.error.message.map((err) => err.msg).join(", ") || "Failed to update profile")
            }

            const data = await res.json()
            const newData = {
                username: data.updatedUser.username || '',
                about: data.updatedUser.aboutMe || ''
            }

            setOriginalData(newData)
            setFormData(newData)
            setSuccess(true)

            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        setFormData(originalData)
        setError(null)
        setSuccess(false)
    }

    const handleLogout = () => {
        logout()
    }

    return (
        <section className="flex-1 flex flex-col bg-zinc-800 h-screen">
            <div className="flex items-center justify-between p-8 border-b border-zinc-700">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">User Settings</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-2xl">
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">My Account</h2>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-8 space-y-8 mb-8">
                        <div className="flex flex-col">
                            <label htmlFor="username" className="text-xl font-medium text-zinc-300 mb-2">Username</label>
                            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} maxLength={20} className="bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Username" />
                            <p className={`text-xs mt-1 text-end ${formData.username.length >= 18 ? "text-red-400" : "text-zinc-500"}`}>{formData.username.length}/20 characters</p>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="about" className="text-xl font-medium text-zinc-300 mb-2">  About Me</label>
                            <textarea id="about" name="about" value={formData.about} onChange={handleChange} maxLength={200} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none" placeholder="Tell us about yourself" />
                            <p className={`text-xs mt-1 text-end ${formData.about.length >= 180 ? "text-red-400" : "text-zinc-500"}`}>{formData.about.length}/200 characters</p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Account Actions</h2>

                    <div className="bg-zinc-900 rounded-lg p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium mb-1">Log Out</h3>
                                <p className="text-sm text-zinc-400">Sign out of your account</p>
                            </div>
                            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-md duration-200 transitions-color font-medium cursor-pointer"><LogOut className="w-4 h-auto" /> Log Out</button>
                        </div>
                    </div>
                </div>
            </div>

            {hasChanges && (
                <div className="w-full flex items-center justify-center">
                    <div className="max-w-2xl mb-8 rounded-lg border-zinc-700 bg-zinc-900 p-4 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">You have unsaved changes!</p>
                                {error && (
                                    <p className="text-sm text-red-400 mt-1">{error}</p>
                                )}
                                {success && (
                                    <p className="text-sm text-green-400 mt-1">Profile Updated Successfully</p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={handleReset} disabled={isSaving} className="px-4 py-2 text-blue-500 hover:underline disabled:opacity-50 transition-opacity duration-200 cursor-pointer">Reset</button>
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 cursor-pointer bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-md transition-colors font-medium duration-200">{isSaving ? "Saving..." : "Save Changes"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

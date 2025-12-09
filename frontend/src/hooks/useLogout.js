import { useContext } from "react"
import { useNavigate } from "react-router"
import { AuthContext } from "../contexts/AuthContext"

export default function useLogout() {
    const { dispatch } = useContext(AuthContext)
    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem("token")
        dispatch({ type: "LOGOUT" })
        navigate("/")
    }

    return { logout }
}

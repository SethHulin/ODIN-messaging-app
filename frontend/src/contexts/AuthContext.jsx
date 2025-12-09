import { createContext, useEffect, useReducer } from "react"

export const AuthContext = createContext()

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            return {
                ...state,
                user: action.user
            }
        case "LOGOUT":
            return {
                ...state,
                user: null
            }
        case "READY":
            return {
                ...state,
                ready: true
            }
        default: return state
    }
}

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        ready: false
    })

    useEffect(() => {
        const user = localStorage.getItem("token")

        if (user) {
            dispatch({ type: "LOGIN", user })
        }

        dispatch({ type: "READY" })
    }, [])

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider

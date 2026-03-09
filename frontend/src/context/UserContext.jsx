import React, { createContext, useState } from 'react'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
    const [ user, setUser ] = useState({
        email: '',
        fullname: {       // ✅ fixed casing to match backend
            firstname: '', // ✅ fixed casing
            lastname: ''   // ✅ fixed casing
        }
    })

    return (
        <UserDataContext.Provider value={{ user, setUser }}>
            {children} {/* ✅ removed unnecessary wrapping div */}
        </UserDataContext.Provider>
    )
}

export default UserContext
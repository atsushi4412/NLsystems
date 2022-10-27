import {createContext,useState} from "react";

type ContextType = {
    isLogin:boolean,
    setIsLogin: (value:boolean) => void,
    isLoading:boolean,
    setIsLoading: (value:boolean) => void
}

export const AuthContext = createContext({} as ContextType);

export const AuthProvider = (props:any) => {
    const [isLogin,setIsLogin] = useState(false);
    const [isLoading,setIsLoading] = useState(true);
    return (
        <AuthContext.Provider value={{
            isLogin,
            setIsLogin,
            isLoading,
            setIsLoading
        }}>{props.children}</AuthContext.Provider>
    );
}
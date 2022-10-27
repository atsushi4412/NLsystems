import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from 'axios';
import Home from "./pages/Home";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Verify from './pages/Verify';
import Bastabit from './pages/Dashboard';
import { AuthContext } from './AuthProvider';
import Dashboard from './pages/Dashboard';
import SignUpSuccess from './pages/SignUpSuccess';
import VerifyFailure from './pages/VerifyFailure';


type Props = {
  child: React.ReactNode;
}


const App = () => {
  const { isLogin, setIsLogin, isLoading, setIsLoading } = useContext(AuthContext);
  let isAuth = false;
  let yet = false;
  const login = async () => {
    setIsLoading(true);
    try {
      const loginKey = localStorage.getItem("AUTHORITY");
      const email = localStorage.getItem("email");
      if (loginKey !== undefined && loginKey !== null && email !== undefined && email !== null) {
        await axios.post(`/islogin`, { loginKey: loginKey, email: email })
          .then((res) => {
            if (res.status === 200) {
              isAuth = true;
              setIsLogin(true);
            }
          }).catch((err) => {
            console.error(err);
            setIsLogin(false);
          });
      }
      else {
        setIsLogin(false);
      }
    }
    catch {
      setIsLogin(false);
    }
    setIsLoading(false);
  }
  const RequireAuth: any = ({ child }: Props) => {
    //login();
    if (!isLoading) {
      if (isLogin) {
        console.log(`auth ${isLogin}`);
        return child;
      }
      else {
        console.log(`auth ${isLogin}`);
        return <Navigate to="/login" />;
      }
    }
    else {
      console.log("auth now loading");
      return <></>;
    }
  }


  const RequireNoAuth: any = ({ child }: Props) => {
    //login();
    if (!isLoading) {
      if (isLogin) {
        console.log(`auth ${isLogin}`);
        return <Navigate to="/dashboard" />;
      }
      else {
        console.log(`auth ${isLogin}`);
        return child;
      }
    }
    else {
      console.log("auth now loading");
      return <></>;
    }
  }

  useEffect(() => {
    console.log("useEffect");
    if (!yet) login();
  }, [setIsLogin]);


  return (
    <BrowserRouter>
      <Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/login"} element={<RequireNoAuth child={<Login />} />} />
        <Route path={"/signup"} element={<RequireNoAuth child={<SignUp />} />} />
        <Route path={"/verify"} element={<RequireNoAuth child={<Verify />} />} />
        <Route path={"/dashboard"} element={<RequireAuth child={<Dashboard />} />} />
        <Route path={"/signupsuccess"} element={<SignUpSuccess/>} />
        <Route path={"/verifyfailure"} element={<VerifyFailure />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

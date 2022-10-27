import React, { useContext, useEffect, useReducer } from 'react';
import {TextField,Button,Card} from "@mui/material";
import styles from "../css/Login.module.css";
import { Link ,useNavigate} from 'react-router-dom';
import axios from "axios";
import jsSHA from "jssha";
import { AuthContext } from '../AuthProvider';

type State = {
    email:string,
    password:string,
    isButtonDisabled:boolean,
    helperText: string,
    isError:boolean
};

const initialState: State = {
    email:"",
    password:"",
    isButtonDisabled:true,
    helperText: "",
    isError:false
}

type Action =
    | {type:"setEmail",payload:string}
    | {type:"setPassword",payload:string}
    | {type:"setIsButtonDisabled",payload:boolean}
    | { type: "loginSuccess", payload: string }
    | { type: "loginFailed", payload: string }
    | {type:"setIsError",payload:boolean};


const reducer = (state:State,action: Action): State => {
    switch(action.type) {
        case "setEmail":
            return {...state,email: action.payload};
        case "setPassword":
            return {...state,password: action.payload};
        case "setIsButtonDisabled":
            return {...state,isButtonDisabled:action.payload};
        case "setIsError":
            return {...state,isError: action.payload};
        case "loginSuccess":
            return { ...state, helperText: action.payload, isError: false };
        case "loginFailed":
            return { ...state, helperText: action.payload, isError: true };
        default:
            return state;
    }
}

const Login:React.FC = () => {
    const navigate = useNavigate();
    const { isLogin, setIsLogin, isLoading, setIsLoading } = useContext(AuthContext);
    const [state,dispatch] = useReducer(reducer,initialState);
    useEffect(() => {
        if(state.email.trim() && state.password.trim()){
            dispatch({type:"setIsButtonDisabled",payload:false});
        }
        else{
            dispatch({type:"setIsButtonDisabled",payload:true});
        }
    },[state.email,state.password]);

    //login process
    const handleLogin = async () => {
        const check = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!check.test(state.email)){
            dispatch({ type: "loginFailed", payload: "input mail address" });
        }
        else if(!(state.email && state.password)){
            console.error("where is form data");
            dispatch({ type: "loginFailed", payload: "Cannot find form data.Please try again." });
        }
        else{
            const shaObj = new jsSHA("SHA-256","TEXT",{encoding:"UTF8"});
            shaObj.update(state.password);
            const passwordHash = shaObj.getHash("HEX");
            if(passwordHash){
                console.log(passwordHash);
                await axios.post(`/login`, { email: state.email ,password:passwordHash})
                    .then((res) => {
                        console.log(res);
                        if(res.status === 200){
                            //sessionStorage.setItem("AUTHORITY",res.headers.authority);
                            localStorage.setItem("AUTHORITY", res.data.loginKey);
                            localStorage.setItem("email",state.email);
                            dispatch({ type: "loginSuccess", payload: "Login Successfully" });
                            setIsLogin(true);
                            navigate("/dashboard");
                        }
                        else{
                            dispatch({type:"loginFailed",payload:`cannot login`});
                        }
                    }).catch((err) => {
                        console.error(err);
                        dispatch({ type: "loginFailed", payload: `cannot login` });
                    });
            }
        }
    }

    const handleKeyPress = (event:React.KeyboardEvent) => {
        if(event.code==="Enter"|| event.key==="Enter"){
            state.isButtonDisabled || handleLogin();
        }
    }

    const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({type:"setEmail",payload:event.target.value});
    }

    const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({type:"setPassword",payload:event.target.value});
    }


    return (
        <React.Fragment>
            <div className={styles.login_main}>
                <div className={styles.form}>
                    <TextField onChange={handleEmailChange} onKeyDown={handleKeyPress} error={state.isError} helperText={state.helperText} fullWidth id="email" type="email" label="email" placeholder='email' margin='normal'/>
                    <TextField onChange={handlePasswordChange} onKeyDown={handleKeyPress} error={state.isError} helperText={state.helperText}  fullWidth id="password" type="password" label="password" placeholder='password' margin='normal' />
                    <Button onClick={handleLogin} disabled={state.isButtonDisabled} variant='contained' size='large' sx={{width:"100%",marginTop:"15px"}}>Login</Button>
                    <a className={styles.form_signup}>Don't have an account?</a>
                    <Link to={"/signup"} style={{fontSize:"12px",textDecoration:"none",color:"blue"}}>SignUp</Link>
                </div>
            </div>
        </React.Fragment>
    );
}

export default Login;
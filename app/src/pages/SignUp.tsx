import React, { useEffect, useReducer } from 'react';
import { TextField, Button} from "@mui/material";
import styles from "../css/SignUp.module.css";
import { Link ,useNavigate} from 'react-router-dom';
import axios from "axios";
import jsSHA from "jssha";

type State = {
    email: string,
    password: string,
    passwordconfirm:string,
    isButtonDisabled: boolean,
    helperText:string,
    isError: boolean
};

const initialState: State = {
    email: "",
    password: "",
    passwordconfirm:"",
    isButtonDisabled: true,
    helperText:"",
    isError: false
}

type Action =
    | { type: "setEmail", payload: string }
    | { type: "setPassword", payload: string }
    | { type: "setPasswordConfirm", payload:string}
    | { type: "setIsButtonDisabled", payload: boolean }
    | { type: "signupSuccess", payload:string}
    | { type: "signupFailed", payload:string}
    | { type: "setIsError", payload: boolean };


const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "setEmail":
            return { ...state, email: action.payload };
        case "setPassword":
            return { ...state, password: action.payload };
        case "setPasswordConfirm":
            return { ...state,passwordconfirm:action.payload};
        case "setIsButtonDisabled":
            return { ...state, isButtonDisabled: action.payload };
        case "setIsError":
            return { ...state, isError: action.payload };
        case "signupSuccess":
            return { ...state,helperText:action.payload,isError:false};
        case "signupFailed":
            return { ...state,helperText: action.payload,isError:true};
        default:
            return state;
    }
}

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(reducer, initialState);
    useEffect(() => {
        if (state.email.trim() && state.password.trim() && state.passwordconfirm.trim()) {
            dispatch({ type: "setIsButtonDisabled", payload: false });
        }
        else {
            dispatch({ type: "setIsButtonDisabled", payload: true });
        }
    }, [state.email, state.password,state.passwordconfirm]);

    const handleLogin = async () => {
        const check = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(state.password !== state.passwordconfirm){
            dispatch({type:"signupFailed",payload:"don't match password"});
        }
        else if(state.password.length < 8){
            dispatch({ type: "signupFailed", payload: "Please enter a password of at least 8 characters" });
        }
        else if(!check.test(state.email)){
            dispatch({type:"signupFailed",payload:"input mail adress"});
        }
        else {
            const shaObj = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
            shaObj.update(state.password);
            const passwordHash = shaObj.getHash("HEX");
            if (passwordHash) {
                console.log(passwordHash);
                await axios.post(`/signup`, { email: state.email, password: passwordHash })
                    .then((res) => {
                        console.log(res);
                        if (res.status === 200) {
                            dispatch({ type: "signupSuccess", payload: "SignUp Successfully" });
                            navigate("/signupsuccess");
                        }
                        else{
                            dispatch({ type: "signupFailed", payload: "SignUp Failed" });
                        }
                    }).catch((err) => {
                        console.error(err)
                        dispatch({ type: "signupFailed", payload: "SignUp Failed" });
                    });
            }
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.code === "Enter" || event.key === "Enter") {
            state.isButtonDisabled || handleLogin();
        }
    }

    const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({ type: "setEmail", payload: event.target.value });
    }

    const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({ type: "setPassword", payload: event.target.value });
    }

    const handlePasswordConfirmChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        dispatch({ type: "setPasswordConfirm",payload:event.target.value});
    }


    return (
        <React.Fragment>
            <div className={styles.login_main}>
                <div className={styles.form}>
                    <TextField onChange={handleEmailChange} onKeyDown={handleKeyPress} fullWidth error={state.isError} helperText={state.helperText} id="email" type="email" label="email" placeholder='Email' margin='normal' />
                    <TextField onChange={handlePasswordChange} onKeyDown={handleKeyPress} fullWidth error={state.isError} helperText={state.helperText} id="password" type="password" label="password" placeholder='Password' margin='normal' />
                    <TextField onChange={handlePasswordConfirmChange} onKeyDown={handleKeyPress} fullWidth error={state.isError} helperText={state.helperText} id="password-confirm" type="password" label="password-confirm" placeholder='Password-confirm' margin='normal' />
                    <a className={styles.form_carefull}>By pressing the create account button, you agree to the terms of use and privacy policy.</a>
                    <Button onClick={handleLogin} disabled={state.isButtonDisabled} variant='contained' size='large' sx={{ width: "100%", marginTop: "15px" }}>SignUp</Button>
                    <a className={styles.form_login}>Already have an account?</a>
                    <Link to={"/login"} style={{textDecoration:"none",fontSize:"12px",color:"blue"}}>Login</Link>
                </div>
            </div>
        </React.Fragment>
    );
}

export default SignUp;
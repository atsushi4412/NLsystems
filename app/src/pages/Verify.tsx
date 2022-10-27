import React,{useContext, useEffect,useReducer} from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { TextField, Button } from "@mui/material";
import axios from "axios";
import styles from "../css/Verify.module.css";
import { AuthContext } from '../AuthProvider';


const Verify: React.FC = () => {
    const [searchParams]:any = useSearchParams();
    const { isLogin, setIsLogin, isLoading, setIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    let isLoad = false;
    const verify = async() => {
        await axios.post(`/verify`, { id: searchParams.get("id"), match: searchParams.get("match1"), email: searchParams.get("email") }).then((res) => {
            if (res.status === 200) {
                localStorage.setItem("AUTHORITY", res.data.loginKey);
                localStorage.setItem("email", searchParams.get("email"));
                setIsLogin(true);
                navigate("/dashboard");
            }
            else {
                navigate("/failureverify");
            }
        }).catch((err) => {
            console.error(err);
            navigate("/failureverify");
        });
    }
    const check = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    useEffect(() => {
        if (!isLoad && searchParams.get("id") && searchParams.get("match1") && searchParams.get("email") && check.test(searchParams.get("email"))) {
            isLoad = true;
            verify();
        }
    }, []);


    
    if(searchParams.get("id") && searchParams.get("match1") && searchParams.get("email") && check.test(searchParams.get("email"))){
        return (
            <React.Fragment>
                <div className={styles.main}>
                    <div className={styles.form}>
                        <a className={styles.form_carefull}>Verify Page</a>
                    </div>
                </div>
            </React.Fragment>
        );
    }
    else{
        return (
            <React.Fragment>
                <div className=''>
                    <h2>Invalid authentication URL</h2>
                    <h3>Please issue the authentication URL again or use a valid authentication URL.</h3>
                </div>
            </React.Fragment>
        );
    }
    
}

export default Verify;
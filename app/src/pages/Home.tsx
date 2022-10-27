import React, { useContext } from 'react';
import styles from "../css/Home.module.css"
import RouterButton from '../components/RouterButton';
import { Button, SxProps, Theme } from "@mui/material";
import { AuthContext } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';

const Home:React.FC = () => {
    const navigate = useNavigate();
    const { isLogin, setIsLogin, isLoading, setIsLoading } = useContext(AuthContext);
    const handleLogout = () => {
        localStorage.removeItem("AUTHORITY");
        localStorage.removeItem("email");
        setIsLogin(false);
        navigate("/");
    }
    return (
        <React.Fragment>
            <div className={styles.home_div}>
                <header className={styles.home_header}>
                    <h1>
                        <a className={styles.header_a} href={'/'}>Title</a>
                    </h1>
                    <nav className={styles.header_nav}>
                        <ul className={styles.header_ul}>
                            <li className={styles.header_li}><a className={styles.header_a} href={'/'}>HOME</a></li>
                            <li className={styles.header_li}><a className={styles.header_a} href={'/dashboard'}>DASHBOARD</a></li>
                            <li className={styles.header_li}><a className={styles.header_a} href={'/support'}>SUPPORT</a></li>
                        </ul>
                    </nav>
                    <div className={styles.header_button}>
                        {isLogin ? <Button onClick={handleLogout} variant={"contained"} sx={{ backgroundColor: "black" }}>{"Logout"}</Button> : <RouterButton shape={"contained"} sx={{ backgroundColor: "black" }} content={"LOGIN"} to={"/login"}></RouterButton>}
                    </div>
                </header>
            </div>
        </React.Fragment>
    );
}

export default Home;
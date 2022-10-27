import express from "express";
import log4js from "log4js";
import mysql2 from "mysql2/promise";
import jsSHA from "jssha";
import nodemailer from "nodemailer";

import * as CONFIG from "./config.json";

const logger = log4js.getLogger();
logger.level = "debug";

const db_setting: mysql2.ConnectionOptions = {
    host: "db",
    user: "mysqluser",
    password: "mysqlpassword",
    database: "mysqldb",
    "timezone": "jst"
};

const transporter = nodemailer.createTransport({
    service: "gmail",
    port:465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});


const app: express.Express = express();

const emailCheck = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

app.use(express.json());


app.listen(process.env.PORT, () => {
    console.log(`Start on port ${process.env.PORT}`);
});

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("this is api");
});

app.post("/signup", async (req: express.Request, res: express.Response) => {
    logger.info(`/signup got access with email:${req.body.email}`);
    if (!emailCheck.test(req.body.email)) {
        logger.warn(`received email is not email format`);
        res.status(401).send("email parameter is not email format");
        return;
    }
    if (req.body.password.length > 64) {
        logger.warn(`received password is not password format`);
        res.status(401).send("password parameter is not password format");
        return;
    }
    let connection: any;
    try {
        connection = await mysql2.createConnection(db_setting);
        await connection.beginTransaction();
        const [[match]]: any = await connection.query(`select * from accounts where email = ? limit 1`, [req.body.email]);
        const now = new Date();
        now.setTime(now.getTime() + 1000 * 60 * 60 * 9);
        //仮登録中
        if (match && match.email && now.getTime() < match.verifyExpiredAt.getTime() && match.state === 0) {
            res.status(401).send("既に使用されているメールアドレスです");
        }
        else if (match && match.state !== 0) {
            res.status(401).send("既に使用されているメールアドレスです");
        }
        else if (match && match.email) {
            const expire = new Date(now.getTime());
            expire.setHours(expire.getHours() + 1);
            const [row2, fields2]: any = await connection.query(`UPDATE accounts set password = ?, verifyExpiredAt = ?, createdAt = ?, updatedAt = ?  where id = ?`, [req.body.password, expire.toISOString().slice(0, 19).replace('T', ' '), now.toISOString().slice(0, 19).replace('T', ' '), now.toISOString().slice(0, 19).replace('T', ' '), match.id]);
            logger.info(`update account data (state:0) email:${req.body.email}`);
            const verifyUrl = CONFIG.origin + `/verify?id=${match.id}&match1=${req.body.password}&email=${req.body.email}`;
            console.log(verifyUrl);
            await connection.commit();
            res.status(200).send("success signup");
        }
        else {
            const expire = new Date(now.getTime());
            expire.setHours(expire.getHours() + 1);
            const [row2, fields2]: any = await connection.query(`INSERT INTO accounts (email, password, verifyExpiredAt, createdAt, updatedAt, state) values ('${req.body.email}', '${req.body.password}', '${expire.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}', '${now.toISOString().slice(0, 19).replace('T', ' ')}', '0')`);
            logger.info(`insert account data (state:0) email:${req.body.email}`);
            const verifyUrl = CONFIG.origin + `/verify?id=${row2.insertId}&match1=${req.body.password}&email=${req.body.email}`;
            console.log(verifyUrl);
            
            transporter.sendMail({
                from: process.env.EMAIL,
                to: req.body.email,
                subject: "verify mail",
                text: `This is a verify link.Click this link. ${verifyUrl}`
            },async (err_mail,info) => {
                if(err_mail){
                    logger.error(err_mail.stack);
                    await connection?.rollback();
                    res.status(401).send("fail to signup");
                }
                else{
                    await connection.commit();
                    res.status(200).send("success signup");
                }
            });
        }
    } catch (err: any) {
        logger.error(err.stack);
        await connection?.rollback();
        res.status(401).send("fail to signup");
    } finally {
        await connection?.end();
        return;
    }
});

app.post("/login", async (req: express.Request, res: express.Response) => {
    logger.info(`/login got access with email:${req.body.email}`);
    if (!(req.body.email && req.body.password)) {
        res.status(401).send("parameter doesnt have email or password");
        return;
    }
    if (!emailCheck.test(req.body.email)) {
        logger.warn(`received email is not email format`);
        res.status(401).send("email parameter is not email format");
        return;
    }
    let connection;
    try {
        connection = await mysql2.createConnection(db_setting);
        await connection.beginTransaction();
        const [[match]]: any = await connection.query(`select * from accounts where email = ? and password = ? and state = 1 limit 1`, [req.body.email, req.body.password]);
        if (match && match.id) {
            const loginKey = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
            loginKey.update(String(match.id) + String(Math.floor(Math.random() * 100)));
            const [row1, fields1] = await connection.query(`update accounts set loginKey = ? where id = ?`, [loginKey.getHash("HEX"), match.id]);
            await connection.commit();
            res.status(200).send({ msg: "Success login", loginKey: loginKey.getHash("HEX") });
        }
        else {
            res.status(401).send("メールアドレスまたはパスワードが間違っています");
        }
    } catch (err: any) {
        logger.error(err.stack);
        await connection?.rollback();
        res.status(401).send("fail to signup");
    } finally {
        await connection?.end();
        return;
    }
});

app.post("/verify", async (req: express.Request, res: express.Response) => {
    logger.info(`/verify got access with email:${req.body.email}`);
    if (!(req.body.email && req.body.match && req.body.id)) {
        res.status(401).send("parameter is not match format");
        return;
    }
    let connection;
    try {
        connection = await mysql2.createConnection(db_setting);
        await connection.beginTransaction();
        const [[match]]: any = await connection.query(`select * from accounts where id = ? limit 1`, [req.body.id]);
        const now = new Date();
        now.setTime(now.getTime() + 1000 * 60 * 60 * 9);
        if (match && now.getTime() < match.verifyExpiredAt.getTime() && match.email === req.body.email && match.password === req.body.match && match.state === 0) {
            const loginKey = new jsSHA("SHA-256", "TEXT", { encoding: "UTF8" });
            loginKey.update(String(req.body.id) + String(Math.floor(Math.random() * 100)));
            const [row1, fields1] = await connection.query(`update accounts set emailVerifiedAt = ?,updatedAt = ?,loginKey = ?,state = "1" where id = ?`, [now.toISOString().slice(0, 19).replace('T', ' '), now.toISOString().slice(0, 19).replace('T', ' '), loginKey.getHash("HEX"), req.body.id]);
            res.status(200).send({ msg: "Success verify", loginKey: loginKey.getHash("HEX") });
        }
        else {
            res.status(401).send("fail to verify");
        }
        await connection.commit();
    } catch (err: any) {
        logger.error(err.stack);
        await connection?.rollback();
        res.status(401).send("fail to verify");
    } finally {
        await connection?.end();
        return;
    }

});

app.post("/islogin", async (req: express.Request, res: express.Response) => {
    logger.info(`/islogin got access`);
    if (!(req.body.email && req.body.loginKey)) {
        res.status(401).send("parameter is not match format");
        return;
    }
    let connection;
    try {
        connection = await mysql2.createConnection(db_setting);
        await connection.beginTransaction();
        const [[row]]: any = await connection.query(`select count(*) as num from accounts where email = ? and loginKey = ? limit 1`, [req.body.email, req.body.loginKey]);
        if (row.num && row.num > 0) {
            console.log("true");
            res.status(200).send("islogin is true");
        }
        else {
            console.log("false");
            res.status(401).send("islogin is false");
        }
        await connection.commit();
    } catch (err: any) {
        logger.error(err.stack);
        await connection?.rollback();
        res.status(401).send("fail to connect db");
    } finally {
        await connection?.end();
        return;
    }
});
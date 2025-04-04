import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
const app = express();

// standard middlewares

// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials:true
// }))

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//import routes
import userRouter from './routes/user.routes.js';


// routes usage/decalration

app.use("/api/v1/users", userRouter);



export{app}
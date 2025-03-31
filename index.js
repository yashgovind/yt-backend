import connectDb from "./utils/dbConnect.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
});

// connect Databse
connectDb().then(() => {
    // Start the server
    console.log("Database connected successfully");
    app.listen(process.env.PORT || 9870, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.log("Database connection failed", err);
});

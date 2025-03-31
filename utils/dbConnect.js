import mongoose from "mongoose";

async function connectDb() {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
        console.log(`\n Connected DB at HOST : ${connectionInstance.connection.host} `);

    } catch (error) {
        console.log(`Mongoose Connection Error `, error);
        process.exit(1);
    }
}
export default connectDb;
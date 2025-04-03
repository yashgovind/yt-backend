import mongoose, { Schema } from 'mongoose'

const subscriptionSchema = new Schema({
    susbcriber: {
        // one who is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        // one to whom we are subscribing
        type: Schema.Types.ObjectId,
        ref:"User"
    },
}, { timestamps: true });


export const Subscription = mongoose.model("Subscription", subscriptionSchema);
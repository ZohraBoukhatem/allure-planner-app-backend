const mongoose = require("mongoose")
const Schema = mongoose.Schema

const querySchema = new Schema(
    {
        name: {
            type: String,   
            required: true
        },
        email: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: false
        }
    }
)
const Query = mongoose.model("Query", querySchema);

module.exports = Query;
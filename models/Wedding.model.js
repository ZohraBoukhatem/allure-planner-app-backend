const mongoose = require("mongoose")
const Schema = mongoose.Schema

const weddingSchema = new Schema(
    {
        bride: {
            brideFirstName: {
                type: String,
                required: true
            },
            brideLastName: {
                type: String,
                required: true
            }
        },  
        groom: {
            groomFirstName: {
                type: String,
                required: true
            },
            groomLastName: {
                type: String,
                required: true
            }
        }
        ,  
        date: {
            type: Date
            //('2020-01-21')
        },    
        venues:       [
            {
                venueName: String,
                venueAddress: String,
                venueTel: Number
            }
        ],
        budget: {
           amount: { type: Number, min: 0},
           currency: {type: String, enum: ["EUR", "USD", "KN"]}
        },
        vendors: [
            {
                vendorName: String,
                vendorAddress: String,
                vendorTel: Number
            }
        ],
        schedule: {
            reception: String,
            ceremony: String,
            afterparty: String
        }, 
        guestList: [
                {
                    guestName: String,
                    link: {
                        type:String,
                        enum: ["bride's", "groom's"],
                        required: true,
                    }
            }
        ] 
    }
)
const Wedding = mongoose.model("Wedding", weddingSchema);

module.exports = Wedding;
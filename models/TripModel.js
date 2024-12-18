const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    // vehicleId: {
    //     type: String
    // },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "vehicle", // Reference the Vehicle model
        default: null,
      },
    
    price: {
        type: Number
    },
    departure: {
        type: String
    },
    destination: {
        type: String
    },
    leavingTime:{
        type:String
    },
    arrivalTime:{
        type:String
    },
    tripdate:{
        type:Date
        
    },
    status:{
        type: String,
        enum: ['pending', 'completed'],
        default:'pending'
    },
    
    

    createdAt: {
        type: Date,
        default: Date.now(),
    }

})

const Trip = mongoose.model('trip', tripSchema);

module.exports = Trip;
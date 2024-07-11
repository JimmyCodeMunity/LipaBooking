// // models/Booking.js

// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// // Define the Booking schema
// const BookingSchema = new Schema({
//   userId: {
//     type: String,
//     required: true,
//   },
//   seats: {
//     type: [String],
//     required: true,
//   },

//   vehicleId: {
//     type: String,
//     required: true,
//   },
//   bookingDate: {
//     type: Date,
//     default: Date.now,
//   },
//   vehiclename:{
//     type:String
//   },
//   vehiclereg:{
//     type:String
//   },

//   leavesAt:{
//     type:String
//   },
//   from:{
//     type:String
//   },
//   to:{
//     type:String
//   },
//   tripdate:{
//     type:String
//   }
// });
// const Booking = mongoose.model("bookings", BookingSchema);

// module.exports = Booking;



// models/Booking.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the Booking schema
const BookingSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  seats: {
    type: [String],
    required: true,
  },
  vehicleId: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  vehiclename: {
    type: String,
  },
  vehiclereg: {
    type: String,
  },
  leavesAt: {
    type: String,
  },
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  tripdate: {
    type: String,
  },
  // New fields for transaction details
  transactionId: {
    type: String,
  },
  transactionStatus: {
    type: String,
  },
  bookingStatus:{
    type: String,
    default: 'Pending',
  }
  // transactionDate: {
  //   type: Date,
  //   default: Date.now,
  // },
});

const Booking = mongoose.model("bookings", BookingSchema);

module.exports = Booking;

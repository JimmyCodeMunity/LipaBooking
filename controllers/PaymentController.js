// src/server.js

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const path = require("path");
const Booking = require("../models/BookingModel");
require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./.env",
  });
}

const port = process.env.PORT;
const tokenUrl = process.env.tokenUrl;
const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret;

const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
  "base64"
);

const getToken = async () => {
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    };

    const response = await axios.get(tokenUrl, requestOptions);
    console.log("Token obtained:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

const requestPayment = async (req, res) => {
  try {
    const token = await getToken();
    const {
      MerchantCode,
      NetworkCode,
      PhoneNumber,
      TransactionDesc,
      AccountReference,
      Currency,
      Amount,
      userId,
      seats,
      vehicleId,
      vehiclename,
      vehiclereg,
      price,
      tripdate,
      leavesAt,
      from,
      to,
    } = req.body;

    console.log("Request body:", req.body);

    // Validate your body
    const tripDetails = {
      userId,
      seats,
      vehicleId,
      vehiclename,
      vehiclereg,
      price,
      tripdate,
      leavesAt,
      from,
      to,
    };

    const jsonString = JSON.stringify(tripDetails);
    const urlEncodedBookingData = encodeURIComponent(jsonString);
    const CallBackURL = process.env.CallBackURL;
    // const merchantCode = process.env.MerchantCode;
    console.log(CallBackURL)

    const formetedCallbackUrl = `${CallBackURL}?bookingData=${urlEncodedBookingData}`;
    const response = await axios.post(
      "https://sandbox.sasapay.app/api/v1/payments/request-payment/",
      {
        MerchantCode,
        NetworkCode,
        PhoneNumber,
        TransactionDesc,
        AccountReference,
        Currency,
        Amount,
        CallBackURL: formetedCallbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.json(response.data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.response.data);
  }
};

const handleBooking = async (bookingData) => {
  let {
    userId,
    seats,
    vehicleId,
    vehiclename,
    vehiclereg,
    price,
    tripdate,
    leavesAt,
    from,
    to,
  } = bookingData;

  if (typeof seats === "string") {
    seats = seats.split(",").map((seat) => seat.trim());
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    throw new Error("Seats should be a non-empty array");
  }

  if (!vehicleId) {
    throw new Error("Vehicle ID is required");
  }

  const existingBookings = await Booking.find({ vehicleId });
  const bookedSeats = existingBookings.reduce(
    (acc, booking) => acc.concat(booking.seats),
    []
  );

  const isSeatAlreadyBooked = seats.some((seat) => bookedSeats.includes(seat));
  if (isSeatAlreadyBooked) {
    throw new Error("One or more seats are already booked");
  }

  const userBookings = existingBookings.filter(
    (booking) => booking.userId === userId
  );
  const userBookedSeats = userBookings.reduce(
    (acc, booking) => acc.concat(booking.seats),
    []
  );
  const isSeatAlreadyBookedByUser = seats.some((seat) =>
    userBookedSeats.includes(seat)
  );
  if (isSeatAlreadyBookedByUser) {
    throw new Error("You have already booked one or more of these seats");
  }

  const newBooking = new Booking({
    userId,
    seats,
    vehicleId,
    vehiclename,
    vehiclereg,
    price,
    leavesAt,
    from,
    to,
    tripdate,
  });
  await newBooking.save();
  return newBooking;
};

// const handleCallback = async (req, res) => {
//   const callbackData = req.body;
//   console.log("C2B Callback Data:", callbackData);

//   const bookingData = req.query.bookingData;
//   const jsonString = decodeURIComponent(bookingData);
//   const jsonData = JSON.parse(jsonString);

//   if (callbackData.ResultCode == 0) {
//     console.log("A successful transaction");
//     try {
//       // Do proper validation before adding the record to db
//       const booking = await handleBooking(jsonData);
//       console.log(booking);
//       // For callbacks returning a structured json data is not necessary
//       res.status(200).json("ok");
//     } catch (error) {
//       console.error("Booking error:", error);
//       res.status(200).json("ok");
//     }
//   } else {
//     console.log("A failed transaction");
//     res.status(200).json("ok");
//   }
// };


const handleCallback = async (req, res) => {
  const callbackData = req.body;
  console.log("C2B Callback Data:", callbackData);

  const bookingData = req.query.bookingData;
  const jsonString = decodeURIComponent(bookingData);
  const jsonData = JSON.parse(jsonString);

  if (callbackData.ResultCode == 0) {
    console.log("A successful transaction");
    try {
      const transactionId = callbackData.CheckoutRequestID;
      console.log('transid', transactionId);
      const transactionStatus = "Success";
      // const transactionDate = new Date(callbackData.TransactionDate);

      const newBooking = await handleBooking(jsonData);

      // Update the booking with transaction details
      newBooking.transactionId = transactionId;
      newBooking.transactionStatus = transactionStatus;
      // newBooking.transactionDate = transactionDate;

      await newBooking.save();

      console.log(newBooking);
      res.status(200).json("ok");
    } catch (error) {
      console.error("Booking error:", error);
      res.status(200).json("ok");
    }
  } else {
    console.log("A failed transaction");
    try {
      const transactionId = callbackData.CheckoutRequestID;
      const transactionStatus = "Failed";
      const transactionDate = new Date(callbackData.TransactionDate);

      const failedBooking = new Booking({
        ...jsonData,
        transactionId,
        transactionStatus,
        transactionDate,
      });

      // await failedBooking.save();
      console.log(failedBooking);
      res.status(200).json("ok");
    } catch (error) {
      console.error("Error saving failed transaction:", error);
      res.status(200).json("ok");
    }
  }
};


const queryPaymentStatus = async (req, res) => {
  const { CheckoutRequestID } = req.body;
  console.log("requested id",CheckoutRequestID);
  try {
    const token = await getToken();
    const response = await axios.post(
      "https://sandbox.sasapay.app/api/v1/payments/transaction-status/",
      {
        "MerchantCode": 600980,
        "CheckoutRequestID": CheckoutRequestID
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error("Error querying payment status:", error);
    res.status(500).json(error.response.data);
  }
};

const getPaymentStatus = async(req,res)=>{
  try {
    const {transactionId} = req.params;
    const state = await Booking.find({transactionId});
    if(!state){
        res.status(404).json({message:'you have not added any payment with that email'});
    }
    console.log(state.status)
    res.status(200).json(state);

} catch (error) {
    console.log(error)
    res.status(500).json({ error: "data not located" })

}
}

app.post("/request-payment", requestPayment);
app.post("/c2b-callback-results", handleCallback);
app.post("/payment-query", queryPaymentStatus);



module.exports = {
  requestPayment,
  handleCallback,
  queryPaymentStatus,
  getPaymentStatus
};
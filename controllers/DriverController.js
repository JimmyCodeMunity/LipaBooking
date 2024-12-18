const express = require('express');
const bcrypt = require('bcryptjs')
const Driver = require('../models/DriverModel');
const jwt = require("jsonwebtoken");
const Trip = require('../models/TripModel');


if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({
      path: "../.env",
    });
  }

const jwttoken = process.env.JWT_SECRET;
// console.log("jwt",jwttoken)

const createDriver = async(req,res) =>{
    try {
        const {username,email,service,phone,password} = req.body;

        const existingDriver = await Driver.findOne(email);
        if(existingDriver){
            return res.status(400).json({message:'Driver already exists'});
        }else{
            const hashedPassword = await bcrypt.hash(password, 10);
            const driver = await Driver.create({
                username,
                email,
                service,
                phone,
                password: hashedPassword
            });
            const token = jwt.sign({email:driver.email}, jwttoken);
            if(res.status(200)){
              console.log("login successfull")
                return res.send({status:"ok",data:token})
            }else{
                return res.send({error:"error"})
            }
        }
        
    } catch (error) {
        console.log('error creating new driver',error)
        res.status(500).json({message:error.message});
        
    }
}

const findAllDrivers = async(req,res)=>{
    try {
        const alldrivers = await Driver.find();
        res.status(200).json(alldrivers);
        
    } catch (error) {
        console.log('error finding all drivers',error)
        res.status(500).json({message:error.message});
        
    }
}

// get my trips
const getMyTrips = async(req,res)=>{
    try {
        const {id} = req.params;
        const driver = await Driver.findById(id);
        if(!driver){
            console.log("Driver not found")
            return res.status(400).json({message:"Driver not found"});
        }
        const driverVehicleId = driver.vehicleId;
        const trip = await Trip.find({vehicleId: driverVehicleId})
        .populate("vehicleId")
        if(trip){
            console.log("driver trips",trip)
            return res.status(200).json(trip)
        }
        // console.log("driver",driver.vehicleId)
        // res.status(200).json(driver.vehicleId)
        
    } catch (error) {
        console.log("error while getting driver trips")
        return res.status(500).json({message:"error while getting driver trips"})
        
    }
}
const getMyIncompleteTrips = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if driver exists
      const driver = await Driver.findById(id);
      if (!driver) {
        console.log("Driver not found");
        return res.status(400).json({ message: "Driver not found" });
      }
  
      // Get the driver's vehicleId
      const driverVehicleId = driver.vehicleId;
  
      // Find trips where vehicleId matches and status is 'pending'
      const trips = await Trip.find({ vehicleId: driverVehicleId, status: "pending" })
        .populate("vehicleId"); // Populate the vehicleId details
  
      if (trips.length > 0) {
        console.log("Driver's pending trips", trips);
        return res.status(200).json(trips);
      } else {
        console.log("No pending trips found for this driver");
        return res.status(200).json({ message: "No pending trips found" });
      }
  
    } catch (error) {
      console.error("Error while getting driver's pending trips", error);
      return res.status(500).json({ message: "Error while getting driver's pending trips" });
    }
  };

//   get my complete trips

  const getMyCompleteTrips = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if driver exists
      const driver = await Driver.findById(id);
      if (!driver) {
        console.log("Driver not found");
        return res.status(400).json({ message: "Driver not found" });
      }
  
      // Get the driver's vehicleId
      const driverVehicleId = driver.vehicleId;
  
      // Find trips where vehicleId matches and status is 'pending'
      const trips = await Trip.find({ vehicleId: driverVehicleId, status: "completed" })
        .populate("vehicleId"); // Populate the vehicleId details
  
      if (trips.length > 0) {
        console.log("Driver's pending trips", trips);
        return res.status(200).json(trips);
      } else {
        console.log("No pending trips found for this driver");
        return res.status(200).json({ message: "No pending trips found" });
      }
  
    } catch (error) {
      console.error("Error while getting driver's pending trips", error);
      return res.status(500).json({ message: "Error while getting driver's trips" });
    }
  };
  

const driverLogin = async(req,res)=>{
    try {
        const {email,password} = req.body;
        console.log(email,password)
        const user = await Driver.findOne({email});

        if(!user){
            console.log("User not found")
            return res.status(400).json({message:"User not found"});
        }
        console.log("user",user)
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            console.log("invalid credentials")
            return res.status(400).json({message:"Invalid credentials"});
        }
        else{
            const token = jwt.sign({email:user.email}, jwttoken,{ expiresIn: "7d" });
            console.log("token generated",token)
            if(res.status(200)){
              console.log("login successfull")
                return res.send({status:"ok",data:token})
            }else{
                console.log("error",error)
                return res.send({error:"error"})
            }
        }
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"error during driver login"})
        
    }
}

// const driverLogin = async (req, res) => {
//     try {
//       const { email, password } = req.body;
//       const driver = await Driver.findOne({ email });
  
//       if (!driver) {
//         res.status(404).json({ error: "driver not found" });
//         return;
//       }
  
//       const isPasswordValid = await bcrypt.compare(password, driver.password);
  
//       if (!isPasswordValid) {
//         res.status(401).json({ error: "Invalid password" });
//         return;
//       }
//       const token = jwt.sign({ email: driver.email }, process.env.JWT_SECRET, {
//         expiresIn: 7,
//       });
//       res.status(200).json({ driver: driver, token: token });
//       // console.log({admin,token})
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ error: "Failed to login" });
//     }
//   };

const getDriverData = async(req,res)=>{
    const {token} = req.body;
    try {
      const user = await jwt.verify(token,jwttoken)
      const useremail = user.email;
      const userdata = await Driver.findOne({email:useremail})
      if(!userdata){
        return res.status(400).json({message:"User not found"})
      }
      console.log(userdata)
      res.status(200).json({message:"Driver data fetched successfully", userdata})
      
      
    } catch (error) {
      console.log("error getting driver data:", error);
      res.status(500).json({ message: error.message });
      return;
      
    }
  }

  //update trip by id
  const DriverUpdateTripById = async (req, res) => {
    try {
      const { id } = req.params; // Trip ID from URL params
  
      // Find and update the trip status to "completed"
      const trip = await Trip.findByIdAndUpdate(
        id, 
        { status: "completed" }, // Only update the 'status' field
        { new: true } // Return the updated document
      );
  
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found' });
      }
  
      res.status(200).json({
        message: "Trip status updated successfully",
        updatedTrip: trip
      });
      console.log("Trip status updated successfully");
    } catch (error) {
      console.error("Error updating trip status:", error);
      res.status(500).json({ message: error.message });
    }
  };
  


module.exports = {
    createDriver,
    findAllDrivers,
    driverLogin,
    getMyTrips,
    getDriverData,
    getMyIncompleteTrips,
    getMyCompleteTrips,
    DriverUpdateTripById
  
}
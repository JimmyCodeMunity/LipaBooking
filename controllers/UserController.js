const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel')




const createUser = async (req, res) => {
    try {
        const { username, email, phone, address, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                username,
                email,
                phone,
                address,
                password: hashedPassword
            })
            res.status(200).json({ message: "User created Successfully",user });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating new user" });

    }

}


const findAllUsers = async(req,res) =>{
    try {
        const users = await User.find({});
        res.status(200).json(users);    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error finding all users" });
        
    }
}

const AssignSeats =  async (req, res) => {
    
    const { email } = req.params;
    const { seats } = req.body; // Expecting an array of seat numbers
    
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
  
    // Check if the seats are available
    const availableSeats = seats.filter(seat =>!user.seats.some(existingSeat => existingSeat.seatNumber === seat));
    if (availableSeats.length === 0) {
      return res.status(400).json({ message: 'All seats are already booked.' });
    }
  
    // Assign the seats to the user
    user.seats.push(...availableSeats.map(seat => ({ seatNumber: seat, isBooked: true })));
    await user.save();
  
    res.status(200).json({ message: 'Seats assigned successfully.' });
  };
  


// const getAllUsersByEmail = async (req, res) => {
//     try {
//         const {email} = req.params;
//         const user = await User.find({email});
//         if(!user){
//             res.status(404).json({message:'you have not added any user with that email'});
//         }
//         res.status(200).json(user);

//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ error: "data not located" })

//     }
// }



// const Login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             res.status(404).json({ error: 'User not found' });
//             return;
//         }

//         const isPasswordValid = await bcrypt.compare(password, user.password);

//         if (!isPasswordValid) {
//             res.status(401).json({ error: 'Invalid password' });
//             return;
//         }
//             res.status(200).json({ message: 'Login successful',userid: user._id});
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Failed to login' });
//     }
// };

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 7,
    });
    res
      .status(200)
      .json({
        message: "Login successful",
        userid: user._id,
        userdata: user,
        token: token,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to login" });
  }
};


const getAllUsersById = async (req, res) => {
    try {
      // Get the ID from the request parameters
      const { id } = req.params;
  
      // Find the user by ID
      const user = await User.findById(id);
  
      // If the user is not found, return a 404 response
      if (!user) {
        return res.status(404).json({ message: 'User not found with the provided ID' });
      }
  
      // If the user is found, return the user data
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };

  const updateUserByEmail = async(req,res) =>{
    try {
    const { email } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Find the brand by its name
      req.body, // Update the brand with the request body data
      { new: true } // Return the updated brand as the response
    );

    // If brand fetched cannot be found
    if (!updatedUser) {
      return res.status(404).json({ message: `Cannot find user with email ${email}` });
    }

    res.status(200).json(updatedUser);
    console.log("Data updated successfully");

  } catch (error) {
    res.status(500).json({ message: error.message });

  }
}



const updateUserPasswordByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    // Check if newPassword is provided
    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { password: hashedPassword },
      { new: true }
    );

    // If user with the provided email is not found
    if (!updatedUser) {
      return res.status(404).json({ message: `Cannot find user with email ${email}` });
    }

    res.status(200).json(updatedUser);
    console.log('Password updated successfully');
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};




module.exports = {
    createUser,
    findAllUsers,
    getAllUsersByEmail,
    Login,
    AssignSeats,
    getAllUsersById,
    updateUserPasswordByEmail,
    updateUserByEmail
}
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const nodemailer = require("nodemailer");

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
        password: hashedPassword,
      });
      res.status(200).json({ message: "User created Successfully", user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating new user" });
  }
};

const findAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error finding all users" });
  }
};

const AssignSeats = async (req, res) => {
  const { email } = req.params;
  const { seats } = req.body; // Expecting an array of seat numbers

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check if the seats are available
  const availableSeats = seats.filter(
    (seat) =>
      !user.seats.some((existingSeat) => existingSeat.seatNumber === seat)
  );
  if (availableSeats.length === 0) {
    return res.status(400).json({ message: "All seats are already booked." });
  }

  // Assign the seats to the user
  user.seats.push(
    ...availableSeats.map((seat) => ({ seatNumber: seat, isBooked: true }))
  );
  await user.save();

  res.status(200).json({ message: "Seats assigned successfully." });
};

const getAllUsersByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.find({ email });
    if (!user) {
      res
        .status(404)
        .json({ message: "you have not added any user with that email" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "data not located" });
  }
};

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
    res.status(200).json({
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
      return res
        .status(404)
        .json({ message: "User not found with the provided ID" });
    }

    // If the user is found, return the user data
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, // Find the brand by its name
      req.body, // Update the brand with the request body data
      { new: true } // Return the updated brand as the response
    );

    // If brand fetched cannot be found
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: `Cannot find user with email ${email}` });
    }

    res.status(200).json(updatedUser);
    console.log("Data updated successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserPasswordByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { password } = req.body;

    // Check if newPassword is provided
    if (!password) {
      return res.status(400).json({ message: "New password is required" });
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
      return res
        .status(404)
        .json({ message: `Cannot find user with email ${email}` });
    }

    res.status(200).json(updatedUser);
    console.log("Password updated successfully");
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    // If user not found, send error message
    if (!user) {
      res.status(404).send({ message: "User not found" });
    }

    // Generate a unique JWT token for the user that contains the user's id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      // service: "gmail",
      host: "mail.xeddotravelink.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:3000/reset-password/${token}">http://localhost:3000/reset-password/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const password = req.body.newPassword;
    // console.log("got password", password);
    // Verify the token sent by the user
    const decodedToken = jwt.verify(req.params.token, process.env.JWT_SECRET);
    // console.log("got token", req.params.token);
    // console.log("saved token", process.env.JWT_SECRET);

    // If the token is invalid, return an error
    if (!decodedToken) {
      console.log("error verifying token");
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(401).send({ message: "no user found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    console.log(req.body.newPassword);
    req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

    // Update user's password, clear reset token and expiration time
    user.password = req.body.newPassword;
    await user.save();

    // Send success response
    res.status(200).send({ message: "Password updated" });
    console.log("password updated");
  } catch (err) {
    // Send error response if any error occurs
    console.log("error is", err);
    res.status(500).send({ message: err.message });
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
  updateUserByEmail,
  forgotPassword,
  resetPassword,
};

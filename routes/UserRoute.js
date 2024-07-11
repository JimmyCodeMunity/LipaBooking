const express = require('express');
const { createUser, findAllUsers, getAllUsersByEmail, Login, AssignSeats, getAllUsersById, updateUserByEmail, updateUserPasswordByEmail } = require('../controllers/UserController');
const { getAllBookedSeats, getUserBookings } = require('../controllers/BookingController');



const router = express.Router();
router.use(express.json());

//allow url encoding
router.use(express.urlencoded({extended:false}))

//create user router
router.post('/createuser',createUser);

//find all the users
router.get('/allusers',findAllUsers);

//find user  by email
router.get('/user/:email',getAllUsersByEmail);


router.get('/userdata/:id',getAllUsersById);

//assign seats
router.put('/assign-seats/:email',AssignSeats);


router.put('/updateuser/:email',updateUserByEmail);


router.put('/updatepassword/:email',updateUserPasswordByEmail);


//handle bookings
// router.post('/bookseat',handleBooking);


//fetch all the booked seats
router.get('/bookedseats/:vehicleId',getAllBookedSeats);

//get all my bookings
router.get('/userbookings/:userId',getUserBookings);


//get bookings

///user login
router.post('/login',Login);

module.exports = router;
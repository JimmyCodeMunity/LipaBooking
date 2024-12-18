const express = require('express');
const { createDriver, findAllDrivers, driverLogin, getMyTrips, getDriverData, getMyIncompleteTrips, getMyCompleteTrips, DriverUpdateTripById } = require('../controllers/DriverController');



const router = express.Router();
router.use(express.json());

//allow url encoding
router.use(express.urlencoded({extended:false}))

//create user router
router.post('/createdriver',createDriver);

//find all the users
router.get('/alldrivers',findAllDrivers);
router.post('/driverlogin',driverLogin);
router.get('/drivertrips/:id',getMyTrips);
router.get('/driverincompletetrips/:id',getMyIncompleteTrips);
router.get('/drivercompletedtrips/:id',getMyCompleteTrips);
router.post('/driverdata',getDriverData)


// update
router.put('/driverupdatetrip/:id',DriverUpdateTripById)

//find user  by email
// router.get('/user/:email',getAllUsersByEmail);


// router.get('/userdata/:id',getAllUsersById);

// //assign seats
// router.put('/assign-seats/:email',AssignSeats);


// router.put('/updateuser/:email',updateUserByEmail);


// router.put('/updatepassword/:email',updateUserPasswordByEmail);


//handle bookings
// router.post('/bookseat',handleBooking);


//fetch all the booked seats
// router.get('/bookedseats/:vehicleId',getAllBookedSeats);

//get all my bookings
// router.get('/userbookings/:userId',getUserBookings);


//get bookings

///user login
// router.post('/login',Login);

module.exports = router;
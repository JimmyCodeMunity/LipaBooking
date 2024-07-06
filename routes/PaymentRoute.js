const express = require('express');
const { requestPayment, handleCallback, queryPaymentStatus } = require('../controllers/PaymentController');
const router = express.Router();
router.use(express.json());


//handle all payments
//allow url encoding
router.use(express.urlencoded({extended:false}))

//create user router
router.post('/requestpayment',requestPayment);
router.post('/c2b-callback-results',handleCallback);
router.post("/payment-query", queryPaymentStatus)

module.exports = router;
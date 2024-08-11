const express = require('express');
const Driver = require('../models/DriverModel');

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
            res.status(201).json(driver);
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


module.exports = {
    createDriver,
    findAllDrivers
}
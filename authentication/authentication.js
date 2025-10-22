const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const dbcon = require('../dbconnection/db_conn')
const User = require('../Model/User')
require('dotenv').config({path: '../.env'});


dbcon()

const app = express()
app.use(express.json())
app.use(cors())


app.post("/register",async(req,res)=>{
    const form = req.body

    try{
        const hashpassword = await bcrypt.hash(form.password,10)

        const registerUser = await User.create({...form, password:hashpassword})

        if(!registerUser){
            console.log("Register Error")
            res.status(401).json({success:false, message:"Register unsuccessful"})
        }else{
            console.log("Successfully Register")
            res.status(200).json({success:true, message:"Register Successful"})
        }
    }catch(error){
        console.error('Error',error)
        res.status(500).json({success:false,message:"Register unsuccessful"})
    }
})

app.post("/signin",async(req,res)=>{
    const {email, password} = req.body

    try{
        const user = await User.findOne({email})

        if(!user){
            console.log("Invalid Email or Password")
            return res.status(201).json({success:false,message:"Invalid Email or Password"})
        }

        const isPasswordMatch = await bcrypt.compare(password,user.password)

        if(!isPasswordMatch){
            console.log("Invalid Email or Password");
            return res.status(201).json({success:false, message:"Invalid Email Or Password"})
        }

        const payload = {
            id: user._id,
            email: user.email
        };

   
         const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn:"1h" });


        console.log("Login successful");
            return res.status(200).json({
            success: true,
            message: "Login successful",
            token:token,
            user: { id: user._id, email: user.email }
        });


    }catch(error){
        console.error('Error',error)
        res.status(500).json({success:false,message:"Unexpected Error"})
    }
})


app.listen(8000,()=>{
    console.log("Server is running to port 8000")
})
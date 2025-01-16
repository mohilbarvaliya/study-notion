const User = require('../models/User.model')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const auth = async (req,res,next) => {
    try {
        const token = req.cookies.token 
                    || req.body.token 
                    || req.header('Authorization').replace('Bearer ',"")
        
        if(!token){
            return res.status(404).json({
                message:"Token not found",
                success:false
            })
        }

        try {
            const decode = await jwt.verify(token,process.env.JWT_SECRET)
            req.user = decode
            next()

        } catch (e) {
            console.log("error while decode token",e)
            return res.status(505).json({
                success:false,
                message:"Invalid token"
            })
        }

    } catch (e) {
        console.log('error in auth middleware',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const isStudent = async(req,res,next) => {
    try {
        if(req.user.accountType !== 'Student'){
            return res.status(300).json({
                success:false,
                message:"You are not a student"
            })
        }
        next()
    } catch (e) {
        console.log("errorn in isstudent verify middleware")
    }
}

const isInstructor = async(req,res,next) => {
    try {
        if(req.user.accountType !== 'Instructor'){
            return res.status(300).json({
                success:false,
                message:"You are not a Instructor"
            })
        }
        next()
    } catch (e) {
        console.log("errorn in isInstructor verify middleware")
    }
}

const isAdmin = async(req,res,next) => {
    try {
        if(req.user.accountType !== 'Admin'){
            return res.status(300).json({
                success:false,
                message:"You are not a Admin"
            })
        }
        next()
    } catch (e) {
        console.log("errorn in isAdmin verify middleware")
    }
}
const User = require('../models/User.model')
const OTP = require('../models/OTP.model')
const Profile = require('../models/Profile.model')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()


const mailsender = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: 'User of this mail is exiest' })
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        const Result = await OTP.findOne({ otp })

        while (Result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
            Result = await OTP.findOne({ otp })
        }

        const otpPayload = { email, otp }

        const otpbody = await OTP.create(otpPayload)
        console.log("created otp body", otpbody)

        return res.status(200).json({
            message: 'OTP sent to your email',
            success: true
        })


    }
    catch (e) {
        console.log("Error in mailsender controller in auth", e)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}


const SignUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            password,
            confirmPassword,
            email,
            accountType,
            contactNumber,
            otp
        } = req.body

        if (!firstName || !lastName || !password || !confirmPassword || !email || !accountType || !contactNumber || !otp) {
            return res.status(400).json({
                message: "Please enter your all details",
                success: false
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                success: false
            })
        }

        const exiestuser = await User.findOne({email})

        if(exiestuser){
            return res.status(400).json({
                success:false,
                message:"this user is already exiest"
            })
        }

        const recentotp = await OTP.find({email}).sort({createdAt:-1}).limit(1)

        if(recentotp.length <= 0){
            return res.status(400).json({
                success:false,
                message:"Otp not fetchout"
            })
        } 
        else if(otp !== recentotp.otp){
            return res.status(400).json({
                success:false,
                message:"Otp is not correct"
                })
        }

        const hashpassword = await bcrypt.hash(password,10)

        const profileDetail =await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })


        const user = await User.create(
            {
                firstName,
                lastName,
                email,
                password:hashpassword,
                accountType,
                additionaladditionalDetails:profileDetail._id,
                image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
            }
        )

        return res.status(200).json({
            success:true,
            message:"User register successfully",
            user
        })


    }
    catch (e) {
        console.log("Error in signup controller", e)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        })
    }
}

const Login = async(req,res)=>{
    try{
        const {email,password} = req.body
        
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"please enter all detail"
            })
        }

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                success:false,
                message:"user not exiest"
            })
        }

        if(await bcrypt.compare(password,user.password)){
            const payload ={
                email,
                id:user._id,
                role:user.accountType
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2d"
            })
            user.token=token
            user.password=undefined

            const options ={
                expires:new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true
            }

            res.cookie('token',token,options).status(200).json({
                success:true,
                message:"login success",
                token,
                user
            })
        }

        return res.status(404).json({
            success:false,
            message:"incorrect password "
        })

    }
    catch(e){
        console.log("Error in login controller",e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const changepassword = async(req,res)=>{
    try{
        const {email,password,confirmPassword}=req.body
        if(!email || !password || !confirmPassword){
            return res.status(404).json({
                success:false,
                message:"please enter all fields"
            })
        }

        if(password !== confirmPassword){
            return res.status(404).json({
                success:false,
                message:"password and confirm password should be same"
                })
        }

        const user = await User.findOne({email}) 

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        if(await bcrypt.compare(user.password,password)){
            return res.status(300).json({
                success:false,
                message:"old and new password are same"
            })
        }

        const newpassword= await bcrypt.hash(password,10)
        const updateduserdetail = await User.findOneAndUpdate({email},{password:newpassword})
        if(updateduserdetail){
            return res.status(200).json({
                success:true,
                message:"password changed successfully"
            })
        }

    }
    catch(e){
        console.log("Error in change password controller",e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
            })
    }
}

module.exports = {changepassword,Login,SignUp,mailsender}
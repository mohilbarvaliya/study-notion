const User = require('../models/User.model')
const mailsender = require('../utils/mailSender')
const bcrypt = require('bcrypt')

const resetPasswordToken = async (req,res) => {
    try {
        const {email} = req.body
        if(!email){
            return res.status(400).json({message: 'Email is required',success:false})
        }
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message: 'User not found',success:false})
        }
        
        const token = await crypto.randomUUID()

        const updateDetail = await User.findAndUpdate(
                                        {   
                                            email
                                        },
                                        {
                                            token,
                                            resetPasswordExpires:Date.now()+5*60*1000
                                        }
        )

        const url = `http://localhost:3000/update-password/${token}`

        await mailsender(email,"Password Reset Link",
            `Click this link for reset password: ${url}`
        )

        return res.status(200).json({
            success:true,
            message:"mail sent successfully"
        })


    } catch (e) {
        console.log('Error in resetpasswordToken controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


const resetpassword = async (req,res) => {
    try{
        const {password,confirmpassword,token} = req.body

        if(!password || !confirmpassword || !token){
            return res.status(400).json({message: 'Password and confirm password and token is required'})
        }

        if(password !== confirmpassword){
            return res.status(400).json({message: 'Password and confirm password should be same'})
        }

        const user = await User.findOne({token})
        if(!user){
            return res.status(400).json({message: 'Invalid token',success:false})
        }

        if(user.resetPasswordExpires > Date.now()){
            return res.status(400).json({message: 'Password reset link is expired',success:fals})
        }

        const hashpassword = await bcrypt.hash(password,10)

        const userdetail = await user.findAndUpdate({token},{password:hashpassword},{new:true})

        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })

    }
    catch(e){
        console.log('Error in resetpassword controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
            })
    }
}

module.exports = {resetPasswordToken,resetpassword}
const User = require('../models/User.model')
const Profile = require('../models/Profile.model')

const updateProfile = async (req,res) => {
    try {
        const {gender,dateOfBirth="",about="",contactNumber} = req.body

        const userId = req.user._id

        if(!gender || !contactNumber || !userId){
            return res.status(400).json({message:"Please fill all the fields"})
        }

        const userdetail = await User.findById(userId)
        const profiledetail = await Profile.findByIdAndUpdate(userdetail.additionalDetails,{
            gender,
            dateOfBirth,
            about,
            contactNumber
        },{new:true})

        return res.status(200).json({
            success:true,
            message:"Profile detail updated successfully",
            data:profiledetail
        })

    } catch (e) {
        console.log('error in updateprofile controller',e)
        return res.status(500).json({
            success:flase,
            message:"Internal Server Error"
        })
    }
}

const deleteAccount = async (req,res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if(!user) {
            return res.status(404).json({message: 'User not found'})
            }
        await Profile.findByIdAndDelete(user.additionalDetails) 
        await User.findByIdAndDelete(userId)

        return res.status(200).json({
            success:true,
            message:"User Deleted Successfully"
        })
    } catch (e) {
        console.log('error in deleteAccount controller',e)
        return res.status(500).json({
            success:flase,
            message:"Internal Server Error"
        })
    }
}

const getAllUserDetail = async (req,res) => {
    try {
        const userId = req.user._id
        const userDetail = await User.findById(userId).populate('additionalDetails').exec()
        return res.status(200).json({
            success:true,
            message:"All Detail Geted Successfully",
            data:userDetail
        })
    } catch (e) {
        console.log('error in getAllUserDetail controller',e)
        return res.status(500).json({
            success:flase,
            message:"Internal Server Error"
        })
    }
}

module.exports = { updateProfile,deleteAccount,getAllUserDetail}
const Course = require('../models/Course.model')
const User = require('../models/User.model')
const Category = require('../models/Category.model')
const { ImageUploadToCloudinary } = require('../utils/ImageUploader')
require('dotenv').config()

const CreateCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, tag,category } = req.body

        const { thumbnail } = req.files

        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !category) {
            return res.status(400).json({ message: 'Please fill all the fields' })
        }

        const userId = req.user._id
        const userdetail = await User.findById(userId)

        if (!userdetail) {
            return res.status(400).json({ message: 'User not found' })
        }

        const categoryDetail = await Category.findById(category)

        if (!categoryDetail) {
            return res.status(400).json({ message: 'Tag not found' })
        }

        const thumbnailImage = await ImageUploadToCloudinary(thumbnail, process.env.FOLDER_NAME)

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag,
            thumbnail: thumbnailImage.secure_url,
            category
        })

        await User.findByIdAndUpdate({ _id: userId }, {
            $push: {
                courses: newCourse._id
            }
        },
            { new: true })

        await Category.findByIdAndUpdate({_id:Category},{
            $push:{
                courses:newCourse._id
                }
        })

        res.status(201).json({ message: 'Course created successfully', newCourse })

    } catch (e) {
        console.log("Error in create course controller", e)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


const getAllCourses = async(req,res)=>{
    try {
        const courses = await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }).populate('Instructor').exec()
        return res.status(200).json({
            success:true,
            message:"All Courses Get Successfully",
            courses
        })
    } catch (e) {
        console.log('Error in getAllCorses controller',e)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            })
    }
}

module.exports = { CreateCourse,getAllCourses }
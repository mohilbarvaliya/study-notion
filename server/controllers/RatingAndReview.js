const { default: mongoose } = require('mongoose')
const RatingAndReview = require('../model/RatingandReview.model')
const Course = require('../models/Course.model')
const User = require('../models/User.model')

const createReview = async(req,res) => {
    try {
        const userId = req.user._id
        const { courseId,rating,review } = req.body

        if(!courseId || !rating || !review ){
            return res.status(400).json({
                success:false,
                message:"please field all detail"
            })
        }

        const uid = mongoose.Types.ObjectId(userId)
        if(!await Course.studentsEnrolled.includes(uid)){
            return res.status(300).json({
                success:false,
                message:"Person not authorize for review"
            })
        }

        if(!await RatingAndReview.user.includes(uid)){
            return res.status(310).json({
                success:false,
                message:"You already submit one rating and review"
            })
        }

        const ratingandreviewdetail = await RatingAndReview.create({
            user:uid,
            course:mongoose.Types.ObjectId(courseId),
            rating,
            review
        },{new:true})

        if(!ratingandreviewdetail) {
            return res.status(210).json({
                success:flase,
                message:"review can't send"
            })
        }

        await Course.findByIdAndUpdate(courseId,{
            $push:{
                ratingandreview:ratingandreviewdetail._id
            }
        })

        return res.status(200).json({
            success:true,
            message:"review send successfully"
        })


    } catch (e) {
        console.log("Error in create review controller",e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const averagerating = async (req,res) => {
    try {
        const {courseId} = req.body

        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course:mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        if(result.length > 0 ){
            return res.status(200).json({
                success:true,
                message:"average rating",
                averageRating:result[0].averageRating
            })
        }

        return res.status(200).json({
            success:true,
            message:"average rating",
            averageRating:0
        })

    } catch (e) {
        console.log("Error in averageRating controller",e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


//getAllRatingAndReviews

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}
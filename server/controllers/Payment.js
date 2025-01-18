const User = require('../models/User.model')
const Course = require('../models/Course.model')
const mailSender = require('../utils/mailSender')
const { instance } = require('../config/razorpay.config')
const { default: mongoose } = require('mongoose')
require('dotenv').config()

const capturePayment = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user._id

        if (!courseId) {
            return res.status(400).json({ message: 'Course Id is required' })
        }

        const courseDetail = await Course.findById(courseId)
        if (!courseDetail) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const uid = new mongoose.Types.ObjectId(userId)
        const userenroll = await courseDetail.studentsEnrolled.includes(uid)

        if (userenroll) {
            return res.status(400).json({ message: 'You are already enrolled in this course' })
        }

        const option = {
            "amount": courseDetail.price * 100,
            "currency": "INR",
            "receipt": Math.random(Date.now()).toString(),
            "notes": {
                courseId,
                userId
            }
        }

        const paymentResponse = await instance.orders.create(option)
        console.log(paymentResponse)

        return res.status(200).json({
            success: true,
            message: "Payment Done",
            data: paymentResponse
        })

    }
    catch (e) {
        console.log("error in capture payment controller")
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const verifySignature = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        const shasum = crypto.createHmac('sha2566', process.env.RAZORPAY_SECRET)
        shasum.update(JSON.stringify(req.body))
        const digest = shasum.digest('hex')

        if (digest === signature) {
            try {
                const { courseId, userId } = req.body.payload.payment.entity.notes
                const courseDetail = await Course.findByIdAndUpdate(courseId, {
                    $push: {
                        studentsEnrolled: userId
                    }
                }, { new: true })

                const userDetail = await User.findByIdAndUpdate(userId, {
                    $push: {
                        coursesEnrolled: courseId
                    }
                },
                    { new: true })

                await mailSender(
                    enrolledStudent.email,
                    `Payment Received`,
                    paymentSuccessEmail(
                        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                    )
                )

                return res.status(200).json({
                    success: true,
                    message: "Course Enrolled Successfully",
                })

            } catch (e) {
                console.log("error in enroll student part")
                return res.status(500).json({
                    success: false,
                    message: "Internal Server Error"
                })
            }
        }

    } catch (e) {
        console.log("error in verify signature controller")
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}
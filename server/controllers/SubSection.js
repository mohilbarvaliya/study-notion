const Section = require('../models/Section.model')
const Subsection = require('../models/Subsection.model')
const {ImageUploadToCloudinary} = require('../utils/ImageUploader')
require('dotenv').config()

const createSubSection = async (req,res) => {
    try {
        const { sectionId,title,timeDuration,description } = req.body
        
        const video = req.files.videofile

        if(!sectionId|| !title || !timeDuration || !description || !video){
            return res.status(400).json({message: "Please fill all the fields"})
        }

        const uploaddetail = await ImageUploadToCloudinary(video,process.env.FOLDER_NAME)

        const subsectiondetail = await Subsection.create({
            title,
            description,
            image: uploaddetail.secure_url,
            timeDuration
        })

        if(!subsectiondetail){
            return res.status(330).json({
                success:false,
                message:'Sub section not create successfully'
            })
        }

        await Section.findByIdAndUpdate(sectionId,{
            $push: {
                subSection:subsectiondetail._id
            }
        })

        return res.status(200).json({
            message:'Sub section created successfully',
            success:true
        })

    } catch (e) {
        console.log('error in create sub section controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const updateSubSection = async(req,res) => {
    try {
        const {title,timeDuration,description,subsectionId } =req.body
        
        if(!title || !timeDuration || !description || !subsectionId){
            return res.status(400).json({message:"Please fill all the fields"})
        }

        const updatedsection = await Subsection.findByIdAndUpdate(subsectionId,{
            title:title,
            description:description,
            timeDuration
        })

        return res.status(200).json({
            success:true,
            message:"sub section update successfully"
        })

    } catch (e) {
        console.log('error in update sub section controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const deletesubsection = async(req,res) =>{
    try {
        const {subsectionId} = req.params
        
        await Subsection.findByIdAndDelete(subsectionId)

        return res.status(200).json({
            success:false,
            message:"Sub Section deleted successfully"
        })

    } catch (e) {
        console.log('error in delete sub section controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

module.exports = {createSubSection,updateSubSection,deletesubsection}
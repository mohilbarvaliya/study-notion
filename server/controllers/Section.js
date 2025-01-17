const Section = require('../model/Section.model')
const Course = require("../models/Course.model")


const createSection = async(req,res) => {
    try {
        const { sectionName,courseId } = req.body

        if(!sectionName || !courseId){
            return req.status(400).json({
                success:false,
                message:"Please field all details"
            })
        }

        const section = await Section.create({sectionName,courseId})
        if(!section){
            return res.status(400).json({message:"Section not created"})
        }

        await Course.findByIdAndUpdate(courseId,{
            $push: {
                sections: section._id
            }
        })

        return res.status(200).json({
            success:true,
            message:"Section Created Successfully",
            data:section
        })

    } catch (e) {
        console.log('error in create section controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


const updateSection = async(req,res)=>{
    try {
        const {sectionName,sectionId} =req.body

        if(!sectionName || !sectionId){
            return req.status(400).json({
                success:false,
                message:"Please field all details"
            })
        }

        const SectionDetail = await Section.findByIdAndUpdate(sectionId,{
            sectionName
        },{new:true})

        return res.status(200).json({
            success:true,
            message:"Section detail updated successfully"
        })

    } catch (e) {
        console.log('error in update section controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

const deletSection = async(req,res) =>{
    try {
        const {courseId} = req.params

        await Course.findByIdAndDelete(courseId)
        res.status(200).json({message: 'Section deleted successfully'})
        
    } catch (e) {
        console.log('error in delete section controller',e)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

module.exports = { createSection,deletSection,updateSection}
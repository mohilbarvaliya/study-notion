const Category = require('../models/Category.model')


const createCategory = async (req, res) => {
    try {
        const { name,description } = req.body

        if(!name || !description){
            return res.status(404).json({
                success:false,
                message:"Please provide name and description"
            })
        }

        const CategoryDetail = await Category.create({
            name,
            description
        })
        res.status(201).json({
            success:true,
            message:"Tag created successfully",
            Category:CategoryDetail
            })

    } catch (e) {
        console.log("Error in create Category controller", e)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}


const getAllCategory = async (req,res) => {
    try {
        
        const Categorys = await Category.find({},{name:true,description:true})

        return res.status(200).json({
            success:true,
            message:"Tag fetchout successfully",
            Categorys:Categorys
        })

    } catch (e) {
        console.log("Error in get all Category controller", e)
        return res.status(500).json({ 
            success: false,
            message: "Internal Server Error"})
        
    }
}

module.exports = { createCategory,getAllCategory}
const ProductModel = require('../model/product');
const CategoryModel = require("../model/category");
// const Product = require("../models/product")

const loadProduct = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const skip = (page - 1) * limit;
  
        const totalProd = await ProductModel.countDocuments({});
        const totalPages = Math.ceil(totalProd / limit);
        const productDetails = await ProductModel.find().populate('category').skip(skip)
        .limit(limit)
        const categoryDetails = await CategoryModel.find({is_Active:true})
        res.render('addProduct',{product:productDetails,category:categoryDetails,currentPage: page,
            totalPages: totalPages})
    } catch (error) {
        console.log("Error while loading Products",error.message)
    }
}
const addProduct = async(req,res)=>{
    try {
    
        const images = req.files ? req.files.map(file=>file.filename) :[]
       // const images=req.body.images ? req.body.images :[];
        console.log(images)
        const name=req.body.name;
        
        const exist= await ProductModel.findOne({name:name});
        if(exist){
            //console.log('bugfds');
            res.redirect('/admin/product');
        }
       else{
        const product = new ProductModel({
            name:req.body.name,
            brand:req.body.brand,
            description:req.body.description,
            images:images,    
            category:req.body.category,
            price:req.body.price,
            discountPrice:req.body.discountPrice,
            countInStock:req.body.countInStock
        })

        const savedProduct = await product.save()

        const categoryDetails = await CategoryModel.find({is_Active:true})
        
        if(savedProduct){
            res.redirect('/admin/product')
        }else{
            res.render('addProduct',{category:categoryDetails,message:"Error while saving the product"})
        }
    }
    } catch (error) {
        console.log("Error while saving the product",error.message);
        res.status(500).send("Error Saving Product")
    }
}

const activeStatus = async(req,res)=>{
    try {
        const {id,action}= req.query

        if(action === "Inactive"){
            await ProductModel.findByIdAndUpdate(id,{is_deleted : false})
        }
        else{
            await ProductModel.findByIdAndUpdate(id,{is_deleted : true})
        }
        res.redirect('/admin/product')

    } catch (error) {
        console.log("Error while updating status",error.message)
    }
}
const loadEdit = async(req,res)=>{
    try {
        const id = req.query.id
        const ProductData = await ProductModel.findById(id).populate("category")

        if(req.query.delete){
            ProductData.images =ProductData.images.filter(img=>img.trim()!==req.query.delete.trim())
            await ProductData.save()
        }

        const CategoryData = await CategoryModel.find({is_Active:true})

        res.render("editproduct",{catData:CategoryData,proData:ProductData})

    } catch (error) {
        console.log("Error while loading the product edit Page",error.message)
        res.status(500).send("An error occured")
    }
}
const editProduct = async(req,res)=>{
    try {
         const id = req.query.id;
        let existingImages = []
        let existingProduct = await ProductModel.findById(req.query.id)
        console.log(existingProduct,"existing Details")
       
        const categoryDetails = await CategoryModel.find()

        if(existingProduct && existingProduct.images && Array.isArray(existingProduct.images)){
            console.log("entered")
            existingImages = existingProduct.images
        }
            console.log(req.body,"form details")
            let newImages=[]
            if(req.files && req.files.length){
                newImages = req.files.map(file=>file.filename)
            }

            const allImages = existingImages.concat(newImages)

            if(allImages.length>3){
                return res.render('editproduct',{CategoryData:categoryDetails, ProductData:existingProduct, message:"Maximum 3 Images per Product"})
            }else{
                console.log('else entered');
                
                const id = req.query.id
                console.log(id)
                const updateProduct = await ProductModel.findByIdAndUpdate({_id:req.query.id},{$set:{
                    name:req.body.name,
                    brand:req.body.brand,
                    description:req.body.description,
                    price:req.body.price,
                    discountPrice:req.body.discountPrice,
                    countInStock:req.body.stock,
                    category:req.body.category,
                    images:allImages,
                   
                }},{new:true})

                console.log(updateProduct,"AM updated details")
                if(updateProduct){
                    res.redirect('/admin/product')
                }
        }
        
    } catch (error) {
        console.log("Error while editing the Updating the Product Details",error.message)
        res.status(500).send("An Error Occured")
    }
}

module.exports = {
    loadProduct,
    addProduct,
    activeStatus,
    loadEdit,
    editProduct
}
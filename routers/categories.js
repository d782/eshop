const {Category}=require('../models/category');
const express=require('express');
const router=express.Router();

router.post('/',async(req,resp)=>{
    let category=new Category({
        name:req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })

    category=await category.save();

    if(!category){
        return resp.status(404).send('The Category cannot be created');
    }
    resp.send(category);
})

router.delete('/:id',async (req,resp)=>{
    let {id}=req.params;
    Category.findByIdAndRemove(id).then(doc=>{
        if(doc){
            return resp.status(200).json({success:true,message:'category deleted'});
        }else{
            return resp.status(404).json({success:false,messsage:'category not found'});
        }
    }).catch(err=>{
        return resp.status(400).json({success:false, message:err})
    })
})

router.get('/',async (req,resp)=>{
    let categoryList=await Category.find({});

    if(!categoryList){
        resp.status(500).json({success:false,message:'Something wrong happened'});
    }
    resp.status(200).send(categoryList);
})

router.get('/:id',async (req,resp)=>{
    let {id}=req.params;
    let category=await Category.findById(id);

    if(!category){
        resp.status(500).json({success:false,message:'category not found'});
    }
    resp.status(200).send(category);
})

router.put('/:id',async (req,resp)=>{
    let {id}=req.params
    let {body}=req
    let category= await Category.findByIdAndUpdate(id,body, {new:true})

    if(!category){
        resp.status(500).json({success:false,message:'category not found'});
    }
    resp.status(200).send(category);
})


module.exports=router;
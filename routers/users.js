const {User}=require('../models/user');
const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
require('dotenv')

router.post('/register',async(req,resp)=>{
    let newUser=new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.passwordHash,10),
        street:req.body.street,
        apartment:req.body.apartment,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin
    })

    newUser=newUser.save();

    if(!newUser){
        return resp.status(400).send('User cannot be created!');
    }
    resp.json({success:true,message:"user created!",data:newUser})
})

router.get('/',(req,resp)=>{
    User.find({}).select('-passwordHash').then(
        data=>{
            resp.status(200).send(data)
        }).catch(err=>resp.status(500).send(err))
})

router.get('/:id',async(req,resp)=>{
    let {id}=req.params;

    let user=await User.findById(id).select('-passwordHash');

    if(!user){
        return resp.status(404).send('User not found!');
    }
    resp.status(200).send(user);
})

router.post('/login',async(req,resp)=>{
    const user=await User.findOne({email:req.body.email});
    const secret=process.env.secret;

    if(!user){
        return resp.status(400).send('The user was not found!');
    }
    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token=jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAdmin
            },
            secret,
            {
                expiresIn: '1d'
            }
        )

        resp.status(200).send({success:true,message:'User Authenticated',user: user.email, webToken: token});
    }else{
        resp.status(400).send("Wrong password!");
    }
    

})

router.get('/get/count', async (req,resp)=>{
    let userCount=await User.countDocuments(count=>count);
    if(!userCount){
        resp.status(500).json({success:false,message:'not users found'});
    }
    resp.send({
        userCount:userCount
    })
})

router.delete('/:id',(req,resp)=>{
    User.findByIdAndRemove(req.params.id).then(
        user=>{
            if(user){
                return resp.status(200).send({success:true,message:'user deleted'})
            }else{
                return resp.status(400).send({success:false,message:'user not found'})
            }
        }
    ).catch(err=>{
        return resp.status(500).json({success:false,message:err})
    })
})
module.exports=router;
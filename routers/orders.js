const {Order}=require('../models/order');
const express=require('express');
const { OrderItem } = require('../models/orderItem');
const router=express.Router();

router.post('/', async (req,resp)=>{
    const orderItemsIds=Promise.all(req.body.orderItems.map(async orderItem=>{
        let newOrderItem= new OrderItem({
            quantity: orderItem.quantity,
            product:orderItem.product,
        })

        newOrderItem=await newOrderItem.save();

        return newOrderItem._id;
    }))

    const orderItemsIdResolved=await orderItemsIds;

    const totalPrices=await Promise.all(orderItemsIdResolved.map(async item=>{
        const orderItem=await OrderItem.findById(item);
        const totalPrice=orderItem.product.price*orderItem.quantity
        return totalPrice
    }));

    const totalPricesResolved=totalPrices.reduce(a,b=>a+b,0);

    let order= new Order({
        orderItems: orderItemsIdResolved,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:totalPricesResolved,
        user:req.body.user,
    })

    order=await order.save();

    if(!order){
        return resp.status(400).send({success:false,message:'Product cannot added'});
    }

    resp.send(order);
})

router.get('/', async(req,resp)=>{
    const orderList=await Order.find({}).populate('user','name').sort({'dateOrdered':-1});

    if(!orderList){
        resp.status(500).json({success:false})
    }
    resp.send(orderList);
})

router.get('/:id', async(req,resp)=>{
    const orderList=await Order.findById(req.params.id).populate('user','name').populate({path: 'orderItems',populate:'product'}).sort({'dateOrdered':-1});

    if(!orderList){
        resp.status(500).json({success:false})
    }
    resp.send(orderList);
})

router.put('/:id', async (req,resp)=>{
    let body={status:req.body.status}

    const order=await Order.findByIdAndUpdate(req.params.id,body,{new:true})

    if(!order){
        return resp.status(400).send({message:'order not found', success:false})
    }
    resp.send(order);
})

router.delete('/:id', (req,resp)=>{
    let {id}=req.params;
    Order.findByIdAndRemove(id).then(async doc=>{
        if(doc){
            await doc.orderItems.map(async item=>{
                await OrderItem.findByIdAndRemove(item)
            })
            return resp.status(200).json({success:true,message:'order deleted'});
        }else{
            return resp.status(404).json({success:false,messsage:'order not found'});
        }
    }).catch(err=>{
        return resp.status(400).json({success:false, message:err})
    })
})

router.get('/get/totalsales', async (req,resp)=>{
    const totalSales=await Order.aggregate([
        {$group:{_id:null, totalSales:{$sum:'$totalPrice'}}}
    ])

    if(!totalSales){
        return resp.status(400).send('Error something wrong happened');
    }

    resp.send({total:totalSales})
})

router.get('/get/userorders/:userid', async(req,resp)=>{
    const UserOrderList=await Order.find({user:req.params.userid}).populate('user','name').populate({path: 'orderItems',populate:'product'}).sort({'dateOrdered':-1});

    if(!UserOrderList){
        resp.status(500).json({success:false})
    }
    resp.send(UserOrderList);
})

module.exports=router;
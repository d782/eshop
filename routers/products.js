const express=require('express')
const router=express.Router();
const {Product}=require('../models/products');
const {Category}=require('../models/category');
const mongoose=require('mongoose');
const multer=require('multer');

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'    
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid=FILE_TYPE_MAP[file.mimetype];
        let uploadErr=new Error('invalid image type')
        if(isValid){
            uploadErr=null
        }
        cb(uploadErr, '/public/uploads')
    },
    filename: function (req, file, cb) {
      const filename=file.originalname.split(' ').join('-')
      const extension=FILE_TYPE_MAP[file.mimetype]
      cb(null, `${filename}-${Date.now()}.${extension}`)
    }
  })
  
const upload = multer({ storage: storage })

router.post('/',upload.single('image'),async (req,resp)=>{
    let findCategory=await Category.findById(req.body.category);

    if(!findCategory) return resp.status(400).send("Invalid category");
    
    const collectFile=req.file;
    if(!collectFile){return resp.status(400).json({file:' file was not sent'})}

    const filename=req.file.filename
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`
    let product=new Product({
            name:req.body.name,
            description:req.body.description,
            richDescription:req.body.richDescription,
            image:`${basePath}${filename}`,
            images:req.body.images,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            numRatings:req.body.numRatings,
            numReviews:req.body.numReviews,
            isFeatured:req.body.isFeatured
    
    });
    product= await product.save();

    if(!product){
        return resp.status(500).send('The product cannot be created')
    }

    resp.send(product)

})

router.get('/',(req,resp)=>{

    let filter={};

    if(req.query.categories){
        filter={category: req.query.categories.split(',')};
    }
    Product.find(filter).populate('category').then(docs=>{
        resp.status(200).send(docs)
    }).catch(
        err=>{
            resp.status(500).send(err)
        }
    )
})

router.get('/:id',async (req,resp)=>{
    let product=await Product.findById(req.params.id).populate('category');

    if(!product){
        resp.status(500).send('Not product found');
    }
    resp.status(200).json(product);
})

router.put('/:id',upload.single('image'),async (req,resp)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        resp.status(500).send('invalid product id!')
    }
    

    let findCategory=await Category.findById(req.body.category);

    if(!findCategory) return resp.status(400).send("Invalid category");

    const findProduct=await Product.findById(req.params.id);
    if(!findProduct) return resp.status(400).send('Invalid Product');
    const file=req.file;
    let imagepath;

    if(file){
        const filename=req.file.filename
        const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath=`${basePath}${filename}`
    }else{
        imagepath=findProduct.image;
    }

    let product=await Product.findByIdAndUpdate(req.params.id,{
            name:req.body.name,
            description:req.body.description,
            richDescription:req.body.richDescription,
            image:imagepath,
            images:req.body.images,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock:req.body.countInStock,
            numRatings:req.body.numRatings,
            numReviews:req.body.numReviews,
            isFeatured:req.body.isFeatured
    }, {new:true});

    if(!product){
        resp.status(400).send({success:false,message:'updated failed!'});
    }

    resp.status(209).send(product);
})

router.delete('/:id', (req,resp)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        resp.status(500).send('invalid product id!')
    }

    Product.findByIdAndRemove(req.params.id).then(
        data=>{
            resp.status(200).send({success:true,message:'operation executed successfully!'})
        }
    ).catch(err=>resp.status(400).send({success:false,message:err}))
})

router.get('/get/count', async(req,resp)=>{
    const productCount=await Product.countDocuments(count=>count);

    if(!productCount){
        resp.status(500).json({success:false,message:'no documents'});
    }
    resp.send({count:productCount})
})

router.get('/get/featured/:count', async(req,resp)=>{
    const count=req.params.count?req.params.count:0;

    const product=await Product.find({isFeatured:true}).limit(+count);

    if(!product){
        resp.status(500).json({success:false,message:'something bad happened'});
    }
    resp.send(product)
});




module.exports=router;

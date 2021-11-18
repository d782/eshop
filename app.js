const express=require('express');
const app=express();
const Morgan=require('morgan');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const cors=require('cors');
const categories=require('./routers/categories');
const products=require('./routers/products');
const users=require('./routers/users');
const orders=require('./routers/orders');
const authJwt=require('./utils/jwt');
const errorHandler=require('./utils/handleError')

require('dotenv/config');



app.use(cors());
app.options('*',cors())
//middleware
app.use(bodyParser.json());
app.use(Morgan('tiny'));
app.use(authJwt());
app.use(errorHandler);
app.use('public/uploads',express.static(__dirname+'/public/uploads'))


const api=process.env.API_URL;
const db=process.env.DB;

app.use(`${api}/category`, categories);
app.use(`${api}/products`, products);
app.use(`${api}/users`, users);
app.use(`${api}/orders`, orders);

mongoose.connect(`${db}`,{
    dbName:'eshop'
}).then(()=>{
    console.log('connected successfully')
}).catch(err=>console.log(err));

app.listen(8000, ()=>{
    
    console.log("Server working!")
})
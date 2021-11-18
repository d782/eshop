
function errorHandler(err,req,resp,next){
    if(err==='UnauthorizedError'){
        return resp.status(401).json({message:"not authorized user!"})
    }
    if(err==='ValidationError'){
        return resp.status(401).json({message:err})
    }

    return resp.status(500).send('Server Error!')
}

module.exports=errorHandler;
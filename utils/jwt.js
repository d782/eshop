const expressJwt=require('express-jwt');
require('dotenv');

function authJwt(){
    const secret=process.env.secret;
    const api=process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path:[
            `${api}/users/login`,
            `${api}/users/register`,
            {url:/\/api\/v1\/products(.*)/,methods:['GET','OPTIONS']},
            {url:/\/api\/v1\/public\/uploads(.*)/,methods:['GET','OPTIONS']},
        ]
    })
}

async function isRevoked(req,payload,done){
    if(!payload.isAdmin){
        done(null,true)
    }

    done();
}

module.exports=authJwt;
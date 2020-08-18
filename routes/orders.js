const { Router, query } = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = Router();
// get config vars
dotenv.config();
const jwtSecret='hello';


const itemsDAO = require('../daos/items');
const ordersDAO = require('../daos/orders');
const order = require("../models/order");

//Middleware to check if the user is authorized to access information
const isAuthorized = async (req, res, next) => {
    authHeader =req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token)  return res.sendStatus(401); //token doesn't exist
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decodedToken)=>{
         console.log(err);
         if(err) return res.sendStatus(401);
         req.user=decodedToken;
         next(); 
     })
 };


// Creating order
router.post("/", isAuthorized, async (req, res, next) => {
    try {
        const items=req.body;
        const userId=req.user._id;
        const total=await itemsDAO.totalPrice(items);
       if(total)
      {        const order = await ordersDAO.createOrder(userId, items,total);
        if(order)
        {
            res.json(order);
        } else {
            res.sendStatus(404);
        }
    }
     else{
         res.sendStatus(404);
     }
    } catch (err) {
        res.status(500).send(err.message);
    }
    

});

// Searching for order by User Id
router.get("/", isAuthorized, async (req, res, next) => {
    
    if(req.user.roles.includes('admin')==true){
        const orders=await ordersDAO.getOrders(); 
        if(orders){
            res.json(orders);
        }
        else {
            res.sendStatus(404);
        }
    } else {
        const userId=req.user._id;
        const userOrders= await ordersDAO.getMyOrder(userId);
        if (userOrders) {
            res.json(userOrders)
        }
            else{
                res.sendStatus(404);
            }
        }
  
});


// Searching for a specific order id
router.get("/:id", isAuthorized, async (req, res, next) => {
    if(req.user.roles.includes('admin')==true){
        const order=await ordersDAO.getByOrderId(req.params.id);
        if(order){
            res.json(order)
        } else {
            res.sendStatus(404); 
        }
    }
    else {
        const OrderByUserId=await ordersDAO.getUserByOrderId(req.params.id); 
        if(req.user._id == OrderByUserId)
        {
            const userOrder =await ordersDAO.getByOrderId(orderId);
            res.json(userOrder); 
        } else {
            res.sendStatus(404); 
        }

    }

});



 module.exports = router;
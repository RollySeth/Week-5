const { Router, query } = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const router = Router();
// get config vars
dotenv.config();

const jwtSecret='hello'; 

const itemsDAO = require('../daos/items');

//Middleware to check if the user is authorized to access information
const isAuthorized = async (req, res, next) => {
   authHeader =req.headers.authorization;
   const token = authHeader && authHeader.split(' ')[1];
   if(!token)  return res.sendStatus(401); //token doesn't exist
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decodedToken)=>{
     //   jwt.verify(token,jwtSecret, (err, user)=>{
        console.log(err)
        if(err) return res.sendStatus(401);
        req.user=decodedToken;
        next(); 
    })
};



//Middleware to check if the user is an admin or general user
const isAdmin = async (req, res, next) => {
         //user not an admin
         if(!req.user.roles.includes('admin')) return res.sendStatus(403); //
          next(); 
 };
 
  
// Creating items 
router.post("/", isAuthorized, isAdmin, async (req, res, next) => {
    
   
        const itemTitle=req.body.title;
        const itemPrice=req.body.price;
        if(!itemTitle || !itemPrice)
        {
            res.status(400).send("Item title and price are required");
        }
        else{
            try {
            const item = await itemsDAO.createItem(itemTitle, itemPrice);
           // res.status(200);
            res.json(item);
                }
          catch (err) {
          res.status(500).send(err.message);
          }
    }
});

// Searching for all items
router.get("/", isAuthorized, async (req, res, next) => {
    try {
        const items = await itemsDAO.getItems();
        res.json(items);
    } catch (err) {
        res.sendStatus(404);
    }
});


// Searching for a specific item id
router.get("/:id", isAuthorized, async (req, res, next) => {
    try {
        const item = await itemsDAO.getItem(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).send('item not found');
        }
    } catch (e) {
        res.status(400).send(e.message);
    }

});

// Update an item
router.put("/:id", 
    isAuthorized,
    isAdmin,
    async (req, res, next) => {
        const itemId = req.params.id;
        const { price } = req.body;
        const updatedItem = await itemsDAO.updateItem(itemId, price);
        if (updatedItem) {
            res.json(updatedItem)
        } else {
            res.sendStatus(404);
        }
    }
);




  module.exports = router;
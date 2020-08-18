const {Router} =require("express");
const dotenv = require("dotenv");
const router= Router();
const userDAO=require('../daos/user');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');

// get config vars
dotenv.config();
const jwtSecret='hello';



//Middleware to check if the user is authorized to access information
const isAuthorized = async (req, res, next) => {
    authHeader =req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if(!token)  return res.sendStatus(401); //token doesn't exist
     jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, (err, decodedToken)=>{
         console.log(err)
         if(err) return res.sendStatus(401);
         req.user=decodedToken;
         next(); 
     })
 };


 // Signing up with a username and password 
router.post("/signup", async (req, res, next) => {
    const {email, password} =req.body; 
    if (password === ""){
        res.status(400).send('password cannot be empty ');
    } else {
    try {
        
        const person = await userDAO.signUp(email, password);
        if (person) {
            res.status(200).send('Congratulations! Your account has been created');
        } else {
            res.status(409).send('User id already exists. Try signing in instead!');
        }
        
    } catch (error) {
        res.status(400).send(error.message);
       }
    }
});

// Login by the user
router.post("/", async (req, res, next) => {

    const {email, password} = req.body;
    const user = await userDAO.login(email);
    if (!user) {
        res.status(401).send('User does not exist')
    } else {
        if (!password || password === ""){
            res.status(400).send('Must provide a password.');
        } else {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                res.status(401).send('Wrong password!');
            } else {
                const loggedUser = await userDAO.onlyUser(email);
                const jwtSecret = process.env.ACCESS_TOKEN_SECRET;
                const token = jwt.sign(loggedUser.toJSON(), jwtSecret, { expiresIn: '1h' });
                res.json({token});
            }
        }
    }
});

  
// Logout the user
router.post("/logout", isAuthorized, async (req, res, next) => {

    const deletedToken = await userDAO.logout(req.token);
    if (deletedToken === true) {
      res.status(200).send('success');
    } else {
      res.status(401).send('failure');
    }
});

// Changing password 
router.post("/password", isAuthorized, async (req, res, next) => {
    if (!req.headers.authorization) {
                res.status(401).send('Authorization token is missing!');
            } else if (!req.body.password || JSON.stringify(req.body.password) === '{}') {
                res.status(400).send('current Password is required before changing to new password! ');
            }
    else {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const password = req.body.password;
          
           const success = await userDAO.changePassword(token, password);
            if (success) {
                res.status(200).send('Your password has been changed');
            } else {
                res.status(401).send('Your password was not changed');
            }
        } catch (error) {
            res.status(400).send(error.message);    
        }
    }
});

// Error handling middleware
router.use(function (error, req, res, next){
    if(error.message.includes("Internal Server Error")){
        res.status(500).send("Sorry! Working on the fix");
    }
});




 module.exports = router;
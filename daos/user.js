const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const dotenv = require("dotenv");
const saltRounds = 8;


//accessing database to create new hashed password and store it with email  
module.exports.signUp = async (email,password) => {
    // const { email, password } = req.body;
     const hashedPassword= await bcrypt.hash(password, saltRounds);
     try{
         const user=await User.create({

            email:email,
            password: hashedPassword,
            roles:['user']
         });
         return user;
          }  catch(e){
             throw e;
         }
  
};

//accessing database to compare shared password with existing password for a given user id
module.exports.login = async (credentials) => {
    const user = await User.findOne({ email : credentials.email }).lean();
    if (!user) { 
        return false; 
    };
    return user;  
}

module.exports.onlyUser = async(email) =>{
    let user =await User.findOne({email:email}, {password:0});
    if(!user) return false;
    else return user; 
}
//accessing database to remove the token
module.exports.logout = async (credentials) => {
    const success = await User.findOne({ email: credentials.email});
    if (!success) {
        return false;
    } else {
        await User.deleteOne({ email: credentials.email });
        return true;
    };
}

// Access database to compare the tokens and update the new hashed password for matched token
module.exports.changePassword = async (email, password) => {
    const foundUser = await User.findOne({ email : email });
    if (!foundUser) {
        return false;
    } else {
        try {
            hashedPassword = await bcrypt.hash(password, saltRounds);
          //  await User.updateOne({ _id : foundUser.userId }, { $set: { 'password' : password}});
            const updateUser=User.update({email:email}, {password:hashedPassword});
          return true;
        } catch (e) {
            throw e;
        }
        
    };
}

const mongoose = require('mongoose');

const Order = require('../models/order');


module.exports = {};

// Create New Order
module.exports.createOrder = async (userId,items, total) => {
    const newOrder = await Order.create({ 'userId' : userId, 'items' : items, 'total': total });
    return newOrder;  
}

//Search orders 
module.exports.getOrders = async () => {
    const orders = await Order.find({}).lean();
    return orders;
}

//search a given order by userid for self
module.exports.getMyOrder = async (userId) => {
        if(mongoose.Types.ObjectId.isValid(userId)){
            const order = await Order.findOne({ _id : userId }).lean();
        return order;
        }
        else {
            throw new createError(400, `UserId '${userId}' not found`)
        }     
}

//search user associated with a specific order Id
module.exports.getUserByOrderId = async (orderId) => {
    if(mongoose.Types.ObjectId.isValid(orderId)){
        const order = await Order.findOne({ _id : orderId }).lean();
    return order.userId;
    }
    else {
        throw new createError(400, `OrderId '${orderId}' not found`)
    }     
}

//search by orderId
module.exports.getByOrderId = async (orderId) => {
    const isValidId= await mongoose.Types.ObjectId.isValid(orderId);
    try{
        if(isValidId)
        {
            let searchId=mongoose.Types.ObjectId(orderId);
            const order =await Order.aggregate([
                { $match : {_id:searchId}},
                {$lookup:{
                    from:"items",
                    localField:"items",
                    foreighField:"_id",
                    as:"items"
                }},
                {$project:{
                    "items.price":1,
                    "items.title":1,
                    total:1,
                    userId:1,
                    _id:0
                } }
            ]);
            return order[0];
        }
    } catch (e){
        throw e; 
    }
};


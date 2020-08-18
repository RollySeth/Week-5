const mongoose = require('mongoose');

const Item = require('../models/item');

module.exports = {};

// Create New Item
module.exports.createItem = async (title, price) => {
    const newItem = await Item.create({ 'title' : title, 'price' : price });
    return newItem;  
}

//Search notes by item id 
module.exports.getItems = async () => {
    const items = await Item.find({}).lean();
    return items;
}

//search a given item by itemid for a specific user
module.exports.getItem = async (itemId) => {
        if(mongoose.Types.ObjectId.isValid(itemId)){
            const item = await Item.findOne({ _id : itemId }).lean();
        return item;
        }
        else {
            throw new createError(400, `ItemId '${itemId}' not found`)
        }     
}

//Update Item
module.exports.updateItem = async (itemId, price) => {
    try{
        const updatedItem = await Item.update({ _id: itemId }, { price: price });
        return updatedItem;

    }catch(error){
        throw error;
    }
}


//Calculate total price 
module.exports.totalPrice = async (items) => {
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            const validItem = await mongoose.Types.ObjectId.isValid(items[i]);
            if (validItem) {
                const item = await Item.findOne({ _id: items[i] });
                total += item.price;
        }
        return total;
    
}
}



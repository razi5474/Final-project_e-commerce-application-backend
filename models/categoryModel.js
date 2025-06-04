const mongoose = require('mongoose');

const catagorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
    },
    description: {
        type: String,
    }
})

module.exports = mongoose.model('Category', catagorySchema);
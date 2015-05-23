var mongoose = require('mongoose')

module.exports = mongoose.model('Posts', {
    title: String,
    text: String,
    username: String,
    public: { type: Boolean, default: false},
    date: { type: Date, default: Date.now }
})
var bcrypt = require('bcrypt')
var User = require('../models/user')
var jwt = require('jwt-simple')
var _ = require('lodash')
var config = require('../../config')
var currentUser = {}

module.exports.authenticate = function(req, res, next) {
    var username = req.body.username
    
    User.findOne({username: username}).select('password').select('username').exec(function(err, user) {
        if (err) { return next(err) }
        if (!user) { return res.sendStatus(401) }   
        bcrypt.compare(req.body.password, user.password, function(err, valid) {
            if (err) { return next(err) }
            if (!valid) { return res.sendStatus(401) }
            
            var currentUser = user
            var token = jwt.encode({username: user.username}, config.secret)
            res.json(token)
        })
    })
}

module.exports.signUp = function(req, res, next) {
    
    User.findOne({username: req.body.username}, function(err, user) {
		if (user) {
			return res.status('401').send('Username already exists');
		} else {
            var newUser = new User({username: req.body.username})
            bcrypt.hash(req.body.password, 10, function(err, hash) {
                newUser.password = hash
                newUser.save(function (err) {
                    if (err) { throw next(err) }
                    res.sendStatus(201)
                })  
            })
		}
	});
}


module.exports.currentUser = function(req, res, next) {
    if (req.headers['x-auth']) {
        var auth = jwt.decode(req.headers['x-auth'], config.secret)
        User.findOne({username: auth.username}, function (err, user) {
            if (err) { return next(err) }
            res.json(user)
        })
    }
}

var Post = require('../models/post')
var websockets = require('../websockets')
var jwt = require('jwt-simple')
var secret = 'supermegasecret'

module.exports.create = function(req, res) {    
    if (req.headers['x-auth']) {
        var post = new Post(req.body);
        var auth = jwt.decode(req.headers['x-auth'], secret)
        post.save(function(err, result) {
            if (err) return err;
            websockets.broadcast('new_post', result)
            res.status(201).json(result);
        })
    }
}

module.exports.list = function(req, res) {
    Post.find({}, function(err, results) {
        if (err) return err;
        res.status(200).json(results);
    });
}

module.exports.delete = function(req, res) {
    Post.findById(req.query.id, function(err, post) {
        if (err) return err;
        
        post.remove(function(err, result){
          websockets.broadcast('delete_post', result)
          res.status(200).json(post);
        });
    });
};

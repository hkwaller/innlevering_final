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
            
            if (post.public) {
                websockets.broadcast('new_post', result)
            }
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
          if (post.public) {
              websockets.broadcast('delete_post', result)
          }
          res.status(200).json(post);
        });
    });
};

module.exports.postById = function(req, res) {

    Post.findById(req.params.id, function(err, results) {
        if (err) return err;
        res.status(200).json(results);
    });
}

module.exports.update = function(req, res) {
    console.log(req.body);
    Post.findById(req.body._id, function(err, result) {
        if (err) return err;
        
        console.log(result);
        result.title = req.body.title
        result.text = req.body.text
        result.public = req.body.public
        
        result.save(function(err, result) {
            if (err) return err;
            
            if (result.public) {
                websockets.broadcast('update_post', result)
            }
            
            res.status(201).json(result);
        })
        
    });
}
var jwt = require('jwt-simple')
var secret = 'supermegasecret';

module.exports = function(req, res, next) {
    if (req.headers['x-auth']) {
        req.auth = jwt.decode(req.headers['x-auth'], secret)
    }
    next()
}
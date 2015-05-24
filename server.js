var express =               require('express'),
    app =                   express(),
    jwt =                   require('jwt-simple'),
    bodyParser =            require('body-parser'),
    websocket =             require('./server/websockets.js'),
    mongoose =              require('mongoose'),
    postController =        require('./server/controllers/post-controller.js'),
    authController =        require('./server/controllers/auth-controller.js'),
    db =                    require('./db.js'),
    auth =                  require('./auth')

app.use('/', express.static(__dirname + '/webapp/'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/authenticate', authController.authenticate)
app.post('/signup', authController.signUp)
app.get('/currentUser', authController.currentUser)
app.post('/api/posts', postController.create)
app.put('/api/update', postController.update)
app.get('/api/posts', postController.list)
app.get('/api/post/:id', postController.postById)
app.delete('/api/posts', postController.delete)

var port = process.env.PORT || 3000
var server = app.listen(port, function() {
    console.log('Im alive..')
    websocket.connect(server)
})
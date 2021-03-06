var ws =    require('ws'),
    _ =     require('lodash')

var clients = []

exports.connect = function(server) {
    var wss = new ws.Server({server: server})
    console.log('socket is alive');
    wss.on('connection', function(ws) {
        clients.push(ws);
        exports.broadcast('new client connected..')
        ws.on('close', function() {
            _.remove(clients, ws);
        })
    })
}

exports.broadcast = function(topic, data) {
    var json = JSON.stringify({topic: topic, data: data})
    clients.forEach(function(client) {
        client.send(json)
    })
}
const WebSocketServer = require('websocket').server;

let connection;

const sendSocketData = data => {
    console.log("Socket Data Send", data)
    connection.sendUTF(JSON.stringify(data));
}

const configureWebSockets = httpServer => {
    const wsServer = new WebSocketServer({
        httpServer: httpServer
    });

    wsServer.on('request', function(request) {
        connection = request.accept(null, request.origin);
        console.log("Accepted Connection");

        connection.on('close', function() {
            console.log('Closing Connection');
            connection = null;
        });
    });
}



module.exports = {configureWebSockets, sendSocketData};
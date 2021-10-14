let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
const internalIp = require('internal-ip');
const { PORT } = require('../utils');

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/display.html');
})

io.on('connection', (socket)=> {

    socket.on("join-message", (roomId) => {
        socket.join(roomId);
        console.log("User joined in a room : " + roomId);
    })

    socket.on("screen-data", function(data) {
        data = JSON.parse(data);
        let room = data.room;
        let imgStr = data.image;
        socket.broadcast.to(room).emit('screen-data', imgStr);
    })

    socket.on("mouse-move", function(data) {
        let room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("mouse-move", data);
    })

    socket.on("mouse-click", function(data) {
        let room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("mouse-click", data);
    })

    socket.on("type", function(data) {
        let room = JSON.parse(data).room;
        socket.broadcast.to(room).emit("type", data);
    })
})

let server_port = PORT || 5000;
http.listen(server_port, async () => {
    let myIp = await internalIp.v4();
    console.log("Host: "+myIp+':'+server_port);
})
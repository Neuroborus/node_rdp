const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const internalIp = require('internal-ip');
const { PORT } = require('../utils/utils');


let server_port = PORT || 5000;
let myIp;
async function prepare() {
    myIp = await internalIp.v4();
}
(async () => {
    await prepare();
    console.log('Ready: '+myIp+':'+server_port);
})();



app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/display.html');
})

io.on('connection', (socket)=> {

    socket.on('join-message', function(room) {
        socket.join(room);
        console.log('Room is active: ' + room);
    })

    socket.on('screen-preload', function(data) {
        screenInfo = JSON.parse(data);
        console.log(screenInfo.width+'X'+screenInfo.height);
        socket.broadcast.to(room).emit('screen-preload', data);
    })

    socket.on('screen-data', function(data) {
        data = JSON.parse(data);
        const room = data.room;
        const imgStr = data.image;
        socket.broadcast.to(room).emit('screen-data', imgStr);
    })

    socket.on('mouse-move', function(data) {
        const room = JSON.parse(data).room;
        socket.broadcast.to(room).emit('mouse-move', data);
    })

    socket.on('mouse-click', function(data) {
        const room = JSON.parse(data).room;
        socket.broadcast.to(room).emit('mouse-click', data);
    })

    socket.on('mouse-right-click', function(data) {
        const room = JSON.parse(data).room;
        socket.broadcast.to(room).emit('mouse-right-click', data);
    })

    socket.on('mouse-down', function(data) {
        const room = JSON.parse(data).room;
        socket.broadcast.to(room).emit('mouse-down', data);
    })

    socket.on('mouse-up', function(data) {
        const room = JSON.parse(data).room;
        socket.broadcast.to(room).emit('mouse-up', data);
    })

    socket.on('type', function(data) {
        const room = JSON.parse(data).room;
        const key = JSON.parse(data).key;
        socket.broadcast.to(room).emit('type', key);
    })
})


http.listen(server_port, () => {
    console.log('Daemon up!');
})
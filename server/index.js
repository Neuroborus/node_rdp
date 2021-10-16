let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
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



app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/display.html');
})

io.on('connection', (socket)=> {

    socket.on('join-message', (roomId) => {
        socket.join(roomId);
        console.log('Room is active: ' + roomId);
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

    socket.on('type', function(data) {
        const room = JSON.parse(data).room;
        const key = JSON.parse(data).key;
        socket.broadcast.to(room).emit('type', key);
    })
})


http.listen(server_port, () => {
    console.log('Server up!');
})
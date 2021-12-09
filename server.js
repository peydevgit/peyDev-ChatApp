const express = require('express');
const app = express();
const http = require('http');;
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server startad på port: ${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//////////////////////////////////////////////////////////////////////////////
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});





let users_online = []
let removedUser;
// När en användare ansluter eller disconnectar.///////////////
io.on("connection", (socket) => {
    socket.on('new user', (username) => {
        socket.user = username;
        users_online.push(socket.user);
        io.emit("new user", username, users_online);
        console.log(socket.user + ' har skapats.');
        console.log(users_online)
    });

    ///////// when someone disconnects
    socket.on('disconnect', () => {
        removedUser = socket.user
        users_online = users_online.filter(item => item != socket.user);
        socket.broadcast.emit('user disconnected', removedUser, users_online);
    });

    //// when someones log in, it will be broadcasted to other clients .
    socket.on('joined chat', (username) => {

        socket.broadcast.emit('joined chat', username);
    });

    ////////// when someone writes something.
    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', `${socket.user}: ${msg}`);
    });
    ///////////////////////////////////////////
    socket.on('typing', () => {
        socket.broadcast.emit('typing', socket.user);
    });

    socket.on('not typing', () => {
        socket.broadcast.emit('not typing', socket.user);
    });
    ////////////////////////////////77

    socket.on('get online users', () => {
        //Send over the onlineUsers
        socket.broadcast.emit('get online users', users_online);
    })


    socket.on('update online users', (useronline) => {
        socket.broadcast.emit('get online users', useronline);
    })

});
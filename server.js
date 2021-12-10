const express = require('express'); // importerar express
const app = express();
const http = require('http');; // importerar http
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
app.get('/', function(req, res) { // Vi definierar routern '/' som blir anropad när en person besöker sidan.
    res.sendFile(__dirname + "/public/index.html"); // skickar responses att vi skickar dom till index.html
});




let users_online = [] // vi skapar ett objekt
let removedUser; // vi kommer använda detta senare för när vi raderar en användare.

io.on("connection", (socket) => { // när en klient ansluter 'connection' och 'socket' är klienten. den visar den aktuella händelsen eller en klient knackning.
    socket.on('new user', (username) => { // vi tar emot en knackning från klienten om att vi har fått en ny användare.
        socket.user = username; // vi tillger socket variabeln som tillhör chat modulen ett attribute som user och att den är lika med det klienten fått som inmatning
        users_online.push(socket.user); // Lägger till den nya användaren in i objektet.
        io.emit("new user", username, users_online); // vi skickar till alla att vi har fått en ny användare. en server knackning kan man kalla det.
        console.log(socket.user + ' har skapats.'); // console feedback för servern.
        console.log(users_online) // console feedback för servern. Där vi ser hur många användare som finns.
    });


    socket.on('disconnect', () => { ///////// När en klient lämnar chattet. en klientknackning.
        removedUser = socket.user // vi sparar klientens namn som removedUser variabeln.
        users_online = users_online.filter(item => item != socket.user); // vi tar bort klienten från listan
        socket.broadcast.emit('user disconnected', removedUser, users_online); // Vi skickar till resten av klienterna som är inloggade.
    });


    socket.on('joined chat', (username) => { // vi får en knackning från klienten att vi ska skriva ett medelande i chattet att 'Användare X' har anslutit.
        socket.broadcast.emit('joined chat', username); // vi skickar en broadcast som betyder att alla får detta förutom den klienten som har loggat in precis.
    });


    socket.on('chat message', (msg) => { // Chatt message får vi när någon försöker skriva ett medelande i chattet. en klientknackning.
        socket.broadcast.emit('chat message', `${socket.user}: ${msg}`); // vi broadcastar innehållet till alla förutom den som skrev det. - en serverknackning till klienten
    });

    socket.on('typing', () => { // en knackning från från klienten när någon börjar skriva i input fältet.
        socket.broadcast.emit('typing', socket.user); // vi skickar tillbaks med en serverknackning
    });

    socket.on('not typing', () => { // här är när de inte skriver något..  eller har helt enkelt slutat skriva efter de skrev något.
        socket.broadcast.emit('not typing', socket.user);
    });
    ////////////////////////////////77

    socket.on('get online users', () => { /// efter de har loggat in så skickar klienten en händelse knackning på att den vill ha online listan.
        socket.broadcast.emit('get online users', users_online); // vi skickar online listan .
    })


    socket.on('update online users', (useronline) => { // denna knackning sker från klienten ifall någon disconnectar, då vill vi ha en ny lista där den som har stängt ner chatten inte finns längre.
        socket.broadcast.emit('get online users', useronline); // vi skickar den nya listan.
    })

});
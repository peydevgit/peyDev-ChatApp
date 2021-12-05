window.onload = function () {

    var socket = io();
       
    var messages = document.getElementById('messages');
    var feedbackLogin = document.getElementById('loginForm')
    var form = document.getElementById('form');
    var input = document.getElementById('input');

    var username = document.getElementById('username');
    var password = document.getElementById('password');

    ////Creating user is typing with setTimeout and a callback function...
    ////////////////////////////////////////////////////////////////////

    // ideer för imorgon. hämta ut användarnamn genom en funktion till servern som user type.

 

    //// broadcast for user connecting and disconnecting
    socket.on("connecting", (text) => {
        var item = document.createElement('li');
        item.textContent = text;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
    socket.on("disconnected", (userDisconnected) => {
        var item = document.createElement('li');
        item.textContent = userDisconnected;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
    ////////////////////////////////////////////////////

    ////login.///
    feedbackLogin.addEventListener('submitLogin', function (e) {
        e.preventDefault();
        if (username.value && password.value) {
            io.emit('login', (username.value, password.value));
            username.value = '';
            password.value = '';
        }
    });

    io.on('login', function (username,password) {
        var item = document.createElement('p');
        item.textContent = (username + password);
        feedbackLogin.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
    //////////////////////////////////////////////////



    ////broadcasting for when a user sumbitted a text
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    });

    socket.on('chat message', function (msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
    //////////////////////////////////////////////////

}
var userTyping = document.getElementById('userTyping');

function waitFor() {
    userTyping.value = null;
}

input.addEventListener('keydown', async () => {
    socket.emit('user typing', userTyping.value);
});

socket.on('user typing', function (typing) {
    userTyping.value = typing;
    setTimeout(waitFor, 3000);
});
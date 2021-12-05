window.onload = function () {

    var socket = io();
    
    ///////////
    // forfragan = new XMLHttpRequest();
    // let socketuser = 'username';
    // forfragan.open("GET", "/getusername");
    // forfragan.onload = function () {
    //    return socketuser = this.response;
    // };
    // forfragan.send();
    ///////////////////////////
    
    var messages = document.getElementById('messages');
    var form = document.getElementById('form');
    var input = document.getElementById('input');
    var userTyping = document.getElementById('userTyping');
    

    ////Creating user is typing with setTimeout and a callback function...
    function waitFor() {
        userTyping.value = null;
    }

    input.addEventListener('keydown', async (e) => {
        socket.emit('user typing', userTyping.value);
        
        
    });

    socket.on('user typing', function (typing) {
        userTyping.value = typing;
        setTimeout(waitFor, 3000);
    });

    /////////////////////////////
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

}
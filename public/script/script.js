window.onload = function() {

    const socket = io.connect()

    let socketUser;
    // declaring variabels for html elements.
    let messages = document.getElementById('messages');
    let input = document.getElementById('input');
    let userOnline = document.getElementById('online_user')
    let chat_send = document.getElementById('chat_send');


    let userOnlineList = (username) => {
            let online_user_list = document.createElement('li');
            online_user_list.id = username;
            online_user_list.textContent = username;
            userOnline.appendChild(online_user_list);
            window.scrollTo(0, document.body.scrollHeight);
        }
        // vi skapar en validator funktion för onskefulla input för att slippa kopiera och klistra det överallt som behövs.
    let valiDator = (input) => {
        let output = '';
        for (let i = 0; i < input.length; i++) {
            if (input[i] == '<')
                output += '&lt;';
            else
                output += input[i];
        }
        return output;
    }

    socket.on('get online users', (onlineUsers) => {
        userOnline.innerHTML = '';
        console.log(onlineUsers)
        for (i = 0; i < onlineUsers.length; i++) {
            userOnlineList(onlineUsers[i]);
        }
    })

    socket.on('update users online', (onlineUsers) => {
        /////// printing out the new list.
        userOnline.innerHTML = '';
        console.log(onlineUsers)
        for (i = 0; i < onlineUsers.length; i++) {
            userOnlineList(onlineUsers[i]);
            console.log(onlineUsers)
        }

    });


    let check_user = (username) => {
        if (!username) {
            username = prompt('Skriv ett namn');
            while (username.length < 4)
                username = prompt('Skriv ett längre namn')
            socket.emit('new user', username)
            socket.emit('joined chat', username);
        } else
            alert('Välkommen tillbaks' + username)
    }

    check_user(socketUser);




    socket.on('new user', (username, ) => {
        // when a user has succesfully logged in.

        socket.emit('get online users');

    });


    socket.on('joined chat', (username) => {
        let online_user_message = document.createElement('li');
        online_user_message.textContent = `${username} has joined the chat!`;
        messages.appendChild(online_user_message);
        window.scrollTo(0, document.body.scrollHeight);
        socket.emit('update users online')
    });


    socket.on('user disconnected', (username, users_online) => {
        let user_disconnect_message = document.createElement('li');
        user_disconnect_message.textContent = `${username} disconnected`
        messages.appendChild(user_disconnect_message);
        window.scrollTo(0, document.body.scrollHeight);
        console.log(`${username} on online list is removed.`)
        console.log(users_online)
        socket.emit('update users online', users_online);
    })



    chat_send.addEventListener('click', function(e) {
        input.value = valiDator(input.value)
        e.preventDefault();
        let savedMessage = input.value;
        if (input.value.length > 0) {
            socket.emit('chat message', input.value);
            input.value = '';
            userTyping.value = '';
            let youMessage = document.createElement('li') // rensa inmatningsfältet
            let savedText = `You: ${savedMessage}`;
            youMessage.id = "youWrote";
            youMessage.innerHTML = savedText;
            messages.appendChild(youMessage);
            window.scrollTo(0, document.body.scrollHeight);


        }
    });


    socket.on('chat message', function(msg) {
        let online_user_message = document.createElement('li');
        online_user_message.textContent = msg;
        messages.appendChild(online_user_message);
        userTyping.value = '';
        window.scrollTo(0, document.body.scrollHeight);
    });

    input.addEventListener('keyup', () => {
        socket.emit('typing')
    });
    input.addEventListener('keydown', () => {
        socket.emit('not typing')
    });

    socket.on('typing', (socket) => {

        userTyping.value = '';

    });

    socket.on('not typing', (socket) => {
        userTyping.value = `${socket}  is typing....`;

    });


};
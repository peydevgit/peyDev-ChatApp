window.onload = function() {

    const socket = io.connect() // anropar socket io konstruktor

    let socketUser; // vi kommer använda denna som klientens användarnamn så den får en tilldelning sen.
    // deklarerar html elementen som variabler.
    let messages = document.getElementById('messages');
    let input = document.getElementById('input');
    let userOnline = document.getElementById('online_user')
    let chat_send = document.getElementById('chat_send');


    let userOnlineList = (username) => { // skapar en funktion som vi kan mata in klient användarnamn  som sedan skapar ett element för online listan.
            let online_user_list = document.createElement('li'); // skapar list element och till ger den variabel för att förenkla.
            online_user_list.id = username; // vi ger id attributen klientens användarnamn för lättare borttagning.
            online_user_list.textContent = username; // och det ska stå deras namn i list elementet som skapas.
            userOnline.appendChild(online_user_list); //  vi appendar den till useronline elementet.
            window.scrollTo(0, document.body.scrollHeight); // ifall den når slutet av sidans ram så ska det skapas en scrolll.
        }
        // vi skapar en validator funktion för onskefulla input för att slippa kopiera och klistra det överallt som behövs.
    let valiDator = (input) => {
        let output = '';
        for (let i = 0; i < input.length; i++) { // den ska for loopas till inputens längd.
            if (input[i] == '<') // ifall någon av bokstäverna är lika med krokodilkäft
                output += '&lt;'; // lägg till en escape sekvens istället
            else // annars accepteras bokstaven och läggs till den nya innehållet.
                output += input[i];
        }
        return output; // returnerar den igenomsökta texten.
    }

    socket.on('get online users', (onlineUsers) => { // när vi får en serverknackning.
        userOnline.innerHTML = ''; // vi nollställer useronline elementet och tar bort alla i online listan, ifall de finns de som är offline med.
        console.log(onlineUsers) // feedback så vi ser att listan är ny med inga disconnectade anvöändare
        for (i = 0; i < onlineUsers.length; i++) { // vi kör en klassisk for loop
            userOnlineList(onlineUsers[i]); // lägger varje användare i useronlinelist funktionen som skapar element för online användare.
        }
    })

    socket.on('update users online', (onlineUsers) => { //  när någon har disconnectat vill vi ha en uppdaterad online lista.
        /////// printing out the new list.
        userOnline.innerHTML = '';
        console.log(onlineUsers)
        for (i = 0; i < onlineUsers.length; i++) {
            userOnlineList(onlineUsers[i]);
            console.log(onlineUsers)
        }

    });


    let check_user = (username) => { // skapar en funktion som vi kan mata in användares namn, om användaren inte finns. skapa en och skicka en klient händelse till servern.
        if (!username) { // om en användare inte finns med namnet som de tätter in med.
            username = prompt('Skriv ett namn'); // tillger variabeln ett prompt som sedan ger den ett värde.
            while (username.length < 4) // så länge de skriver mindre än 4 bokstäver så kör en while loop.
                username = prompt('Skriv ett längre namn')
            socket.emit('new user', username) // vi skickar händelsen till servern om att en ny användare har skapats.
            socket.emit('joined chat', username); // händelse att vi ska medela andra användare att en ny användare har joinat chattet.
        } else
            alert('Välkommen tillbaks' + username) //  denna la jag till ifall jag skulle vilja spara alla användare i en databas.
    }

    check_user(socketUser); // här användaren vi funktionen ovan.




    socket.on('new user', () => { // vi får en server knackning om att ny användare.
        socket.emit('get online users'); // vi skickar händelse till servern om att skapa en online lista.

    });


    socket.on('joined chat', (username) => { // vi får händelse från server om att någon har joinat chatt.
        let online_user_message = document.createElement('li'); // vi skapar en li element.
        online_user_message.textContent = `${username} has joined the chat!`; // li elementets innehållstext ska vara att användare har joinat ett chat.
        messages.appendChild(online_user_message); // appendar till message elementet.
        window.scrollTo(0, document.body.scrollHeight); //  scrollbar om de mkt text medelanden.
        socket.emit('update users online') // uppdaterar online listan.
    });


    socket.on('user disconnected', (username, users_online) => { // när någon avslutar chattappen, så får vi server knackning med datan.
        let user_disconnect_message = document.createElement('li'); // skapar en li element.
        user_disconnect_message.textContent = `${username} disconnected` // li elementets innehåll.
        messages.appendChild(user_disconnect_message); // appendar till message elementet.
        window.scrollTo(0, document.body.scrollHeight);
        console.log(`${username} on online list is removed.`) // feedback
        console.log(users_online) // feedback
        socket.emit('update users online', users_online); // uppdaterar online list genom klient knackning
    })



    chat_send.addEventListener('click', function(e) { // lyssnare på button knappen chat_send
        input.value = valiDator(input.value) // det som matas in söker vi igenom genom funktionen för onskefulla input.
        e.preventDefault(); // att sidan inte ska laddas om.
        let savedMessage = input.value; // sparar inputen.. kanske inte behövs efter man har gått igenom koden :)
        if (input.value.length > 0) { // om medelandet är större än 0.. dvs räcker med en bokstav.
            socket.emit('chat message', input.value); // en händelse till servern med innehållet.
            input.value = ''; // nollställer inputen
            userTyping.value = ''; // nollställer user is typing.
            let youMessage = document.createElement('li') // skapar en ny element eftersom vi kör broadcast och det betyder att användaren som skriver något kan inte se sitt eget medelande.
            let savedText = `You: ${savedMessage}`; // tillger den till savedText, att du: skrev något.
            youMessage.id = "youWrote"; // id attributen till elementet..
            youMessage.innerHTML = savedText; // elementets innehålls html
            messages.appendChild(youMessage); // appendar till message.
            window.scrollTo(0, document.body.scrollHeight);
        }
    });


    socket.on('chat message', function(msg) { // servern skickar information för att kunna skapa ett medelande.
        let online_user_message = document.createElement('li'); // skapar element
        online_user_message.textContent = msg; // elementets textinnehåll
        messages.appendChild(online_user_message); // appendar till message stället.
        userTyping.value = ''; // nollställer user is typing.
        window.scrollTo(0, document.body.scrollHeight);
    });

    input.addEventListener('keydown', () => { // en lyssnare som triggas när en tangentbord trycks ner.
        socket.emit('typing') // vi skickar en klient händelse om att någon skriver nåt.
    });

    input.addEventListener('keyup', () => { // lyssnare som triggas när något trycks up i input fältet.
        socket.emit('not typing') // vi skickar en klient händelse om att någon inte skriver nåt.
    });


    socket.on('typing', (socket) => {
        userTyping.value = `${socket}  is typing....`; // elementet värde är dess användare som skriver.



    });

    socket.on('not typing', () => { // händelse från servern om att användaren slutat skriva.
        userTyping.value = ''; // vi lägger elementet tom.
    });


};
// This script handles the client-side chat application logic.
; (function (jQ, globalObj, socketLibrary) {


    var clientMessenger = {

        'settings': {
            // Retrieve the display handle from the URL query string
            'participantName': globalObj.location.search.substring(1).split("=")[1],
            'connectionIdentifier': null,
            'ioConnection': null,
            '$inputArea': null,
            '$displayArea': null,
            '$titleArea': null
        },

        'events': {
            'domReady': function () {
                clientMessenger.methods.setup();
            }
        },

        'methods': {
            'setup': function () {
                // Initialize references to page elements
                clientMessenger.settings.$inputArea = jQ('#messageInput');
                clientMessenger.settings.$displayArea = jQ('#chatArea');
                clientMessenger.settings.$titleArea = jQ('#appHeader');

                // Attach various event listeners
                clientMessenger.settings.$inputArea.focus();
                clientMessenger.settings.$inputArea.keypress(function (eKbd) {
                    if (eKbd.which === 13) {
                        clientMessenger.methods.postContent();
                        return false;
                    }
                });
                clientMessenger.settings.$titleArea.click(function () {
                    clientMessenger.settings.participantName = "";
                    globalObj.location = '/';
                });
                // Configure the blur handler for mobile devices,
                // specifically for the 'done' button behavior
                clientMessenger.settings.$inputArea.blur(clientMessenger.methods.postContent);

                // Establish the socket connection to the designated namespace
                clientMessenger.settings.ioConnection = socketLibrary.connect('/app_chat');
                clientMessenger.settings.ioConnection.on('participantJoined', clientMessenger.methods.onUserConnected);
                clientMessenger.settings.ioConnection.on('newChatMessage', clientMessenger.methods.processIncomingMessage);
                clientMessenger.settings.ioConnection.on('participantLeft', clientMessenger.methods.handleUserDeparture);

                // Inform the server about the newly connected user
                clientMessenger.settings.ioConnection.emit('participantJoined', { identifier: clientMessenger.settings.participantName });
            },

            'scrollDisplay': function () {
                var currentChatWindow = document.getElementById('chatWindow');
                currentChatWindow.scrollTop = currentChatWindow.scrollHeight;
            },

            'postContent': function () {
                // Transmit the user's message along with their handle,
                // provided the message content is not empty
                if (clientMessenger.settings.$inputArea.val() !== '') {

                    clientMessenger.settings.ioConnection.emit('newChatMessage',
                        {
                            identifier: clientMessenger.settings.participantName,
                            text: clientMessenger.settings.$inputArea.val()
                        });
                }
                // Clear the input field after message submission
                clientMessenger.settings.$inputArea.val('');
            },

            'onUserConnected': function (connectionData) {
                clientMessenger.settings.connectionIdentifier = connectionData.uniqueId;

                // Determine the count of currently active participants
                var userCount = 0;
                for (var userKey in connectionData.activeUsers) {
                    userCount++;
                }

                // Construct a welcoming message string
                var welcomeMessage = '';
                if (userCount === 1) {
                    // Scenario: only one person is present in the room
                    welcomeMessage = 'It\'s quiet in here... waiting for others to join?';
                }
                else {
                    // Scenario: multiple participants are already connected
                    var firstEncounter = false;
                    for (var userKey in connectionData.activeUsers) {
                        welcomeMessage += connectionData.activeUsers[userKey];
                        // This logic might be a bit convoluted, but follows the original intent
                        if (!firstEncounter) {
                            welcomeMessage += ', say hello to ';
                            firstEncounter = true;
                        }
                        else {
                            welcomeMessage += '... and others?';
                        }
                    }
                }

                // Display the connection status and welcome messages to participants
                var decodedHandle = decodeURIComponent(connectionData.identifier);
                clientMessenger.settings.$displayArea
                    .append('<div class="green"> > ' + decodedHandle + ' has entered the chat</div>');
                clientMessenger.methods.scrollDisplay();
                clientMessenger.settings.$displayArea
                    .append('<div class="hot-pink"> > *** Greetings from Client Messenger, ' + decodedHandle + '!!! ***</div>')
                    .append('<div class="off-white"> > ***  ' + welcomeMessage + ' ***</div>');
                clientMessenger.methods.scrollDisplay();
            },

            'processIncomingMessage': function (messagePayload) {
                if (messagePayload.identifier) {
                    var decodedSender = decodeURIComponent(messagePayload.identifier);
                    clientMessenger.settings.$displayArea
                        .append('<div style="color:' + messagePayload.color + '">' + decodedSender + ' > ' + messagePayload.text + '</div>');
                    clientMessenger.methods.scrollDisplay();
                }
            },

            'handleUserDeparture': function (departureData) {
                if (departureData.identifier) {
                    var decodedLeaver = decodeURIComponent(departureData.identifier);
                    clientMessenger.settings.$displayArea
                        .append('<span style="color:#009a16;font-style:italic;"> > ' + decodedLeaver + ' has left the chat</span><br>');
                    clientMessenger.methods.scrollDisplay();
                }
            }
        }
    };

    clientMessenger.events.domReady();

}(jQuery, window, io));
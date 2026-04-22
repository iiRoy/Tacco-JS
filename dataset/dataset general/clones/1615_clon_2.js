let socketConnection = {};
const userSessionID = 0;
let activeParticipants = {};
const urlParameters = retrieveURLParameters();

jQuery(document).ready(function () {
    // Establish the communication channel for real-time interaction
    if (window.SocketAPI || window.MozillaSocket) {
        socketConnection = new SocketAPI(chatService.endpoint);
    }
    // Fallback to Flash-based WebSocket if native support is absent
    else if (chatService.useFlashFallback) {
        FLASH_SOCKET_PATH = "/static/flash-websocket/WebSocketMain.swf";
        jQuery.loadScript("/static/flash-websocket/swfobject.js", function () {
            jQuery.loadScript("/static/flash-websocket/web_socket.js", function () {
                socketConnection = new SocketAPI(chatService.endpoint);
            });
        });
    }
    // Use HTTP long-polling as a last resort
    else {
        socketConnection = new HttpComet(chatService.endpoint);
    }
    initiateListeners();
});

function initiateListeners() {
    /**
     * Triggered when the connection to the server is successfully established.
     */
    socketConnection.onConnect = function (eventData) {
        // User must provide a name and an avatar to join the chat
        if (urlParameters.userName === undefined || urlParameters.userAvatar === undefined) {
            window.alert('A display name and profile image are required to enter the chat room.');
            socketConnection.terminate();
            return false;
        }

        // Connection successful, log for debugging
        console.info("Connected to the chat server successfully.");

        // Dispatch login information to the server
        let loginMessage = Object.create(null);
        loginMessage.command = 'login';
        loginMessage.identity = urlParameters.userName;
        loginMessage.profilePicture = urlParameters.userAvatar;
        socketConnection.transmit(jQuery.serializeJSON(loginMessage));
    };

    // Fired upon receiving any message from the server
    socketConnection.onReceive = function (eventData) {
        const receivedPacket = jQuery.parseJSON(eventData.payload);
        const commandType = receivedPacket.command;

        if (commandType === 'login') {
            userSessionID = jQuery.parseJSON(eventData.payload).socketDescriptor;
            // Request the list of currently online participants
            socketConnection.transmit(jQuery.serializeJSON({ commandType : 'fetchOnlineUsers' }));
            // Retrieve past conversation history
            socketConnection.transmit(jQuery.serializeJSON({ commandType : 'retrieveHistory' }));
            // window.alert( "Message received: " + eventData.payload );
        }
        else if (commandType === 'fetchOnlineUsers') {
            displayActiveUsers(receivedPacket);
        }
        else if (commandType === 'retrieveHistory') {
            renderPastMessages(receivedPacket);
        }
        else if (commandType === 'newParticipant') {
            presentNewParticipant(receivedPacket);
        }
        else if (commandType === 'incomingMessage') {
            renderNewChatMessage(receivedPacket);
        }
        else if (commandType === 'offline') {
            const participantID = receivedPacket.socketDescriptor;
            removeParticipant(participantID);
            renderNewChatMessage(receivedPacket);
        }
    };

    /**
     * Event handler for when the connection to the server is closed.
     */
    socketConnection.onDisconnect = function (eventData) {
        if (window.confirm("The chat server connection has been terminated.")) {
            // window.alert('You have exited the chat room.');
            window.location.assign('index.html');
        }
    };

    /**
     * Event handler for connection errors.
     */
    socketConnection.onError = function (eventData) {
        window.alert("An error occurred: " + eventData.payload);
        console.info("onError event triggered");
    };
}

document.addEventListener('keydown', function (keyboardEvent) {
    const eventObject = keyboardEvent;
    if (eventObject.keyCode === 13) { // Enter key
        dispatchMessage(jQuery('#messageInput').val(), 'text');
        return false;
    } else {
        return true;
    }
});

function chooseRecipient(targetUserID) {
    jQuery('#recipientSelector').val(targetUserID);
}

/**
 * Displays the list of all currently active users in the chat.
 * @param {Object} onlineData - Object containing online user information.
 */
function displayActiveUsers(onlineData) {
    let userListHTML = '';
    let recipientOptions = "<option value='0' id='userEntry_all' >Everyone</option>";

    for (let iterator = 0; iterator < onlineData.userArray.length; iterator++) {
        userListHTML = userListHTML + "<li id='roomMember_" + onlineData.userArray[iterator].identifier + "'>" +
            "<a href=\"javascript:chooseRecipient('"
            + onlineData.userArray[iterator].identifier + "')\">" + "<img src='" + onlineData.userArray[iterator].profilePic
            + "' width='50' height='50'></a></li>";

        activeParticipants[onlineData.userArray[iterator].identifier] = onlineData.userArray[iterator].displayName;

        if (onlineData.userArray[iterator].identifier !== userSessionID) {
            recipientOptions = recipientOptions + "<option value='" + onlineData.userArray[iterator].identifier + "' id='userEntry_" + onlineData.userArray[iterator].identifier + "'>"
                + onlineData.userArray[iterator].displayName + "</option>";
        }
    }
    jQuery('#sidebarUserList').html(userListHTML);
    jQuery('#recipientSelector').html(recipientOptions);
}

/**
 * Renders the historical chat messages received from the server.
 * @param {Object} historyRecord - Object containing chat history data.
 */
function renderPastMessages(historyRecord) {
    let singleMessage;
    console.dir(historyRecord);
    for (let iterator = 0; iterator < historyRecord.entries.length; iterator++) {
        singleMessage = historyRecord.entries[iterator].content;
        if (!singleMessage) {
            continue;
        }
        singleMessage.timestamp = historyRecord.entries[iterator].time;
        singleMessage.senderInfo = historyRecord.entries[iterator].user;
        if (historyRecord.entries[iterator].type) {
            singleMessage.contentType = historyRecord.entries[iterator].type;
        }
        singleMessage.channelType = 3; // Historical channel type
        renderNewChatMessage(singleMessage);
    }
}

/**
 * Handles the display of a new user joining the chat.
 * @param {Object} newUserData - Data about the newly connected user.
 */
function presentNewParticipant(newUserData) {
    if (!activeParticipants[newUserData.identifier]) {
        activeParticipants[newUserData.identifier] = newUserData.displayName;
        if (newUserData.identifier !== userSessionID) {
            jQuery('#recipientSelector').append("<option value='" + newUserData.identifier + "' id='userEntry_" + newUserData.identifier + "'>" + newUserData.displayName + "</option>");
        }
        jQuery('#sidebarUserList').append(
            "<li id='roomMember_" + newUserData.identifier + "'>" +
                '<a href="javascript: chooseRecipient(\'' + newUserData.identifier + '\')">' + "<img src='" + newUserData.profilePic
                + "' width='50' height='50'></a></li>");
    }
}

/**
 * Displays a new chat message in the conversation log.
 * @param {Object} messageObject - The message data to be rendered.
 */
function renderNewChatMessage(messageObject) {
    let messageBody;
    if (!messageObject.contentType || messageObject.contentType === 'text') {
        messageBody = sanitizeInput(messageObject.payload);
    }
    else if (messageObject.contentType === 'image') {
        const mediaPayload = JSON.parse(messageObject.payload);
        messageBody = '<br /><a href="' + mediaPayload.sourceURL + '" target="_blank"><img src="' + mediaPayload.thumbnailURL + '" /></a>';
    }

    const senderID = messageObject.from;
    const communicationChannel = messageObject.channel;

    messageBody = processEmoticons(messageBody);
    let spokenPhrase = '';
    let formattedTime;

    if (messageObject.timestamp) {
        formattedTime = formatTimestamp(messageObject.timestamp);
    } else {
        formattedTime = formatTimestamp();
    }

    jQuery("#messageTemplate .messageTimestamp").html(formattedTime);
    if (senderID === 0) { // System message
        jQuery("#messageTemplate .senderPicture").html("");
        jQuery("#messageTemplate .messageContent").html(
            "<span style='color: green'>【System Alert】</span>" + messageBody);
    }
    else {
        let constructedHTML = '';
        const recipientID = messageObject.to;

        // Historical message
        if (communicationChannel === 3) {
            spokenPhrase = ' said to everyone:';
            constructedHTML += '<span style="color: green">【History】</span><span style="color: orange">' + messageObject.senderInfo.name + spokenPhrase;
            constructedHTML += '</span>';
        }
        // If the speaker is the current user
        else {
            if (userSessionID === senderID) {
                if (communicationChannel === 0) { // Public message
                    spokenPhrase = 'I said to everyone:';
                }
                else if (communicationChannel === 1) { // Private message
                    spokenPhrase = "I privately messaged " + activeParticipants[recipientID] + ":";
                }
                constructedHTML += '<span style="color: orange">' + spokenPhrase + ' </span> ';
            }
            else { // Message from another user
                if (communicationChannel === 0) { // Public message
                    spokenPhrase = ' said to everyone:';
                }
                else if (communicationChannel === 1) { // Private message
                    spokenPhrase = " privately messaged me:";
                }

                constructedHTML += '<span style="color: orange"><a href="javascript:chooseRecipient('
                    + senderID + ')">' + activeParticipants[senderID] + spokenPhrase;
                constructedHTML += '</a></span> ';
            }
        }
        constructedHTML += messageBody + '</span>';
        jQuery("#messageTemplate .messageContent").html(constructedHTML);
    }
    jQuery("#conversationLog").append(jQuery("#messageTemplate").html());
    jQuery('#conversationLog')[0].scrollTop = 1000000; // Scroll to bottom
}

function sanitizeInput(inputString) {
    inputString = inputString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x22/g, '&quot;').replace(/\x27/g, '&#39;');
    return inputString;
}

function processEmoticons(textContent) {
    textContent = textContent.replace(/#(\d*)/g, '<img src="/static/img/face/$1.gif" />');
    textContent = textContent.replace('&amp;', '&'); // Revert specific HTML entity
    return textContent;
}


function formatTimestamp(unixTimestamp) {
    let dateObject;
    dateObject = new Date();

    if (unixTimestamp) {
        dateObject.setTime(unixTimestamp * 1000);
    }
    let hours, minutes, seconds;
    hours = dateObject.getHours();
    minutes = dateObject.getMinutes();
    seconds = dateObject.getSeconds();

    hours = ( hours < 10 ) ? '0' + hours : hours;
    minutes = ( minutes < 10 ) ? '0' + minutes : minutes;
    seconds = ( seconds < 10 ) ? '0' + seconds : seconds;
    return hours + ":" + minutes + ":" + seconds;
}

function retrieveURLParameters() {
    const currentURL = window.location.search; // Get the query string part of the URL
    const parameterMap = new Object();
    if (currentURL.indexOf("?") !== -1) {
        const queryString = currentURL.substring(1);

        const paramPairs = queryString.split("&");
        for (let iterator = 0; iterator < paramPairs.length; iterator++) {
            const decodedPair = decodeURIComponent(paramPairs[iterator]);
            const keyValuePair = decodedPair.split("=");
            parameterMap[keyValuePair[0]] = keyValuePair[1];
        }
    }
    return parameterMap;
}

function chooseRecipient(targetUserID) {
    jQuery('#recipientSelector').val(targetUserID);
}

function removeParticipant(participantID) {
    jQuery('#userEntry_' + participantID).remove();
    jQuery('#roomMember_' + participantID).remove();
    delete (activeParticipants[participantID]);
}

function dispatchMessage(messageContent, messageType) {
    const outgoingMessage = {};

    if (typeof messageContent === "string") {
        messageContent = messageContent.replace(" ", "&nbsp;"); // Replace spaces for display
    }

    if (!messageContent) {
        return false;
    }

    if (jQuery('#recipientSelector').val() === '0') { // Public message
        outgoingMessage.command = 'message';
        outgoingMessage.sender = userSessionID;
        outgoingMessage.channel = 0;
        outgoingMessage.payload = messageContent;
        outgoingMessage.contentType = messageType;
        socketConnection.transmit(jQuery.serializeJSON(outgoingMessage));
    }
    else { // Private message
        outgoingMessage.command = 'message';
        outgoingMessage.sender = userSessionID;
        outgoingMessage.recipient = jQuery('#recipientSelector').val();
        outgoingMessage.channel = 1;
        outgoingMessage.payload = messageContent;
        outgoingMessage.contentType = messageType;
        socketConnection.transmit(jQuery.serializeJSON(outgoingMessage));
    }
    renderNewChatMessage(outgoingMessage);
    jQuery('#messageInput').val(''); // Clear the input field
}

jQuery(document).ready(function () {
    let faceIconHTML = '';
    for (let iterator = 1; iterator < 20; iterator++) {
        faceIconHTML += '<a class="face" href="#" onclick="selectEmoticon(' + iterator + ');return false;"><img src="/static/img/face/' + iterator + '.gif" /></a>';
    }
    jQuery("#emoticonDisplayArea").html(faceIconHTML);
});

(function (dollarSign) {
    dollarSign.fn.augment({
        injectTextAtCursor: function (textToInsert) {
            const targetElement = dollarSign(this)[0];
            if (document.selectionObject) { // IE Support
                this.focus();
                const selectionRange = document.selectionObject.createRange();
                selectionRange.text = textToInsert;
                this.focus();
            }
            else if (targetElement.selectionStartOffset || targetElement.selectionStartOffset === 0) { // Modern Browsers
                const startPos = targetElement.selectionStartOffset;
                const endPos = targetElement.selectionEndOffset;
                const scrollPosition = targetElement.scrollPosition;
                targetElement.value = targetElement.value.substring(0, startPos) + textToInsert + targetElement.value.substring(endPos, targetElement.value.length);
                this.focus();
                targetElement.selectionStartOffset = startPos + textToInsert.length;
                targetElement.selectionEndOffset = startPos + textToInsert.length;
                targetElement.scrollPosition = scrollPosition;
            }
            else { // Fallback
                this.value += textToInsert;
                this.focus();
            }
        }
    });
})(jQuery);


function selectEmoticon(emoticonID) {
    const imageTag = '<img src="/static/img/face/' + emoticonID + '.gif" />'; // This variable is not used in the original logic, maintaining structure.
    jQuery("#messageInput").injectTextAtCursor("#" + emoticonID);
    hideEmoticonPanel();
}


function displayEmoticonPanel() {
    jQuery("#emoticonPanel").attr("class", "chat_face chat_face_hover");
    jQuery("#emoticonDisplayArea").attr("class", "show_face show_face_hovers");
}

function hideEmoticonPanel() {
    jQuery("#emoticonPanel").attr("class", "chat_face");
    jQuery("#emoticonDisplayArea").attr("class", "show_face");
}

function toggleEmoticonVisibility() {
    jQuery("#emoticonPanel").toggleClass("chat_face_hover");
    jQuery("#emoticonDisplayArea").toggleClass("show_face_hovers");
}
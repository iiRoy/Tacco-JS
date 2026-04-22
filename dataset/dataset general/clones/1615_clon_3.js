"use strict";

// Core application state
let socketConnection = null; // Renamed from ws, using let as it's reassigned
let userSessionId = 0;      // Renamed from client_id
const activeUsersMap = new Map(); // Renamed from userlist, changed data type to Map
let queryParameters = {};   // Renamed from GET

/**
 * Utility function to parse URL query parameters.
 * @returns {Object} An object containing key-value pairs of URL parameters.
 */
function parseUrlQueryString() {
    const urlSearch = window.location.search;
    const params = {};
    if (urlSearch.startsWith('?')) {
        const queryStr = urlSearch.substring(1);
        const pairs = queryStr.split('&');
        for (const pair of pairs) {
            const decodedPair = decodeURIComponent(pair);
            const parts = decodedPair.split('=');
            if (parts.length === 2) {
                params[parts[0]] = parts[1];
            }
        }
    }
    return params;
}

// Initialize query parameters immediately
queryParameters = parseUrlQueryString();

/**
 * Handles the WebSocket connection setup based on browser capabilities.
 * Supports native WebSocket, Flash fallback, or HTTP Comet.
 */
function initializeSocketConnection() {
    // Ensure the webim object is available for configuration
    if (typeof webim === 'undefined' || !webim.server) {
        console.error("WebIM configuration (webim.server) is missing. Cannot initialize connection.");
        alert("Chat service configuration error. Please try again later.");
        return;
    }

    // Attempt to use native WebSocket first
    if (window.WebSocket || window.MozWebSocket) {
        socketConnection = new WebSocket(webim.server);
        console.log("Attempting native WebSocket connection.");
    }
    // Fallback to Flash WebSocket if configured and native is unavailable
    else if (webim.flash_websocket) {
        console.warn("Native WebSocket not supported, falling back to Flash WebSocket.");
        // Define Flash WebSocket SWF location
        window.WEB_SOCKET_SWF_LOCATION = "/static/flash-websocket/WebSocketMain.swf";
        // Asynchronously load necessary Flash WebSocket scripts
        $.getScript("/static/flash-websocket/swfobject.js", () => {
            $.getScript("/static/flash-websocket/web_socket.js", () => {
                socketConnection = new WebSocket(webim.server);
                console.log("Flash WebSocket initialized.");
            }).fail(() => console.error("Failed to load web_socket.js"));
        }).fail(() => console.error("Failed to load swfobject.js"));
    }
    // Fallback to HTTP Long Polling (Comet) if no WebSocket option is available
    else {
        console.info("No WebSocket support, using HTTP Comet for communication.");
        socketConnection = new Comet(webim.server);
    }

    // Once the connection object is assigned, set up event handlers
    if (socketConnection) {
        setupSocketListeners();
    } else {
        console.error("Failed to establish any type of socket connection.");
        alert("Failed to connect to chat server. Please check your browser or network.");
    }
}

// Entry point for DOM readiness
$(document).ready(function () {
    initializeSocketConnection();
});

/**
 * Configures all event listeners for the WebSocket connection.
 */
function setupSocketListeners() {
    /**
     * Event handler for when the WebSocket connection is successfully established.
     * Performs initial validation and sends login information.
     * @param {Event} eventPayload - The connection open event.
     */
    socketConnection.onopen = function (eventPayload) {
        console.log("WebSocket connection established. Event:", eventPayload);

        // Crucial validation: user name and avatar are required for chat participation
        const userName = queryParameters['name'];
        const userAvatar = queryParameters['avatar'];

        if (!userName || !userAvatar) {
            alert('A name and an avatar are required to join the chat. Please provide both.');
            socketConnection.close(); // Close connection if validation fails
            return false; // Prevent further processing
        }

        console.log("Connection to chat server successful.");

        // Construct and send the login message
        const loginMessage = {
            cmd: 'login',
            name: userName,
            avatar: userAvatar
        };
        socketConnection.send($.toJSON(loginMessage));
    };

    /**
     * Event handler for incoming messages from the WebSocket server.
     * Parses the message and dispatches it to appropriate handlers based on command type.
     * @param {MessageEvent} eventPayload - The incoming message event.
     */
    socketConnection.onmessage = function (eventPayload) {
        try {
            const receivedData = $.evalJSON(eventPayload.data);
            const commandType = receivedData.cmd;

            if (!commandType) {
                console.warn("Received message with no command type:", receivedData);
                return;
            }

            // Dispatch based on command type
            switch (commandType) {
                case 'login':
                    // Extract client ID and request online list and history
                    userSessionId = receivedData.fd; // Assuming fd is the client_id
                    socketConnection.send($.toJSON({ cmd: 'getOnline' }));
                    socketConnection.send($.toJSON({ cmd: 'getHistory' }));
                    break;
                case 'getOnline':
                    renderOnlineUserList(receivedData);
                    break;
                case 'getHistory':
                    displayMessageHistory(receivedData);
                    break;
                case 'newUser':
                    addNewUserToDisplay(receivedData);
                    break;
                case 'fromMsg':
                    displayIncomingMessage(receivedData);
                    break;
                case 'offline':
                    const disconnectedUserId = receivedData.fd;
                    removeUserFromUI(disconnectedUserId);
                    displayIncomingMessage(receivedData); // Optionally show an offline message
                    break;
                default:
                    console.info(`Unknown command received: ${commandType}`, receivedData);
                    // Optionally handle unknown commands or log them
                    break;
            }
        } catch (error) {
            console.error("Error processing incoming message:", error, eventPayload.data);
        }
    };

    /**
     * Event handler for when the WebSocket connection is closed.
     * Prompts the user and redirects if confirmed.
     * @param {CloseEvent} eventPayload - The connection close event.
     */
    socketConnection.onclose = function (eventPayload) {
        console.log("WebSocket connection closed. Event:", eventPayload);
        if (confirm("The chat server connection has been terminated. Do you want to reload?")) {
            window.location.href = 'index.html'; // Redirect to home page
        } else {
            console.info("User chose not to reload after connection close.");
        }
    };

    /**
     * Event handler for WebSocket errors.
     * Displays an alert and logs the error.
     * @param {Event} eventPayload - The error event.
     */
    socketConnection.onerror = function (eventPayload) {
        console.error("WebSocket error occurred:", eventPayload);
        alert("A connection error occurred: " + (eventPayload.data || "Unknown error"));
    };
}

/**
 * Handles keyboard input, specifically the 'Enter' key for sending messages.
 * @param {KeyboardEvent} event - The keyboard event.
 * @returns {boolean} False if 'Enter' is pressed (to prevent default form submission), true otherwise.
 */
document.onkeydown = function (event) {
    const keyboardEvent = event || window.event; // Normalize event object
    if (keyboardEvent.keyCode === 13) { // Check for Enter key (keyCode 13)
        const messageInput = $('#message_composer').val(); // Renamed from msg_content
        dispatchChatMessage(messageInput, 'text'); // Use the message composer's content
        return false; // Prevent default form submission or newline
    }
    return true; // Allow other key presses to propagate
};

/**
 * Sets the selected recipient in the UI.
 * @param {string} userIdentity - The ID of the user to select.
 */
function setSelectedRecipient(userIdentity) {
    $('#recipient_selector').val(userIdentity); // Renamed from userlist
}

/**
 * Renders the list of currently online users in the UI.
 * @param {Object} userListData - Object containing the list of online users.
 */
function renderOnlineUserList(userListData) {
    if (!userListData || !Array.isArray(userListData.list)) {
        console.warn("Invalid or empty user list data received:", userListData);
        return;
    }

    let userListHtml = '';
    let recipientOptionsHtml = "<option value='0' id='recipient_all' >Everyone</option>"; // Renamed IDs and text

    userListData.list.forEach(function (user) {
        // Add user to the active users map for quick lookup
        activeUsersMap.set(user.fd, user.name);

        // Generate HTML for the left-hand user list display
        userListHtml += `<li id='inroom_user_${user.fd}'>` + // Renamed ID
            `<a href="javascript:setSelectedRecipient('${user.fd}')">` + // Renamed function
            `<img src='${user.avatar}' width='50' height='50' alt='${user.name}'></a></li>`;

        // Generate HTML for the recipient selection dropdown, excluding self
        if (user.fd !== userSessionId) {
            recipientOptionsHtml += `<option value='${user.fd}' id='recipient_${user.fd}'>${user.name}</option>`; // Renamed ID
        }
    });

    $('#online_users_display').html(userListHtml); // Renamed selector
    $('#recipient_selector').html(recipientOptionsHtml); // Renamed selector
}

/**
 * Displays historical chat messages.
 * @param {Object} historyData - Object containing historical messages.
 */
function displayMessageHistory(historyData) {
    if (!historyData || !Array.isArray(historyData.history)) {
        console.info("No chat history available or invalid history data.");
        return;
    }

    console.debug("Processing chat history:", historyData);

    // Iterate through history and display each message
    historyData.history.forEach(function (historyItem) {
        const message = historyItem.msg;
        if (!message) return; // Skip empty messages

        // Augment message object with historical context
        message.timestamp = historyItem.time; // Renamed 'time' to 'timestamp' for clarity
        message.senderInfo = historyItem.user; // Renamed 'user' to 'senderInfo'
        message.messageType = historyItem.type || 'text'; // Renamed 'type' to 'messageType'
        message.channelType = 3; // Hardcoded channel for history, might be 'system' or 'archive'

        displayIncomingMessage(message); // Reuse the message display function
    });
}

/**
 * Adds a new user to the UI display when they connect.
 * @param {Object} newUserData - Object containing information about the new user.
 */
function addNewUserToDisplay(newUserData) {
    // Check if user already exists in map to prevent duplicates
    if (!activeUsersMap.has(newUserData.fd)) {
        activeUsersMap.set(newUserData.fd, newUserData.name); // Add to map

        // Add to recipient selection dropdown if not self
        if (newUserData.fd !== userSessionId) {
            $('#recipient_selector').append(
                `<option value='${newUserData.fd}' id='recipient_${newUserData.fd}'>${newUserData.name}</option>`
            );
        }

        // Add to the main online users display list
        $('#online_users_display').append(
            `<li id='inroom_user_${newUserData.fd}'>` +
            `<a href="javascript:setSelectedRecipient('${newUserData.fd}')">` +
            `<img src='${newUserData.avatar}' width='50' height='50' alt='${newUserData.name}'></a></li>`
        );
        console.log(`New user '${newUserData.name}' (ID: ${newUserData.fd}) added to display.`);
    } else {
        console.debug(`User ID ${newUserData.fd} already exists, skipping addition.`);
    }
}

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * @param {string} rawString - The raw string to sanitize.
 * @returns {string} The sanitized string.
 */
function cleanHtmlEntities(rawString) {
    return rawString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Replaces specific patterns in a string with emoji images.
 * @param {string} textWithCodes - The text possibly containing emoji codes.
 * @returns {string} The text with emoji codes replaced by image tags.
 */
function replaceEmojis(textWithCodes) {
    // Replace custom emoji codes like #1, #2 with image tags
    let processedText = textWithCodes.replace(/#(\d+)/g, '<img src="/static/img/face/$1.gif" alt="emoji $1" class="chat-emoji" />');
    // Decode any remaining HTML entities that were encoded for safety, except for the emoji images
    processedText = processedText.replace(/&amp;/g, '&');
    return processedText;
}

/**
 * Formats a timestamp into a "HH:MM:SS" string.
 * @param {number} [timestampInSeconds] - Optional UNIX timestamp in seconds. If not provided, current time is used.
 * @returns {string} Formatted time string.
 */
function formatTimestampAsTime(timestampInSeconds) {
    const dateObject = timestampInSeconds ? new Date(timestampInSeconds * 1000) : new Date();

    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Displays an incoming message in the chat interface.
 * @param {Object} messageData - Object containing message details.
 */
function displayIncomingMessage(messageData) {
    if (!messageData || typeof messageData !== 'object') {
        console.error("Invalid message data provided to displayIncomingMessage:", messageData);
        return;
    }

    let messageContentHtml = '';
    const msgType = messageData.type || 'text';

    // Process message content based on its type
    if (msgType === 'text') {
        messageContentHtml = cleanHtmlEntities(messageData.data);
    } else if (msgType === 'image') {
        try {
            const imageData = JSON.parse(messageData.data);
            messageContentHtml = `<br /><a href="${imageData.url}" target="_blank" rel="noopener noreferrer"><img src="${imageData.thumb}" alt="Image" class="chat-image-thumb" /></a>`;
        } catch (e) {
            console.error("Failed to parse image data:", messageData.data, e);
            messageContentHtml = `[Error: Could not display image: ${cleanHtmlEntities(messageData.data)}]`;
        }
    } else {
        console.warn(`Unsupported message type received: ${msgType}. Displaying raw data.`);
        messageContentHtml = cleanHtmlEntities(messageData.data);
    }

    // Apply emoji replacements
    messageContentHtml = replaceEmojis(messageContentHtml);

    const senderId = messageData.from;
    const recipientId = messageData.to; // For private messages
    const messageChannel = messageData.channal; // 0: public, 1: private, 3: history

    const displayTime = formatTimestampAsTime(messageData.time);

    // Create a temporary message element for dynamic content injection
    const $msgTemplate = $('#message_template_structure').clone(); // Renamed from msg-template
    $msgTemplate.removeAttr('id').removeClass('hidden'); // Remove template ID and make visible

    $msgTemplate.find('.message-time-stamp').text(displayTime); // Renamed class

    let speakerIdentifierHtml = ''; // Holds who said what
    let messageBodyPrefix = ''; // Holds system/history/private indicators

    // Handle system messages (senderId 0 typically indicates system)
    if (senderId === 0) {
        $msgTemplate.find('.user-avatar-placeholder').empty(); // Renamed class
        messageBodyPrefix = '<span class="system-message-indicator">【System Message】</span>'; // Renamed class
        speakerIdentifierHtml = ''; // No specific speaker for system messages
    } else {
        // Determine speaker and channel context
        const isHistoricalMessage = (messageChannel === 3);
        const isMyMessage = (userSessionId === senderId);
        const senderName = isHistoricalMessage && messageData.senderInfo ? messageData.senderInfo.name : activeUsersMap.get(senderId) || `Unknown User (${senderId})`;
        const recipientName = activeUsersMap.get(recipientId) || `User (${recipientId})`;

        if (isHistoricalMessage) {
            messageBodyPrefix = '<span class="history-message-indicator">【History】</span>'; // Renamed class
            speakerIdentifierHtml = `<span class="message-speaker-name">${senderName} to Everyone:</span>`; // Renamed class
        } else if (isMyMessage) {
            if (messageChannel === 0) { // Public message from me
                speakerIdentifierHtml = '<span class="message-speaker-name">I said to Everyone:</span>';
            } else if (messageChannel === 1) { // Private message from me
                speakerIdentifierHtml = `<span class="message-speaker-name">I privately told ${recipientName}:</span>`;
            }
        } else { // Message from another user
            if (messageChannel === 0) { // Public message from someone else
                speakerIdentifierHtml = `<span class="message-speaker-name"><a href="javascript:setSelectedRecipient('${senderId}')">${senderName} to Everyone:</a></span>`;
            } else if (messageChannel === 1) { // Private message from someone else
                speakerIdentifierHtml = `<span class="message-speaker-name"><a href="javascript:setSelectedRecipient('${senderId}')">${senderName} privately told me:</a></span>`;
            }
        }

        // Add avatar if available (assuming messageData.avatar might be present for messages too)
        if (messageData.avatar) {
            $msgTemplate.find('.user-avatar-placeholder').html(`<img src="${messageData.avatar}" width="30" height="30" alt="${senderName}">`);
        } else {
            $msgTemplate.find('.user-avatar-placeholder').empty();
        }
    }

    // Combine all parts for the message content area
    $msgTemplate.find('.message-text-area').html(`${messageBodyPrefix}${speakerIdentifierHtml} ${messageContentHtml}`); // Renamed class
    $('#chat_message_area').append($msgTemplate); // Renamed selector
    $('#chat_message_area')[0].scrollTop = $('#chat_message_area')[0].scrollHeight; // Scroll to bottom
}


/**
 * Removes a user's display elements from the UI.
 * @param {string} targetUserId - The ID of the user to remove.
 */
function removeUserFromUI(targetUserId) {
    $(`#recipient_${targetUserId}`).remove(); // Remove from dropdown
    $(`#inroom_user_${targetUserId}`).remove(); // Remove from online list
    activeUsersMap.delete(targetUserId); // Remove from the internal map
    console.log(`User ID ${targetUserId} removed from UI and active users map.`);
}

/**
 * Dispatches a chat message to the server.
 * @param {string} messageContent - The content of the message.
 * @param {string} messageType - The type of message (e.g., 'text', 'image').
 * @returns {boolean} False if message is empty, true otherwise.
 */
function dispatchChatMessage(messageContent, messageType) {
    let processedContent = messageContent;

    // Basic sanitization/replacement for text content
    if (typeof processedContent === "string") {
        processedContent = processedContent.trim().replace(/\s/g, '&nbsp;'); // Replace spaces with non-breaking spaces
    }

    if (!processedContent) {
        console.warn("Attempted to send an empty message.");
        return false;
    }

    const recipientSelection = $('#recipient_selector').val(); // Get selected recipient ID

    const outgoingMessage = {
        cmd: 'message',
        from: userSessionId,
        data: processedContent,
        type: messageType
    };

    if (recipientSelection === '0') {
        // Public message
        outgoingMessage.channal = 0;
        console.log("Sending public message:", outgoingMessage);
    } else {
        // Private message
        outgoingMessage.channal = 1;
        outgoingMessage.to = recipientSelection;
        console.log("Sending private message:", outgoingMessage);
    }

    socketConnection.send($.toJSON(outgoingMessage));
    // Display the sent message immediately in the sender's own chat window
    displayIncomingMessage(outgoingMessage);
    $('#message_composer').val(''); // Clear the message input field
    return true;
}

/**
 * Initializes the emoji panel with clickable face icons.
 */
$(document).ready(function () {
    let emojiHtmlContent = '';
    const numberOfEmojis = 20; // Number of available emoji images

    for (let i = 1; i <= numberOfEmojis; i++) {
        emojiHtmlContent += `<a class="emoji-icon-link" href="#" onclick="insertEmojiIntoMessage(${i}); return false;">` +
            `<img src="/static/img/face/${i}.gif" alt="emoji ${i}" /></a>`;
    }
    $("#emoji_panel_content").html(emojiHtmlContent); // Renamed selector
});

/**
 * jQuery plugin to insert text at the caret position in a textarea.
 * Supports older IE versions and modern browsers.
 */
(function ($) {
    $.fn.extend({
        insertAtCaret: function (textToInsert) {
            const targetElement = $(this)[0]; // Get the native DOM element
            // For IE < 9
            if (document.selection) {
                targetElement.focus();
                const selection = document.selection.createRange();
                selection.text = textToInsert;
                targetElement.focus();
            }
            // For modern browsers
            else if (targetElement.selectionStart || targetElement.selectionStart === 0) {
                const startPos = targetElement.selectionStart;
                const endPos = targetElement.selectionEnd;
                const scrollTop = targetElement.scrollTop; // Preserve scroll position
                // Insert text by manipulating the value string
                targetElement.value = targetElement.value.substring(0, startPos) +
                    textToInsert +
                    targetElement.value.substring(endPos, targetElement.value.length);
                targetElement.focus();
                // Set caret position after inserted text
                targetElement.selectionStart = startPos + textToInsert.length;
                targetElement.selectionEnd = startPos + textToInsert.length;
                targetElement.scrollTop = scrollTop; // Restore scroll position
            }
            // Fallback for other browsers (append to end)
            else {
                targetElement.value += textToInsert;
                targetElement.focus();
            }
            return this; // Allow chaining
        }
    });
})(jQuery);

/**
 * Inserts an emoji code into the message composer at the caret position.
 * @param {number} emojiId - The ID of the emoji to insert.
 */
function insertEmojiIntoMessage(emojiId) {
    $("#message_composer").insertAtCaret(`#${emojiId}`); // Renamed selector
    closeEmojiPanel(); // Close the emoji panel after selection
}

/**
 * Opens the emoji selection panel.
 */
function openEmojiPanel() {
    $("#emoji_trigger_button").addClass("emoji-trigger-active"); // Renamed class
    $("#emoji_panel_content").addClass("emoji-panel-visible"); // Renamed class
}

/**
 * Closes the emoji selection panel.
 */
function closeEmojiPanel() {
    $("#emoji_trigger_button").removeClass("emoji-trigger-active");
    $("#emoji_panel_content").removeClass("emoji-panel-visible");
}

/**
 * Toggles the visibility of the emoji selection panel.
 */
function toggleEmojiPanel() {
    $("#emoji_trigger_button").toggleClass("emoji-trigger-active");
    $("#emoji_panel_content").toggleClass("emoji-panel-visible");
}
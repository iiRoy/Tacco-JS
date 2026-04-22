(function($, currentWindow, socketIO) {

    // Configuration constants for the chat application
    const CHAT_NAMESPACE = '/pchat';
    const USER_NAME_PARAM = 'name'; // URL parameter key for user's name

    /**
     * Helper function to extract a parameter from the current URL.
     * @param {string} paramKey - The key of the URL parameter to extract.
     * @returns {string|null} The value of the parameter, or null if not found.
     */
    const retrieveUrlParameter = (paramKey) => {
        const params = new URLSearchParams(currentWindow.location.search);
        return params.get(paramKey);
    };

    /**
     * Utility function to format the current time for display.
     * @returns {string} Formatted time string (HH:MM:SS).
     */
    const getFormattedTimestamp = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    /**
     * Generates an HTML string for a chat log entry.
     * @param {string} content - The main text content of the entry.
     * @param {string} [cssClass=''] - Optional CSS class for styling.
     * @param {boolean} [isSystemMessage=false] - If true, adds a timestamp.
     * @param {string} [customColor=''] - Optional inline style color.
     * @returns {string} The HTML string for the chat entry.
     */
    const generateChatEntryMarkup = (content, cssClass = '', isSystemMessage = false, customColor = '') => {
        const timestamp = isSystemMessage ? `<span class="timestamp">${getFormattedTimestamp()}</span> ` : '';
        const styleAttr = customColor ? ` style="color:${customColor}"` : '';
        return `<div class="chat-entry ${cssClass}"${styleAttr}>${timestamp}${content}</div>`;
    };

    // The main application object for client-side chat functionality
    var talkSphereClient = {
        // Application settings and state
        configuration: {
            activeUserName: retrieveUrlParameter(USER_NAME_PARAM), // Participant's display name
            clientConnectionId: null, // Unique ID for this client's socket connection
            commSocket: null, // The Socket.IO connection object
            // References to key DOM elements, stored as jQuery objects
            domElements: {
                messageInputField: null,
                conversationLog: null,
                pageHeader: null
            },
            // CSS classes for different message types
            messageClasses: {
                systemConnected: 'system-green',
                systemWelcome: 'system-hot-pink',
                systemInfo: 'system-off-white',
                systemDisconnected: 'system-italic-green'
            }
        },

        // Application event handlers (entry points)
        appEvents: {
            /**
             * Initiates the chat session once the DOM is ready.
             */
            beginChatSession: function() {
                talkSphereClient.utilityFunctions.initializeCoreComponents();
            }
        },

        // Core utility methods and functions
        utilityFunctions: {
            /**
             * Sets up the application: initializes DOM references, binds events, and establishes socket connection.
             */
            initializeCoreComponents: function() {
                // Ensure a user name is provided; redirect if missing
                if (!talkSphereClient.configuration.activeUserName) {
                    alert('Please enter your name in the URL (e.g., ?name=YourName)');
                    currentWindow.location = '/';
                    return;
                }

                // Cache jQuery selectors for frequently used DOM elements
                const dom = talkSphereClient.configuration.domElements;
                dom.messageInputField = $('#msg');
                dom.conversationLog = $('#incoming');
                dom.pageHeader = $('#header');

                // Set initial focus on the message input field
                dom.messageInputField.trigger('focus');

                // Bind event listeners
                dom.messageInputField.on('keydown', function(keyboardEvent) {
                    // Check for 'Enter' key press (and not Shift+Enter for multiline)
                    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
                        keyboardEvent.preventDefault(); // Prevent default newline in textarea
                        talkSphereClient.utilityFunctions.dispatchMessage();
                    }
                });

                dom.pageHeader.on('click', function() {
                    // Clear the user name and redirect to the root page
                    talkSphereClient.configuration.activeUserName = '';
                    currentWindow.location.href = '/';
                });

                // Establish the WebSocket connection to the chat namespace
                talkSphereClient.configuration.commSocket = socketIO(CHAT_NAMESPACE);

                // Register handlers for incoming socket events
                talkSphereClient.configuration.commSocket.on('userReady', talkSphereClient.utilityFunctions.onParticipantJoin);
                talkSphereClient.configuration.commSocket.on('userMessage', talkSphereClient.utilityFunctions.onIncomingMessage);
                talkSphereClient.configuration.commSocket.on('userDisconnected', talkSphereClient.utilityFunctions.onParticipantLeave);

                // Inform the server that this client is ready with its user name
                talkSphereClient.configuration.commSocket.emit('userReady', { name: talkSphereClient.configuration.activeUserName });
            },

            /**
             * Scrolls the chat display area to the very bottom to show the latest messages.
             */
            scrollToBottom: function() {
                const conversationElement = document.getElementById('conversation');
                if (conversationElement) {
                    conversationElement.scrollTop = conversationElement.scrollHeight;
                }
            },

            /**
             * Sends the user's message to the server if it's not empty.
             * Clears the message input field after sending.
             */
            dispatchMessage: function() {
                const messageContent = talkSphereClient.configuration.domElements.messageInputField.val().trim();

                // Only send non-empty messages
                if (messageContent.length > 0) {
                    talkSphereClient.configuration.commSocket.emit('userMessage', {
                        name: talkSphereClient.configuration.activeUserName,
                        message: messageContent
                    });
                }

                // Clear the input field regardless of whether the message was sent
                talkSphereClient.configuration.domElements.messageInputField.val('');
            },

            /**
             * Handles the event when a new participant joins the chat.
             * Displays a welcome message and lists current participants.
             * @param {object} eventPayload - Data sent from the server, including new user's name and existing connections.
             */
            onParticipantJoin: function(eventPayload) {
                // Store the client's socket ID (though not used directly in this version)
                talkSphereClient.configuration.clientConnectionId = eventPayload.id;

                const decodedDisplayName = decodeURIComponent(eventPayload.name);
                const dom = talkSphereClient.configuration.domElements;
                const classes = talkSphereClient.configuration.messageClasses;

                // Announce the new connection
                dom.conversationLog.append(generateChatEntryMarkup(
                    `> ${decodedDisplayName} has joined the conversation.`,
                    classes.systemConnected,
                    true
                ));
                talkSphereClient.utilityFunctions.scrollToBottom();

                // Generate a welcome message with current participant info
                const participantNames = Object.values(eventPayload.connections);
                const currentParticipantCount = participantNames.length;
                let welcomeMessageText = `Welcome to Hot Probs, ${decodedDisplayName}!!!`;

                let participantInfoMessage;
                if (currentParticipantCount === 1) {
                    participantInfoMessage = 'You are the first one here! Waiting for others to join.';
                } else {
                    const otherParticipants = participantNames.filter(name => name !== eventPayload.name);
                    if (otherParticipants.length > 0) {
                        participantInfoMessage = `Currently ${otherParticipants.length} other participant(s) in this room: ${otherParticipants.join(', ')}.`;
                    } else {
                        participantInfoMessage = 'You are the only participant here right now.';
                    }
                }

                dom.conversationLog.append(generateChatEntryMarkup(
                    `> *** ${welcomeMessageText} ***`,
                    classes.systemWelcome,
                    true
                ));
                dom.conversationLog.append(generateChatEntryMarkup(
                    `> *** ${participantInfoMessage} ***`,
                    classes.systemInfo,
                    true
                ));
                talkSphereClient.utilityFunctions.scrollToBottom();
            },

            /**
             * Processes an incoming chat message from another participant.
             * Appends the message to the conversation log.
             * @param {object} eventPayload - Data containing sender's name, message content, and color.
             */
            onIncomingMessage: function(eventPayload) {
                // Only process messages that have a sender's name
                if (eventPayload.name) {
                    const decodedSenderName = decodeURIComponent(eventPayload.name);
                    const messageHtml = generateChatEntryMarkup(
                        `${decodedSenderName} > ${eventPayload.message}`,
                        '', // No specific class for regular messages
                        false, // Not a system message
                        eventPayload.color // Custom color from server
                    );
                    talkSphereClient.configuration.domElements.conversationLog.append(messageHtml);
                    talkSphereClient.utilityFunctions.scrollToBottom();
                }
            },

            /**
             * Handles the event when a participant disconnects from the chat.
             * Displays a notification in the conversation log.
             * @param {object} eventPayload - Data containing the name of the disconnected user.
             */
            onParticipantLeave: function(eventPayload) {
                // Only process if a user name is provided
                if (eventPayload.name) {
                    const decodedLeavingName = decodeURIComponent(eventPayload.name);
                    talkSphereClient.configuration.domElements.conversationLog.append(generateChatEntryMarkup(
                        `> ${decodedLeavingName} has disconnected.`,
                        talkSphereClient.configuration.messageClasses.systemDisconnected,
                        true
                    ));
                    talkSphereClient.utilityFunctions.scrollToBottom();
                }
            }
        }
    };

    // Initialize the chat application once the DOM is fully loaded
    $(document).ready(function() {
        talkSphereClient.appEvents.beginChatSession();
    });

}(jQuery, window, io));
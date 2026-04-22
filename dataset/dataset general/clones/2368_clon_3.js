(function(jq) {

    // Core application configuration and runtime variables.
    // This section defines settings and manages dynamic state.
    const MAX_HANDLE_LENGTH = 15; // Maximum character limit for user handles.
    const MAX_CHANNEL_NAME_LENGTH = 10; // Maximum character limit for chat channel names.
    let animationInProgress = false; // Flag to prevent concurrent UI animations.
    let wsConnection = null; // WebSocket connection instance.
    let userSessionId = null; // Unique identifier for the current client session.
    let userHandle = null; // The chosen nickname for the current user.

    // Tracks the currently active chat channel.
    let activeChannel = null;

    // Server-related details.
    const backendEndpoint = 'http://localhost'; // Address of the backend server.
    const systemIdentifier = 'SystemBot'; // Name displayed for server messages.
    const systemColorCode = '#1c5380'; // Color for system messages.

    // Pre-defined HTML snippets for dynamic UI rendering.
    // These are modern template literals for clarity and ease of use.
    const uiTemplates = {
        channelEntry: (channelName) => `
            <li data-channel-id="${channelName}">
                <span class="icon"></span> ${channelName}
            </li>
        `,
        clientEntry: (clientData, isCurrentClient = false) => `
            <li data-client-id="${clientData.clientId}" class="flex-row ${isCurrentClient ? 'current-user' : ''}">
                <div class="flex-item client-label"><span class="icon"></span> ${clientData.nickname}</div>
                <div class="flex-item typing-indicator"></div>
            </li>
        `,
        conversationLine: (messageData) => `
            <li class="flex-row">
                <div class="flex-item sender-label">${messageData.sender}: </div>
                <div class="flex-item message-content">${messageData.text}</div>
                <div class="flex-item timestamp-label">${messageData.timestamp}</div>
            </li>
        `
    };

    // Attaches event handlers to various DOM elements.
    // This function sets up user interaction points.
    function setupUserInterfaceListeners() {
        // Handle message input via Enter key or send button.
        jq('.chat-input input').on('keydown', function(evt) {
            if (evt.key === 'Enter') {
                processOutgoingMessage();
                evt.preventDefault(); // Prevent default form submission if any
            }
        });

        jq('.chat-submit button').on('click', function() {
            processOutgoingMessage();
        });

        // Handle nickname input via Enter key or "Begin" button.
        jq('#nickname-popup .input input').on('keydown', function(evt) {
            if (evt.key === 'Enter') {
                finalizeNicknameSelection();
                evt.preventDefault();
            }
        });

        jq('#nickname-popup .begin').on('click', function() {
            finalizeNicknameSelection();
        });

        // Handle new channel creation via Enter key or "Create" button.
        jq('#addroom-popup .input input').on('keydown', function(evt) {
            if (evt.key === 'Enter') {
                initiateChannelCreation();
                evt.preventDefault();
            }
        });

        jq('#addroom-popup .create').on('click', function() {
            initiateChannelCreation();
        });

        // Event for starting the nickname entry process.
        jq('.big-button-green.start').on('click', function() {
            jq('#nickname-popup .input input').val('');
            Avgrund.show('#nickname-popup');
            window.setTimeout(function() {
                jq('#nickname-popup .input input').trigger('focus');
            }, 100);
        });

        // Event for opening the "add channel" dialog.
        jq('.chat-rooms .title-button').on('click', function() {
            jq('#addroom-popup .input input').val('');
            Avgrund.show('#addroom-popup');
            window.setTimeout(function() {
                jq('#addroom-popup .input input').trigger('focus');
            }, 100);
        });

        // Keep selected channel visible when scrolling the channel list.
        jq('.chat-rooms ul').on('scroll', function() {
            const scrollOffset = jq(this).scrollTop();
            jq('.chat-rooms ul li.selected').css('top', scrollOffset);
        });

        // Add/remove a scroll indicator class based on scroll position in message area.
        jq('.chat-messages').on('scroll', function() {
            const selfElement = this;
            window.requestAnimationFrame(function() { // Use rAF for smoother UI updates
                const currentScrollTop = jq(selfElement).scrollTop();
                const visibleHeight = jq(selfElement).height();
                const totalContentHeight = jq(selfElement).find('ul').height();

                if (currentScrollTop + visibleHeight < totalContentHeight - 10) { // Small buffer
                    jq(selfElement).addClass('scrolled-up');
                } else {
                    jq(selfElement).removeClass('scrolled-up');
                }
            });
        });

        // Delegate click events for channel selection.
        jq('.chat-rooms ul').on('click', 'li', function() {
            const clickedChannel = jq(this).attr('data-channel-id');
            if (clickedChannel && clickedChannel !== activeChannel) {
                console.log(`Attempting to switch to channel: ${clickedChannel}`);
                wsConnection.emit('unsubscribeFromChannel', { channelIdentifier: activeChannel });
                wsConnection.emit('subscribeToChannel', { channelIdentifier: clickedChannel });
            }
        });
    }

    // Configures event listeners for WebSocket communication.
    // These events are triggered by the server.
    function initializeNetworkHandlers() {

        // Upon initial connection, notify the server with the user's chosen handle.
        wsConnection.on('connect', function() {
            console.info('WebSocket connected. Sending user handle.');
            wsConnection.emit('clientConnect', { clientNickname: userHandle });
        });

        // Server acknowledges connection and provides a unique client ID.
        wsConnection.on('ready', function(payload) {
            console.info('Server acknowledged client. Client ID received:', payload.clientId);
            // Hide the 'connecting...' overlay and focus the chat input.
            jq('.chat-shadow').animate({ 'opacity': 0 }, 200, function() {
                jq(this).hide();
                jq('.chat input').trigger('focus');
            });
            userSessionId = payload.clientId; // Store the assigned client ID.
        });

        // Receive the initial list of active chat channels from the server.
        wsConnection.on('channelList', function(payload) {
            console.debug('Received channel list:', payload.channels);
            if (!Array.isArray(payload.channels)) return; // Basic validation
            payload.channels.forEach(function(channelName) {
                // Ignore the default empty channel often present in socket.io.
                if (channelName && channelName.trim() !== '') {
                    appendChannelEntry(channelName, false);
                }
            });
        });

        // Handle incoming chat messages from other users or the system.
        wsConnection.on('chatMessage', function(payload) {
            // Ensure essential data is present.
            if (!payload || !payload.client || !payload.messageContent) {
                console.warn('Received malformed chat message payload:', payload);
                return;
            }
            const senderHandle = payload.client.nickname;
            const messageText = payload.messageContent;

            // Display the message in the chat window.
            renderChatMessage(senderHandle, messageText, true, false, false);
        });

        // After subscribing to a channel, the server sends its current client list.
        wsConnection.on('channelClients', function(payload) {
            if (!payload || !payload.channel || !Array.isArray(payload.clients)) {
                console.warn('Received malformed channel clients payload:', payload);
                return;
            }

            appendChannelEntry(payload.channel, false); // Ensure channel is listed.
            designateActiveChannel(payload.channel); // Mark it as current.

            renderChatMessage(systemIdentifier, `Welcome to channel: \`${payload.channel}\`!`, true, false, true);
            jq('.chat-clients ul').empty(); // Clear previous client list.

            // Add current user to the client list first, then others.
            enrollClientDisplay({ nickname: userHandle, clientId: userSessionId }, false, true);
            payload.clients.forEach(function(clientInfo) {
                if (clientInfo && clientInfo.clientId !== userSessionId) { // Avoid duplicating current user
                    enrollClientDisplay(clientInfo, false);
                }
            });

            // Hide the 'connecting to room' message.
            jq('.chat-shadow').animate({ 'opacity': 0 }, 200, function() {
                jq(this).hide();
                jq('.chat input').trigger('focus');
            });
        });

        // Notification when a new channel is created by another user.
        wsConnection.on('newChannelAdded', function(payload) {
            if (!payload || !payload.channel) return;
            appendChannelEntry(payload.channel, true);
        });

        // Notification when an empty channel is automatically removed by the server.
        wsConnection.on('channelRemoved', function(payload) {
            if (!payload || !payload.channel) return;
            deleteChannelEntry(payload.channel, true);
        });

        // Real-time updates for client presence (joins/leaves) in the active channel.
        wsConnection.on('presenceUpdate', function(payload) {
            if (!payload || !payload.state || !payload.client) {
                console.warn('Received malformed presence update payload:', payload);
                return;
            }
            if (payload.state === 'online') {
                enrollClientDisplay(payload.client, true);
            } else if (payload.state === 'offline') {
                unenrollClientDisplay(payload.client, true);
            }
        });

        // Handle disconnection from the server.
        wsConnection.on('disconnect', function() {
            renderChatMessage(systemIdentifier, 'Disconnected from server. Attempting to reconnect...', true, false, true);
            jq('.chat-shadow').show().find('.content').html('Reconnecting...');
            jq('.chat-shadow').animate({ 'opacity': 1 }, 200);
            // Optionally, implement a reconnect strategy here.
        });
    }

    // Adds a channel entry to the UI list.
    function appendChannelEntry(channelName, announceToChat = false) {
        if (!channelName) return;
        const normalizedChannelName = channelName.replace('/', '').trim(); // Clean up name.

        // Check if the channel is already displayed to prevent duplicates.
        if (jq(`.chat-rooms ul li[data-channel-id="${normalizedChannelName}"]`).length === 0) {
            const channelHtml = uiTemplates.channelEntry(normalizedChannelName);
            jq('.chat-rooms ul').append(channelHtml);

            if (announceToChat) {
                renderChatMessage(systemIdentifier, `New channel \`${normalizedChannelName}\` created.`, true, false, true);
            }
            console.debug(`Channel '${normalizedChannelName}' added to UI.`);
        }
    }

    // Removes a channel entry from the UI list.
    function deleteChannelEntry(channelName, announceToChat = false) {
        if (!channelName) return;
        const normalizedChannelName = channelName.replace('/', '').trim();

        const $channelElement = jq(`.chat-rooms ul li[data-channel-id="${normalizedChannelName}"]`);
        if ($channelElement.length > 0) {
            $channelElement.remove();
            if (announceToChat) {
                renderChatMessage(systemIdentifier, `Channel \`${normalizedChannelName}\` is now empty and removed.`, true, false, true);
            }
            console.debug(`Channel '${normalizedChannelName}' removed from UI.`);
        } else {
            console.warn(`Attempted to remove non-existent channel: ${normalizedChannelName}`);
        }
    }

    // Adds a client entry to the current channel's client list.
    function enrollClientDisplay(clientData, announceToChat = false, isSelf = false) {
        if (!clientData || !clientData.nickname || !clientData.clientId) return;

        // Prevent adding duplicates if the client is already listed.
        if (jq(`.chat-clients ul li[data-client-id="${clientData.clientId}"]`).length > 0) {
            console.debug(`Client ${clientData.nickname} (${clientData.clientId}) already in list, skipping re-enrollment.`);
            return;
        }

        const clientHtml = uiTemplates.clientEntry(clientData, isSelf);
        jq('.chat-clients ul').append(clientHtml);

        if (announceToChat) {
            renderChatMessage(systemIdentifier, `${clientData.nickname} has joined the channel.`, true, false, true);
        }
        console.debug(`Client '${clientData.nickname}' added to UI.`);
    }

    // Removes a client entry from the current channel's client list.
    function unenrollClientDisplay(clientData, announceToChat = false) {
        if (!clientData || !clientData.clientId) return;

        const $clientElement = jq(`.chat-clients ul li[data-client-id="${clientData.clientId}"]`);
        if ($clientElement.length > 0) {
            $clientElement.remove();
            if (announceToChat) {
                renderChatMessage(systemIdentifier, `${clientData.nickname} has left the channel.`, true, false, true);
            }
            console.debug(`Client '${clientData.nickname}' removed from UI.`);
        } else {
            console.warn(`Attempted to remove non-existent client: ${clientData.nickname} (${clientData.clientId})`);
        }
    }

    // Handles the process of creating a new chat channel.
    function initiateChannelCreation() {
        const proposedChannelName = jq('#addroom-popup .input input').val().trim();

        // Validate channel name.
        if (!proposedChannelName) {
            applyUiFeedbackAnimation('#addroom-popup', '#addroom-popup .input input', 'tada', 'yellow');
            console.warn('Channel name cannot be empty.');
            return;
        }
        if (proposedChannelName.length > MAX_CHANNEL_NAME_LENGTH) {
            applyUiFeedbackAnimation('#addroom-popup', '#addroom-popup .input input', 'shakeX', 'red');
            console.warn(`Channel name exceeds maximum length of ${MAX_CHANNEL_NAME_LENGTH}.`);
            return;
        }
        if (proposedChannelName === activeChannel) {
            applyUiFeedbackAnimation('#addroom-popup', '#addroom-popup .input input', 'wobble', 'blue');
            console.info(`Already in channel '${proposedChannelName}'.`);
            Avgrund.hide();
            return;
        }

        // Display a "creating room" message.
        jq('.chat-shadow').show().find('.content').html(`Creating channel: ${proposedChannelName}...`);
        jq('.chat-shadow').animate({ 'opacity': 1 }, 200);

        // First unsubscribe from the current channel.
        if (activeChannel) {
            wsConnection.emit('unsubscribeFromChannel', { channelIdentifier: activeChannel });
        }

        // Then, request to subscribe to the new channel (server handles creation if new).
        wsConnection.emit('subscribeToChannel', { channelIdentifier: proposedChannelName });
        Avgrund.hide();
        jq('#addroom-popup .input input').val(''); // Clear input after submission.
        console.info(`Attempting to create/join channel: '${proposedChannelName}'.`);
    }

    // Updates the UI to reflect the currently active channel.
    function designateActiveChannel(channelIdentifier) {
        if (!channelIdentifier) {
            console.warn('Cannot designate an empty channel as active.');
            return;
        }
        activeChannel = channelIdentifier;
        jq('.chat-rooms ul li.selected').removeClass('selected');
        jq(`.chat-rooms ul li[data-channel-id="${channelIdentifier}"]`).addClass('selected');
        console.log(`Active channel set to: ${channelIdentifier}`);
    }

    // Processes the user's nickname input and initiates connection.
    function finalizeNicknameSelection() {
        const potentialNickname = jq('#nickname-popup .input input').val().trim();

        // Basic validation for the nickname.
        if (!potentialNickname) {
            applyUiFeedbackAnimation('#nickname-popup', '#nickname-popup .input input', 'bounce', 'red');
            console.warn('Nickname cannot be empty.');
            return;
        }
        if (potentialNickname.length > MAX_HANDLE_LENGTH) {
            applyUiFeedbackAnimation('#nickname-popup', '#nickname-popup .input input', 'shakeX', 'yellow');
            console.warn(`Nickname exceeds maximum length of ${MAX_HANDLE_LENGTH}.`);
            return;
        }
        // Simple example of a "profanity" filter or reserved word check.
        const forbiddenHandles = ['admin', 'root', 'system'];
        if (forbiddenHandles.includes(potentialNickname.toLowerCase())) {
            applyUiFeedbackAnimation('#nickname-popup', '#nickname-popup .input input', 'jello', 'red');
            console.warn(`Nickname '${potentialNickname}' is reserved.`);
            return;
        }

        userHandle = potentialNickname;
        Avgrund.hide();
        establishServerConnection(); // Proceed to connect to the server.
        console.info(`Nickname '${userHandle}' selected. Initiating connection.`);
    }

    // Handles the submission of a chat message from the user.
    function processOutgoingMessage() {
        const messageText = jq('.chat-input input').val().trim();

        if (!messageText) {
            applyUiFeedbackAnimation('.chat', '.chat input', 'wobble', 'yellow');
            console.warn('Attempted to send empty message.');
            return;
        }
        if (!activeChannel) {
            renderChatMessage(systemIdentifier, 'Please select or create a channel first.', true, false, true);
            console.warn('Cannot send message: no active channel.');
            return;
        }
        if (!wsConnection || !wsConnection.connected) {
            renderChatMessage(systemIdentifier, 'Not connected to server. Please try again later.', true, false, true);
            console.warn('Cannot send message: not connected to WebSocket server.');
            return;
        }

        // Send the message to the server for broadcast.
        wsConnection.emit('sendMessageToChannel', {
            messageContent: messageText,
            targetChannel: activeChannel
        });

        // Immediately display the message in the local chat window.
        renderChatMessage(userHandle, messageText, true, true);
        jq('.chat-input input').val(''); // Clear the input field.
        console.debug(`Message sent to '${activeChannel}': "${messageText}"`);
    }

    // Appends a new message line to the chat display.
    function renderChatMessage(sender, textContent, displayTimestamp = true, isOriginator = false, isSystemMessage = false) {
        const messageData = {
            sender: sender,
            text: textContent,
            timestamp: displayTimestamp ? formatCurrentTime() : ''
        };
        const $messageElement = jq(uiTemplates.conversationLine(messageData));

        // Apply specific styling based on message properties.
        if (isOriginator) {
            $messageElement.addClass('my-message'); // Style for messages sent by the current user.
        }
        if (isSystemMessage) {
            $messageElement.find('.sender-label').css('color', systemColorCode);
            $messageElement.addClass('system-notification');
        }

        jq('.chat-messages ul').append($messageElement);
        // Scroll to the bottom to show the latest message.
        jq('.chat-messages').animate({ scrollTop: jq('.chat-messages ul').prop('scrollHeight') }, 100);
    }

    // Generates a formatted string for the current time (HH:MM).
    function formatCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // Applies a visual feedback animation (e.g., shake) to UI elements.
    function applyUiFeedbackAnimation(elementSelector, inputSelector, animationClass, highlightClass) {
        if (animationInProgress) {
            console.debug('Animation already in progress, skipping new feedback animation.');
            return;
        }

        animationInProgress = true;
        const $targetElement = jq(elementSelector);
        const $inputElement = jq(inputSelector);

        $targetElement.addClass(animationClass);
        $inputElement.addClass(highlightClass);

        window.setTimeout(function() {
            $targetElement.removeClass(animationClass);
            $inputElement.removeClass(highlightClass);
            $inputElement.trigger('focus'); // Re-focus the input.
            animationInProgress = false;
        }, 1500); // Animation duration.
    }

    // Initiates the WebSocket connection to the server.
    function establishServerConnection() {
        // Display a "connecting" message.
        jq('.chat-shadow .content').html('Connecting to server...');
        jq('.chat-shadow').show().animate({ 'opacity': 1 }, 200);

        // Create the WebSocket connection using socket.io client library.
        wsConnection = io.connect(backendEndpoint);
        console.info(`Attempting WebSocket connection to: ${backendEndpoint}`);

        // Set up all the event handlers for the new connection.
        initializeNetworkHandlers();
    }

    // When the DOM is fully loaded, set up initial event listeners.
    jq(function() {
        setupUserInterfaceListeners();
        console.log('Document ready. UI listeners initialized.');
    });

})(jQuery);
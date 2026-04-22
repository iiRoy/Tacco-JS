const Avgrund = {
    show: function(modalSelector) {
        const modalElement = document.querySelector(modalSelector);
        if (modalElement) {
            modalElement.style.display = 'block';
            modalElement.classList.add('is-active');
            document.body.classList.add('modal-open');
        }
    },
    hide: function() {
        const activeModal = document.querySelector('.is-active');
        if (activeModal) {
            activeModal.style.display = 'none';
            activeModal.classList.remove('is-active');
            document.body.classList.remove('modal-open');
        }
    }
};

// Placeholder for socket.io client library, assuming it's loaded globally
if (typeof io === 'undefined') {
    window.io = {
        connect: function(address) {
            console.warn("Socket.io client library not found. Using a mock 'io.connect'.");
            const mockSocket = {
                _eventListeners: {},
                on: function(eventName, callback) {
                    if (!this._eventListeners[eventName]) {
                        this._eventListeners[eventName] = [];
                    }
                    this._eventListeners[eventName].push(callback);
                },
                emit: function(eventName, data) {
                    console.log(`Mock Socket EMIT: ${eventName}`, data);
                    // Simulate basic server responses for testing
                    if (eventName === 'connect' && data.nickname === 'testuser') {
                        setTimeout(() => this._eventListeners['ready'] && this._eventListeners['ready'].forEach(cb => cb({ clientId: 'mock-client-id-123' })), 50);
                        setTimeout(() => this._eventListeners['roomslist'] && this._eventListeners['roomslist'].forEach(cb => cb({ rooms: ['general', 'test-channel'] })), 150);
                    } else if (eventName === 'subscribe' && data.room === 'general') {
                         setTimeout(() => this._eventListeners['roomclients'] && this._eventListeners['roomclients'].forEach(cb => cb({ room: 'general', clients: [{ nickname: 'otheruser', clientId: 'mock-client-id-456' }] })), 250);
                    } else if (eventName === 'chatmessage') {
                        setTimeout(() => this._eventListeners['chatmessage'] && this._eventListeners['chatmessage'].forEach(cb => cb({ client: { nickname: 'MockUser' }, message: 'Echo: ' + data.message })), 300);
                    }
                }
            };
            return mockSocket;
        }
    };
}


const CommunicationHub = (function() {
    // Application configuration parameters
    const USER_NAME_MAX_CHAR_COUNT = 15;
    const CHANNEL_NAME_MAX_CHAR_COUNT = 10;
    const NETWORK_SERVER_ENDPOINT = 'http://localhost';
    const SYSTEM_MESSENGER_NAME = 'System';
    const SYSTEM_MESSENGER_COLOR = '#1c5380';

    // Core application state
    let appState = {
        animationFeedbackActive: false,
        networkConnector: null, // Renamed from socket
        clientIdentity: null, // Renamed from clientId
        clientUserName: null, // Renamed from nickname
        currentActiveChannel: null // Renamed from currentRoom
    };

    // Cached references to frequently used DOM elements
    const cachedDomElements = {
        messageInputField: null,
        messageSendButton: null,
        userNameInputField: null,
        userNameConfirmButton: null,
        newChannelInputField: null,
        newChannelCreateButton: null,
        initiateChatButton: null,
        addChannelButton: null,
        channelListElement: null,
        conversationDisplayArea: null,
        channelListContainerUl: null,
        participantListContainerUl: null,
        conversationListContainerUl: null,
        connectionOverlay: null,
        connectionOverlayText: null,
        userNameModal: null,
        addChannelModal: null,
        mainChatWindow: null,
    };

    // HTML structure generators
    const htmlGenerators = {
        channelItem: (channelName) => `
            <li data-channel-id="${channelName}">
                <span class="icon"></span> ${channelName}
            </li>
        `,
        participantItem: (participantInfo) => `
            <li data-participant-id="${participantInfo.clientId}" class="cf">
                <div class="fl participantName"><span class="icon"></span> ${participantInfo.nickname}</div>
                <div class="fr composing"></div>
            </li>
        `,
        conversationItem: (entryData) => `
            <li class="cf">
                <div class="fl sender">${entryData.sender}: </div><div class="fl text">${entryData.text}</div><div class="fr time">${entryData.time}</div>
            </li>
        `
    };

    // Helper to retrieve current time in HH:MM format
    function retrieveFormattedCurrentTime() {
        const dateTime = new Date();
        const hour = String(dateTime.getHours()).padStart(2, '0');
        const minute = String(dateTime.getMinutes()).padStart(2, '0');
        return `${hour}:${minute}`;
    }

    // Visual feedback for invalid input
    function applyInputFeedback(containerElementSelector, inputElementSelector, animationClass, highlightClass) {
        if (!appState.animationFeedbackActive) {
            appState.animationFeedbackActive = true;
            const container = document.querySelector(containerElementSelector);
            const input = document.querySelector(inputElementSelector);

            if (container) container.classList.add(animationClass);
            if (input) input.classList.add(highlightClass);

            setTimeout(() => {
                if (container) container.classList.remove(animationClass);
                if (input) {
                    input.classList.remove(highlightClass);
                    input.focus();
                }
                appState.animationFeedbackActive = false;
            }, 1500);
        }
    }

    // Append a message entry to the chat display
    function publishConversationEntry(source, content, includeTime, isSelfEntry, isSystemMessage) {
        const entryDetails = {
            sender: source,
            text: content,
            time: includeTime ? retrieveFormattedCurrentTime() : ''
        };

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = htmlGenerators.conversationItem(entryDetails);
        const newListItem = tempContainer.firstChild;

        if (isSelfEntry) {
            newListItem.classList.add('user-self-indicator');
        }
        if (isSystemMessage) {
            const senderIdentifier = newListItem.querySelector('.sender');
            if (senderIdentifier) {
                senderIdentifier.style.color = SYSTEM_MESSENGER_COLOR;
            }
        }
        cachedDomElements.conversationListContainerUl.appendChild(newListItem);
        cachedDomElements.conversationDisplayArea.scrollTop = cachedDomElements.conversationListContainerUl.scrollHeight;
    }

    // Handle and send user-typed messages
    function dispatchUserMessage() {
        const messagePayload = cachedDomElements.messageInputField.value.trim();
        if (messagePayload) {
            appState.networkConnector.emit('chatmessage', { message: messagePayload, room: appState.currentActiveChannel });
            publishConversationEntry(appState.clientUserName, messagePayload, true, true);
            cachedDomElements.messageInputField.value = '';
        } else {
            applyInputFeedback('.chat', '.chat-input input', 'wobble', 'yellow');
        }
    }

    // Update the UI to reflect the active channel
    function updateActiveChannelDisplay(channelName) {
        appState.currentActiveChannel = channelName;
        const previouslySelected = cachedDomElements.channelListContainerUl.querySelector('.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        const newlySelected = cachedDomElements.channelListContainerUl.querySelector(`[data-channel-id="${channelName}"]`);
        if (newlySelected) {
            newlySelected.classList.add('selected');
        }
    }

    // Add a channel to the UI list
    function addChannelToList(channelId, notifyUsers) {
        const cleanedChannelId = channelId.replace('/', '');
        const existingChannelItem = cachedDomElements.channelListContainerUl.querySelector(`[data-channel-id="${cleanedChannelId}"]`);

        if (!existingChannelItem) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlGenerators.channelItem(cleanedChannelId);
            cachedDomElements.channelListContainerUl.appendChild(tempDiv.firstChild);

            if (notifyUsers) {
                publishConversationEntry(SYSTEM_MESSENGER_NAME, `Channel \`${cleanedChannelId}\` has become available...`, true, false, true);
            }
        }
    }

    // Remove a channel from the UI list
    function removeChannelFromList(channelId, notifyUsers) {
        const channelToRemove = cachedDomElements.channelListContainerUl.querySelector(`[data-channel-id="${channelId}"]`);
        if (channelToRemove) {
            channelToRemove.remove();
            if (notifyUsers) {
                publishConversationEntry(SYSTEM_MESSENGER_NAME, `Channel \`${channelId}\` has been removed...`, true, false, true);
            }
        }
    }

    // Add a participant to the UI list
    function addParticipantToList(participantData, notifyUsers, isSelf) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlGenerators.participantItem({
            nickname: participantData.nickname,
            clientId: participantData.clientId
        });
        const participantListItem = tempDiv.firstChild;

        if (isSelf) {
            participantListItem.classList.add('self-participant');
        }

        if (notifyUsers) {
            publishConversationEntry(SYSTEM_MESSENGER_NAME, `${participantData.nickname} has entered this conversation...`, true, false, true);
        }
        cachedDomElements.participantListContainerUl.appendChild(participantListItem);
    }

    // Remove a participant from the UI list
    function removeParticipantFromList(participantData, notifyUsers) {
        const participantToRemove = cachedDomElements.participantListContainerUl.querySelector(`[data-participant-id="${participantData.clientId}"]`);
        if (participantToRemove) {
            participantToRemove.remove();
            if (notifyUsers) {
                publishConversationEntry(SYSTEM_MESSENGER_NAME, `${participantData.nickname} has exited this conversation...`, true, false, true);
            }
        }
    }

    // Logic for creating a new chat channel
    function executeChannelCreation() {
        const desiredChannelName = cachedDomElements.newChannelInputField.value.trim();
        if (desiredChannelName && desiredChannelName.length <= CHANNEL_NAME_MAX_CHAR_COUNT && desiredChannelName !== appState.currentActiveChannel) {

            cachedDomElements.connectionOverlay.style.display = 'block';
            cachedDomElements.connectionOverlayText.textContent = `Initiating channel: ${desiredChannelName}...`;
            cachedDomElements.connectionOverlay.style.opacity = '1';

            appState.networkConnector.emit('unsubscribe', { room: appState.currentActiveChannel });
            appState.networkConnector.emit('subscribe', { room: desiredChannelName });
            Avgrund.hide();
        } else {
            applyInputFeedback('#addroom-popup', '#addroom-popup .input input', 'tada', 'yellow');
            cachedDomElements.newChannelInputField.value = '';
        }
    }

    // Process the user's chosen username
    function validateAndSetUserName() {
        const enteredUserName = cachedDomElements.userNameInputField.value.trim();
        if (enteredUserName && enteredUserName.length <= USER_NAME_MAX_CHAR_COUNT) {
            appState.clientUserName = enteredUserName;
            Avgrund.hide();
            establishNetworkConnection();
        } else {
            applyInputFeedback('#nickname-popup', '#nickname-popup .input input', 'tada', 'yellow');
            cachedDomElements.userNameInputField.value = '';
        }
    }

    // Configure all Socket.IO event handlers
    function configureNetworkCallbacks() {
        appState.networkConnector.on('connect', () => {
            appState.networkConnector.emit('connect', { nickname: appState.clientUserName });
        });

        appState.networkConnector.on('ready', (data) => {
            cachedDomElements.connectionOverlay.style.opacity = '0';
            setTimeout(() => {
                cachedDomElements.connectionOverlay.style.display = 'none';
                cachedDomElements.messageInputField.focus();
            }, 200);
            appState.clientIdentity = data.clientId;
        });

        appState.networkConnector.on('roomslist', (data) => {
            data.rooms.forEach(channel => {
                if (channel !== '') {
                    addChannelToList(channel, false);
                }
            });
        });

        appState.networkConnector.on('chatmessage', (data) => {
            publishConversationEntry(data.client.nickname, data.message, true, false, false);
        });

        appState.networkConnector.on('roomclients', (data) => {
            addChannelToList(data.room, false);
            updateActiveChannelDisplay(data.room);
            publishConversationEntry(SYSTEM_MESSENGER_NAME, `Welcome to channel: \`${data.room}\`... enjoy!`, true, false, true);
            cachedDomElements.participantListContainerUl.innerHTML = '';
            addParticipantToList({ nickname: appState.clientUserName, clientId: appState.clientIdentity }, false, true);
            data.clients.forEach(participant => {
                if (participant) {
                    addParticipantToList(participant, false);
                }
            });
            cachedDomElements.connectionOverlay.style.opacity = '0';
            setTimeout(() => {
                cachedDomElements.connectionOverlay.style.display = 'none';
                cachedDomElements.messageInputField.focus();
            }, 200);
        });

        appState.networkConnector.on('addroom', (data) => {
            addChannelToList(data.room, true);
        });

        appState.networkConnector.on('removeroom', (data) => {
            removeChannelFromList(data.room, true);
        });

        appState.networkConnector.on('presence', (data) => {
            if (data.state === 'online') {
                addParticipantToList(data.client, true);
            } else if (data.state === 'offline') {
                removeParticipantFromList(data.client, true);
            }
        });
    }

    // Initiate the connection to the server
    function establishNetworkConnection() {
        cachedDomElements.connectionOverlayText.textContent = 'Connecting to server...';
        appState.networkConnector = io.connect(NETWORK_SERVER_ENDPOINT);
        configureNetworkCallbacks();
    }

    // Bind all user interface events
    function bindUserInterfaceEvents() {
        // Cache all relevant DOM elements
        cachedDomElements.messageInputField = document.querySelector('.chat-input input');
        cachedDomElements.messageSendButton = document.querySelector('.chat-submit button');
        cachedDomElements.userNameInputField = document.querySelector('#nickname-popup .input input');
        cachedDomElements.userNameConfirmButton = document.querySelector('#nickname-popup .begin');
        cachedDomElements.newChannelInputField = document.querySelector('#addroom-popup .input input');
        cachedDomElements.newChannelCreateButton = document.querySelector('#addroom-popup .create');
        cachedDomElements.initiateChatButton = document.querySelector('.big-button-green.start');
        cachedDomElements.addChannelButton = document.querySelector('.chat-rooms .title-button');
        cachedDomElements.channelListElement = document.querySelector('.chat-rooms ul');
        cachedDomElements.conversationDisplayArea = document.querySelector('.chat-messages');
        cachedDomElements.channelListContainerUl = document.querySelector('.chat-rooms ul');
        cachedDomElements.participantListContainerUl = document.querySelector('.chat-clients ul');
        cachedDomElements.conversationListContainerUl = document.querySelector('.chat-messages ul');
        cachedDomElements.connectionOverlay = document.querySelector('.chat-shadow');
        cachedDomElements.connectionOverlayText = document.querySelector('.chat-shadow .content');
        cachedDomElements.userNameModal = document.querySelector('#nickname-popup');
        cachedDomElements.addChannelModal = document.querySelector('#addroom-popup');
        cachedDomElements.mainChatWindow = document.querySelector('.chat');


        // Message input and send
        cachedDomElements.messageInputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                dispatchUserMessage();
            }
        });
        cachedDomElements.messageSendButton.addEventListener('click', dispatchUserMessage);

        // Nickname popup actions
        cachedDomElements.userNameInputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                validateAndSetUserName();
            }
        });
        cachedDomElements.userNameConfirmButton.addEventListener('click', validateAndSetUserName);

        // Add room popup actions
        cachedDomElements.newChannelInputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeChannelCreation();
            }
        });
        cachedDomElements.newChannelCreateButton.addEventListener('click', executeChannelCreation);

        // Main interface buttons
        cachedDomElements.initiateChatButton.addEventListener('click', () => {
            cachedDomElements.userNameInputField.value = '';
            Avgrund.show('#nickname-popup');
            setTimeout(() => {
                cachedDomElements.userNameInputField.focus();
            }, 100);
        });

        cachedDomElements.addChannelButton.addEventListener('click', () => {
            cachedDomElements.newChannelInputField.value = '';
            Avgrund.show('#addroom-popup');
            setTimeout(() => {
                cachedDomElements.newChannelInputField.focus();
            }, 100);
        });

        // Channel list scrolling behavior
        cachedDomElements.channelListElement.addEventListener('scroll', function() {
            const selectedChannel = this.querySelector('li.selected');
            if (selectedChannel) {
                selectedChannel.style.top = `${this.scrollTop}px`;
            }
        });

        // Conversation display scrolling (to add/remove 'scroll' class)
        let scrollCheckTimer;
        cachedDomElements.conversationDisplayArea.addEventListener('scroll', function() {
            clearTimeout(scrollCheckTimer);
            const selfRef = this;
            scrollCheckTimer = setTimeout(() => {
                if (selfRef.scrollTop + selfRef.clientHeight < cachedDomElements.conversationListContainerUl.scrollHeight - 5) {
                    selfRef.classList.add('scroll');
                } else {
                    selfRef.classList.remove('scroll');
                }
            }, 50);
        });
        // Initial check
        cachedDomElements.conversationDisplayArea.dispatchEvent(new Event('scroll'));

        // Channel selection via event delegation
        cachedDomElements.channelListContainerUl.addEventListener('click', (e) => {
            const clickedChannelItem = e.target.closest('li[data-channel-id]');
            if (clickedChannelItem) {
                const selectedChannelIdentifier = clickedChannelItem.getAttribute('data-channel-id');
                if (selectedChannelIdentifier !== appState.currentActiveChannel) {
                    appState.networkConnector.emit('unsubscribe', { room: appState.currentActiveChannel });
                    appState.networkConnector.emit('subscribe', { room: selectedChannelIdentifier });
                }
            }
        });
    }

    // Public method to initialize the application
    return {
        startApplication: function() {
            // Inject minimal styles for Avgrund and shake animations if not present
            if (!document.getElementById('injected-chat-styles')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'injected-chat-styles';
                styleElement.textContent = `
                    #nickname-popup, #addroom-popup {
                        display: none;
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: white;
                        border: 1px solid #ccc;
                        padding: 20px;
                        z-index: 1000;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    }
                    #nickname-popup.is-active, #addroom-popup.is-active {
                        display: block;
                    }
                    body.modal-open {
                        overflow: hidden;
                    }
                    .tada { animation: tada 1s; }
                    .wobble { animation: wobble 1s; }
                    .yellow { background-color: #ffc; }
                    @keyframes tada {
                        from { transform: scale3d(1, 1, 1); }
                        10%, 20% { transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg); }
                        30%, 50%, 70%, 90% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg); }
                        40%, 60%, 80% { transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg); }
                        to { transform: scale3d(1, 1, 1); }
                    }
                    @keyframes wobble {
                        from { transform: translate3d(0, 0, 0); }
                        15% { transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg); }
                        30% { transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg); }
                        45% { transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg); }
                        60% { transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg); }
                        75% { transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg); }
                        to { transform: translate3d(0, 0, 0); }
                    }
                `;
                document.head.appendChild(styleElement);
            }
            bindUserInterfaceEvents();
        }
    };
})();

// Execute application initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    CommunicationHub.startApplication();
});
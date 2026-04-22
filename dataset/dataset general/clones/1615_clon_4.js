const applicationSettings = {
    socketEndpoint: "ws://example.com/chat",
    flashWebsocketEnabled: false,
};

function deserializePayload(serializedData) {
    try {
        return JSON.parse(serializedData);
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        return null;
    }
}

function serializePayload(dataObject) {
    try {
        return JSON.stringify(dataObject);
    } catch (error) {
        console.error("Failed to stringify JSON:", error);
        return null;
    }
}

function extractQueryParameters() {
    const parameterMap = {};
    const searchString = window.location.search;
    if (searchString.length > 1) {
        const params = searchString.substring(1).split('&');
        for (const entry of params) {
            const decodedEntry = decodeURIComponent(entry);
            const parts = decodedEntry.split('=');
            if (parts.length === 2) {
                parameterMap[parts[0]] = parts[1];
            }
        }
    }
    return parameterMap;
}

function purifyContent(rawText) {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = rawText;
    return tempDiv.innerHTML;
}

function transformEmoticons(textWithCodes) {
    return textWithCodes.replace(/#(\d*)/g, (match, p1) => `<img src="/static/img/face/${p1}.gif" />`).replace(/&amp;/g, '&');
}

function formatTimeOfDay(timestampSeconds) {
    const dateObject = timestampSeconds ? new Date(timestampSeconds * 1000) : new Date();
    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function insertTextAtCursor(inputElement, textToInsert) {
    inputElement.focus();
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const value = inputElement.value;

    inputElement.value = value.substring(0, start) + textToInsert + value.substring(end);
    inputElement.selectionStart = inputElement.selectionEnd = start + textToInsert.length;
}

class LongPollingClient {
    constructor(endpoint) {
        this.endpoint = endpoint;
        this.onopen = null;
        this.onmessage = null;
        this.onclose = null;
        this.onerror = null;
        this.pollTimer = null;
        this.isConnected = false;

        setTimeout(() => {
            this.isConnected = true;
            if (this.onopen) this.onopen({ type: 'open' });
            this.startPolling();
        }, 100);
    }

    startPolling() {
        this.pollTimer = setInterval(() => {
            // In a real scenario, this would send an XHR request
            // and hold it open until data is received or timeout.
        }, 5000);
    }

    send(data) {
        if (!this.isConnected) {
            console.error("LongPollingClient: Not connected, cannot send data.");
            return;
        }
        console.log("LongPollingClient: Sent data:", data);
        // Self-sent messages are displayed by the app directly,
        // so no need for an echo back simulation here unless specifically desired.
    }

    close() {
        this.isConnected = false;
        clearInterval(this.pollTimer);
        if (this.onclose) this.onclose({ type: 'close' });
    }
}

class ChatOperationManager {
    constructor() {
        this.connectionInstance = null;
        this.userSessionId = 0;
        this.activeParticipants = {};
        this.urlParams = extractQueryParameters();
        this.messageCommandHandlers = this.setupCommandHandlers();
    }

    establishCommunicationChannel() {
        if (window.WebSocket || window.MozWebSocket) {
            return new WebSocket(applicationSettings.socketEndpoint);
        } else if (applicationSettings.flashWebsocketEnabled) {
            console.warn("Flash WebSocket support is not natively implemented in this clone. Falling back to LongPollingClient.");
            return new LongPollingClient(applicationSettings.socketEndpoint);
        } else {
            return new LongPollingClient(applicationSettings.socketEndpoint);
        }
    }

    initiateCommunicationListeners() {
        this.connectionInstance = this.establishCommunicationChannel();

        this.connectionInstance.onopen = (event) => this.handleConnectionOpen(event);
        this.connectionInstance.onmessage = (event) => this.handleIncomingMessage(event);
        this.connectionInstance.onclose = (event) => this.handleConnectionClose(event);
        this.connectionInstance.onerror = (event) => this.handleConnectionError(event);
    }

    handleConnectionOpen(event) {
        const requiredName = this.urlParams['displayName'];
        const requiredAvatar = this.urlParams['profileImage'];

        if (!requiredName || !requiredAvatar) {
            alert('A display name and profile image are required to join the chat.');
            this.connectionInstance.close();
            return;
        }

        console.info("Connected to chat service.");
        const loginPayload = {
            action: 'authenticate',
            displayName: requiredName,
            profileImage: requiredAvatar,
        };
        this.connectionInstance.send(serializePayload(loginPayload));
    }

    handleIncomingMessage(event) {
        const receivedPayload = deserializePayload(event.data);
        if (!receivedPayload) return;

        const commandType = receivedPayload.action;
        const handler = this.messageCommandHandlers[commandType];

        if (handler) {
            handler.call(this, receivedPayload);
        } else {
            console.warn("Unknown command received:", commandType, receivedPayload);
        }
    }

    setupCommandHandlers() {
        return {
            'authenticate': this.handleAuthSuccess,
            'fetchActiveUsers': this.processOnlineParticipants,
            'retrieveChatHistory': this.displayPastMessages,
            'newUser': this.admitNewParticipant,
            'fromChat': this.presentIncomingMessage,
            'participantLeave': this.removeParticipantAndNotify,
        };
    }

    handleAuthSuccess(payloadObject) {
        this.userSessionId = payloadObject.socketDescriptor;
        this.connectionInstance.send(serializePayload({ action: 'fetchActiveUsers' }));
        this.connectionInstance.send(serializePayload({ action: 'retrieveChatHistory' }));
    }

    processOnlineParticipants(payloadObject) {
        this.renderActiveUsers(payloadObject);
    }

    displayPastMessages(payloadObject) {
        this.populateMessageLog(payloadObject);
    }

    admitNewParticipant(payloadObject) {
        this.integrateNewUserDisplay(payloadObject);
    }

    presentIncomingMessage(payloadObject) {
        this.appendChatMessage(payloadObject);
    }

    removeParticipantAndNotify(payloadObject) {
        const leavingId = payloadObject.socketDescriptor;
        this.deprecateUserDisplay(leavingId);
        this.appendChatMessage(payloadObject);
    }

    handleConnectionClose(event) {
        if (confirm("The chat server connection has been terminated.")) {
            window.location.href = 'startpage.html';
        }
    }

    handleConnectionError(event) {
        alert("Communication Error:" + (event.message || "Unknown error"));
        console.error("Communication error occurred.");
    }

    chooseRecipient(participantId) {
        document.getElementById('recipientSelector').value = participantId;
    }

    renderActiveUsers(payloadObject) {
        const userListContainer = document.getElementById('activeUserSidebar');
        const recipientDropdown = document.getElementById('recipientSelector');

        userListContainer.innerHTML = '';
        recipientDropdown.innerHTML = '';

        const everyoneOption = document.createElement('option');
        everyoneOption.value = '0';
        everyoneOption.id = 'participant_all';
        everyoneOption.textContent = 'Everyone';
        recipientDropdown.appendChild(everyoneOption);

        for (const userEntry of payloadObject.userList) {
            const participantId = userEntry.socketDescriptor;
            const participantName = userEntry.displayName;
            const participantAvatar = userEntry.profileImage;

            this.activeParticipants[participantId] = participantName;

            const listItem = document.createElement('li');
            listItem.id = `room_member_${participantId}`;
            const anchor = document.createElement('a');
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.chooseRecipient(participantId);
            });
            const avatarImg = document.createElement('img');
            avatarImg.src = participantAvatar;
            avatarImg.width = 50;
            avatarImg.height = 50;
            anchor.appendChild(avatarImg);
            listItem.appendChild(anchor);
            userListContainer.appendChild(listItem);

            if (participantId !== this.userSessionId) {
                const option = document.createElement('option');
                option.value = participantId;
                option.id = `participant_${participantId}`;
                option.textContent = participantName;
                recipientDropdown.appendChild(option);
            }
        }
    }

    populateMessageLog(payloadObject) {
        for (const historyEntry of payloadObject.pastConversations) {
            let messageInfo = historyEntry.messageData;
            if (!messageInfo) continue;

            messageInfo.timestamp = historyEntry.recordedTime;
            messageInfo.senderInfo = historyEntry.sender;
            if (historyEntry.messageType) {
                messageInfo.messageType = historyEntry.messageType;
            }
            messageInfo.channelOrigin = 3;
            this.appendChatMessage(messageInfo);
        }
    }

    integrateNewUserDisplay(payloadObject) {
        const participantId = payloadObject.socketDescriptor;
        const participantName = payloadObject.displayName;
        const participantAvatar = payloadObject.profileImage;

        if (!this.activeParticipants[participantId]) {
            this.activeParticipants[participantId] = participantName;

            const recipientDropdown = document.getElementById('recipientSelector');
            if (participantId !== this.userSessionId) {
                const option = document.createElement('option');
                option.value = participantId;
                option.id = `participant_${participantId}`;
                option.textContent = participantName;
                recipientDropdown.appendChild(option);
            }

            const userListContainer = document.getElementById('activeUserSidebar');
            const listItem = document.createElement('li');
            listItem.id = `room_member_${participantId}`;
            const anchor = document.createElement('a');
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                this.chooseRecipient(participantId);
            });
            const avatarImg = document.createElement('img');
            avatarImg.src = participantAvatar;
            avatarImg.width = 50;
            avatarImg.height = 50;
            anchor.appendChild(avatarImg);
            listItem.appendChild(anchor);
            userListContainer.appendChild(listItem);
        }
    }

    appendChatMessage(payloadObject) {
        let displayContent;
        if (!payloadObject.messageType || payloadObject.messageType === 'text') {
            displayContent = purifyContent(payloadObject.content);
        } else if (payloadObject.messageType === 'image') {
            const imageInfo = deserializePayload(payloadObject.content);
            displayContent = `<br /><a href="${imageInfo.fullUrl}" target="_blank"><img src="${imageInfo.thumbnailUrl}" /></a>`;
        } else {
            displayContent = `[Unsupported Message Type: ${payloadObject.messageType}]`;
        }

        displayContent = transformEmoticons(displayContent);

        const fromIdentifier = payloadObject.senderId;
        const communicationChannel = payloadObject.channelOrigin;

        let narrationPrefix = '';
        const timestampString = payloadObject.timestamp ? formatTimeOfDay(payloadObject.timestamp) : formatTimeOfDay();

        const messageTemplate = document.getElementById('messageStructureTemplate');
        const clonedMessage = messageTemplate.cloneNode(true);
        clonedMessage.id = '';
        clonedMessage.style.display = 'block';

        const timestampElement = clonedMessage.querySelector('.message-timestamp');
        if (timestampElement) timestampElement.textContent = timestampString;

        const contentArea = clonedMessage.querySelector('.message-body');

        if (fromIdentifier === 0) {
            const userProfilePic = clonedMessage.querySelector('.user-profile-pic');
            if (userProfilePic) userProfilePic.innerHTML = "";
            contentArea.innerHTML = `<span style="color: green">【SYSTEM MESSAGE】</span>${displayContent}`;
        } else {
            const recipientIdentifier = payloadObject.targetId;

            if (communicationChannel === 3) {
                narrationPrefix = 'said to everyone (history):';
                contentArea.innerHTML = `<span style="color: green">【HISTORY】</span><span style="color: orange">${(payloadObject.senderInfo && payloadObject.senderInfo.displayName) || 'Unknown User'} ${narrationPrefix}</span>${displayContent}`;
            } else {
                if (this.userSessionId === fromIdentifier) {
                    if (communicationChannel === 0) {
                        narrationPrefix = 'I said to everyone:';
                    } else if (communicationChannel === 1) {
                        narrationPrefix = `I privately told ${this.activeParticipants[recipientIdentifier] || 'unknown'}:`;
                    }
                    contentArea.innerHTML = `<span style="color: orange">${narrationPrefix}</span> ${displayContent}`;
                } else {
                    if (communicationChannel === 0) {
                        narrationPrefix = 'said to everyone:';
                    } else if (communicationChannel === 1) {
                        narrationPrefix = "privately told me:";
                    }
                    contentArea.innerHTML = `<span style="color: orange"><a href="#" onclick="chatAppManager.chooseRecipient('${fromIdentifier}');event.preventDefault();">${this.activeParticipants[fromIdentifier] || 'unknown'} ${narrationPrefix}</a></span> ${displayContent}`;
                }
            }
        }
        document.getElementById('messageDisplayArea').appendChild(clonedMessage);
        const messageContainer = document.getElementById('messageDisplayArea');
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    deprecateUserDisplay(participantId) {
        const participantOption = document.getElementById(`participant_${participantId}`);
        if (participantOption) participantOption.remove();

        const roomMemberItem = document.getElementById(`room_member_${participantId}`);
        if (roomMemberItem) roomMemberItem.remove();

        delete this.activeParticipants[participantId];
    }

    dispatchUserMessage(messageContent, messageType) {
        if (typeof messageContent === "string") {
            messageContent = messageContent.replace(/ /g, "&nbsp;");
        }

        if (!messageContent) {
            return;
        }

        const outgoingMessage = {};
        const selectedRecipient = document.getElementById('recipientSelector').value;

        outgoingMessage.action = 'sendMessage';
        outgoingMessage.senderId = this.userSessionId;

        if (selectedRecipient === '0') {
            outgoingMessage.channelOrigin = 0;
        } else {
            outgoingMessage.targetId = selectedRecipient;
            outgoingMessage.channelOrigin = 1;
        }

        outgoingMessage.content = messageContent;
        outgoingMessage.messageType = messageType;

        this.connectionInstance.send(serializePayload(outgoingMessage));
        this.appendChatMessage(outgoingMessage);
        document.getElementById('composeInput').value = '';
    }

    insertEmotionIcon(iconId) {
        const composeArea = document.getElementById('composeInput');
        insertTextAtCursor(composeArea, `#${iconId}`);
        this.concealIconPalette();
    }

    revealIconPalette() {
        document.getElementById('iconPaletteContainer').classList.add('chat_face_hover');
        document.getElementById('iconSelectionArea').classList.add('show_face_hovers');
    }

    concealIconPalette() {
        document.getElementById('iconPaletteContainer').classList.remove('chat_face_hover');
        document.getElementById('iconSelectionArea').classList.remove('show_face_hovers');
    }

    toggleIconPalette() {
        document.getElementById('iconPaletteContainer').classList.toggle('chat_face_hover');
        document.getElementById('iconSelectionArea').classList.toggle('show_face_hovers');
    }

    setupGlobalListeners() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const composeInput = document.getElementById('composeInput');
                if (composeInput && composeInput.value.trim() !== '') {
                    this.dispatchUserMessage(composeInput.value, 'text');
                }
            }
        });

        const iconArea = document.getElementById('iconSelectionArea');
        if (iconArea) {
            let iconHtml = '';
            for (let i = 1; i < 20; i++) {
                iconHtml += `<a class="emotion-icon-link" href="#" onclick="(function(id){ chatAppManager.insertEmotionIcon(id); return false; })(${i});"><img src="/static/img/face/${i}.gif" /></a>`;
            }
            iconArea.innerHTML = iconHtml;
        }

        const sendButton = document.getElementById('sendMessageButton');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                const composeInput = document.getElementById('composeInput');
                if (composeInput && composeInput.value.trim() !== '') {
                    this.dispatchUserMessage(composeInput.value, 'text');
                }
            });
        }
    }
}

let chatAppManager;

document.addEventListener('DOMContentLoaded', function() {
    chatAppManager = new ChatOperationManager();
    chatAppManager.initiateCommunicationListeners();
    chatAppManager.setupGlobalListeners();
});
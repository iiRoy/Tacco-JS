const obtainConfiguration = (cliArguments, environmentVariables) => {
    const argumentMap = new Map();
    for (let i = 2; i < cliArguments.length; i++) {
        const currentArgument = cliArguments[i];
        if (currentArgument.startsWith('--')) {
            const parts = currentArgument.substring(2).split('=');
            argumentMap.set(parts[0], parts.length > 1 ? parts[1] : true);
        }
    }

    const retrieveSetting = (cliKey, envKey, defaultValue) => {
        if (argumentMap.has(cliKey)) return argumentMap.get(cliKey);
        if (environmentVariables[envKey]) return environmentVariables[envKey];
        return defaultValue;
    };

    return {
        serverPort: retrieveSetting('server-port', 'OPENSHIFT_INTERNAL_PORT', 8080),
        serverAddress: retrieveSetting('server-address', 'OPENSHIFT_INTERNAL_IP', '127.0.0.1'),
        websocketConnectionPort: retrieveSetting('ws-port', 'WS_EXTERNAL_PORT', null),
        activityLoggingLevel: retrieveSetting('log-level', 'SERVER_LOG_LEVEL', 3)
    };
};

const systemSettings = obtainConfiguration(process.argv, process.env);

const webAppFramework = require('express');
const networkServer = require('http');
const liveComms = require('socket.io');
const pathModule = require('path');

const appCore = webAppFramework();
let httpHandler;
let commsHub;

const createTextFormatter = (templateString) => {
    return (contextObject = {}) => {
        if (typeof templateString !== 'string') return '';
        return templateString.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return contextObject[key] !== undefined ? String(contextObject[key]) : match;
        });
    };
};

const makeConvoItem = (contentString, senderEntity = { ident: 'system' }, messageCategory = 'dialog') => ({
    messageContent: contentString,
    authorInfo: senderEntity,
    messageType: messageCategory,
    creationTimestamp: Date.now()
});

const createParticipant = (initialIdentifier = null) => {
    let currentIdentifier = initialIdentifier;
    const identifierValidationRegex = /^[a-zA-Z0-9_]+$/;

    return {
        assignIdentifier: (newIdentifier) => { currentIdentifier = newIdentifier; },
        getIdentifier: () => currentIdentifier,
        isIdentifierValid: () => currentIdentifier && identifierValidationRegex.test(currentIdentifier),
        toSerializableObject: () => ({ alias: currentIdentifier }) // Use 'alias' instead of 'name'
    };
};

appCore.use((requestObject, responseObject, proceedToNext) => {
    let sourceOrigin = '*';
    try {
        const refererValue = requestObject.headers.referer;
        if (refererValue) {
            const urlParser = new URL(refererValue);
            sourceOrigin = urlParser.origin;
        }
    } catch (parseError) {
        // Referer might be malformed or absent
    }

    responseObject.setHeader('Access-Control-Allow-Origin', sourceOrigin);
    responseObject.setHeader('Access-Control-Allow-Credentials', 'true');
    proceedToNext();
});

appCore.use('/acquireWsConfig.js', (requestObject, responseObject) => {
    const wsPort = systemSettings.websocketConnectionPort;
    const uriSuffix = wsPort ? `:${wsPort}/` : '/';
    responseObject.setHeader('Content-Type', 'text/javascript');
    responseObject.send(`const wsConnectionAddress = window.location.hostname + "${uriSuffix}";`);
});

appCore.use('/client-assets', webAppFramework.static(pathModule.join(__dirname, 'client')));
appCore.use('/shared-assets', webAppFramework.static(pathModule.join(__dirname, 'common')));
appCore.get('/', (requestObject, responseObject) => {
    responseObject.sendFile(pathModule.join(__dirname, 'client', 'index.html'));
});

httpHandler = networkServer.createServer(appCore);
httpHandler.listen(systemSettings.serverPort, systemSettings.serverAddress, () => {
    console.log(`Communication backend active at ${systemSettings.serverAddress}:${systemSettings.serverPort}`);
});

const activeChatParticipants = new Map(); // Maps socket.id to participant object

const broadcastParticipantRoster = () => {
    const currentAliases = Array.from(activeChatParticipants.values()).map(p => p.toSerializableObject());
    if (commsHub) {
        commsHub.sockets.emit('participant-list-update', {
            roster: currentAliases
        });
    }
};

const enrollParticipant = (socketIdentifier, participantInstance) => {
    activeChatParticipants.set(socketIdentifier, participantInstance);
    broadcastParticipantRoster();
};

const unenrollParticipant = (socketIdentifier) => {
    const wasRemoved = activeChatParticipants.delete(socketIdentifier);
    if (wasRemoved) {
        broadcastParticipantRoster();
    }
    return wasRemoved;
};

const conversationPhrases = new Map();
conversationPhrases.set("greetingMessage", createTextFormatter('Welcome to our communication channel. Before proceeding, please provide a unique alias for yourself and submit it. Only alphanumeric characters and underscores are permitted.'));
conversationPhrases.set("aliasRequired", createTextFormatter('Error: An alias must be established before sending messages.'));
conversationPhrases.set("aliasChangedMidSession", createTextFormatter('Warning: Alias modification during an active session is disallowed.'));
conversationPhrases.set("participantDeparted", createTextFormatter("{{alias}} has exited the conversation."));
conversationPhrases.set("sessionEnjoyment", createTextFormatter('Enjoy your session, {{alias}}.'));
conversationPhrases.set("participantEntered", createTextFormatter('{{alias}} has joined the conversation.'));
conversationPhrases.set("invalidAliasFormat", createTextFormatter('Error: "{{alias}}" is an invalid alias. Please use only letters, numbers, and underscores. Connection terminated.'));

commsHub = liveComms(httpHandler);
commsHub.configure(() => {
    commsHub.set("log level", systemSettings.activityLoggingLevel);
});

commsHub.on('connection', (clientChannel) => {
    const currentParticipant = createParticipant();
    let participantHasValidAlias = false;

    const executeDisconnectionProcedure = () => {
        const participantAlias = currentParticipant.getIdentifier();
        const wasSuccessfullyRemoved = unenrollParticipant(clientChannel.id);
        if (participantAlias && participantHasValidAlias && wasSuccessfullyRemoved) {
            commsHub.sockets.emit('conversation-stream', makeConvoItem(conversationPhrases.get("participantDeparted")({ alias: participantAlias })));
        }
        clientChannel.disconnect(true);
    };

    clientChannel.emit('conversation-stream', makeConvoItem(conversationPhrases.get("greetingMessage")()));

    clientChannel.once('disconnect', () => {
        executeDisconnectionProcedure();
    });

    clientChannel.on('set-client-alias', (dataPayload) => {
        const proposedAlias = dataPayload.chosenAlias;
        currentParticipant.assignIdentifier(proposedAlias);

        if (currentParticipant.isIdentifierValid()) {
            participantHasValidAlias = true;
            enrollParticipant(clientChannel.id, currentParticipant);
            clientChannel.emit('conversation-stream', makeConvoItem(conversationPhrases.get("sessionEnjoyment")({ alias: currentParticipant.getIdentifier() })));
            commsHub.sockets.emit('conversation-stream', makeConvoItem(conversationPhrases.get("participantEntered")({ alias: currentParticipant.getIdentifier() })));
        } else {
            clientChannel.emit('conversation-stream', makeConvoItem(conversationPhrases.get("invalidAliasFormat")({ alias: proposedAlias }), createParticipant('system'), 'alert'));
            executeDisconnectionProcedure();
        }
    });

    clientChannel.on('post-message', (dataPayload) => {
        if (!participantHasValidAlias || !currentParticipant.getIdentifier()) {
            clientChannel.emit('conversation-stream', makeConvoItem(conversationPhrases.get("aliasRequired")(), createParticipant('system'), 'alert'));
            executeDisconnectionProcedure();
            return;
        }

        if (dataPayload.senderInfo && dataPayload.senderInfo.alias === currentParticipant.getIdentifier()) {
            commsHub.sockets.emit('conversation-stream', makeConvoItem(dataPayload.messageText, currentParticipant.toSerializableObject(), "public-chat"));
        } else {
            clientChannel.emit('conversation-stream', makeConvoItem(conversationPhrases.get("aliasChangedMidSession")(), createParticipant('system'), 'alert'));
            executeDisconnectionProcedure();
        }
    });
});
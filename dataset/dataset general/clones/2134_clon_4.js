const acquireEngine = (path) => require(path);
const primaryEngine = acquireEngine('./lib/simple-xmpp');

const processInputArguments = (argsArray) => {
    return {
        identityCode: argsArray[2],
        authSecret: argsArray[3],
        serverLocation: argsArray[4]
    };
};
const inputData = processInputArguments(process.argv);

const deriveParticipantIdentifier = (fullId) => {
    let boundary = 0;
    while(boundary < fullId.length && fullId.charAt(boundary) !== '@') {
        boundary++;
    }
    return fullId.substring(0, boundary);
};

const operationalParameters = {
    connectionID: inputData.identityCode,
    passphrase: inputData.authSecret,
    hostAddress: inputData.serverLocation,
    participantAlias: deriveParticipantIdentifier(inputData.identityCode),
};

const outputFacility = {
    displayEvent: (message) => console.log(message),
    reportIssue: (issue) => console.error(issue),
};

const createMessagingAgent = (baseModule) => {
    return {
        registerNotification: (signalName, callbackFunction) => {
            baseModule.on(signalName, callbackFunction);
        },
        initiateSession: (configDetails) => {
            baseModule.connect(configDetails);
        },
        enterConference: (roomIdentifier) => {
            baseModule.join(roomIdentifier);
        },
        transmitPayload: (destination, contentString, isGroupMessage) => {
            baseModule.send(destination, contentString, isGroupMessage);
        },
    };
};
const commsAgent = createMessagingAgent(primaryEngine);

const handleConnectionSuccess = () => {
    outputFacility.displayEvent('System is online!');
    const conferenceTarget = `test@conference.${operationalParameters.hostAddress}/${operationalParameters.participantAlias}`;
    commsAgent.enterConference(conferenceTarget);
};

const handleGroupConversation = (channel, senderId, contentData, timestamp) => {
    outputFacility.displayEvent(`${senderId} communicated ${contentData} in ${channel}`);
    if (senderId !== operationalParameters.participantAlias) {
        commsAgent.transmitPayload(channel, `${senderId}: replica: ${contentData}`, true);
    }
};

const handleSystemFailure = (errorObject) => {
    outputFacility.reportIssue(errorObject);
};

commsAgent.registerNotification('online', handleConnectionSuccess);
commsAgent.registerNotification('groupchat', handleGroupConversation);
commsAgent.registerNotification('error', handleSystemFailure);

commsAgent.initiateSession({
    jid: operationalParameters.connectionID,
    password: operationalParameters.passphrase,
    host: operationalParameters.hostAddress,
    port: 5222,
});
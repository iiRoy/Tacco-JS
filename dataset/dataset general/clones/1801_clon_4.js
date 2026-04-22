const externalGateway = require('./media_exchange');

const processOperation = (operationPromise, optionalCallback) => {
    if (optionalCallback) {
        operationPromise.then(
            (resultValue) => optionalCallback(null, resultValue),
            (failureReason) => optionalCallback(failureReason)
        );
    }
    return operationPromise;
};

const createInteractionEngine = () => {
    let sessionState = {
        userIdentifier: undefined,
        authenticationCredential: undefined,
        mostRecentSynchronization: undefined
    };

    const retrieveSessionIdentifier = () => sessionState.userIdentifier;
    const retrieveAuthenticationToken = () => sessionState.authenticationCredential;

    const sessionMethods = {
        async establishSession(userIdentifier, secretKey, optionalCallback) {
            const operation = externalGateway.userLogin(userIdentifier, secretKey)
                .then(payloadInformation => {
                    sessionState.userIdentifier = payloadInformation.userIdentifier;
                    sessionState.authenticationCredential = payloadInformation.authenticationCredential;
                    sessionState.mostRecentSynchronization = {
                        moment: Date.now(),
                        details: payloadInformation
                    };
                    return payloadInformation;
                });
            return processOperation(operation, optionalCallback);
        },

        async createAccount(contactAddress, secretKey, userIdentifier, optionalCallback) {
            const operation = externalGateway.userRegistration(contactAddress, secretKey, userIdentifier)
                .then(synchronizationDetails => {
                    console.log(typeof synchronizationDetails);
                    sessionState.userIdentifier = userIdentifier;
                    sessionState.authenticationCredential = synchronizationDetails.authenticationCredential;
                    return synchronizationDetails;
                });
            return processOperation(operation, optionalCallback);
        },

        async terminateSession(optionalCallback) {
            delete sessionState.authenticationCredential;
            return processOperation(Promise.resolve(true), optionalCallback);
        },

        async synchronizeData(inputPayloadOrCallback, optionalCallback) {
            let actualPayload = {};
            let currentCallback = optionalCallback;

            if (typeof inputPayloadOrCallback === 'object' && inputPayloadOrCallback !== null) {
                actualPayload = inputPayloadOrCallback;
            } else if (typeof inputPayloadOrCallback === 'function') {
                currentCallback = inputPayloadOrCallback;
            }

            const operation = externalGateway.fetchSynchronization(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                actualPayload
            ).then(payloadInformation => {
                sessionState.authenticationCredential = payloadInformation.authenticationCredential;
                sessionState.mostRecentSynchronization = {
                    moment: Date.now(),
                    details: payloadInformation
                };
                return payloadInformation;
            });
            return processOperation(operation, currentCallback);
        },

        async retrieveMediaObject(uniqueIdentifier, optionalCallback) {
            if (typeof retrieveAuthenticationToken() === "undefined") {
                return processOperation(Promise.reject("Not signed in"), optionalCallback);
            }
            const operation = externalGateway.getMediaAsset(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                uniqueIdentifier
            );
            return processOperation(operation, optionalCallback);
        },

        async transmitMedia(dataFlow, isVisualContent, optionalCallback) {
            const operation = externalGateway.sendMediaAsset(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                dataFlow,
                isVisualContent
            );
            return processOperation(operation, optionalCallback);
        },

        async dispatchContent(contentIdentifier, recipientList, durationOrCallback, optionalCallback) {
            let actualDuration;
            let currentCallback = optionalCallback;

            if (typeof durationOrCallback === 'function') {
                currentCallback = durationOrCallback;
            } else {
                actualDuration = durationOrCallback;
            }

            const operation = externalGateway.postContent(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                contentIdentifier,
                recipientList,
                actualDuration
            );
            return processOperation(operation, currentCallback);
        },

        async connectWithPeer(peerIdentifier, optionalCallback) {
            if (typeof retrieveAuthenticationToken() === "undefined") {
                return;
            }
            const operation = externalGateway.establishPeerConnection(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                peerIdentifier
            );
            return processOperation(operation, optionalCallback);
        },

        async updatePeerAlias(peerIdentifier, newAlias, optionalCallback) {
            if (typeof retrieveAuthenticationToken() === "undefined") {
                return;
            }
            const operation = externalGateway.setPeerDisplayName(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                peerIdentifier,
                newAlias
            );
            return processOperation(operation, optionalCallback);
        },

        async disconnectFromPeer(peerIdentifier, optionalCallback) {
            if (typeof retrieveAuthenticationToken() === "undefined") {
                return;
            }
            const operation = externalGateway.removePeerConnection(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                peerIdentifier
            );
            return processOperation(operation, optionalCallback);
        },

        async purgeFeed(optionalCallback) {
            const operation = externalGateway.clearActivityFeed(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken()
            );
            return processOperation(operation, optionalCallback);
        },

        async configurePrivacySettings(restrictToConnectedPeers, optionalCallback) {
            const operation = externalGateway.adjustPrivacyOptions(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                restrictToConnectedPeers
            );
            return processOperation(operation, optionalCallback);
        },

        async modifyContactEmail(contactAddress, optionalCallback) {
            const operation = externalGateway.changeAccountEmail(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken(),
                contactAddress
            );
            return processOperation(operation, optionalCallback);
        },

        async fetchConnectedPeers(optionalCallback) {
            const operation = externalGateway.retrieveUpdates(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken()
            ).then(JSON.parse)
             .then(payloadInformation => payloadInformation.updates_response.friends);
            return processOperation(operation, optionalCallback);
        },

        async fetchPeerConnectionRequests(optionalCallback) {
            const operation = externalGateway.retrieveUpdates(
                retrieveSessionIdentifier(),
                retrieveAuthenticationToken()
            ).then(JSON.parse)
             .then(payloadInformation => payloadInformation.updates_response.added_friends);
            return processOperation(operation, optionalCallback);
        }
    };

    return sessionMethods;
};

module.exports = createInteractionEngine;
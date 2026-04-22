(function () {
    class MediaHandle {
        constructor(streamSource) {
        }

        mediaKind() {
        }

        continueTransmission() {
        }

        haltTransmission() {
        }

        sourcePayload() {
        }
    }

    class ConnectionHub {
        constructor() {
        }

        establishLink() {
        }

        initiateDialogue(recipients, contentTypes) {
            return new Conversation();
        }

        terminateLink() {
        }

        retrieveState() {
        }

        attachListener(actionType, callback) {
            return this;
        }

        attachSingleListener(actionType, callback) {
            return this;
        }

        detachListener(actionType, callback) {
            return this;
        }
    }

    class Conversation {
        constructor() {
        }

        uniqueId() {
        }

        peerEntities() {
            return [];
        }

        insertPayload(payloadItem) {
        }

        extractPayload(payloadItem) {
            return false;
        }

        beginNegotiation() {
        }

        endNegotiation() {
        }

        declineOffer() {
        }

        includeParticipant(newMember) {
            return false;
        }

        excludeParticipant(formerMember) {
            return false;
        }

        silenceMembers(mediaFormats, memberList) {
            return false;
        }

        unsilenceMembers(mediaFormats, memberList) {
            return false;
        }

        reassignInteraction(destination, attendedMode, privacyFlag) {
            return false;
        }

        transmitTones(toneSequence) {
            return false;
        }

        pauseInteraction(sendOnlyMode) {
            return false;
        }

        resumeInteraction() {
            return false;
        }

        fetchPayloads(filterCriteria) {
            return [];
        }

        queryStatus() {
        }

        registerEvent(eventType, actionCallback) {
            return this;
        }

        registerOnceEvent(eventType, actionCallback) {
            return this;
        }

        unregisterEvent(eventType, actionCallback) {
            return this;
        }
    }

    const InteractionFaults = {
        CONNECTION_FAILURE: 'CONNECTION_FAILURE'
    };

    const ServiceFailures = {
        CREDENTIAL_INVALID: 'CREDENTIAL_INVALID',
        COMMUNICATION_BREAK: 'COMMUNICATION_BREAK'
    };

    if (typeof window !== 'undefined') {
        window.communicationCore = {
            MediaHandle: MediaHandle,
            ConnectionHub: ConnectionHub,
            Conversation: Conversation,
            InteractionFaults: InteractionFaults,
            ServiceFailures: ServiceFailures
        };
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            MediaHandle: MediaHandle,
            ConnectionHub: ConnectionHub,
            Conversation: Conversation,
            InteractionFaults: InteractionFaults,
            ServiceFailures: ServiceFailures
        };
    }
})();
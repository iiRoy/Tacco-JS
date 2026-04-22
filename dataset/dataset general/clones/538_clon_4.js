const verifier = {
    ensureTrue: function(condition, message) {
        if (!condition) {
            throw new Error(`Verification Failed: ${message}`);
        }
    },
    confirmEquality: function(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`Verification Failed: ${message}. Expected '${expected}', Received '${actual}'`);
        }
    }
};

const systemUtils = {};

const eventRecorder = {
    fatalLevel: 0,
    level: 0
};

const SimulatedConnector = function() {
    this.configureEncoding = function() {};
    this.disableDelay = function() {};
    this.setOperationTimeout = function() {};
    this.attachEventHandler = function() {};
};

const communicationHub = {};

communicationHub.CentralFacility = function() {
};

communicationHub.ClientLink = function(facilityInstance, connectorInstance) {
    this.personalTag = null;

    this.handlers = {
        setAlias: (aliasValue) => {
            this.personalTag = aliasValue;
        }
    };

    this.processInputPayload = (serializedData) => {
        try {
            const commandTuple = JSON.parse(serializedData);
            if (Array.isArray(commandTuple) && commandTuple[0] === "assignNick" && commandTuple.length === 2) {
                this.handlers.setAlias(commandTuple[1]);
            }
        } catch (e) {
            // The original test does not cover error handling for JSON parsing,
            // so this mock focuses on the successful path.
        }
    };
};

const runAllVerificationRoutines = function() {
    const mainFacilityA = new communicationHub.CentralFacility();
    const clientLinkA = new communicationHub.ClientLink(mainFacilityA, new SimulatedConnector());
    verifier.ensureTrue(
        typeof(clientLinkA.handlers.setAlias) === 'function',
        'setAlias should be an available handler'
    );

    const mainFacilityB = new communicationHub.CentralFacility();
    const clientLinkB = new communicationHub.ClientLink(mainFacilityB, new SimulatedConnector());

    clientLinkB.processInputPayload(JSON.stringify([ "assignNick", "bdot" ]));
    verifier.confirmEquality(
        clientLinkB.personalTag,
        'bdot',
        'It should assign the personal tag to the client link'
    );
};

runAllVerificationRoutines();
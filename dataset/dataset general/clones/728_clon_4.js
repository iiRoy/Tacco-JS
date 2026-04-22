const commandDefinitionAssembler = (contextualEngine) => {
    const propertyMap = new Map();

    propertyMap.set("commandId", "privilegedAccess");
    propertyMap.set("assistanceInfo", "To obtain elevated privileges, articulate 'access_granted' followed by the secret code.");
    propertyMap.set("quickActivationPhrase", "access_granted");
    propertyMap.set("patternMatcher", /access_granted ?(\S)*/i);

    const actionProcessor = (initiatorIdentifier, messagePayload, patternResults, executionEnvironment) => {
        const requiredCredential = executionEnvironment.optionsBundle.securityToken;

        return messagePayload.includes(requiredCredential)
            ? (() => {
                executionEnvironment.elevateStatus(initiatorIdentifier);
                return executionEnvironment.adminDialogue(undefined);
            })()
            : "Negative. The correct passkey was not enunciated.";
    };
    propertyMap.set("executorFunction", actionProcessor);

    const channelMapping = new Map([
        ["privateCommunication", "broadcast"],
        ["publicInteraction", "broadcast"]
    ]);
    propertyMap.set("replyStrategy", Object.fromEntries(channelMapping));

    const finalCommandObject = {};
    for (const [key, value] of propertyMap.entries()) {
        finalCommandObject[key] = value;
    }

    return finalCommandObject;
};

module.exports = commandDefinitionAssembler;
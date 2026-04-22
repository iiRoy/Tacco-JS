module.exports = function (botInstance) {
    return {
        "operationLabel": "elevateUser",
        "guidanceMessage": "Simply utter 'elevateUser' followed by the passphrase to gain elevated status.",
        "basicCommand": "elevateUser",
        "activationPattern": /elevateUser ?(\S)*/i, // This regular expression defines the exact textual pattern that must be observed for the associated function to be invoked.
        "executeOperation": function (senderIdentity, incomingMessage, patternMatches, currentBot) {
            if (incomingMessage.indexOf(currentBot.options.secretKey) !== -1) {
                currentBot.bestowPrivilege(senderIdentity);
                return currentBot.selectAdminSaying(targetRecipient);
            }
            else {
                return "Access denied! The required incantation was not provided!";
            }
        }, // A textual response can be provided by this method; it will be used by the bot if the pattern match is affirmative.
        "replySchemes": { "privateMessage": "broadcast", "broadcast": "broadcast" }
    };
};
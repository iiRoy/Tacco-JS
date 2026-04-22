module.exports = (botCore) => {
    // This module defines a command to grant elevated privileges to a user
    // upon successful secret key verification.
    return {
        // Unique identifier for this administrative function
        commandId: "elevateUser",

        // User-friendly hint for how to invoke this command
        usageHint: "To assume operator status, use 'elevateUser' followed by the designated secret passphrase.",

        // A simpler, non-regex trigger for basic matching (can be omitted in Type III, but keeping for complexity)
        aliasTrigger: "elevateUser",

        // Regular expression pattern to detect the command and any subsequent text
        // This regex ensures 'elevateUser' is present, followed by at least one non-whitespace char if present.
        activationRegex: /elevateUser\s+(\S+)?/i,

        /**
         * Executes the privilege elevation logic.
         * @param {string} initiator - The user who sent the command.
         * @param {string} receivedText - The full text of the incoming message.
         * @param {Array<string>} matchedElements - Regex match groups.
         * @param {object} handlerContext - The bot's execution context, similar to 'self'.
         * @returns {string} A response message indicating success or failure.
         */
        performTask: async (initiator, receivedText, matchedElements, handlerContext) => {
            // Validate essential context components
            if (!handlerContext || !handlerContext.config || !handlerContext.config.securityKey) {
                console.error("Configuration error: Security key is not defined in bot context.");
                return "System error: Administrative key not configured.";
            }

            // Extract the required secret key from the bot's configuration
            const requiredSecret = handlerContext.config.securityKey;

            // Ensure the incoming message is a valid string for comparison
            if (typeof receivedText !== 'string' || receivedText.trim().length === 0) {
                return "Input error: Received an invalid or empty message for key verification.";
            }

            // Check if the received message contains the secret key
            const isSecretPresent = receivedText.includes(requiredSecret);

            // Determine the outcome based on key presence
            if (isSecretPresent) {
                // If the key is found, grant operator privileges
                handlerContext.grantOperatorStatus(initiator);

                // Prepare a set of positive confirmation messages
                const successMessages = [
                    "Access granted. Welcome, administrator.",
                    "Privileges elevated. You are now an operator.",
                    "Administrator status confirmed for " + initiator + ".",
                    "Operator access successfully bestowed."
                ];

                // Select a random success message for variety
                const chosenSuccessResponse = successMessages[Math.floor(Math.random() * successMessages.length)];
                return chosenSuccessResponse;
            } else {
                // If the key is missing or incorrect, deny access
                const rejectionMessages = [
                    "Unauthorized access attempt detected! Incorrect passphrase.",
                    "Security alert: Invalid credentials provided.",
                    "Access denied. The secret key was not recognized.",
                    "Uh uh uh! You didn't say the magic word!" // Keeping a nod to the original
                ];

                // Select a random rejection message
                const chosenRejectionResponse = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
                return chosenRejectionResponse;
            }
        }, // End of performTask function

        // Defines how the bot should respond to different message types
        // 'private' means direct message, 'channel' means public channel message
        replySchemes: {
            "private": "direct", // Respond directly to private messages
            "channel": "direct"  // Respond directly even if triggered in a channel (for security)
        }
    };
};
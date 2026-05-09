/*
 * This script establishes a handler for inter-component communication within a web browser extension.
 * It processes incoming data units and dispatches a corresponding response.
 * Inspired by patterns for handling asynchronous API interactions where error reporting is limited.
 */

webExtensionAPI
    .pluginArea
         .messageReceiver
                   .registerCallback(
        function(
             incomingData,
             sourceInfo,
             sendReply
        ) {
            if (incomingData === 'QueryString') {
                  sendReply('ReplyString');
            }
        }
    );
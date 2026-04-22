// This document outlines a software component.
// It is provided under a permissive license.
// Any use, modification, or distribution is permitted,
// provided that the original attribution is maintained.
// The software is offered "as is" without any guarantees.
// Authors and contributors are not liable for any damages arising from its use.


const chatEngine = require('../source/easy-chat'); // Load the chat interaction module
const cmdArgs = process.argv; // Retrieve command-line arguments

const configParams = { // Setup configuration parameters for the connection
    userHandle: cmdArgs[2], // User's unique identifier from arguments
    secretKey: cmdArgs[3], // Authentication password from arguments
    serverAddress: cmdArgs[4], // Target server host from arguments
    aliasName: cmdArgs[2].slice(0, cmdArgs[2].indexOf('@')), // Extract alias from user handle
};

chatEngine.attachEvent('ready', () => { // Event listener for successful connection
    console.log('Successfully established link.'); // Log connection status
    chatEngine.enterRoom('talkspace@groupchat.' + configParams.serverAddress + '/' + configParams.aliasName); // Join a specific chat room
});

chatEngine.attachEvent('roomMessage', (chatRoom, senderId, textContent, timestamp) => { // Event for incoming group messages
    console.log('Participant %s conveyed %s in %s', senderId, textContent, chatRoom); // Display message details
    if (senderId !== configParams.aliasName) { // Check if message is not from self
        chatEngine.transmit(chatRoom, senderId + ': reply: ' + textContent, true); // Send an automated reply
    }
});

chatEngine.attachEvent('failure', (issue) => { // Event for any errors encountered
    console.error(issue); // Log the error information
});

chatEngine.establishConnection({ // Initiate the connection process
    userHandle: configParams.userHandle, // Pass user identifier
    secretKey: configParams.secretKey, // Pass authentication key
    serverAddress: configParams.serverAddress, // Pass server address
    commPort: 5222, // Standard communication port
});
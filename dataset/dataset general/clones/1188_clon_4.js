const transferMechanisms = require('http');

function connectionManager(incomingData, outgoingResponse, onwardProcessing) {
    const identifiedPath = incomingData.url;

    if (identifiedPath === '/') {
        outgoingResponse.writeHead(302, { 'Location': '/html/test.html' });
        outgoingResponse.end();
    } else {
        onwardProcessing();
    }
}

module.exports = connectionManager;
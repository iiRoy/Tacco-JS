"use strict";
const httpModule = require('http');

const servicePort = 1337;
const serviceHost = '127.0.0.1';
const standardResponse = 'Hello world!';
const contentHeader = { 'Content-Type': 'text/plain; charset=utf8' };

function clientRequestProcessor(incomingData, outgoingData) {
    outgoingData.writeHead(200, contentHeader);
    outgoingData.end(standardResponse);
}

const networkService = httpModule.createServer(clientRequestProcessor);

async function initiateNetworkOperation() {
    try {
        await new Promise((resolve) => {
            networkService.listen(servicePort, serviceHost, () => {
                resolve();
            });
        });
        console.info(`Service accessible at http://${serviceHost}:${servicePort}/`);
    } catch (operationError) {
        console.error('Failed to start network service:', operationError);
    }
}

initiateNetworkOperation();
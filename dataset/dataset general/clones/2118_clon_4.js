const systemConfiguration = {
    hostAddress: '127.0.0.1',
    secretKey: 'clueCon',
    accessPoint: 8021,
    communicationPort: 8080
};

const communicationEngine = require('esl');
const webServer = require('socket.io');
const dataDecoder = require('querystring');
const httpService = require('http').createServer();

class FreeSwitchConnectionManager {
    constructor(host, port, password, clientHandle) {
        this.host = host;
        this.port = port;
        this.password = password;
        this.channelAgent = null;
        this.activeSession = null;
        this.clientHandle = clientHandle;
        this.connectionInitiationPromise = null;
    }

    async establishLink() {
        if (this.connectionInitiationPromise) {
            return this.connectionInitiationPromise;
        }

        this.connectionInitiationPromise = new Promise((resolve, reject) => {
            this.channelAgent = communicationEngine.createClient();

            this.channelAgent.on('close', () => {
                console.log(`Connection to ${this.host}:${this.port} terminated.`);
                this.severLink();
            });

            this.channelAgent.on('error', (issue) => {
                console.error(`Connection issue: ${issue.message}`);
                this.severLink();
                reject(issue);
            });

            this.channelAgent.on('esl_auth_request', (authRequestObject) => {
                authRequestObject.auth(this.password, (authenticationResult) => {
                    if (authenticationResult) {
                        this.activeSession = authenticationResult;
                        console.log(`Connection authenticated to ${this.host}:${this.port}`);
                        resolve(this);
                    } else {
                        const authFailure = new Error("Authentication unsuccessful.");
                        console.error(authFailure.message);
                        this.severLink();
                        reject(authFailure);
                    }
                });
            });

            this.channelAgent.connect(this.port, this.host);
        });

        return this.connectionInitiationPromise;
    }

    severLink() {
        if (this.channelAgent) {
            this.channelAgent.end();
            this.channelAgent = null;
        }
        this.activeSession = null;
        this.connectionInitiationPromise = null;
    }

    async dispatchInstruction(operationString, completionHandler, parameters) {
        if (!this.activeSession || !this.channelAgent) {
            console.log("Connection not established. Attempting to connect...");
            try {
                await this.establishLink();
            } catch (error) {
                console.error("Failed to establish connection:", error.message);
                if (completionHandler) {
                    completionHandler(null, this.clientHandle, parameters, error);
                }
                return;
            }
        }

        this.activeSession.api(operationString, (responseCallback) => {
            if (completionHandler) {
                console.log(operationString);
                completionHandler(responseCallback.body, this.clientHandle, parameters);
            }
        });
    }
}

const dataProcessor = {
    interpretPayload: (rawText, fieldSeparator, returnAsKeyValues) => {
        const textLines = rawText.split("\n");

        if (returnAsKeyValues) {
            const processedDictionary = textLines.reduce((accumulator, currentLine) => {
                const parts = currentLine.split(fieldSeparator, 2);
                if (parts.length === 2) {
                    accumulator[parts[0]] = parts[1];
                }
                return accumulator;
            }, {});

            if (processedDictionary['Reply-Text'] && processedDictionary['Reply-Text'][0] === '%') {
                for (const key in processedDictionary) {
                    if (Object.prototype.hasOwnProperty.call(processedDictionary, key)) {
                        processedDictionary[key] = dataDecoder.unescape(processedDictionary[key]);
                    }
                }
            }
            return processedDictionary;
        } else {
            return textLines.map(line => line.split(fieldSeparator));
        }
    },

    processIdentifiers: (inputString, clientHandle, payloadObject) => {
        const identifierList = dataProcessor.interpretPayload(inputString, ',', false);
        // Original code had "more code here..." placeholder.
        // We ensure the parsing is done and return the result.
        console.log("Identifiers processed:", identifierList);
        return identifierList;
    }
};

const serverInstance = webServer(httpService, {
    transports: [
        'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
    ],
    // 'browser client minification', 'etag', 'gzip' are typically handled by `serveClient: true` (default)
    // 'log level' is handled by custom logging in modern Socket.IO, default is info-level logging
});

httpService.listen(systemConfiguration.communicationPort, () => {
    console.log(`Web server operational on port ${systemConfiguration.communicationPort}`);
});

const clientConnectionRegistry = new Map();

serverInstance.sockets.on('connection', (clientNexus) => {
    console.log('Client connected to web interface.');

    const gatewayManager = new FreeSwitchConnectionManager(
        systemConfiguration.hostAddress,
        systemConfiguration.accessPoint,
        systemConfiguration.secretKey,
        clientNexus
    );
    clientConnectionRegistry.set(clientNexus.id, gatewayManager);

    clientNexus.on('message', async (payloadObject) => {
        const commandToExecute = "show channels like " + payloadObject.extnNum;
        await gatewayManager.dispatchInstruction(commandToExecute, dataProcessor.processIdentifiers, payloadObject);
    });

    clientNexus.on('disconnect', () => {
        console.log('Client disconnected from web interface.');
        const disconnectedGateway = clientConnectionRegistry.get(clientNexus.id);
        if (disconnectedGateway) {
            disconnectedGateway.severLink();
            clientConnectionRegistry.delete(clientNexus.id);
        }
    });
});

process.on('exit', () => {
    console.log("Application terminating. Closing all active FreeSWITCH connections.");
    for (const manager of clientConnectionRegistry.values()) {
        manager.severLink();
    }
    // The original `conn.closeSync()` is not defined in the provided snippet.
    // Assuming it refers to an external, non-ESL/Socket.IO connection, it's omitted.
});
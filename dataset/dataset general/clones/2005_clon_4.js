const StringOperations = {
    acquirePrefix: (sourceString, charCount) => {
        if (charCount <= 0) { return ""; }
        if (charCount > String(sourceString).length) { return sourceString; }
        return String(sourceString).substring(0, charCount);
    },
    acquireSuffix: (sourceString, charCount) => {
        if (charCount <= 0) { return ""; }
        if (charCount > String(sourceString).length) { return sourceString; }
        return sourceString.slice(-charCount);
    }
};

const networkHandler = require('net');

const SessionState = {
    GREETING_MODE: 'initial_prompt',
    PAYLOAD_MODE: 'receiving_content'
};

class ClientSession {
    constructor(clientEndpoint) {
        this.clientEndpoint = clientEndpoint;
        this.clientEndpoint.setEncoding('utf8');
        this.sessionPhase = SessionState.GREETING_MODE;

        this.clientEndpoint.on('connect', () => this.onInitiateConnection());
        this.clientEndpoint.on('data', (incomingData) => this.onReceiveData(incomingData));
        this.clientEndpoint.on('end', () => this.onTerminateConnection());
        this.clientEndpoint.on('error', (err) => this.onErrorEncountered(err));
    }

    sendOutbound(messageText) {
        this.clientEndpoint.write(messageText + '\r\n');
        console.info('>' + messageText);
    }

    onInitiateConnection() {
        this.sendOutbound('220 SMTP to HTTP Photo Emailer');
        this.sessionPhase = SessionState.GREETING_MODE;
    }

    processIncomingLine(currentLine) {
        const trimmedLine = currentLine.trim();
        console.info('#' + trimmedLine);

        if (this.sessionPhase === SessionState.PAYLOAD_MODE) {
            if (trimmedLine === '.') {
                this.sendOutbound('250 Ok, dont know what to do with it');
                this.sessionPhase = SessionState.GREETING_MODE;
            }
            // Logic to save body line would go here
        } else {
            const primaryCommand = StringOperations.acquirePrefix(trimmedLine, 4).toUpperCase();
            let operationAcknowledged = false;

            const commandDispatch = {
                'HELO': () => { this.sendOutbound('250 mailer.youbelong.net'); operationAcknowledged = true; },
                'MAIL': () => {
                    if (StringOperations.acquirePrefix(trimmedLine, 10).toUpperCase() === 'MAIL FROM:') {
                        this.sendOutbound('250 MAIL...I hope thats right :)');
                        operationAcknowledged = true;
                    }
                },
                'RCPT': () => {
                    if (StringOperations.acquirePrefix(trimmedLine, 8).toUpperCase() === 'RCPT TO:') {
                        this.sendOutbound('250 RCPT...I hope thats right :)');
                        operationAcknowledged = true;
                    }
                },
                'DATA': () => {
                    this.sessionPhase = SessionState.PAYLOAD_MODE;
                    this.sendOutbound('354 Enter mail, end with "." on a line by itself');
                    operationAcknowledged = true;
                },
                'NOOP': () => { this.sendOutbound('250 OK'); operationAcknowledged = true; },
                'QUIT': () => { this.sendOutbound('221 Bye'); this.clientEndpoint.destroy(); operationAcknowledged = true; },
                'RSET': () => { this.sendOutbound('250 Reset OK'); operationAcknowledged = true; },
                'HELP': () => {
                    this.sendOutbound('214-Commands supported\r\n214 HELO MAIL RCPT DATA\r\n214 NOOP QUIT RSET HELP');
                    operationAcknowledged = true;
                },
                'EXPN': () => { this.sendOutbound('550 EXPN not available'); operationAcknowledged = true; },
                'VRFY': () => { this.sendOutbound('252 VRFY not available'); operationAcknowledged = true; },
                'EHLO': () => { this.sendOutbound('502 Unsupported here'); operationAcknowledged = true; },
                'SEND': () => { this.sendOutbound('502 Unsupported here'); operationAcknowledged = true; },
                'SAML': () => { this.sendOutbound('502 Unsupported here'); operationAcknowledged = true; },
                'SOML': () => { this.sendOutbound('502 Unsupported here'); operationAcknowledged = true; },
                'TURN': () => { this.sendOutbound('502 Unsupported here'); operationAcknowledged = true; }
            };

            if (commandDispatch[primaryCommand]) {
                commandDispatch[primaryCommand]();
            }

            if (!operationAcknowledged) {
                this.sendOutbound('500 Unrecognized command');
            }
        }
    }

    onReceiveData(incomingData) {
        const lineSegments = incomingData.split('\r\n');
        for (let index = 0; index < lineSegments.length - 1; index++) {
            this.processIncomingLine(lineSegments[index]);
        }
    }

    onTerminateConnection() {
        console.info(' Unexpected End, Terminating connection.');
        this.clientEndpoint.destroy();
    }

    onErrorEncountered(fault) {
        console.error('Network session error:', fault.message);
        this.clientEndpoint.destroy();
    }
}

class ServiceProvider {
    constructor(portNumber, bindingAddress) {
        this.listeningPort = portNumber;
        this.listeningAddress = bindingAddress;
        this.connectionServer = networkHandler.createServer((socketConnection) => this.handleNewConnection(socketConnection));
    }

    handleNewConnection(socketConnection) {
        new ClientSession(socketConnection);
    }

    commenceOperation() {
        this.connectionServer.listen(this.listeningPort, this.listeningAddress, () => {
            console.log(`Email service active at ${this.listeningAddress}:${this.listeningPort}`);
        });
    }
}

console.log('Clear Image Photo Emailer');

const servicePortNumber = 25;
const serviceBindingAddress = '10.209.215.64';

const mainService = new ServiceProvider(servicePortNumber, serviceBindingAddress);
mainService.commenceOperation();
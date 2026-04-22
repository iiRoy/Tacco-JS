const networkModule = require('net');
const systemUtils = require('util');
const WebSockFlow = require('./wsstream');

const { ENOTCONN, ECONNRESET, EPIPE, EAGAIN, ECONNREFUSED } = require('process');

// Renamed process.argv
const commandArguments = require('process').argv;

// Renamed sSide and runClient/runServer
const determineExecutionMode = (argsArray) => {
    return argsArray.length > 2 ? 'consumer' : 'producer';
};

const executionMode = determineExecutionMode(commandArguments);

// Renamed checkMsg
const validatePayload = (envelope, payload, tally, currentMode) => {
    // Combine checks into a single boolean expression for variety
    const isValidEnvelope = (
        envelope.opcode === 'binary' &&
        envelope.isFinal === true &&
        envelope.size === payload.length
    );

    if (!isValidEnvelope) {
        throw new Error(`Envelope structure invalid: ${systemUtils.inspect(envelope)}`);
    }

    const tailStartingPosition = payload.length - 11;
    const extractedTail = payload.slice(tailStartingPosition, payload.length).toString('ascii');
    if (extractedTail !== ' badgirl!  ') {
        throw new Error(`Data corruption detected in payload: ${extractedTail}`);
    }

    // Different divisibility check for logging
    if (tally - (Math.floor(tally / 1000) * 1000) === 0) {
        console.log(`${currentMode} ${tally} p ${payload.length}`);
    }
};

// Renamed handleErr
const processFault = (faultObject, currentMode) => {
    const recognizedErrors = [ENOTCONN, ECONNRESET, EPIPE, EAGAIN, ECONNREFUSED];
    if (recognizedErrors.includes(faultObject.errno)) {
        console.log(`Issue: ${faultObject.message} (Context: ${currentMode})`);
    } else {
        throw faultObject;
    }
};

// Renamed runServer to initiateService and refactored to a class
class ServiceHost {
    constructor(portNumber, modeIdentifier) {
        this.portNumber = portNumber;
        this.modeIdentifier = modeIdentifier;
        this.isShuttingDown = false;
        this.serviceListener = null;
        this.childProcessHandle = null;
    }

    start() {
        this.serviceListener = networkModule.createServer(this.handleIncomingConnection.bind(this));
        this.serviceListener.on('error', (err) => processFault(err, this.modeIdentifier));

        require('process').on('SIGINT', () => {
            this.isShuttingDown = true;
            console.log('SIGINT received, initiating graceful shutdown...');
            this.serviceListener.close(() => console.log('Service listener closed.'));
            if (this.childProcessHandle) {
                this.childProcessHandle.kill('SIGINT');
            }
        });

        this.serviceListener.listen(this.portNumber, () => {
            console.log(`Service host listening on port ${this.portNumber}`);
            const childProc = require('child_process');
            this.childProcessHandle = childProc.spawn(
                commandArguments[0],
                [commandArguments[1], 'consumer'],
                { stdio: ['ignore', require('process').stdout, require('process').stderr] }
            );
            this.childProcessHandle.on('exit', (code) => console.log(`Child consumer process exited with code ${code}`));
            this.childProcessHandle.on('error', (err) => console.error(`Child consumer process error: ${err.message}`));
        });
    }

    handleIncomingConnection(connectionHandle) {
        connectionHandle.setNoDelay(true);

        connectionHandle.on('timeout', () => { /* No action */ });
        connectionHandle.on('close', (hadError) => console.log(`Connection closed (error: ${hadError})`));
        connectionHandle.on('error', (err) => processFault(err, this.modeIdentifier));

        const flowHandler = new WebSockFlow(connectionHandle);
        let messageTally = 0;

        flowHandler.on('data', (envelope, payload) => {
            validatePayload(envelope, payload, ++messageTally, this.modeIdentifier);

            if (this.isShuttingDown && connectionHandle.writable) {
                console.log('Service shutting down, ending flow.');
                flowHandler.end();
                return;
            }

            const suffixBytes = Buffer.from(' badgirl!  ', 'ascii');
            const outputBuffer = Buffer.concat([payload, suffixBytes]);

            flowHandler.write(1, 'binary', outputBuffer);
        });

        flowHandler.on('end', (statusFlag) => {
            console.log(`Flow handler ended, status: ${statusFlag}`);
        });
    }
}

const initiateService = () => {
    const servicePort = 8009;
    const hostInstance = new ServiceHost(servicePort, executionMode);
    hostInstance.start();
};

// Renamed runClient to commenceSession and refactored to a class
class SessionInitiator {
    constructor(portNumber, modeIdentifier) {
        this.portNumber = portNumber;
        this.modeIdentifier = modeIdentifier;
        this.initialPayloadData = Buffer.from('here is the test string for starters. badgirl!  ', 'ascii');
        this.sessionConnector = new networkModule.Socket();
        this.clientFlowHandler = null;
        this.messageTally = 0;
    }

    begin() {
        this.sessionConnector.on('connect', this.onConnectionEstablished.bind(this));
        this.sessionConnector.on('timeout', () => { /* No special handling */ });
        this.sessionConnector.on('close', (hadError) => console.log(`Session connector closed (error: ${hadError})`));
        this.sessionConnector.on('error', (err) => processFault(err, this.modeIdentifier));

        this.clientFlowHandler = new WebSockFlow(this.sessionConnector);
        this.clientFlowHandler.on('data', this.onFlowDataReceived.bind(this));
        this.clientFlowHandler.on('end', (statusFlag) => console.log(`Client flow ended, status: ${statusFlag}`));

        require('process').on('SIGINT', () => { /* Prevent default exit */ });

        this.sessionConnector.connect(this.portNumber, '127.0.0.1', () => {
            console.log(`Attempting connection to ${this.portNumber}`);
        });
    }

    onConnectionEstablished() {
        console.log('Session connector established.');
        this.sessionConnector.setNoDelay(true);
        this.clientFlowHandler.write(1, 'binary', this.initialPayloadData);
    }

    onFlowDataReceived(envelope, payload) {
        validatePayload(envelope, payload, ++this.messageTally, this.modeIdentifier);

        this.clientFlowHandler.write(1, 'binary', payload);

        const magicNumber = 1727;
        const isMagicCount = (this.messageTally % magicNumber) === 0;

        if (isMagicCount) {
            this.clientFlowHandler.write(1, 'binary', payload, (statusFlag) => {
                console.log(`Confirmation callback received with status: ${statusFlag}`);
            });
        }
    }
}

const commenceSession = () => {
    const servicePort = 8009;
    const initiatorInstance = new SessionInitiator(servicePort, executionMode);
    initiatorInstance.begin();
};

// Using an object mapping for execution instead of if/else
const modeExecutors = {
    'consumer': commenceSession,
    'producer': initiateService
};

modeExecutors[executionMode]();
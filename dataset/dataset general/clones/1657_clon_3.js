const networkClientFactory = require('socket.io-client');

const defaultEchoPhrase = "O Bispo de Constantinopla nao quer se desconstantinopolizar";

const appConfiguration = {
    connectionOptions: {
        'force new connection': true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000
    },
    defaultHost: 'localhost',
    defaultPort: '3000',
    initialPayload: defaultEchoPhrase,
    logPrefix: '[EchoClient]'
};

/**
 * Initiates a client session to connect to a Socket.IO server.
 * @param {string} targetHost - The hostname or IP address of the server.
 * @param {string|number} connectionPort - The port number of the server.
 */
function establishClientConnection(targetHost, connectionPort) {
    if (!targetHost || typeof targetHost !== 'string' || targetHost.trim() === '') {
        console.error(`${appConfiguration.logPrefix} Invalid target host provided.`);
        targetHost = appConfiguration.defaultHost;
        console.warn(`${appConfiguration.logPrefix} Falling back to default host: ${targetHost}`);
    }
    const parsedPort = parseInt(connectionPort, 10);
    if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
        console.error(`${appConfiguration.logPrefix} Invalid connection port provided.`);
        connectionPort = appConfiguration.defaultPort;
        console.warn(`${appConfiguration.logPrefix} Falling back to default port: ${connectionPort}`);
    } else {
        connectionPort = parsedPort;
    }

    let lastCommunicationTimestamp = new Date();

    const connectionUrl = `http://${targetHost}:${connectionPort}`;
    console.log(`${appConfiguration.logPrefix} Attempting to connect to: ${connectionUrl}`);

    const activeSocketConnection = networkClientFactory.connect(connectionUrl, appConfiguration.connectionOptions);

    let messageSentCount = 0;
    let messageReceivedCount = 0;

    activeSocketConnection.on('connect', () => {
        console.log(`${appConfiguration.logPrefix} Successfully connected to server.`);

        setTimeout(() => {
            activeSocketConnection.send(appConfiguration.initialPayload);
            messageSentCount++;
            console.log(`${appConfiguration.logPrefix} Sent initial payload (count: ${messageSentCount}).`);
            lastCommunicationTimestamp = new Date();
        }, 100);

        activeSocketConnection.on('message', (incomingData) => {
            messageReceivedCount++;
            const currentTimestamp = new Date();
            const roundTripTimeMs = currentTimestamp.getTime() - lastCommunicationTimestamp.getTime();

            console.log(`${appConfiguration.logPrefix} Received data (count: ${messageReceivedCount}). Round-trip time: ${roundTripTimeMs}ms.`);

            lastCommunicationTimestamp = currentTimestamp;

            if (typeof incomingData === 'string' && incomingData.trim() !== '') {
                activeSocketConnection.send(incomingData);
                messageSentCount++;
            } else {
                console.warn(`${appConfiguration.logPrefix} Received non-string or empty data, not echoing.`);
            }
        });
    });

    activeSocketConnection.on('connect_error', (error) => {
        console.error(`${appConfiguration.logPrefix} Connection error:`, error.message);
    });

    activeSocketConnection.on('disconnect', (reason) => {
        console.warn(`${appConfiguration.logPrefix} Disconnected from server. Reason: ${reason}`);
    });

    activeSocketConnection.on('reconnect', (attemptNumber) => {
        console.info(`${appConfiguration.logPrefix} Reconnected after ${attemptNumber} attempts.`);
    });

    activeSocketConnection.on('reconnect_error', (error) => {
        console.error(`${appConfiguration.logPrefix} Reconnection error:`, error.message);
    });
}

const commandLineArgs = process.argv;
let resolvedHost = appConfiguration.defaultHost;
let resolvedPort = appConfiguration.defaultPort;

const hostIndex = commandLineArgs.indexOf('--host');
if (hostIndex > -1 && commandLineArgs[hostIndex + 1]) {
    resolvedHost = commandLineArgs[hostIndex + 1];
} else if (commandLineArgs[2]) {
    resolvedHost = commandLineArgs[2];
}

const portIndex = commandLineArgs.indexOf('--port');
if (portIndex > -1 && commandLineArgs[portIndex + 1]) {
    resolvedPort = commandLineArgs[portIndex + 1];
} else if (commandLineArgs[3]) {
    resolvedPort = commandLineArgs[3];
}

establishClientConnection(resolvedHost, resolvedPort);
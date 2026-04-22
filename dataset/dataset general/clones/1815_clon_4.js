const scenarioDescriptor = 'raw';
const connectionAddress = 'ws://ws.websocketstest.com:80/service';

const processRawConnection = (destination, allowedProtocols) => {
    let currentOperationalState = {
        negotiatedProtocol: null,
        receivedMessageCount: 0
    };

    const socketInstance = require('net.iamyellow.tiws').createWS();

    const messageRouter = new Map([
        ['connected', (dataPayload) => {
            Ti.API.log("Socket connection confirmed: " + dataPayload);
            socketInstance.send("version,");
        }],
        ['version', (dataPayload) => {
            Ti.API.log("Protocol version received: " + dataPayload);
            currentOperationalState.negotiatedProtocol = dataPayload;
            socketInstance.send("echo,test message");
        }],
        ['echo', (dataPayload) => {
            if (dataPayload === 'test message') {
                Ti.API.log("Echo verification successful: " + dataPayload);
                if (currentOperationalState.negotiatedProtocol === 'hybi-draft-07') {
                    socketInstance.send("ping,");
                } else {
                    socketInstance.send("timer,");
                }
            }
        }],
        ['time', (dataPayload) => {
            currentOperationalState.receivedMessageCount++;
            Ti.API.log("Time stream update: " + dataPayload);
            if (currentOperationalState.receivedMessageCount > 3) {
                socketInstance.close();
                alert('looks good');
            }
        }]
    ]);

    socketInstance.addEventListener('open', () => Ti.API.debug('Raw socket opened'));
    socketInstance.addEventListener('close', (eventDetails) => Ti.API.info("Raw socket closed - code: " + eventDetails.code + " reason: " + eventDetails.reason));
    socketInstance.addEventListener('error', (errorDetails) => Ti.API.error("Raw socket error: " + errorDetails.error));
    socketInstance.addEventListener('message', (incomingEvent) => {
        Ti.API.log("Raw socket message received: " + incomingEvent.data);
        const [commandKey, responseContent] = incomingEvent.data.split(',', 2);
        const handlerFunction = messageRouter.get(commandKey);
        if (handlerFunction) {
            handlerFunction(responseContent);
        }
    });

    socketInstance.open(destination, allowedProtocols);
};

const establishSocketIOConnection = (targetURI) => {
    const ioModule = require('socket.io');
    const clientSocket = ioModule.connect(targetURI);

    clientSocket.on('connect', () => {
        Ti.API.log('Socket.io client connected!');
    });
};

const initializeNowJSFramework = (serviceEndpoint) => {
    const nowModule = require('now');
    const nowCoreInstance = nowModule.nowInitialize(serviceEndpoint, {
        socketio: {
            transports: ['websocket']
        }
    });

    nowCoreInstance.core.on('error', () => {
        Ti.API.error('Now.js core error!');
    });

    nowCoreInstance.core.on('ready', () => {
        Ti.API.log('Now.js core is operational');
    });

    nowCoreInstance.core.on('disconnect', () => {
        Ti.API.log('Now.js core disconnected');
    });

    nowCoreInstance.userID = '4815162342';
    nowCoreInstance.whatLiesInTheShadowOfTheStatue = () => 'ille qui nos omnes servabit';
};

const connectionDispatcher = new Map([
    ['raw', () => processRawConnection(connectionAddress, ["echo-protocol", "other-proto"])],
    ['socket.io', () => establishSocketIOConnection(connectionAddress)],
    ['nowjs', () => initializeNowJSFramework(connectionAddress)]
]);

const selectedHandler = connectionDispatcher.get(scenarioDescriptor);
if (selectedHandler) {
    selectedHandler();
}
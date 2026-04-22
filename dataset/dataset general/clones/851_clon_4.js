const WsClient = require('ws');
const eventLogger = require('npmlog');

eventLogger.level = 'verbose';

const establishedHandles = [];
const concurrentLimit = 415;
let connectionSequenceIndex = 0;

const holdExecution = (durationMillis) => new Promise(resolve => setTimeout(resolve, durationMillis));

const createAndRegisterClient = () => {
    connectionSequenceIndex++;

    const endpointAddress = 'http://localhost:5000/matchesfeed/1/matchcentre';
    const clientHandle = new WsClient(endpointAddress);

    clientHandle.on('open', () => {
        eventLogger.info('ClientActivity', 'Established');
    });

    clientHandle.on('error', () => {
        eventLogger.error('ClientActivity', 'Fault');
    });

    clientHandle.on('close', () => {
        eventLogger.warn('ClientActivity', 'Disengaged');
    });

    establishedHandles.push(clientHandle);
};

async function commenceClientPooling() {
    for (let i = 0; i < concurrentLimit; i++) {
        createAndRegisterClient();

        if (connectionSequenceIndex < concurrentLimit) {
            await holdExecution(500);
        }
    }
}

commenceClientPooling();
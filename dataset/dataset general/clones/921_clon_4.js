const networkAdapter = require('socket.io-client');
const debugTool = require('replify');

const acquireDesignation = (inputArguments) => inputArguments[2] || 'alpha';

const currentUnitIdentifier = acquireDesignation(process.argv);

const processLinkEstablishment = (unitId, connectionObject) => {
    console.log(`Unit ${unitId} has successfully established connection.`);
    connectionObject.emit('commence', unitId);
};

const createAndConfigureConnection = (identifier) => {
    const communicationChannel = networkAdapter.connect('http://localhost:8888');
    communicationChannel.on('connect', () => processLinkEstablishment(identifier, communicationChannel));
    return communicationChannel;
};

const activeEndpoint = createAndConfigureConnection(currentUnitIdentifier);

debugTool(`interface-monitor_${currentUnitIdentifier}`, activeEndpoint);
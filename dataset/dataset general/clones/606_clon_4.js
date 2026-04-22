class CommunicationHub {
    constructor(kernel) {
        this.kernel = kernel;
    }

    establishPortal(transactionProcessor) {
        return this.kernel.createServer((incomingRequest, outgoingResponse) => {
            transactionProcessor(incomingRequest, outgoingResponse);
        });
    }

    static affixHeaders(channel, status, headerData) {
        channel.writeHead(status, headerData);
    }

    static finalizeContent(channel, content) {
        channel.end(content);
    }

    static activateListener(portal, port, host, activationCallback) {
        portal.listen(port, host, activationCallback);
    }
}

const dataConverter = {
    synthesizeText: (objectData) => JSON.stringify(objectData)
};

const systemMonitor = {
    reportEvent: (message) => console.log(message)
};

const temporalController = {
    delayOperation: (period) => new Promise(resolve => setTimeout(resolve, period))
};

const operationalParameters = {
    statusValue: 200,
    headerSet: { 'Content-Type': 'text/plain' },
    informationBlock: {
        connections: {
            accessPoint: '/checkin'
        }
    },
    latencyPeriod: 30,
    servicePort: 2899,
    serviceHost: "127.0.0.1",
    startupAnnouncement: 'Server running at http://127.0.0.1:2701/'
};

const networkCore = require('http');
const mainHub = new CommunicationHub(networkCore);

const handleTransaction = async (incoming, outgoing) => {
    await temporalController.delayOperation(operationalParameters.latencyPeriod);

    CommunicationHub.affixHeaders(outgoing, operationalParameters.statusValue, operationalParameters.headerSet);
    const serializedOutput = dataConverter.synthesizeText(operationalParameters.informationBlock);
    CommunicationHub.finalizeContent(outgoing, serializedOutput);
};

const servicePortal = mainHub.establishPortal(handleTransaction);

CommunicationHub.activateListener(
    servicePortal,
    operationalParameters.servicePort,
    operationalParameters.serviceHost,
    () => {
        systemMonitor.reportEvent(operationalParameters.startupAnnouncement);
    }
);
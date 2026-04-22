const networkCore = require('http');
const storageCore = require('fs').promises;

const activityRecorder = {
    inform: (...args) => console.log(...args),
    reportError: (...args) => console.error(...args)
};

class PathProcessor {
    constructor() {
        this.pathOperations = new Map();
        this.pathOperations.set("/json", this.fetchJsonPayload.bind(this));
        this.pathOperations.set("/xml", this.fetchXmlPayload.bind(this));
        this.pathOperations.set("/120/json?arg1=hello&arg2=world", this.specificJsonHandler.bind(this));
        this.pathOperations.set("/json?post", this.handlePostData.bind(this));
        this.pathOperations.set("/json/empty", this.sendEmptyJsonReply.bind(this));
        this.pathOperations.set("/xml/empty", this.sendEmptyXmlReply.bind(this));
    }

    async processIncomingRequest(incomingConnection, outgoingResponse) {
        activityRecorder.inform("requestedPath", incomingConnection.url);
        const operationPerformer = this.pathOperations.get(incomingConnection.url);

        if (!operationPerformer) {
            throw "No corresponding operation for path: " + incomingConnection.url;
        }

        await operationPerformer(incomingConnection, outgoingResponse);
    }

    performBlockingWait(delayDurationMillis) {
        const waitUntil = new Date().getTime();
        while(new Date().getTime() < waitUntil + delayDurationMillis) {
            // Intentionally block execution, mimicking original's `sleep`
        }
    }

    async fetchJsonPayload(incomingConnection, outgoingResponse) {
        // this.performBlockingWait(5000); // Original had this commented out
        const contentData = await storageCore.readFile('./message.json', { encoding: 'utf8' });
        outgoingResponse.writeHead(200, { 'Content-Type': 'application/json' });
        outgoingResponse.write(contentData.toString());
        outgoingResponse.end();
    }

    async fetchXmlPayload(incomingConnection, outgoingResponse) {
        const contentData = await storageCore.readFile('./message.xml', { encoding: 'utf8' });
        outgoingResponse.writeHead(200, { 'Content-Type': 'application/xml' });
        outgoingResponse.write(contentData.toString());
        outgoingResponse.end();
    }

    async specificJsonHandler(incomingConnection, outgoingResponse) {
        if (!incomingConnection.headers["test-header"]) {
            throw "Authentication header 'test-header' missing!";
        }
        outgoingResponse.setHeader("test-response-header", incomingConnection.headers["test-header"]);
        await this.pathOperations.get("/json")(incomingConnection, outgoingResponse);
    }

    handlePostData(incomingConnection, outgoingResponse) {
        let receivedFragments = [];
        incomingConnection.on('data', (chunkBuffer) => {
            receivedFragments.push(chunkBuffer);
        });
        incomingConnection.on('end', () => {
            const aggregatedData = Buffer.concat(receivedFragments).toString();
            activityRecorder.inform("[NETWORK_CHANNEL] data received = ", aggregatedData);
            outgoingResponse.writeHead(200, { 'Content-Type': 'application/json' });
            outgoingResponse.write(aggregatedData);
            outgoingResponse.end();
        });
    }

    sendEmptyJsonReply(incomingConnection, outgoingResponse) {
        outgoingResponse.writeHead(204, { 'Content-Type': 'application/json' });
        outgoingResponse.end();
    }

    sendEmptyXmlReply(incomingConnection, outgoingResponse) {
        outgoingResponse.writeHead(204, { 'Content-Type': 'application/xml' });
        outgoingResponse.end();
    }
}

const globalPathProcessor = new PathProcessor();

const networkListener = networkCore.createServer(async (incomingConnection, outgoingResponse) => {
    await globalPathProcessor.processIncomingRequest(incomingConnection, outgoingResponse);
});

networkListener.on('error', (issueDetails) => {
    activityRecorder.reportError('problem starting network gateway', issueDetails);
});

const networkPort = 4444;

networkListener.listen(networkPort, () => {
    activityRecorder.inform('network gateway active on port ' + networkPort);
});
const resourceLocator = require('url');
const networkFacilitator = require('http');
const queryParameters = require('querystring');
const eventBroadcaster = require('node-pusher');

const hostAddress = '127.0.0.1';
const servicePort = 1337;

const applicationIdentifier = process.argv[2];
const accessKey = process.argv[3];
const secretCode = process.argv[4];

if (!accessKey || !secretCode) {
    console.error('Execution requires: [application_id] [access_key] [secret_code]');
    process.exit(1);
}

const broadCastAgent = new eventBroadcaster({
    appId: applicationIdentifier,
    key: accessKey,
    secret: secretCode
});

const transmitReply = (replyStream, logicalStatus, contentData, extraHeaders = {}) => {
    const finalHeaders = { ...extraHeaders };
    finalHeaders['Content-Type'] = 'application/json';

    let serializedContent = undefined;
    if (contentData !== undefined) {
        serializedContent = JSON.stringify(contentData);
        console.log('REPLY_SENT', serializedContent);
        finalHeaders['Content-Length'] = serializedContent.length;
    }
    replyStream.writeHead(200, finalHeaders); // Original always writes 200, regardless of logicalStatus
    replyStream.end(serializedContent);
};

const applyCrossOriginPolicies = (incomingRequest, outgoingResponse) => {
    outgoingResponse.setHeader('Access-Control-Allow-Origin', incomingRequest.headers.origin || '*');
    outgoingResponse.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
    outgoingResponse.setHeader('Access-Control-Max-Age', 7200);
};

const extractPayload = (incomingRequest) => {
    return new Promise((resolve) => {
        let accumulatedData = '';
        incomingRequest.on('data', (chunk) => {
            accumulatedData += chunk;
        });
        incomingRequest.on('end', () => {
            const contentType = incomingRequest.headers['content-type'];
            let parsedResult = {};
            try {
                if (contentType && contentType.includes('application/json')) {
                    parsedResult = JSON.parse(accumulatedData || '{}');
                } else {
                    parsedResult = queryParameters.parse(accumulatedData || '');
                }
            } catch (parsingError) {
                // Original returns empty object on error
            }
            resolve(parsedResult);
        });
    });
};

class RequestProcessor {
    constructor(broadcasterInstance, providedAccessKey) {
        this.broadcaster = broadcasterInstance;
        this.serviceKey = providedAccessKey;
    }

    async processPostRequest(incomingRequest, outgoingResponse) {
        const inputArguments = await extractPayload(incomingRequest);
        console.log('RECEIVED_REQUEST', inputArguments);

        const targetChannel = inputArguments.channel || inputArguments.channel_name;

        const actionHandlers = new Map([
            ['triggerEvent', async () => {
                const triggerArgs = [
                    targetChannel,
                    inputArguments.event,
                    inputArguments.data,
                    inputArguments.socket_id,
                    (err, sent, received) => {
                        if (err) {
                            transmitReply(outgoingResponse, 500, { issue: err });
                        } else {
                            transmitReply(outgoingResponse, received.statusCode, inputArguments);
                        }
                    }
                ];
                this.broadcaster.trigger(...triggerArgs);
            }],
            ['authenticateSocket', () => {
                const authPayload = this.broadcaster.auth(inputArguments.socket_id, targetChannel, {
                    user_id: 0,
                    ip: incomingRequest.connection.remoteAddress,
                    port: incomingRequest.connection.remotePort
                });
                transmitReply(outgoingResponse, 200, authPayload);
            }],
            ['missingArguments', () => {
                transmitReply(outgoingResponse, 400, {
                    issue: 'Required parameters absent',
                    expected: ['channel', 'event', 'data', 'socket_id (for authentication)']
                });
            }]
        ]);

        if (targetChannel) {
            if (inputArguments.event) {
                actionHandlers.get('triggerEvent')();
            } else if (inputArguments.socket_id) {
                actionHandlers.get('authenticateSocket')();
            } else {
                actionHandlers.get('missingArguments')();
            }
        } else {
            actionHandlers.get('missingArguments')();
        }
    }

    async handleIncoming(incomingRequest, outgoingResponse) {
        applyCrossOriginPolicies(incomingRequest, outgoingResponse);

        const methodActions = new Map([
            ['POST', () => this.processPostRequest(incomingRequest, outgoingResponse)],
            ['GET', () => transmitReply(outgoingResponse, 200, { access_key: this.serviceKey })]
        ]);

        const chosenAction = methodActions.get(incomingRequest.method) || methodActions.get('GET');
        await chosenAction();
    }
}

const requestHandler = new RequestProcessor(broadCastAgent, accessKey);

networkFacilitator.createServer((req, res) => requestHandler.handleIncoming(req, res))
    .listen(servicePort, hostAddress, () => {
        console.log(`System operational at ${hostAddress}:${servicePort}...`);
    });
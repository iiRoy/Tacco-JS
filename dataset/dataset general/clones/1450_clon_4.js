const webHttp = require('http');
const urlParser = require('url');

const listenPort = 8004;

const routeRegistry = new Map();

function registerRoute(methodMethod, urlPattern, responseProcessor) {
    const pathSegments = [];
    let regexForm = urlPattern.split('?')[0];

    let matchCursor;
    const segmentExtractor = /:([a-zA-Z0-9_]+)/g;
    while ((matchCursor = segmentExtractor.exec(regexForm)) !== null) {
        pathSegments.push(matchCursor[1]);
    }
    const finalPathRegex = new RegExp(`^${regexForm.replace(/:[a-zA-Z0-9_]+/g, '([^/]+)')}$`);

    const expectedQuerySegments = [];
    const queryPartMatch = urlPattern.match(/\?(.+)$/);
    if (queryPartMatch) {
        const querySection = queryPartMatch[1];
        const querySegmentPlaceholder = /{([a-zA-Z0-9_]+)}/g;
        while ((matchCursor = querySegmentPlaceholder.exec(querySection)) !== null) {
            expectedQuerySegments.push(matchCursor[1]);
        }
    }

    routeRegistry.set(`${methodMethod} ${urlPattern}`, {
        pathRegex: finalPathRegex,
        handler: responseProcessor,
        pathParameters: pathSegments,
        queryParameters: expectedQuerySegments
    });
}

function firstJourneyHandler(incomingRequest, outgoingResponse, extractedSegments, requestPayload) {
    const statusMessage = "got 'here'";
    console.log(statusMessage);
    console.dir(requestPayload);
    console.dir(extractedSegments);
    outgoingResponse.writeHead(201, { 'Content-Type': 'text/html' });
    outgoingResponse.end(statusMessage);
}

function secondPassageHandler(incomingRequest, outgoingResponse, extractedSegments, requestPayload) {
    const statusMessage = "went 'there'";
    console.log(statusMessage);
    console.dir(requestPayload);
    console.dir(extractedSegments);
    outgoingResponse.writeHead(201, { 'Content-Type': 'text/html' });
    outgoingResponse.end(statusMessage);
}

function reportBackOperation(incomingRequest, outgoingResponse, extractedSegments, requestPayload) {
    const statusMessage = "went 'callbackwords'";
    console.log(statusMessage);
    console.dir(requestPayload);
    console.dir(extractedSegments);
    outgoingResponse.writeHead(201, { 'Content-Type': 'text/html' });
    outgoingResponse.end(statusMessage);
}

registerRoute('POST', '/here/:here_name/:user', firstJourneyHandler);
registerRoute('POST', '/there/:over_name', secondPassageHandler);
registerRoute('GET', '/callback/:table_name?level_name={level_name}&callback={callback}', reportBackOperation);

const webServer = webHttp.createServer((incomingRequest, outgoingResponse) => {
    const parsedResource = urlParser.parse(incomingRequest.url, true);
    const resourcePath = parsedResource.pathname;
    const requestMethod = incomingRequest.method;

    let currentRoute = null;
    let pathSegmentValues = {};

    for (const [patternKey, routeDefinition] of routeRegistry.entries()) {
        const [methodPart, pathPatternPart] = patternKey.split(' ');
        if (methodPart === requestMethod) {
            const pathMatch = routeDefinition.pathRegex.exec(resourcePath);
            if (pathMatch) {
                currentRoute = routeDefinition;
                for (let j = 0; j < routeDefinition.pathParameters.length; j++) {
                    pathSegmentValues[routeDefinition.pathParameters[j]] = pathMatch[j + 1];
                }
                break;
            }
        }
    }

    if (!currentRoute) {
        outgoingResponse.writeHead(404, { 'Content-Type': 'text/plain' });
        outgoingResponse.end('Not Found');
        return;
    }

    const finalSegments = { ...pathSegmentValues };
    for (const keyId in parsedResource.query) {
        finalSegments[keyId] = parsedResource.query[keyId];
    }
    for (const queryName of currentRoute.queryParameters) {
        if (!(queryName in finalSegments)) {
            finalSegments[queryName] = undefined;
        }
    }

    let requestPayloadData = '';
    incomingRequest.on('data', dataChunk => {
        requestPayloadData += dataChunk.toString();
    });

    incomingRequest.on('end', () => {
        let payloadContent = {};
        if (requestPayloadData) {
            try {
                payloadContent = JSON.parse(requestPayloadData);
            } catch (parsingError) {
                payloadContent = requestPayloadData;
            }
        }
        currentRoute.handler(incomingRequest, outgoingResponse, finalSegments, payloadContent);
    });

    incomingRequest.on('error', (requestError) => {
        console.error('Incoming request error:', requestError);
        outgoingResponse.writeHead(500, { 'Content-Type': 'text/plain' });
        outgoingResponse.end('Internal Server Error');
    });
});

webServer.listen(listenPort, () => {
    console.log(" listening on port:" + listenPort);
});

let scheduledTask;
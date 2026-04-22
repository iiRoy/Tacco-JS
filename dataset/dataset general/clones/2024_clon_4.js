'use strict';

const webFramework = require('express');
const fetchResource = require('node-fetch');
const imageProcessor = require('./lib/handler');

const serverApp = webFramework();

const servicePort = 3000;
const defaultImageConfig = Object.freeze({
    s: 'bounded',
    w: 100,
    h: 100,
    g: 'Center',
    b: 'black',
    q: 75
});

const processImageAsync = (imageDataStream, processingOptions) => {
    return new Promise((resolve, reject) => {
        imageProcessor(imageDataStream, processingOptions, (operationError, transformedStream) => {
            if (operationError) {
                reject(operationError);
            } else {
                resolve(transformedStream);
            }
        });
    });
};

serverApp.get('*', async (clientRequest, clientResponse) => {
    const resourceLocator = clientRequest.path.substring(1);
    let sourceResourceUrl;

    try {
        sourceResourceUrl = new URL(resourceLocator);
        if (!['http:', 'https:'].includes(sourceResourceUrl.protocol)) {
            clientResponse.status(400).send('Input Error: Provided URL must use HTTP or HTTPS protocol.');
            return;
        }
    } catch (parsingIssue) {
        clientResponse.status(400).send('Input Error: Malformed resource identifier.');
        return;
    }

    const currentQuerySettings = { ...clientRequest.query };

    const hasWidth = currentQuerySettings.w !== undefined && currentQuerySettings.w !== null;
    const hasHeight = currentQuerySettings.h !== undefined && currentQuerySettings.h !== null;

    if (!hasWidth && hasHeight) {
        currentQuerySettings.w = currentQuerySettings.h;
    } else if (hasWidth && !hasHeight) {
        currentQuerySettings.h = currentQuerySettings.w;
    }

    const finalProcessingConfiguration = Object.assign({}, defaultImageConfig, currentQuerySettings);

    try {
        const remoteStreamResponse = await fetchResource(sourceResourceUrl.href);

        if (!remoteStreamResponse.ok) {
            clientResponse.status(remoteStreamResponse.status).send(`External Resource Error: ${remoteStreamResponse.statusText}`);
            return;
        }

        const outputImageStream = await processImageAsync(remoteStreamResponse.body, finalProcessingConfiguration);

        outputImageStream.pipe(clientResponse);

    } catch (processingIssue) {
        console.error('Service Fault:', processingIssue.message);
        clientResponse.status(500).send('Service Fault: Unable to complete image transformation.');
    }
});

serverApp.listen(servicePort, () => {
    console.log(`Image transformation service operating on port ${servicePort}`);
});
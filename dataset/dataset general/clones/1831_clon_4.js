const hyperText = require('http');
const dataStorage = require('redis');
const secureComm = require('https');
const hashingUtil = require('crypto');
const fileSystem = require('fs');
const pathModule = require('path');

// Helper to promisify Redis client methods for async/await usage
const createDataStoreProxy = (clientInstance) => {
    const wrappedMethods = {};
    for (const key in clientInstance) {
        if (typeof clientInstance[key] === 'function' && !key.endsWith('Async')) {
            wrappedMethods[key] = (...args) => {
                return new Promise((resolve, reject) => {
                    clientInstance[key](...args, (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    });
                });
            };
        }
    }
    return wrappedMethods;
};

// Helper for making secure HTTP requests and wrapping in a Promise
const initiateSecureRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
        const connectionRequest = secureComm.request(options, (connectionResponse) => {
            let receivedData = '';
            connectionResponse.on('data', (dataSegment) => { receivedData += dataSegment; });
            connectionResponse.on('end', () => resolve({ statusCode: connectionResponse.statusCode, bodyContent: receivedData }));
        });
        connectionRequest.on('error', (processingIssue) => reject(processingIssue));
        if (postData) {
            connectionRequest.write(postData);
        }
        connectionRequest.end();
    });
};

// Helper for parsing incoming request body (JSON)
const parseIncomingData = (requestInfo) => {
    return new Promise((resolve, reject) => {
        let accumulatedBody = '';
        requestInfo.on('data', (dataSegment) => {
            accumulatedBody += dataSegment.toString();
        });
        requestInfo.on('end', () => {
            try {
                resolve(JSON.parse(accumulatedBody));
            } catch (processingIssue) {
                reject(new Error('Input data malformed: ' + processingIssue.message));
            }
        });
        requestInfo.on('error', (processingIssue) => reject(processingIssue));
    });
};

// Helper for parsing query parameters from URL
const extractQueryParams = (urlPath) => {
    const queryIndex = urlPath.indexOf('?');
    if (queryIndex === -1) return {};
    const queryString = urlPath.substring(queryIndex + 1);
    return queryString.split('&').reduce((accumulator, pair) => {
        const parts = pair.split('=');
        if (parts.length === 2) {
            accumulator[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
        }
        return accumulator;
    }, {});
};

// Data Store Client Initialization
const dataStoreClient = createDataStoreProxy(dataStorage.createClient());

// In-memory cache for random entity hashes
let cachedSnapshot = {
    moment: new Date(0), // Timestamp of last cache update, initialized to an old date
    payload: []          // The actual cached data (array of hashes)
};

const CACHE_VALIDITY_DURATION_MS = 15000; // Cache validity duration in milliseconds (15 seconds)

// Function to retrieve a list of random entity hashes, using caching
async function fetchRandomEntities(entityLimit) {
    if (cachedSnapshot.payload.length > 0 && (new Date() - cachedSnapshot.moment) < CACHE_VALIDITY_DURATION_MS) {
        // Cache is fresh, return immediately
        return cachedSnapshot.payload;
    }

    const maxEntitiesToFetch = Math.min(64, entityLimit); // Cap the number of entities at 64, as per original logic
    const uniqueHashes = new Set();

    let currentAttemptCount = 0;
    const MAX_FETCH_ATTEMPTS = maxEntitiesToFetch * 5; // Limit attempts to prevent infinite loops on small/empty sets

    while (uniqueHashes.size < maxEntitiesToFetch && currentAttemptCount < MAX_FETCH_ATTEMPTS) {
        currentAttemptCount++;
        try {
            const memberIdentifier = await dataStoreClient.srandmember('supporters');
            if (memberIdentifier) {
                const lowercasedIdentifier = String(memberIdentifier).toLowerCase();
                const hashedValue = hashingUtil.createHash('md5').update(lowercasedIdentifier).digest("hex");
                uniqueHashes.add(hashedValue);
            }
        } catch (operationError) {
            console.error('Error fetching random supporter from data store:', operationError);
            break; // Exit loop on error
        }
    }

    const generatedEntities = Array.from(uniqueHashes);
    cachedSnapshot = {
        moment: new Date(),
        payload: generatedEntities
    };
    return generatedEntities;
}

// Handler for identity enrollment requests
async function handleEnrollmentRequest(requestInfo, responseHandle, sendJsonResponse) {
    try {
        const incomingPayload = await parseIncomingData(requestInfo);
        const identityClaim = incomingPayload.identityClaim;

        if (!identityClaim) {
            return sendJsonResponse(400, { outcome: false, explanation: 'Identity claim missing from request.' });
        }

        const recipientDomain = 'http://' + requestInfo.headers.host;
        const verificationPayload = JSON.stringify({
            assertion: identityClaim,
            audience: recipientDomain
        });

        const verificationOptions = {
            host: 'browserid.org',
            path: '/verify',
            method: 'POST',
            headers: {
                'Content-Length': Buffer.byteLength(verificationPayload),
                'Content-Type': 'application/json'
            }
        };

        const verificationResponse = await initiateSecureRequest(verificationOptions, verificationPayload);
        const verificationResult = JSON.parse(verificationResponse.bodyContent);

        if (!verificationResult.email) {
            throw new Error("Email address not present in verification response.");
        }

        const emailAddress = String(verificationResult.email);
        const alreadySupporter = await dataStoreClient.sismember('supporters', emailAddress);

        if (alreadySupporter) {
            sendJsonResponse(200, {
                outcome: false,
                explanation: "Email already registered. We appreciate your continued support!"
            });
        } else {
            const addResult = await dataStoreClient.sadd('supporters', emailAddress);
            if (addResult === 1) { // Redis sadd returns 1 if added, 0 if already existed
                cachedSnapshot = { moment: new Date(0), payload: [] }; // Invalidate the entity hash cache
                sendJsonResponse(200, { outcome: true, email: emailAddress });
            } else {
                sendJsonResponse(500, { outcome: false, explanation: 'Failed to add email to data store.' });
            }
        }

    } catch (processingIssue) {
        console.error('Enrollment processing error:', processingIssue);
        sendJsonResponse(400, { outcome: false, explanation: 'Could not validate identity claim.', details: processingIssue.message });
    }
}

// Handler for participant data retrieval requests
async function handleParticipantData(requestInfo, responseHandle, sendJsonResponse) {
    try {
        const queryParams = extractQueryParams(requestInfo.url);
        const totalCount = await dataStoreClient.scard('supporters');
        let entityData = await fetchRandomEntities(totalCount);

        const personalIdentifier = queryParams.personalIdentifier;
        if (personalIdentifier) {
            entityData = entityData.slice(); // Create a shallow copy to modify
            if (entityData.length >= 64) {
                entityData.pop(); // Remove last element if array is full
            }
            const lowercasedPersonalId = String(personalIdentifier).toLowerCase();
            const personalHash = hashingUtil.createHash('md5').update(lowercasedPersonalId).digest("hex");
            entityData.unshift(personalHash); // Add personal hash to the beginning
        }

        sendJsonResponse(200, { totalSupporters: totalCount, selectedHashes: entityData });

    } catch (processingIssue) {
        console.error('Participant data retrieval error:', processingIssue);
        sendJsonResponse(500, { outcome: false, explanation: 'Failed to retrieve participant data.', details: processingIssue.message });
    }
}

// HTTP Server Creation
const httpApplication = hyperText.createServer(async (requestInfo, responseHandle) => {
    // Basic request logging
    console.log(`${requestInfo.method} ${requestInfo.url}`);

    const urlPath = requestInfo.url.split('?')[0];

    // Unified JSON response sender utility
    const sendJsonResponse = (statusCode, dataObject) => {
        responseHandle.writeHead(statusCode, { 'Content-Type': 'application/json' });
        responseHandle.end(JSON.stringify(dataObject));
    };

    try {
        if (requestInfo.method === 'POST' && urlPath === '/enrollment-request') {
            await handleEnrollmentRequest(requestInfo, responseHandle, sendJsonResponse);
        } else if (requestInfo.method === 'GET' && urlPath === '/participant-data') {
            await handleParticipantData(requestInfo, responseHandle, sendJsonResponse);
        } else if (requestInfo.method === 'GET' && urlPath === '/') {
            // Serve a basic index.html for the root path, similar to express.static for the main entry point
            const webAssetsDirectory = pathModule.join(__dirname, 'web_assets'); // Renamed 'site' to 'web_assets'
            const indexPath = pathModule.join(webAssetsDirectory, 'index.html');
            try {
                const indexContent = await fileSystem.promises.readFile(indexPath);
                responseHandle.writeHead(200, { 'Content-Type': 'text/html' });
                responseHandle.end(indexContent);
            } catch (fileError) {
                // If index.html is not found, respond with a generic 404 JSON
                sendJsonResponse(404, { outcome: false, explanation: 'Root web asset not found.' });
            }
        }
        else {
            sendJsonResponse(404, { outcome: false, explanation: 'Requested endpoint not found.' });
        }
    } catch (globalError) {
        console.error('Unhandled server processing error:', globalError);
        sendJsonResponse(500, { outcome: false, explanation: 'An unexpected server error occurred.', details: globalError.message });
    }
});

// Start the HTTP server
httpApplication.listen(process.env.PORT_NUMBER || 8080, () => {
    console.log(`Application online, listening on port ${process.env.PORT_NUMBER || 8080}`);
});
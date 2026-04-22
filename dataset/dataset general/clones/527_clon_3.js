const sysUtils = require('util');
const fileSystem = require('fs');
const xmlProcessor = require("../third_party/sax-js/lib/sax");
const filePaths = require("path");
const networkClient = require("http");
const eventEmitters = require("events");
const webUrls = require("url");
const feedContentParser = require("./atom");
const queryBuilder = require('querystring');
const httpsClient = require('https'); // Explicitly require https for secure connections

/**
 * Utility function to remove leading and trailing whitespace from a string.
 * @param {string} inputString - The string to trim.
 * @returns {string} The trimmed string.
 */
const stripWhitespace = (inputString) => {
    if (typeof inputString !== 'string') {
        console.warn("stripWhitespace received non-string input, returning as-is.");
        return inputString;
    }
    return inputString.trim(); // Modern JavaScript has String.prototype.trim()
};

/**
 * Helper function for parsing query strings into an object.
 * Handles duplicate keys by keeping the last value or joining them (not implemented here, simple overwrite).
 * @param {string} queryString - The raw query string (e.g., "key1=val1&key2=val2").
 * @returns {Object<string, string>} An object mapping query parameter names to their values.
 */
const parseQueryParameters = (queryString) => {
    const parameters = {};
    if (!queryString || typeof queryString !== 'string') {
        return parameters;
    }
    for (const segment of queryString.split("&")) {
        const parts = segment.split("=");
        if (parts.length >= 1) {
            const key = parts[0];
            const value = parts.slice(1).join('='); // Handle cases where value itself contains '='
            parameters[key] = decodeURIComponent(value || '');
        }
    }
    return parameters;
};

// Represents a service for managing web subscriptions and notifications.
class SubscriptionManager {
    /**
     * Initializes a new SubscriptionManager instance.
     * @param {number} [notificationPort=8000] - The port for receiving callback notifications.
     * @param {boolean} [asynchronousMode=false] - Whether to use asynchronous verification (true) or synchronous (false).
     */
    constructor(notificationPort = 8000, asynchronousMode = false) {
        // Validate the provided port number
        if (typeof notificationPort !== 'number' || notificationPort <= 0 || notificationPort > 65535) {
            console.warn(`Invalid notification port: ${notificationPort}. Defaulting to 8000.`);
            this.notificationEndpointPort = 8000;
        } else {
            this.notificationEndpointPort = notificationPort;
        }

        // Determine the verification mode based on the asynchronous flag.
        // 'async' implies the hub will verify out-of-band; 'sync' means immediate verification.
        this.verificationStrategy = asynchronousMode ? 'async' : 'sync';

        // Stores event dispatchers for each subscribed topic, keyed by topic URL.
        this.topicDispatchers = new Map(); // Using Map for better performance/semantics than plain object

        // Holds the HTTP server instance once it's started.
        this.notificationServer = null;
    }

    /**
     * Generates the URI for the callback endpoint this manager listens on.
     * @returns {string} The full callback URI.
     */
    generateNotificationEndpoint() {
        // For production, this should ideally be a configurable public hostname or IP.
        // Using localhost for local development/testing purposes.
        const hostIdentifier = 'localhost'; // This could be an environment variable or configuration setting
        return `http://${hostIdentifier}:${this.notificationEndpointPort}/`;
    }

    /**
     * Initiates a subscription request to a PubSubHubbub broker.
     * @param {webUrls.URL} resourceIdentifier - The URL of the topic to subscribe to.
     * @param {webUrls.URL} brokerEndpoint - The URL of the PubSubHubbub hub.
     * @param {webUrls.URL} notificationEndpoint - The URL where notifications will be sent.
     * @param {Function} onSuccess - Callback function for successful subscription.
     * @param {Function} onError - Callback function for subscription errors.
     */
    requestSubscription(resourceIdentifier, brokerEndpoint, notificationEndpoint, onSuccess, onError) {
        // Basic input validation
        if (!resourceIdentifier || !(resourceIdentifier instanceof webUrls.URL) ||
            !brokerEndpoint || !(brokerEndpoint instanceof webUrls.URL) ||
            !notificationEndpoint || !(notificationEndpoint instanceof webUrls.URL)) {
            return onError(new Error("Invalid or missing URI parameters for subscription. Must be URL objects."));
        }
        if (typeof onSuccess !== 'function' || typeof onError !== 'function') {
            return console.error("Invalid success or error callbacks provided for subscription request.");
        }

        // Define constants for subscription parameters
        const SUBSCRIPTION_MODE = "subscribe";
        const DEFAULT_LEASE_SECONDS = 0; // 0 for default or indefinite lease
        const EMPTY_SECRET = '';
        const EMPTY_VERIFY_TOKEN = '';

        // Construct the payload for the subscription request
        const subscriptionPayload = [
            `hub.callback=${queryBuilder.escape(notificationEndpoint.href)}`,
            `hub.mode=${queryBuilder.escape(SUBSCRIPTION_MODE)}`,
            `hub.topic=${queryBuilder.escape(resourceIdentifier.href)}`,
            `hub.verify=${queryBuilder.escape(this.verificationStrategy)}`,
            `hub.lease_seconds=${queryBuilder.escape(DEFAULT_LEASE_SECONDS.toString())}`,
            `hub.secret=${queryBuilder.escape(EMPTY_SECRET)}`,
            `hub.verify_token=${queryBuilder.escape(EMPTY_VERIFY_TOKEN)}`
        ].join("&");

        // Determine the appropriate HTTP module based on broker's protocol
        const protocolModule = brokerEndpoint.protocol === 'https:' ? httpsClient : networkClient;
        const brokerPort = brokerEndpoint.port ? parseInt(brokerEndpoint.port, 10) : (brokerEndpoint.protocol === 'https:' ? 443 : 80);

        // Construct the request options
        const requestOptions = {
            hostname: brokerEndpoint.hostname,
            port: brokerPort,
            path: brokerEndpoint.pathname + brokerEndpoint.search,
            method: 'POST',
            headers: {
                "Host": brokerEndpoint.hostname,
                "Accept": "*/*",
                "Content-Length": Buffer.byteLength(subscriptionPayload, 'utf8'), // Use Buffer.byteLength for byte count
                "Content-Type": "application/x-www-form-urlencoded"
            },
            timeout: 5000 // Add a timeout for the request
        };

        // Create the HTTP/HTTPS request
        const brokerRequest = protocolModule.request(requestOptions, (serverResponse) => {
            let receivedData = "";
            serverResponse.setEncoding('utf8'); // Use setEncoding instead of setBodyEncoding

            serverResponse.on('data', (dataChunk) => {
                receivedData += dataChunk;
            });

            serverResponse.on('end', () => {
                const responseCode = serverResponse.statusCode;
                if (responseCode === 202 || responseCode === 204) {
                    // 202: Accepted (async verification pending)
                    // 204: No Content (sync verification successful)
                    onSuccess();
                } else {
                    // Any other response code indicates an error
                    onError(new Error(`Subscription to ${brokerEndpoint.href} failed with status ${responseCode}: ${receivedData}`));
                }
            });
        });

        // Handle request errors (e.g., network issues, timeouts)
        brokerRequest.on('error', (requestError) => {
            onError(new Error(`Network error during subscription to ${brokerEndpoint.href}: ${requestError.message}`));
        });

        brokerRequest.on('timeout', () => {
            brokerRequest.destroy();
            onError(new Error(`Subscription request to ${brokerEndpoint.href} timed out.`));
        });

        // Send the payload and finalize the request
        brokerRequest.write(subscriptionPayload);
        brokerRequest.end(); // Use .end() instead of .close() for http.ClientRequest
    }

    /**
     * Associates an event dispatcher with a specific topic URI.
     * This allows clients to listen for updates related to that topic.
     * @param {webUrls.URL} resourceIdentifier - The URI of the topic.
     * @param {eventEmitters.EventEmitter} resourceEvents - The event emitter for this topic.
     */
    associateEventDispatcher(resourceIdentifier, resourceEvents) {
        if (!resourceIdentifier || !(resourceIdentifier instanceof webUrls.URL) || !resourceEvents) {
            console.warn("Attempted to register null/undefined resource identifier or event dispatcher.");
            return;
        }
        if (!(resourceEvents instanceof eventEmitters.EventEmitter)) {
            console.warn(`Provided resourceEvents for ${resourceIdentifier.href} is not an EventEmitter instance. Registration aborted.`);
            return;
        }
        this.topicDispatchers.set(resourceIdentifier.href, resourceEvents);
        console.log(`Event dispatcher registered for topic: ${resourceIdentifier.href}`);
    }

    /**
     * Initiates monitoring for a specific resource, fetching its Atom feed
     * to discover the hub and then subscribing to updates.
     * @param {webUrls.URL} resourceIdentifier - The URL of the resource (e.g., Atom feed) to monitor.
     * @returns {eventEmitters.EventEmitter} An event emitter specific to this resource for 'subscribed', 'error', or 'update' events.
     */
    monitorResource(resourceIdentifier) {
        if (!resourceIdentifier || !(resourceIdentifier instanceof webUrls.URL)) {
            console.error("Invalid resource identifier provided for monitoring. Must be a URL object.");
            return new eventEmitters.EventEmitter(); // Return a dummy emitter to prevent crashes
        }

        const selfInstance = this; // Capture 'this' for use in nested callbacks
        const resourceEvents = new eventEmitters.EventEmitter(); // Emitter for this specific topic

        const protocolModule = resourceIdentifier.protocol === 'https:' ? httpsClient : networkClient;
        const resourcePort = resourceIdentifier.port ? parseInt(resourceIdentifier.port, 10) : (resourceIdentifier.protocol === 'https:' ? 443 : 80);

        const requestOptions = {
            hostname: resourceIdentifier.hostname,
            port: resourcePort,
            path: resourceIdentifier.pathname + resourceIdentifier.search,
            method: 'GET',
            headers: {
                "Host": resourceIdentifier.hostname,
                "Accept": "application/atom+xml, application/xml, text/xml, */*" // More specific Accept header
            },
            timeout: 5000
        };

        const resourceRequest = protocolModule.request(requestOptions, (serverResponse) => {
            let receivedFeedContent = "";
            serverResponse.setEncoding('utf8');

            serverResponse.on('data', (dataChunk) => {
                receivedFeedContent += dataChunk;
            });

            serverResponse.on('end', () => {
                if (serverResponse.statusCode !== 200) {
                    resourceEvents.emit('error', new Error(`Failed to fetch resource ${resourceIdentifier.href}. Status: ${serverResponse.statusCode} ${serverResponse.statusMessage}`));
                    return;
                }

                // Callback to process the fetched Atom feed and initiate subscription
                const processFeedAndSubscribe = (parsedFeed) => {
                    const hubLink = parsedFeed.getLinksByRel('hub')[0];
                    if (!hubLink || !hubLink.href) {
                        resourceEvents.emit('error', new Error(`No 'hub' link found in feed for ${resourceIdentifier.href}. Cannot subscribe.`));
                        return;
                    }
                    try {
                        const brokerLink = new webUrls.URL(hubLink.href);
                        const notificationLink = new webUrls.URL(selfInstance.generateNotificationEndpoint());

                        selfInstance.requestSubscription(
                            resourceIdentifier,
                            brokerLink,
                            notificationLink,
                            () => {
                                resourceEvents.emit('subscribed', resourceIdentifier.href);
                                selfInstance.associateEventDispatcher(resourceIdentifier, resourceEvents);
                                console.log(`Successfully initiated subscription for ${resourceIdentifier.href}.`);
                            },
                            (subscriptionError) => {
                                resourceEvents.emit('error', new Error(`Subscription failed for ${resourceIdentifier.href}: ${subscriptionError.message}`));
                            }
                        );
                    } catch (urlError) {
                        resourceEvents.emit('error', new Error(`Error parsing hub or callback URL for ${resourceIdentifier.href}: ${urlError.message}`));
                    }
                };

                // Parse the Atom feed content
                feedContentParser.parse(receivedFeedContent, processFeedAndSubscribe);
            });
        });

        resourceRequest.on('error', (requestError) => {
            resourceEvents.emit('error', new Error(`Network error monitoring resource ${resourceIdentifier.href}: ${requestError.message}`));
        });

        resourceRequest.on('timeout', () => {
            resourceRequest.destroy();
            resourceEvents.emit('error', new Error(`Resource request for ${resourceIdentifier.href} timed out.`));
        });

        resourceRequest.end(); // Finalize and send the request

        return resourceEvents;
    }

    /**
     * Initiates the HTTP server to listen for incoming PubSubHubbub verification
     * and content update requests from hubs. This method must be called for
     * subscriptions to be confirmed and for updates to be received.
     */
    initiateNotificationServer() {
        // Ensure the server is not started multiple times
        if (this.notificationServer) {
            console.warn("Notification server is already running.");
            return;
        }

        console.log(`Starting PubSubHubbub notification server on port ${this.notificationEndpointPort}.`);
        const selfInstance = this; // Reference to the SubscriptionManager instance

        this.notificationServer = networkClient.createServer((incomingRequest, serverResponse) => {
            const requestMethod = incomingRequest.method;
            // Create a full URL object for easier parsing, assuming localhost for the server's base.
            const requestUrl = new webUrls.URL(incomingRequest.url, `http://localhost:${selfInstance.notificationEndpointPort}`);

            if (requestMethod === 'GET') {
                // Handle subscription verification requests (GET method)
                const requestParameters = parseQueryParameters(requestUrl.search.substring(1)); // Use the helper function

                const hubChallenge = requestParameters['hub.challenge'];
                const hubMode = requestParameters['hub.mode'];
                const hubTopic = requestParameters['hub.topic'];

                // Log received verification parameters for debugging
                console.log(`Received GET verification request: Mode=${hubMode}, Topic=${hubTopic}, Challenge=${hubChallenge || 'N/A'}`);

                // Respond with the hub.challenge to verify the subscription
                if (hubChallenge) {
                    serverResponse.writeHead(200, { 'Content-Type': 'text/plain' });
                    serverResponse.end(hubChallenge);
                    console.log(`Verification successful for topic: ${hubTopic}`);
                } else {
                    serverResponse.writeHead(400, { 'Content-Type': 'text/plain' });
                    serverResponse.end("Missing 'hub.challenge' parameter in verification request.");
                    console.error(`Verification failed: Missing hub.challenge for topic: ${hubTopic}`);
                }
            } else if (requestMethod === 'POST') {
                // Handle content update notifications (POST method)
                console.log("Received POST request from hub (content update).");
                let receivedPayload = '';
                incomingRequest.setEncoding('utf8');

                incomingRequest.on('data', (dataChunk) => {
                    receivedPayload += dataChunk;
                });

                incomingRequest.on('end', () => {
                    serverResponse.writeHead(200, { 'Content-Type': 'text/plain' }); // Acknowledge receipt
                    serverResponse.end('Notification received and being processed.');

                    // Process the Atom feed update
                    feedContentParser.parse(receivedPayload, (updatedFeed) => {
                        const topicId = stripWhitespace(updatedFeed.id); // Use the renamed trim function
                        const topicDispatcher = selfInstance.topicDispatchers.get(topicId);

                        if (topicDispatcher) {
                            topicDispatcher.emit('update', updatedFeed);
                            console.log(`Dispatched update for topic: ${topicId}`);
                        } else {
                            console.warn(`No active dispatcher found for topic ID: ${topicId}. Update might be for an unsubscribed or unknown topic.`);
                        }
                    });
                });

                incomingRequest.on('error', (err) => {
                    console.error(`Error during POST request processing: ${err.message}`);
                    if (!serverResponse.headersSent) { // Prevent setting headers if already sent
                        serverResponse.writeHead(500, { 'Content-Type': 'text/plain' });
                        serverResponse.end('Internal Server Error during notification processing.');
                    }
                });

            } else {
                // Handle unsupported methods
                serverResponse.writeHead(405, { 'Content-Type': 'text/plain', 'Allow': 'GET, POST' });
                serverResponse.end('Method Not Allowed');
                console.warn(`Received unsupported HTTP method: ${requestMethod}`);
            }
        });

        this.notificationServer.listen(this.notificationEndpointPort, () => {
            console.log(`Notification server is actively listening on port ${this.notificationEndpointPort}.`);
        }).on('error', (serverErr) => {
            console.error(`Failed to start notification server on port ${this.notificationEndpointPort}: ${serverErr.message}`);
            this.notificationServer = null; // Reset server reference on error
            // It's critical if the server can't start, so re-throw.
            throw new Error(`Critical: Notification server failed to start: ${serverErr.message}`);
        });
    }

    /**
     * Stops the currently running notification server.
     * @returns {Promise<void>} A promise that resolves when the server is closed.
     */
    async stopNotificationServer() {
        if (this.notificationServer) {
            return new Promise((resolve, reject) => {
                this.notificationServer.close((err) => {
                    if (err) {
                        console.error(`Error stopping notification server: ${err.message}`);
                        return reject(err);
                    }
                    console.log("Notification server stopped successfully.");
                    this.notificationServer = null;
                    resolve();
                });
            });
        }
        console.info("No notification server is currently running to stop.");
        return Promise.resolve();
    }
}

/**
 * A placeholder class for managing content publishing to PubSubHubbub hubs.
 * This functionality is not fully implemented in this version.
 */
class ContentPublisher {
    constructor() {
        console.warn("ContentPublisher is currently a stub. Publishing functionality is not yet implemented.");
    }

    /**
     * Publishes an Atom feed to its associated PubSubHubbub hub.
     * This method is currently a placeholder and performs no actual network operations.
     * @param {Object} feedDocument - The Atom feed object to publish.
     * @returns {Promise<void>} A promise that resolves when publishing is theoretically complete (or rejects on failure).
     */
    async distributeFeed(feedDocument) {
        console.info("Attempted to distribute feed, but ContentPublisher.distributeFeed is not implemented. (Feed ID: " + (feedDocument && feedDocument.id ? feedDocument.id : 'N/A') + ")");
        // In a real implementation, this would involve:
        // 1. Extracting the self link and hub link from the `feedDocument`.
        // 2. Constructing a POST request to the hub's endpoint.
        // 3. Sending the Atom feed content as the request body.
        // 4. Handling the hub's response (e.g., 204 No Content for success).
        // For now, we return a resolved promise as a no-op.
        return Promise.resolve();
    }
}

module.exports.SubscriptionManager = SubscriptionManager;
module.exports.ContentPublisher = ContentPublisher;
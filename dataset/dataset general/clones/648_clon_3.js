const netUtility = require('net'); // Renamed redis to netUtility (placeholder, as redis isn't directly used here, only implied)
const webSocketServer = require('sockjs'); // Renamed sockjs
const arrayUtility = require('lodash'); // Renamed underscore to lodash (similar utility library)
const inputValidator = require('validator'); // Renamed validator

// Encapsulating the worker logic within an immediately invoked function expression (IIFE)
// for better scope management and to return the primary class.
(function() {
    // A mapping of active communication channels, indexed by their unique identifiers.
    // This structure holds details about subscribers and message history for each channel.
    let activeChannels = {};

    // The core WebSocket server instance managed by SockJS.
    // This handles incoming client connections and message routing.
    let currentSocketServer;

    /**
     * Constructs a new ServiceWorker instance to manage WebSocket connections.
     *
     * @param {number} serverPort - The network port on which the server will listen.
     * @param {string} [clientJsUrl] - Optional URL for the SockJS client-side library.
     * @param {object} [securityOptions] - Optional SSL/TLS configuration for secure connections.
     */
    function ServiceWorker(serverPort, clientJsUrl, securityOptions) {
        // Define a set of log severities that are permitted to be displayed in the console.
        const permittedLogSeverities = ['error', 'warn'];
        // Initialize an options object for the SockJS server configuration.
        const serverConfiguration = {};

        // Custom logging function for SockJS, filtering messages based on severity.
        serverConfiguration.log = (level, messageText) => {
            // Only log messages if their severity is included in the allowed list.
            if (permittedLogSeverities.includes(level)) {
                // Prepend severity to the message for clarity.
                console.warn(`[${level.toUpperCase()}] :: ${messageText}`);
            }
        };

        // If a client-side SockJS URL is provided, configure it for the server.
        // This allows clients to easily load the necessary JavaScript.
        if (clientJsUrl && typeof clientJsUrl === 'string' && clientJsUrl.length > 0) {
            serverConfiguration.sockjs_url = clientJsUrl;
        } else {
            // Provide a default or fallback if not explicitly set, or remove for strict usage.
            // For this clone, we'll ensure it's either set or absent, not just empty.
            delete serverConfiguration.sockjs_url;
        }

        // Create the SockJS server instance with the specified configurations.
        currentSocketServer = webSocketServer.createServer(serverConfiguration);
        // Begin listening for incoming connections on the specified port.
        startListening(serverPort, securityOptions);
    }

    /**
     * Handles incoming internal events, directing them to appropriate downstream handlers.
     * These events typically originate from other parts of the application or system.
     *
     * @param {string} eventIdentifier - A string identifying the type of event.
     * @param {object} eventPayload - The data associated with the event.
     */
    ServiceWorker.prototype.routeInternalEvent = function(eventIdentifier, eventPayload) {
        // Validate the incoming event identifier to ensure it's a string.
        if (typeof eventIdentifier !== 'string' || eventIdentifier.trim() === '') {
            console.error(`Invalid or empty event identifier received: "${eventIdentifier}"`);
            return; // Exit if the event identifier is not valid.
        }

        // Use an if-else if chain for event routing, as an alternative to switch.
        if (eventIdentifier === 'broadcast-message') {
            // Delegate to the function responsible for broadcasting messages to channels.
            distributeChannelBroadcast(eventPayload.channel, eventPayload.messageType, eventPayload.messageData);
        } else if (eventIdentifier === 'query-status') {
            // Request an update on the current server status and active channels.
            reportStatusUpdate(eventPayload.requestKey, retrieveChannelSummary());
        } else {
            // Log an error for any unrecognized event types.
            console.warn(`Unrecognized internal event type encountered: "${eventIdentifier}"`);
        }
    };

    /**
     * Distributes a message to all subscribers of a specific channel.
     *
     * @param {string} targetChannelId - The unique identifier of the channel.
     * @param {string} messageType - The type of message (e.g., 'data', 'notification').
     * @param {object} messageContent - The actual data payload to be sent.
     */
    const distributeChannelBroadcast = (targetChannelId, messageType, messageContent) => {
        // Retrieve the channel object from the global map.
        const currentChannel = activeChannels[targetChannelId];

        // If the channel does not exist, there's nothing to broadcast to.
        if (!currentChannel) {
            console.debug(`Attempted to broadcast to non-existent channel: ${targetChannelId}`);
            return;
        }

        // Construct the full message object to be sent to clients.
        const outgoingMessage = {
            channel: targetChannelId,
            event: messageType,
            data: messageContent
        };

        // Store the message in the channel's history, along with a timestamp.
        // This allows new subscribers to receive recent messages.
        currentChannel.messageHistory.push({
            timestamp: new Date().getTime(),
            payload: outgoingMessage
        });

        // Maintain a limited history size (e.g., last 15 messages).
        // Remove older messages if the history exceeds the limit.
        const maxHistorySize = 15;
        if (currentChannel.messageHistory.length > maxHistorySize) {
            currentChannel.messageHistory.splice(0, currentChannel.messageHistory.length - maxHistorySize);
        }

        // Iterate over each subscriber in the channel and send them the message.
        currentChannel.connectedClients.forEach(client => {
            try {
                // Convert the message object to a JSON string for transmission over WebSocket.
                client.socketConnection.write(JSON.stringify(outgoingMessage));
            } catch (err) {
                console.error(`Failed to send message to client ${client.socketConnection.id} on channel ${targetChannelId}: ${err.message}`);
                // Optionally, could attempt to disconnect problematic clients here.
            }
        });
    };

    /**
     * Sends an upstream message to the parent process.
     *
     * @param {string} clientRef - A unique identifier for the client.
     * @param {object} clientData - The data associated with the client.
     */
    const dispatchClientNotification = (clientRef, clientData) => {
        // Communicate with the parent process, indicating a client message.
        process.send({
            messageType: 'client-data-relay',
            payload: {
                clientKey: clientRef,
                dataContent: clientData
            }
        });
    };

    /**
     * Notifies the parent process that a client has subscribed to a channel.
     *
     * @param {string} channelKey - The identifier of the channel.
     * @param {string} subscriberId - The unique ID of the subscribing client.
     * @param {object} subscriptionDetails - Additional data related to the subscription.
     */
    const notifySubscriptionEvent = (channelKey, subscriberId, subscriptionDetails) => {
        // Send a message to the parent process about the new subscription.
        process.send({
            messageType: 'subscription-added',
            payload: {
                channel: channelKey,
                clientKey: subscriberId,
                details: subscriptionDetails
            }
        });
    };

    /**
     * Informs the parent process when a client unsubscribes from a channel.
     *
     * @param {string} channelKey - The identifier of the channel.
     * @param {string} subscriberId - The unique ID of the unsubscribing client.
     */
    const notifyUnsubscriptionEvent = (channelKey, subscriberId) => {
        // Send a message to the parent process about the unsubscription.
        process.send({
            messageType: 'subscription-removed',
            payload: {
                channel: channelKey,
                clientKey: subscriberId
            }
        });
    };

    /**
     * Sends the current status of channels to the parent process in response to a request.
     *
     * @param {number} reqId - The identifier of the status request.
     * @param {object} channelInformation - An object containing details of all active channels.
     */
    const reportStatusUpdate = (reqId, channelInformation) => {
        // Dispatch the status report to the parent process.
        process.send({
            messageType: 'status-report',
            payload: {
                requestId: reqId,
                channelDetails: channelInformation
            }
        });
    };

    /**
     * Gathers and returns a summary of all active channels and their subscribers.
     *
     * @returns {object} An object where keys are channel IDs and values are arrays of subscriber data.
     */
    const retrieveChannelSummary = () => {
        const summaryData = {};
        // Iterate over each channel in the activeChannels map.
        Object.entries(activeChannels).forEach(([chanId, chanObj]) => {
            // For each channel, map its subscribers to a simplified data structure.
            summaryData[chanId] = chanObj.connectedClients.map(client => ({
                clientId: client.socketConnection.id,
                clientMetadata: client.clientData,
                joinedTimestamp: client.subscriptionTime
            }));
        });
        return summaryData;
    };

    /**
     * Initializes the server to listen for incoming SockJS connections.
     * This function sets up event handlers for new connections, data, and disconnections.
     *
     * @param {number} listenPort - The port number to bind the server to.
     * @param {object} [securityOpts] - Optional SSL/TLS configuration.
     */
    const startListening = (listenPort, securityOpts) => {
        // Event handler for new client connections.
        currentSocketServer.on('connection', clientConnection => {
            // Guard clause: if the connection object is null or invalid, log an error and exit.
            // This can happen in rare edge cases or during specific network conditions.
            if (!clientConnection || !clientConnection.id) {
                console.error('Received an invalid or null WebSocket client connection.');
                return;
            }

            // Keep track of all channels this specific client is subscribed to.
            let clientSubscribedChannels = [];

            /**
             * Handles the process of a client unsubscribing from a channel.
             *
             * @param {string} targetChannelId - The ID of the channel to unsubscribe from.
             */
            const unsubscribeClient = channelToUnsubscribe => {
                // Filter out the specified channel from the client's subscribed list.
                clientSubscribedChannels = clientSubscribedChannels.filter(id => id !== channelToUnsubscribe);

                const channelObject = activeChannels[channelToUnsubscribe];
                if (!channelObject) {
                    console.debug(`Attempted to unsubscribe from non-existent channel: ${channelToUnsubscribe}`);
                    return;
                }

                // Notify the parent process about the unsubscription.
                notifyUnsubscriptionEvent(channelToUnsubscribe, clientConnection.id);

                // Remove the client from the channel's list of subscribers.
                channelObject.connectedClients = channelObject.connectedClients.filter(
                    sub => sub.socketConnection !== clientConnection
                );

                // If the channel now has no subscribers, set a timeout to close it.
                // This prevents empty channels from persisting indefinitely.
                const channelCleanupDelay = 12000; // 12 seconds
                if (channelObject.connectedClients.length === 0) {
                    channelObject.cleanupTimer = setTimeout(() => {
                        console.log(`Cleaning up empty channel: ${channelToUnsubscribe}`);
                        delete activeChannels[channelToUnsubscribe];
                    }, channelCleanupDelay);
                }
            };

            /**
             * Manages a client's subscription to a specific channel.
             *
             * @param {string} targetChannelId - The ID of the channel to subscribe to.
             * @param {object} subscriberInfo - Data associated with the subscriber.
             * @param {number} [startMessageTime] - Timestamp to retrieve messages from history.
             */
            const subscribeClient = (targetChannelId, subscriberInfo, startMessageTime) => {
                // Prevent duplicate subscriptions for the same client and channel.
                if (clientSubscribedChannels.includes(targetChannelId)) {
                    console.debug(`Client ${clientConnection.id} is already subscribed to ${targetChannelId}`);
                    return;
                }

                // Record the subscription time, defaulting to the current time if not provided.
                const subscriptionInitiationTime = startMessageTime || new Date().getTime();
                // Add the channel to the client's list of active subscriptions.
                clientSubscribedChannels.push(targetChannelId);

                // If the channel doesn't exist, create it with initial properties.
                if (!activeChannels[targetChannelId]) {
                    activeChannels[targetChannelId] = {
                        connectedClients: [],
                        messageHistory: [],
                        cleanupTimer: null
                    };
                }

                const channelReference = activeChannels[targetChannelId];
                // Clear any pending cleanup timer for the channel, as it's now active.
                clearTimeout(channelReference.cleanupTimer);

                // Add the new subscriber to the channel's list.
                channelReference.connectedClients.push({
                    socketConnection: clientConnection,
                    clientData: subscriberInfo,
                    subscriptionTime: new Date().getTime()
                });

                // Send historical messages to the new subscriber, starting from the specified timestamp.
                channelReference.messageHistory.forEach(msgEntry => {
                    if (msgEntry.timestamp > subscriptionInitiationTime) {
                        clientConnection.write(JSON.stringify(msgEntry.payload));
                    }
                });

                // Notify the parent process about the new subscription.
                notifySubscriptionEvent(targetChannelId, clientConnection.id, subscriberInfo);
            };

            /**
             * Handles a client's request to publish a message to a channel.
             * This message is then forwarded to the parent process for broader distribution.
             *
             * @param {string} targetChannelId - The channel to publish to.
             * @param {string} messageEvent - The event type of the message.
             * @param {object} messagePayload - The data payload of the message.
             */
            const publishClientMessage = (targetChannelId, messageEvent, messagePayload) => {
                // Ensure the channel exists before attempting to publish.
                if (!activeChannels[targetChannelId]) {
                    console.warn(`Client ${clientConnection.id} attempted to publish to non-existent channel: ${targetChannelId}`);
                    return;
                }

                // Prepend 'client-' to the event name to distinguish client-originated events.
                const fullEventName = `client-origin-${messageEvent}`;
                // Forward the publication request to the parent process.
                process.send({
                    messageType: 'upstream-publish',
                    payload: {
                        channel: targetChannelId,
                        eventName: fullEventName,
                        message: messagePayload
                    }
                });
            };

            /**
             * Processes a generic message from a client, forwarding it upstream.
             *
             * @param {string} senderKey - The unique key of the client sending the message.
             * @param {object} messageData - The content of the message.
             */
            const relayClientMessage = (senderKey, messageData) => {
                // Delegate to the generic client notification dispatcher.
                dispatchClientNotification(senderKey, messageData);
            };

            // Event handler for incoming data from the client connection.
            clientConnection.on('data', rawData => {
                let parsedClientData;
                try {
                    // Attempt to parse the incoming raw data as JSON.
                    parsedClientData = JSON.parse(rawData);

                    // Basic validation for the presence of an 'action' field.
                    if (!parsedClientData || !parsedClientData.action || typeof parsedClientData.action !== 'string') {
                        throw new Error('Missing or invalid `action` field in client data.');
                    }

                    const actionPayload = parsedClientData.payload; // Renamed eventData to actionPayload

                    // Use an extended validation check for actionPayload.
                    const isValidPayload = (obj) => obj && typeof obj === 'object';
                    if (!isValidPayload(actionPayload)) {
                        console.warn(`Client ${clientConnection.id} sent action with invalid payload: ${JSON.stringify(parsedClientData)}`);
                        return; // Skip processing if payload is malformed.
                    }

                    // Route client actions based on the 'action' field.
                    switch (parsedClientData.action) {
                        case 'subscribe':
                            // Validate required fields for a 'subscribe' action.
                            if (!inputValidator.isString(actionPayload.channelId) ||
                                !inputValidator.isObject(actionPayload.clientDetails) || // Check if it's an object
                                !inputValidator.isInt(`${actionPayload.startFrom}`)) { // Ensure it's an integer string
                                throw new Error(`Invalid or missing data for 'subscribe' action: ${JSON.stringify(actionPayload)}`);
                            }
                            subscribeClient(actionPayload.channelId, actionPayload.clientDetails, parseInt(actionPayload.startFrom, 10));
                            break;

                        case 'unsubscribe':
                            // Validate required fields for an 'unsubscribe' action.
                            if (!inputValidator.isString(actionPayload.channelId)) {
                                throw new Error(`Invalid or missing 'channelId' for 'unsubscribe' action: ${JSON.stringify(actionPayload)}`);
                            }
                            unsubscribeClient(actionPayload.channelId);
                            break;

                        case 'send_message': // Renamed 'message' to 'send_message'
                            // Validate required fields for a 'send_message' action.
                            if (!inputValidator.isObject(actionPayload.messageContent)) { // Ensure it's an object
                                throw new Error(`Invalid or missing 'messageContent' for 'send_message' action: ${JSON.stringify(actionPayload)}`);
                            }
                            relayClientMessage(clientConnection.id, actionPayload.messageContent);
                            break;

                        case 'publish_to_channel': // Renamed 'publish' to 'publish_to_channel'
                            // Validate required fields for a 'publish_to_channel' action.
                            if (!inputValidator.isString(actionPayload.channelId) ||
                                !inputValidator.isString(actionPayload.eventType) ||
                                !inputValidator.isObject(actionPayload.messageData)) { // Ensure it's an object
                                throw new Error(`Invalid or missing data for 'publish_to_channel' action: ${JSON.stringify(actionPayload)}`);
                            }
                            publishClientMessage(actionPayload.channelId, actionPayload.eventType, actionPayload.messageData);
                            break;

                        default:
                            // Log an error for any unsupported or unknown client actions.
                            console.warn(`Client ${clientConnection.id} sent an unknown action: ${parsedClientData.action}`);
                            break;
                    }
                } catch (processingError) {
                    // Catch and log any errors during JSON parsing or action processing.
                    console.error(`Error processing incoming WebSocket data from ${clientConnection.id}: ${processingError.message}. Raw data: ${rawData}`);
                    // Optionally, send an error message back to the client or close the connection.
                    clientConnection.write(JSON.stringify({ error: 'Invalid message format or action', details: processingError.message }));
                }
            });

            // Event handler for when the client connection is closed.
            clientConnection.on('close', () => {
                console.log(`Client ${clientConnection.id} disconnected. Cleaning up subscriptions.`);
                // Iterate through all channels the client was subscribed to and unsubscribe them.
                clientSubscribedChannels.forEach(channelId => {
                    unsubscribeClient(channelId);
                });
                clientSubscribedChannels = []; // Clear the list after cleanup.
            });
        });

        let httpServerInstance;
        // Check if SSL/TLS options are provided to determine server type.
        if (securityOpts && Object.keys(securityOpts).length > 0) {
            httpServerInstance = require('https').createServer(securityOpts);
            console.log(`HTTPS server created for secure connections.`);
        } else {
            httpServerInstance = require('http').createServer();
            console.log(`HTTP server created for non-secure connections.`);
        }

        // Install the SockJS handlers onto the underlying HTTP/HTTPS server.
        currentSocketServer.installHandlers(httpServerInstance, {
            prefix: '/sockjs' // Use a specific prefix for SockJS connections.
        });

        // Start the HTTP/HTTPS server listening on the specified port.
        httpServerInstance.listen(listenPort, () => {
            console.log(`WebSocket server listening on port ${listenPort}`);
        });
    };

    return ServiceWorker; // Export the main ServiceWorker class.

})(); // End of IIFE
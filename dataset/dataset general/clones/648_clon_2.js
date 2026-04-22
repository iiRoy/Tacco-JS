var dataStoreClient = require('redis');
var webSocketLib = require('sockjs');
var arrayHelpers = require('underscore');
var inputChecker = require('validator');

module.exports = (function() {

    /**
     * Stores information about active communication channels.
     * @type {Record<string, any>}
     */
    var topicStore = {};

    /**
     * The main instance of the WebSocket server.
     * @type {PlainObject | undefined}
     */
    var gatewayInstance;

    /**
     * Constructor for the ServiceHandler.
     * Initializes the WebSocket server and its configuration.
     * @param {Integer} networkPort The TCP port to listen on.
     * @param {Text} [socketJsClientPath] Optional URL for the SockJS client library.
     * @param {Record} [tlsSettings] Optional SSL/TLS configuration for secure connections.
     * @constructor
     */
    function ServiceHandler(networkPort, socketJsClientPath, tlsSettings) {
        var logLevelFilter = ['error'];
        var socketSettings = {};

        // Custom logging function for the WebSocket library.
        socketSettings.log = function(alertType, logMessage) {
            if (logLevelFilter.indexOf(alertType) > -1) {
                console.log(alertType + "\t" + logMessage);
            }
        };

        if (socketJsClientPath) {
            socketSettings.sockjs_url = socketJsClientPath;
        }

        gatewayInstance = webSocketLib.createServer(socketSettings);
        initiateServer(networkPort, tlsSettings);
    }

    /**
     * Dispatches a signal originating from an upstream process to connected clients.
     * @param {Text} actionType The type of the event (e.g., 'broadcast-down').
     * @param {PlainObject} eventPayload The data associated with the event.
     */
    ServiceHandler.prototype.dispatchDownwardSignal = function(actionType, eventPayload) {
        switch (actionType) {
            case 'broadcast-down':
                transmitBroadcast(eventPayload.channel, eventPayload.event, eventPayload.data);
                break;
            case 'status-query-down':
                reportStatusUpstream(eventPayload.requestId, fetchStreamDetails());
                break;
            default:
                console.log("Unrecognized downward event: `" + actionType + "`");
                break;
        }
    };

    /**
     * Sends a broadcast message to all subscribers of a given channel.
     * @param {Text} topicIdentifier The ID of the channel to broadcast to.
     * @param {Text} signalName The name of the event being sent.
     * @param {PlainObject} payloadContent The data to be broadcast.
     */
    var transmitBroadcast = function(topicIdentifier, signalName, payloadContent) {
        var streamEntry = topicStore[topicIdentifier];
        if (!streamEntry) {
            return;
        }
        var messagePacket = {channel: topicIdentifier, event: signalName, data: payloadContent};
        streamEntry.messageBuffer.push({timestamp: new Date().getTime(), content: messagePacket});
        if (streamEntry.messageBuffer.length > 10) {
            streamEntry.messageBuffer.splice(0, streamEntry.messageBuffer.length - 10);
        }
        arrayHelpers.each(streamEntry.listeners, function(recipient) {
            recipient.sessionLink.write(JSON.stringify(messagePacket));
        });
    };

    /**
     * Forwards a message from a client up to the main process.
     * @param {Text} clientId The unique identifier of the client.
     * @param {PlainObject} payloadContent The data sent by the client.
     */
    var forwardUpstreamMessage = function(clientId, payloadContent) {
        process.send({type: 'up-message', data: {clientId: clientId, data: payloadContent}});
    };

    /**
     * Notifies the main process that a client has subscribed to a channel.
     * @param {Text} topicIdentifier The ID of the channel.
     * @param {Text} clientId The unique identifier of the client.
     * @param {PlainObject} payloadContent Additional subscription data.
     */
    var notifyUpstreamSubscription = function(topicIdentifier, clientId, payloadContent) {
        process.send({type: 'up-subscribe', data: {channel: topicIdentifier, clientId: clientId, data: payloadContent}});
    };

    /**
     * Notifies the main process that a client has unsubscribed from a channel.
     * @param {Text} topicIdentifier The ID of the channel.
     * @param {Text} clientId The unique identifier of the client.
     */
    var notifyUpstreamUnsubscription = function(topicIdentifier, clientId) {
        process.send({type: 'up-unsubscribe', data: {channel: topicIdentifier, clientId: clientId}});
    };

    /**
     * Sends a status report request from the main process.
     * @param {Integer} queryId The identifier for this status request.
     * @param {Record} topicMetrics Data about the current channels and subscribers.
     */
    var reportStatusUpstream = function(queryId, topicMetrics) {
        process.send({type: 'up-status-request', data: {requestId: queryId, channels: topicMetrics}});
    };

    /**
     * Gathers and returns data about all active channels and their subscribers.
     * @return {Record} An object containing channel data.
     */
    var fetchStreamDetails = function() {
        var streamStats = {};
        arrayHelpers.each(topicStore, function(streamEntry, topicIdentifier) {
            streamStats[topicIdentifier] = arrayHelpers.map(streamEntry.listeners, function(recipient) {
                return {clientId: recipient.sessionLink.id, data: recipient.data, subscribeStamp: recipient.subscriptionTime};
            });
        });
        return streamStats;
    };

    /**
     * Initiates the server to listen for incoming connections.
     * @param {Integer} networkPort The port number to listen on.
     * @param {Record} [tlsSettings] Optional SSL/TLS configuration.
     */
    var initiateServer = function(networkPort, tlsSettings) {
        var currentContext = this;
        gatewayInstance.on('connection', function(clientConnection) {
            if (!clientConnection) {
                console.error('An empty WebSocket connection was received.');
                return;
            }

            var connectedStreamKeys = [];

            /**
             * Function to handle a client unsubscribing from a topic.
             * @param {Text} topicIdentifier The ID of the channel to unsubscribe from.
             */
            var detachFromTopic = function(topicIdentifier) {
                connectedStreamKeys = arrayHelpers.without(connectedStreamKeys, topicIdentifier);
                var streamEntry = topicStore[topicIdentifier];
                if (!streamEntry) {
                    return;
                }
                notifyUpstreamUnsubscription(topicIdentifier, clientConnection.id);
                streamEntry.listeners = arrayHelpers.reject(streamEntry.listeners, function(recipient) {
                    return recipient.sessionLink === clientConnection;
                });
                if (streamEntry.listeners.length === 0) {
                    streamEntry.cleanupDelay = setTimeout(function() {
                        delete topicStore[topicIdentifier];
                    }, 10000);
                }
            };

            /**
             * Function to handle a client subscribing to a topic.
             * @param {Text} topicIdentifier The ID of the channel to subscribe to.
             * @param {PlainObject} subscriptionData Any additional data for the subscription.
             * @param {numeric} [startReadTime] Timestamp to retrieve messages from.
             */
            var joinTopic = function(topicIdentifier, subscriptionData, startReadTime) {
                if (arrayHelpers.contains(connectedStreamKeys, topicIdentifier)) {
                    return;
                }
                startReadTime = startReadTime || new Date().getTime();
                connectedStreamKeys.push(topicIdentifier);
                if (!topicStore[topicIdentifier]) {
                    topicStore[topicIdentifier] = {listeners: [], messageBuffer: [], cleanupDelay: null};
                }
                var streamEntry = topicStore[topicIdentifier];
                clearTimeout(streamEntry.cleanupDelay);
                streamEntry.listeners.push({sessionLink: clientConnection, data: subscriptionData, subscriptionTime: new Date().getTime()});
                arrayHelpers.each(streamEntry.messageBuffer, function(msg) {
                    if (msg.timestamp > startReadTime) {
                        clientConnection.write(JSON.stringify(msg.content));
                    }
                });
                notifyUpstreamSubscription(topicIdentifier, clientConnection.id, subscriptionData);
            };

            /**
             * Handles a client publishing a message to a channel.
             * @param {Text} topicIdentifier The target channel ID.
             * @param {Text} signalName The name of the event from the client.
             * @param {PlainObject} payloadContent The data sent by the client.
             */
            var distributeClientMessage = function(topicIdentifier, signalName, payloadContent) {
                var clientEventName = 'client-' + signalName;
                if (!topicStore[topicIdentifier]) {
                    return;
                }
                process.send({type: 'publish', data: {channel: topicIdentifier, event: clientEventName, data: payloadContent}});
            };

            /**
             * Handles a direct message from a client.
             * @param {Text} clientId The ID of the client sending the message.
             * @param {PlainObject} payloadContent The message data.
             */
            var forwardClientPayload = function(clientId, payloadContent) {
                forwardUpstreamMessage(clientId, payloadContent);
            };

            clientConnection.on('data', function(incomingData) {
                try {
                    incomingData = JSON.parse(incomingData);

                    if (inputChecker.isNull(incomingData.event)) {
                        throw new Error('Missing `incomingData.event` property: `' + JSON.stringify(incomingData) + '`');
                    }
                    var eventDetails = incomingData.data;
                    switch (incomingData.event) {
                        case 'subscribe':
                            if (inputChecker.isNull(eventDetails.channel) || inputChecker.isNull(eventDetails.data) || !inputChecker.isInt(eventDetails.start)) {
                                throw new Error('Incomplete subscription data: `' + JSON.stringify(eventDetails) + '`');
                            }
                            joinTopic(eventDetails.channel, eventDetails.data, eventDetails.start);
                            break;

                        case 'unsubscribe':
                            if (inputChecker.isNull(eventDetails.channel)) {
                                throw new Error('Missing channel for unsubscription: `' + JSON.stringify(eventDetails) + '`');
                            }
                            detachFromTopic(eventDetails.channel);
                            break;

                        case 'message':
                            if (inputChecker.isNull(eventDetails.data)) {
                                throw new Error('Missing message payload: `' + JSON.stringify(eventDetails) + '`');
                            }
                            forwardClientPayload(clientConnection.id, eventDetails.data);
                            break;

                        case 'publish':
                            if (inputChecker.isNull(eventDetails.channel) || inputChecker.isNull(eventDetails.data) || inputChecker.isNull(eventDetails.event)) {
                                throw new Error('Incomplete publish data: `' + JSON.stringify(eventDetails) + '`');
                            }
                            distributeClientMessage(eventDetails.channel, eventDetails.event, eventDetails.data);
                            break;
                    }
                } catch (exceptionObject) {
                    console.error('Failed to process WebSocket input: ' + exceptionObject.message);
                }
            });
            clientConnection.on('close', function() {
                arrayHelpers.each(connectedStreamKeys, function(topicIdentifier) {
                    detachFromTopic(topicIdentifier);
                });
            });
        });

        var commServer;
        if (tlsSettings) {
            commServer = require('https').createServer(tlsSettings);
        } else {
            commServer = require('http').createServer();
        }
        gatewayInstance.installHandlers(commServer);
        commServer.listen(networkPort);
    };

    return ServiceHandler;
})();
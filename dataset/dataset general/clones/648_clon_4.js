const { createServer: establishLink } = require('sockjs');
const https = require('https');
const http = require('http');
const process = require('process');
const redis = require('redis'); // Retained as per original dependencies, though not actively used in the provided snippet

/**
 * Manages inter-process communication for uplink signals.
 */
class InterProcessCommunicator {
    /**
     * Sends a message to the parent process.
     * @param {string} signalType The type of the signal.
     * @param {object} payload The data payload for the signal.
     */
    static _transmit(signalType, payload) {
        process.send({ type: signalType, data: payload });
    }

    /**
     * Signals client data to the parent process.
     * @param {string} agentId Identifier for the client.
     * @param {object} info Data from the client.
     */
    static signalClientData(agentId, info) {
        InterProcessCommunicator._transmit('up-message', { clientKey: agentId, data: info });
    }

    /**
     * Signals a client's subscription to the parent process.
     * @param {string} conduitId Identifier for the channel.
     * @param {string} agentId Identifier for the client.
     * @param {object} info Subscription data.
     */
    static signalSubscription(conduitId, agentId, info) {
        InterProcessCommunicator._transmit('up-subscribe', { channel: conduitId, clientKey: agentId, data: info });
    }

    /**
     * Signals a client's unsubscription to the parent process.
     * @param {string} conduitId Identifier for the channel.
     * @param {string} agentId Identifier for the client.
     */
    static signalUnsubscription(conduitId, agentId) {
        InterProcessCommunicator._transmit('up-unsubscribe', { channel: conduitId, clientKey: agentId });
    }

    /**
     * Signals a status query response to the parent process.
     * @param {number} queryId The request identifier.
     * @param {object} conduitStatus The aggregated status of all channels.
     */
    static signalStatusQuery(queryId, conduitStatus) {
        InterProcessCommunicator._transmit('up-status-request', { requestId: queryId, channels: conduitStatus });
    }
}

/**
 * Represents a single client connection and its interactions.
 */
class ClientSession {
    /**
     * Creates an instance of ClientSession.
     * @param {SockJS.Connection} socketConnection The underlying SockJS connection.
     * @param {ConduitManager} conduitManager The manager for all channels.
     */
    constructor(socketConnection, conduitManager) {
        this.connectionLink = socketConnection;
        this.conduitManager = conduitManager;
        this.activeConduits = new Set(); // Stores channel IDs this session is subscribed to

        this.connectionLink.on('data', this._processIncomingData.bind(this));
        this.connectionLink.on('close', this._terminateSession.bind(this));
    }

    /**
     * Processes incoming data from the client connection.
     * @param {string} payload The raw data string.
     * @private
     */
    _processIncomingData(payload) {
        try {
            const parsedData = JSON.parse(payload);
            if (typeof parsedData !== 'object' || parsedData === null || !parsedData.event) {
                throw new Error('Malformed incoming data: missing event field.');
            }

            const eventData = parsedData.data;
            const eventHandlers = new Map([
                ['subscribe', this._handleSubscription.bind(this)],
                ['unsubscribe', this._handleUnsubscription.bind(this)],
                ['message', this._handleClientMessage.bind(this)],
                ['publish', this._handleClientBroadcast.bind(this)]
            ]);

            const handler = eventHandlers.get(parsedData.event);
            if (handler) {
                handler(eventData);
            } else {
                console.error(`Unrecognized client event received: ${parsedData.event}`);
            }
        } catch (error) {
            console.error(`Error decoding or processing client data: ${error.message}`);
        }
    }

    /**
     * Handles a client subscription request.
     * @param {object} eventData The subscription data.
     * @private
     */
    _handleSubscription(eventData) {
        if (!eventData || !eventData.channel || eventData.data === undefined || !Number.isInteger(eventData.start)) {
            throw new Error(`Invalid subscription data: ${JSON.stringify(eventData)}`);
        }
        const { channel, data, start } = eventData;
        if (this.activeConduits.has(channel)) return;

        this.activeConduits.add(channel);
        const conduit = this.conduitManager.accessConduit(channel);
        const memberWrapper = { link: this.connectionLink, details: data, joinStamp: Date.now(), id: this.connectionLink.id };
        conduit.addMember(memberWrapper);

        conduit.payloadLog.forEach(logEntry => {
            if (logEntry.stamp > start) {
                this.connectionLink.write(JSON.stringify(logEntry.content));
            }
        });
        InterProcessCommunicator.signalSubscription(channel, this.connectionLink.id, data);
    }

    /**
     * Handles a client unsubscription request.
     * @param {object} eventData The unsubscription data.
     * @private
     */
    _handleUnsubscription(eventData) {
        if (!eventData || eventData.channel === undefined) {
            throw new Error(`Invalid unsubscription data: ${JSON.stringify(eventData)}`);
        }
        const { channel } = eventData;
        if (!this.activeConduits.has(channel)) return;

        this.activeConduits.delete(channel);
        const conduit = this.conduitManager.conduitRegistry.get(channel);
        if (conduit) {
            conduit.removeMember(this.connectionLink.id);
            this.conduitManager.considerConduitForDormancy(channel);
        }
        InterProcessCommunicator.signalUnsubscription(channel, this.connectionLink.id);
    }

    /**
     * Handles a client message event.
     * @param {object} eventData The message data.
     * @private
     */
    _handleClientMessage(eventData) {
        if (!eventData || eventData.data === undefined) {
            throw new Error(`Invalid message data: ${JSON.stringify(eventData)}`);
        }
        InterProcessCommunicator.signalClientData(this.connectionLink.id, eventData.data);
    }

    /**
     * Handles a client broadcast (publish) event.
     * @param {object} eventData The broadcast data.
     * @private
     */
    _handleClientBroadcast(eventData) {
        if (!eventData || eventData.channel === undefined || eventData.event === undefined || eventData.data === undefined) {
            throw new Error(`Invalid publish data: ${JSON.stringify(eventData)}`);
        }
        process.send({ type: 'publish', data: { channel: eventData.channel, event: `client-${eventData.event}`, data: eventData.data } });
    }

    /**
     * Cleans up the session when the connection closes.
     * @private
     */
    _terminateSession() {
        this.activeConduits.forEach(channelId => {
            const conduit = this.conduitManager.conduitRegistry.get(channelId);
            if (conduit) {
                conduit.removeMember(this.connectionLink.id);
                this.conduitManager.considerConduitForDormancy(channelId);
            }
            InterProcessCommunicator.signalUnsubscription(channelId, this.connectionLink.id);
        });
        this.activeConduits.clear();
    }
}

/**
 * Represents the state and behavior of a single communication channel (conduit).
 */
class ConduitState {
    constructor() {
        this.memberSet = new Set(); // Stores ConnectionWrapper instances
        this.payloadLog = []; // Stores { stamp, content } objects
        this.dormancyTimer = null; // Timer for deleting empty conduits
    }

    /**
     * Adds a member to this conduit.
     * @param {object} connectionWrapper An object containing link, details, joinStamp, and id.
     */
    addMember(connectionWrapper) {
        this.memberSet.add(connectionWrapper);
        if (this.dormancyTimer) {
            clearTimeout(this.dormancyTimer);
            this.dormancyTimer = null;
        }
    }

    /**
     * Removes a member from this conduit by connection ID.
     * @param {string} connectionId The ID of the connection to remove.
     */
    removeMember(connectionId) {
        let memberToRemove = null;
        for (const member of this.memberSet) {
            if (member.id === connectionId) {
                memberToRemove = member;
                break;
            }
        }
        if (memberToRemove) {
            this.memberSet.delete(memberToRemove);
        }
    }

    /**
     * Logs a payload and distributes it to all current members.
     * @param {string} conduitId The ID of the channel.
     * @param {string} event The event name.
     * @param {object} data The event data.
     */
    logAndDistributePayload(conduitId, event, data) {
        const content = { channel: conduitId, event: event, data: data };
        this.payloadLog.push({ stamp: Date.now(), content: content });
        if (this.payloadLog.length > 10) {
            this.payloadLog.splice(0, this.payloadLog.length - 10);
        }
        this.memberSet.forEach(member => {
            member.link.write(JSON.stringify(content));
        });
    }

    /**
     * Retrieves details of all current members.
     * @returns {Array<object>} An array of member detail objects.
     */
    getMemberDetails() {
        return Array.from(this.memberSet).map(member => ({
            clientKey: member.link.id,
            data: member.details,
            subscribeStamp: member.joinStamp
        }));
    }
}

/**
 * Manages all communication channels (conduits).
 */
class ConduitManager {
    constructor() {
        this.conduitRegistry = new Map(); // Map<string, ConduitState>
    }

    /**
     * Gets or creates a conduit state object for a given channel ID.
     * @param {string} conduitId The ID of the channel.
     * @returns {ConduitState} The conduit state object.
     */
    accessConduit(conduitId) {
        if (!this.conduitRegistry.has(conduitId)) {
            this.conduitRegistry.set(conduitId, new ConduitState());
        }
        return this.conduitRegistry.get(conduitId);
    }

    /**
     * Sets a timer to delete a conduit if it remains empty after a delay.
     * @param {string} conduitId The ID of the channel.
     */
    considerConduitForDormancy(conduitId) {
        const conduit = this.conduitRegistry.get(conduitId);
        if (conduit && conduit.memberSet.size === 0 && !conduit.dormancyTimer) {
            conduit.dormancyTimer = setTimeout(() => {
                if (conduit.memberSet.size === 0) { // Double check before actual deletion
                    this.conduitRegistry.delete(conduitId);
                }
            }, 10000); // 10 seconds
        }
    }
}

/**
 * The main class representing the communication relay node.
 */
class RelayNode {
    /**
     * Initializes the RelayNode.
     * @param {number} listenPort The port to listen on.
     * @param {string} [clientScriptUrl] Optional URL for the SockJS client script.
     * @param {object} [tlsOptions] Optional SSL/TLS options.
     */
    constructor(listenPort, clientScriptUrl, tlsOptions) {
        this.conduitManager = new ConduitManager();
        this.serviceLink = this._initializeServiceLink(clientScriptUrl);
        this._activateService(listenPort, tlsOptions);
    }

    /**
     * Initializes the SockJS server instance.
     * @param {string} [clientScriptUrl] Optional URL for the SockJS client script.
     * @returns {SockJS.Server} The initialized SockJS server.
     * @private
     */
    _initializeServiceLink(clientScriptUrl) {
        const linkOptions = {};
        linkOptions.log = (severity, message) => {
            const allowedSeverities = new Set(['error']); // Only log errors
            if (allowedSeverities.has(severity)) {
                console.log(`${severity}\t${message}`);
            }
        };
        if (clientScriptUrl) {
            linkOptions.sockjs_url = clientScriptUrl;
        }
        return establishLink(linkOptions);
    }

    /**
     * Activates the network service, setting up handlers and starting the server.
     * @param {number} port The port to listen on.
     * @param {object} [tlsOptions] Optional SSL/TLS options.
     * @private
     */
    _activateService(port, tlsOptions) {
        this.serviceLink.on('connection', connection => {
            if (!connection) {
                console.error('An empty socket connection was detected.');
                return;
            }
            new ClientSession(connection, this.conduitManager);
        });

        let coreServer;
        if (tlsOptions) {
            coreServer = https.createServer(tlsOptions);
        } else {
            coreServer = http.createServer();
        }
        this.serviceLink.installHandlers(coreServer);
        coreServer.listen(port);
    }

    /**
     * Ingests and processes control directives from an external source (e.g., parent process).
     * @param {string} directiveType The type of the directive.
     * @param {object} directivePayload The data associated with the directive.
     */
    ingestControlDirective(directiveType, directivePayload) {
        const directiveHandlers = new Map([
            ['down-publish', this._processPublishDirective.bind(this)],
            ['down-status-request', this._processStatusRequestDirective.bind(this)]
        ]);

        const handler = directiveHandlers.get(directiveType);
        if (handler) {
            handler(directivePayload);
        } else {
            console.log(`Unrecognized control directive: \`${directiveType}\``);
        }
    }

    /**
     * Processes a 'down-publish' directive.
     * @param {object} payload The publish directive payload.
     * @private
     */
    _processPublishDirective(payload) {
        const { channel, event, data } = payload;
        const targetConduit = this.conduitManager.conduitRegistry.get(channel);
        if (targetConduit) {
            targetConduit.logAndDistributePayload(channel, event, data);
        }
    }

    /**
     * Processes a 'down-status-request' directive.
     * @param {object} payload The status request directive payload.
     * @private
     */
    _processStatusRequestDirective(payload) {
        const { requestId } = payload;
        const allConduitMetrics = new Map();
        this.conduitManager.conduitRegistry.forEach((conduitState, channelId) => {
            allConduitMetrics.set(channelId, conduitState.getMemberDetails());
        });
        InterProcessCommunicator.signalStatusQuery(requestId, Object.fromEntries(allConduitMetrics));
    }
}

module.exports = RelayNode;
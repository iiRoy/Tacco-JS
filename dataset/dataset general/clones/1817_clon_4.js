"use strict";

const DataSerializer = require("ddp-ejson");
const WebsocketChannel = require("faye-websocket");
const https = require('https');
const http = require('http');
const { URL } = require('url');
const path = require('path');

// --- Custom Event Bus (replaces events.EventEmitter) ---
const createEventBus = () => {
    const registry = new Map(); // eventName -> Set<Function>

    const register = (signal, handler) => {
        if (!registry.has(signal)) {
            registry.set(signal, new Set());
        }
        registry.get(signal).add(handler);
    };

    const unregister = (signal, handler) => {
        if (registry.has(signal)) {
            registry.get(signal).delete(handler);
        }
    };

    const sendSignal = (signal, ...payload) => {
        if (registry.has(signal)) {
            registry.get(signal).forEach(handler => handler(...payload));
        }
    };

    const clearAll = (signal) => {
        if (signal) {
            registry.delete(signal);
        } else {
            registry.clear();
        }
    };

    return {
        on: register,
        off: unregister,
        dispatch: sendSignal,
        purge: clearAll,
    };
};

// --- Custom HTTP Fetcher (replaces 'request') ---
const performHttpQuery = (urlAddress, options, completionCallback) => {
    const urlObject = new URL(urlAddress);
    const protocolModule = urlObject.protocol === "https:" ? https : http;

    const requestOptions = {
        hostname: urlObject.hostname,
        port: urlObject.port || (urlObject.protocol === "https:" ? 443 : 80),
        path: urlObject.pathname + urlObject.search,
        method: 'GET',
        // Merge TLS options, if any
        ...options.agentOptions
    };

    const req = protocolModule.request(requestOptions, (response) => {
        let responseData = '';
        response.on('data', (chunk) => { responseData += chunk; });
        response.on('end', () => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                completionCallback(null, responseData);
            } else {
                completionCallback(new Error(`HTTP query failed with status ${response.statusCode}`), null);
            }
        });
    });

    req.on('error', (err) => {
        completionCallback(err, null);
    });

    req.end();
};

const createDdpCommunicator = (initialSettings) => {
    // --- Internal Constants & Errors ---
    const COMMUNICATOR_ERRORS = {
        LINK_BROKEN: new Error("DDPCommunicator: Link broken from DDP server")
    };

    // --- State Variables ---
    const internalState = {
        hostAddress: "localhost",
        portNumber: 3000,
        endpointPath: undefined,
        secureConnection: false,
        tlsConfiguration: {},
        useBridge: false, // corresponds to useSockJs
        automaticReconnection: true,
        reconnectionDelayMilliseconds: 500,
        storeDocumentSets: true, // corresponds to maintainCollections
        fullUrl: undefined,
        protocolVersion: "1", // corresponds to ddpVersion
        compatibleProtocolVersions: ["1", "pre2", "pre1"],
        
        currentDataChannel: null, // corresponds to socket
        initiationInProgress: false, // corresponds to _isConnecting
        reestablishmentInProgress: false, // corresponds to _isReconnecting
        connectionFailureFlag: false, // corresponds to _connectionFailed
        closureInitiated: false, // corresponds to _isClosing

        nextSequenceValue: 0, // corresponds to _nextId
        completionHandlers: new Map(), // corresponds to _callbacks
        updateNoticeHandlers: new Map(), // corresponds to _updatedCallbacks
        activeOperations: new Map(), // corresponds to _pendingMethods
        changeMonitors: new Map(), // corresponds to _observers
        documentSets: new Map(), // corresponds to collections

        reconnectionTimer: null,
        sessionIdentifier: null, // corresponds to session
    };

    const eventBus = createEventBus();

    // --- Configuration Processing ---
    const configureSettings = (settings) => {
        const mergedSettings = { ...settings };

        // Backwards compatibility
        if ("use_ssl" in mergedSettings) { mergedSettings.ssl = mergedSettings.use_ssl; }
        if ("auto_reconnect" in mergedSettings) { mergedSettings.autoReconnect = mergedSettings.auto_reconnect; }
        if ("auto_reconnect_timer" in mergedSettings) { mergedSettings.autoReconnectTimer = mergedSettings.auto_reconnect_timer; }
        if ("maintain_collections" in mergedSettings) { mergedSettings.maintainCollections = mergedSettings.maintain_collections; }
        if ("ddp_version" in mergedSettings) { mergedSettings.ddpVersion = mergedSettings.ddp_version; }

        internalState.hostAddress = mergedSettings.host || internalState.hostAddress;
        internalState.portNumber = mergedSettings.port || internalState.portNumber;
        internalState.endpointPath = mergedSettings.path;
        internalState.secureConnection = mergedSettings.ssl || (internalState.portNumber === 443);
        internalState.tlsConfiguration = mergedSettings.tlsOpts || {};
        internalState.useBridge = mergedSettings.useSockJs || false;
        internalState.automaticReconnection = ("autoReconnect" in mergedSettings) ? mergedSettings.autoReconnect : true;
        internalState.reconnectionDelayMilliseconds = ("autoReconnectTimer" in mergedSettings) ? mergedSettings.autoReconnectTimer : 500;
        internalState.storeDocumentSets = ("maintainCollections" in mergedSettings) ? mergedSettings.maintainCollections : true;
        internalState.fullUrl = mergedSettings.url;
        internalState.protocolVersion = ("ddpVersion" in mergedSettings) ? mergedSettings.ddpVersion : "1";

        if (internalState.storeDocumentSets) {
            internalState.documentSets = new Map();
        }
    };

    configureSettings(initialSettings);

    // --- Utility Functions ---
    const generateNextIdentifier = () => {
        internalState.nextSequenceValue += 1;
        return internalState.nextSequenceValue.toString();
    };

    const transmitPayload = (payloadObject) => {
        internalState.currentDataChannel.send(
            DataSerializer.stringify(payloadObject)
        );
    };

    const cancelReconnectionAttempt = () => {
        if (internalState.reconnectionTimer) {
            clearTimeout(internalState.reconnectionTimer);
            internalState.reconnectionTimer = null;
        }
    };

    const terminateOutstandingOperations = () => {
        const activeIds = Array.from(internalState.activeOperations.keys());
        internalState.activeOperations.clear();

        for (const opId of activeIds) {
            if (internalState.completionHandlers.has(opId)) {
                internalState.completionHandlers.get(opId)(COMMUNICATOR_ERRORS.LINK_BROKEN);
                internalState.completionHandlers.delete(opId);
            }
            if (internalState.updateNoticeHandlers.has(opId)) {
                internalState.updateNoticeHandlers.get(opId)();
                internalState.updateNoticeHandlers.delete(opId);
            }
        }
    };

    const handleChannelFailure = () => {
        if (internalState.automaticReconnection && !internalState.connectionFailureFlag && !internalState.closureInitiated) {
            cancelReconnectionAttempt();
            internalState.reconnectionTimer = setTimeout(() => {
                establishLink();
            }, internalState.reconnectionDelayMilliseconds);
            internalState.reestablishmentInProgress = true;
        }
    };

    const registerChangeMonitor = (monitor) => {
        if (!internalState.changeMonitors.has(monitor.name)) {
            internalState.changeMonitors.set(monitor.name, new Map());
        }
        internalState.changeMonitors.get(monitor.name).set(monitor._id, monitor);
    };

    const deregisterChangeMonitor = (monitor) => {
        if (!internalState.changeMonitors.has(monitor.name)) { return; }
        internalState.changeMonitors.get(monitor.name).delete(monitor._id);
    };

    // --- DDP Message Handlers (Lookup Table) ---
    const messageHandlers = new Map();

    messageHandlers.set("failed", (data) => {
        if (internalState.compatibleProtocolVersions.includes(data.version)) {
            internalState.protocolVersion = data.version;
            establishLink(); // Reconnect with negotiated version
        } else {
            internalState.automaticReconnection = false;
            eventBus.dispatch("connectionFailed", "Cannot negotiate DDP protocol version");
        }
    });

    messageHandlers.set("connected", (data) => {
        internalState.sessionIdentifier = data.session;
        eventBus.dispatch("connectionEstablished");
    });

    messageHandlers.set("result", (data) => {
        const handler = internalState.completionHandlers.get(data.id);
        if (handler) {
            handler(data.error, data.result);
            internalState.completionHandlers.delete(data.id);
            internalState.activeOperations.delete(data.id);
        }
    });

    messageHandlers.set("updated", (data) => {
        for (const operationId of data.methods) {
            const handler = internalState.updateNoticeHandlers.get(operationId);
            if (handler) {
                handler();
                internalState.updateNoticeHandlers.delete(operationId);
                internalState.activeOperations.delete(operationId);
            }
        }
    });

    messageHandlers.set("nosub", (data) => {
        const handler = internalState.completionHandlers.get(data.id);
        if (handler) {
            handler(data.error);
            internalState.completionHandlers.delete(data.id);
        }
    });

    messageHandlers.set("added", (data) => {
        if (internalState.storeDocumentSets && data.collection) {
            const collectionName = data.collection;
            const documentId = data.id;

            if (!internalState.documentSets.has(collectionName)) {
                internalState.documentSets.set(collectionName, new Map());
            }
            const collection = internalState.documentSets.get(collectionName);

            if (!collection.has(documentId)) {
                collection.set(documentId, {});
            }
            const document = collection.get(documentId);
            document._id = documentId;

            if (data.fields) {
                for (const fieldKey in data.fields) {
                    if (Object.prototype.hasOwnProperty.call(data.fields, fieldKey)) {
                        document[fieldKey] = data.fields[fieldKey];
                    }
                }
            }

            if (internalState.changeMonitors.has(collectionName)) {
                internalState.changeMonitors.get(collectionName).forEach(monitor => {
                    monitor.added(documentId);
                });
            }
        }
    });

    messageHandlers.set("removed", (data) => {
        if (internalState.storeDocumentSets && data.collection) {
            const collectionName = data.collection;
            const documentId = data.id;

            if (!internalState.documentSets.has(collectionName)) { return; }
            const collection = internalState.documentSets.get(collectionName);
            if (!collection.has(documentId)) { return; }

            const oldDocument = collection.get(documentId);
            collection.delete(documentId);

            if (internalState.changeMonitors.has(collectionName)) {
                internalState.changeMonitors.get(collectionName).forEach(monitor => {
                    monitor.removed(documentId, oldDocument);
                });
            }
        }
    });

    messageHandlers.set("changed", (data) => {
        if (internalState.storeDocumentSets && data.collection) {
            const collectionName = data.collection;
            const documentId = data.id;

            if (!internalState.documentSets.has(collectionName)) { return; }
            const collection = internalState.documentSets.get(collectionName);
            if (!collection.has(documentId)) { return; }

            const targetDocument = collection.get(documentId);
            const originalFields = {};
            const newFieldValues = {};

            if (data.fields) {
                for (const fieldKey in data.fields) {
                    if (Object.prototype.hasOwnProperty.call(data.fields, fieldKey)) {
                        originalFields[fieldKey] = targetDocument[fieldKey]; // Store old value
                        newFieldValues[fieldKey] = data.fields[fieldKey];    // Store new value
                        targetDocument[fieldKey] = data.fields[fieldKey];
                    }
                }
            }

            const clearedFieldNames = data.cleared || [];
            for (const fieldName of clearedFieldNames) {
                delete targetDocument[fieldName];
            }

            if (internalState.changeMonitors.has(collectionName)) {
                internalState.changeMonitors.get(collectionName).forEach(monitor => {
                    monitor.changed(documentId, originalFields, clearedFieldNames, newFieldValues);
                });
            }
        }
    });

    messageHandlers.set("ready", (data) => {
        for (const subscriptionId of data.subs) {
            const handler = internalState.completionHandlers.get(subscriptionId);
            if (handler) {
                handler();
                internalState.completionHandlers.delete(subscriptionId);
            }
        }
    });

    messageHandlers.set("ping", (data) => {
        transmitPayload(
            Object.prototype.hasOwnProperty.call(data, "id") ? { msg: "pong", id: data.id } : { msg: "pong" }
        );
    });

    const processIncomingMessage = (rawMessage) => {
        const parsedData = DataSerializer.parse(rawMessage);

        if (!parsedData.msg) {
            return;
        }

        if (messageHandlers.has(parsedData.msg)) {
            messageHandlers.get(parsedData.msg)(parsedData);
        }
        eventBus.dispatch("rawMessageReceived", rawMessage);
    };

    // --- Channel Setup ---
    const configureChannelListeners = () => {
        internalState.currentDataChannel.on("open", () => {
            transmitPayload({
                msg: "connect",
                version: internalState.protocolVersion,
                support: internalState.compatibleProtocolVersions
            });
        });

        internalState.currentDataChannel.on("error", (error) => {
            if (internalState.initiationInProgress) {
                eventBus.dispatch("connectionFailed", error.message);
            }
            eventBus.dispatch("channelError", error);
        });

        internalState.currentDataChannel.on("close", (event) => {
            eventBus.dispatch("channelClosed", event.code, event.reason);
            terminateOutstandingOperations();
            handleChannelFailure();
        });

        internalState.currentDataChannel.on("message", (event) => {
            processIncomingMessage(event.data);
        });
    };

    const constructWebsocketEndpoint = (basePath) => {
        let constructedUrl;
        const protocolPrefix = internalState.secureConnection ? "wss://" : "ws://";

        if (internalState.fullUrl && !internalState.useBridge) {
            constructedUrl = internalState.fullUrl;
        } else {
            constructedUrl = `${protocolPrefix}${internalState.hostAddress}:${internalState.portNumber}`;
            const finalPath = basePath || internalState.endpointPath || "websocket";
            constructedUrl += (finalPath.startsWith("/")) ? finalPath : `/${finalPath}`;
        }
        return constructedUrl;
    };

    const initiateWebsocketChannel = (urlAddress) => {
        internalState.currentDataChannel = new WebsocketChannel.Client(urlAddress, null, internalState.tlsConfiguration);
        configureChannelListeners();
    };

    const establishSockJSBridge = () => {
        const protocolScheme = internalState.secureConnection ? "https://" : "http://";
        const bridgeInfoPath = path.join("/", internalState.endpointPath || "", "sockjs/info");
        const bridgeInfoUrl = `${protocolScheme}${internalState.hostAddress}:${internalState.portNumber}${bridgeInfoPath}`;

        const httpOptions = { 'agentOptions': internalState.tlsConfiguration };

        performHttpQuery(bridgeInfoUrl, httpOptions, (err, body) => {
            if (err) {
                handleChannelFailure();
            } else if (body) {
                const info = JSON.parse(body);
                if (!info.base_url) {
                    initiateWebsocketChannel(constructWebsocketEndpoint());
                } else if (info.base_url.startsWith("http")) {
                    const wsUrl = info.base_url.replace(/^http/, "ws") + "/websocket";
                    initiateWebsocketChannel(wsUrl);
                } else {
                    const wsPath = info.base_url + "/websocket";
                    initiateWebsocketChannel(constructWebsocketEndpoint(wsPath));
                }
            } else {
                initiateWebsocketChannel(constructWebsocketEndpoint());
            }
        });
    };

    // --- Public API ---
    const establishLink = (connectionCallback) => {
        internalState.initiationInProgress = true;
        internalState.connectionFailureFlag = false;
        internalState.closureInitiated = false;

        if (connectionCallback) {
            eventBus.on("connectionEstablished", () => {
                cancelReconnectionAttempt();
                connectionCallback(undefined, internalState.reestablishmentInProgress);
                internalState.initiationInProgress = false;
                internalState.reestablishmentInProgress = false;
            });
            eventBus.on("connectionFailed", (errorReason) => {
                internalState.initiationInProgress = false;
                internalState.connectionFailureFlag = true;
                connectionCallback(errorReason, internalState.reestablishmentInProgress);
            });
        }

        if (internalState.useBridge) {
            establishSockJSBridge();
        } else {
            initiateWebsocketChannel(constructWebsocketEndpoint());
        }
    };

    const severLink = () => {
        internalState.closureInitiated = true;
        if (internalState.currentDataChannel) {
            internalState.currentDataChannel.close();
        }
        eventBus.purge("connectionEstablished");
        eventBus.purge("connectionFailed");
    };

    const invokeRemoteMethod = (methodName, methodParameters, resultHandler, updateHandler) => {
        const operationId = generateNextIdentifier();

        internalState.completionHandlers.set(operationId, (...args) => {
            internalState.activeOperations.delete(operationId);
            if (resultHandler) {
                resultHandler(...args);
            }
        });

        internalState.updateNoticeHandlers.set(operationId, (...args) => {
            internalState.activeOperations.delete(operationId);
            if (updateHandler) {
                updateHandler(...args);
            }
        });

        internalState.activeOperations.set(operationId, true); // Mark as active

        transmitPayload({
            msg: "method",
            id: operationId,
            method: methodName,
            params: methodParameters
        });
    };

    const invokeSeededRemoteMethod = (methodName, methodParameters, randomSeedValue, resultHandler, updateHandler) => {
        const operationId = generateNextIdentifier();

        if (resultHandler) {
            internalState.completionHandlers.set(operationId, resultHandler);
        }
        if (updateHandler) {
            internalState.updateNoticeHandlers.set(operationId, updateHandler);
        }

        transmitPayload({
            msg: "method",
            id: operationId,
            method: methodName,
            randomSeed: randomSeedValue,
            params: methodParameters
        });
    };

    const requestSubscription = (subscriptionName, subscriptionParameters, readyHandler) => {
        const subscriptionId = generateNextIdentifier();

        if (readyHandler) {
            internalState.completionHandlers.set(subscriptionId, readyHandler);
        }

        transmitPayload({
            msg: "sub",
            id: subscriptionId,
            name: subscriptionName,
            params: subscriptionParameters
        });

        return subscriptionId;
    };

    const cancelSubscription = (subscriptionId) => {
        transmitPayload({
            msg: "unsub",
            id: subscriptionId
        });
    };

    // Expose DataSerializer for external type registration, similar to original EJSON
    const exposedDataSerializer = DataSerializer;

    // Return the public interface
    return {
        // Public properties, read-only
        get payloadEncoding() { return exposedDataSerializer; },
        get documentStore() { return internalState.documentSets; }, // Expose collections for read-only access if needed

        // Event handling
        on: eventBus.on,
        off: eventBus.off,

        // Core functionality
        establishLink: establishLink,
        severLink: severLink,
        invokeRemoteMethod: invokeRemoteMethod,
        invokeSeededRemoteMethod: invokeSeededRemoteMethod,
        requestSubscription: requestSubscription,
        cancelSubscription: cancelSubscription,

        // Observer management (if collections are maintained)
        registerChangeMonitor: registerChangeMonitor,
        deregisterChangeMonitor: deregisterChangeMonitor,
    };
};

module.exports = createDdpCommunicator;
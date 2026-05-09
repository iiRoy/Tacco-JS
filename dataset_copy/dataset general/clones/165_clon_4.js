;(typeof define === 'function' ? function (m) { define('WampConnector', m); } :
    typeof exports === 'object' ? function (m) { module.exports = m(); } :
    function (m) { this.WampConnector = m(); }
)(function () {

    const protocolMsgData = [
        ['HELLO', 1], ['WELCOME', 2], ['ABORT', 3], ['CHALLENGE', 4],
        ['AUTHENTICATE', 5], ['GOODBYE', 6], ['HEARTBEAT', 7], ['ERROR', 8],
        ['PUBLISH', 16], ['PUBLISHED', 17], ['SUBSCRIBE', 32], ['SUBSCRIBED', 33],
        ['UNSUBSCRIBE', 34], ['UNSUBSCRIBED', 35], ['EVENT', 36], ['CALL', 48],
        ['CANCEL', 49], ['RESULT', 50], ['REGISTER', 64], ['REGISTERED', 65],
        ['UNREGISTER', 66], ['UNREGISTERED', 67], ['INVOCATION', 68],
        ['INTERRUPT', 69], ['YIELD', 70]
    ];

    const protocolMsgMap = protocolMsgData.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});

    const errorDefinitions = [
        { name: 'SUCCESS', code: 0, desc: 'Success!' },
        { name: 'URI_ERROR', code: 1, desc: 'Topic URI doesn\'t meet requirements!' },
        { name: 'NO_BROKER', code: 2, desc: 'Server doesn\'t provide broker role!' },
        { name: 'NO_CALLBACK_SPEC', code: 3, desc: 'No required callback function specified!' },
        { name: 'INVALID_PARAM', code: 4, desc: 'Invalid parameter(s) specified!' },
        { name: 'NON_EXIST_SUBSCRIBE_CONFIRM', code: 5, desc: 'Received subscribe confirmation to non existent subscription!' },
        { name: 'NON_EXIST_SUBSCRIBE_ERROR', code: 6, desc: 'Received error for non existent subscription!' },
        { name: 'NON_EXIST_UNSUBSCRIBE', code: 7, desc: 'Trying to unsubscribe from non existent subscription!' },
        { name: 'NON_EXIST_SUBSCRIBE_UNSUBSCRIBED', code: 8, desc: 'Received unsubscribe confirmation to non existent subscription!' },
        { name: 'NON_EXIST_PUBLISH_ERROR', code: 9, desc: 'Received error for non existent publication!' },
        { name: 'NON_EXIST_PUBLISH_PUBLISHED', code: 10, desc: 'Received publish confirmation for non existent publication!' },
        { name: 'NON_EXIST_SUBSCRIBE_EVENT', code: 11, desc: 'Received event for non existent subscription!' },
        { name: 'NO_DEALER', code: 12, desc: 'Server doesn\'t provide dealer role!' },
        { name: 'NON_EXIST_CALL_RESULT', code: 13, desc: 'Received rpc result for non existent call!' },
        { name: 'NON_EXIST_CALL_ERROR', code: 14, desc: 'Received rpc call error for non existent call!' },
        { name: 'RPC_ALREADY_REGISTERED', code: 15, desc: 'RPC already registered!' },
        { name: 'NON_EXIST_RPC_REG', code: 16, desc: 'Received rpc registration confirmation for non existent rpc!' },
        { name: 'NON_EXIST_RPC_UNREG', code: 17, desc: 'Received rpc unregistration confirmation for non existent rpc!' },
        { name: 'NON_EXIST_RPC_ERROR', code: 18, desc: 'Received error for non existent rpc!' },
        { name: 'NON_EXIST_RPC_INVOCATION', code: 19, desc: 'Received invocation for non existent rpc!' },
        { name: 'NON_EXIST_RPC_REQ_ID', code: 20, desc: 'No RPC calls in action with specified request ID!' },
        { name: 'NO_REALM', code: 21, desc: 'No realm specified!' }
    ];

    const errorCodeDetails = errorDefinitions.reduce((acc, err) => {
        acc[err.name] = { code: err.code, description: err.desc };
        return acc;
    }, {});

    const checkEnvNode = () => typeof global === 'object' && typeof global.process === 'object' && Object.prototype.toString.call(global.process) === '[object process]';

    const resolveBrowserEndpoint = (inputUri) => {
        const currentLoc = window.location;
        const getScheme = () => currentLoc.protocol === 'https:' ? 'wss://' : 'ws://';
        const getPortSuffix = () => currentLoc.port ? `:${currentLoc.port}` : '';
        const getHost = () => currentLoc.hostname;

        const handlers = [
            (uri) => !uri && `${getScheme()}${getHost()}${getPortSuffix()}/ws`,
            (uri) => /^ws(s)?:\/\//.test(uri) && uri,
            (uri) => /:\d{1,5}$/.test(uri) && `${getScheme()}${uri}`,
            (uri) => uri.startsWith('/') && `${getScheme()}${getHost()}${getPortSuffix()}${uri}`,
            (uri) => uri && `${getScheme()}${uri}` // Default for domain
        ];

        for (const handler of handlers) {
            const result = handler(inputUri);
            if (result) {
                return result;
            }
        }
        return null; // Should ideally not be reached
    };

    const resolveNodeEndpoint = (inputUri) =>
        /^ws(s)?:\/\//.test(inputUri) ? inputUri : null;

    const createTransportSocket = (targetUri, protocolList) => {
        const globalScopeRef = checkEnvNode() ? global : window;
        const resolvedUri = checkEnvNode() ? resolveNodeEndpoint(targetUri) : resolveBrowserEndpoint(targetUri);

        if (!resolvedUri) {
            return null;
        }

        console.info('Socket connection target: ', resolvedUri); // Divergent console message and method

        const getSocketConstructor = () => {
            if ('WebSocket' in globalScopeRef) {
                return globalScopeRef.WebSocket;
            }
            if ('MozWebSocket' in globalScopeRef) {
                return globalScopeRef.MozWebSocket;
            }
            return null;
        };

        const SocketCtor = getSocketConstructor();

        if (!SocketCtor) {
            return null;
        }

        return protocolList ? new SocketCtor(resolvedUri, protocolList) : new SocketCtor(resolvedUri);
    };

    class WampProtocolClient {
        constructor(...args) {
            this.clientVersion = '1.0.6-clone'; // Changed version string

            this.connectionUri = typeof args[0] === 'string' ? args[0] : undefined;
            this.activeProtocols = ['wamp.2.json']; // Hardcoded as per original snippet's constructor

            this.clientCapabilities = {
                clientAgent: 'WampyJS-Clone ' + this.clientVersion, // Changed agent name
                roles: {
                    publisher: {
                        features: {
                            subscriber_blackwhite_listing: true,
                            publisher_exclusion: true,
                            publisher_identification: true
                        }
                    },
                    subscriber: {},
                    caller: {
                        features: {
                            callee_blackwhite_listing: true,
                            caller_exclusion: true,
                            caller_identification: true,
                            progressive_call_results: true,
                            call_canceling: true
                        }
                    },
                    callee: {
                        features: {
                            caller_identification: true
                        }
                    }
                }
            };

            this.operationalState = {
                sessionIdentifier: null,
                peerCapabilities: { roles: {} },
                isClosingConnection: false,
                lastOperationStatus: { code: 0, description: 'Success!', reqId: 0 },
                reconnectionTimer: null,
                reconnectionAttemptsCount: 0
            };

            this.socketInstance = null;
            this.messageQueue = [];
            this.pendingRequests = {};
            this.activeCalls = {};
            this.activeSubscriptions = {};
            this.subscribedTopics = [];
            this.registeredProcedures = {};
            this.procedureNames = [];

            this.configurationSettings = {
                automaticReconnection: true,
                reconnectionIntervalMs: 2 * 1000,
                maxReconnectionAttempts: 25,
                messageEncoding: 'json',
                wampRealm: null,
                onConnectionEstablished: null,
                onConnectionClosed: null,
                onCommunicationError: null,
                onReconnectionAttempt: null
            };

            // Option parsing logic
            if (args.length === 1 && typeof args[0] !== 'string') {
                this.configurationSettings = this.combineObjects(this.configurationSettings, args[0]);
            } else if (args.length === 2) {
                this.configurationSettings = this.combineObjects(this.configurationSettings, args[1]);
            }

            if (this.configurationSettings.wampRealm) {
                // The original code calls _setWsProtocols() here, but its definition is not provided.
                // Assuming its effect is either a no-op or that activeProtocols remains ['wamp.2.json']
                // as hardcoded in the constructor, which is consistent with the provided snippet's scope.

                this.socketInstance = createTransportSocket(this.connectionUri, this.activeProtocols);

                // The original code calls _initWsCallbacks() here, but its definition is not provided.
                // To maintain structural equivalence and prevent a ReferenceError, a stub is included.
                this.initSocketEventHandlers();

            } else {
                this.operationalState.lastOperationStatus = errorCodeDetails.NO_REALM;
            }
        }

        generateUniqueId() {
            const MAX_ID_VALUE = 100000000000000;
            let candidateId;
            do {
                candidateId = Math.floor(Math.random() * MAX_ID_VALUE);
            } while (this.pendingRequests[candidateId] !== undefined);
            return candidateId;
        }

        combineObjects(...sources) {
            return Object.assign({}, ...sources);
        }

        isCollection(target) {
            return Array.isArray(target);
        }

        isPlainObject(target) {
            return typeof target === 'object' && target !== null && !Array.isArray(target);
        }

        initSocketEventHandlers() {
            // Placeholder for original _initWsCallbacks.
            // Its actual implementation was not provided in the original snippet.
            // If defined, it would typically set up event handlers for this.socketInstance.
            // For a Type IV clone, we ensure the call does not error, but we do not
            // invent unknown logic.
            if (!this.socketInstance) {
                return;
            }
        }
    }

    return WampProtocolClient;
});
(function (outputContainer, globalReference) {

    let sharedPageReadyState = false; // Shared state for page load status, replacing `pageLoaded`

    // --- ClientConnection (Replaces io.Socket, an assumed external dependency) ---
    // This class acts as a placeholder for the actual socket implementation.
    // It must provide an 'of' method as expected by the connection orchestrator.
    function ClientConnection(parameters) {
        this.initialSettings = parameters;
        this.channelManagers = new Map(); // Stores namespaced connection objects

        this.of = function(channelPath) {
            if (!this.channelManagers.has(channelPath)) {
                // In a full implementation, this would create or configure a new
                // namespaced socket instance. Here, it returns a simple object.
                this.channelManagers.set(channelPath, {
                    namespaceSegment: channelPath,
                    parentConnection: this
                });
            }
            return this.channelManagers.get(channelPath);
        };
    }

    // --- ConnectionUtilities (Replaces io.util) ---
    class ConnectionUtilities {
        // Renamed from util.parseUri. Uses an imperative string parsing approach,
        // distinct from the original's single complex regex.
        dissectLocator(inputString) {
            const parsedData = {
                source: inputString || '', protocol: '', authority: '', userInfo: '', user: '', password: '',
                host: '', port: '', relative: '', path: '', directory: '', file: '', query: '', anchor: ''
            };

            let currentSegment = inputString || '';

            // Handle Anchor (e.g., #fragment)
            const hashPos = currentSegment.indexOf('#');
            if (hashPos !== -1) {
                parsedData.anchor = currentSegment.substring(hashPos + 1);
                currentSegment = currentSegment.substring(0, hashPos);
            }

            // Handle Query (e.g., ?key=value)
            const queryPos = currentSegment.indexOf('?');
            if (queryPos !== -1) {
                parsedData.query = currentSegment.substring(queryPos + 1);
                currentSegment = currentSegment.substring(0, queryPos);
            }

            // Handle Protocol (e.g., http://)
            const protocolRegex = /^([a-z][a-z0-9+\-.]*):/i;
            const protocolMatch = currentSegment.match(protocolRegex);
            if (protocolMatch) {
                parsedData.protocol = protocolMatch[1];
                currentSegment = currentSegment.substring(protocolMatch[0].length);
            }

            // Handle Authority (e.g., //user:pass@host:port) and initial Path segment
            let pathSeparatorPos = currentSegment.indexOf('/');
            let authorityCandidate = '';

            if (currentSegment.startsWith('//')) { // Absolute URI, with authority
                currentSegment = currentSegment.substring(2);
                pathSeparatorPos = currentSegment.indexOf('/');
                if (pathSeparatorPos === -1) { // No path, only authority
                    authorityCandidate = currentSegment;
                    currentSegment = '';
                } else { // Authority and path
                    authorityCandidate = currentSegment.substring(0, pathSeparatorPos);
                    currentSegment = currentSegment.substring(pathSeparatorPos);
                }
            } else if (parsedData.protocol && pathSeparatorPos === -1) { // e.g., "http:host:port" or "mailto:user"
                 authorityCandidate = currentSegment;
                 currentSegment = '';
            } else if (!parsedData.protocol && pathSeparatorPos === 0) { // e.g., "/path/file"
                 parsedData.path = currentSegment;
                 currentSegment = '';
            } else if (!parsedData.protocol && pathSeparatorPos === -1) { // e.g., "host:port" or "relative/path"
                const lastColon = currentSegment.lastIndexOf(':');
                if (lastColon > -1 && lastColon < currentSegment.length - 1 && !currentSegment.includes('/')) {
                    authorityCandidate = currentSegment;
                    currentSegment = '';
                } else {
                    parsedData.path = currentSegment;
                    currentSegment = '';
                }
            } else if (!parsedData.protocol && pathSeparatorPos > 0) { // e.g., "host/path"
                authorityCandidate = currentSegment.substring(0, pathSeparatorPos);
                parsedData.path = currentSegment.substring(pathSeparatorPos);
                currentSegment = '';
            }

            parsedData.authority = authorityCandidate;

            const atSignPos = authorityCandidate.indexOf('@');
            let hostPortSegment = authorityCandidate;
            if (atSignPos !== -1) {
                parsedData.userInfo = authorityCandidate.substring(0, atSignPos);
                const userInfoParts = parsedData.userInfo.split(':');
                parsedData.user = userInfoParts[0];
                if (userInfoParts.length > 1) parsedData.password = userInfoParts.slice(1).join(':');
                hostPortSegment = authorityCandidate.substring(atSignPos + 1);
            }

            const lastColonInHost = hostPortSegment.lastIndexOf(':');
            if (lastColonInHost !== -1 && hostPortSegment.indexOf(']') === -1) { // Check for IPv6
                parsedData.port = hostPortSegment.substring(lastColonInHost + 1);
                parsedData.host = hostPortSegment.substring(0, lastColonInHost);
            } else {
                parsedData.host = hostPortSegment;
            }

            // Path continuation
            if (currentSegment) {
                parsedData.path += currentSegment;
            }

            // Normalize path
            if (parsedData.host && parsedData.path === '') {
                parsedData.path = '/';
            }

            // Derived path properties
            const finalSlashPos = parsedData.path.lastIndexOf('/');
            parsedData.directory = parsedData.path.substring(0, finalSlashPos + 1);
            parsedData.file = parsedData.path.substring(finalSlashPos + 1);
            parsedData.relative = parsedData.path + (parsedData.query ? '?' + parsedData.query : '') + (parsedData.anchor ? '#' + parsedData.anchor : '');

            return parsedData;
        }

        // Renamed from util.uniqueUri. Constructs a unique key string.
        composeUniqueKey(locatorObject) {
            let currentProtocol = locatorObject.protocol;
            let currentHost = locatorObject.host;
            let currentPort = locatorObject.port;

            // Mimic global.document / global.location behavior
            if (globalReference && globalReference.document) {
                currentHost = currentHost || globalReference.document.domain;
                currentPort = currentPort || (currentProtocol === 'https' && globalReference.document.location.protocol !== 'https:' ? 443 : globalReference.document.location.port);
            } else {
                currentHost = currentHost || 'localhost';
                if (!currentPort && currentProtocol === 'https') {
                    currentPort = 443;
                }
            }

            return (currentProtocol || 'http') + '://' + currentHost + ':' + (currentPort || 80);
        }

        // Renamed from util.merge. Uses Object.assign for a shallow merge.
        // This is functionally equivalent for `io.connect`'s usage of `io.util.merge`.
        combineConfigurations(targetObject, sourceObject) {
            return Object.assign(targetObject, sourceObject);
        }

        // Renamed from util.chunkQuery. Parses a query string into an object.
        processQueryString(queryText) {
            const resultObject = {};
            if (!queryText) return resultObject;
            queryText.split('&').forEach(pair => {
                const parts = pair.split('=');
                if (parts[0]) {
                    resultObject[parts[0]] = parts[1];
                }
            });
            return resultObject;
        }

        // Renamed from util.query. Combines two query strings.
        assembleQueryString(baseString, additionalString) {
            const combinedQuery = this.combineConfigurations(
                this.processQueryString(baseString),
                this.processQueryString(additionalString)
            );
            const components = [];
            for (const key in combinedQuery) {
                if (Object.prototype.hasOwnProperty.call(combinedQuery, key)) {
                    components.push(`${key}=${combinedQuery[key]}`);
                }
            }
            return components.length ? '?' + components.join('&') : '';
        }

        // Renamed from util.isArray. Checks if a value is an Array.
        isList(testValue) {
            return Array.isArray(testValue);
        }

        // Renamed from util.indexOf. Provides Array.prototype.indexOf functionality.
        findPosition(collection, item, startIndex) {
            return collection.indexOf(item, startIndex);
        }

        // Renamed from util.on. Attaches an event listener.
        attachEvent(targetElement, eventType, handlerFunc, useCapture) {
            if (targetElement.attachEvent) { // For older IE
                targetElement.attachEvent('on' + eventType, handlerFunc);
            } else if (targetElement.addEventListener) { // For modern browsers
                targetElement.addEventListener(eventType, handlerFunc, useCapture);
            }
        }

        // Renamed from util.load. Executes a function when the page is loaded.
        executeOnPageLoad(callback) {
            if (globalReference && globalReference.document && globalReference.document.readyState === 'complete' || sharedPageReadyState) {
                return callback();
            }
            this.attachEvent(globalReference, 'load', () => {
                sharedPageReadyState = true;
                callback();
            }, false);
        }

        // Renamed from util.defer. Defers function execution.
        delayExecution(func) {
            const userAgent = globalReference && globalReference.navigator ? globalReference.navigator.userAgent : '';
            const isWebkit = userAgent.includes('WebKit');
            const isWorker = typeof globalReference.importScripts === 'function';

            if (!isWebkit || isWorker) {
                return func();
            }

            this.executeOnPageLoad(() => {
                setTimeout(func, 100);
            });
        }

        // Renamed from util.request. Creates an XMLHttpRequest object.
        createAjaxRequest(isCrossDomain) {
            if (isCrossDomain && typeof globalReference.XDomainRequest !== 'undefined') {
                return new globalReference.XDomainRequest();
            }

            if (typeof globalReference.XMLHttpRequest !== 'undefined' && (!isCrossDomain || this.browserAgent.supportsCORS)) {
                return new globalReference.XMLHttpRequest();
            }

            if (!isCrossDomain) {
                try {
                    return new globalReference[(['Active'].concat('Object').join('X'))]('Microsoft.XMLHTTP');
                } catch(e) { /* ignored */ }
            }
            return null;
        }

        // Renamed from util.ua. Detects browser capabilities.
        browserAgent = (() => {
            const hasCrossDomainRequestSupport = typeof globalReference.XMLHttpRequest !== 'undefined' && (function () {
                try {
                    const req = new globalReference.XMLHttpRequest();
                    return req.withCredentials !== undefined;
                } catch (e) {
                    return false;
                }
            })();

            const isWebKitEngine = typeof globalReference.navigator !== 'undefined' && /webkit/i.test(globalReference.navigator.userAgent);

            return {
                supportsCORS: hasCrossDomainRequestSupport,
                isWebkit: isWebKitEngine
            };
        })();

        // Renamed from util.mixin. Merges prototypes.
        applyPrototypes(targetCtor, sourceCtor) {
            this.combineConfigurations(targetCtor.prototype, sourceCtor.prototype);
        }

        // Renamed from util.inherit. Sets up classical inheritance.
        setupInheritance(childCtor, parentCtor) {
            function TemporaryConstructor() {}
            TemporaryConstructor.prototype = parentCtor.prototype;
            childCtor.prototype = new TemporaryConstructor();
        }

        // Renamed from util.intersect. Finds common elements between two arrays.
        findCommonElements(listA, listB) {
            const result = [];
            const longerList = listA.length > listB.length ? listA : listB;
            const shorterList = listA.length > listB.length ? listB : listA;

            for (let i = 0; i < shorterList.length; i++) {
                if (this.findPosition(longerList, shorterList[i]) !== -1) {
                    result.push(shorterList[i]);
                }
            }
            return result;
        }

        // Renamed from util.toArray. Converts enumerable objects to arrays.
        convertToList(enumerableObject) {
            const convertedArray = [];
            for (let i = 0, len = enumerableObject.length; i < len; i++) {
                convertedArray.push(enumerableObject[i]);
            }
            return convertedArray;
        }
    }

    // Initialize `sharedPageReadyState` if `window` is defined (mimics original's `util.load` call)
    if (typeof globalReference.window !== 'undefined') {
        const tempUtils = new ConnectionUtilities(); // Temporary instance to call the load handler
        tempUtils.executeOnPageLoad(() => {
            sharedPageReadyState = true;
        });
    }

    // --- ConnectionOverseer (Encapsulates the core io.connect logic) ---
    class ConnectionOverseer {
        constructor() {
            this.connectionCache = new Map(); // Replaces `io.sockets`, using a Map for divergent approach
            this.helperTools = new ConnectionUtilities(); // Instance of the utility class
        }

        // Renamed from io.connect. Manages connection establishment.
        initiateConnection(resourceIdentifier, connectionConfig) {
            const parsedIdentifier = this.helperTools.dissectLocator(resourceIdentifier);

            // Apply global location context if available (mimics original logic)
            if (globalReference && globalReference.location) {
                parsedIdentifier.protocol = parsedIdentifier.protocol || globalReference.location.protocol.slice(0, -1);
                parsedIdentifier.host = parsedIdentifier.host || (globalReference.document ? globalReference.document.domain : globalReference.location.hostname);
                parsedIdentifier.port = parsedIdentifier.port || globalReference.location.port;
            }

            const uniqueAccessKey = this.helperTools.composeUniqueKey(parsedIdentifier);

            let sessionParameters = { // Renamed from 'options'
                hostAddress: parsedIdentifier.host, // Renamed from 'host'
                secureLink: 'https' === parsedIdentifier.protocol, // Renamed from 'secure'
                networkPort: parsedIdentifier.port || ('https' === parsedIdentifier.protocol ? 443 : 80), // Renamed from 'port'
                requestQuery: parsedIdentifier.query || '' // Renamed from 'query'
            };

            // Merge additional details (replaces io.util.merge)
            sessionParameters = this.helperTools.combineConfigurations(sessionParameters, connectionConfig);

            let currentSession; // Renamed from 'socket'

            const forceNewSession = sessionParameters['force new connection']; // Use bracket notation for original key

            if (forceNewSession || !this.connectionCache.has(uniqueAccessKey)) {
                currentSession = new ClientConnection(sessionParameters); // Replaces `new io.Socket(options)`
                if (!forceNewSession) {
                    this.connectionCache.set(uniqueAccessKey, currentSession);
                }
            } else {
                currentSession = this.connectionCache.get(uniqueAccessKey);
            }

            // Return namespaced connection (replaces `socket.of`)
            const namespaceSegment = parsedIdentifier.path.length > 1 ? parsedIdentifier.path : '';
            return currentSession.of(namespaceSegment);
        }
    }

    // --- EventDispatcher (Replaces EventEmitter) ---
    class EventDispatcher {
        constructor() {
            this.eventSubscribers = new Map(); // Replaces `this.$events`, using a Map for divergent approach
        }

        // Renamed from 'on'. Registers an event handler.
        registerHandler(eventName, callbackFunction) {
            if (!this.eventSubscribers.has(eventName)) {
                this.eventSubscribers.set(eventName, []);
            }
            const currentHandlers = this.eventSubscribers.get(eventName);
            currentHandlers.push(callbackFunction);
            return this;
        }
    }

    // --- Main Exported Namespace (Replaces the `io` namespace object) ---
    const NetworkFacade = {}; // Renamed from `io`

    // Replicate top-level properties with different names and placeholder values
    NetworkFacade.protocolVersion = '1.0.0-alpha'; // Replaces io.version
    NetworkFacade.commStandard = 2; // Replaces io.protocol
    NetworkFacade.transportLayers = []; // Replaces io.transports
    NetworkFacade.jsonpCallbacks = []; // Replaces io.j
    NetworkFacade.managedConnections = {}; // Replaces io.sockets (primary cache is in ConnectionOverseer)

    // Instantiate the connection orchestrator
    const connectionManagerInstance = new ConnectionOverseer();

    // Assign the main connection function, renamed from `io.connect`
    NetworkFacade.createLink = function (targetHost, connectionDetails) {
        return connectionManagerInstance.initiateConnection(targetHost, connectionDetails);
    };

    // Expose the utility instance, renamed from `io.util`
    NetworkFacade.utilities = connectionManagerInstance.helperTools;

    // Expose the EventDispatcher class, renamed from `io.EventEmitter`
    NetworkFacade.EventMessenger = EventDispatcher;

    // Export the NetworkFacade object, mimicking the original's IIFE export pattern.
    if (typeof module !== 'undefined' && module.exports) {
        outputContainer = NetworkFacade; // For Node.js-like environments
        module.exports = outputContainer;
    } else {
        globalReference.NetworkFacade = NetworkFacade; // For browser environments
    }

})(typeof module !== 'undefined' && module.exports ? module.exports : (this), this);
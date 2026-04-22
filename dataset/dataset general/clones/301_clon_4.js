(function(globalScope) {
    if (globalScope.CrossComm) return;

    // --- Private State Containers ---
    const activeCommChannels = new Map(); // Stores references to processors and their contexts, indexed by unique keys
    const configLoadQueue = []; // Holds callbacks waiting for the communication environment configuration
    let systemConfiguration = { loaded: false }; // Encapsulates environment details like JSON handlers and communication protocol
    let instanceCount = 0; // Unique identifier counter for communication instances
    const externalScriptSource = 'http://userapi.com/js/api/xdmHelper.js'; // URL for auxiliary script
    let jsonPolyfillNeeded = false; // Flag indicating if native JSON support is lacking
    let jsonOnlyProtocol = false; // Flag for scenarios where only JSON is expected via helper script

    // --- Core Utility Functions ---

    // Generates a short, unique hexadecimal string for channel identification
    const produceUniqueStamp = () => {
        let identifier = '';
        for (let i = 0; i < 5; i++) {
            identifier += Math.floor(Math.random() * 16).toString(16);
        }
        return identifier;
    };

    // Asynchronously polls for a property to become truthy on an object before executing a callback
    const awaitPropertyReadiness = (targetObject, propertyName, executionCallback, executionContext, maxRetries = 1000) => {
        let currentRetries = 0;
        const checkConditionAndExecute = () => {
            if (targetObject[propertyName]) {
                executionCallback.apply(executionContext);
            } else if (currentRetries < maxRetries) {
                currentRetries++;
                setTimeout(checkConditionAndExecute, 0);
            }
        };
        checkConditionAndExecute();
    };

    // Dynamically injects a script tag into the document's head
    const injectAuxiliaryScript = (scriptSource) => {
        setTimeout(() => {
            const newScriptElement = globalScope.document.createElement('script');
            newScriptElement.type = 'text/javascript';
            newScriptElement.src = scriptSource || externalScriptSource;
            awaitPropertyReadiness(globalScope.document, 'body', () => {
                globalScope.document.head.appendChild(newScriptElement);
            });
        }, 0);
    };

    // Recursively merges properties from a source object into a target object
    const deepMergeObjects = (targetContainer, sourceContent) => {
        for (const propKey in sourceContent) {
            if (Object.prototype.hasOwnProperty.call(sourceContent, propKey)) {
                if (targetContainer[propKey] && typeof targetContainer[propKey] === 'object' && !Array.isArray(targetContainer[propKey]) && typeof sourceContent[propKey] === 'object' && !Array.isArray(sourceContent[propKey])) {
                    deepMergeObjects(targetContainer[propKey], sourceContent[propKey]);
                } else {
                    targetContainer[propKey] = sourceContent[propKey];
                }
            }
        }
    };

    // --- Configuration Management ---

    // Retrieves the current system configuration, executing a callback if already loaded or queuing it
    const accessSystemConfig = (callbackOnReady, contextForCallback) => {
        if (systemConfiguration.loaded) {
            callbackOnReady.apply(contextForCallback, [systemConfiguration]);
        } else {
            configLoadQueue.push([contextForCallback, callbackOnReady]);
        }
    };

    // Signals that the system configuration is ready and executes all queued callbacks
    const broadcastConfigReady = () => {
        systemConfiguration.loaded = true;
        while (configLoadQueue.length > 0) {
            const [context, callback] = configLoadQueue.shift();
            callback.apply(context, [systemConfiguration]);
        }
    };

    // Updates the system configuration with new properties
    const updateSystemConfig = (newSettings) => {
        for (const settingKey in newSettings) {
            if (Object.prototype.hasOwnProperty.call(newSettings, settingKey)) {
                systemConfiguration[settingKey] = newSettings[settingKey];
            }
        }
        broadcastConfigReady();
    };

    // Assigns JSON parsing and stringifying functions to the system configuration
    const registerJsonUtilities = (jsonImplementation) => {
        systemConfiguration.jsonParser = jsonImplementation.parse;
        systemConfiguration.jsonStringifier = jsonImplementation.stringify;
    };

    // Retrieves the registered JSON utilities, or passes them to a callback
    const getJsonUtilities = (callbackFn) => {
        if (!callbackFn) return { parse: systemConfiguration.jsonParser, stringify: systemConfiguration.jsonStringifier };
        accessSystemConfig((config) => {
            callbackFn({ parse: config.jsonParser, stringify: config.jsonStringifier });
        });
    };

    // --- Event Dispatcher (Replaces _q, on, run) ---
    class EventDispatcher {
        constructor() {
            this.eventSubscribers = new Map(); // Stores event handlers
            this.triggeredEvents = new Set(); // Tracks events that have already been triggered
        }

        // Subscribes a handler to an event. If the event has already triggered, the handler is called immediately.
        registerEventHandler(eventName, handlerFunction, handlerContext) {
            if (this.triggeredEvents.has(eventName)) {
                handlerFunction.apply(handlerContext);
            } else {
                if (!this.eventSubscribers.has(eventName)) {
                    this.eventSubscribers.set(eventName, []);
                }
                this.eventSubscribers.get(eventName).push({ handler: handlerFunction, context: handlerContext });
            }
        }

        // Triggers an event, executing all registered handlers and then marking the event as triggered.
        dispatchMessage(eventName) {
            if (this.eventSubscribers.has(eventName)) {
                this.eventSubscribers.get(eventName).forEach(({ handler, context }) => {
                    handler.apply(context);
                });
                this.eventSubscribers.delete(eventName);
            }
            this.triggeredEvents.add(eventName);
        }
    }
    const globalEventBus = new EventDispatcher();

    // --- Message Processing Functions ---

    // Handles an incoming serialized method invocation, parsing it and executing the target method
    const processReceivedCall = (serializedInput, targetCommInstance) => {
        accessSystemConfig((config) => {
            const parsedCallData = config.jsonParser(serializedInput);
            if (parsedCallData[0]) { // Method name is the first element
                if (!parsedCallData[1]) parsedCallData[1] = []; // Ensure arguments array exists
                for (let i = 0; i < parsedCallData[1].length; i++) {
                    const argItem = parsedCallData[1][i];
                    if (argItem && typeof argItem === 'object' && argItem._functionRef) { // Check for function placeholder
                        const remoteFnId = argItem._functionRef;
                        parsedCallData[1][i] = function() {
                            const actualArgs = Array.prototype.slice.call(arguments);
                            actualArgs.unshift('_function' + remoteFnId); // Prefix for remote function invocation
                            targetCommInstance.transmitMethodCall.apply(targetCommInstance, actualArgs);
                        };
                    }
                }
                setTimeout(() => {
                    if (!targetCommInstance.exposedMethods[parsedCallData[0]]) {
                        throw new Error('InterComm: Remote method ' + parsedCallData[0] + ' is not defined');
                    }
                    targetCommInstance.exposedMethods[parsedCallData[0]].apply(targetCommInstance, parsedCallData[1]);
                }, 0);
            }
        });
    };

    // The primary listener for global 'message' events, dispatches to appropriate communication channels
    const globalEventReceiver = (messageEvent) => {
        if (!messageEvent.data || typeof messageEvent.data !== 'string') return false;
        const separatorPos = messageEvent.data.indexOf(':');
        if (separatorPos === -1) return false;

        const channelIdentifier = messageEvent.data.substring(0, separatorPos);
        const channelHandlerEntry = activeCommChannels.get(channelIdentifier);

        if (channelHandlerEntry) {
            const instanceScope = channelHandlerEntry.context;
            if (!instanceScope.originValidation || instanceScope.originValidation(messageEvent.origin)) {
                channelHandlerEntry.processor(messageEvent.data.substring(separatorPos + 1), instanceScope);
            }
        }
    };

    // --- Inter-Communication Classes ---

    // Represents the host (parent) window managing an embedded iframe
    class InterCommHost {
        constructor(methodCollection, originValidator) {
            this.exposedMethods = methodCollection || {};
            this.uniqueInstanceId = instanceCount++;
            this.originValidation = originValidator;
            this.channelIdentifier = produceUniqueStamp();
            this.exposedMethods['%initialize%'] = this.exposedMethods['__ic_setup'] = function() {
                InterCommManager.eventBus.dispatchMessage(this.uniqueInstanceId);
                if (this.exposedMethods['onConnectionReady']) {
                    this.exposedMethods['onConnectionReady']();
                }
            };
            this.iframeNameAttribute = 'icH' + this.channelIdentifier;
            this.isHostSide = true;
            activeCommChannels.set(this.channelIdentifier, { processor: processReceivedCall, context: this });
        }

        // Activates the host, connecting to the embedded frame's window
        activateConnection(frameElement, retryAttempts = 0) {
            if (frameElement.contentWindow) {
                this.peerWindow = frameElement.contentWindow;
                this.embeddedFrame = frameElement;

                InterCommManager.eventBus.registerEventHandler('auxiliaryLoaded', () => {
                    InterCommManager.onHostConnectionEstablished(this);
                }, this);
            } else {
                if (retryAttempts < 50) {
                    setTimeout(() => {
                        this.activateConnection(frameElement, retryAttempts + 1);
                    }, 100);
                }
            }
        }

        // Deactivates the host communication channel
        deactivateChannel() {
            activeCommChannels.delete(this.channelIdentifier);
        }

        // Creates and injects an iframe into a specified container element
        insertFrame(containerElement, frameConfiguration) {
            const wrapperDiv = globalScope.document.createElement('DIV');
            wrapperDiv.innerHTML = '<iframe name="' + this.iframeNameAttribute + '" />';
            const newIframe = wrapperDiv.firstChild;
            setTimeout(() => {
                newIframe.frameBorder = '0';
                if (frameConfiguration) deepMergeObjects(newIframe, frameConfiguration);
                containerElement.insertBefore(newIframe, containerElement.firstChild);
                this.activateConnection(newIframe);
            }, 0);
            return newIframe;
        }
    }

    // Represents the client (iframe) window communicating with its parent
    class InterCommClient {
        constructor(methodCollection) {
            this.exposedMethods = methodCollection || {};
            this.uniqueInstanceId = instanceCount++;
            InterCommManager.eventBus.dispatchMessage(this.uniqueInstanceId);

            if (globalScope.name.indexOf('icH') === 0) {
                this.channelIdentifier = globalScope.name.substring(3);
            } else {
                throw new Error('InterComm: Invalid window.name for client initialization.');
            }
            this.peerWindow = globalScope.parent;
            activeCommChannels.set(this.channelIdentifier, { processor: processReceivedCall, context: this });
            this.isClientSide = true;

            InterCommManager.eventBus.registerEventHandler('auxiliaryLoaded', () => {
                InterCommManager.onClientConnectionInitialized(this);
            }, this);

            accessSystemConfig((config) => {
                // Mimics domain-specific initialization logic
                const initialMethod = (globalScope.location.toString().indexOf('alternate-domain.net') !== -1) ? '__ic_setup' : '%initialize%';
                config.protocolSender(this, config.jsonStringifier([initialMethod]));
                const clientMethodCollection = this.exposedMethods;
                setTimeout(() => {
                    if (clientMethodCollection['onConnectionReady']) {
                        clientMethodCollection['onConnectionReady']();
                    }
                }, 0);
            }, this);
        }
    }

    // Common method for both host and client to invoke a remote method
    const transmitMethodCall = function() {
        const invocationArgs = Array.prototype.slice.call(arguments);
        const targetMethodName = invocationArgs.shift();
        for (let i = 0; i < invocationArgs.length; i++) {
            if (typeof invocationArgs[i] === 'function') {
                this.functionReferenceCounter = (this.functionReferenceCounter || 0) + 1;
                const actualFunction = invocationArgs[i];
                const functionReferenceName = '_function' + this.functionReferenceCounter;
                this.exposedMethods[functionReferenceName] = function() {
                    actualFunction.apply(this, arguments);
                    delete this.exposedMethods[functionReferenceName]; // One-time use
                };
                invocationArgs[i] = { _functionRef: this.functionReferenceCounter }; // Placeholder for remote side
            }
        }
        awaitPropertyReadiness(this, 'peerWindow', () => {
            InterCommManager.eventBus.registerEventHandler(this.uniqueInstanceId, () => {
                accessSystemConfig((config) => {
                    config.protocolSender(this, config.jsonStringifier([targetMethodName, invocationArgs]));
                }, this);
            }, this);
        }, this);
    };

    // Assign the common method to both prototypes
    InterCommHost.prototype.transmitMethodCall = transmitMethodCall;
    InterCommClient.prototype.transmitMethodCall = transmitMethodCall;

    // --- Main InterCommManager Object (Exposed globally) ---
    const InterCommManager = {
        uniqueInstanceCounter: 0, // Publicly exposed counter
        auxiliaryScriptUrl: externalScriptSource,

        Host: InterCommHost,
        Client: InterCommClient,

        registerJsonUtilities: registerJsonUtilities,
        getJsonUtilities: getJsonUtilities,
        updateSystemConfig: updateSystemConfig,

        eventBus: globalEventBus, // Public access to the event dispatcher
        registerEventHandler: globalEventBus.registerEventHandler.bind(globalEventBus),
        dispatchMessage: globalEventBus.dispatchMessage.bind(globalEventBus),

        rootMessageHandler: globalEventReceiver,
        awaitPropertyReadiness: awaitPropertyReadiness,

        // Placeholder functions for external hooks, intended to be overridden
        onHostConnectionEstablished: function(hostInstance) {
            if (hostInstance.onActivated) hostInstance.onActivated();
        },
        onClientConnectionInitialized: function(clientInstance) {
            if (clientInstance.onInitialized) clientInstance.onInitialized();
        }
    };

    // --- Initial Environment Detection and Setup ---

    // JSON support detection
    if (globalScope.JSON && typeof globalScope.JSON === 'object' && globalScope.JSON.parse && globalScope.JSON.stringify) {
        try {
            if (globalScope.JSON.stringify({ key: [1, 2, 3] }).replace(/ /g, '') === '{"key":[1,2,3]}') {
                registerJsonUtilities({ parse: globalScope.JSON.parse, stringify: globalScope.JSON.stringify });
            } else {
                jsonPolyfillNeeded = true;
            }
        } catch (e) {
            jsonPolyfillNeeded = true;
        }
    } else {
        jsonPolyfillNeeded = true;
    }

    // PostMessage protocol setup
    if (globalScope.postMessage) {
        systemConfiguration.protocolType = 'postMessage';
        systemConfiguration.protocolSender = function(commInstance, dataPayload) {
            commInstance.peerWindow.postMessage(commInstance.channelIdentifier + ':' + dataPayload, "*");
        };
        if (globalScope.addEventListener) {
            globalScope.addEventListener("message", InterCommManager.rootMessageHandler, false);
        } else {
            globalScope.attachEvent("onmessage", InterCommManager.rootMessageHandler);
        }

        if (jsonPolyfillNeeded) {
            jsonOnlyProtocol = true;
            injectAuxiliaryScript(); // Load helper for JSON
        } else {
            broadcastConfigReady(); // Configuration is complete
        }
    } else {
        injectAuxiliaryScript(); // Load helper for non-postMessage protocol or JSON
    }

    globalScope.CrossComm = InterCommManager; // Expose the main manager object
})(window);
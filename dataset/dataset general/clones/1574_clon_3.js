(function (globalScope, moduleFactory) {
    'use strict';

    if (typeof globalScope.define === 'function' && globalScope.define.amd) {
        globalScope.define([], moduleFactory);
    } else {
        const moduleName = 'castBridge';
        if (globalScope[moduleName]) {
            console.warn(`Module "${moduleName}" already exists on global scope.`);
            return;
        }
        globalScope[moduleName] = moduleFactory();
    }
}(window, function () {
    'use strict';

    let helperTools,
        SharedBehavior,
        TransmissionEndpoint = {},
        ReceptionHost = {};

    helperTools = {
        contextualize: (fnRef, contextObj) => {
            if (typeof fnRef !== 'function') {
                console.error("Attempted to bind a non-function reference.");
                return () => {};
            }
            return (...args) => fnRef.apply(contextObj, args);
        },

        mergeObjects: function (targetObject, ...sourceObjects) {
            if (!targetObject || typeof targetObject !== 'object') {
                console.error("Merge target must be a valid object.");
                return {};
            }
            return Object.assign(targetObject, ...sourceObjects);
        },

        instantiateFromPrototype: function (protoModule) {
            if (typeof protoModule !== 'object' || protoModule === null) {
                console.error("Invalid prototype provided for instantiation.");
                return {};
            }
            return Object.create(protoModule);
        }
    };

    SharedBehavior = {
        _eventRegistry: null,
        _configSettings: null,

        registerHandler: function (eventName, callbackFn) {
            if (typeof callbackFn !== 'function') {
                console.warn(`Attempted to register a non-function for event '${eventName}'.`);
                return this;
            }

            this._eventRegistry = this._eventRegistry || {};
            this._eventRegistry[eventName] = this._eventRegistry[eventName] || [];
            this._eventRegistry[eventName].push(callbackFn);

            return this;
        },

        configure: function (newOptions) {
            this._configSettings = this._configSettings || {};

            if (newOptions && typeof newOptions === 'object') {
                helperTools.mergeObjects(this._configSettings, newOptions);
            }
            return this._configSettings;
        },

        _emitEvent: function (eventKey, eventPayload) {
            if (!this._eventRegistry || !this._eventRegistry[eventKey]) {
                return;
            }

            const registeredHandlers = this._eventRegistry[eventKey];
            registeredHandlers.forEach(handler => {
                try {
                    handler.call(this, eventPayload);
                } catch (e) {
                    console.error(`Error executing handler for event '${eventKey}':`, e);
                }
            });
        }
    };

    helperTools.mergeObjects(TransmissionEndpoint, SharedBehavior, {
        _activeSession: null,
        _isInitialized: false,
        _apiAvailabilityCache: undefined, // Type III: Caches API availability

        initiateConnection: function (connectionOptions) {
            if (this._isInitialized) {
                console.warn("Connection already initiated.");
                return this;
            }

            this.configure(connectionOptions);
            const INIT_DELAY_MS = 1200;
            setTimeout(() => {
                this._performCastInitialization();
            }, INIT_DELAY_MS);
            this._isInitialized = true;
            return this;
        },

        transmitPayload: function (payloadData) {
            const currentConfig = this.configure();

            if (!this._checkAvailability()) {
                console.warn("Cast API is not available to send message.");
                return this;
            }
            if (!this._activeSession) {
                console.error("No active session to send message.");
                this._emitEvent('transmissionFailed', { reason: "no_active_session", payload: payloadData });
                return this;
            }

            const NAMESPACE = currentConfig.namespace;
            this._activeSession.sendMessage(
                NAMESPACE,
                payloadData,
                () => this._onTransmissionSuccess(payloadData),
                (err) => this._onOperationFailure(err)
            );

            return this;
        },

        requestSessionStart: function () {
            const currentConfig = this.configure();

            if (!this._checkAvailability()) {
                console.warn("Cast API not available to request session.");
                return this;
            }

            window.chrome.cast.requestSession(
                (sessionObj) => {
                    this._activeSession = sessionObj;
                    sessionObj.addUpdateListener((isAlive) => this._sessionStateChanged(isAlive));
                    sessionObj.addMessageListener(currentConfig.namespace, (ns, msg) => this._incomingReceiverMessage(ns, msg));
                    this._emitEvent('sessionAcquired', sessionObj);
                },
                (err) => this._onOperationFailure(err)
            );

            return this;
        },

        _performCastInitialization: function () {
            const currentConfig = this.configure();
            let sessionRequestInstance;
            let apiConfigurationObject;

            if (!this._checkAvailability()) {
                console.error("Chrome Cast API is not present or available.");
                this._emitEvent('apiNotAvailable');
                return this;
            }

            if (!currentConfig.applicationID) {
                console.error("Application ID is missing from configuration.");
                this._emitEvent('configurationError', { message: "Application ID required" });
                return this;
            }

            sessionRequestInstance = new window.chrome.cast.SessionRequest(currentConfig.applicationID);
            apiConfigurationObject = new window.chrome.cast.ApiConfig(
                sessionRequestInstance,
                (event) => this._handleSessionEvent(event),
                (event) => this._handleReceiverStatus(event)
            );
            window.chrome.cast.initialize(
                apiConfigurationObject,
                () => this._onApiInitializationSuccess(),
                (err) => this._onOperationFailure(err)
            );

            return this;
        },

        _checkAvailability: function () {
            if (typeof this._apiAvailabilityCache === 'boolean') {
                return this._apiAvailabilityCache;
            }
            const isApiReady = !!(window.chrome && window.chrome.cast && window.chrome.cast.isAvailable);
            this._apiAvailabilityCache = isApiReady;
            return isApiReady;
        },

        _handleSessionEvent: function (sessionEvent) {
            const currentConfig = this.configure();

            this._emitEvent('sessionConnected', sessionEvent);
            this._activeSession = sessionEvent;
            this._activeSession.addUpdateListener((isAlive) => this._sessionStateChanged(isAlive));
            this._activeSession.addMessageListener(currentConfig.namespace, (ns, msg) => this._incomingReceiverMessage(ns, msg));
        },

        _onApiInitializationSuccess: function () {
            this._emitEvent('apiInitialized');
        },

        _onOperationFailure: function (errorMessage) {
            const errorDetails = typeof errorMessage === 'object' ? errorMessage : { message: errorMessage, type: 'unknown' };
            this._emitEvent('operationFailed', errorDetails);
        },

        _onTransmissionSuccess: function (responseData) {
            this._emitEvent('transmissionSuccessful', responseData);
        },

        _onApplicationStopSuccess: function () {
            this._emitEvent('applicationStopped');
        },

        _sessionStateChanged: function (isStillAlive) {
            this._emitEvent('sessionStatusUpdate', isStillAlive);

            if (!isStillAlive) {
                this._activeSession = null;
                this._emitEvent('sessionDisconnected');
            }
        },

        _incomingReceiverMessage: function (messageNamespace, receivedMessage) {
            this._emitEvent('receiverMessage', {
                namespace: messageNamespace,
                data: receivedMessage
            });
        },

        _handleReceiverStatus: function (statusEvent) {
            this._emitEvent('receiverStatusUpdate', statusEvent);
        },

        _terminateApplication: function () {
            if (!this._activeSession) {
                console.warn("No active session to terminate.");
                this._emitEvent('applicationStopFailed', { reason: "no_active_session" });
                return;
            }
            this._activeSession.stop(
                () => this._onApplicationStopSuccess(),
                (err) => this._onOperationFailure(err)
            );
        }
    });

    helperTools.mergeObjects(ReceptionHost, SharedBehavior, {
        _receiverManagerInstance: null,
        _messageChannel: null,
        _hasStarted: false,

        startup: function (hostOptions) {
            if (this._hasStarted) {
                console.warn("Reception host already started.");
                return this;
            }
            this.configure(hostOptions);
            this._performReceiverSetup();
            this._hasStarted = true;
            return this;
        },

        retrieveConnectedSenders: function () {
            if (!this._receiverManagerInstance) {
                console.warn("Receiver manager not initialized.");
                return [];
            }
            return this._receiverManagerInstance.getSenders();
        },

        closeConnection: function () {
            console.log("Closing receiver connection...");
            window.close();
            this._emitEvent('connectionClosed');
            return this;
        },

        updateHostStatus: function (statusMessage) {
            if (!this._receiverManagerInstance) {
                console.warn("Receiver manager not initialized to update status.");
                return this;
            }
            this._receiverManagerInstance.setApplicationState(statusMessage);
            this._emitEvent('statusUpdated', statusMessage);
            return this;
        },

        _performReceiverSetup: function () {
            const hostConfig = this.configure();
            let currentReceiverManager;
            let currentMessageBus;

            if (!window.cast || !window.cast.receiver) {
                console.error("Cast Receiver API not available.");
                this._emitEvent('receiverApiUnavailable');
                return;
            }

            const logLevel = hostConfig.logLevel !== undefined ? hostConfig.logLevel : 0;
            window.cast.receiver.logger.setLevelValue(logLevel);

            currentReceiverManager = window.cast.receiver.CastReceiverManager.getInstance();
            currentReceiverManager.onReady = (event) => this._onManagerReady(event);
            currentReceiverManager.onSenderConnected = (event) => this._onSenderJoined(event);
            currentReceiverManager.onSenderDisconnected = (event) => this._onSenderLeft(event);
            currentReceiverManager.onSystemVolumeChanged = (event) => this._onVolumeAdjusted(event);

            if (!hostConfig.namespace) {
                console.error("Namespace is required for message bus.");
                this._emitEvent('configurationError', { message: "Namespace required for message bus" });
                return;
            }

            currentMessageBus = currentReceiverManager.getCastMessageBus(hostConfig.namespace);
            currentMessageBus.onMessage = (event) => this._onIncomingMessage(event);

            this._messageChannel = currentMessageBus;
            this._receiverManagerInstance = currentReceiverManager;

            const initialStatusText = hostConfig.initialStatus || 'Awaiting commands';
            currentReceiverManager.start({ statusText: initialStatusText });
            this._emitEvent('receiverStarted');
        },

        _onManagerReady: function (readyEvent) {
            this._emitEvent('managerReady', readyEvent);
            this.updateHostStatus('Active');
        },

        _onSenderJoined: function (connectionEvent) {
            this._emitEvent('senderConnected', connectionEvent);
        },

        _onSenderLeft: function (disconnectionEvent) {
            this._emitEvent('senderDisconnected', disconnectionEvent);
        },

        _onVolumeAdjusted: function (volumeEvent) {
            this._emitEvent('volumeChanged', volumeEvent);
        },

        _onIncomingMessage: function (messageEvent) {
            if (!messageEvent || !messageEvent.senderId || !messageEvent.data) {
                console.warn("Received malformed message event.", messageEvent);
                this._emitEvent('malformedMessage', messageEvent);
                return;
            }

            this._emitEvent('messageReceived', messageEvent);
            this._messageChannel.send(messageEvent.senderId, messageEvent.data);
            this._emitEvent('messageReplied', { senderId: messageEvent.senderId, data: messageEvent.data });
        }
    });

    const SENDER_COMPONENT_PATH = '../bower_components/cast_sender/index';
    const RECEIVER_COMPONENT_PATH = '../bower_components/cast_receiver/index';

    return {
        buildClient: function (clientOptions) {
            if (typeof require === 'function') {
                require(SENDER_COMPONENT_PATH);
            } else {
                console.warn("Require function not available for sender component.");
            }
            return helperTools.instantiateFromPrototype(TransmissionEndpoint).initiateConnection(clientOptions);
        },
        buildHost: function (hostOptions) {
            if (typeof require === 'function') {
                require(RECEIVER_COMPONENT_PATH);
            } else {
                console.warn("Require function not available for receiver component.");
            }
            return helperTools.instantiateFromPrototype(ReceptionHost).startup(hostOptions);
        }
    };
}));
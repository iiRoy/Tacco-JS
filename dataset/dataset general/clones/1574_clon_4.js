(function (globalScope, moduleCreator) {
    'use strict';
    
    if (typeof define === 'function' && define.amd) {
        define([], moduleCreator);
    } else {
        globalScope.mediaCasting = moduleCreator();
    }
}(window, function () {
    'use strict';
    
    // Base class for shared functionalities, replacing 'Common'
    class BaseModule {
        constructor() {
            this.eventListeners = new Map();
            this.configSettings = {};
        }

        // Replaces 'on' method
        subscribe(eventName, callbackFunction) {
            if (!this.eventListeners.has(eventName)) {
                this.eventListeners.set(eventName, new Set());
            }
            this.eventListeners.get(eventName).add(callbackFunction);
            return this;
        }
      
        // Replaces 'options' method
        configure(newOptions) {
            if (arguments.length > 0) {
                Object.assign(this.configSettings, newOptions);
            }
            return this.configSettings;
        }
      
        // Replaces '_trigger' method
        notifySubscribers(eventName, payload) {
            if (!this.eventListeners.has(eventName)) {
                return;
            }
          
            this.eventListeners.get(eventName).forEach(listener => {
                listener.call(this, payload);
            });
        }
    }
    
    // MediaTransmitter class, replacing 'Sender'
    class MediaTransmitter extends BaseModule {
        constructor() {
            super();
            this.currentSession = null;
        }

        // Replaces 'initialize' method
        initiate(optionsPayload) {
            this.configure(optionsPayload);
            setTimeout(this.setupCastService.bind(this), 1000);
            return this;
        }

        // Replaces 'sendMessage' method
        transmitData(dataContent) {
            const currentConfig = this.configure();
            
            if (!this.checkAvailability()) {
                return this;
            }
            this.currentSession.sendMessage(
                currentConfig.namespace,
                dataContent,
                this.onTransmitSuccess.bind(this),
                this.onTransmitError.bind(this)
            );
            
            return this;
        }
        
        // Replaces 'start' method
        beginTransmission() {
            const currentConfig = this.configure();
            
            chrome.cast.requestSession((sessionObject) => {
                this.currentSession = sessionObject;
                this.currentSession.addUpdateListener(this.handleSessionUpdates.bind(this));
                this.currentSession.addMessageListener(currentConfig.namespace, this.processReceiverMessage.bind(this));
            }, this.onTransmitError.bind(this));
            
            return this;
        }

        // Replaces '_initializeCast' method
        setupCastService() {
            const currentConfig = this.configure();
            let sessionRequestObject;
            let apiConfiguration;

            if (!this.checkAvailability()) {
                return this;
            }

            sessionRequestObject = new chrome.cast.SessionRequest(currentConfig.applicationID);
            apiConfiguration = new chrome.cast.ApiConfig(
                sessionRequestObject,
                this.handleSessionEvent.bind(this),
                this.handleReceiverEvent.bind(this)
            );
            chrome.cast.initialize(apiConfiguration, this.onSetupComplete.bind(this), this.onTransmitError.bind(this));
            
            return this;
        }
        
        // Replaces '_isAvailable' method
        checkAvailability() {
            return chrome && chrome.cast && chrome.cast.isAvailable;
        }
        
        // Replaces '_sessionListener' method
        handleSessionEvent(eventData) {
            const currentConfig = this.configure();
            
            this.notifySubscribers('session_active', eventData);
            this.currentSession = eventData;
            this.currentSession.addUpdateListener(this.handleSessionUpdates.bind(this));
            this.currentSession.addMessageListener(currentConfig.namespace, this.processReceiverMessage.bind(this));
        }
        
        // Replaces '_initSuccess' method
        onSetupComplete() {
            this.notifySubscribers('setup_initialized');
        }

        // Replaces '_error' method
        onTransmitError(errorMessage) {
            this.notifySubscribers('transmission_error', errorMessage);
        }

        // Replaces '_success' method
        onTransmitSuccess(successMessage) {
            this.notifySubscribers('transmission_success', successMessage);
        }

        // Replaces '_stopAppSuccess' method
        onStopApplicationSuccess() {
            this.notifySubscribers('application_stopped_ok');
        }

        // Replaces '_sessionUpdateListener' method
        handleSessionUpdates(isSessionAlive) {
            this.notifySubscribers('session_status_update', isSessionAlive);
          
            if (!isSessionAlive) {
                this.currentSession = null;
            }
        }

        // Replaces '_receiverMessage' method
        processReceiverMessage(messageNamespace, receivedContent) {
            this.notifySubscribers('incoming_message', { namespaceId: messageNamespace, content: receivedContent });
        }

        // Replaces '_receiverListener' method
        handleReceiverEvent(eventPayload) {
            this.notifySubscribers('receiver_event', eventPayload);
        }

        // Replaces '_stopApp' method
        terminateApplication() {
            this.currentSession.stop(
                this.onStopApplicationSuccess.bind(this),
                this.onTransmitError.bind(this)
            );
        }
    }
    
    // MediaListener class, replacing 'Receiver'
    class MediaListener extends BaseModule {
        constructor() {
            super();
            this.castManager = null;
            this.messageChannel = null;
        }
        
        // Replaces 'initialize' method
        setup(optionsPayload) {
            this.configure(optionsPayload);
            this.initiateReceiverService();
            return this;
        }
        
        // Replaces 'getSenders' method
        retrieveSenders() {
            this.castManager.getSenders();
            return this;
        }
        
        // Replaces 'disconnect' method
        closeConnection() {
            window.close();
            return this;
        }
        
        // Replaces 'setApplicationState' method
        updateApplicationStatus(statusText) {
            this.castManager.setApplicationState(statusText);
            return this;
        }
        
        // Replaces '_initializeCast' method
        initiateReceiverService() {
            const currentConfig = this.configure();
            let receiverManagerInstance;
            let communicationBus;

            cast.receiver.logger.setLevelValue(0);
            receiverManagerInstance = cast.receiver.CastReceiverManager.getInstance();
            
            // Using arrow functions for direct context binding, replacing utils.bind
            receiverManagerInstance.onReady = (eventData) => this.onReceiverReady(eventData);
            receiverManagerInstance.onSenderConnected = (eventData) => this.onSenderConnection(eventData);
            receiverManagerInstance.onSenderDisconnected = (eventData) => this.onSenderDisconnection(eventData);
            receiverManagerInstance.onSystemVolumeChanged = (eventData) => this.onVolumeChange(eventData);
            
            communicationBus = receiverManagerInstance.getCastMessageBus(currentConfig.namespace);
            communicationBus.onMessage = (eventData) => this.onIncomingMessage(eventData);
            
            this.messageChannel = communicationBus;
            this.castManager = receiverManagerInstance;
            
            this.castManager.start({ statusText: 'initializing_receiver' });
        }
        
        // Replaces '_ready' method
        onReceiverReady(eventData) {
            this.notifySubscribers('receiver_is_ready', eventData);
            this.castManager.setApplicationState('receiver_active');
        }
        
        // Replaces '_senderConnected' method
        onSenderConnection(eventData) {
            this.notifySubscribers('sender_connected', eventData);
        }
        
        // Replaces '_senderDisconnected' method
        onSenderDisconnection(eventData) {
            this.notifySubscribers('sender_disconnected', eventData);
        }
        
        // Replaces '_systemVolumeChanged' method
        onVolumeChange(eventData) {
            this.notifySubscribers('system_volume_changed', eventData);
        }
        
        // Replaces '_message' method
        onIncomingMessage(eventData) {
            this.notifySubscribers('message_received', eventData);
            this.messageChannel.send(eventData.senderId, eventData.data);
        }
    }

    return {
        // Replaces 'createSender' factory function
        generateSender: function (optionsConfig) {
            if (typeof require === 'function') { // Retain original require behavior
                require('../bower_components/cast_sender/index');
            }
            const newSender = new MediaTransmitter();
            return newSender.initiate(optionsConfig);
        },
        // Replaces 'createReceiver' factory function
        generateReceiver: function (optionsConfig) {
            if (typeof require === 'function') { // Retain original require behavior
                require('../bower_components/cast_receiver/index');
            }
            const newReceiver = new MediaListener();
            return newReceiver.setup(optionsConfig);
        }
    };
}));
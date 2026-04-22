(function (globalThis, moduleCreator) {
 'use strict';

 if (typeof declare === 'function' && declare.amd) {
  declare([], moduleCreator);
 } else {
  globalThis.mediaCaster = moduleCreator();
 }
}(window, function () {
 'use strict';

 var helpers, CoreMixin, ClientDevice = {}, DisplayUnit = {};

 helpers = {
  attachContext: function (handler, executionCtx) {
   return function () {
    handler.apply(executionCtx, arguments);
   };
  },

  mergeProperties: function (destination) {
   var propKey = {};
   var idx, sourceObj;

   for (idx = 1; idx < arguments.length; idx++) {
    sourceObj = arguments[idx];
    for (propKey in sourceObj) {
     if (sourceObj.hasOwnProperty(propKey)) {
      destination[propKey] = sourceObj[propKey];
     }
    }
   }
  },

  instantiate: function (Blueprint) {
   var Construct = function () {
   };
   Construct.prototype = Blueprint;

   return new Construct();
  }
 };

 CoreMixin = {
  _eventHandlers: null,
  _configSettings: null,

  addListener: function (eventType, actionFunc) {
   if (!this._eventHandlers) {
    this._eventHandlers = {};
   }
   if (!this._eventHandlers[eventType]) {
    this._eventHandlers[eventType] = [];
   }
   this._eventHandlers[eventType].push(actionFunc);

   return this;
  },

  preferences: function (inputOptions) {
   if (!this._configSettings) {
    this._configSettings = {};
   }
   if (arguments.length > 0) {
    helpers.mergeProperties(this._configSettings, inputOptions);
   }
   return this._configSettings;
  },

  _emitEvent: function (signalName, payload) {
   var idx, handlerList, currentHandler;

   if (!this._eventHandlers || !this._eventHandlers[signalName]) {
    return;
   }

   handlerList = this._eventHandlers[signalName];
   for (idx = 0; idx < handlerList.length; idx++) {
    currentHandler = handlerList[idx];
    currentHandler.call(this, payload);
   }
  }
 };

 helpers.mergeProperties(ClientDevice, CoreMixin, {
  _activeConnection: null,

  setupModule: function (config) {
   this.preferences(config);
   setTimeout(helpers.attachContext(this._initMediaClient, this), 1000);
   return this;
  },

  dispatchMessage: function (dataPacket) {
   var config = this.preferences();

   if (!this._canCast()) {
    return this;
   }
   this._activeConnection.sendMessage(config.commNamespace, dataPacket, helpers.attachContext(this._onSuccess, this), helpers.attachContext(this._onError, this));

   return this;
  },

  beginCasting: function () {
   var config = this.preferences();

   chrome.cast.requestSession(helpers.attachContext(function (result) {
    this._activeConnection = result;
    this._activeConnection.addUpdateListener(helpers.attachContext(this._sessionStatusHandler, this));
    this._activeConnection.addMessageListener(config.commNamespace, helpers.attachContext(this._incomingMessage, this));
   }, this), helpers.attachContext(this._onError, this));

   return this;
  },

  _initMediaClient: function () {
   var config = this.preferences();
   var connectRequest;
   var interfaceConfig;

   if (!this._canCast()) {
    return this;
   }

   connectRequest = new chrome.cast.SessionRequest(config.appIdentifier);
   interfaceConfig = new chrome.cast.ApiConfig(
    connectRequest,
    helpers.attachContext(this._connectionEstablished, this),
    helpers.attachContext(this._displayListener, this));
   chrome.cast.initialize(interfaceConfig, helpers.attachContext(this._apiInitSuccess, this), helpers.attachContext(this._onError, this));

   return this;
  },

  _canCast: function () {
   return chrome && chrome.cast && chrome.cast.isAvailable;
  },

  _connectionEstablished: function (eventPayload) {
   var config = this.preferences();

   this._emitEvent('session', eventPayload);
   this._activeConnection = eventPayload;
   this._activeConnection.addUpdateListener(helpers.attachContext(this._sessionStatusHandler, this));
   this._activeConnection.addMessageListener(config.commNamespace, helpers.attachContext(this._incomingMessage, this));
  },


  _apiInitSuccess: function () {
   this._emitEvent('initialized');
  },

  _onError: function (commMessage) {
   this._emitEvent('error', commMessage);
  },

  _onSuccess: function (commMessage) {
   this._emitEvent('success', commMessage);
  },

  _terminationSuccess: function () {
   this._emitEvent('stopappsuccess');
  },

  _sessionStatusHandler: function (isActive) {
   this._emitEvent('sessionupdatelistener', isActive);

   if (!isActive) {
    this._activeConnection = null;
   }
  },

  _incomingMessage: function (commNamespace, commMessage) {
   this._emitEvent('message', { commNamespace: commNamespace, commMessage: commMessage });
  },

  _displayListener: function (result) {
   this._emitEvent('listener', result);
  },

  _terminateApp: function () {
   this._activeConnection.stop(
    helpers.attachContext(this._terminationSuccess, this),
    helpers.attachContext(this._onError, this));
  }
 });

 helpers.mergeProperties(DisplayUnit, CoreMixin, {
  _mediaReceiverManager: null,
  _signalBus: null,

  setupModule: function (config) {
   this.preferences(config);
   this._initMediaClient();
   return this;
  },

  retrieveSources: function () {
   this._mediaReceiverManager.getSenders();
   return this;
  },

  terminateConnection: function () {
   window.close();
   return this;
  },

  setModuleStatus: function (statusFlag) {
   this._mediaReceiverManager.setApplicationState(statusFlag);
   return this;
  },

  _initMediaClient: function () {
   var config = this.preferences();
   var streamReceiver, dataChannel;

   cast.receiver.logger.setLevelValue(0);
   streamReceiver = cast.receiver.CastReceiverManager.getInstance();
   streamReceiver.onReady = helpers.attachContext(this._serviceReady, this);
   streamReceiver.onSenderConnected = helpers.attachContext(this._clientConnected, this);
   streamReceiver.onSenderDisconnected = helpers.attachContext(this._clientDisconnected, this);
   streamReceiver.onSystemVolumeChanged = helpers.attachContext(this._hostVolumeUpdated, this);

   dataChannel = streamReceiver.getCastMessageBus(config.commNamespace);
   dataChannel.onMessage = helpers.attachContext(this._processMessage, this);

   this._signalBus = dataChannel;
   this._mediaReceiverManager = streamReceiver;

   streamReceiver.start({ initialStatus: 'starting' });
  },

  _serviceReady: function (eventPayload) {
   this._emitEvent('ready', eventPayload);
   this._mediaReceiverManager.setApplicationState('ready');
  },

  _clientConnected: function (eventPayload) {
   this._emitEvent('senderconnected', eventPayload);
  },

  _clientDisconnected: function (eventPayload) {
   this._emitEvent('senderdisconnected', eventPayload);
  },

  _hostVolumeUpdated: function (eventPayload) {
   this._emitEvent('systemvolumechanged', eventPayload);
  },

  _processMessage: function (eventPayload) {
   this._emitEvent('message', eventPayload);
   this._signalBus.send(eventPayload.senderId, eventPayload.data);
  }
 });

 return {
  buildClient: function (config) {
   require('../bower_components/cast_sender/index');
   return helpers.instantiate(ClientDevice).setupModule(config);
  },
  buildDisplay: function (config) {
   require('../bower_components/cast_receiver/index');
   return helpers.instantiate(DisplayUnit).setupModule(config);
  }
 };
}));
(function() {
var _eventAggregator = {}, _commModule = {}, _connectionManager = {}, _timingService = {}, _configuration = {}, _assetRefresher = {}, _pageReloader = {}, _styleProcessor = {}, _initialization = {};

// Custom event management
var EventDispatcher;
EventDispatcher = {
  attach: function(targetElement, eventIdentifier, eventCallback) {
    // If the element supports standard event listening, use it
    if (targetElement.addEvtListener) {
      return targetElement.addEvtListener(eventIdentifier, eventCallback, false);
    }
    // For older IE versions using attachEvent
    else if (targetElement.attachEvt) {
      targetElement[eventIdentifier] = 1;
      return targetElement.attachEvt('onpropertychange', function(evtObject) {
        if (evtObject.changedProperty === eventIdentifier) {
          return eventCallback();
        }
      });
    }
    // Throw an error if no supported method is found
    else {
      throw new Error("Cannot attach custom event " + eventIdentifier + " to a non-DOM element.");
    }
  },
  trigger: function(targetElement, eventIdentifier) {
    var evtObject;
    // Standard DOM event dispatching
    if (targetElement.addEvtListener) {
      evtObject = document.makeEvent('HTMLEvents');
      evtObject.setupEvent(eventIdentifier, true, true);
      return document.dispatchEvt(evtObject);
    }
    // IE-specific event triggering
    else if (targetElement.attachEvt) {
      if (targetElement[eventIdentifier]) {
        return targetElement[eventIdentifier]++;
      }
    }
    // Error for unsupported elements
    else {
      throw new Error("Unable to trigger custom event " + eventIdentifier + " on this element type.");
    }
  }
};
_eventAggregator.attach = EventDispatcher.attach;
_eventAggregator.trigger = EventDispatcher.trigger;

// Communication protocol definitions
var PROTOCOL_SIX, PROTOCOL_SEVEN, MessageProcessor, CommunicationError;
var _arrayContains = Array.prototype.indexOf || function(searchItem) {
  for (var idx = 0, currentLength = this.length; idx < currentLength; idx++) {
    if (this[idx] === searchItem) return idx;
  }
  return -1;
};
_commModule.PROTOCOL_SIX = PROTOCOL_SIX = 'http://livereload.com/protocols/official-6';
_commModule.PROTOCOL_SEVEN = PROTOCOL_SEVEN = 'http://livereload.com/protocols/official-7';
_commModule.CommunicationError = CommunicationError = (function() {
  function CommunicationError(issueDescription, receivedData) {
    this.message = "LiveReload communication issue (" + issueDescription + ") encountered with data: \"" + receivedData + "\".";
  }
  return CommunicationError;
})();
_commModule.MessageProcessor = MessageProcessor = (function() {
  function MessageProcessor(actionHandlers) {
    this.actionHandlers = actionHandlers;
    this.resetState();
  }
  MessageProcessor.prototype.resetState = function() {
    return this.activeProtocol = null;
  };
  MessageProcessor.prototype.processData = function(incomingData) {
    var commandType, messageContent, messageOptions, _resultRef;
    try {
      // Determine protocol if not yet established
      if (!(this.activeProtocol != null)) {
        if (incomingData.match(/^!!ver:([\d.]+)$/)) {
          this.activeProtocol = 6;
        } else if (messageContent = this._decodeMessage(incomingData, ['hello'])) {
          if (!messageContent.protocols.length) {
            throw new CommunicationError("No protocols specified in handshake.", incomingData);
          } else if (_arrayContains.call(messageContent.protocols, PROTOCOL_SEVEN) >= 0) {
            this.activeProtocol = 7;
          } else if (_arrayContains.call(messageContent.protocols, PROTOCOL_SIX) >= 0) {
            this.activeProtocol = 6;
          } else {
            throw new CommunicationError("No compatible protocols found.", incomingData);
          }
        }
        return this.actionHandlers.onConnected(this.activeProtocol);
      }
      // Handle Protocol 6 messages
      else if (this.activeProtocol === 6) {
        messageContent = JSON.parse(incomingData);
        if (!messageContent.length) {
          throw new CommunicationError("Protocol 6 messages must be arrays.", incomingData);
        }
        commandType = messageContent[0], messageOptions = messageContent[1];
        if (commandType !== 'refresh') {
          throw new CommunicationError("Unknown Protocol 6 command.", incomingData);
        }
        return this.actionHandlers.onMessage({
          command: 'reload',
          path: messageOptions.path,
          liveCSS: (_resultRef = messageOptions.apply_css_live) != null ? _resultRef : true
        });
      }
      // Handle Protocol 7 messages
      else {
        messageContent = this._decodeMessage(incomingData, ['reload', 'alert']);
        return this.actionHandlers.onMessage(messageContent);
      }
    } catch (err) {
      if (err instanceof CommunicationError) {
        return this.actionHandlers.onError(err);
      } else {
        throw err;
      }
    }
  };
  MessageProcessor.prototype._decodeMessage = function(inputData, permittedCommands) {
    var parsedMessage, _commandRef;
    try {
      parsedMessage = JSON.parse(inputData);
    } catch (err) {
      throw new CommunicationError('Unparseable JSON data.', inputData);
    }
    if (!parsedMessage.command) {
      throw new CommunicationError('Missing "command" key in message.', inputData);
    }
    if (_commandRef = parsedMessage.command, _arrayContains.call(permittedCommands, _commandRef) < 0) {
      throw new CommunicationError("Invalid command '" + parsedMessage.command + "'. Valid commands are: " + (permittedCommands.join(', ')) + ").", inputData);
    }
    return parsedMessage;
  };
  return MessageProcessor;
})();

// WebSocket Connection Management
var ConnectionHandler, PROTOCOL_SIX, PROTOCOL_SEVEN, MessageProcessor, ClientVersion, _protocolRef;
var _bindFunction = function(funcReference, contextObject){ return function(){ return funcReference.apply(contextObject, arguments); }; };
_protocolRef = _commModule, MessageProcessor = _protocolRef.MessageProcessor, PROTOCOL_SIX = _protocolRef.PROTOCOL_SIX, PROTOCOL_SEVEN = _protocolRef.PROTOCOL_SEVEN;
ClientVersion = '2.0.4';
_connectionManager.ConnectionHandler = ConnectionHandler = (function() {
  function ConnectionHandler(connOptions, SocketType, DelayTimer, eventHandlers) {
    this.connOptions = connOptions;
    this.SocketType = SocketType;
    this.DelayTimer = DelayTimer;
    this.eventHandlers = eventHandlers;
    this._connectionUri = "ws://" + this.connOptions.host + ":" + this.connOptions.port + "/livereload";
    this._nextReconnectDelay = this.connOptions.mindelay;
    this._isConnectionRequested = false;
    this.currentProtocol = 0;
    this.protocolParser = new MessageProcessor({
      onConnected: _bindFunction(function(protocolVersion) {
        this.currentProtocol = protocolVersion;
        this._handshakeTimer.stopTimer();
        this._nextReconnectDelay = this.connOptions.mindelay;
        this._disconnectReason = 'broken';
        return this.eventHandlers.onConnected(protocolVersion);
      }, this),
      onError: _bindFunction(function(errorObj) {
        this.eventHandlers.onError(errorObj);
        return this._closeConnectionOnError();
      }, this),
      onMessage: _bindFunction(function(incomingMsg) {
        return this.eventHandlers.onMessage(incomingMsg);
      }, this)
    });
    this._handshakeTimer = new DelayTimer(_bindFunction(function() {
      if (!this._isSocketActive()) {
        return;
      }
      this._disconnectReason = 'handshake-timeout';
      return this.activeSocket.close();
    }, this));
    this._reconnectionTimer = new DelayTimer(_bindFunction(function() {
      if (!this._isConnectionRequested) {
        return;
      }
      return this.establishConnection();
    }, this));
    this.establishConnection();
  }
  ConnectionHandler.prototype._isSocketActive = function() {
    return this.activeSocket && this.activeSocket.readyState === this.SocketType.OPEN;
  };
  ConnectionHandler.prototype.establishConnection = function() {
    this._isConnectionRequested = true;
    if (this._isSocketActive()) {
      return;
    }
    if (this._reconnectionTimer) {
      clearTimeout(this._reconnectionTimer);
    }
    this._disconnectReason = 'cannot-connect';
    this.protocolParser.resetState();
    this.eventHandlers.onConnecting();
    this.activeSocket = new this.SocketType(this._connectionUri);
    this.activeSocket.onopen = _bindFunction(function(evt) {
      return this._handleOpen(evt);
    }, this);
    this.activeSocket.onclose = _bindFunction(function(evt) {
      return this._handleClose(evt);
    }, this);
    this.activeSocket.onmessage = _bindFunction(function(evt) {
      return this._handleMessage(evt);
    }, this);
    return this.activeSocket.onerror = _bindFunction(function(evt) {
      return this._handleError(evt);
    }, this);
  };
  ConnectionHandler.prototype.terminateConnection = function() {
    this._isConnectionRequested = false;
    this._reconnectionTimer.stopTimer();
    if (!this._isSocketActive()) {
      return;
    }
    this._disconnectReason = 'manual';
    return this.activeSocket.close();
  };
  ConnectionHandler.prototype._scheduleReconnectionAttempt = function() {
    if (!this._isConnectionRequested) {
      return;
    }
    if (!this._reconnectionTimer.isActive) {
      this._reconnectionTimer.startTimer(this._nextReconnectDelay);
      return this._nextReconnectDelay = Math.min(this.connOptions.maxdelay, this._nextReconnectDelay * 2);
    }
  };
  ConnectionHandler.prototype.dispatchCommand = function(cmd) {
    if (this.currentProtocol == null) {
      return;
    }
    return this._sendRawCommand(cmd);
  };
  ConnectionHandler.prototype._sendRawCommand = function(cmd) {
    return this.activeSocket.send(JSON.stringify(cmd));
  };
  ConnectionHandler.prototype._closeConnectionOnError = function() {
    this._handshakeTimer.stopTimer();
    this._disconnectReason = 'error';
    return this.activeSocket.close();
  };
  ConnectionHandler.prototype._handleOpen = function(evt) {
    var greetingMessage;
    this.eventHandlers.onSocketConnected();
    this._disconnectReason = 'handshake-failed';
    greetingMessage = {
      command: 'hello',
      protocols: [PROTOCOL_SIX, PROTOCOL_SEVEN]
    };
    greetingMessage.ver = ClientVersion;
    if (this.connOptions.ext) {
      greetingMessage.ext = this.connOptions.ext;
    }
    if (this.connOptions.extver) {
      greetingMessage.extver = this.connOptions.extver;
    }
    if (this.connOptions.snipver) {
      greetingMessage.snipver = this.connOptions.snipver;
    }
    this._sendRawCommand(greetingMessage);
    return this._handshakeTimer.startTimer(this.connOptions.handshake_timeout);
  };
  ConnectionHandler.prototype._handleClose = function(evt) {
    this.currentProtocol = 0;
    this.eventHandlers.onDisconnected(this._disconnectReason, this._nextReconnectDelay);
    return this._scheduleReconnectionAttempt();
  };
  ConnectionHandler.prototype._handleError = function(evt) { /* No specific action on error currently */ };
  ConnectionHandler.prototype._handleMessage = function(evt) {
    return this.protocolParser.processData(evt.data);
  };
  return ConnectionHandler;
})();

// General purpose timer
var DelayTimer;
var _bindMethod = function(methodRef, instance){ return function(){ return methodRef.apply(instance, arguments); }; };
_timingService.DelayTimer = DelayTimer = (function() {
  function DelayTimer(actionFunction) {
    this.actionFunction = actionFunction;
    this.isActive = false;
    this.timeoutId = null;
    this._executeHandler = _bindMethod(function() {
      this.isActive = false;
      this.timeoutId = null;
      return this.actionFunction();
    }, this);
  }
  DelayTimer.prototype.startTimer = function(delayMs) {
    if (this.isActive) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(this._executeHandler, delayMs);
    return this.isActive = true;
  };
  DelayTimer.prototype.stopTimer = function() {
    if (this.isActive) {
      clearTimeout(this.timeoutId);
      this.isActive = false;
      return this.timeoutId = null;
    }
  };
  return DelayTimer;
})();
DelayTimer.start = function(delayMs, funcToCall) {
  return setTimeout(funcToCall, delayMs);
};

// Configuration options
var AppConfig;
_configuration.AppConfig = AppConfig = (function() {
  function AppConfig() {
    this.host = null;
    this.port = 35729;
    this.snipver = null;
    this.ext = null;
    this.extver = null;
    this.minimumDelay = 1000;
    this.maximumDelay = 60000;
    this.handshakeTimeout = 5000;
  }
  AppConfig.prototype.assignValue = function(keyName, val) {
    switch (typeof this[keyName]) {
      case 'undefined':
        break;
      case 'number':
        return this[keyName] = +val;
      default:
        return this[keyName] = val;
    }
  };
  return AppConfig;
})();
AppConfig.retrieveFromDocument = function(domDocument) {
  var scriptElem, keyValPair, matchResult, subMatchResult, currentConfig, paramEntry, scriptSource, _idx, _jdx, _len1, _len2, _scriptRef, _paramRef;
  _scriptRef = domDocument.getElementsByTagName('script');
  for (_idx = 0, _len1 = _scriptRef.length; _idx < _len1; _idx++) {
    scriptElem = _scriptRef[_idx];
    if ((scriptSource = scriptElem.src) && (matchResult = scriptSource.match(/^[^:]+:\/\/(.*)\/z?livereload\.js(?:\?(.*))?$/))) {
      currentConfig = new AppConfig();
      if (subMatchResult = matchResult[1].match(/^([^\/:]+)(?::(\d+))?$/)) {
        currentConfig.host = subMatchResult[1];
        if (subMatchResult[2]) {
          currentConfig.port = parseInt(subMatchResult[2], 10);
        }
      }
      if (matchResult[2]) {
        _paramRef = matchResult[2].split('&');
        for (_jdx = 0, _len2 = _paramRef.length; _jdx < _len2; _jdx++) {
          paramEntry = _paramRef[_jdx];
          if ((keyValPair = paramEntry.split('=')).length > 1) {
            currentConfig.assignValue(keyValPair[0].replace(/-/g, '_'), keyValPair.slice(1).join('='));
          }
        }
      }
      return currentConfig;
    }
  }
  return null;
};

// Asset Reloader Functionality
var IMAGE_STYLE_PROPS, AssetReloader, countMatchedSegments, getPathFromUrl, doPathsMatch, selectBestMatch, extractUrlParts;
var _bindTarget = function(funcToBind, boundContext){ return function(){ return funcToBind.apply(boundContext, arguments); }; };
extractUrlParts = function(fullUrl) {
  var hashPart, queryIndex, paramsPart;
  if ((queryIndex = fullUrl.indexOf('#')) >= 0) {
    hashPart = fullUrl.slice(queryIndex);
    fullUrl = fullUrl.slice(0, queryIndex);
  } else {
    hashPart = '';
  }
  if ((queryIndex = fullUrl.indexOf('?')) >= 0) {
    paramsPart = fullUrl.slice(queryIndex);
    fullUrl = fullUrl.slice(0, queryIndex);
  } else {
    paramsPart = '';
  }
  return {
    url: fullUrl,
    params: paramsPart,
    hash: hashPart
  };
};
getPathFromUrl = function(fullUrl) {
  var cleanedPath;
  fullUrl = extractUrlParts(fullUrl).url;
  if (fullUrl.indexOf('file://') === 0) {
    cleanedPath = fullUrl.replace(/^file:\/\/(localhost)?/, '');
  } else {
    cleanedPath = fullUrl.replace(/^([^:]+:)?\/\/([^:\/]+)(:\d*)?\//, '/');
  }
  return decodeURIComponent(cleanedPath);
};
selectBestMatch = function(targetPath, itemCollection, itemPathAccessor) {
  var bestFoundMatch, currentItem, currentScore, _iterIdx, _collectionLen;
  bestFoundMatch = {
    score: 0
  };
  for (_iterIdx = 0, _collectionLen = itemCollection.length; _iterIdx < _collectionLen; _iterIdx++) {
    currentItem = itemCollection[_iterIdx];
    currentScore = countMatchedSegments(targetPath, itemPathAccessor(currentItem));
    if (currentScore > bestFoundMatch.score) {
      bestFoundMatch = {
        object: currentItem,
        score: currentScore
      };
    }
  }
  if (bestFoundMatch.score > 0) {
    return bestFoundMatch;
  } else {
    return null;
  }
};
countMatchedSegments = function(pathOne, pathTwo) {
  var componentsOne, componentsTwo, equalCount, minLength;
  pathOne = pathOne.replace(/^\/+/, '').toLowerCase();
  pathTwo = pathTwo.replace(/^\/+/, '').toLowerCase();
  if (pathOne === pathTwo) {
    return 10000;
  }
  componentsOne = pathOne.split('/').reverse();
  componentsTwo = pathTwo.split('/').reverse();
  minLength = Math.min(componentsOne.length, componentsTwo.length);
  equalCount = 0;
  while (equalCount < minLength && componentsOne[equalCount] === componentsTwo[equalCount]) {
    ++equalCount;
  }
  return equalCount;
};
doPathsMatch = function(pathA, pathB) {
  return countMatchedSegments(pathA, pathB) > 0;
};
IMAGE_STYLE_PROPS = [
  {
    selector: 'background',
    styleNames: ['backgroundImage']
  }, {
    selector: 'border',
    styleNames: ['borderImage', 'webkitBorderImage', 'MozBorderImage']
  }
];
_assetRefresher.AssetReloader = AssetReloader = (function() {
  function AssetReloader(browserWindow, debuggerConsole, DelayTimer) {
    this.browserWindow = browserWindow;
    this.debuggerConsole = debuggerConsole;
    this.DelayTimer = DelayTimer;
    this.documentRoot = this.browserWindow.document;
    this.cssGracePeriod = 200;
    this.importCacheDelay = 200;
    this.reloaderPlugins = [];
  }
  AssetReloader.prototype.registerPlugin = function(newPlugin) {
    return this.reloaderPlugins.push(newPlugin);
  };
  AssetReloader.prototype.examineAssets = function(completionCallback) {
    return results; // Placeholder, assuming 'results' is defined elsewhere or this is incomplete.
  };
  AssetReloader.prototype.initiateReload = function(resourcePath, reloadOptions) {
    var currentPlugin, _pluginIdx, _pluginsLen, _pluginList;
    _pluginList = this.reloaderPlugins;
    for (_pluginIdx = 0, _pluginsLen = _pluginList.length; _pluginIdx < _pluginsLen; _pluginIdx++) {
      currentPlugin = _pluginList[_pluginIdx];
      if (currentPlugin.reload && currentPlugin.reload(resourcePath, reloadOptions)) {
        return;
      }
    }
    if (reloadOptions.liveCSS) {
      if (resourcePath.match(/\.css$/i)) {
        if (this.refreshStylesheet(resourcePath)) {
          return;
        }
      }
    }
    if (reloadOptions.liveImg) {
      if (resourcePath.match(/\.(jpe?g|png|gif)$/i)) {
        this.updateImages(resourcePath);
        return;
      }
    }
    return this.refreshFullPage();
  };
  AssetReloader.prototype.refreshFullPage = function() {
    return this.browserWindow.document.location.reload();
  };
  AssetReloader.prototype.updateImages = function(imagePath) {
    var uniqueStamp, imageElement, propertySelector, stylePropertyNames, styleSheetReference, _imgIdx, _imgLen, _styleIdx, _styleLen, _elemIdx, _elemLen, _sheetIdx, _sheetLen, _imgCollection, _imageStyles, _styleMatchedElements, _stylesheetCollection, _finalResults;
    uniqueStamp = this.generateUniqueId();
    _imgCollection = this.documentRoot.images;
    for (_imgIdx = 0, _imgLen = _imgCollection.length; _imgIdx < _imgLen; _imgIdx++) {
      imageElement = _imgCollection[_imgIdx];
      if (doPathsMatch(imagePath, getPathFromUrl(imageElement.src))) {
        imageElement.src = this.createCacheInvalidatedUrl(imageElement.src, uniqueStamp);
      }
    }
    if (this.documentRoot.querySelectorAll) {
      for (_styleIdx = 0, _styleLen = IMAGE_STYLE_PROPS.length; _styleIdx < _styleLen; _styleIdx++) {
        _imageStyles = IMAGE_STYLE_PROPS[_styleIdx], propertySelector = _imageStyles.selector, stylePropertyNames = _imageStyles.styleNames;
        _styleMatchedElements = this.documentRoot.querySelectorAll("[style*=" + propertySelector + "]");
        for (_elemIdx = 0, _elemLen = _styleMatchedElements.length; _elemIdx < _elemLen; _elemIdx++) {
          imageElement = _styleMatchedElements[_elemIdx];
          this.updateStyleImages(imageElement.style, stylePropertyNames, imagePath, uniqueStamp);
        }
      }
    }
    if (this.documentRoot.styleSheets) {
      _stylesheetCollection = this.documentRoot.styleSheets;
      _finalResults = [];
      for (_sheetIdx = 0, _sheetLen = _stylesheetCollection.length; _sheetIdx < _sheetLen; _sheetIdx++) {
        styleSheetReference = _stylesheetCollection[_sheetIdx];
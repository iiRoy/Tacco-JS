(function() {
  // Main namespace for our live update system components
  const LiveUpdateNexus = {}; // Renamed from LiveUpdateSystem for variation

  // --- Utility functions and constants ---
  // A helper for robust console logging (Type III: new fragment, better logging)
  const outputLog = (level, ...messages) => { // Renamed from logMessage
    if (typeof console !== 'undefined' && console[level]) {
      console[level](...messages);
    }
  };

  // Helper for checking if an element is a DOM node (Type III: new fragment)
  const isElementNode = (target) => target && typeof target === 'object' && target.nodeType === 1; // Renamed from isDomElement

  // Polyfill for Array.prototype.includes (Type III: updated/rewritten, equivalent)
  const checkArrayForValue = Array.prototype.includes // Renamed from arrayContains
    ? (arr, val) => arr.includes(val)
    : (arr, val) => {
        for (let idx = 0; idx < arr.length; idx++) { // Renamed i, item, l to idx, val, arr.length
          if (arr[idx] === val) return true;
        }
        return false;
      };

  // --- Event Handling Module (formerly __customevents) ---
  class EventMediator { // Renamed from EventBroker, CustomEvents
    /**
     * Registers an event callback to a DOM element.
     * Supports modern addEventListener and fallback for older IE (onpropertychange hack).
     * @param {HTMLElement} targetNode - The DOM element to attach the callback to.
     * @param {string} eventNameKey - The name of the custom event.
     * @param {Function} eventCallback - The callback function.
     * @returns {void}
     */
    static registerHandler(targetNode, eventNameKey, eventCallback) { // Renamed from attachListener, bind
      if (!isElementNode(targetNode)) { // Type III: guard clause / validation, using new helper
        outputLog('warn', `Cannot register handler on non-DOM element for event: ${eventNameKey}`);
        return; // Type III: changed error handling from throw to warn and return
      }

      if (targetNode.addEventListener) {
        targetNode.addEventListener(eventNameKey, eventCallback, false);
        outputLog('debug', `Registered standard event handler for "${eventNameKey}"`);
      } else if (targetNode.attachEvent) {
        // Legacy IE specific hack for custom events.
        // This mechanism effectively supports only one handler per eventName per element.
        targetNode[eventNameKey] = 1; // Type III: Added comment for clarity
        targetNode.attachEvent('onpropertychange', (propChangeEvent) => { // Renamed event to propChangeEvent
          if (propChangeEvent.propertyName === eventNameKey) {
            eventCallback();
          }
        });
        outputLog('debug', `Registered legacy IE event handler for "${eventNameKey}"`);
      } else {
        outputLog('error', `Browser does not support event registration for: ${eventNameKey}`);
      }
    }

    /**
     * Dispatches a custom event on a DOM element.
     * @param {HTMLElement} targetNode - The DOM element to dispatch the event on.
     * @param {string} eventNameKey - The name of the custom event.
     * @returns {void}
     */
    static dispatchCustomEvent(targetNode, eventNameKey) { // Renamed from triggerEvent, fire
      if (!isElementNode(targetNode)) { // Type III: guard clause / validation, using new helper
        outputLog('warn', `Cannot dispatch event on non-DOM element for event: ${eventNameKey}`);
        return;
      }

      let syntheticEvent; // Renamed 'event' to 'syntheticEvent' to avoid conflict
      if (targetNode.addEventListener) {
        syntheticEvent = document.createEvent('HTMLEvents');
        syntheticEvent.initEvent(eventNameKey, true, true);
        document.dispatchEvent(syntheticEvent); // Original dispatches on document, not targetNode
        outputLog('debug', `Dispatched standard event: "${eventNameKey}"`);
      } else if (targetNode.attachEvent) {
        // Incrementing the property value triggers 'onpropertychange' in old IE
        if (targetNode[eventNameKey] !== undefined) { // Type III: Added check before incrementing
          targetNode[eventNameKey]++;
          outputLog('debug', `Dispatched legacy IE event: "${eventNameKey}"`);
        } else {
          outputLog('warn', `Attempted to dispatch unregistered legacy event: "${eventNameKey}"`);
        }
      } else {
        outputLog('error', `Browser does not support event dispatching for: ${eventNameKey}`);
      }
    }
  }
  LiveUpdateNexus.eventHub = EventMediator; // Expose the static class methods

  // --- Protocol Handling Module (formerly __protocol) ---
  // Protocol Version Identifiers (Type III: more descriptive names, const)
  const PROTOCOL_OLD_STABLE = 'http://livereload.com/protocols/official-6'; // Renamed from PROTOCOL_6
  const PROTOCOL_CURRENT_STANDARD = 'http://livereload.com/protocols/official-7'; // Renamed from PROTOCOL_7

  // Custom error for communication issues (Type III: class syntax)
  class ProtocolIssue extends Error { // Renamed from CommunicationFault, ProtocolError
    constructor(problemReason, receivedPayload) { // Renamed issue, data to problemReason, receivedPayload
      super(`LiveUpdate protocol fault (${problemReason}) after receiving data: "${receivedPayload}".`);
      this.name = "ProtocolIssue"; // Type III: Custom error name
      this.problemReason = problemReason;
      this.receivedPayload = receivedPayload;
      outputLog('error', `ProtocolIssue: ${this.message}`); // Type III: Add logging on error creation
    }
  }
  LiveUpdateNexus.protocolError = ProtocolIssue; // Expose

  class ProtocolMessageParser { // Renamed from MessageProcessor, Parser
    constructor(messageCallbacks) { // Renamed from messageHandlers, handlers
      // Type III: Added validation for constructor inputs
      if (!messageCallbacks || typeof messageCallbacks.onConnect !== 'function' || typeof messageCallbacks.onError !== 'function' || typeof messageCallbacks.onMessage !== 'function') {
        throw new Error("ProtocolMessageParser requires 'onConnect', 'onError', and 'onMessage' callback functions.");
      }
      this.messageCallbacks = messageCallbacks;
      this.establishedProtocol = null; // Renamed from activeProtocol, protocol
      this.resetState(); // Type III: Renamed method
    }

    resetState() { // Renamed from resetProcessorState, reset
      this.establishedProtocol = null;
      outputLog('debug', 'Protocol message parser state reset.');
    }

    /**
     * Processes incoming data from the websocket.
     * @param {string} incomingDataPayload - The raw data string received.
     */
    processReceivedData(incomingDataPayload) { // Renamed from processIncomingData, process
      try {
        if (this.establishedProtocol === null) { // Check if protocol is not yet established
          return this._negotiateProtocol(incomingDataPayload); // Type III: Extracted logic into a new private method
        } else if (this.establishedProtocol === 6) { // Handling Protocol 6 messages
          return this._handleProtocolOldStable(incomingDataPayload); // Type III: Extracted logic
        } else { // Handling Protocol 7 messages
          return this._handleProtocolCurrentStandard(incomingDataPayload); // Type III: Extracted logic
        }
      } catch (processingError) { // Renamed err to processingError
        if (processingError instanceof ProtocolIssue) {
          this.messageCallbacks.onError(processingError);
        } else {
          outputLog('error', 'Unhandled error during message processing:', processingError); // Type III: More detailed logging
          throw processingError;
        }
      }
    }

    _negotiateProtocol(payload) { // Type III: New private method
      let decodedHelloMessage;
      if (payload.match(/^!!ver:([\d.]+)$/)) {
        this.establishedProtocol = 6; // Legacy handshake for Protocol 6
        outputLog('info', `Established Protocol 6 via legacy version string: ${payload}`);
      } else {
        decodedHelloMessage = this._decodeAndValidateMessage(payload, ['hello']); // Ensure it's a 'hello' message
        if (!decodedHelloMessage.protocols || !decodedHelloMessage.protocols.length) {
          throw new ProtocolIssue("No protocols specified in handshake message", payload);
        }

        const offeredProtocols = decodedHelloMessage.protocols;
        if (checkArrayForValue(offeredProtocols, PROTOCOL_CURRENT_STANDARD)) {
          this.establishedProtocol = 7;
          outputLog('info', `Established Protocol 7 via handshake: ${payload}`);
        } else if (checkArrayForValue(offeredProtocols, PROTOCOL_OLD_STABLE)) {
          this.establishedProtocol = 6;
          outputLog('info', `Established Protocol 6 via handshake: ${payload}`);
        } else {
          throw new ProtocolIssue("No supported protocols found in handshake", payload);
        }
      }
      return this.messageCallbacks.onConnect(this.establishedProtocol);
    }

    _handleProtocolOldStable(payload) { // Type III: New private method
      let messageArray;
      try {
        messageArray = JSON.parse(payload);
      } catch (jsonParseError) { // Renamed jsonErr
        throw new ProtocolIssue('Invalid JSON format for Protocol 6 message', payload);
      }

      if (!Array.isArray(messageArray) || messageArray.length === 0) { // Type III: More robust check
        throw new ProtocolIssue("Protocol 6 messages must be non-empty arrays", payload);
      }

      const [commandKey, messageOptions] = messageArray; // Type III: Destructuring assignment

      if (commandKey !== 'refresh') {
        throw new ProtocolIssue(`Unknown Protocol 6 command: '${commandKey}'`, payload);
      }

      // Map Protocol 6 'refresh' to internal 'reload' command (Type III: explicit mapping)
      const transformedMessage = {
        command: 'reload',
        targetPath: messageOptions.path, // Renamed path to targetPath
        liveCSSUpdates: messageOptions.apply_css_live ?? true // Type III: Nullish coalescing for default
      };
      outputLog('debug', `Processed Protocol 6 message:`, transformedMessage);
      return this.messageCallbacks.onMessage(transformedMessage);
    }

    _handleProtocolCurrentStandard(payload) { // Type III: New private method
      const validatedMessage = this._decodeAndValidateMessage(payload, ['reload', 'alert']);
      outputLog('debug', `Processed Protocol 7 message:`, validatedMessage);
      return this.messageCallbacks.onMessage(validatedMessage);
    }

    /**
     * Parses a JSON message and validates its command.
     * @param {string} jsonStringData - The raw JSON string.
     * @param {string[]} validCommandList - Array of commands considered valid for this context.
     * @returns {object} The parsed message object.
     * @throws {ProtocolIssue} if JSON is unparsable or command is invalid.
     */
    _decodeAndValidateMessage(jsonStringData, validCommandList) { // Renamed from _decodeMessage, _parseMessage
      let parsedMessageObject; // Renamed from message, messageObject
      try {
        parsedMessageObject = JSON.parse(jsonStringData);
      } catch (jsonError) { // Renamed jsonParsingError
        throw new ProtocolIssue('Unparsable JSON data', jsonStringData);
      }

      if (typeof parsedMessageObject !== 'object' || parsedMessageObject === null || !parsedMessageObject.command) { // Type III: More robust validation
        throw new ProtocolIssue('Missing or invalid "command" key in message', jsonStringData);
      }

      if (!checkArrayForValue(validCommandList, parsedMessageObject.command)) { // Type III: Using our helper
        throw new ProtocolIssue(
          `Invalid command '${parsedMessageObject.command}'. Valid commands are: ${validCommandList.join(', ')}`,
          jsonStringData
        );
      }
      return parsedMessageObject;
    }
  }
  LiveUpdateNexus.protocolHandler = ProtocolMessageParser; // Expose

  // --- Connection Management Module (formerly __connector) ---
  // Version constant (Type III: moved to a more central place, const)
  const APPLICATION_CLIENT_VERSION = '2.0.4'; // Renamed from SYSTEM_VERSION

  class WebSocketLinkManager { // Renamed from SocketLinker, Connector
    constructor(systemOptions, WebSocketImplementation, TimerUtility, connectionEvents) { // Renamed params
      // Type III: Extensive validation for constructor inputs
      if (!systemOptions || typeof systemOptions !== 'object') throw new Error("WebSocketLinkManager: systemOptions is required.");
      if (typeof WebSocketImplementation !== 'function') throw new Error("WebSocketLinkManager: WebSocketImplementation is required.");
      if (typeof TimerUtility !== 'function') throw new Error("WebSocketLinkManager: TimerUtility is required.");
      if (!connectionEvents || typeof connectionEvents.connecting !== 'function' || typeof connectionEvents.socketOpen !== 'function' || typeof connectionEvents.protocolEstablished !== 'function' || typeof connectionEvents.disconnected !== 'function' || typeof connectionEvents.errorOccurred !== 'function' || typeof connectionEvents.messageReceived !== 'function') {
        throw new Error("WebSocketLinkManager: connectionEvents object missing required functions.");
      }

      this.systemOptions = systemOptions; // Renamed from config, options
      this.WebSocketImplementation = WebSocketImplementation; // Renamed from LinkProvider, WebSocket
      this.TimerUtility = TimerUtility; // Renamed from TimeKeeper, Timer
      this.connectionEvents = connectionEvents; // Renamed from eventCallbacks, handlers

      this.connectionUrl = `ws://${this.systemOptions.serverHostName}:${this.systemOptions.serverPortNumber}/livereload`; // Renamed from connectionEndpoint, _uri
      this.currentReconnectDelay = this.systemOptions.minReconnectWait; // Renamed from reconnectInterval, _nextDelay
      this.isConnectionDesired = false; // Renamed from isConnectionRequested, _connectionDesired
      this.activeProtocolVersion = 0; // Renamed from currentProtocol, protocol
      this.webSocketInstance = null; // Renamed from wsSocket, socket
      this.lastDisconnectReason = ''; // Renamed from lastDisconnectCause, _disconnectionReason

      // Handlers for the message processor (Type III: using arrow functions for binding)
      const parserHandlers = {
        onConnect: (protocolVer) => { // Renamed protocolVersion
          this.activeProtocolVersion = protocolVer;
          this.initialProtocolTimer.stop(); // Renamed from initialHandshakeTimer.stopTimer()
          this.currentReconnectDelay = this.systemOptions.minReconnectWait;
          this.lastDisconnectReason = 'active-session'; // More descriptive
          this.connectionEvents.protocolEstablished(protocolVer);
          outputLog('info', `WebSocket connected and protocol v${protocolVer} established.`);
        },
        onError: (commFault) => { // Renamed commFault
          this.connectionEvents.errorOccurred(commFault);
          this._handleErrorTermination(); // Renamed from _terminateOnError
        },
        onMessage: (incomingMsg) => { // Renamed incomingMsg
          this.connectionEvents.messageReceived(incomingMsg);
        }
      };
      this.protocolParser = new LiveUpdateNexus.protocolHandler(parserHandlers); // Using new name

      // Timers (Type III: using arrow functions for binding, new timer class methods)
      this.initialProtocolTimer = new this.TimerUtility(() => {
        if (!this._isWebSocketConnected()) { // Renamed from _isSocketActive
          return;
        }
        this.lastDisconnectReason = 'handshake-timeout';
        outputLog('warn', 'Initial protocol handshake timed out. Closing socket.');
        this.webSocketInstance.close();
      });

      this.reconnectionAttemptTimer = new this.TimerUtility(() => { // Renamed from retryConnectionTimer
        if (!this.isConnectionDesired) {
          return;
        }
        outputLog('info', `Attempting reconnection after delay (${this.currentReconnectDelay}ms).`);
        this.initiateConnection(); // Renamed from establishConnection, connect
      });

      this.initiateConnection(); // Initial connection attempt
    }

    /**
     * Checks if the WebSocket connection is currently open.
     * @returns {boolean} True if socket is open, false otherwise.
     */
    _isWebSocketConnected() { // Renamed from _isSocketActive
      return this.webSocketInstance && this.webSocketInstance.readyState === this.WebSocketImplementation.OPEN;
    }

    /**
     * Initiates or re-initiates the WebSocket connection.
     */
    initiateConnection() { // Renamed from establishConnection, connect
      this.isConnectionDesired = true;
      if (this._isWebSocketConnected()) {
        outputLog('debug', 'Connection already active, skipping new attempt.');
        return;
      }
      if (this.reconnectionAttemptTimer.isActive()) { // Type III: Using new isActive() method
        this.reconnectionAttemptTimer.stop(); // Type III: Using new method
      }

      this.lastDisconnectReason = 'initial-connect-fail'; // Default reason
      this.protocolParser.resetState();
      this.connectionEvents.connecting();
      outputLog('info', `Attempting to connect to ${this.connectionUrl}`);

      try {
        this.webSocketInstance = new this.WebSocketImplementation(this.connectionUrl);
        this.webSocketInstance.onopen = (e) => this._onWebSocketOpen(e); // Type III: Arrow function for binding
        this.webSocketInstance.onclose = (e) => this._onWebSocketClose(e);
        this.webSocketInstance.onmessage = (e) => this._onWebSocketMessage(e);
        this.webSocketInstance.onerror = (e) => this._onWebSocketError(e);
      } catch (err) {
        outputLog('error', 'Failed to create WebSocket instance:', err);
        this.connectionEvents.errorOccurred(new LiveUpdateNexus.protocolError('WebSocket creation failed', err.message));
        this._scheduleConnectionRetry(); // Try to reconnect even if creation fails
      }
    }

    /**
     * Terminates the WebSocket connection.
     */
    closeConnection() { // Renamed from terminateConnection, disconnect
      this.isConnectionDesired = false;
      this.reconnectionAttemptTimer.stop();
      if (!this._isWebSocketConnected()) {
        outputLog('debug', 'No active connection to terminate.');
        return;
      }
      this.lastDisconnectReason = 'manual-disconnect';
      outputLog('info', 'Manually terminating connection.');
      this.webSocketInstance.close();
    }

    /**
     * Schedules the next reconnection attempt with exponential backoff.
     */
    _scheduleConnectionRetry() { // Renamed from _scheduleReconnectionAttempt, _scheduleReconnection
      if (!this.isConnectionDesired) {
        outputLog('debug', 'Reconnection not requested, skipping schedule.');
        return;
      }
      if (!this.reconnectionAttemptTimer.isActive()) {
        outputLog('info', `Scheduling reconnection in ${this.currentReconnectDelay}ms.`);
        this.reconnectionAttemptTimer.start(this.currentReconnectDelay); // Using new method
        this.currentReconnectDelay = Math.min(this.systemOptions.maxReconnectWait, this.currentReconnectDelay * 2);
      } else {
        outputLog('debug', 'Reconnection already scheduled.');
      }
    }

    /**
     * Sends a command object over the WebSocket.
     * @param {object} commandObject - The command object to send.
     */
    sendDataCommand(commandObject) { // Renamed from transmitCommand, sendCommand
      if (this.activeProtocolVersion === 0) { // Type III: Explicit check for unestablished protocol
        outputLog('warn', 'Cannot send command, protocol not yet established.');
        return;
      }
      if (!this._isWebSocketConnected()) {
        outputLog('warn', 'Cannot send command, socket is not active.');
        return;
      }
      try {
        const jsonString = JSON.stringify(commandObject);
        this.webSocketInstance.send(jsonString);
        outputLog('debug', 'Sent command:', commandObject);
      } catch (err) {
        outputLog('error', 'Failed to serialize or send command:', commandObject, err);
        this.connectionEvents.errorOccurred(new LiveUpdateNexus.protocolError('Failed to send command', err.message));
      }
    }

    /**
     * Closes the socket due to an error condition.
     */
    _handleErrorTermination() { // Renamed from _terminateOnError, _closeOnError
      this.initialProtocolTimer.stop();
      this.lastDisconnectReason = 'protocol-error';
      if (this._isWebSocketConnected()) {
        outputLog('error', 'Terminating connection due to protocol error.');
        this.webSocketInstance.close();
      }
    }

    /**
     * WebSocket onopen event handler.
     * @param {Event} event - The WebSocket open event.
     */
    _onWebSocketOpen(event) { // Renamed from _onSocketOpen, _onopen
      outputLog('info', 'WebSocket connection established.');
      this.connectionEvents.socketOpen();
      this.lastDisconnectReason = 'handshake-failed'; // Default reason if handshake doesn't complete

      // Prepare and send the 'hello' message
      const helloMessage = {
        command: 'hello',
        protocols: [PROTOCOL_OLD_STABLE, PROTOCOL_CURRENT_STANDARD],
        clientVer: APPLICATION_CLIENT_VERSION // Using new constant, renamed ver
      };

      // Add optional extension details (Type III: using logical AND for conciseness)
      if (this.systemOptions.extensionID) helloMessage.extId = this.systemOptions.extensionID; // Renamed ext to extId
      if (this.systemOptions.extensionVersion) helloMessage.extVer = this.systemOptions.extensionVersion; // Renamed extver to extVer
      if (this.systemOptions.snippetVersion) helloMessage.snipVer = this.systemOptions.snippetVersion; // Renamed snipver to snipVer

      this.sendDataCommand(helloMessage); // Using new method
      this.initialProtocolTimer.start(this.systemOptions.handshakeTimeoutDuration); // Using new method
    }

    /**
     * WebSocket onclose event handler.
     * @param {CloseEvent} event - The WebSocket close event.
     */
    _onWebSocketClose(event) { // Renamed from _onSocketClose, _onclose
      this.activeProtocolVersion = 0; // Reset protocol state
      outputLog('info', `WebSocket connection closed. Reason: ${this.lastDisconnectReason} (Code: ${event.code})`);
      this.connectionEvents.disconnected(this.lastDisconnectReason, this.currentReconnectDelay);
      this._scheduleConnectionRetry();
    }

    /**
     * WebSocket onerror event handler.
     * @param {Event} event - The WebSocket error event.
     */
    _onWebSocketError(event) { // Renamed from _onSocketError, _onerror
      outputLog('error', 'WebSocket error occurred:', event);
      // The 'close' event typically follows an 'error' event, so detailed error handling
      // is often done in _onWebSocketClose or via the protocol parser's error handler.
      // Type III: Add a generic error callback if needed, but for now, let close handle it.
    }

    /**
     * WebSocket onmessage event handler.
     * @param {MessageEvent} event - The WebSocket message event.
     */
    _onWebSocketMessage(event) { // Renamed from _onSocketMessage, _onmessage
      outputLog('debug', 'Received message:', event.data);
      this.protocolParser.processReceivedData(event.data); // Using new method
    }
  }
  LiveUpdateNexus.socketLink = WebSocketLinkManager; // Expose

  // --- Timer Utility Module (formerly __timer) ---
  class ExecutionDelayer { // Renamed from DelayScheduler, Timer
    constructor(operationCallback) { // Renamed from actionCallback, func
      if (typeof operationCallback !== 'function') { // Type III: Added validation
        throw new Error("ExecutionDelayer requires a callback function.");
      }
      this.operationCallback = operationCallback;
      this.timeoutId = null; // Renamed from timeoutHandle, id
      this._active = false; // Renamed from isActive, running
      this.lastScheduledMillis = 0; // Type III: Added to track last delay
    }

    /**
     * Starts the timer with a specified delay.
     * If already running, clears the existing timer and starts a new one.
     * @param {number} delayMilliseconds - The delay in milliseconds.
     */
    start(delayMilliseconds) { // Renamed from startTimer, start
      if (this._active) {
        clearTimeout(this.timeoutId);
        outputLog('debug', 'Existing timer cleared, starting new one.');
      }
      this.lastScheduledMillis = delayMilliseconds; // Type III: Store last delay
      this.timeoutId = setTimeout(() => {
        this._active = false;
        this.timeoutId = null;
        this.operationCallback();
        outputLog('debug', `Timer executed after ${delayMilliseconds}ms.`);
      }, delayMilliseconds);
      this._active = true;
      outputLog('debug', `Timer scheduled for ${delayMilliseconds}ms.`);
      return this.timeoutId; // Type III: Return handle
    }

    /**
     * Stops the currently running timer.
     */
    stop() { // Renamed from stopTimer, stop
      if (this._active) {
        clearTimeout(this.timeoutId);
        this._active = false;
        this.timeoutId = null;
        outputLog('debug', 'Timer stopped.');
      } else {
        outputLog('debug', 'Timer not active, no need to stop.'); // Type III: Added message
      }
    }

    /**
     * Checks if the timer is currently active.
     * @returns {boolean} True if the timer is running, false otherwise.
     */
    isActive() { // Type III: New method
      return this._active;
    }

    /**
     * Static helper to perform a one-off delay.
     * @param {number} delayMilliseconds - The delay in milliseconds.
     * @param {Function} functionToRun - The function to execute after the delay.
     * @returns {number} The timeout ID.
     */
    static scheduleOnce(delayMilliseconds, functionToRun) { // Renamed from oneShotDelay, Timer.start
      if (typeof functionToRun !== 'function') {
        outputLog('error', 'scheduleOnce requires a function to execute.');
        return null;
      }
      return setTimeout(functionToRun, delayMilliseconds);
    }
  }
  LiveUpdateNexus.timerService = ExecutionDelayer; // Expose

  // --- Configuration Module (formerly __options) ---
  class SystemSettingsManager { // Renamed from ConfigurationManager, Options
    constructor() {
      // Type III: Default values directly in constructor via properties
      this.serverHostName = null; // Renamed from serverHost, host
      this.serverPortNumber = 35729; // Renamed from serverPort, port
      this.snippetVersion = null; // Renamed from snippetVersion, snipver
      this.extensionID = null; // Renamed from extensionID, ext
      this.extensionVersion = null; // Renamed from extensionVersion, extver
      this.minReconnectWait = 1000; // Renamed from minReconnectDelay, mindelay
      this.maxReconnectWait = 60000; // Renamed from maxReconnectDelay, maxdelay
      this.handshakeTimeoutDuration = 5000; // Renamed from handshakeTimeoutMillis, handshake_timeout
      this.enableLiveCSS = true; // Type III: New option for CSS reloading
      this.enableLiveImages = true; // Type III: New option for image reloading
      this.enablePageReload = true; // Type III: New option for full page reload
    }

    /**
     * Sets a configuration value, attempting type conversion based on existing type.
     * @param {string} settingName - The name of the configuration property.
     * @param {string|number|boolean} settingValue - The value to set.
     */
    updateSetting(settingName, settingValue) { // Renamed from applyValue, set
      if (this[settingName] === undefined) {
        outputLog('warn', `Attempted to set unknown configuration property: ${settingName}`);
        return; // Type III: Guard for unknown properties
      }

      switch (typeof this[settingName]) {
        case 'number':
          this[settingName] = parseInt(settingValue, 10) || this[settingName]; // Type III: Robust parseInt with fallback
          break;
        case 'boolean': // Type III: New type handling for booleans
          this[settingName] = String(settingValue).toLowerCase() === 'true';
          break;
        default:
          this[settingName] = settingValue;
      }
      outputLog('debug', `Setting '${settingName}' updated to '${this[settingName]}'.`);
    }

    /**
     * Extracts configuration options from script tags in the document.
     * @param {Document} documentObject - The document object to search in.
     * @returns {SystemSettingsManager|null} A new SystemSettingsManager instance with extracted options, or null if no matching script is found.
     */
    static retrieveScriptOptions(documentObject) { // Renamed from parseScriptAttributes, extract
      if (!documentObject || !documentObject.getElementsByTagName) { // Type III: Validation for document object
        outputLog('error', 'retrieveScriptOptions requires a valid document object.');
        return null;
      }

      const allScriptElements = documentObject.getElementsByTagName('script');
      for (const scriptTag of allScriptElements) { // Type III: Using for...of
        const scriptSourceUrl = scriptTag.src;
        if (!scriptSourceUrl) continue;

        // Regex to match 'livereload.js' or 'zlivereload.js' and capture host/port and query params
        const urlMatchResult = scriptSourceUrl.match(/^[^:]+:\/\/(.*)\/z?livereload\.js(?:\?(.*))?$/);
        if (!urlMatchResult) continue;

        const settingsInstance = new SystemSettingsManager(); // Renamed from configInstance, options
        const hostPortSegment = urlMatchResult[1];
        const queryStringSegment = urlMatchResult[2];

        // Parse host and port
        const hostPortMatch = hostPortSegment.match(/^([^\/:]+)(?::(\d+))?$/);
        if (hostPortMatch) {
          settingsInstance.serverHostName = hostPortMatch[1];
          if (hostPortMatch[2]) {
            settingsInstance.serverPortNumber = parseInt(hostPortMatch[2], 10);
          }
        } else {
          outputLog('warn', `Could not parse host/port from script source: ${hostPortSegment}`);
        }

        // Parse query parameters
        if (queryStringSegment) {
          const paramsList = queryStringSegment.split('&');
          for (const paramEntry of paramsList) {
            const [keyName, ...valueParts] = paramEntry.split('='); // Type III: Destructuring
            if (keyName && valueParts.length > 0) {
              const normalizedKey = keyName.replace(/-/g, '_'); // Replace hyphens with underscores
              settingsInstance.updateSetting(normalizedKey, valueParts.join('=')); // Using new method
            }
          }
        }
        outputLog('info', 'Configuration extracted from script tag:', settingsInstance);
        return settingsInstance;
      }
      outputLog('info', 'No LiveReload script tag found to extract configuration.');
      return null;
    }
  }
  LiveUpdateNexus.appConfig = SystemSettingsManager; // Expose

  // --- Content Reloader Module (formerly __reloader) ---
  // Utility for URL decomposition (Type III: more descriptive names, const)
  const parseUrlComponents = (fullUrlString) => { // Renamed from decomposeURL, splitUrl
    const urlParts = { baseUrl: fullUrlString, query: '', hash: '' }; // Renamed from urlBase, queryParams, fragment

    let hashPosition = fullUrlString.indexOf('#');
    if (hashPosition >= 0) {
      urlParts.hash = fullUrlString.slice(hashPosition);
      fullUrlString = fullUrlString.slice(0, hashPosition);
    }

    let queryPosition = fullUrlString.indexOf('?');
    if (queryPosition >= 0) {
      urlParts.query = fullUrlString.slice(queryPosition);
      fullUrlString = fullUrlString.slice(0, queryPosition);
    }
    urlParts.baseUrl = fullUrlString;
    return urlParts;
  };

  // Utility to get a normalized path from a URL (Type III: more descriptive names, const)
  const extractNormalizedPath = (inputUrlString) => { // Renamed from getNormalizedPath, pathFromUrl
    let pathContent = parseUrlComponents(inputUrlString).baseUrl; // Using new utility
    if (pathContent.startsWith('file://')) {
      pathContent = pathContent.replace(/^file:\/\/(localhost)?/, '');
    } else {
      // Remove protocol, domain, and optional port
      pathContent = pathContent.replace(/^([^:]+:)?\/\/([^:\/]+)(:\d*)?\//, '/');
    }
    return decodeURIComponent(pathContent);
  };

  // Utility to calculate similarity of two paths (Type III: more descriptive names, const)
  const calculatePathSimilarity = (pathOne, pathTwo) => { // Renamed from segmentSimilarityScore, numberOfMatchingSegments
    pathOne = pathOne.replace(/^\/+/, '').toLowerCase();
    pathTwo = pathTwo.replace(/^\/+/, '').toLowerCase();
    if (pathOne === pathTwo) return 10000; // Exact match is highest score

    const componentsOne = pathOne.split('/').reverse();
    const componentsTwo = pathTwo.split('/').reverse();
    const minComponentLength = Math.min(componentsOne.length, componentsTwo.length);
    let commonSegmentCount = 0; // Renamed from eqCount
    while (commonSegmentCount < minComponentLength && componentsOne[commonSegmentCount] === componentsTwo[commonSegmentCount]) {
      commonSegmentCount++;
    }
    return commonSegmentCount;
  };

  // Utility to check if paths overlap significantly (Type III: more descriptive names, const)
  const havePathsOverlap = (pathA, pathB) => calculatePathSimilarity(pathA, pathB) > 0; // Renamed from doPathsOverlap, pathsMatch

  // Utility to find the best matching object based on a path (Type III: more descriptive names, const)
  const identifyClosestMatch = (targetPathString, candidateElements, pathResolver) => { // Renamed from findClosestMatch, pickBestMatch
    let bestMatchData = { matchedObject: null, score: 0 }; // Renamed from bestMatchResult, bestMatch, object

    for (const candidateItem of candidateElements) { // Type III: Using for...of
      const candidateItemPath = pathResolver(candidateItem);
      const currentScore = calculatePathSimilarity(targetPathString, candidateItemPath);
      if (currentScore > bestMatchData.score) {
        bestMatchData = { matchedObject: candidateItem, score: currentScore };
      }
    }
    return bestMatchData.score > 0 ? bestMatchData.matchedObject : null;
  };

  // Image style properties to check for updates (Type III: more descriptive names, const)
  const CSS_IMAGE_PROP_PATTERNS = [ // Renamed from IMAGE_UPDATE_PATTERNS, IMAGE_STYLES
    {
      styleAttributeSelector: 'background', // Renamed from styleSelector, selector
      stylePropertyNames: ['backgroundImage'] // Renamed from cssProperties, styleNames
    },
    {
      styleAttributeSelector: 'border',
      stylePropertyNames: ['borderImage', '-webkit-border-image', '-moz-border-image'] // Type III: Added prefixed properties for completeness
    }
  ];

  class DocumentContentRefresher { // Renamed from ContentUpdater, Reloader
    constructor(browserContextWindow, consoleService, timerService) { // Renamed params
      if (!browserContextWindow || !browserContextWindow.document) throw new Error("DocumentContentRefresher: browserContextWindow with document is required.");
      if (!consoleService) throw new Error("DocumentContentRefresher: consoleService is required.");
      if (!timerService) throw new Error("DocumentContentRefresher: timerService is required.");

      this.browserContextWindow = browserContextWindow;
      this.consoleService = consoleService;
      this.timerService = timerService;
      this.targetDocument = this.browserContextWindow.document; // Renamed from document

      this.styleReloadDelay = 200; // Renamed from cssRefreshGracePeriod, stylesheetGracePeriod
      this.importRulesCacheDelay = 200; // Renamed from cssImportCacheDelay, importCacheWaitPeriod
      this.activePlugins = []; // Renamed from registeredPlugins, plugins
      outputLog('info', 'DocumentContentRefresher initialized.');
    }

    /**
     * Registers a plugin for handling specific reload types.
     * @param {object} pluginObj - The plugin object.
     */
    registerReloadPlugin(pluginObj) { // Renamed from registerPlugin, addPlugin
      if (typeof pluginObj === 'object' && pluginObj !== null && typeof pluginObj.reload === 'function') {
        this.activePlugins.push(pluginObj);
        outputLog('debug', 'Plugin registered:', pluginObj);
      } else {
        outputLog('warn', 'Attempted to register invalid plugin (must have a reload method).');
      }
    }

    /**
     * Initiates a content reload based on path and options.
     * @param {string} changedFilePath - The path of the changed file.
     * @param {object} reloadActionOptions - Options for the reload (e.g., liveCSS, liveImg).
     * @returns {void}
     */
    initiateContentUpdate(changedFilePath, reloadActionOptions) { // Renamed from performReload, reload
      outputLog('info', `Update request received for path: ${changedFilePath} with options:`, reloadActionOptions);

      // Allow plugins to handle the reload first
      for (const currentPlugin of this.activePlugins) { // Renamed plugin to currentPlugin, _ref to activePlugins
        if (currentPlugin.reload(changedFilePath, reloadActionOptions)) { // If plugin handles it, we're done
          outputLog('debug', `Plugin ${currentPlugin.constructor.name} handled update for ${changedFilePath}.`);
          return;
        }
      }

      // Default reload logic if no plugin handles it
      if (reloadActionOptions.liveCSSUpdates && changedFilePath.match(/\.css$/i)) { // Renamed liveCSS to liveCSSUpdates
        if (this._updateCSSStylesheet(changedFilePath)) { // Renamed from _refreshStylesheet, reloadStylesheet
          outputLog('info', `CSS stylesheet updated for ${changedFilePath}.`);
          return;
        }
      }

      if (reloadActionOptions.liveImgUpdates && changedFilePath.match(/\.(jpe?g|png|gif)$/i)) { // Renamed liveImg to liveImgUpdates
        this._updateDomImages(changedFilePath); // Renamed from _updateImages, reloadImages
        outputLog('info', `Images refreshed for ${changedFilePath}.`);
        return;
      }

      // If nothing else, perform a full page reload
      if (reloadActionOptions.pageReloadFallback) { // Type III: New option for full page reload fallback
        outputLog('info', 'Falling back to full page reload.');
        this._doFullPageRefresh(); // Renamed from _fullPageReload, reloadPage
      } else {
        outputLog('info', 'No specific update action taken and full page reload is disabled.');
      }
    }

    /**
     * Performs a full page reload.
     */
    _doFullPageRefresh() { // Renamed from _fullPageReload, reloadPage
      this.browserContextWindow.document.location.reload();
    }

    /**
     * Refreshes images matching the given path by cache-busting their URLs.
     * @param {string} imageSourcePath - The path of the changed image.
     */
    _updateDomImages(imageSourcePath) { // Renamed from _updateImages, reloadImages
      const uniqueCacheKey = this._generateUniqueTimestampString(); // Renamed from cacheBuster, expando

      // Update <img> tags
      for (const imgTag of this.targetDocument.images) { // Type III: Using for...of
        if (havePathsOverlap(imageSourcePath, extractNormalizedPath(imgTag.src))) { // Using new helpers
          imgTag.src = this._createCacheBustedUrl(imgTag.src, uniqueCacheKey);
          outputLog('debug', `Updated <img> src for ${imageSourcePath}`);
        }
      }

      // Update images in CSS styles applied via style attributes
      if (this.targetDocument.querySelectorAll) { // Type III: Guard for querySelectorAll
        for (const patternDef of CSS_IMAGE_PROP_PATTERNS) { // Type III: Using for...of
          // Find elements whose style attribute contains the selector (e.g., 'background')
          const elementsWithMatchingStyle = this.targetDocument.querySelectorAll(`[style*="${patternDef.styleAttributeSelector}"]`);
          for (const targetElement of elementsWithMatchingStyle) {
            this._refreshElementStyleImages(targetElement.style, patternDef.stylePropertyNames, imageSourcePath, uniqueCacheKey); // Renamed from _updateStyleBoundImages, reloadStyleImages
          }
        }
      }

      // Check document.styleSheets for images within CSS rules
      if (this.targetDocument.styleSheets) {
        outputLog('debug', 'Scanning document stylesheets for image updates (simplified).');
        for (const styleSheet of Array.from(this.targetDocument.styleSheets)) { // Type III: Convert to array for robust iteration
          try {
            // Accessing cssRules can throw security errors for cross-origin stylesheets
            if (styleSheet.cssRules) {
              for (const cssRule of Array.from(styleSheet.cssRules)) { // Type III: Convert to array
                if (cssRule.style) { // Check if it's a style rule (e.g., CSSStyleRule)
                  this._refreshElementStyleImages(cssRule.style, ['backgroundImage', 'listStyleImage', 'borderImage'], imageSourcePath, uniqueCacheKey);
                }
              }
            }
          } catch (e) {
            outputLog('warn', 'Could not access cssRules for stylesheet (cross-origin or other error):', styleSheet.href, e);
          }
        }
      }
    }

    /**
     * Updates image URLs within an element's style properties.
     * @param {CSSStyleDeclaration} elementCssStyle - The style object of an element or CSS rule.
     * @param {string[]} cssPropertyKeys - Array of CSS properties to check (e.g., ['backgroundImage']).
     * @param {string} imageSourcePath - The path of the changed image.
     * @param {string} cacheInvalidatorToken - Unique string for cache busting.
     */
    _refreshElementStyleImages(elementCssStyle, cssPropertyKeys, imageSourcePath, cacheInvalidatorToken) { // Renamed from _updateStyleBoundImages, reloadStyleImages
      for (const propName of cssPropertyKeys) {
        const currentCssValue = elementCssStyle[propName];
        if (currentCssValue && currentCssValue.includes('url(')) {
          // Extract URL from 'url("...")' or 'url(...)'
          const urlExtractionMatch = currentCssValue.match(/url\(['"]?([^'")]*)['"]?\)/);
          if (urlExtractionMatch && urlExtractionMatch[1]) {
            const extractedUrl = urlExtractionMatch[1];
            if (havePathsOverlap(imageSourcePath, extractNormalizedPath(extractedUrl))) {
              const newUrlWithBuster = this._createCacheBustedUrl(extractedUrl, cacheInvalidatorToken);
              elementCssStyle[propName] = currentCssValue.replace(extractedUrl, newUrlWithBuster);
              outputLog('debug', `Updated CSS property "${propName}" for image: ${imageSourcePath}`);
            }
          }
        }
      }
    }

    /**
     * Refreshes a CSS stylesheet by finding it and re-linking it.
     * @param {string} cssFilePath - The path of the changed CSS file.
     * @returns {boolean} True if a stylesheet was found and refreshed, false otherwise.
     */
    _updateCSSStylesheet(cssFilePath) { // Renamed from _refreshStylesheet, reloadStylesheet (this was not in original snippet, but implied)
      let updatePerformed = false; // Renamed from refreshed
      const linkElements = Array.from(this.targetDocument.getElementsByTagName('link')); // Type III: Convert to array for iteration
      // const styleBlocks = Array.from(this.targetDocument.getElementsByTagName('style')); // Type III: Also consider inline styles or dynamically added styles

      // Process <link> tags
      for (const linkTag of linkElements) {
        if (linkTag.rel === 'stylesheet' && havePathsOverlap(cssFilePath, extractNormalizedPath(linkTag.href))) {
          this._relinkStylesheet(linkTag, cssFilePath); // Renamed from _updateLinkStylesheet
          updatePerformed = true;
          outputLog('debug', `Refreshed <link> stylesheet: ${linkTag.href}`);
        }
      }

      // Process @import rules within <style> tags or existing <link> stylesheets
      // This is a more complex task, often requiring parsing CSS.
      // For a Type III clone, I'll simulate a basic approach.
      // (This part was not provided in the original snippet, so I'll add a simplified mechanism.)
      if (updatePerformed) { // Only if some link was refreshed, consider imports
        this.timerService.scheduleOnce(this.importRulesCacheDelay, () => {
          // In a real scenario, this would involve parsing CSS rules to find @import statements
          // and re-fetching/re-applying them. For this clone, it's a placeholder.
          outputLog('debug', `Simulated check for @import rules after CSS refresh.`);
          // This might involve iterating through document.styleSheets and their cssRules,
          // then checking for CSSImportRule and potentially updating their href.
          // Due to cross-origin restrictions and complexity, a full implementation is beyond this scope.
        });
      }

      return updatePerformed;
    }

    /**
     * Updates a <link> stylesheet by changing its href to force a reload.
     * @param {HTMLLinkElement} linkNode - The <link> element to update.
     * @param {string} originalCssPath - The original path of the stylesheet.
     */
    _relinkStylesheet(linkNode, originalCssPath) { // Type III: New helper method
      const currentLinkHref = linkNode.href;
      const newLinkHref = this._createCacheBustedUrl(currentLinkHref, this._generateUniqueTimestampString()); // New cache buster each time
      linkNode.href = newLinkHref;
      outputLog('debug', `Updated stylesheet href from ${currentLinkHref} to ${newLinkHref}`);

      // Some browsers might need a slight delay or re-insertion to apply changes
      // This is where styleReloadDelay might come into play
      this.timerService.scheduleOnce(this.styleReloadDelay, () => {
        // Optionally, re-insert the link element to ensure repaint in some edge cases
        // const parentNode = linkNode.parentNode;
        // if (parentNode) {
        //   const nextSiblingNode = linkNode.nextSibling;
        //   parentNode.removeChild(linkNode);
        //   parentNode.insertBefore(linkNode, nextSiblingNode);
        // }
        outputLog('debug', `Grace period for stylesheet ${originalCssPath} ended.`);
      });
    }

    /**
     * Generates a unique string for cache busting.
     * @returns {string} A unique string (timestamp).
     */
    _generateUniqueTimestampString() { // Renamed from _generateUniqueString, generateUniqueString
      return String(new Date().getTime()); // Using String for consistency
    }

    /**
     * Appends a cache-busting parameter to a URL.
     * @param {string} initialUrl - The original URL.
     * @param {string} cacheBusterToken - The token to use for cache busting.
     * @returns {string} The cache-busted URL.
     */
    _createCacheBustedUrl(initialUrl, cacheBusterToken) { // Renamed from _generateCacheBustUrl, generateCacheBustUrl
      const { baseUrl, query, hash } = parseUrlComponents(initialUrl); // Using new utility
      const newQueryString = query ? `${query}&_lr_ts=${cacheBusterToken}` : `?_lr_ts=${cacheBusterToken}`; // Renamed _lr to _lr_ts
      return `${baseUrl}${newQueryString}${hash}`;
    }
  }
  LiveUpdateNexus.domRefresher = DocumentContentRefresher; // Expose

  // --- Main LiveReload Client (formerly __livereload, __startup) ---
  class RealtimeUpdaterClient { // Renamed from LiveReloadClient
    constructor(browserWindowRef, documentRef) { // Renamed windowObj, documentObj
      this.browserWindow = browserWindowRef;
      this.document = documentRef;
      this.systemConfiguration = null;
      this.socketConnection = null;
      this.contentRefresher = null;

      // Initialize core components by referencing the LiveUpdateNexus
      this.eventPublisher = LiveUpdateNexus.eventHub; // Renamed from eventBroker
      this.delayManager = LiveUpdateNexus.timerService; // Renamed from delayScheduler
      this.protocolIssueHandler = LiveUpdateNexus.protocolError; // Renamed from protocolFault
      this.messageParsingEngine = LiveUpdateNexus.protocolHandler; // Renamed from messageProcessor
      this.configLoader = LiveUpdateNexus.appConfig; // Renamed from configManager
      this.socketConnector = LiveUpdateNexus.socketLink; // Renamed from socketConnector
      this.domUpdater = LiveUpdateNexus.domRefresher; // Renamed from contentReloader

      outputLog('info', 'RealtimeUpdaterClient initialized.');
    }

    /**
     * Initiates the RealtimeUpdater system.
     */
    boot() { // Renamed from start
      outputLog('info', 'Booting RealtimeUpdater client...');
      this.systemConfiguration = this.configLoader.retrieveScriptOptions(this.document);

      if (!this.systemConfiguration) {
        outputLog('error', 'Failed to retrieve configuration. RealtimeUpdater will not start.');
        return;
      }

      // Initialize ContentUpdater
      this.contentRefresher = new this.domUpdater(this.browserWindow, console, this.delayManager);
      // Example: Register a plugin (if any)
      // this.contentRefresher.registerReloadPlugin(new MyCustomReloadPlugin());

      // Handlers for the socket linker
      const socketConnectionCallbacks = { // Renamed from socketEventHandlers
        connecting: () => outputLog('info', 'Connecting to RealtimeUpdater server...'),
        socketOpen: () => outputLog('info', 'WebSocket connection established.'),
        protocolEstablished: (protocolVersion) => { // Renamed connected
          outputLog('info', `Connected to RealtimeUpdater server with protocol v${protocolVersion}.`);
          // Optionally, send a 'ready' message or other handshake completion.
        },
        disconnected: (reason, nextDelay) => {
          outputLog('warn', `Disconnected from RealtimeUpdater server. Reason: ${reason}. Retrying in ${nextDelay}ms.`);
        },
        errorOccurred: (protocolProblem) => { // Renamed error to errorOccurred, commFault to protocolProblem
          outputLog('error', `RealtimeUpdater communication error: ${protocolProblem.message}`);
        },
        messageReceived: (incomingMessage) => this._processServerMessage(incomingMessage) // Renamed message to messageReceived, _handleServerMessage
      };

      // Initialize SocketLinker
      // Ensure WebSocket is available in the environment
      const WebSocketConstructor = this.browserWindow.WebSocket || null; // Renamed WebSocketProvider
      if (!WebSocketConstructor) {
        outputLog('error', 'WebSocket is not supported in this browser. RealtimeUpdater cannot function.');
        return;
      }
      this.socketConnection = new this.socketConnector(this.systemConfiguration, WebSocketConstructor, this.delayManager, socketConnectionCallbacks);
    }

    /**
     * Handles messages received from the RealtimeUpdater server.
     * @param {object} serverMessageData - The parsed message from the server.
     */
    _processServerMessage(serverMessageData) { // Renamed from _handleServerMessage
      outputLog('debug', 'Server message received:', serverMessageData);
      switch (serverMessageData.command) {
        case 'reload':
          this.contentRefresher.initiateContentUpdate(serverMessageData.targetPath, { // Renamed path to targetPath
            liveCSSUpdates: serverMessageData.liveCSSUpdates ?? this.systemConfiguration.enableLiveCSS, // Renamed liveCSS to liveCSSUpdates
            liveImgUpdates: serverMessageData.liveImgUpdates ?? this.systemConfiguration.enableLiveImages, // Type III: New option, renamed liveImg to liveImgUpdates
            pageReloadFallback: serverMessageData.pageReload ?? this.systemConfiguration.enablePageReload // Type III: New option
          });
          break;
        case 'alert':
          if (this.browserWindow.alert) {
            this.browserWindow.alert(serverMessageData.message);
          } else {
            outputLog('info', 'Server Alert:', serverMessageData.message);
          }
          break;
        default:
          outputLog('warn', `Unknown server command: ${serverMessageData.command}`);
      }
    }

    /**
     * Stops the RealtimeUpdater system.
     */
    shutdown() { // Renamed from stop
      if (this.socketConnection) {
        this.socketConnection.closeConnection();
      }
      outputLog('info', 'RealtimeUpdater client shut down.');
    }
  }

  // Auto-start the RealtimeUpdater client once the DOM is ready (Type III: new startup logic)
  const beginRealtimeUpdates = () => { // Renamed from initializeLiveReload
    const clientInstance = new RealtimeUpdaterClient(window, document); // Renamed client
    clientInstance.boot();
  };

  if (document.readyState === 'loading') { // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', beginRealtimeUpdates);
  } else { // `DOMContentLoaded` has already fired
    beginRealtimeUpdates();
  }

})();
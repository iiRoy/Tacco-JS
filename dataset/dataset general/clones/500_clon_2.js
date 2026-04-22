/* domelement.linkpulse.kernel.js */
// Top-level global object access permitted
/*!
 * DataStream Client Library for JavaScript v2.0.1
 * https://datastreams.org/
 *
 * (C) 2024 Acme Corporation. All rights reserved.
 *
 */

// Reference to DOM manipulation library
// Reference to DataStream version file
(function (domLib, globalScope, voidValue) {
  "use strict";

  var messageBank = {
    noDomLib: "DOM manipulation library not detected. Ensure it's loaded before the DataStream client script.",
    noChannelInit: "No communication channel could be established. Try another channel type or let it auto-select.",
    handshakeIssue: "Problem encountered during initial handshake request.",
    haltedDuringLoad: "The data link ceased operation while the page was loading.",
    haltedDuringHandshake: "The data link ceased operation during the handshake process.",
    handshakeReplyParseError: "Failed to interpret the handshake response.",
    versionMismatch: "Client version {0} is incompatible with server version {1}.",
    transmissionFailure: "Data transmission failed.",
    replyDecodeError: "Failed to decode the server's reply: {0}",
    pollingChannelFailure: "Long polling channel request did not succeed.",
    eventStreamConnectFailure: "EventStream channel failed to connect.",
    eventStreamRuntimeError: "Error originating from EventStream channel.",
    socketClosed: "WebSocket channel terminated.",
    heartbeatInvalidReply: "Server heartbeat returned an unexpected reply: '{0}'.",
    heartbeatFailed: "Server heartbeat check failed.",
    heartbeatStatusError: "Server heartbeat failed. Server responded with HTTP status {0}, link terminating.",
    heartbeatParseError: "Failed to parse server heartbeat reply, link terminating.",
    noActiveChannel: "Data link is in an invalid state; no active channel detected."
  };

  if (typeof (domLib) !== "function") {
    // DOM library dependency missing!
    throw new Error(messageBank.noDomLib);
  }

  var pulseLink,
    _currentNexus,
    _documentReady = (globalScope.document.readyState === "complete"),
    _mainViewport = domLib(globalScope),
    _protocolHaltString = "__Handshake Canceled__",
    notificationHooks = {
      onBegin: "onBegin",
      onBeginning: "onBeginning",
      onAcquired: "onAcquired",
      onIssue: "onIssue",
      onLinkLag: "onLinkLag",
      onReestablishing: "onReestablishing",
      onReestablished: "onReestablished",
      onStatusChange: "onStatusChange",
      onTerminate: "onTerminate"
    },
    xhrSettings = {
      handlePayload: true,
      timeLimit: null,
      nonBlocking: true,
      universalScope: false,
      memoizeResponse: false
    },
    traceLog = function (infoMsg, enableTrace) {
      if (enableTrace === false) {
        return;
      }
      var formattedMsg;
      if (typeof (globalScope.console) === "undefined") {
        return;
      }
      formattedMsg = "[" + new Date().toTimeString() + "] PulseLink: " + infoMsg;
      if (globalScope.console.debug) {
        globalScope.console.debug(formattedMsg);
      } else if (globalScope.console.log) {
        globalScope.console.log(formattedMsg);
      }
    },

    transitionStatus = function (linkObj, currentStatus, nextStatus) {
      if (currentStatus === linkObj.currentStatus) {
        linkObj.currentStatus = nextStatus;

        domLib(linkObj).triggerHandler(notificationHooks.onStatusChange, [{ oldStatus: currentStatus, newStatus: nextStatus }]);
        return true;
      }

      return false;
    },

    isHalting = function (linkObj) {
      return linkObj.currentStatus === pulseLink.linkStatus.terminated;
    },

    setupHeartbeatPeriod = function (activeLink) {
      var linkOptions = activeLink.internal.options,
        onHeartbeatFailure = function (errDetails) {
          domLib(activeLink).triggerHandler(notificationHooks.onIssue, [errDetails]);
        };

      if (!linkOptions.heartbeatTimerId && linkOptions.heartbeatPeriod) {
        activeLink.internal.heartbeatTimerId = globalScope.setInterval(function () {
          pulseLink.channelMethods.channelCore.sendHeartbeat(activeLink).fail(onHeartbeatFailure);
        }, linkOptions.heartbeatPeriod);
      }
    },

    initDisconnectionGracePeriod = function (activeLink) {
      var reconnectCeaseTimer,
        onReconnectExpired;

      // Verify if this link has already been set up to halt reestablishment after a set duration.
      // Without this verification, stopping and restarting a link would bind event handlers repeatedly.
      if (!activeLink.internal.reconnectAbortConfigured) {
        onReconnectExpired = function (linkRef) {
          linkRef.traceLog("Failed to re-establish connection within the allowed period (" + linkRef.terminateTimeLimit + "ms), disconnecting fully.");
          linkRef.halt(/* synchronous */ false, /* suppressServerNotification */ false);
        };

        activeLink.onReestablishing(function () {
          var currentLink = this;

          // Prevent issues if the link state changes unexpectedly by another handler
          if (currentLink.currentStatus === pulseLink.linkStatus.reestablishing) {
            reconnectCeaseTimer = globalScope.setTimeout(function () { onReconnectExpired(currentLink); }, currentLink.terminateTimeLimit);
          }
        });

        activeLink.onStatusChange(function (stateInfo) {
          if (stateInfo.oldStatus === pulseLink.linkStatus.reestablishing) {
            // Cancel the pending re-establishment timeout check
            globalScope.clearTimeout(reconnectCeaseTimer);
          }
        });

        activeLink.internal.reconnectAbortConfigured = true;
      }
    };

  pulseLink = function (endpointUrl, queryStr, enableTrace) {
    // <summary>Establishes a new PulseLink data connection to the specified URL.</summary>
    // <param name="endpointUrl" type="String">The target URL for the long polling endpoint.</param>
    // <param name="queryStr" type="Object">
    //     [Optional] Additional query string parameters for the connection URL.
    //     If an object, all non-function properties are appended.
    //     If a string, it's added directly to the query string.
    // </param>
    // <param name="enableTrace" type="Boolean">
    //     [Optional] Flag to enable connection tracing to the browser's console/log.
    //     Defaults to 'false' if not specified.
    // </param>

    return new pulseLink.base.initialize(endpointUrl, queryStr, enableTrace);
  };

  pulseLink.internal = {
    defaultRequestType: "application/x-www-form-urlencoded; charset=UTF-8",

    internetExplorerVersion: (function () {
      var browserVersion,
        versionParts;

      if (globalScope.navigator.appName === 'Microsoft Internet Explorer') {
        // Look for "MSIE (number).(number)" pattern in the user agent string.
        versionParts = /MSIE ([0-9]+\.[0-9]+)/.exec(globalScope.navigator.userAgent);

        if (versionParts) {
          browserVersion = globalScope.parseFloat(versionParts[1]);
        }
      }

      // 'voidValue' implies not Internet Explorer
      return browserVersion;
    })(),

    createError: function (errMsg, errorSource) {
      var errObj = new Error(errMsg);
      errObj.origin = errorSource;
      return errObj;
    },

    channelError: function (errMsg, commChannel, errorSource) {
      var errObj = this.createError(errMsg, errorSource);
      errObj.channelType = commChannel ? commChannel.name : voidValue;
      return errObj;
    },

    interpolate: function () {
      // <summary>Example: interpolate("Hello {0}, your score is {1}!", "Player", 99) </summary>
      var outputStr = arguments[0];
      for (var k = 0; k < arguments.length - 1; k++) {
        outputStr = outputStr.replace("{" + k + "}", arguments[k + 1]);
      }
      return outputStr;
    },

    mozillaMainVersion: function (browserAgent) {
      // Firefox user agent strings: http://useragentstring.com/pages/Firefox/
      var versionMatch = browserAgent.match(/Firefox\/(\d+)/);
      if (!versionMatch || !versionMatch.length || versionMatch.length < 2) {
        return 0;
      }
      return globalScope.parseInt(versionMatch[1], 10 /* base */);
    }
  };

  pulseLink.notificationHooks = notificationHooks;

  pulseLink.messageBank = messageBank;

  pulseLink.xhrSettings = xhrSettings;

  pulseLink.transitionStatus = transitionStatus;

  pulseLink.isHalting = isHalting;

  pulseLink.linkStatus = {
    establishing: 0,
    established: 1,
    reestablishing: 2,
    terminated: 4
  };

  pulseLink.nexus = {
    begin: function () {
      // This function will be overwritten by the true nexus start method when the nexus library is properly referenced.
      throw new Error("PulseLink: Failed to load nexus functionality. Verify your nexus reference, e.g. <script src='/pulselink/js'></script>.");
    }
  };

  _mainViewport.load(function () { _documentReady = true; });

  function verifyChannelMethod(desiredMethod, activeLink) {
    // <summary>Confirms the validity of the requested communication method against the known PulseLink methods.</summary>
    // <param name="desiredMethod" type="Object">The user-specified communication methods.</param>
    // <param name="activeLink" type="pulseLink">The data link intended to use these methods, utilized for logging.</param>
    // <returns type="Object" />

    if (domLib.isArray(desiredMethod)) {
      // Iterate through the methods array and eliminate any "unsupported" ones.
      for (var iter = desiredMethod.length - 1; iter >= 0; iter--) {
        var methodItem = desiredMethod[iter];
        if (domLib.type(desiredMethod) !== "object" && (domLib.type(methodItem) !== "string" || !pulseLink.channelMethods[methodItem])) {
          activeLink.traceLog("Unsupported channel method: " + methodItem + ", removing it from the available methods list.");
          desiredMethod.splice(iter, 1);
        }
      }

      // Check if any valid methods remain; if not, then all specified methods were invalid.
      if (desiredMethod.length === 0) {
        activeLink.traceLog("No valid channel methods left in the provided array.");
        desiredMethod = null;
      }
    } else if (domLib.type(desiredMethod) !== "object" && !pulseLink.channelMethods[desiredMethod] && desiredMethod !== "auto") {
      activeLink.traceLog("Unsupported channel method: " + desiredMethod.toString() + ".");
      desiredMethod = null;
    } else if (desiredMethod === "auto" && pulseLink.internal.internetExplorerVersion <= 8) {
      // If auto-selection is chosen and the browser is IE8 or older, force 'longPolling' as per issue #1764.
      return ["longPolling"];
    }

    return desiredMethod;
  }

  function retrieveStandardPort(scheme) {
    if (scheme === "http:") {
      return 80;
    } else if (scheme === "https:") {
      return 443;
    }
  }

  function appendStandardPort(scheme, resourceUrl) {
    // Exclude existing port numbers from the URL.
    // We must ensure that a slash or end-of-line follows the port to avoid affecting numbers like '8080'.
    if (resourceUrl.match(/:\d+$/)) {
      return resourceUrl;
    } else {
      return resourceUrl + ":" + retrieveStandardPort(scheme);
    }
  }

  function BufferedMessageQueue(linkObj, flushAction) {
    var selfRef = this,
      messageQueue = [];

    selfRef.attemptEnqueue = function (dataPacket) {
      if (linkObj.currentStatus === domLib.pulseLink.linkStatus.establishing) {
        messageQueue.push(dataPacket);

        return true;
      }

      return false;
    };

    selfRef.processQueue = function () {
      // Confirm the link is active before processing the queue (avoid processing when the link is inactive).
      if (linkObj.currentStatus === domLib.pulseLink.linkStatus.established) {
        while (messageQueue.length > 0) {
          flushAction(messageQueue.shift());
        }
      }
    };

    selfRef.emptyQueue = function () {
      messageQueue = [];
    };
  }

  pulseLink.base = pulseLink.prototype = {
    initialize: function (endpointUrl, queryStr, enableTrace) {
      var domLink = domLib(this);

      this.url = endpointUrl;
      this.queryStr = queryStr;
      this.internal = {
        pendingDataBuffer: new BufferedMessageQueue(this, function (dataPacket) {
          domLink.triggerHandler(notificationHooks.onAcquired, [dataPacket]);
        }),
        failTimerRef: null
      };
      if (typeof (enableTrace) === "boolean") {
        this.enableTrace = enableTrace;
      }
    },

    _decodeReply: function (rawResponse) {
      var selfRef = this;

      if (!rawResponse) {
        return rawResponse;
      } else if (selfRef.xhrPayloadType === "text") {
        return selfRef.jsonProcessor.parse(rawResponse);
      } else {
        return rawResponse;
      }
    },

    jsonProcessor: globalScope.JSON,

    isForeignOrigin: function (resourceUri, compareAgainst) {
      // <summary>Determines if a given URL is considered cross-domain.</summary>
      // <param name="resourceUri" type="String">The base URL to check.</param>
      // <param name="compareAgainst" type="Object">
      //     An optional reference URL (defaults to window.location) for comparison.
      //     Must include 'protocol' and 'host' properties if provided.
      // </param>
      var anchorElement;

      resourceUri = domLib.trim(resourceUri);
      if (resourceUri.indexOf("http") !== 0) {
        return false;
      }

      compareAgainst = compareAgainst || globalScope.location;

      // Create a temporary anchor element for URL parsing.
      anchorElement = globalScope.document.createElement("a");
      anchorElement.href = resourceUri;

      // Special handling for port 80 when checking cross-domain, as window.location might omit it.
      return anchorElement.protocol + appendStandardPort(anchorElement.protocol, anchorElement.host) !== compareAgainst.protocol + appendStandardPort(compareAgainst.protocol, compareAgainst.host);
    },

    xhrPayloadType: "text",

    requestContentType: "application/json; charset=UTF-8",

    enableTrace: false,

    currentStatus: pulseLink.linkStatus.terminated,

    heartbeatPayload: {},

    clientVersion: "1.3",

    reconnectPause: 2000,

    channelConnectTimeLimit: 0, // This value is adjusted by the server's negotiation response. It aggregates server-sent and client-side values.

    terminateTimeLimit: 30000, // This should be configured by the server's negotiation response (default is 30 seconds).

    heartbeatAlertThreshold: 2 / 3, // Notify the user of a lagging link if the heartbeat timeout reaches X% of its duration.

    beginChannel: function (startOptions, onChannelReady) {
      // <summary>Initiates the data channel connection.</summary>
      // <param name="startOptions" type="Object">Configuration settings.</param>
      // <param name="onChannelReady" type="Function">A callback function to invoke once the channel has been successfully started.</param>
      var currentChannel = this,
        startConfig = {
          heartbeatPeriod: 300000,
          awaitPageLoad: true,
          channelMethod: "auto",
          jsonpEnabled: false
        },
        performInitialization,
        startPromise = currentChannel._startPromise || domLib.Deferred(), // Reuse existing deferred if present.
        urlParser = globalScope.document.createElement("a");

      // Store the deferred object for consistent use across multiple start calls.
      currentChannel._startPromise = startPromise;

      if (!currentChannel.jsonProcessor) {
        // No JSON parsing capability!
        throw new Error("PulseLink: JSON parser missing. Ensure 'json2.js' is included before 'PulseLink.js' for older browsers (e.g., IE<8) lacking native JSON support.");
      }

      if (domLib.type(startOptions) === "function") {
        // Allow calling with a single callback argument.
        onChannelReady = startOptions;
      } else if (domLib.type(startOptions) === "object") {
        domLib.extend(startConfig, startOptions);
        if (domLib.type(startConfig.onChannelReady) === "function") {
          onChannelReady = startConfig.onChannelReady;
        }
      }

      startConfig.channelMethod = verifyChannelMethod(startConfig.channelMethod, currentChannel);

      // If the channel method is invalid, raise an error and prevent initiation.
      if (!startConfig.channelMethod) {
        throw new Error("PulseLink: One or more invalid channel methods specified, initiation aborted.");
      }

      currentChannel.internal.options = startConfig;

      // Check if initiation is attempted before the page content is fully loaded.
      // If 'awaitPageLoad' is enabled, defer the function call until the window 'load' event.
      if (!_documentReady && startConfig.awaitPageLoad === true) {
        currentChannel.internal.delayedStartFn = function () {
          currentChannel.beginChannel(startOptions, onChannelReady);
        };
        _mainViewport.bind("load", currentChannel.internal.delayedStartFn);

        return startPromise.promise();
      }

      // If already establishing a link, return the existing promise.
      if (currentChannel.currentStatus === pulseLink.linkStatus.establishing) {
        return startPromise.promise();
      } else if (transitionStatus(currentChannel,
        pulseLink.linkStatus.terminated,
        pulseLink.linkStatus.establishing) === false) {
        // Attempt to move into the 'establishing' state if not already there.
        // If state transition fails, the link is likely already 'established' or 'reestablishing'.

        startPromise.resolve(currentChannel);
        return startPromise.promise();
      }

      initDisconnectionGracePeriod(currentChannel);

      // Determine the complete URL.
      urlParser.href = currentChannel.url;
      if (!urlParser.protocol || urlParser.protocol === ":") {
        currentChannel.protocol = globalScope.document.location.protocol;
        currentChannel.host = globalScope.document.location.host;
        currentChannel.baseUrl = currentChannel.protocol + "//" + currentChannel.host;
      } else {
        currentChannel.protocol = urlParser.protocol;
        currentChannel.host = urlParser.host;
        currentChannel.baseUrl = urlParser.protocol + "//" + urlParser.host;
      }

      // Configure the WebSocket protocol.
      currentChannel.socketProtocol = currentChannel.protocol === "https:" ? "wss://" : "ws://";

      // If JSONP is enabled with no or auto channel selection, default to long polling,
      // as JSONP is primarily useful for this channel type.
      // Some developers might use JSONP even for same-origin requests, as seen in Issue #623.
      if (startConfig.channelMethod === "auto" && startConfig.jsonpEnabled === true) {
        startConfig.channelMethod = "longPolling";
      }

      if (this.isForeignOrigin(currentChannel.url)) {
        currentChannel.traceLog("Automatically detected cross-origin URL.");

        if (startConfig.channelMethod === "auto") {
          // Attempt WebSockets and Long Polling, as Server-Sent Events (SSE) do not support CORS.
          // TODO: Implement XDM support for foreverFrame.
          startConfig.channelMethod = ["webSockets", "longPolling"];
        }

        if (typeof (startConfig.withCredentials) === voidValue) {
          startConfig.withCredentials = true;
        }

        // Ascertain if JSONP is the sole option for negotiation, async requests, and async aborts.
        // This is necessary if the browser lacks CORS support.
        // If so, override any conflicting preferences and enable JSONP.
        if (!startConfig.jsonpEnabled) {
          startConfig.jsonpEnabled = !domLib.support.cors;

          if (startConfig.jsonpEnabled) {
            currentChannel.traceLog("Utilizing JSONP because this browser lacks CORS support.");
          }
(function (jq) {
  // This module provides a cross-domain communication service leveraging easyXDM.
  // It acts as a singleton gateway to manage a single easyXDM instance across the application.

  const xDMBridgeService = {};
  const rootContext = this;

  // Enum-like object for managing the connection lifecycle states.
  const BRIDGE_STATES = Object.freeze({
    IDLE: "idle",       // No connection attempt initiated yet.
    CONNECTING: "connecting", // Connection establishment is in progress.
    CONNECTED: "connected",   // Connection has been successfully established.
    ERRORED: "errored"    // An error occurred during connection setup.
  });

  let bridgeState = BRIDGE_STATES.IDLE;
  let pendingRequests = []; // Stores callbacks waiting for the bridge to be ready.
  let activeBridgeInstance = null; // The initialized easyXDM RPC object.
  let connectionError = null; // Stores error details if connection fails.

  // Determine if debug mode is enabled via URL parameter.
  // Example: ?xDMDebug=true
  let debugEnabled = false;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    debugEnabled = urlParams.get('xDMDebug') === 'true';
    if (debugEnabled) {
      console.info("xDMBridgeService: Debug mode activated via URL parameter.");
    }
  } catch (e) {
    console.warn("xDMBridgeService: Could not parse URL parameters for debug mode.", e);
  }

  /**
   * Logs a message to the console if debug mode is active.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional additional data to log.
   */
  const debugLog = (message, data) => {
    if (debugEnabled) {
      console.debug(`[xDMBridgeService Debug] ${message}`, data || '');
    }
  };

  /**
   * Asynchronously loads easyXDM and its dependencies, then establishes the RPC connection.
   * This function is responsible for the heavy lifting of setting up the cross-domain bridge.
   * @param {string} targetOriginBase - The base URL of the remote service providing easyXDM.
   * @param {object} completionHandlers - Object containing success and failure callbacks.
   * @param {Function} completionHandlers.success - Callback for successful connection.
   * @param {Function} completionHandlers.failure - Callback for connection failure.
   */
  const establishConnection = (targetOriginBase, completionHandlers) => {
    debugLog("Initiating connection establishment process...", { targetOriginBase });

    // Validate input: ensure a base URL is provided.
    if (!targetOriginBase || typeof targetOriginBase !== 'string') {
      const errMsg = "Invalid targetOriginBase provided for connection setup.";
      console.error(errMsg, targetOriginBase);
      completionHandlers.failure(new Error(errMsg));
      return;
    }

    // Check if CORS is supported by the browser or if debug mode forces easyXDM.
    const isCorsSupported = jq.support.cors;
    if (isCorsSupported && !debugEnabled) {
      debugLog("CORS is supported and debug mode is off. easyXDM is not needed.", { targetOriginBase });
      // In a Type III clone, we could skip the easyXDM setup and call success directly,
      // assuming the caller might still want to proceed via native CORS.
      // However, the original intent is to use easyXDM if CORS is not supported *or* debug is on.
      // So, we proceed with easyXDM setup under these conditions.
    }

    // Construct the URL for the easyXDM core script.
    let xdmScriptPath = `${targetOriginBase}/easyXDM/easyXDM.min.js`;
    if (debugEnabled) {
      xdmScriptPath = `${targetOriginBase}/easyXDM/easyXDM.debug.js`;
      debugLog("Using debug version of easyXDM script.", { xdmScriptPath });
    }

    /**
     * Continues the bridge setup after the easyXDM script has been loaded.
     * This involves noConflict, JSON polyfill, and RPC object instantiation.
     */
    const proceedWithBridgeSetup = () => {
      debugLog("easyXDM script loaded. Proceeding with bridge setup.");

      // Use noConflict to isolate this easyXDM instance, preventing global conflicts.
      const isolatedXDM = window.easyXDM.noConflict("xDMBridgeService");
      xDMBridgeService.easyXDM = isolatedXDM; // Expose for internal use if needed.

      // Construct the URL for the remote provider page (the iframe source).
      let xDMProviderEndpoint = `${targetOriginBase}/javascripts/jquery.easyXDM.provider.html`;
      if (debugEnabled) {
        xDMProviderEndpoint += "?xDMDebug=true"; // Pass debug flag to provider.
        debugLog("Provider endpoint updated for debug mode.", { xDMProviderEndpoint });
      }

      // Identify or create the container element for the easyXDM iframe.
      // The container is where the easyXDM iframe will be injected.
      let iframeHost = jq("#xDM_provider_host").get(0);
      if (debugEnabled && !iframeHost) {
        debugLog("Creating debug iframe host element.");
        iframeHost = jq('<div id="xDM_provider_host" style="display:none;"></div>').appendTo(jq("body")).get(0);
      } else if (!iframeHost) {
        // If not in debug and no container, easyXDM might create its own or require it.
        // For robustness, let's ensure a container exists, even if hidden.
        debugLog("No existing iframe host, creating a hidden one.");
        iframeHost = jq('<div id="xDM_provider_host" style="position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>').appendTo(jq("body")).get(0);
      }

      // Initialize the easyXDM RPC connection.
      activeBridgeInstance = new isolatedXDM.Rpc(
        {
          remote: xDMProviderEndpoint,
          swf: `${targetOriginBase}/easyXDM/easyxdm.swf`, // Path to the Flash fallback SWF.
          container: iframeHost,
          onReady: function () {
            debugLog("easyXDM RPC connection is ready!", { activeBridgeInstance });
            completionHandlers.success(activeBridgeInstance);
          },
          onMessage: function (message, origin) {
            debugLog("Received message from remote origin:", { message, origin });
            // This handler is for general messages, not direct RPC responses.
            // RPC responses are handled internally by easyXDM.
          },
          onClose: function () {
            debugLog("easyXDM RPC connection closed.");
            // Optionally, handle reconnection or state reset here.
          }
        },
        {
          remote: {
            jquery_proxy: {} // Defines the remote methods callable on the provider side.
          }
        }
      );
    };

    // Load the easyXDM core script.
    jq.getScript(xdmScriptPath)
      .done(() => {
        debugLog("easyXDM core script loaded successfully.");
        // Check for JSON support (polyfill for older browsers).
        // Using `window.JSON` directly is robust.
        if (!window.JSON || typeof window.JSON.parse !== 'function') {
          debugLog("JSON object not fully supported, loading json2.js polyfill.");
          jq.getScript(`${targetOriginBase}/easyXDM/json2.js`)
            .done(proceedWithBridgeSetup)
            .fail((jqxhr, settings, exception) => {
              const errMsg = "Failed to load json2.js polyfill.";
              console.error(errMsg, exception);
              completionHandlers.failure(new Error(errMsg));
            });
        } else {
          debugLog("JSON object fully supported, no polyfill needed.");
          proceedWithBridgeSetup();
        }
      })
      .fail((jqxhr, settings, exception) => {
        const errMsg = "Failed to load easyXDM core script.";
        console.error(errMsg, exception);
        completionHandlers.failure(new Error(errMsg));
      });
  };

  /**
   * Public API to acquire the cross-domain bridge instance.
   * Implements a singleton pattern to ensure only one easyXDM connection per base URL.
   * @param {string} targetOriginBase - The base URL of the remote service.
   * @param {object} requestCallbacks - Callbacks for success and failure.
   * @param {Function} requestCallbacks.success - Called when the bridge is ready.
   * @param {Function} requestCallbacks.failure - Called if bridge setup fails.
   */
  xDMBridgeService.acquireBridge = (targetOriginBase, requestCallbacks) => {
    debugLog(`Attempting to acquire bridge for: ${targetOriginBase}. Current state: ${bridgeState}.`);

    // Basic validation for callbacks.
    if (!requestCallbacks || typeof requestCallbacks.success !== 'function' || typeof requestCallbacks.failure !== 'function') {
      const validationError = new Error("Invalid requestCallbacks provided. Must include success and failure functions.");
      console.error(validationError);
      if (requestCallbacks && typeof requestCallbacks.failure === 'function') {
        requestCallbacks.failure(validationError);
      }
      return;
    }

    switch (bridgeState) {
      case BRIDGE_STATES.IDLE:
        // First request, start connection process.
        bridgeState = BRIDGE_STATES.CONNECTING;
        pendingRequests.push(requestCallbacks);
        debugLog("State IDLE -> CONNECTING. Initiating connection.", { targetOriginBase });

        establishConnection(targetOriginBase, {
          success: (xDMInstance) => {
            bridgeState = BRIDGE_STATES.CONNECTED;
            activeBridgeInstance = xDMInstance;
            debugLog("Connection established successfully. Fulfilling pending requests.", { pendingRequestsCount: pendingRequests.length });
            // Process all queued callbacks.
            pendingRequests.forEach(handler => handler.success(activeBridgeInstance));
            pendingRequests = []; // Clear the queue.
          },
          failure: (failureDetails) => {
            bridgeState = BRIDGE_STATES.ERRORED;
            connectionError = failureDetails;
            console.error("Failed to establish easyXDM bridge.", failureDetails);
            // Notify all queued callbacks about the failure.
            pendingRequests.forEach(handler => handler.failure(connectionError));
            pendingRequests = []; // Clear the queue.
          }
        });
        break;

      case BRIDGE_STATES.CONNECTING:
        // Connection is already in progress, queue this request.
        pendingRequests.push(requestCallbacks);
        debugLog("State CONNECTING. Request queued.", { pendingRequestsCount: pendingRequests.length });
        break;

      case BRIDGE_STATES.CONNECTED:
        // Connection is ready, immediately fulfill the request.
        debugLog("State CONNECTED. Fulfilling request immediately.");
        requestCallbacks.success(activeBridgeInstance);
        break;

      case BRIDGE_STATES.ERRORED:
        // Connection failed previously, immediately inform the caller.
        console.warn("State ERRORED. Notifying caller of previous connection failure.");
        requestCallbacks.failure(connectionError);
        break;

      default:
        // Should not happen, indicates an unknown state.
        const unknownStateError = new Error(`Critical: Unknown bridge state encountered: ${bridgeState}`);
        console.error(unknownStateError);
        requestCallbacks.failure(unknownStateError);
        break;
    }
  };

  /**
   * jQuery ajaxTransport to intercept cross-domain requests not natively supported by CORS.
   * This allows easyXDM to handle these requests transparently.
   */
  jq.ajaxTransport("+*", function (ajaxConfig, initialOptions, xhrObject) {
    // Only intercept if cross-domain is requested AND CORS is not supported OR debug is enabled.
    const requiresXDMInterception = ajaxConfig.crossDomain && (!jq.support.cors || debugEnabled);

    if (requiresXDMInterception) {
      debugLog("Intercepting cross-domain request for easyXDM handling.", { ajaxConfig });

      // Determine the base URL of the remote service from the AJAX request URL.
      // This base URL is used to identify the easyXDM provider.
      let targetOriginBase = '';
      try {
        const urlParser = new URL(ajaxConfig.url, window.location.href);
        targetOriginBase = urlParser.origin;
        debugLog("Extracted target origin base:", { targetOriginBase });
      } catch (e) {
        console.warn("Could not parse URL for targetOriginBase, falling back to empty string.", { url: ajaxConfig.url, error: e });
        // Fallback to empty string, easyXDM might handle relative URLs or it will fail.
        // The original code also used a regex that could result in an empty string.
      }

      // Return the custom transport object.
      return {
        /**
         * The `send` method is called by jQuery to initiate the request.
         * @param {object} requestHeaders - Headers for the request.
         * @param {Function} responseProcessor - Callback to process the final response.
         */
        send: function (requestHeaders, responseProcessor) {
          debugLog("Sending request via easyXDM bridge.", { initialOptions });

          // Acquire the easyXDM bridge instance.
          xDMBridgeService.acquireBridge(targetOriginBase, {
            success: (activeBridge) => {
              debugLog("Bridge acquired, performing remote proxy call.");

              /**
               * Handles the response received from the easyXDM remote proxy.
               * @param {object} rpcResults - The results object from the remote call.
               * @param {number} rpcResults.status - HTTP status code.
               * @param {string} rpcResults.statusText - HTTP status text.
               * @param {object} rpcResults.responses - Response data (e.g., text, json).
               * @param {string} rpcResults.headers - Response headers.
               */
              const handleBridgeResponse = (rpcResults) => {
                debugLog("Received response from easyXDM proxy.", { rpcResults });
                // Call jQuery's complete callback with the processed results.
                responseProcessor(rpcResults.status, rpcResults.statusText, rpcResults.responses, rpcResults.headers);
              };

              // Ensure context is not passed, as it might refer to the local scope.
              // The original code set it to null; deleting is a more explicit way.
              let optionsForRemote = { ...initialOptions }; // Clone to avoid modifying original
              delete optionsForRemote.context;

              // Invoke the remote jquery_proxy method on the easyXDM RPC connection.
              activeBridge.jquery_proxy(optionsForRemote, handleBridgeResponse);
            },
            failure: (bridgeError) => {
              console.error("Failed to acquire easyXDM bridge for AJAX request.", bridgeError);
              // Signal a failure to jQuery's AJAX system.
              responseProcessor(0, "Bridge Connection Error", {}, ""); // Status 0 for network error.
            }
          });
        },

        /**
         * The `abort` method is called by jQuery if the request needs to be cancelled.
         */
        abort: function () {
          debugLog("AJAX request aborted. No specific easyXDM abort logic implemented.");
          // In a more complex scenario, one might try to signal the easyXDM RPC to abort the remote call.
        }
      };
    }
    // If not intercepted, return undefined to let other transports handle the request.
    return undefined;
  });

  // Expose the xDMBridgeService globally under a new name.
  rootContext.xDMBridge = xDMBridgeService;

})(jQuery);
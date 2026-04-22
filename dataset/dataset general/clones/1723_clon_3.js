// --- Native Bridge Core Module ---
//
// This module establishes and manages the communication layer between the web view
// (JavaScript) and the underlying native platform. It orchestrates asynchronous
// command execution, callback handling, and custom event dispatching.
//
// Copyright (c) 2024 BridgeWorks Inc. All rights reserved.
// Licensed under the BridgeWorks Proprietary License.
// For detailed licensing terms, please refer to the accompanying LICENSE file.
//
// Derived from initial concepts found in Apache Cordova. All original Apache
// components retain their respective licenses. Significant architectural and
// implementation changes have been made for enhanced performance and security.
//

// Define the global NativeBridge object if it doesn't already exist.
if (typeof NativeBridge === "undefined") {
    // Ensure a system-wide information object is available for device details.
    if (typeof DeviceEnvironment !== 'object' || DeviceEnvironment === null) {
        // Initialize DeviceEnvironment as a blank object if not found.
        DeviceEnvironment = {};
    }

    /**
     * The primary interface for interacting with native functionalities.
     * This object acts as a global namespace for all platform-specific operations.
     * @namespace NativeBridge
     */
    const NativeBridge = {
        // A sequential buffer holding native command objects awaiting execution.
        commandBuffer: [],
        // A boolean flag indicating if the native side is currently processing the command buffer.
        bufferProcessing: false,
        // An internal array to queue functions that need to run post-initialization.
        startupTasks: [],
        // A collection of custom handlers for events originating from the Document Object Model.
        domEventRelays: {},
        // A collection of custom handlers for global window-level events.
        globalEventRelays: {}
    };

    /**
     * A record of all JavaScript files and assets loaded by NativeBridge.
     * This helps prevent duplicate script loads and resource conflicts.
     * @private
     */
    NativeBridge.assetTracker = new Set(['core_script']); // Mark the core script as loaded by default.

    /**
     * Verifies if a particular resource has been registered as loaded.
     * @param {string} assetIdentifier - The unique name or path of the resource.
     * @returns {boolean} True if the resource is in the tracker, false otherwise.
     */
    NativeBridge.isAssetLoaded = function(assetIdentifier) {
        return NativeBridge.assetTracker.has(assetIdentifier);
    };

    /**
     * Adds a resource's identifier to the list of loaded assets.
     * @param {string} assetIdentifier - The unique name or path of the resource.
     */
    NativeBridge.markAssetLoaded = function(assetIdentifier) {
        NativeBridge.assetTracker.add(assetIdentifier);
    };

    /**
     * Enqueues a function to be executed once the NativeBridge system and
     * device environment are fully operational.
     * @param {Function} taskFunction - The callback function to be invoked.
     */
    NativeBridge.queueStartupTask = function(taskFunction) {
        const currentDocState = document.readyState;
        const deviceIDAvailable = (DeviceEnvironment.deviceUUID !== undefined && DeviceEnvironment.deviceUUID !== null);

        // If the environment is already prepared, execute the task immediately.
        if ((currentDocState === 'interactive' || currentDocState === 'complete') && deviceIDAvailable) {
            try {
                taskFunction();
            } catch (error) {
                console.error("NativeBridge: Error executing immediate startup task:", error);
            }
        } else {
            // Otherwise, add it to the queue for later execution.
            NativeBridge.startupTasks.push(taskFunction);
        }
    };

    // An immediately-invoked function expression to manage the core initialization lifecycle.
    (function() {
        let readinessCheckTimer = setInterval(function() {
            const currentDocState = document.readyState;
            const hasDeviceIdentifier = (DeviceEnvironment.deviceUUID !== undefined && DeviceEnvironment.deviceUUID !== null);

            // Once the DOM is interactive/complete and a device identifier is present, proceed.
            if ((currentDocState === 'interactive' || currentDocState === 'complete') && hasDeviceIdentifier) {
                clearInterval(readinessCheckTimer); // Stop the periodic checks.

                // Process all queued startup tasks.
                while (NativeBridge.startupTasks.length > 0) {
                    const task = NativeBridge.startupTasks.shift();
                    try {
                        task();
                    } catch (e) {
                        console.error("NativeBridge: Encountered an error during startup task execution: ", e);
                        // A simple alert fallback for critical errors if console is not easily visible.
                        if (typeof alert === 'function') {
                            alert("NativeBridge startup task failed: " + (e.message || "Unknown error"));
                        }
                    }
                }

                // Dispatch a custom event to signal that the native platform is ready.
                const platformReadyEvent = new Event('nativebridgeready', { bubbles: true, cancelable: false });
                document.dispatchEvent(platformReadyEvent);
            }
        }, 10); // Check every 10 milliseconds.
    })();

    // A counter for assigning unique identifiers to native operation requests.
    NativeBridge.requestSequenceId = 0;

    // A map to store pending JavaScript callbacks, indexed by their request IDs.
    NativeBridge.pendingRequests = {};

    // Standardized status codes for responses from the native layer.
    NativeBridge.responseStatus = Object.freeze({
        NO_RESPONSE: 0,
        SUCCESS: 1,
        CLASS_NOT_FOUND: 2,
        ACCESS_DENIED: 3,
        INSTANTIATION_ERROR: 4,
        MALFORMED_INPUT: 5,
        IO_EXCEPTION: 6,
        INVALID_OPERATION: 7,
        SERIALIZATION_ERROR: 8,
        GENERAL_ERROR: 9,
        AWAITING_RESULT: 10 // New status for long-running native operations.
    });

    /**
     * Establishes a hidden communication channel (an iframe) that the native layer
     * can monitor to detect new pending commands.
     * @private
     * @returns {HTMLIFrameElement} The iframe used for signaling.
     */
    NativeBridge.initiateSignalChannel = function() {
        // Reuse an existing channel if available.
        if (NativeBridge._signalFrame) {
            return NativeBridge._signalFrame;
        }

        const signalFrame = document.createElement("iframe");
        // Apply minimal styling to ensure it's hidden and non-interactive.
        Object.assign(signalFrame.style, {
            display: 'none',
            height: '0px',
            width: '0px',
            border: 'none',
            visibility: 'hidden'
        });
        signalFrame.setAttribute("aria-hidden", "true"); // Hide from accessibility trees.
        signalFrame.setAttribute("tabindex", "-1");     // Prevent keyboard focus.
        document.body.appendChild(signalFrame); // Append to body for robust DOM integration.
        NativeBridge._signalFrame = signalFrame; // Cache the reference.
        return signalFrame;
    };

    /**
     * Dispatches a native operation request. This function queues the command
     * and signals the native platform to process the buffer.
     *
     * This function supports two invocation patterns:
     * 1. Callback-oriented: `(onSuccess, onError, service, action, args)`
     * 2. Command-string oriented: `("Service.action", args...)`
     *
     * @param {Function} [onSuccess] - Optional callback for successful operation completion.
     * @param {Function} [onError] - Optional callback for operation failure.
     * @param {string} nativeService - The name of the native module or class.
     * @param {string} nativeAction - The method or function to invoke on the native service.
     * @param {Array<any>} [actionArguments=[]] - An array of arguments to pass to the native method.
     */
    NativeBridge.invokeNative = function() {
        let successCallback, errorCallback, serviceTarget, actionName, argsList;
        let currentRequestId = null;
        const commandPayload = {
            target: '',
            method: '',
            arguments: []
        };

        // Determine the invocation pattern based on the first argument's type.
        if (typeof arguments[0] === "function" || arguments[0] === null) {
            // Pattern 1: Callbacks provided.
            successCallback = arguments[0];
            errorCallback = arguments[1];
            serviceTarget = arguments[2];
            actionName = arguments[3];
            argsList = Array.from(arguments[4] || []); // Ensure arguments are an array.

            // Generate a unique request ID for callback tracking.
            currentRequestId = `nb_req_${NativeBridge.requestSequenceId++}_${Date.now()}`;
        } else {
            // Pattern 2: Command string provided.
            const fullCommandString = arguments[0];
            const commandParts = fullCommandString.split(".");
            actionName = commandParts.pop();
            serviceTarget = commandParts.join(".");
            argsList = Array.from(arguments).slice(1); // Collect all subsequent arguments.
        }

        commandPayload.target = serviceTarget;
        commandPayload.method = actionName;

        // Register callbacks if they were provided, and include the request ID in the payload.
        if (successCallback || errorCallback) {
            NativeBridge.pendingRequests[currentRequestId] = {
                onSuccess: successCallback,
                onError: errorCallback
            };
            commandPayload.arguments.push(currentRequestId); // Native side expects ID as first argument.
        } else if (currentRequestId) {
            // If an ID was generated but no JS handlers, still pass it.
            commandPayload.arguments.push(currentRequestId);
        }

        // Iterate through provided arguments, handling objects specially.
        for (let i = 0; i < argsList.length; ++i) {
            const arg = argsList[i];
            if (arg === undefined || arg === null) {
                // Skip null or undefined arguments.
                continue;
            } else if (typeof arg === 'object' && !Array.isArray(arg)) {
                // If it's a plain object (not an array), treat it as an options dictionary.
                commandPayload.options = arg;
            } else {
                // Otherwise, add it to the general argument list.
                commandPayload.arguments.push(arg);
            }
        }

        // Serialize the command and add it to the buffer.
        NativeBridge.commandBuffer.push(JSON.stringify(commandPayload));

        // If this is the first command in an otherwise empty buffer and the native
        // processor isn't active, signal the native layer to start processing.
        if (NativeBridge.commandBuffer.length === 1 && !NativeBridge.bufferProcessing) {
            const channel = NativeBridge.initiateSignalChannel();
            // Using a distinct URI scheme for native bridge signaling.
            channel.src = "nativebridge://process_pending";
        }
    };

    /**
     * Retrieves all commands currently in the buffer and then clears the buffer.
     * This function is typically called by the native layer.
     * @returns {string} A JSON string representing the array of queued commands.
     */
    NativeBridge.fetchAndFlushCommands = function() {
        NativeBridge.bufferProcessing = true; // Indicate that native is now handling the buffer.
        const serializedCommands = JSON.stringify(NativeBridge.commandBuffer);
        NativeBridge.commandBuffer.length = 0; // Efficiently clear the array.
        NativeBridge.bufferProcessing = false; // Reset the flag once native has retrieved.
        return serializedCommands;
    };

    /**
     * Processes a successful result received from a native operation.
     * This function is invoked by the native layer.
     * @param {string} requestId - The unique identifier of the original request.
     * @param {object} resultData - An object containing `status`, `message`, and `keepCallback` properties.
     */
    NativeBridge.handleSuccessResponse = function(requestId, resultData) {
        const storedRequest = NativeBridge.pendingRequests[requestId];

        if (storedRequest) {
            try {
                // Check if the status indicates success and a success handler exists.
                if (resultData.status === NativeBridge.responseStatus.SUCCESS && storedRequest.onSuccess) {
                    storedRequest.onSuccess(resultData.message);
                }
            } catch (e) {
                console.error(`NativeBridge: Error during success callback for request ID ${requestId}:`, e);
            } finally {
                // Clean up the stored callback unless native explicitly requests to keep it.
                if (!resultData.keepCallback) {
                    delete NativeBridge.pendingRequests[requestId];
                }
            }
        } else {
            console.warn(`NativeBridge: Received success response for unknown request ID: ${requestId}`);
        }
    };

    /**
     * Processes an error result received from a native operation.
     * This function is invoked by the native layer.
     * @param {string} requestId - The unique identifier of the original request.
     * @param {object} errorDetails - An object containing `status`, `message`, and `keepCallback` properties.
     */
    NativeBridge.handleErrorResponse = function(requestId, errorDetails) {
        const storedRequest = NativeBridge.pendingRequests[requestId];

        if (storedRequest) {
            try {
                // Invoke the error handler if it exists.
                if (storedRequest.onError) {
                    storedRequest.onError(errorDetails.message);
                }
            } catch (e) {
                console.error(`NativeBridge: Error during error callback for request ID ${requestId}:`, e);
            } finally {
                // Clean up the stored callback unless native explicitly requests to keep it.
                if (!errorDetails.keepCallback) {
                    delete NativeBridge.pendingRequests[requestId];
                }
            }
        } else {
            console.warn(`NativeBridge: Received error response for unknown request ID: ${requestId}`);
        }
    };

    /**
     * Creates a deep, independent copy of an object or array.
     * Handles primitives, Dates, and functions by returning them directly.
     * @param {any} source - The value or object to be cloned.
     * @returns {any} A new, deeply copied instance.
     */
    NativeBridge.replicateObject = function(source) {
        // Handle primitive types, null, undefined, and functions directly.
        if (source === null || typeof source !== 'object') {
            return source;
        }

        // Handle Date objects by creating a new Date instance.
        if (source instanceof Date) {
            return new Date(source.getTime());
        }

        // Handle Array objects by mapping each element recursively.
        if (Array.isArray(source)) {
            return source.map(item => NativeBridge.replicateObject(item));
        }

        // Handle plain objects.
        const target = {};
        for (const key in source) {
            // Ensure we only copy own properties, not inherited ones.
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = NativeBridge.replicateObject(source[key]);
            }
        }
        return target;
    };

    // Preserve references to the original browser event listener methods.
    const originalDocumentAddListener = document.addEventListener;
    const originalWindowAddListener = window.addEventListener;
    const originalDocumentRemoveListener = document.removeEventListener;
    const originalWindowRemoveListener = window.removeEventListener;

    /**
     * Registers a custom handler for a window-level event.
     * This handler can intercept or augment the default event listener behavior.
     * @param {string} eventName - The name of the event (e.g., 'online', 'offline').
     * @param {Function} handlerFunc - The function to be called when the event occurs.
     */
    NativeBridge.addGlobalEventRelay = function(eventName, handlerFunc) {
        NativeBridge.globalEventRelays[eventName.toLowerCase()] = handlerFunc;
    };

    /**
     * Registers a custom handler for a document-level event.
     * This handler can intercept or augment the default event listener behavior.
     * @param {string} eventName - The name of the event (e.g., 'deviceready', 'pause').
     * @param {Function} handlerFunc - The function to be called when the event occurs.
     */
    NativeBridge.addDomEventRelay = function(eventName, handlerFunc) {
        NativeBridge.domEventRelays[eventName.toLowerCase()] = handlerFunc;
    };

    /**
     * A utility function to abstract the common logic for intercepting
     * `addEventListener` and `removeEventListener` calls.
     * @private
     * @param {EventTarget} targetObject - The object (document/window) on which the listener is being managed.
     * @param {string} eventKind - The type of event (e.g., 'click').
     * @param {Function} listenerCallback - The function to be registered/deregistered.
     * @param {boolean|object} options - Options for the listener (capture, passive, once).
     * @param {boolean} isAddingOperation - True for addEventListener, false for removeEventListener.
     * @param {object} customRelays - The specific relay collection (domEventRelays or globalEventRelays).
     * @param {Function} originalMethod - The original browser method (e.g., originalDocumentAddListener).
     * @returns {void}
     */
    const interceptEventManagement = function(targetObject, eventKind, listenerCallback, options, isAddingOperation, customRelays, originalMethod) {
        const normalizedEventKind = eventKind.toLowerCase();
        const customRelayHandler = customRelays[normalizedEventKind];

        if (customRelayHandler) {
            // If a custom relay is registered, allow it to handle the event.
            // If it returns true, it signifies that the event was fully handled,
            // and the original browser method should not be called.
            if (customRelayHandler(normalizedEventKind, listenerCallback, isAddingOperation)) {
                return;
            }
        }
        // If no custom relay, or if the relay did not fully handle,
        // defer to the original browser event management method.
        originalMethod.call(targetObject, eventKind, listenerCallback, options);
    };

    // Override `document.addEventListener` to allow for custom event interception.
    document.addEventListener = function(evt, handler, options) {
        interceptEventManagement(document, evt, handler, options, true, NativeBridge.domEventRelays, originalDocumentAddListener);
    };

    // Override `window.addEventListener` to allow for custom event interception.
    window.addEventListener = function(evt, handler, options) {
        interceptEventManagement(window, evt, handler, options, true, NativeBridge.globalEventRelays, originalWindowAddListener);
    };

    // Override `document.removeEventListener` for consistent custom event management.
    document.removeEventListener = function(evt, handler, options) {
        interceptEventManagement(document, evt, handler, options, false, NativeBridge.domEventRelays, originalDocumentRemoveListener);
    };

    // Override `window.removeEventListener` for consistent custom event management.
    window.removeEventListener = function(evt, handler, options) {
        interceptEventManagement(window, evt, handler, options, false, NativeBridge.globalEventRelays, originalWindowRemoveListener);
    };

    /**
     * Dispatches a custom event on the document, making it available to
     * any registered listeners.
     * @param {string} eventType - The string identifier for the event.
     * @param {object} [payload={}] - An optional object containing custom data for the event's `detail` property.
     */
    NativeBridge.dispatchDocumentEvent = function(eventType, payload = {}) {
        // Create a new CustomEvent for modern event dispatching, allowing for data payload.
        const customEvt = new CustomEvent(eventType, {
            detail: payload,
            bubbles: true,   // Allow the event to bubble up the DOM tree.
            cancelable: true // Allow the event to be cancelled using preventDefault().
        });
        document.dispatchEvent(customEvt);
    };
}
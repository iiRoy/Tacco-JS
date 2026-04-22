(function() {

    const elementStore = new WeakMap(); // Maps iframe DOM element to its state: { readyStatus: boolean, commandQueue: [], outstandingRequests: Map<number, {resolve, reject}> }

    let nextTransactionIdentifier = 0; // Unique ID for correlating outgoing requests with incoming replies

    // --- Manages incoming messages from media iframes ---
    class MessageDecoder {
        constructor(commandProcessor) {
            this.processor = commandProcessor;
            window.addEventListener("message", this.handleIncomingMessage.bind(this));
        }

        handleIncomingMessage(signalEvent) {
            // Validate message origin for security and relevance
            if (!signalEvent.origin || !signalEvent.origin.includes("vimeo.com")) {
                return;
            }

            let receivedData;
            try {
                receivedData = typeof signalEvent.data === "string" ? JSON.parse(signalEvent.data) : signalEvent.data;
            } catch (error) {
                return; // Not a valid JSON message
            }

            if (!receivedData) return;

            this.processor.routeMessage(receivedData, signalEvent.source); // signalEvent.source is the contentWindow
        }
    }

    // --- Handles media unit state and command dispatch ---
    class MediaController {
        constructor() {
            // No direct state needed here; all per-unit state is managed in elementStore
        }

        // Locates the target iframe element based on message payload or fallback
        findTargetUnit(dataPayload) {
            let targetFrame = null;
            if (dataPayload.hasOwnProperty("player_id")) {
                targetFrame = document.getElementById(dataPayload.player_id);
                if (targetFrame && targetFrame.tagName.toLowerCase() === 'iframe' && targetFrame.src.includes('vimeo.com')) {
                    return targetFrame;
                }
                const framesBySrc = document.querySelectorAll(`iframe[src*="${dataPayload.player_id}"]`);
                if (framesBySrc.length > 0) return framesBySrc[0];
            }

            const allVimeoFrames = document.querySelectorAll("iframe[src*='vimeo.com']");
            if (allVimeoFrames.length > 0) return allVimeoFrames[0];
            return null;
        }

        // Extracts the base API URL for a given iframe element
        deriveApiEndpoint(mediaUnit) {
            if (!mediaUnit || !mediaUnit.src) return null;
            const urlParser = new URL(mediaUnit.src);
            return urlParser.origin + urlParser.pathname;
        }

        // Dispatches incoming messages from iframes to appropriate handlers
        routeMessage(dataPayload, sourceWindow) {
            const targetUnit = this.findTargetUnit(dataPayload);
            if (!targetUnit) return;

            let unitState = elementStore.get(targetUnit);
            if (!unitState) {
                unitState = { readyStatus: false, commandQueue: [], outstandingRequests: new Map() };
                elementStore.set(targetUnit, unitState);
            }

            if (dataPayload.hasOwnProperty("event")) {
                this.processUnitEvent(targetUnit, dataPayload, unitState);
            } else if (dataPayload.hasOwnProperty("method")) {
                this.processUnitReply(targetUnit, dataPayload, unitState);
            }
        }

        // Handles incoming event messages (e.g., 'ready', 'play', 'pause')
        processUnitEvent(targetUnit, dataPayload, unitState) {
            const eventType = dataPayload.event.toLowerCase();

            // Dispatch a native CustomEvent (replaces jQuery .triggerHandler)
            const customEvent = new CustomEvent(`mediaUnit-${eventType}`, { detail: dataPayload.data });
            targetUnit.dispatchEvent(customEvent);

            if (eventType === 'ready') {
                unitState.readyStatus = true;
                this.initializeUnitListeners(targetUnit);
                this.dispatchQueuedCommands(targetUnit, unitState);
            }
        }

        // Sets up event listeners within the iframe once it's ready
        initializeUnitListeners(targetUnit) {
            const eventsToObserve = ['loadProgress', 'playProgress', 'play', 'pause', 'finish', 'seek', 'cuechange'];
            const endpoint = this.deriveApiEndpoint(targetUnit);
            eventsToObserve.forEach(eventType => {
                const message = { method: 'addEventListener', value: eventType };
                targetUnit.contentWindow.postMessage(JSON.stringify(message), endpoint);
            });
        }

        // Sends any commands that were queued before the iframe was ready
        dispatchQueuedCommands(targetUnit, unitState) {
            if (unitState.commandQueue && unitState.commandQueue.length > 0) {
                const endpoint = this.deriveApiEndpoint(targetUnit);
                unitState.commandQueue.forEach(queuedAction => {
                    targetUnit.contentWindow.postMessage(JSON.stringify(queuedAction.message), endpoint);
                });
                unitState.commandQueue = []; // Clear the queue
            }
        }

        // Handles replies to method calls (e.g., return value for getVolume)
        processUnitReply(targetUnit, dataPayload, unitState) {
            if (dataPayload.hasOwnProperty('message_id') && unitState.outstandingRequests.has(dataPayload.message_id)) {
                const { resolve } = unitState.outstandingRequests.get(dataPayload.message_id);
                resolve(dataPayload.value);
                unitState.outstandingRequests.delete(dataPayload.message_id);
            }
        }

        // --- Public API for sending commands to media units ---
        // This is the core logic utilized by the global 'mediaChannel' function.
        sendUnitCommand(targetDOMElement, operationDefinition) {
            if (!targetDOMElement || targetDOMElement.tagName.toLowerCase() !== 'iframe') {
                console.error("Target must be an iframe element.");
                return Promise.reject(new Error("Invalid target for command."));
            }

            const endpoint = this.deriveApiEndpoint(targetDOMElement);
            if (!endpoint) {
                console.error("Could not determine Vimeo API endpoint for the target iframe.");
                return Promise.reject(new Error("Invalid iframe source."));
            }

            let unitState = elementStore.get(targetDOMElement);
            if (!unitState) {
                unitState = { readyStatus: false, commandQueue: [], outstandingRequests: new Map() };
                elementStore.set(targetDOMElement, unitState);
            }

            let commandMessage = { method: operationDefinition.action };
            if (operationDefinition.dataValue !== undefined) {
                commandMessage.value = operationDefinition.dataValue;
            }

            let responsePromise = Promise.resolve(); // Default for commands without expected return

            const expectsReply = operationDefinition.action.startsWith("get") || operationDefinition.action === "paused";

            if (expectsReply) {
                const transactionId = nextTransactionIdentifier++;
                commandMessage.message_id = transactionId; // Add ID for correlation
                responsePromise = new Promise((resolve, reject) => {
                    unitState.outstandingRequests.set(transactionId, { resolve, reject });
                });
            }

            if (unitState.readyStatus) {
                targetDOMElement.contentWindow.postMessage(JSON.stringify(commandMessage), endpoint);
            } else {
                unitState.commandQueue.push({ message: commandMessage, api: endpoint });
            }

            return responsePromise;
        }
    }

    // Initialize the core components
    const globalMediaController = new MediaController();
    new MessageDecoder(globalMediaController); // Start listening for messages

    // --- Global Public Interface (replaces $.vimeo and $.fn.vimeo) ---
    // This function provides the external interface for interacting with Vimeo iframes.
    // It accepts a DOM element (or a selector string) and command details.
    // To mimic the original's return value (jQuery object), this function will return the DOM element.
    // Callbacks for 'get' methods are handled internally.
    window.mediaChannel = function(targetSource, commandName, valueOrCallback) {
        let actualTargetElement = targetSource;
        if (typeof targetSource === 'string') {
            actualTargetElement = document.querySelector(targetSource);
        }

        if (!actualTargetElement || actualTargetElement.tagName.toLowerCase() !== 'iframe') {
            console.warn("mediaChannel: Target must be an iframe element or a valid selector.");
            return actualTargetElement; // Return original target for consistency, even if invalid
        }

        const expectsReturnValue = commandName.startsWith("get") || commandName === "paused";
        let operationPayload = { action: commandName };
        let replyHandler = null;

        if (valueOrCallback !== undefined) {
            if (typeof valueOrCallback === 'function' && expectsReturnValue) {
                replyHandler = valueOrCallback;
            } else {
                operationPayload.dataValue = valueOrCallback;
            }
        }

        const commandPromise = globalMediaController.sendUnitCommand(actualTargetElement, operationPayload);

        if (replyHandler) {
            commandPromise.then(replyHandler).catch(err => console.error("Media command error:", err));
        }

        return actualTargetElement; // Mimics jQuery plugin returning the element
    };

})();
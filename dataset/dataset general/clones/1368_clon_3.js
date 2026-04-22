(function(jq, globalObj) {
    'use strict';

    // A central manager for Vimeo iframe communication within the jQuery environment.
    // Handles incoming messages from Vimeo players and facilitates sending commands to them.
    const vimeoCommsManager = {

        // Stores return values from method calls (e.g., getVolume).
        // `returnedValues` holds the actual data, `callTracker` helps match returns to calls.
        responseQueue: {
            returnedValues: [],
            callTracker: 0 // Incremented for each method call expecting a return.
        },

        // Initializes the message processing workflow upon receiving a window message.
        // It filters messages, parses data, and dispatches to appropriate handlers.
        processIncomingMessage: function(messageEvent) {
            let targetIframe,
                apiEndpoint,
                parsedPayload;

            const originalEvt = messageEvent.originalEvent;

            // Ensure the message originates from a Vimeo domain.
            if (!originalEvt || !originalEvt.origin || !originalEvt.origin.includes('vimeo')) {
                return;
            }

            // Check if data is present and non-empty.
            if (!originalEvt.data || typeof originalEvt.data === 'string' && originalEvt.data.trim() === '') {
                // console.warn("VimeoCommsManager: Received empty or invalid data from Vimeo.", originalEvt.data);
                return;
            }

            // Parse the message data. It could be a stringified JSON or an object directly.
            try {
                parsedPayload = (typeof originalEvt.data === 'string') ? JSON.parse(originalEvt.data) : originalEvt.data;
            } catch (error) {
                // console.error("VimeoCommsManager: Failed to parse incoming message data.", error, originalEvt.data);
                return;
            }

            // If the payload is null or not an object, it's not a valid Vimeo message.
            if (!parsedPayload || typeof parsedPayload !== 'object') {
                return;
            }

            // Identify the specific Vimeo player iframe this message belongs to.
            targetIframe = this.identifyTargetElement(parsedPayload);
            if (!targetIframe || !targetIframe.length) {
                // console.warn("VimeoCommsManager: Could not identify target iframe for message.", parsedPayload);
                return; // No target iframe found for this message.
            }

            // Determine the Vimeo API URL for this player.
            apiEndpoint = this.determineApiSource(targetIframe);

            // Handle event messages (e.g., 'ready', 'play', 'pause').
            if (parsedPayload.event !== undefined) {
                this.dispatchPlayerEvent(parsedPayload, targetIframe, apiEndpoint);
            }

            // Handle method return messages (e.g., response to 'getVolume').
            if (parsedPayload.method !== undefined) {
                this.processMethodResponse(parsedPayload, targetIframe, apiEndpoint);
            }
        },

        // Locates the Vimeo iframe element based on the message payload.
        // Prioritizes a `player_id` from the payload, otherwise defaults to the first Vimeo iframe.
        identifyTargetElement: function(payload) {
            let foundElement = null;

            // If a player_id is provided in the message payload.
            if (payload.player_id) {
                const byId = jq("#" + payload.player_id);
                if (byId.length > 0) {
                    foundElement = byId;
                } else {
                    // Fallback to searching by src attribute if ID doesn't match a direct element.
                    foundElement = jq(`iframe[src*="${payload.player_id}"]`);
                }
            }

            // If no specific player_id or it didn't yield a result, find the first Vimeo iframe.
            if (!foundElement || foundElement.length === 0) {
                // console.warn("VimeoCommsManager: Falling back to first Vimeo iframe on page. Consider setting 'player_id'.");
                foundElement = jq("iframe[src*='vimeo.com']").eq(0);
            }

            return foundElement;
        },

        // Constructs the base Vimeo API URL from an iframe's src attribute.
        // Ensures the correct protocol (http/https) is used.
        determineApiSource: function(iframeElement) {
            const iframeSrc = iframeElement.attr('src');
            if (!iframeSrc) {
                // console.error("VimeoCommsManager: Iframe has no src attribute.");
                return '';
            }

            const srcParts = iframeSrc.split('?')[0]; // Remove query parameters.

            // Prepend protocol if it's missing (e.g., "//player.vimeo.com/video/...")
            if (!srcParts.startsWith('http')) {
                // Use the current page's protocol if not explicitly set.
                return (globalObj.location.protocol === 'https:' ? 'https:' : 'http:') + srcParts;
            } else {
                return srcParts;
            }
        },

        // Stores the returned value from a Vimeo API method call.
        processMethodResponse: function(responsePayload, targetFrame, sourceUrl) {
            if (responsePayload.value !== undefined) {
                this.responseQueue.returnedValues.push(responsePayload.value);
            } else {
                // console.warn("VimeoCommsManager: Received method response without a 'value'.", responsePayload);
            }
        },

        // Dispatches custom jQuery events based on incoming Vimeo player events.
        dispatchPlayerEvent: function(eventPayload, targetFrame, sourceUrl) {
            const eventType = eventPayload.event.toLowerCase();
            const eventData = eventPayload.data; // Additional data for some events (e.g., seek, progress).

            // Helper array for events that need explicit listeners.
            const eventsToListen = ['loadprogress', 'playprogress', 'play', 'pause', 'finish', 'seek', 'cuechange'];

            // Ensure the target frame and its content window are accessible before posting messages.
            if (!targetFrame[0] || !targetFrame[0].contentWindow) {
                // console.error("VimeoCommsManager: Target iframe content window not available.");
                return;
            }

            switch (eventType) {
                case 'ready':
                    // Iterate through all custom events bound to this iframe via jQuery.
                    // If they match Vimeo's listenable events, register them with the player.
                    const boundEvents = jq._data(targetFrame[0], "events");
                    if (boundEvents) {
                        for (const eventName in boundEvents) {
                            if (eventsToListen.includes(eventName)) { // Check against our list of trackable events.
                                targetFrame[0].contentWindow.postMessage(JSON.stringify({
                                    method: 'addEventListener',
                                    value: eventName
                                }), sourceUrl);
                            }
                        }
                    }

                    // If any commands were queued before the player was ready, send them now.
                    const pendingCommands = targetFrame.data("vimeoPendingCommands");
                    if (pendingCommands && pendingCommands.length > 0) {
                        for (let i = 0; i < pendingCommands.length; i++) {
                            const command = pendingCommands[i];
                            targetFrame[0].contentWindow.postMessage(JSON.stringify(command.message), command.api);
                        }
                        targetFrame.removeData("vimeoPendingCommands"); // Clear the queue.
                    }

                    // Mark this player as ready and trigger a custom 'playerReady' event.
                    targetFrame.data("isVimeoReady", true);
                    targetFrame.trigger("playerReady");
                    break;

                case 'seek':
                    targetFrame.trigger("seek", [eventData]);
                    break;

                case 'loadprogress':
                    targetFrame.trigger("loadProgress", [eventData]);
                    break;

                case 'playprogress':
                    targetFrame.trigger("playProgress", [eventData]);
                    break;

                case 'pause':
                    targetFrame.trigger("pause");
                    break;

                case 'finish':
                    targetFrame.trigger("playbackFinished"); // Renamed event for clarity.
                    break;

                case 'play':
                    targetFrame.trigger("play");
                    break;

                case 'cuechange':
                    targetFrame.trigger("cuechange");
                    break;

                default:
                    // console.log(`VimeoCommsManager: Unhandled event type: ${eventType}`, eventPayload);
                    break;
            }
        }
    };

    // Attach the main message listener to the window object.
    // All incoming messages from iframes will be routed through our manager.
    jq(globalObj).on("message", function(e) {
        vimeoCommsManager.processIncomingMessage(e);
    });


    /**
     *  jQuery static method to send commands to a Vimeo iframe player.
     *
     * @param {jQuery} targetElement The jQuery object representing the Vimeo iframe.
     * @param {string} methodName The Vimeo API method to call (e.g., 'play', 'setVolume').
     * @param {string|number|Function} [methodValueOrCallback] Optional: value for the method (e.g., volume level)
     *                                                        or a callback function for methods that return data.
     * @returns {jQuery} The targetElement for chaining.
     */
    jq.vimeoCommand = function(targetElement, methodName, methodValueOrCallback) {

        if (!targetElement || targetElement.length === 0 || targetElement.prop("tagName").toLowerCase() !== 'iframe') {
            // console.error("vimeoCommand: Invalid target element provided. Must be an iframe.");
            return targetElement;
        }

        if (typeof methodName !== "string" || methodName.trim() === "") {
            // console.error("vimeoCommand: Invalid method name provided.");
            return targetElement;
        }

        const outgoingCommand = {};
        outgoingCommand.method = methodName;

        // If a value is provided, and it's not a function (which would be a callback).
        if (methodValueOrCallback !== undefined && typeof methodValueOrCallback !== "function") {
            outgoingCommand.value = methodValueOrCallback;
        }

        const apiEndpoint = vimeoCommsManager.determineApiSource(targetElement);
        if (!apiEndpoint) {
            // console.error("vimeoCommand: Could not determine API endpoint for iframe.");
            return targetElement;
        }

        // Check if the player is ready. If not, queue the command to be sent later.
        if (targetElement.data("isVimeoReady")) {
            targetElement[0].contentWindow.postMessage(JSON.stringify(outgoingCommand), apiEndpoint);
        } else {
            // Store commands in a queue until the player signals it's ready.
            let pendingCommands = targetElement.data("vimeoPendingCommands") || [];
            pendingCommands.push({
                message: outgoingCommand,
                api: apiEndpoint
            });
            targetElement.data("vimeoPendingCommands", pendingCommands);
        }

        // Handle methods that return data (e.g., 'getVolume', 'paused') by invoking a callback.
        const expectsReturn = (methodName.startsWith("get") || methodName === "paused");
        if (expectsReturn && typeof methodValueOrCallback === "function") {
            const currentResponseCount = vimeoCommsManager.responseQueue.returnedValues.length;
            const callbackFunction = methodValueOrCallback;
            const callIndex = vimeoCommsManager.responseQueue.callTracker;

            // Increment the tracker for pending returns.
            vimeoCommsManager.responseQueue.callTracker++;

            // Poll the response queue for the expected return value.
            let pollInterval = globalObj.setInterval(function() {
                if (vimeoCommsManager.responseQueue.returnedValues.length > currentResponseCount) {
                    globalObj.clearInterval(pollInterval);
                    // The returned value will be at the index corresponding to when the call was made.
                    callbackFunction(vimeoCommsManager.responseQueue.returnedValues[callIndex]);
                }
            }, 50); // Check every 50ms. Could be adjusted.
        }

        return targetElement; // Allow jQuery chaining.
    };

    /**
     *  jQuery instance method to send commands to a selected Vimeo iframe player.
     *  This allows calling .vimeoCommand() directly on a jQuery-selected iframe.
     *
     * @param {string} methodName The Vimeo API method to call.
     * @param {string|number|Function} [methodValueOrCallback] Optional: value or callback.
     * @returns {jQuery} The jQuery object for chaining.
     */
    jq.fn.vimeoCommand = function(methodName, methodValueOrCallback) {
        // Apply the static method to the current jQuery selection.
        return jq.vimeoCommand(this, methodName, methodValueOrCallback);
    };

})(jQuery, window);
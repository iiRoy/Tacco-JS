;(function(jq, globalScope) {

    // Main object managing Vimeo player interactions via jQuery.
    var mediaPlayerCore = {

        // Stores return messages from method calls (e.g., getVolume).
        // 'resultQueue' holds the actual return values.
        // 'invocationTally' is a counter for pending method calls.
        responseCache : { resultQueue:[], invocationTally:0 },

        // Initializes the handling of incoming window messages.
        bootstrap : function(inputObj){

            var targetFrame, // Reference to the target iframe element.
                serviceEndpoint, // The base URL for the Vimeo API.
                parsedPayload; // The data received from the message event.

            // Check if the message originated from Vimeo.
            if(!inputObj.originalEvent.origin.match(/vimeo/g)) {
                return; // Not a Vimeo message, ignore.
            }

            // Ensure there is data in the event.
            if(!("data" in inputObj.originalEvent)) {
                return; // No data, ignore.
            }

            // Parse the incoming data, assuming it might be a JSON string.
            parsedPayload = jq.type(inputObj.originalEvent.data) === "string" ? jq.parseJSON(inputObj.originalEvent.data) : inputObj.originalEvent.data;

            // Verify that the parsed payload is not empty.
            if(!parsedPayload) {
                return; // Empty payload, ignore.
            }

            // Identify the specific Vimeo player iframe this message belongs to.
            targetFrame = this.identifyPlayerFrame(parsedPayload);
            // Construct the API endpoint URL for this player.
            serviceEndpoint = this.determineServiceURL(targetFrame);

            // If the payload indicates an event (like 'ready' or 'paused').
            if(parsedPayload.hasOwnProperty("event")) {
                this.dispatchPlayerEvent(parsedPayload, targetFrame, serviceEndpoint);
            }

            // If the payload indicates a method return (like 'getVolume' or 'getCurrentTime').
            if(parsedPayload.hasOwnProperty("method")) {
                this.processMethodResponse(parsedPayload, targetFrame, serviceEndpoint);
            }

        }, // End of bootstrap method.

        // Determines which player iframe corresponds to the incoming message.
        identifyPlayerFrame : function(inputObj){

            // If a 'player_id' was provided in the message data.
            if(inputObj.hasOwnProperty("player_id")){
                // Check for an element with that ID directly.
                if(jq("#" + inputObj.player_id).length){
                    return jq("#" + inputObj.player_id);
                } else {
                    // Otherwise, look for an iframe whose source contains the ID.
                    return jq("iframe[src*=" + inputObj.player_id + "]");
                }
            } else {
                // If no player_id, default to the first Vimeo iframe found on the page.
                // This assumes only one Vimeo player or that the first is the intended target.
                return jq("iframe[src*='vimeo']").eq(0);
            }

        }, // End of identifyPlayerFrame method.

        // Constructs the base URL for communicating with the Vimeo player.
        determineServiceURL : function(playerRef){

            // Get the 'src' attribute of the iframe.
            var frameSource = playerRef.attr('src');

            // Prepend the appropriate protocol if it's missing (e.g., '//player.vimeo.com').
            if(frameSource.substr(0, 4) !== 'http'){
                return globalScope.location.protocol !== 'https:' ? 'http:'+frameSource.split('?')[0] : 'https:'+frameSource.split('?')[0];
            } else {
                // If protocol is already present, just return the base URL without query parameters.
                return frameSource.split('?')[0];
            }
        }, // End of determineServiceURL method.

        // Handles messages that are responses to method calls (e.g., value from getVolume).
        processMethodResponse : function(parsedPayload, playerRef, endpointURI){

            // Store the returned value in the response cache for later retrieval by a callback.
            this.responseCache.resultQueue.push(parsedPayload.value);

        }, // End of processMethodResponse method.

        // Dispatches various events received from the Vimeo player.
        dispatchPlayerEvent : function(parsedPayload, playerRef, endpointURI){
            switch (parsedPayload.event.toLowerCase()) {
                case 'ready':
                    // Player is ready, iterate through all attached jQuery events.
                    for(var eventKey in jq._data(playerRef[0], "events")){
                        // If the event is a supported Vimeo event, register a listener with the player.
                        if(eventKey.match(/loadProgress|playProgress|play|pause|finish|seek|cuechange/)){
                            playerRef[0].contentWindow.postMessage(JSON.stringify({method: 'addEventListener', value: eventKey}), endpointURI);
                        }
                    }

                    // If there were method calls made before the player was ready, execute them now.
                    if(playerRef.data("queuedVimeoActions")){
                        var queuedActions = playerRef.data("queuedVimeoActions");
                        for(var idx = 0; idx < queuedActions.length; idx++){
                            playerRef[0].contentWindow.postMessage(JSON.stringify(queuedActions[idx].message), queuedActions[idx].api);
                        }
                        // Clear the queue after execution.
                        playerRef.removeData("queuedVimeoActions");
                    }

                    // Mark this player as ready and trigger a custom 'ready' event on its jQuery object.
                    playerRef.data("playerIsReady", true);
                    playerRef.triggerHandler("ready");

                    break; // End of 'ready' case.

                case 'seek':
                    playerRef.triggerHandler("seek", [parsedPayload.data]);
                    break;

                case 'loadprogress':
                    playerRef.triggerHandler("loadProgress", [parsedPayload.data]);
                    break;

                case 'playprogress':
                    playerRef.triggerHandler("playProgress", [parsedPayload.data]);
                    break;

                case 'pause':
                    playerRef.triggerHandler("pause");
                    break;

                case 'finish':
                    playerRef.triggerHandler("finish");
                    break;

                case 'play':
                    playerRef.triggerHandler("play");
                    break;

                case 'cuechange':
                    playerRef.triggerHandler("cuechange");
                    break;
            }
        } // End of dispatchPlayerEvent method.
    }; // End of mediaPlayerCore object.

    // Attach a global message listener to the window.
    // When a message is received, it's passed to our core handler.
    jq(globalScope).on("message", function(msgEvt){ mediaPlayerCore.bootstrap(msgEvt); });


    /**
     *  jQuery plugin for Vimeo player interaction.
     *
     * @param mediaElement {jQuery Object} The iframe element representing the Vimeo player.
     * @param commandName {string} The method to invoke on the Vimeo player (e.g., 'play', 'getVolume').
     * @param commandValueOrCallback {string|function} Optional: A value for the method (e.g., volume level)
     *                                                  or a callback function for 'get' methods.
     */
    jq.vimeoBridge = function(mediaElement, commandName, commandValueOrCallback) {

        var actionCommand = {}, // Object to hold the method and its value for the postMessage.
            initialCacheSize = mediaPlayerCore.responseCache.resultQueue.length; // Snapshot of the cache size.

        // Assign the method name to the command object.
        if(typeof commandName === "string") {
            actionCommand.method = commandName;
        }

        // Assign the value if it's not a function and not undefined.
        if(typeof commandValueOrCallback !== "undefined" && typeof commandValueOrCallback !== "function") {
            actionCommand.value = commandValueOrCallback;
        }

        // Check if the target is an iframe and a method is specified.
        if(mediaElement.prop("tagName").toLowerCase() === 'iframe' && actionCommand.hasOwnProperty("method")){
            // If the player is already ready, send the message immediately.
            if(mediaElement.data("playerIsReady")){
                mediaElement[0].contentWindow.postMessage(JSON.stringify(actionCommand), mediaPlayerCore.determineServiceURL(mediaElement));
            } else {
                // If not ready, queue the action to be executed once the player reports 'ready'.
                var existingQueue = mediaElement.data("queuedVimeoActions") ? mediaElement.data("queuedVimeoActions") : [];
                existingQueue.push({message: actionCommand, api: mediaPlayerCore.determineServiceURL(mediaElement)});
                mediaElement.data("queuedVimeoActions", existingQueue);
            }
        }

        // If this is a 'get' method (or 'paused') and a callback is provided,
        // set up an interval to wait for the return value.
        if((commandName.toString().substr(0, 3) === "get" || commandName.toString() === "paused") && typeof commandValueOrCallback === "function"){
            (function(cachedCount, callbackFn, currentTally){
                var pollHandle = globalScope.setInterval(function(){

                    // Check if the response cache has grown, indicating a return value.
                    if(mediaPlayerCore.responseCache.resultQueue.length !== cachedCount){
                        globalScope.clearInterval(pollHandle); // Stop polling.
                        // Invoke the callback with the stored result.
                        callbackFn(mediaPlayerCore.responseCache.resultQueue[currentTally]);
                    }
                }, 10); // Poll every 10 milliseconds.
            })(initialCacheSize, commandValueOrCallback, mediaPlayerCore.responseCache.invocationTally);
            mediaPlayerCore.responseCache.invocationTally++; // Increment the counter for this method call.
        }
        return mediaElement; // Allow for chaining.
    }; // End of jq.vimeoBridge function.

    // Extend jQuery's prototype to allow calling .vimeoBridge directly on jQuery objects.
    jq.fn.vimeoBridge = function(commandName, commandValueOrCallback) {
            return jq.vimeoBridge(this, commandName, commandValueOrCallback);
    };

})(jQuery, window); // Pass jQuery and window objects to the IIFE.
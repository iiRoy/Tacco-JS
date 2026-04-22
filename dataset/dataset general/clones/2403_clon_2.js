/*
 * interaction-tracking.js
 * build: 1.2.3
 * creator: A. Developer
 * github.com/adeveloper/interaction-tracking.js
 */
(function (jq, globalScope, undef) {

    // Current interaction history container
    var currentInteraction,
        // Collection of registered interaction handlers by key
        motionHandlers = {},
        // Boolean flag indicating touch device capability
        hasTouchCapability = 'ontouchstart' in globalScope,
        // Main object for managing pointer interactions and utilities
        pointer = {
            /** @lends jq.pointerEvents */

            /**
             * Status flag indicating if interaction listening is operational.
             * @type {Boolean}
             */
            enabled: false,

            /**
             * Initiates the tracking of various pointer events across the document.
             * This method is automatically invoked upon script loading.
             */
            activate: function () {
                // Attach event listeners for pointer down/start events
                jq(document).on('touchstart MSPointerDown pointerdown', onPointerStart)
                    // Attach event listeners for pointer move/drag events
                    .on('touchmove MSPointerMove MSPointerHover pointermove', onPointerDrag)
                    // Attach event listeners for pointer up/end/cancel events
                    .on('touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel', onPointerEnd);

                pointer.enabled = true; // Update activation status
            },

            /**
             * Halts the tracking of all pointer events by detaching listeners.
             */
            deactivate: function () {
                // Detach all previously attached event listeners for pointer events
                jq(document).off('touchstart MSPointerDown pointerdown', onPointerStart)
                    .off('touchmove MSPointerMove MSPointerHover pointermove ', onPointerDrag)
                    .off('touchend touchcancel MSPointerUp MSPointerCancel pointerup pointercancel', onPointerEnd);

                pointer.enabled = false; // Update activation status
            },

            /**
             * Registers a new set of custom handlers for a specific interaction type.
             *
             * @param  {String} handlerKey A unique identifier (namespace) for this set of handlers.
             * @param  {Object} handlerConfig Object containing event handler functions.
             * @param  {Function} handlerConfig.pointerStart Function to call at interaction beginning.
             * @param  {Function} handlerConfig.pointerDrag Function to call during interaction movement.
             * @param  {Function} handlerConfig.pointerEnd Function to call at interaction conclusion.
             */
            registerHandler: function (handlerKey, handlerConfig) {
                motionHandlers[handlerKey] = handlerConfig;
            },

            /**
             * Enriches a normalized event object with computed positional data relative to the target.
             * @param  {Event} evtObj The normalized event object.
             * @param  {Object} additionalInfo Any extra properties to merge into the output.
             * @return {Object} An augmented event data object with calculated offsets.
             */
            augmentEventData: function (evtObj, additionalInfo) {
                var targetElement = jq(evtObj.eventTarget), // jQuery wrapper for the event target
                    position = targetElement.offset(), // Get the element's page offset
                    outputPayload = {
                        pageCoordX: evtObj.contactPoints[0].coordX,
                        pageCoordY: evtObj.contactPoints[0].coordY,
                        offsetFromX: position.left - evtObj.contactPoints[0].coordX,
                        offsetFromY: position.top - evtObj.contactPoints[0].coordY
                    };

                return jq.extend(outputPayload, additionalInfo); // Merge any additional properties provided
            },

            /**
             * Transforms a raw DOM Event object into a simplified, standardized internal format.
             * @param  {Event} domEvt The original DOM event object.
             * @return {Object} A standardized event representation for internal use.
             */
            NormalizedEvent: function (domEvt) {
                // Prepare a new object for the standardized event data
                var processedEvent = {
                    type: domEvt.type, // Event type string (e.g., 'touchstart')
                    eventTime: new Date().getTime(), // Milliseconds since epoch for this event
                    eventTarget: domEvt.target, // The DOM element that originated the event
                    contactPoints: [] // Array to hold normalized touch/pointer points
                };

                var rawPoints = []; // Temporary array for collecting raw point data
                // Handle various touch event types to extract points
                if (domEvt.type.indexOf('touch') > -1) {
                    rawPoints = domEvt.changedTouches || domEvt.originalEvent.changedTouches || domEvt.touches || domEvt.originalEvent.touches;
                }
                // Handle MS Pointer event types to extract points
                else if (domEvt.type.match(/.*?pointer.*?/i)) {
                    rawPoints = [domEvt.originalEvent];
                }

                // Iterate over raw points and normalize their coordinates (pageX, pageY to coordX, coordY)
                jq.each(rawPoints, function (idx, rawPoint) {
                    processedEvent.contactPoints.push({coordX: rawPoint.pageX, coordY: rawPoint.pageY});
                });

                return processedEvent; // Return the standardized event object
            },

            /**
             * Constructs a new interaction state object based on the initial event.
             * This object tracks the lifecycle of a single user interaction.
             * @param  {Object} initialEvt The normalized starting event object.
             * @return {Object} A new state container for the ongoing interaction.
             */
            InteractionState: function (initialEvt) {
                var initialPoint = initialEvt.contactPoints[0]; // Get the first contact point from the initial event

                return {
                    begin: initialEvt, // Store the initial normalized event
                    movements: [], // An array to store all subsequent normalized move events
                    finish: null // Will store the final normalized end event
                };
            },

            /**
             * Mathematical utility functions for various spatial and temporal calculations.
             * @type {Object}
             */
            mathUtils: {
                /**
                 * Computes the elapsed time between two event timestamps.
                 * @param  {Object} beginEvt The starting event object.
                 * @param  {Object} finalEvt The ending event object.
                 * @return {Number} Time difference in milliseconds.
                 */
                calculateTimeDelta: function (beginEvt, finalEvt) {
                    return finalEvt.eventTime - beginEvt.eventTime;
                },

                /**
                 * Determines the Euclidean distance between two points.
                 * @param  {Object} pointOne The first point object ({coordX, coordY}).
                 * @param  {Object} pointTwo The second point object ({coordX, coordY}).
                 * @return {Number} The distance in pixels.
                 */
                measureDistance: function (pointOne, pointTwo) {
                    return Math.sqrt(Math.pow(pointTwo.coordX - pointOne.coordX, 2) + Math.pow(pointTwo.coordY - pointOne.coordY, 2));
                },

                /**
                 * Calculates the angle in degrees between two points on a 2D plane.
                 * @param  {Object} pointStart The initial point.
                 * @param  {Object} pointEnd The terminal point.
                 * @return {Number} Angle in degrees (ranging from -180 to 180).
                 */
                determineAngle: function (pointStart, pointEnd) {
                    return Math.atan2(pointEnd.coordY - pointStart.coordY, pointEnd.coordX - pointStart.coordX) * 180 / Math.PI;
                },

                /**
                 * Translates an angle (in degrees) into a cardinal direction string.
                 * @param  {Number} rotationAngle The angle in degrees.
                 * @return {String} 'north', 'east', 'south', 'west' or 'unknown'.
                 */
                resolveDirection: function (rotationAngle) {
                    return rotationAngle < -45 && rotationAngle > -135 ? 'north' :
                        rotationAngle >= -45 && rotationAngle <= 45 ? 'east' :
                            rotationAngle >= 45 && rotationAngle < 135 ? 'south' :
                                rotationAngle >= 135 || rotationAngle <= -135 ? 'west' :
                                    'unknown';
                },

                /**
                 * Computes the scaling factor between two multi-point interactions (e.g., pinch-to-zoom).
                 * @param  {Object} initialEvent The initial event state object.
                 * @param  {Object} currentEvent The current event state object.
                 * @return {Number} The calculated scaling ratio, or 0 if insufficient points.
                 */
                computeScaleFactor: function (initialEvent, currentEvent) {
                    var startPoints = initialEvent.contactPoints,
                        movePoints = currentEvent.contactPoints;

                    // Scaling requires at least two contact points to be meaningful
                    if (startPoints.length === 2 && movePoints.length === 2) {
                        return (Math.sqrt(Math.pow(movePoints[0].coordX - movePoints[1].coordX, 2) + Math.pow(movePoints[0].coordY - movePoints[1].coordY, 2)) /
                            Math.sqrt(Math.pow(startPoints[0].coordX - startPoints[1].coordX, 2) + Math.pow(startPoints[0].coordY - startPoints[1].coordY, 2))).toFixed(2);
                    }

                    return 0; // Return 0 if not enough points for scaling
                },

                /**
                 * Calculates the rotational change in degrees between two multi-point events.
                 * @param  {Object} initialEvent The starting event object.
                 * @param  {Object} currentEvent The current event object.
                 * @return {Number} The rotation in degrees.
                 */
                calculateRotationDelta: function (initialEvent, currentEvent) {
                    var startPoints = initialEvent.contactPoints,
                        movePoints = currentEvent.contactPoints;

                    // Rotation calculation also requires two contact points
                    if (startPoints.length === 2 && movePoints.length === 2) {
                        return ((Math.atan2(movePoints[0].coordY - movePoints[1].coordY, movePoints[0].coordX - movePoints[1].coordX) * 180 / Math.PI) -
                            (Math.atan2(startPoints[0].coordY - startPoints[1].coordY, startPoints[0].coordX - startPoints[1].coordX) * 180 / Math.PI)).toFixed(2);
                    }

                    return 0; // Return 0 if not enough points for rotation
                }
            }

        }; // End of pointer object definition

    /**
     * Loops over all registered interaction handlers and invokes the specified method on each.
     * @private
     * @param  {String} handlerMethod The name of the method to call (e.g., 'pointerStart', 'pointerDrag', 'pointerEnd').
     * @param  {Event} domEvt The original DOM event object.
     * @param  {Object} currentInteraction The current state object of the interaction.
     * @param  {Object} processedEvent The normalized event object for the current phase.
     */
    function iterateHandlers(handlerMethod, domEvt, currentInteraction, processedEvent) {
        jq.each(motionHandlers, function (index, currentHandler) {
            // Ensure the specific handler method exists before attempting to call it
            if (currentHandler[handlerMethod]) {
                currentHandler[handlerMethod].call(currentHandler, domEvt, currentInteraction, processedEvent);
            }
        });
    }

    /**
     * Handles the initial pointer down or touch start event.
     * Initializes a new interaction state.
     * @private
     * @param  {Object} domEvt The raw DOM event object.
     */
    function onPointerStart(domEvt) {
        var initialEvt = pointer.NormalizedEvent(domEvt); // Normalize the raw event data
        currentInteraction = pointer.InteractionState(initialEvt); // Create a new state object for this interaction

        // Notify all registered handlers about the start of a new interaction
        iterateHandlers('pointerStart', domEvt, currentInteraction, initialEvt);
    }

    /**
     * Manages pointer move or touch drag events, recording movement and dispatching to handlers.
     * @private
     * @param  {Object} domEvt The raw DOM event object.
     */
    function onPointerDrag(domEvt) {
        // If no interaction is currently active, ignore this move event
        if (!currentInteraction) {
            return;
        }

        var dragEvt = pointer.NormalizedEvent(domEvt); // Normalize the current move event
        currentInteraction.movements.push(dragEvt); // Add the normalized move event to the state history

        // Dispatch the move event to all active handlers
        iterateHandlers('pointerDrag', domEvt, currentInteraction, dragEvt);
    }

    /**
     * Processes pointer up, touch end, or touch cancel events.
     * Finalizes the interaction state and dispatches the end event.
     * @private
     * @param  {Object} domEvt The raw DOM event object.
     */
    function onPointerEnd(domEvt) {
        // If no interaction is active, simply return (e.g., a 'mouseup' without a preceding 'mousedown')
        if (!currentInteraction) {
            return;
        }

        var finalEvt = pointer.NormalizedEvent(domEvt); // Normalize the final event data
        currentInteraction.finish = finalEvt; // Store the final event in the interaction state

        // Inform all handlers that the interaction has concluded
        iterateHandlers('pointerEnd', domEvt, currentInteraction, finalEvt);

        // Reset the current interaction state, marking it as complete
        currentInteraction = null;
    }

    // Enable the event listeners for pointer interactions upon script loading
    pointer.activate();

    // Expose the pointer object under the jQuery namespace for external access
    jq.pointerEvents = pointer;

}(jQuery, this));
/*
 * Enhanced Input Event Monitor
 * Provides a robust framework for tracking and processing touch and pointer gestures.
 * Module Version: 1.1.0
 * Developed by: AnonymousDev
 */
(function (jQueryContext, globalScope) {

    // Local references for frequently used global objects to improve readability and slight performance.
    const documentRef = globalScope.document;
    const windowRef = globalScope;

    // Stores the active interaction sequence. Null when no interaction is in progress.
    let activeInteractionSequence = null;
    // A registry for all custom gesture handlers, using a Map for clearer key-value storage.
    const registeredGestureModules = new Map();

    // Determine if the current environment supports the older 'ontouchstart' API.
    const environmentSupportsTouch = 'ontouchstart' in windowRef;

    // Define common event strings for binding and unbinding.
    const START_EVENTS = 'pointerdown touchstart MSPointerDown';
    const MOVE_EVENTS = 'pointermove touchmove MSPointerMove';
    const END_CANCEL_EVENTS = 'pointerup touchend touchcancel MSPointerUp MSPointerCancel pointercancel';

    /**
     * Core object responsible for managing pointer events and dispatching to gesture handlers.
     * @namespace jQueryContext.inputObserver
     */
    const inputObserver = {

        /**
         * Flag indicating whether the event tracking mechanisms are currently active.
         * @type {boolean}
         */
        isTrackingEnabled: false,

        /**
         * Initiates the binding of all necessary DOM event listeners to start tracking interactions.
         * This method is called automatically when the module loads.
         */
        activateTracking: function () {
            if (!jQueryContext) {
                console.error("jQuery library is not available. Input observer cannot be activated.");
                return;
            }

            // Prevent re-binding if already active.
            if (this.isTrackingEnabled) {
                console.warn("Input observer is already active. No action taken.");
                return;
            }

            // Attach event listeners to the document for global interaction capture.
            jQueryContext(documentRef)
                .on(START_EVENTS, handlePointerInitiation)
                .on(MOVE_EVENTS, handlePointerMovement)
                .on(END_CANCEL_EVENTS, handlePointerTermination);

            this.isTrackingEnabled = true;
            console.log("Input observer activated. Tracking pointer and touch events.");
        },

        /**
         * Removes all previously bound DOM event listeners, effectively stopping interaction tracking.
         */
        deactivateTracking: function () {
            if (!jQueryContext) return; // Guard for jQuery absence.

            // Prevent unbinding if already inactive.
            if (!this.isTrackingEnabled) {
                console.warn("Input observer is already inactive. No action taken.");
                return;
            }

            // Detach event listeners from the document.
            jQueryContext(documentRef)
                .off(START_EVENTS, handlePointerInitiation)
                .off(MOVE_EVENTS, handlePointerMovement)
                .off(END_CANCEL_EVENTS, handlePointerTermination);

            this.isTrackingEnabled = false;
            console.log("Input observer deactivated. Event tracking halted.");
        },

        /**
         * Registers a new gesture recognition module. Each module must provide specific callbacks.
         *
         * @param {string} moduleIdentifier - A unique string identifier for the gesture module.
         * @param {Object} moduleCallbacks - An object containing 'onGestureStart', 'onGestureMove', 'onGestureEnd' functions.
         * @param {Function} moduleCallbacks.onGestureStart - Callback invoked when a new interaction begins.
         * @param {Function} moduleCallbacks.onGestureMove - Callback invoked during an active interaction's movement phase.
         * @param {Function} moduleCallbacks.onGestureEnd - Callback invoked when an interaction concludes or is cancelled.
         */
        registerGestureModule: function (moduleIdentifier, moduleCallbacks) {
            // Validate the structure of the provided callbacks.
            const requiredMethods = ['onGestureStart', 'onGestureMove', 'onGestureEnd'];
            const isValid = requiredMethods.every(method => typeof moduleCallbacks[method] === 'function');

            if (!isValid) {
                console.error(`Attempted to register invalid gesture module "${moduleIdentifier}". Missing one or more required methods: ${requiredMethods.join(', ')}.`);
                return;
            }

            if (registeredGestureModules.has(moduleIdentifier)) {
                console.warn(`Gesture module with identifier "${moduleIdentifier}" already exists. Overwriting.`);
            }
            registeredGestureModules.set(moduleIdentifier, moduleCallbacks);
            console.debug(`Gesture module "${moduleIdentifier}" successfully registered.`);
        },

        /**
         * Enhances a normalized event object with target-specific offset coordinates.
         *
         * @param {Event} rawEvent - The original DOM event.
         * @param {Object} additionalProperties - Optional extra data to merge into the output.
         * @returns {Object} An augmented event payload.
         */
        enhanceEventPayload: function (rawEvent, additionalProperties = {}) {
            const $targetElement = jQueryContext(rawEvent.target);
            const targetPosition = $targetElement.offset();

            const normalized = this.normalizeInputEvent(rawEvent);
            const mainPoint = normalized.interactionPoints[0];

            if (!mainPoint) {
                console.warn("No primary interaction point found for event payload enhancement.");
                return { originalEvent: rawEvent, ...additionalProperties };
            }

            const enhancedPayload = {
                eventClientX: mainPoint.x,
                eventClientY: mainPoint.y,
                offsetFromTargetX: mainPoint.x - targetPosition.left,
                offsetFromTargetY: mainPoint.y - targetPosition.top
            };

            // Use object spread for merging, a modern and concise approach.
            return { ...enhancedPayload, ...additionalProperties, originalEvent: rawEvent };
        },

        /**
         * Standardizes a raw browser event into a consistent internal format,
         * abstracting differences between 'touch', 'mouse', and 'pointer' events.
         *
         * @param {Event} browserEvent - The original event object from the browser.
         * @returns {Object} A normalized event object with a consistent structure.
         */
        normalizeInputEvent: function (browserEvent) {
            const normalizedEventData = {
                eventType: browserEvent.type,
                eventTimestamp: Date.now(), // More efficient than new Date().getTime()
                eventTarget: browserEvent.target,
                interactionPoints: []
            };

            let rawPoints = [];
            const originalEventSource = browserEvent.originalEvent || browserEvent; // Handle jQuery's event wrapping.

            // Differentiate between touch, pointer, and mouse events to extract points.
            if (originalEventSource.touches && originalEventSource.touches.length > 0) {
                rawPoints = Array.from(originalEventSource.touches); // Convert TouchList to an array
            } else if (originalEventSource.changedTouches && originalEventSource.changedTouches.length > 0) {
                rawPoints = Array.from(originalEventSource.changedTouches);
            } else if (originalEventSource.pointerType) { // W3C Pointer Events or IE's MSPointer
                rawPoints = [originalEventSource];
            } else { // Fallback for standard mouse events or other single-point interactions
                rawPoints = [originalEventSource];
            }

            // Map raw point data to a consistent {x, y} format.
            normalizedEventData.interactionPoints = rawPoints.map(point => ({
                x: point.pageX || point.clientX, // Prefer pageX, fallback to clientX
                y: point.pageY || point.clientY
            }));

            // Log a warning if no interaction points could be extracted.
            if (normalizedEventData.interactionPoints.length === 0) {
                console.warn("Normalization resulted in zero interaction points for event:", browserEvent);
            }

            return normalizedEventData;
        },

        /**
         * Generates a new state object to track the lifecycle of a single user interaction.
         *
         * @param {Object} startEventNormalized - The standardized event data for the interaction's beginning.
         * @returns {Object} An object encapsulating the interaction's current state.
         */
        createInteractionLifecycle: function (startEventNormalized) {
            // Assign a unique identifier to this interaction for potential multi-touch scenarios.
            const uniqueInteractionId = `seq-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

            return {
                interactionId: uniqueInteractionId,
                initialEventData: startEventNormalized,
                movementEvents: [],
                finalEventData: null
            };
        },

        /**
         * A collection of mathematical helper functions for calculating gesture-related metrics.
         * @namespace
         */
        mathUtilities: {
            // Constants for angle conversions.
            RADIANS_TO_DEGREES: 180 / Math.PI,
            DEGREES_TO_RADIANS: Math.PI / 180,

            /**
             * Computes the time elapsed between two normalized event objects.
             * @param {Object} firstEvent - The starting event, must contain 'eventTimestamp'.
             * @param {Object} secondEvent - The ending event, must contain 'eventTimestamp'.
             * @returns {number} The duration in milliseconds. Returns 0 if timestamps are invalid.
             */
            calculateTimeDuration: function (firstEvent, secondEvent) {
                if (typeof firstEvent.eventTimestamp !== 'number' || typeof secondEvent.eventTimestamp !== 'number') {
                    console.error("Invalid timestamp data provided for duration calculation.");
                    return 0;
                }
                return secondEvent.eventTimestamp - firstEvent.eventTimestamp;
            },

            /**
             * Determines the straight-line distance between two points (x, y).
             * @param {Object} pointAlpha - The first point with 'x' and 'y' properties.
             * @param {Object} pointBeta - The second point with 'x' and 'y' properties.
             * @returns {number} The Euclidean distance in pixels.
             */
            calculatePointDistance: function (pointAlpha, pointBeta) {
                // Using Math.hypot for a more robust and cleaner calculation.
                return Math.hypot(pointBeta.x - pointAlpha.x, pointBeta.y - pointAlpha.y);
            },

            /**
             * Calculates the angle (in degrees) formed by a line segment between two points relative to the x-axis.
             * @param {Object} pointOrigin - The starting point.
             * @param {Object} pointEnd - The ending point.
             * @returns {number} The angle in degrees, ranging from -180 to 180.
             */
            calculateAngleBetweenPoints: function (pointOrigin, pointEnd) {
                return Math.atan2(pointEnd.y - pointOrigin.y, pointEnd.x - pointOrigin.x) * this.RADIANS_TO_DEGREES;
            },

            /**
             * Infers a primary cardinal direction based on an angle in degrees.
             * @param {number} angleDeg - The angle in degrees.
             * @returns {string} One of 'up', 'down', 'left', 'right', or 'indeterminate'.
             */
            inferCardinalDirection: function (angleDeg) {
                if (angleDeg >= -45 && angleDeg <= 45) {
                    return 'right';
                } else if (angleDeg > 45 && angleDeg < 135) {
                    return 'down';
                } else if (angleDeg < -45 && angleDeg > -135) {
                    return 'up';
                } else if (angleDeg >= 135 || angleDeg <= -135) {
                    return 'left';
                }
                return 'indeterminate'; // For cases like exactly 0, 90, 180, etc. or invalid input.
            },

            /**
             * Computes the scaling factor for a two-finger pinch gesture.
             * @param {Object} initialEventSnapshot - Normalized event from the start of the gesture.
             * @param {Object} currentEventSnapshot - Normalized event from the current frame of the gesture.
             * @returns {number} The scale factor (e.g., 1.5 for 50% zoom in), or 1 if not a valid two-finger gesture.
             */
            determinePinchScale: function (initialEventSnapshot, currentEventSnapshot) {
                const startPts = initialEventSnapshot.interactionPoints;
                const currentPts = currentEventSnapshot.interactionPoints;

                if (startPts.length === 2 && currentPts.length === 2) {
                    const initialSpan = this.calculatePointDistance(startPts[0], startPts[1]);
                    const currentSpan = this.calculatePointDistance(currentPts[0], currentPts[1]);

                    // Avoid division by zero or near-zero initial distances.
                    if (initialSpan < 1) return 1;

                    return parseFloat((currentSpan / initialSpan).toFixed(2));
                }
                return 1; // No scaling if not two points.
            },

            /**
             * Calculates the rotational change (in degrees) for a two-finger gesture.
             * @param {Object} initialEventSnapshot - Normalized event from the start of the gesture.
             * @param {Object} currentEventSnapshot - Normalized event from the current frame of the gesture.
             * @returns {number} The rotation in degrees, or 0 if not a valid two-finger gesture.
             */
            determineRotationDelta: function (initialEventSnapshot, currentEventSnapshot) {
                const startPts = initialEventSnapshot.interactionPoints;
                const currentPts = currentEventSnapshot.interactionPoints;

                if (startPts.length === 2 && currentPts.length === 2) {
                    const initialOrientation = Math.atan2(startPts[0].y - startPts[1].y, startPts[0].x - startPts[1].x) * this.RADIANS_TO_DEGREES;
                    const currentOrientation = Math.atan2(currentPts[0].y - currentPts[1].y, currentPts[0].x - currentPts[1].x) * this.RADIANS_TO_DEGREES;

                    return parseFloat((currentOrientation - initialOrientation).toFixed(2));
                }
                return 0; // No rotation if not two points.
            }
        }
    }; // End of inputObserver object

    /**
     * Dispatches a specific event phase (start, move, end) to all registered gesture modules.
     * @private
     * @param {string} phaseName - The name of the callback to invoke (e.g., 'onGestureStart').
     * @param {Event} originalDOMEvent - The raw DOM event object.
     * @param {Object} currentLifecycleState - The current state object of the interaction.
     * @param {Object} normalizedEventData - The normalized event data for the current phase.
     */
    function broadcastToGestureModules(phaseName, originalDOMEvent, currentLifecycleState, normalizedEventData) {
        for (const [key, module] of registeredGestureModules.entries()) { // Iterate over Map entries.
            // Ensure the specific phase method exists on the module.
            if (typeof module[phaseName] === 'function') {
                module[phaseName](originalDOMEvent, currentLifecycleState, normalizedEventData);
            } else {
                console.debug(`Gesture module "${key}" does not implement method for phase: ${phaseName}.`);
            }
        }
    }

    /**
     * Handles the initial 'pointerdown' or 'touchstart' event, starting a new interaction.
     * @private
     * @param {Event} evt - The raw DOM event.
     */
    function handlePointerInitiation(evt) {
        // Ignore right-click events (button 2) for mouse pointers.
        if (evt.button === 2) {
            console.debug("Ignoring right-click event.");
            return;
        }

        const initialNormalizedData = inputObserver.normalizeInputEvent(evt);
        activeInteractionSequence = inputObserver.createInteractionLifecycle(initialNormalizedData);

        // Basic validation for the created state.
        if (!activeInteractionSequence || !activeInteractionSequence.initialEventData) {
            console.error("Failed to initialize interaction sequence.");
            return;
        }

        broadcastToGestureModules('onGestureStart', evt, activeInteractionSequence, initialNormalizedData);
    }

    /**
     * Handles 'pointermove' or 'touchmove' events, updating the active interaction state.
     * @private
     * @param {Event} evt - The raw DOM event.
     */
    function handlePointerMovement(evt) {
        // If no interaction is active, simply ignore move events.
        if (!activeInteractionSequence) {
            console.debug("Move event received without an active interaction sequence. Ignoring.");
            return;
        }

        // For touch-like events, prevent default behavior (e.g., scrolling) if cancelable.
        // This is a common Type III addition for better UX on touch devices.
        if (evt.cancelable && (evt.type.includes('touch') || evt.pointerType === 'touch')) {
            evt.preventDefault();
        }

        const currentMovementData = inputObserver.normalizeInputEvent(evt);
        activeInteractionSequence.movementEvents.push(currentMovementData);

        broadcastToGestureModules('onGestureMove', evt, activeInteractionSequence, currentMovementData);
    }

    /**
     * Handles 'pointerup', 'touchend', or 'touchcancel' events, finalizing the interaction.
     * @private
     * @param {Event} evt - The raw DOM event.
     */
    function handlePointerTermination(evt) {
        // If no interaction is active, ignore end events.
        if (!activeInteractionSequence) {
            console.debug("End event received without an active interaction sequence. Ignoring.");
            return;
        }

        const finalNormalizedData = inputObserver.normalizeInputEvent(evt);
        activeInteractionSequence.finalEventData = finalNormalizedData;

        broadcastToGestureModules('onGestureEnd', evt, activeInteractionSequence, finalNormalizedData);

        // Crucially, reset the active interaction state after it concludes.
        activeInteractionSequence = null;
    }

    // Immediately activate the tracking mechanism upon script execution, if jQuery is available.
    if (jQueryContext) {
        inputObserver.activateTracking();
    } else {
        console.error("jQuery is not defined. Input observer functionality will not be available.");
    }

    // Expose the inputObserver object under a new name in the jQuery namespace.
    jQueryContext.inputObserver = inputObserver;

}(jQuery, this));
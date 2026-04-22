const InteractionActions = {
    CALCULATE: 'compute',
    AUTOMATIC: 'auto',
    MANIPULATION_MODE: 'manipulation',
    BLOCK_ALL: 'none',
    PAN_X_AXIS: 'pan-x',
    PAN_Y_AXIS: 'pan-y'
};

// Renamed global dependencies (assuming these are defined elsewhere in the environment)
// `getPrefixedProperty` replaces `prefixed`
// `tempDOMNode` replaces `TEST_ELEMENT`
// `boolOrFnCheck` replaces `boolOrFn`
// `stringContains` replaces `inStr`
// `HORIZ_DIR_FLAG` replaces `DIRECTION_HORIZONTAL`
// `VERT_DIR_FLAG` replaces `DIRECTION_VERTICAL`

const vendorSpecificTouchProp = getPrefixedProperty(tempDOMNode.style, 'touchAction');
const hasNativeTouchSupport = vendorSpecificTouchProp !== undefined;

/**
 * Handles browser interaction policies for gestures,
 * either by setting native touch-action CSS or providing a JavaScript fallback.
 * @param {Object} eventCoordinator - The manager instance orchestrating gestures.
 * @param {string} initialPolicy - The initial touch-action policy to apply.
 * @constructor
 */
function InteractionPolicyHandler(eventCoordinator, initialPolicy) {
    // Robust validation for the eventCoordinator's essential properties
    if (!eventCoordinator || typeof eventCoordinator !== 'object' || !eventCoordinator.element || !eventCoordinator.session) {
        console.error("InteractionPolicyHandler: Provided event coordinator is invalid or incomplete. Instance marked as invalid.");
        this.isValid = false; // Mark instance as invalid to prevent further operations
        return;
    }
    this.eventCoordinator = eventCoordinator;
    this.activePolicyFlags = ''; // Initialize the policy string
    this.isValid = true; // Mark instance as valid
    this.configureActionPolicy(initialPolicy); // Apply initial policy
}

InteractionPolicyHandler.prototype = {
    /**
     * Configures the touch-action policy on the target element or activates the JS alternative.
     * This method resolves the policy value and applies it.
     * @param {string} newPolicySetting - The desired touch-action policy string.
     */
    configureActionPolicy: function(newPolicySetting) {
        if (!this.isValid) {
            console.warn("Attempted to configure an invalid InteractionPolicyHandler instance.");
            return;
        }

        let effectivePolicy = (newPolicySetting || InteractionActions.AUTOMATIC).toLowerCase().trim();

        // If the policy is set to 'compute', dynamically determine it based on active detectors
        if (effectivePolicy === InteractionActions.CALCULATE) {
            effectivePolicy = this.deriveEffectiveActions();
        }

        const targetElement = this.eventCoordinator.element;
        if (!targetElement) {
            console.error("InteractionPolicyHandler: Target element is missing, cannot apply policy.");
            return;
        }

        // Apply native CSS touch-action if supported and element exists
        if (hasNativeTouchSupport) {
            targetElement.style[vendorSpecificTouchProp] = effectivePolicy;
        } else {
            // Debugging log if native support is missing, indicating JS fallback is active
            // console.debug("Native touch-action not supported, relying on JS fallback for element:", targetElement);
        }

        this.activePolicyFlags = effectivePolicy; // Store the currently applied policy
    },

    /**
     * Reapplies the touch-action policy from the manager's options.
     * Useful for scenarios where options might change dynamically.
     */
    reapplyCurrentPolicy: function() {
        if (!this.isValid) return;

        const coordinatorOptions = this.eventCoordinator.options;
        // Provide a robust default if options or touchAction property are missing
        const policyFromOptions = (coordinatorOptions && coordinatorOptions.touchAction) ?
                                  coordinatorOptions.touchAction : InteractionActions.AUTOMATIC;

        this.configureActionPolicy(policyFromOptions);
    },

    /**
     * Computes an aggregated touch-action policy string based on all currently enabled gesture detectors.
     * This is primarily used when the policy is set to 'compute'.
     * @returns {string} The dynamically computed touch-action string.
     */
    deriveEffectiveActions: function() {
        if (!this.isValid) return InteractionActions.AUTOMATIC;

        const collectedActionParts = [];
        const registeredDetectors = this.eventCoordinator.recognizers || [];

        // Iterate through each registered detector to collect its declared touch actions
        registeredDetectors.forEach(detector => {
            // Use the renamed boolOrFnCheck for conditional enablement logic
            const isDetectorActive = boolOrFnCheck(detector.options.enable, [detector]);
            if (isDetectorActive) {
                const detectorDeclaredActions = detector.getTouchAction();
                // Ensure actions are added correctly, handling single strings or arrays
                if (Array.isArray(detectorDeclaredActions)) {
                    collectedActionParts.push(...detectorDeclaredActions);
                } else if (typeof detectorDeclaredActions === 'string' && detectorDeclaredActions.length > 0) {
                    collectedActionParts.push(detectorDeclaredActions);
                }
            }
        });

        // Normalize and combine the collected actions into a single valid string
        return standardizeActionString(collectedActionParts.join(' '));
    },

    /**
     * Manages browser default behaviors (such as scrolling or zooming) during an input cycle.
     * This method is crucial for environments without native touch-action CSS support.
     * @param {Object} eventInputData - Object containing event details, including the original event.
     */
    manageBrowserDefaultBehavior: function(eventInputData) {
        if (!this.isValid) return;

        // If native support is available, JavaScript-based prevention is not required
        if (hasNativeTouchSupport) {
            return;
        }

        const rawEvent = eventInputData && eventInputData.srcEvent;
        // Validate the raw event object and its preventDefault method
        if (!rawEvent || typeof rawEvent.preventDefault !== 'function') {
            console.debug("manageBrowserDefaultBehavior: Original event or preventDefault method is missing or invalid.");
            return;
        }

        // If the session has already globally prevented defaults, reiterate prevention for this event
        const currentSessionState = this.eventCoordinator.session;
        if (currentSessionState && currentSessionState.defaultPrevented) {
            rawEvent.preventDefault();
            return;
        }

        const currentAppliedPolicy = this.activePolicyFlags;
        const inputMovementDirection = eventInputData.offsetDirection;

        // Check for specific action flags using the renamed helper `stringContains`
        const isBlockingAll = stringContains(currentAppliedPolicy, InteractionActions.BLOCK_ALL);
        const allowsPanY = stringContains(currentAppliedPolicy, InteractionActions.PAN_Y_AXIS);
        const allowsPanX = stringContains(currentAppliedPolicy, InteractionActions.PAN_X_AXIS);

        // Delegate the complex prevention logic to a private helper method
        const shouldInitiatePrevention = this._evaluatePreventionCondition(
            isBlockingAll,
            allowsPanY,
            allowsPanX,
            inputMovementDirection
        );

        if (shouldInitiatePrevention) {
            this.forceDefaultSuppression(rawEvent);
        }
    },

    /**
     * Internal helper method to determine if default browser behavior should be prevented.
     * This encapsulates the complex logic for clarity and reusability.
     * @param {boolean} isBlockingAll - True if the 'none' action is active.
     * @param {boolean} allowsPanY - True if 'pan-y' is an active action.
     * @param {boolean} allowsPanX - True if 'pan-x' is an active action.
     * @param {number} currentDirection - The detected direction of the input (e.g., bitmask).
     * @returns {boolean} True if preventDefault should be called.
     * @private
     */
    _evaluatePreventionCondition: function(isBlockingAll, allowsPanY, allowsPanX, currentDirection) {
        if (isBlockingAll) {
            return true; // The 'none' action always implies preventing defaults
        }

        // Determine if movement is horizontal or vertical based on bit flags
        const isHorizontalMove = (currentDirection & HORIZ_DIR_FLAG) !== 0;
        const isVerticalMove = (currentDirection & VERT_DIR_FLAG) !== 0;

        // Check for conflicts: if pan-y is allowed but movement is horizontal, or vice versa for pan-x
        const conflictWithPanY = allowsPanY && isHorizontalMove;
        const conflictWithPanX = allowsPanX && isVerticalMove;

        return conflictWithPanY || conflictWithPanX;
    },

    /**
     * Forces the prevention of default browser behavior for a given event,
     * and updates the session state to reflect this action.
     * @param {Object} rawEvent - The original DOM event object.
     */
    forceDefaultSuppression: function(rawEvent) {
        if (!this.isValid) return;

        const currentSessionState = this.eventCoordinator.session;
        if (currentSessionState) {
            currentSessionState.defaultPrevented = true; // Mark the session as having prevented a default
        }
        rawEvent.preventDefault(); // Execute the browser's native preventDefault method
    }
};

/**
 * Normalizes and cleans up a space-separated string of touch actions into a single, valid CSS touch-action value.
 * This function handles precedence and combination rules for various touch-action directives.
 * @param {string} rawActionsInput - A string containing one or more touch actions (e.g., "pan-x pan-y none").
 * @returns {string} The standardized and resolved touch-action string.
 */
function standardizeActionString(rawActionsInput) {
    const cleanedInput = (rawActionsInput || '').toLowerCase().trim();

    // If 'none' is explicitly present, it takes precedence over all other actions.
    if (stringContains(cleanedInput, InteractionActions.BLOCK_ALL)) {
        return InteractionActions.BLOCK_ALL;
    }

    let detectedPanHorizontal = stringContains(cleanedInput, InteractionActions.PAN_X_AXIS);
    let detectedPanVertical = stringContains(cleanedInput, InteractionActions.PAN_Y_AXIS);

    // If both pan-x and pan-y are detected, combine them into a single string.
    if (detectedPanHorizontal && detectedPanVertical) {
        return `${InteractionActions.PAN_X_AXIS} ${InteractionActions.PAN_Y_AXIS}`;
    }

    // If only one pan action is detected, return that specific one.
    if (detectedPanHorizontal) {
        return InteractionActions.PAN_X_AXIS;
    }
    if (detectedPanVertical) {
        return InteractionActions.PAN_Y_AXIS;
    }

    // If 'manipulation' is detected and no pan actions or 'none' were found.
    if (stringContains(cleanedInput, InteractionActions.MANIPULATION_MODE)) {
        return InteractionActions.MANIPULATION_MODE;
    }

    // Default to 'auto' if no specific, higher-priority actions are resolved.
    return InteractionActions.AUTOMATIC;
}
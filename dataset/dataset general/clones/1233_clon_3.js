(function(jq) {
    "use strict";

    // Global constants for slider values and handle positions
    const MAX_SLIDER_VALUE = 100;
    const MIN_SLIDER_VALUE = 0;
    const HANDLE_REST_RIGHT_CSS = "0%";
    const HANDLE_REST_LEFT_CSS = "100%";
    const ANIMATION_DEBOUNCE_MS = 15; // Small delay for visual updates during drag

    /**
     * Constructs an interactive slide control widget.
     * @name slideControl
     * @public
     * @function
     * @memberOf JQLib.interactive
     */
    jq.widget("interactive.slideControl",

    /**
     * @lends JQLib.interactive.slideControl.prototype
     */
    {

        // Configuration settings
        /**
         * Default values for the widget's configuration.
         * @since 1.0.0
         */
        configSettings: {
            labelContent: "engage",
            isInactive: false,
            compactMode: false,
            slideDirection: "forward", // Can be "forward" (right) or "backward" (left)
            activationThreshold: 5, // How close to the edge to trigger activation
            triggerOnRelease: true, // Activate only when handle is released
            visualDimmingEffect: (level) => {
                // Calculates opacity based on how far the slider is from its rest position.
                // Level is expected to be 0-100.
                return 1.0 - (level / 50.0);
            }
        },

        /**
         * Computes the current numerical position of the slider handle.
         * @returns {number} The current handle position in the range 0-100.
         * @private
         * @since 2.0.0.
         */
        _getCurrentHandlePosition: function() {
            const componentHandle = this.controlHandle;
            if (!componentHandle || componentHandle.length === 0) {
                console.error("Slider handle not found, cannot determine position.");
                return MIN_SLIDER_VALUE;
            }
            const parentContainerWidth = componentHandle.parent().width();
            if (parentContainerWidth === 0) {
                // Avoid division by zero if parent is not rendered or has no width
                console.warn("Parent container of slider handle has zero width.");
                return MIN_SLIDER_VALUE;
            }
            const currentOffset = componentHandle.position().left;
            const percentageValue = (currentOffset / parentContainerWidth) * MAX_SLIDER_VALUE;
            return Math.round(percentageValue);
        },

        /**
         * Verifies if the slider is in an activation-ready state and, if so,
         * dispatches the "activated" event.
         * @private
         * @since 2.0.0
         */
        _evaluateActivationState: function() {
            const componentInstance = this;
            // Guard against multiple activations from a single slide action
            if (componentInstance.hasBeenTriggered) {
                return;
            }

            const currentPosition = componentInstance._getCurrentHandlePosition();
            const isForwardSlide = componentInstance.configSettings.slideDirection === "forward";
            const toleranceMargin = componentInstance.configSettings.activationThreshold;

            const meetsForwardCriteria = isForwardSlide && currentPosition >= (MAX_SLIDER_VALUE - toleranceMargin);
            const meetsBackwardCriteria = !isForwardSlide && currentPosition <= (MIN_SLIDER_VALUE + toleranceMargin);

            if (meetsForwardCriteria || meetsBackwardCriteria) {
                componentInstance._trigger("activated", null, { positionValue: currentPosition });
                componentInstance.hasBeenTriggered = true;
                // Optional: Add a visual cue or logging here for activation
            }
        },

        /**
         * Initializes the interactive slide control widget.
         * @private
         * @since 1.0.0
         */
        _initializeComponent: function() {
            const componentInstance = this;
            const targetElement = componentInstance.element;

            // Ensure the target element is clean before populating
            if (targetElement.children().length > 0) {
                // console.info("Clearing existing content from target element.");
                targetElement.empty();
            }
            targetElement.addClass("interactive-slide-widget");

            let initialHandleOffset = MIN_SLIDER_VALUE;
            if (componentInstance.configSettings.slideDirection === "backward") {
                initialHandleOffset = MAX_SLIDER_VALUE;
            }

            const labelDisplay = jq('<span>', {
                class: "widget-label-display",
                text: componentInstance.configSettings.labelContent
            });

            // Create the underlying range input, used by jQuery Mobile's slider
            const rangeInputControl = jq('<input>', {
                type: "range",
                class: "widget-range-input",
                min: MIN_SLIDER_VALUE,
                max: MAX_SLIDER_VALUE,
                step: 1,
                value: initialHandleOffset
            });

            targetElement.append(labelDisplay, rangeInputControl); // Append elements efficiently
            rangeInputControl.slider(); // Initialize jQuery Mobile slider

            const widgetControlHandle = targetElement.find('.ui-slider-handle');
            widgetControlHandle.removeAttr("title"); // Remove default title attribute

            // Store internal state and element references
            componentInstance.rangeInput = rangeInputControl;
            componentInstance.controlHandle = widgetControlHandle;
            componentInstance.labelElement = labelDisplay;
            componentInstance.isActivelySliding = false; // Flag indicating an active drag operation
            componentInstance.potentialDragAttempt = false; // Flag for initial touch/click
            componentInstance.previousPositionValue = initialHandleOffset; // Track last reported position
            componentInstance.hasBeenTriggered = false; // Prevents repeated activation events

            // Apply initial configuration settings
            componentInstance._applyInitialSettings();

            // Disable default keyboard interaction for the handle and element
            widgetControlHandle.add(targetElement).off("keyup keydown"); // Use .off for consistency

            // Set up all necessary event listeners
            componentInstance._setupEventHandlers();
        },

        /**
         * Helper method to apply initial widget settings after creation.
         * @private
         */
        _applyInitialSettings: function() {
            const componentInstance = this;
            componentInstance._updateConfiguration("compactMode", componentInstance.configSettings.compactMode);
            componentInstance._updateConfiguration("slideDirection", componentInstance.configSettings.slideDirection);
            componentInstance._updateConfiguration("isInactive", componentInstance.configSettings.isInactive);
        },

        /**
         * Centralized method to set up all event handlers for the slider.
         * @private
         */
        _setupEventHandlers: function() {
            const componentInstance = this;
            const { controlHandle, element, configSettings, labelElement } = componentInstance;

            let pointerMoveDebounceTimer = null; // Used for debouncing vmousemove events

            // Handler for pointer movement (vmousemove)
            // Bound to handle and document to catch drags that go off the handle
            controlHandle.add(document).on("vmousemove", function(pointerEvent) {
                if (!pointerEvent || !pointerEvent.originalEvent) { // Basic event validation
                    return;
                }

                // If a drag attempt is ongoing but the widget is disabled, reset immediately
                if (componentInstance.potentialDragAttempt && (configSettings.isInactive || element.attr('disabled'))) {
                    componentInstance._snapHandleToRest();
                    return;
                }

                if (componentInstance.isActivelySliding) {
                    controlHandle.removeAttr("title"); // Ensure title is not shown during drag
                    const currentPosition = componentInstance._getCurrentHandlePosition();

                    // Prevent triggering "sliding" event if position hasn't changed
                    if (currentPosition === componentInstance.previousPositionValue) {
                        return true;
                    }
                    componentInstance.previousPositionValue = currentPosition;

                    // Debounce visual updates and event triggers for smoother performance
                    clearTimeout(pointerMoveDebounceTimer);
                    pointerMoveDebounceTimer = setTimeout(() => {
                        const slideActionAllowed = componentInstance._trigger("sliding", null, { positionValue: currentPosition });
                        if (slideActionAllowed !== false) {
                            const effectiveValueForOpacity = (configSettings.slideDirection === "backward" ? (MAX_SLIDER_VALUE - currentPosition) : currentPosition);
                            labelElement.css("opacity", configSettings.visualDimmingEffect(effectiveValueForOpacity));
                            if (configSettings.triggerOnRelease === false) {
                                componentInstance._evaluateActivationState(); // Activate immediately if configured
                            }
                        } else {
                            // If slide is disallowed by event handler, snap back to rest
                            componentInstance._snapHandleToRest();
                        }
                    }, ANIMATION_DEBOUNCE_MS);

                    return true; // Allow default event behavior
                }
            });

            // Handler for pointer down (vmousedown) on the handle
            controlHandle.on("vmousedown", function(pointerEvent) {
                if (!pointerEvent || !pointerEvent.originalEvent) {
                    return;
                }
                componentInstance.potentialDragAttempt = true; // Mark a potential drag start
                if (!componentInstance.isActivelySliding && !configSettings.isInactive && !element.attr('disabled')) {
                    const startActionAllowed = componentInstance._trigger("slideStart", null, { positionValue: componentInstance._getCurrentHandlePosition() });
                    if (startActionAllowed !== false) {
                        componentInstance.isActivelySliding = true;
                        componentInstance.hasBeenTriggered = false; // Reset activation state for new slide
                    }
                    return startActionAllowed;
                }
            });

            // Handler for pointer up (vmouseup)
            // Bound to handle and document to catch releases that go off the handle
            controlHandle.add(document).on("vmouseup", function(pointerEvent) {
                if (!pointerEvent || !pointerEvent.originalEvent) {
                    return;
                }
                componentInstance.potentialDragAttempt = false; // Clear potential drag flag
                clearTimeout(pointerMoveDebounceTimer); // Clear any pending debounced move events

                if (componentInstance.isActivelySliding) {
                    if (configSettings.triggerOnRelease !== false) {
                        componentInstance._evaluateActivationState(); // Activate on release if configured
                    }
                    componentInstance._trigger("slideStop", null, { positionValue: componentInstance._getCurrentHandlePosition() });
                    componentInstance._returnToDefault("fast"); // Animate back to rest
                    componentInstance.isActivelySliding = false;
                } else {
                    // If not actively sliding but a pointer up occurred (e.g., failed drag attempt), ensure reset
                    componentInstance._snapHandleToRest();
                }
            });
        },

        /**
         * Forces the slider handle to its idle (rest) position without animation.
         * @private
         * @since 1.0.0
         */
        _snapHandleToRest: function() {
            const componentInstance = this;
            const { controlHandle, rangeInput, configSettings } = componentInstance;

            const targetLeftCSS = (configSettings.slideDirection === "forward") ? HANDLE_REST_RIGHT_CSS : HANDLE_REST_LEFT_CSS;
            const targetRangeValue = (configSettings.slideDirection === "forward") ? MIN_SLIDER_VALUE : MAX_SLIDER_VALUE;

            // Only apply CSS if different to avoid unnecessary DOM writes
            if (controlHandle.css("left") !== targetLeftCSS) {
                controlHandle.css("left", targetLeftCSS);
            }

            componentInstance.hasBeenTriggered = false;
            rangeInput.val(targetRangeValue); // Update underlying input value
            componentInstance.previousPositionValue = targetRangeValue; // Sync previous value
        },

        /**
         * Resets the slider to its default idle position, with optional animation.
         * @param {number|string|null} [transitionSpeed] - If provided, defines the duration
         *   of the animation (e.g., "fast", "slow", or a number in milliseconds).
         *   If omitted or null, the reset is instant.
         * @private
         * @since 1.0.0
         */
        _returnToDefault: function(transitionSpeed) {
            const componentInstance = this;
            const { controlHandle, labelElement, configSettings } = componentInstance;

            const defaultHandleCSS = (configSettings.slideDirection === "forward") ? HANDLE_REST_RIGHT_CSS : HANDLE_REST_LEFT_CSS;
            // Opacity for the resting state is always based on 0 displacement from start
            const restingOpacity = configSettings.visualDimmingEffect(MIN_SLIDER_VALUE);

            if (transitionSpeed === undefined || transitionSpeed === null) {
                componentInstance._snapHandleToRest();
                labelElement.css("opacity", restingOpacity);
            } else {
                // Animate handle and label opacity concurrently
                const handleAnimationPromise = controlHandle.animate({ left: defaultHandleCSS }, transitionSpeed).promise();
                const textAnimationPromise = labelElement.animate({ opacity: restingOpacity }, transitionSpeed).promise();

                // Use jq.when to ensure _snapHandleToRest is called after both animations complete
                jq.when(handleAnimationPromise, textAnimationPromise)
                    .done(() => {
                        componentInstance._snapHandleToRest(); // Final snap to ensure exact position
                    })
                    .fail(() => {
                        console.error("Slider reset animation failed, snapping to default position.");
                        componentInstance._snapHandleToRest(); // Fallback in case of animation failure
                    });
            }
        },

        /**
         * Modifies a widget configuration setting.
         * @param {string} settingName - The name of the configuration option to update.
         * @param {*} newValue - The new value for the specified option.
         * @private
         * @since 1.0.0
         */
        _updateConfiguration: function(settingName, newValue) {
            const componentInstance = this;
            // Call the base widget's _setOption method first
            jq.Widget.prototype._setOption.apply(componentInstance, arguments);

            // Define actions for each configurable setting
            const updateHandlers = {
                "labelContent": () => {
                    componentInstance.labelElement.text(newValue);
                },
                "compactMode": () => {
                    componentInstance.element.toggleClass("widget-compact-variant", newValue);
                    componentInstance.rangeInput.slider("option", "mini", newValue).slider("refresh");
                },
                "isInactive": () => {
                    const targetElement = componentInstance.element;
                    if (newValue === true) {
                        targetElement.addClass("ui-disabled ui-state-disabled")
                                     .attr({"disabled": true, "aria-disabled": true});
                        componentInstance.labelElement.css("opacity", ""); // Clear any dynamic opacity
                        componentInstance._snapHandleToRest(); // Ensure handle is at rest when disabled
                    } else if (newValue === false) {
                        targetElement.removeClass("ui-disabled ui-state-disabled")
                                     .attr({"disabled": false, "aria-disabled": false});
                    }
                },
                "slideDirection": () => {
                    const targetElement = componentInstance.element;
                    // Toggle class based on "backward" direction
                    targetElement.toggleClass("widget-leftward-mode", newValue === "backward");
                    componentInstance._snapHandleToRest(); // Reset handle position to match new direction
                }
            };

            // Execute the corresponding handler if it exists
            const handler = updateHandlers[settingName];
            if (handler) {
                handler();
            } else {
                // Optional: Log if an unhandled option is passed
                // console.warn(`Configuration setting '${settingName}' does not have a specific update handler.`);
            }
        }
    });

}(jQuery));
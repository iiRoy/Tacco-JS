(function (globalScope, moduleFabricator) {
    // This universal module definition (UMD) enables the module to be used
    // in various JavaScript environments: AMD, CommonJS, or as a global.
    if (typeof define === 'function' && define.amd) {
        // AMD (RequireJS) - asynchronous module loading.
        define(moduleFabricator);
    } else if (typeof exports === 'object') {
        // CommonJS (Node.js) - synchronous module loading.
        module.exports = moduleFabricator(require, exports, module);
    } else {
        // Browser global - attaches the module to the window object.
        globalScope.elementReveal = moduleFabricator();
    }
}(this, function (dependencyResolver, exportsContainer, moduleContainer) {

    /**
     *  _   _ _____ _   _ _____ _____ _   _ _____ _____ _   _
     * | | | |  ___| \ | |_   _|_   _| \ | |  ___|  _  | \ | |
     * | |_| | |__ |  \| | | |   | | |  \| | |__ | | | |  \| |
     * |  _  |  __|| . ` | | |   | | | . ` |  __|| | | | . ` |
     * | | | | |___| |\  |_| |_  | | | |\  | |___| |/ /| |\  |
     * \_| |_/\____/\_| \_/\___/  \_/ \_| \_/\____/\___/ \_| \_/
     *
     *  Visual Element Animation Module (VEAM) v3.1.0
     *  Developed by a different entity in 2023.
     *  Licensed under an alternative open-source license.
     *
     *  This module enhances user experience by making elements gracefully
     *  appear as they scroll into view, supporting various animation styles.
     */

    // Expose the primary function to the global window object.
    globalScope.elementReveal = (function (currentWindow) {

        'use strict';

        // Internal utility for throttling function calls, ensuring performance during rapid events.
        let _throttle = function (callbackFunction, delayInterval) {
            let timeoutId;
            let lastExecutionTime = 0;

            return function () {
                const now = Date.now();
                const remaining = delayInterval - (now - lastExecutionTime);
                const context = this;
                const args = arguments;

                clearTimeout(timeoutId);

                if (remaining <= 0 || remaining > delayInterval) {
                    lastExecutionTime = now;
                    callbackFunction.apply(context, args);
                } else {
                    timeoutId = setTimeout(function () {
                        lastExecutionTime = Date.now();
                        callbackFunction.apply(context, args);
                    }, remaining);
                }
            };
        };

        // Reference to the main module instance, used for internal method binding.
        let instanceRef;
        // The event handler, throttled to optimize performance during scroll and resize events.
        let throttledEventHandler;

        /**
         * Core constructor for the ScrollObserver module.
         * Initializes the observer with user-defined or default configurations.
         * @param {object} userConfig - User-provided configuration overrides.
         */
        function ScrollObserver(userConfig) {
            instanceRef = this; // Maintain context for internal methods within the prototype chain.

            this.trackedElements = {}; // A registry of all DOM elements being observed.
            this.elementIdCounter = 1; // Generates unique identifiers for each tracked element.
            this.isProcessingQueue = false; // A flag to prevent re-triggering animation processing prematurely.

            // Merges the default options with any user-provided settings.
            this.options = Object.assign({}, this.baseOptions, userConfig);

            // Conditional early exit: Deactivates the observer if the environment is unsupported
            // or if mobile animations are explicitly disabled on a mobile device.
            if ((this.isMobileDevice() && !this.options.enableMobile) || !this.isEnvironmentSupported()) {
                console.warn('ScrollObserver: Environment not fully supported or mobile animations disabled. Deactivating module.');
                this.deactivate(); // A new method to clean up resources.
                return;
            }

            // Set up event listeners on the designated viewport element.
            // The event handler is throttled to improve performance.
            throttledEventHandler = _throttle(this.handleViewportEvents.bind(this), 60);

            if (this.options.viewContext === currentWindow.document.documentElement) {
                // Listen to window scroll and resize events if the document is the viewport.
                currentWindow.addEventListener('scroll', throttledEventHandler, { passive: true });
                currentWindow.addEventListener('resize', throttledEventHandler, { passive: true });
            } else {
                // Listen only to scroll events for custom scrollable containers.
                this.options.viewContext.addEventListener('scroll', throttledEventHandler, { passive: true });
            }

            // Perform an initial scan and animation pass upon instantiation.
            this.initializeObserver(true);
        }

        /**
         * Prototype methods defining the behavior of the ScrollObserver.
         */
        ScrollObserver.prototype = {

            // Default configuration settings for how elements should animate.
            baseOptions: {
                entranceDirection: 'bottom', // The direction from which an element appears ('top', 'bottom', 'left', 'right').
                movementDistance: '8px',     // The initial displacement of the element before animating into its final position.
                animationDuration: '0.6s',   // The CSS transition duration for the animation.
                delayBeforeStart: '0s',      // The initial delay before the animation begins.
                timingFunction: 'ease',      // The CSS easing function for the animation (e.g., 'ease', 'ease-in-out').

                scaling: { direction: 'up', magnitude: '5%' }, // Defines scaling behavior: 'up' (shrink) or 'down' (grow), and amount.
                rotation: { x: 0, y: 0, z: 0 },                 // Specifies initial 3D rotation around X, Y, and Z axes.

                initialOpacity: 0,           // The starting opacity of the element, typically 0 for a fade-in effect.
                enableMobile: false,         // Boolean: true to allow animations on mobile devices, false to disable.
                resetOnExit: false,          // Boolean: true to reset the element's animation when it scrolls out of view.

                // The DOM node acting as the scrollable context for visibility checks.
                // By default, this is the document's root element (<html>).
                viewContext: currentWindow.document.documentElement,

                // Strategy for applying animation delays:
                // 'always' — delay is applied every time an animation triggers (including resets).
                // 'onload' — delay is only applied for animations triggered during the initial page load.
                // 'once'   — delay is applied only the very first time an element is revealed.
                delayStrategy: 'once',

                // The percentage of an element that must be visible within the viewport
                // for its animation to trigger. (e.g., 0.60 means 60% visibility).
                visibilityThreshold: 0.60,

                // A callback function executed when an element's reveal animation successfully completes.
                // Note: This callback does not fire for elements configured with `resetOnExit: true`.
                onAnimationComplete: function (animatedElement) { /* No operation by default */ }
            },

            /**
             * Scans the DOM for elements marked for animation, registers them, and initiates animations.
             * This method is typically called once on page load and potentially after dynamic content additions.
             * @param {boolean} isInitialLoad - True if this is the first call during page load.
             */
            initializeObserver: function (isInitialLoad) {
                // Find all elements with the specific data attribute within the configured viewport.
                const elementsToTrack = Array.from(
                    this.options.viewContext.querySelectorAll('[data-reveal-element]')
                );

                if (elementsToTrack.length === 0) {
                    console.info('ScrollObserver: No elements with "data-reveal-element" found to track during this scan.');
                    return; // Exit if no elements are found.
                }

                elementsToTrack.forEach(node => {
                    const currentId = this.elementIdCounter++;
                    // Store element details in the trackedElements registry.
                    const elementData = this.trackedElements[currentId] = { targetNode: node };

                    // Parse custom configuration from the element's attribute, merging with global options.
                    elementData.computedOptions = this.parseElementOptions(elementData);
                    // Generate the necessary CSS style strings based on the computed options.
                    elementData.computedStyles = this.generateElementStyles(elementData);
                    elementData.hasBeenVisible = false; // Flag to track if the element has ever entered the viewport.
                    elementData.isAnimating = false; // Flag to prevent re-triggering completion callbacks during an active animation.

                    // Remove the data attribute to prevent re-processing this element on subsequent initializeObserver calls.
                    node.removeAttribute('data-reveal-element');

                    // Apply the initial styles (hidden, positioned) to the element.
                    node.setAttribute('style',
                        elementData.computedStyles.inlineBase +
                        elementData.computedStyles.initialTransformAndOpacity
                    );
                });

                // Update the current scroll position for immediate visibility checks.
                this.currentScrollPosition = this.getScrollYPosition();
                // Trigger the animation processing cycle.
                this.processAnimations(isInitialLoad);
            },

            /**
             * The primary event handler for viewport-related events (scroll, resize).
             * It ensures that animation processing is throttled and prevents concurrent runs.
             */
            handleViewportEvents: function () {
                // Guard against processing multiple animation queues simultaneously.
                if (this.isProcessingQueue) {
                    return;
                }
                this.isProcessingQueue = true; // Set flag to block further calls until this pass completes.

                // Recalculate the current scroll position as it may have changed.
                this.currentScrollPosition = this.getScrollYPosition();

                // Initiate the animation update pass. `false` indicates this is not an initial load.
                this.processAnimations(false);
            },

            /**
             * Iterates through all tracked elements, checks their visibility,
             * and applies or resets their animation styles accordingly.
             * @param {boolean} isInitialAnimationPass - True if this is the very first animation cycle.
             */
            processAnimations: function (isInitialAnimationPass) {
                // Iterate over each tracked element using a modern forEach loop.
                Object.keys(this.trackedElements).forEach(itemId => {
                    const elementRecord = this.trackedElements[itemId];
                    const isCurrentlyVisible = this.checkElementVisibility(elementRecord);

                    if (isCurrentlyVisible) {
                        // Element is now within the viewport, time to animate it.
                        const shouldApplyDelay =
                            (this.options.delayStrategy === 'always') ||
                            (this.options.delayStrategy === 'onload' && isInitialAnimationPass) ||
                            (this.options.delayStrategy === 'once' && !elementRecord.hasBeenVisible);

                        if (shouldApplyDelay) {
                            // Apply final styles including the full transition and delay.
                            elementRecord.targetNode.setAttribute('style',
                                elementRecord.computedStyles.inlineBase +
                                elementRecord.computedStyles.finalTransformAndOpacity +
                                elementRecord.computedStyles.transitionRules
                            );
                        } else {
                            // Apply final styles with an instant transition for immediate reveal.
                            elementRecord.targetNode.setAttribute('style',
                                elementRecord.computedStyles.inlineBase +
                                elementRecord.computedStyles.finalTransformAndOpacity +
                                elementRecord.computedStyles.instantTransitionRules
                            );
                        }

                        elementRecord.hasBeenVisible = true; // Mark this element as having been visible.

                        // If the element is not configured to reset and not already animating, trigger its completion handler.
                        if (!elementRecord.computedOptions.resetOnExit && !elementRecord.isAnimating) {
                            elementRecord.isAnimating = true; // Prevent re-triggering completion.
                            this.triggerAnimationCompletion(itemId);
                        }

                    } else if (!isCurrentlyVisible && elementRecord.computedOptions.resetOnExit) {
                        // Element has scrolled out of view and is configured to reset.
                        elementRecord.targetNode.setAttribute('style',
                            elementRecord.computedStyles.inlineBase +
                            elementRecord.computedStyles.initialTransformAndOpacity +
                            elementRecord.computedStyles.instantTransitionRules // Reset instantly or with minimal transition.
                        );
                        elementRecord.isAnimating = false; // Reset animation state to allow re-animation when it re-enters view.
                    }
                });

                // All elements processed, unblock the event handler for the next cycle.
                this.isProcessingQueue = false;
            },

            /**
             * Manages the completion of an element's animation, including callbacks and cleanup.
             * @param {string} elementKey - The unique identifier of the element within trackedElements.
             */
            triggerAnimationCompletion: function (elementKey) {
                const elementRecord = this.trackedElements[elementKey];

                if (!elementRecord) return; // Defensive check if element was already removed.

                // Use setTimeout to wait for the animation to visually complete.
                setTimeout(() => {
                    // Remove most generated inline styles, leaving only `visibility: visible;`
                    // This allows external CSS to take over for styling, if desired.
                    elementRecord.targetNode.setAttribute('style', elementRecord.computedStyles.inlineBase);

                    // Execute the user-defined completion callback.
                    elementRecord.computedOptions.onAnimationComplete(elementRecord.targetNode);

                    // If the element is not set to reset, remove it from tracking to save resources.
                    if (!elementRecord.computedOptions.resetOnExit) {
                        delete this.trackedElements[elementKey];
                    } else {
                        // For elements that reset, reset the animating flag.
                        elementRecord.isAnimating = false;
                    }

                }, elementRecord.computedStyles.totalAnimationTime);
            },

            /**
             * Parses the `data-reveal-element` attribute of a DOM node to extract custom animation settings.
             * These settings override or extend the global baseOptions for that specific element.
             * @param {object} elementDetails - An object containing the targetNode.
             * @returns {object} - A comprehensive configuration object for the element.
             */
            parseElementOptions: function (elementDetails) {
                const customSettings = {};
                const attributeValue = elementDetails.targetNode.getAttribute('data-reveal-element');

                if (!attributeValue) {
                    // If no attribute, simply return a copy of the global options.
                    return Object.assign({}, this.options);
                }

                // Split the attribute value into individual keywords or tokens.
                const optionTokens = attributeValue.split(/[, ]+/);

                optionTokens.forEach((token, index) => {
                    switch (token) {
                        case 'enter':
                            customSettings.entranceDirection = optionTokens[index + 1];
                            break;
                        case 'wait':
                            customSettings.delayBeforeStart = optionTokens[index + 1];
                            break;
                        case 'move':
                            customSettings.movementDistance = optionTokens[index + 1];
                            break;
                        case 'over':
                            customSettings.animationDuration = optionTokens[index + 1];
                            break;
                        case 'ease':
                        case 'ease-in':
                        case 'ease-in-out':
                        case 'ease-out':
                            customSettings.timingFunction = token;
                            break;
                        case 'hustle':
                            customSettings.timingFunction = 'cubic-bezier(0.6, 0.2, 0.1, 1)';
                            break;
                        case 'flip':
                        case 'pitch':
                            customSettings.rotation = customSettings.rotation || {};
                            customSettings.rotation.x = optionTokens[index + 1];
                            break;
                        case 'spin':
                        case 'yaw':
                            customSettings.rotation = customSettings.rotation || {};
                            customSettings.rotation.y = optionTokens[index + 1];
                            break;
                        case 'roll':
                            customSettings.rotation = customSettings.rotation || {};
                            customSettings.rotation.z = optionTokens[index + 1];
                            break;
                        case 'reset':
                            // Check for 'no reset' vs 'reset' to set boolean.
                            customSettings.resetOnExit = (optionTokens[index - 1] !== 'no');
                            break;
                        case 'scale':
                            customSettings.scaling = customSettings.scaling || {};
                            // Distinguish between 'scale X%' and 'scale up X%' / 'scale down X%'.
                            if (['up', 'down'].includes(optionTokens[index + 1])) {
                                customSettings.scaling.direction = optionTokens[index + 1];
                                customSettings.scaling.magnitude = optionTokens[index + 2];
                            } else {
                                customSettings.scaling.magnitude = optionTokens[index + 1];
                            }
                            break;
                        // Unknown tokens are silently ignored to prevent errors.
                    }
                });

                // Merge the global options with any custom settings parsed from the attribute.
                let mergedOptions = Object.assign({}, this.options, customSettings);

                // Determine the primary axis (X or Y) for movement based on entrance direction.
                if (['top', 'bottom'].includes(mergedOptions.entranceDirection)) {
                    mergedOptions.animationAxis = 'Y';
                } else if (['left', 'right'].includes(mergedOptions.entranceDirection)) {
                    mergedOptions.animationAxis = 'X';
                }

                // Adjust the movement distance to be negative for 'top' and 'left' entrances,
                // simulating movement from above or to the left.
                if (['top', 'left'].includes(mergedOptions.entranceDirection)) {
                    const distanceValue = parseFloat(mergedOptions.movementDistance);
                    if (distanceValue > 0) {
                        mergedOptions.movementDistance = `-${distanceValue}px`;
                    }
                }

                return mergedOptions;
            },

            /**
             * Generates the necessary CSS style string fragments for an element's animation.
             * This includes initial state, final state, and transition properties.
             * @param {object} elementDetails - An object from trackedElements.
             * @returns {object} - An object containing various CSS style string components.
             */
            generateElementStyles: function (elementDetails) {
                const elemConfig = elementDetails.computedOptions;
                // Calculate the total time until the animation visually completes (duration + delay).
                const totalTransitionDuration = (parseFloat(elemConfig.animationDuration) + parseFloat(elemConfig.delayBeforeStart)) * 1000;

                let baseInlineStyle = '';
                // Preserve existing inline styles on the element and ensure it's visible after initialization.
                const existingStyle = elementDetails.targetNode.getAttribute('style');
                if (existingStyle) {
                    baseInlineStyle += existingStyle.trim().replace(/;$/, '') + '; '; // Clean and append existing styles.
                }
                baseInlineStyle += 'visibility: visible; ';

                // Initialize transform strings for the element's starting and ending states.
                let initialTransform = '';
                let finalTransform = '';

                // Apply Translation (movement).
                if (parseFloat(elemConfig.movementDistance) !== 0) {
                    initialTransform += ` translate${elemConfig.animationAxis}(${elemConfig.movementDistance})`;
                    finalTransform += ` translate${elemConfig.animationAxis}(0)`;
                }

                // Apply Scaling.
                if (parseFloat(elemConfig.scaling.magnitude) !== 0) {
                    let scaleMagnitude = parseFloat(elemConfig.scaling.magnitude) * 0.01; // Convert percentage to a ratio.
                    let finalScaleValue = 1;
                    let initialScaleValue = 1;

                    if (elemConfig.scaling.direction === 'up') {
                        initialScaleValue = 1 - scaleMagnitude; // Shrink for 'up' direction.
                    } else if (elemConfig.scaling.direction === 'down') {
                        initialScaleValue = 1 + scaleMagnitude; // Grow for 'down' direction.
                    } else { // Generic scale (magnitude only, e.g., 'scale 20%')
                        initialScaleValue = 1 + scaleMagnitude; // Default to growing if no direction.
                    }
                    initialTransform += ` scale(${initialScaleValue})`;
                    finalTransform += ` scale(${finalScaleValue})`;
                }

                // Apply 3D Rotation (X-axis).
                if (elemConfig.rotation.x) {
                    initialTransform += ` rotateX(${elemConfig.rotation.x})`;
                    finalTransform += ` rotateX(0)`;
                }
                // Apply 3D Rotation (Y-axis).
                if (elemConfig.rotation.y) {
                    initialTransform += ` rotateY(${elemConfig.rotation.y})`;
                    finalTransform += ` rotateY(0)`;
                }
                // Apply 3D Rotation (Z-axis).
                if (elemConfig.rotation.z) {
                    initialTransform += ` rotateZ(${elemConfig.rotation.z})`;
                    finalTransform += ` rotateZ(0)`;
                }

                // Construct the full initial and final CSS style declarations.
                const initialStyles = `transform:${initialTransform}; opacity: ${elemConfig.initialOpacity};`;
                const finalStyles = `transform:${finalTransform}; opacity: 1;`;

                // Define common transition parameters.
                const transitionCommon = `${elemConfig.animationDuration} ${elemConfig.timingFunction}`;
                // Transition rules with specified delay.
                const transitionWithDelay = `transform ${transitionCommon} ${elemConfig.delayBeforeStart}, opacity ${transitionCommon} ${elemConfig.delayBeforeStart}`;
                // Transition rules for instant (no delay) animations or resets.
                const transitionInstant = `transform ${transitionCommon} 0s, opacity ${transitionCommon} 0s`;

                // Add vendor prefixes for broader browser compatibility.
                const prefixedTransitionWithDelay = `-webkit-transition: ${transitionWithDelay}; transition: ${transitionWithDelay}; -webkit-perspective: 1000px; -webkit-backface-visibility: hidden;`;
                const prefixedTransitionInstant = `-webkit-transition: ${transitionInstant}; transition: ${transitionInstant}; -webkit-perspective: 1000px; -webkit-backface-visibility: hidden;`;

                return {
                    inlineBase: baseInlineStyle,
                    initialTransformAndOpacity: initialStyles,
                    finalTransformAndOpacity: finalStyles,
                    transitionRules: prefixedTransitionWithDelay,
                    instantTransitionRules: prefixedTransitionInstant,
                    totalAnimationTime: totalTransitionDuration
                };
            },

            /**
             * Retrieves the current height of the viewport used for visibility calculations.
             * Accounts for potential differences between window and documentElement height.
             * @returns {number} - The viewport height in pixels.
             */
            retrieveViewportHeight: function () {
                const viewportElement = this.options.viewContext;
                if (viewportElement === currentWindow.document.documentElement) {
                    // For the document viewport, use the larger of window.innerHeight or documentElement.clientHeight.
                    return Math.max(currentWindow.innerHeight, viewportElement.clientHeight);
                }
                // For custom scrollable elements, use their clientHeight.
                return viewportElement.clientHeight;
            },

            /**
             * Retrieves the current Y-axis scroll position of the viewport.
             * Handles both window scrolling and custom element scrolling.
             * @returns {number} - The scroll position in pixels.
             */
            getScrollYPosition: function () {
                const viewportElement = this.options.viewContext;
                if (viewportElement === currentWindow.document.documentElement) {
                    // For the document viewport, use window.pageYOffset or documentElement.scrollTop.
                    return currentWindow.pageYOffset || viewportElement.scrollTop;
                }
                // For custom scrollable elements, return their scrollTop property.
                return viewportElement.scrollTop;
            },

            /**
             * Determines if a given element is currently visible within the active viewport area.
             * Utilizes `getBoundingClientRect` for accurate position and size relative to the viewport.
             * @param {object} elementDetails - An object from trackedElements containing targetNode.
             * @returns {boolean} - True if the element meets the visibility threshold, false otherwise.
             */
            checkElementVisibility: function (elementDetails) {
                const targetRect = elementDetails.targetNode.getBoundingClientRect();
                const viewportHeight = this.retrieveViewportHeight();
                const threshold = elementDetails.computedOptions.visibilityThreshold;

                // Calculate the height of the element that is currently visible within the viewport.
                const visibleHeight = Math.min(targetRect.bottom, viewportHeight) - Math.max(targetRect.top, 0);

                // An element is considered visible if its visible height exceeds the defined threshold.
                return visibleHeight > (targetRect.height * threshold);
            },

            /**
             * Performs a basic check to determine if the current browser environment
             * supports essential CSS features like `transform` and `transition`.
             * @returns {boolean} - True if these core features are detected, false otherwise.
             */
            isEnvironmentSupported: function () {
                // Create a temporary div and check for transform and transition properties.
                const dummyStyleElement = currentWindow.document.createElement('div').style;
                return ('transform' in dummyStyleElement || 'webkitTransform' in dummyStyleElement) &&
                       ('transition' in dummyStyleElement || 'webkitTransition' in dummyStyleElement);
            },

            /**
             * Detects if the user agent string indicates a mobile device.
             * This check is used to conditionally enable/disable animations on mobile.
             * @returns {boolean} - True if the device is likely mobile, false otherwise.
             */
            isMobileDevice: function () {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            },

            /**
             * Deactivates the ScrollObserver instance, removing all event listeners
             * and clearing its internal state. This is crucial for memory management
             * and when the observer is no longer needed.
             */
            deactivate: function () {
                // Remove the previously attached event listeners.
                if (this.options.viewContext === currentWindow.document.documentElement) {
                    currentWindow.removeEventListener('scroll', throttledEventHandler);
                    currentWindow.removeEventListener('resize', throttledEventHandler);
                } else {
                    this.options.viewContext.removeEventListener('scroll', throttledEventHandler);
                }

                // Clear all tracked elements and reset counters.
                this.trackedElements = {};
                this.elementIdCounter = 1;
                this.isProcessingQueue = false;

                console.info('ScrollObserver: Deactivated and cleaned up resources.');
            }
        };

        // Return the ScrollObserver constructor, making it available for instantiation.
        return ScrollObserver;

    })(currentWindow); // Pass the global window object to the self-executing function.
}));
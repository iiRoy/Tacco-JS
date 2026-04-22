(function(moduleInitializer) {
    // Standard module definition for AMD (e.g., RequireJS)
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], moduleInitializer);
    } else {
        // Fallback for global jQuery object
        moduleInitializer(window.jQuery || window.$);
    }
}(function(jQ) { // Renamed jQuery alias to 'jQ' for internal consistency

    'use strict'; // Enforce strict mode for cleaner JavaScript

    /**
     * Core utility references for the module.
     * @const {jQ} documentWrapper - jQuery wrapped document object.
     * @const {jQ} windowWrapper   - jQuery wrapped window object.
     */
    const documentWrapper = jQ(document);
    const windowWrapper = jQ(window);

    /**
     * Collection of CSS class names used by the scaler for styling and identification.
     * @const {Object.<string, string>}
     */
    const cssClasses = {
        hostElementClass: 'ris-container-wrapper', // Renamed 'container'
        mediaElementClass: 'ris-scaled-media',     // Renamed 'image'
        visuallyHiddenClass: 'ris-hidden-element'  // Renamed 'hidden'
    };

    /**
     * Default configuration settings for the ResponsiveImageScaler.
     * These can be overridden during instantiation.
     * @const {Object}
     */
    const defaultConfiguration = {
        preferCSSBackground: true,       // Renamed 'useCSS', determines if background-size is preferred
        hostSelector: 'parent',          // Renamed 'container', specifies how to find the host element
        placement: {                     // Renamed 'position', controls media element alignment
            horizontal: 'center',        // Renamed 'x'
            vertical: 'center'           // Renamed 'y'
        },
        resizeDebounceInterval: 100      // Renamed 'throttleTimeout', delay for debouncing resize events
    };

    /**
     * Feature detection: Checks if the browser natively supports `background-size` CSS property.
     * This is determined once on module load.
     * @const {boolean}
     */
    const supportsBackgroundSize = (function() {
        const tempDiv = document.createElement('div');
        return 'backgroundSize' in tempDiv.style;
    })();

    /**
     * The main constructor for the ResponsiveImageScaler plugin.
     * Manages the scaling and positioning of an image element within a specified container,
     * adapting to responsive layout changes.
     *
     * @constructor
     * @param {HTMLElement} targetMediaElement - The raw DOM `<img>` element to be scaled.
     * @param {Object} [instanceSettings={}]    - Optional settings to customize this instance's behavior.
     * @returns {void}
     */
    const ResponsiveImageScaler = function(targetMediaElement, instanceSettings = {}) {

        // Validate that the provided element is indeed an HTML image element.
        if (!(targetMediaElement instanceof HTMLElement) || targetMediaElement.tagName.toLowerCase() !== 'img') {
            this._reportError('Provided element is not a valid HTML <img> element. Initialization aborted.');
            return; // Abort if invalid input
        }

        /**
         * Reference to the original raw DOM image element.
         * @type {HTMLElement}
         */
        this.rawMediaElement = targetMediaElement;

        /**
         * jQuery-wrapped version of the image element for easier manipulation.
         * @type {jQ}
         */
        this.wrappedMediaElement = jQ(targetMediaElement);

        /**
         * The final, merged configuration settings for this specific instance.
         * Default settings are extended with any user-provided overrides.
         * @type {Object}
         */
        this.effectiveSettings = Object.assign({}, defaultConfiguration, instanceSettings);

        /**
         * Internal data structure to store calculated dimensions and aspect ratios.
         * This prevents redundant calculations and holds state.
         * @type {Object}
         */
        this.calculationParameters = {
            mediaDimensions: { // Dimensions of the actual image file
                width: null,
                height: null
            },
            hostDimensions: {  // Dimensions of the container element
                width: null,
                height: null
            },
            aspectRatios: {    // Calculated aspect ratios (height / width)
                media: null,
                host: null
            }
        };

        // Determine and wrap the host container element based on configuration.
        const configuredHost = this.effectiveSettings.hostSelector;
        let foundHostElement;

        if (configuredHost === 'parent') {
            foundHostElement = this.wrappedMediaElement.parent();
        } else if (configuredHost instanceof jQ && configuredHost.length) {
            foundHostElement = configuredHost;
        } else if (typeof configuredHost === 'string') {
            const queriedHost = jQ(configuredHost);
            if (queriedHost.length > 0) {
                foundHostElement = queriedHost.first(); // Use the first matching element
            } else {
                this._reportError(`The specified host selector '${configuredHost}' did not match any elements. Falling back to parent.`);
                foundHostElement = this.wrappedMediaElement.parent();
            }
        } else {
            this._reportError('Invalid host container configuration type. Falling back to parent.');
            foundHostElement = this.wrappedMediaElement.parent();
        }

        // Final check to ensure a valid host element was found.
        if (!foundHostElement || foundHostElement.length === 0) {
            this._reportError('A valid host container element could not be determined. Initialization aborted.');
            return;
        }
        this.wrappedHostElement = foundHostElement;

        /**
         * A unique string identifier for this instance, used primarily for event namespacing.
         * @type {string}
         */
        this.instanceIdentifier = this._generateUniqueId();

        // Begin the initialization process for the scaler.
        this._initializeScalerLogic();
    };

    /**
     * Shorthand alias for the prototype object, improving readability for method definitions.
     * @private
     * @type {Object}
     */
    ResponsiveImageScaler.prototype._proto = ResponsiveImageScaler.prototype;

    /**
     * Initializes the core logic of the scaler, applying initial classes and
     * determining the appropriate scaling strategy (CSS background vs. JS resizing).
     * @private
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._initializeScalerLogic = function() {
        // Apply necessary CSS classes to the media and host elements.
        this.wrappedMediaElement.addClass(cssClasses.mediaElementClass);
        this.wrappedHostElement.addClass(cssClasses.hostElementClass);

        // Decide which scaling method to use based on browser support and user settings.
        const useCssBackgroundMethod = supportsBackgroundSize && this.effectiveSettings.preferCSSBackground;

        if (useCssBackgroundMethod) {
            this._applyCSSBackgroundScaling();
        } else {
            // If CSS background method is not used, fall back to JavaScript-based resizing.
            this._attachResizeListeners();
            this._triggerRecalculation(); // Perform initial resize
        }
    };

    /**
     * Configures the host element to display the image as a CSS background,
     * utilizing `background-size: cover`. The original image element is hidden.
     * @private
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._applyCSSBackgroundScaling = function() {
        const mediaElem = this.wrappedMediaElement;
        const hostElem = this.wrappedHostElement;
        const positionConfig = this.effectiveSettings.placement;

        // Hide the original image element to prevent it from showing.
        mediaElem.addClass(cssClasses.visuallyHiddenClass);

        // Apply background styles to the host container.
        hostElem.css({
            'background-image': `url('${this.rawMediaElement.src}')`, // Use template literal for URL
            'background-position': `${positionConfig.horizontal} ${positionConfig.vertical}`,
            'background-size': 'cover',
            'background-repeat': 'no-repeat',
            'overflow': 'hidden' // Ensure content outside bounds is clipped
        });
    };

    /**
     * Attaches event listeners to the window for `resize` and `orientationchange` events.
     * These events are debounced to optimize performance during rapid changes.
     * @private
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._attachResizeListeners = function() {
        const self = this; // Capture 'this' for use within the callback

        windowWrapper.on(
            `resize.${this.instanceIdentifier} orientationchange.${this.instanceIdentifier}`,
            this._debounceFunction(function() {
                self._triggerRecalculation(); // Execute the resize logic
            },
            this.effectiveSettings.resizeDebounceInterval)
        );
    };

    /**
     * Orchestrates the JavaScript-based scaling process: first calculates ratios,
     * then updates the image's position and dimensions.
     * @private
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._triggerRecalculation = function() {
        this._calculateAspectRatios();
        this._adjustMediaElementPosition();
    };

    /**
     * Determines and stores the aspect ratios (height/width) of both the media element
     * and its host container. This is a critical step for accurate scaling.
     * Media element ratio is calculated only once if valid.
     * @private
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._calculateAspectRatios = function() {
        const mediaElem = this.wrappedMediaElement;
        const hostElem = this.wrappedHostElement;
        const params = this.calculationParameters;

        let currentMediaWidth, currentMediaHeight;

        // Calculate media element's natural dimensions and ratio only if not already stored or invalid.
        if (!params.aspectRatios.media || params.mediaDimensions.width <= 0 || params.mediaDimensions.height <= 0) {
            // Prioritize natural dimensions from the raw DOM element.
            const naturalW = this.rawMediaElement.naturalWidth;
            const naturalH = this.rawMediaElement.naturalHeight;

            if (naturalW > 0 && naturalH > 0) {
                currentMediaWidth = naturalW;
                currentMediaHeight = naturalH;
            } else {
                // Fallback: Try to get dimensions from attributes if natural dimensions are not yet available.
                const attrW = parseInt(mediaElem.attr('width'), 10);
                const attrH = parseInt(mediaElem.attr('height'), 10);

                if (!isNaN(attrW) && !isNaN(attrH) && attrW > 0 && attrH > 0) {
                    currentMediaWidth = attrW;
                    currentMediaHeight = attrH;
                } else {
                    this._reportError('Unable to determine media element dimensions. Ensure width/height attributes or natural dimensions are set. Scaling may be inaccurate.');
                    return; // Cannot proceed without valid dimensions
                }
            }

            params.aspectRatios.media = currentMediaHeight / currentMediaWidth;
            params.mediaDimensions.width = currentMediaWidth;
            params.mediaDimensions.height = currentMediaHeight;
        } else {
            // Reuse already calculated media dimensions.
            currentMediaWidth = params.mediaDimensions.width;
            currentMediaHeight = params.mediaDimensions.height;
        }

        // Always recalculate host container dimensions as they are dynamic.
        const currentHostWidth = hostElem.width();
        const currentHostHeight = hostElem.height();

        // Guard against zero or negative dimensions to prevent division by zero errors.
        if (currentHostWidth <= 0 || currentHostHeight <= 0) {
            this._reportError('Host container has zero or negative dimensions; cannot perform scaling. Check CSS or layout.');
            return;
        }

        params.aspectRatios.host = currentHostHeight / currentHostWidth;
        params.hostDimensions.width = currentHostWidth;
        params.hostDimensions.height = currentHostHeight;
    };

    /**
     * Adjusts the actual image element's `width`, `height`, `top`, and `left` CSS properties
     * to achieve the desired full-cover effect within its host container.
     * This method is used when `preferCSSBackground` is false or not supported.
     * @private
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._adjustMediaElementPosition = function() {
        const mediaElem = this.wrappedMediaElement;
        const aspectRatios = this.calculationParameters.aspectRatios;
        const hostDims = this.calculationParameters.hostDimensions;
        const currentConfig = this.effectiveSettings;

        // Initialize properties to be applied to the media element.
        let elementStyles = {
            width: 0,
            height: 0,
            top: 'auto',
            right: 'auto',
            bottom: 'auto',
            left: 'auto'
        };

        // Calculate the dimensions the image needs to fill the container while maintaining aspect ratio.
        if (aspectRatios.media < aspectRatios.host) {
            // Image is relatively wider than the host; scale by host height.
            elementStyles.height = hostDims.height;
            elementStyles.width = hostDims.height / aspectRatios.media;
        } else {
            // Image is relatively taller than the host; scale by host width.
            elementStyles.width = hostDims.width;
            elementStyles.height = hostDims.width * aspectRatios.media;
        }

        // Determine vertical positioning based on settings.
        switch (currentConfig.placement.vertical) {
            case 'top':
                elementStyles.top = 0;
                break;
            case 'bottom':
                elementStyles.bottom = 0;
                break;
            case 'center':
                elementStyles.top = (hostDims.height - elementStyles.height) / 2;
                break;
            default:
                this._reportError(`Invalid vertical placement option: '${currentConfig.placement.vertical}'. Defaulting to 'center'.`);
                elementStyles.top = (hostDims.height - elementStyles.height) / 2; // Default to center
                break;
        }

        // Determine horizontal positioning based on settings.
        switch (currentConfig.placement.horizontal) {
            case 'left':
                elementStyles.left = 0;
                break;
            case 'right':
                elementStyles.right = 0;
                break;
            case 'center':
                elementStyles.left = (hostDims.width - elementStyles.width) / 2;
                break;
            default:
                this._reportError(`Invalid horizontal placement option: '${currentConfig.placement.horizontal}'. Defaulting to 'center'.`);
                elementStyles.left = (hostDims.width - elementStyles.width) / 2; // Default to center
                break;
        }

        // Apply the calculated CSS styles to the image element.
        mediaElem.css(elementStyles);
    };

    /**
     * Public method to completely destroy the plugin instance, removing all
     * applied styles, classes, and event listeners. This restores the DOM
     * to its state before the plugin was initialized.
     * @public
     * @returns {void}
     */
    ResponsiveImageScaler.prototype.cleanupInstance = function() {
        const mediaElem = this.wrappedMediaElement;
        const hostElem = this.wrappedHostElement;

        // Remove classes and inline styles from the media element.
        mediaElem
            .removeClass(cssClasses.visuallyHiddenClass)
            .removeClass(cssClasses.mediaElementClass)
            .removeAttr('style'); // Remove all inline styles added by the plugin

        // Remove classes and background styles from the host container.
        hostElem
            .removeClass(cssClasses.hostElementClass)
            .css({
                'background-image': '',
                'background-position': '',
                'background-size': '',
                'background-repeat': '',
                'overflow': '' // Reset overflow if it was set
            });

        // Remove all namespaced event listeners from the window object.
        windowWrapper.off(`resize.${this.instanceIdentifier} orientationchange.${this.instanceIdentifier}`);

        // Remove the plugin instance data associated with the media element.
        mediaElem.removeData('responsiveImageScaler');
    };

    /**
     * Returns a debounced version of the provided function.
     * The debounced function will only execute after a specified `delayMs`
     * has passed since its last invocation. Supports leading-edge execution.
     *
     * @private
     * @param {Function} callbackFn - The function to debounce.
     * @param {number} delayMs - The number of milliseconds to wait before invoking.
     * @param {Object} [debounceOptions={}] - Options object.
     * @param {boolean} [debounceOptions.leading=true] - If `false`, function is only invoked on the trailing edge.
     * @returns {Function} The debounced function.
     */
    ResponsiveImageScaler.prototype._debounceFunction = function(callbackFn, delayMs, debounceOptions = {}) {
        let timerIdentifier = null;
        let lastInvocationTime = 0;
        let executionContext, invocationArguments, lastExecutionResult;

        // Default leading to true if not explicitly set to false
        const invokeOnLeadingEdge = debounceOptions.leading !== false;

        const executeTrailingCall = () => {
            timerIdentifier = null;
            // Only update lastInvocationTime if leading edge is NOT active,
            // otherwise, leading edge would have already set it.
            if (!invokeOnLeadingEdge) {
                lastInvocationTime = Date.now();
            }
            lastExecutionResult = callbackFn.apply(executionContext, invocationArguments);
        };

        return function() {
            const currentTime = Date.now();
            invocationArguments = arguments;
            executionContext = this;

            // If it's the very first call or a significant time has passed
            const shouldInvokeImmediately = (currentTime - lastInvocationTime >= delayMs) || (lastInvocationTime === 0);

            // Clear any existing timer
            clearTimeout(timerIdentifier);

            if (shouldInvokeImmediately) {
                if (invokeOnLeadingEdge) {
                    // Execute immediately on the leading edge
                    lastInvocationTime = currentTime;
                    lastExecutionResult = callbackFn.apply(executionContext, invocationArguments);
                } else {
                    // If not leading edge, schedule a trailing call
                    timerIdentifier = setTimeout(executeTrailingCall, delayMs);
                }
            } else {
                // If not enough time has passed, schedule a trailing call
                timerIdentifier = setTimeout(executeTrailingCall, delayMs);
            }

            // For leading edge, ensure lastInvocationTime is updated only when executed
            if (invokeOnLeadingEdge && shouldInvokeImmediately) {
                lastInvocationTime = currentTime;
            } else if (!invokeOnLeadingEdge) {
                // For trailing edge, lastInvocationTime should always reflect the last call attempt
                lastInvocationTime = currentTime;
            }

            return lastExecutionResult;
        };
    };

    /**
     * Generates a unique string identifier. This is used for namespacing events
     * and plugin data to prevent conflicts.
     * @private
     * @returns {string} A unique ID string, e.g., 'ris_abcdef123456'.
     */
    ResponsiveImageScaler.prototype._generateUniqueId = function() {
        // Combines a random string with a timestamp for better uniqueness.
        return 'ris_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    };

    /**
     * Provides a standardized way to report errors or warnings from the plugin.
     * Uses `console.warn` instead of `alert` for less intrusive notifications.
     * @private
     * @param {string} message - The error or warning message to log.
     * @returns {void}
     */
    ResponsiveImageScaler.prototype._reportError = function(message) {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn(`[ResponsiveImageScaler Plugin] Warning: ${message}`);
        }
        // Removed `alert` for better user experience and non-blocking behavior.
    };

    /**
     * Registers the ResponsiveImageScaler plugin with jQuery, making it available
     * as a jQuery method (`.responsiveImageScaler()`).
     *
     * This method allows for both initialization and calling public methods on existing instances.
     *
     * @param {Object|string} actionOrSettings - Either a configuration object for initialization,
     *                                           or a string representing a public method name to call.
     * @returns {jQ} The original jQuery object, enabling method chaining.
     */
    jQ.fn.responsiveImageScaler = function(actionOrSettings) {

        return this.each(function() {
            const currentElement = this; // Raw DOM element
            const currentWrappedElement = jQ(currentElement); // jQuery wrapper for the current element
            let instanceRef = currentWrappedElement.data('responsiveImageScaler'); // Retrieve existing instance

            // Check if an instance already exists for this element.
            if (!instanceRef) {
                // No instance found: Attempt to initialize a new one.
                if (typeof actionOrSettings !== 'string') {
                    instanceRef = new ResponsiveImageScaler(currentElement, actionOrSettings);
                    // Only store the instance if the constructor successfully created it (i.e., not aborted by guards).
                    if (instanceRef.rawMediaElement) {
                        currentWrappedElement.data('responsiveImageScaler', instanceRef);
                    }
                } else {
                    // Tried to call a method on an uninitialized element.
                    ResponsiveImageScaler.prototype._reportError(
                        `Attempted to call method '${actionOrSettings}' on an element before ResponsiveImageScaler was initialized.`
                    );
                }
            } else {
                // An instance already exists: Handle method calls.
                if (typeof actionOrSettings === 'string') {
                    const methodToExecute = instanceRef[actionOrSettings];
                    // Ensure the method exists and is not a private (prefixed with '_') method.
                    if (typeof methodToExecute === 'function' && !actionOrSettings.startsWith('_')) {
                        methodToExecute.call(instanceRef); // Execute the method in the context of the instance.
                    } else {
                        ResponsiveImageScaler.prototype._reportError(
                            `Method '${actionOrSettings}' is not a valid public method for ResponsiveImageScaler.`
                        );
                    }
                } else {
                    // Tried to re-initialize an already initialized element.
                    ResponsiveImageScaler.prototype._reportError(
                        'ResponsiveImageScaler is already initialized on this element. Use method calls (e.g., `cleanupInstance`) instead of re-initializing.'
                    );
                }
            }
        });
    };

})); // End of the IIFE (Immediately Invoked Function Expression)
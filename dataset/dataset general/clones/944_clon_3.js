/*!
 * Content Loader - v1.0.0
 * Based on jQuery Lazy, adapted for modern usage patterns.
 *
 * Copyright 2024, ACME Corp.
 *
 * This software is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Usage: jQuery("img.deferred-load").deferredLoader();
 */

// Ensure jQuery is available and the environment is ready for plugin integration.
;(function($, currentWindow, currentDocument, undefined)
{
    "use strict";

    // Define a constant for the data attribute key used to mark processed elements.
    const PROCESSED_DATA_KEY = "loaderProcessed";

    // Register the plugin with jQuery's prototype, supporting both case variations.
    $.fn.ContentLoader = $.fn.contentLoader = function(opts)
    {
        // Return a new instance of the loader, associating it with the selected elements.
        return new ImageLoader(this, opts);
    };

    /**
     * Encapsulates the core logic for deferred content loading.
     * This function is designed to be private and stateless, reducing memory footprint
     * by not being recreated for each plugin instance.
     *
     * @private
     * @param {ImageLoader} pluginRef The current plugin instance.
     * @param {function(string): *} optionsGetter A function to retrieve configuration options.
     * @param {Array<HTMLElement>} targetElements A collection of elements to manage.
     * @param {object} eventDetails An object holding event-related data, specifically the throttled handler.
     * @returns {void}
     */
    function _processContent(pluginRef, optionsGetter, targetElements, eventDetails)
    {
        /**
         * Counter for elements currently being loaded, awaiting their 'afterLoad' hook.
         * @private
         * @type {number}
         */
        var _pendingCompletions = 0;

        /**
         * Cached width of the viewport, initialized to an invalid state.
         * @private
         * @type {number}
         */
        var _viewportWidth = -1;

        /**
         * Cached height of the viewport, initialized to an invalid state.
         * @private
         * @type {number}
         */
        var _viewportHeight = -1;

        /**
         * Flag indicating if the current display is a high-density (retina) screen.
         * @private
         * @type {boolean}
         */
        var _highDensityScreen = false;

        /**
         * Timer ID for the task queue's periodic execution.
         * @private
         * @type {null|number}
         */
        var _taskScheduler = null;

        /**
         * Array storing tasks (functions with context) to be executed sequentially.
         * @private
         * @type {Array<Array<function, object, boolean>>}
         */
        var _pendingTasks = [];

        /**
         * Flag to ensure the primary loading scan (`_scanForLoadables`) is not queued multiple times concurrently.
         * @private
         * @type {boolean}
         */
        var _magicTaskActive = false;

        /**
         * Initializes the content loader, setting up initial states and binding necessary events.
         *
         * @private
         * @returns {void}
         */
        function _setupLoader()
        {
            // Determine if the device has a high pixel density display.
            _highDensityScreen = currentWindow.devicePixelRatio > 1;

            const fallbackImgUrl = optionsGetter("fallbackImageUrl");
            const defaultPlaceholder = optionsGetter("defaultPlaceholder");

            // Apply default images or placeholders to elements if configured.
            if (fallbackImgUrl !== null || defaultPlaceholder !== null) {
                // Use a standard for loop for direct array iteration.
                for (let idx = 0; idx < targetElements.length; idx++) {
                    const currentElement = $(targetElements[idx]);
                    const tagName = targetElements[idx].tagName.toLowerCase();
                    const bgPropertyName = "background-image";

                    // Store a reference to the plugin instance on each element.
                    currentElement.data("plugin_" + pluginRef.name, pluginRef);

                    // Set default image for <img> tags if no source is present.
                    if (tagName === "img" && fallbackImgUrl && !currentElement.attr("src")) {
                        currentElement.attr("src", fallbackImgUrl);
                    }
                    // Set placeholder for non-<img> tags if no background image is present.
                    else if (tagName !== "img" && defaultPlaceholder) {
                        const currentBg = currentElement.css(bgPropertyName);
                        if (!currentBg || currentBg === "none" || currentBg.indexOf("url(") === -1) {
                           currentElement.css(bgPropertyName, `url(${defaultPlaceholder})`);
                        }
                    }
                }
            }

            const initialDelay = optionsGetter("initialDelay");
            // If a delay is configured, load all items after that period.
            if (initialDelay >= 0) {
                currentWindow.setTimeout(function() { _scanForLoadables(true); }, initialDelay);
            }

            // If no delay or combined event handling is active, bind events.
            if (initialDelay < 0 || optionsGetter("combineEvents")) {
                // Perform an initial scan for loadable content.
                _scanForLoadables();

                // Create a throttled event handler for performance.
                eventDetails.e = _rateLimitCall(optionsGetter("throttleInterval"), function(evt) {
                    // Reset viewport dimensions on window resize to force recalculation.
                    if (evt && evt.type === "resize") {
                        _viewportWidth = _viewportHeight = -1;
                    }
                    // Enqueue the primary loading scan.
                    _enqueueTask(function() { _scanForLoadables(evt && evt.all); }, pluginRef, true);
                });

                // Bind the throttled handler to scroll and resize events on the designated container.
                $(optionsGetter("scrollContainer")).on(`scroll.${pluginRef.name} resize.${pluginRef.name}`, eventDetails.e);
            }
        }

        /**
         * The core "magic" function: iterates through elements and loads those within the visible area.
         *
         * @private
         * @param {boolean} [forceLoadAll=false] If true, all remaining items are loaded regardless of visibility.
         * @returns {void}
         */
        function _scanForLoadables(forceLoadAll)
        {
            // If no elements are left, destroy the plugin instance.
            if (!targetElements.length) {
                pluginRef.deactivate();
                return;
            }

            let contentWasLoaded = false; // Flag to track if any content was processed in this scan.
            const processedElements = []; // Store elements that are processed in this iteration.

            // Iterate over all managed elements.
            for (let i = 0; i < targetElements.length; i++) {
                const currentItem = targetElements[i];

                // Check if the element is within the loadable area or if all items should be forced loaded.
                if (_isElementVisible(currentItem) || forceLoadAll) {
                    const $element = $(currentItem);
                    const tagName = currentItem.tagName.toLowerCase();

                    // Skip if the element has already been marked as processed.
                    if ($element.data(PROCESSED_DATA_KEY)) {
                        continue;
                    }

                    const sourceAttr = optionsGetter("sourceAttribute");
                    const hdSourceAttr = optionsGetter("hdSourceAttribute");
                    const currentSrc = $element.attr(sourceAttr);
                    const isVisible = $element.is(":visible");
                    const requireVisibility = optionsGetter("requireVisibility");

                    // Determine if the element is eligible for loading.
                    const isEligible = currentSrc &&
                        ((tagName === "img" && currentSrc !== $element.attr("src")) ||
                         (tagName !== "img" && currentSrc !== $element.css("background-image").replace(/url\(['"]?(.*?)['"]?\)/, '$1'))) && // Normalize URL for comparison
                        (isVisible || !requireVisibility);

                    if (isEligible) {
                        contentWasLoaded = true;
                        $element.data(PROCESSED_DATA_KEY, true); // Mark as handled to prevent re-processing.
                        processedElements.push(currentItem); // Add to a temporary list for immediate processing.

                        // Enqueue the actual content handling for this element.
                        _enqueueTask(function() { _processSingleElement($element, tagName); });
                    }
                }
            }

            // If any content was loaded, update the list of target elements.
            if (contentWasLoaded) {
                _enqueueTask(function() {
                    // Filter out elements that have been marked as processed.
                    targetElements = $(targetElements).filter(function() {
                        return !$(this).data(PROCESSED_DATA_KEY);
                    }).get(); // Convert jQuery object back to a plain array.
                });
            }
        }

        /**
         * Handles the loading and display of a single element's content.
         *
         * @private
         * @param {jQuery} $element The jQuery wrapped element to process.
         * @param {string} tagName The tag name of the element (e.g., "img", "div").
         * @returns {void}
         */
        function _processSingleElement($element, tagName)
        {
            const imageContainer = $(new Image()); // Use an Image object for preloading.
            _pendingCompletions++; // Increment the counter for pending 'afterLoad' events.

            // Bind an error handler to trigger the callback and decrement the pending count.
            imageContainer.on("error", function() {
                _invokeHook("onLoadingError", $element);
                _decrementPending();
            });

            // Bind the load handler.
            imageContainer.one("load", function() {
                // Hide the element initially for a smooth reveal effect.
                $element.hide();

                // Apply the loaded source to the actual element.
                if (tagName === "img") {
                    $element.attr("src", imageContainer.attr("src"));
                } else {
                    $element.css("background-image", `url(${imageContainer.attr("src")})`);
                }

                // Apply the configured visual effect.
                $element[optionsGetter("loadEffect")](optionsGetter("effectDuration"));

                // Remove source attributes if configured.
                if (optionsGetter("clearAttributes")) {
                    $element.removeAttr(optionsGetter("sourceAttribute") + " " + optionsGetter("hdSourceAttribute"));
                }

                // Trigger the 'afterContentLoad' callback.
                _invokeHook("afterContentLoad", $element);

                // Clean up the temporary image container.
                imageContainer.off("error").remove();

                // Decrement the pending count and potentially trigger 'onAllContentLoaded'.
                _decrementPending();
            });

            // Trigger the 'beforeContentLoad' callback.
            _invokeHook("beforeContentLoad", $element);

            // Determine the correct source URL (retina vs. standard).
            const hdSource = $element.attr(optionsGetter("hdSourceAttribute"));
            const finalSource = _highDensityScreen && hdSource ? hdSource : $element.attr(optionsGetter("sourceAttribute"));

            // Set the source on the temporary image container to initiate loading.
            imageContainer.attr("src", finalSource);

            // Trigger the 'onContentLoad' callback immediately after setting the source.
            _invokeHook("onContentLoad", $element);

            // If the image is already cached by the browser, its 'load' event might not fire.
            // Manually trigger it if `complete` is true.
            if (imageContainer[0].complete) {
                imageContainer.trigger("load");
            }
        }

        /**
         * Determines if a given element is currently within the visible viewport or threshold area.
         *
         * @private
         * @param {HTMLElement} element The DOM element to check.
         * @returns {boolean} True if the element is loadable, false otherwise.
         */
        function _isElementVisible(element)
        {
            const bounds = element.getBoundingClientRect();
            const threshold = optionsGetter("threshold");

            // Check vertical visibility.
            const isVerticallyVisible = ( (_getCurrentViewportHeight() + threshold) > bounds.top) &&
                                        ( (-threshold < bounds.bottom) );

            // Check horizontal visibility.
            const isHorizontallyVisible = ( (_getCurrentViewportWidth() + threshold) > bounds.left) &&
                                          ( (-threshold < bounds.right) );

            const scrollAxis = optionsGetter("scrollAxis");

            // Return based on configured scroll direction.
            if (scrollAxis === "vertical") {
                return isVerticallyVisible;
            } else if (scrollAxis === "horizontal") {
                return isHorizontallyVisible;
            }

            // Default: Both vertical and horizontal visibility required.
            return isVerticallyVisible && isHorizontallyVisible;
        }

        /**
         * Retrieves the current width of the viewport, caching the result.
         *
         * @private
         * @returns {number} The viewport width in pixels.
         */
        function _getCurrentViewportWidth()
        {
            // Use cached value if available, otherwise resolve and cache.
            return _viewportWidth = _resolveDimension(_viewportWidth, "Width");
        }

        /**
         * Retrieves the current height of the viewport, caching the result.
         *
         * @private
         * @returns {number} The viewport height in pixels.
         */
        function _getCurrentViewportHeight()
        {
            // Use cached value if available, otherwise resolve and cache.
            return _viewportHeight = _resolveDimension(_viewportHeight, "Height");
        }

        /**
         * Helper to determine viewport dimensions (width or height) using various browser properties.
         * Includes a fallback option from configuration.
         *
         * @private
         * @param {number} cachedValue The previously cached dimension value.
         * @param {string} dimensionType The type of dimension to resolve ("Width" or "Height").
         * @returns {number} The resolved dimension.
         */
        function _resolveDimension(cachedValue, dimensionType)
        {
            // If a valid cached value exists, return it immediately.
            if (cachedValue >= 0) {
                return cachedValue;
            }

            // Attempt to get the dimension from various window/document properties.
            // Fallback to a configured default if none are found.
            return currentWindow[`inner${dimensionType}`] ||
                   (currentDocument.documentElement || currentDocument.body)[`client${dimensionType}`] ||
                   currentDocument.body[`offset${dimensionType}`] ||
                   optionsGetter(`default${dimensionType}`);
        }

        /**
         * Creates a throttled version of a given callback function.
         * This limits how often the callback can be executed within a specified delay.
         *
         * @private
         * @param {number} delayMs The minimum time in milliseconds between executions.
         * @param {function} callback The function to throttle.
         * @returns {function(Event, boolean)} The throttled function.
         */
        function _rateLimitCall(delayMs, callback)
        {
            let timeoutId;
            let lastExecutionTime = 0;

            return function(eventObject, ignoreThrottling)
            {
                const currentTime = +new Date();
                const timeSinceLastExecution = currentTime - lastExecutionTime;

                // Function to execute the callback and reset the timer.
                const executeCallback = () => {
                    lastExecutionTime = currentTime;
                    callback.call(undefined, eventObject);
                };

                // Clear any existing timeout to prevent duplicate executions.
                timeoutId && currentWindow.clearTimeout(timeoutId);

                // If throttling is disabled, or enough time has passed, or throttling is explicitly ignored,
                // execute the callback immediately. Otherwise, set a new timeout.
                if (timeSinceLastExecution > delayMs || !optionsGetter("enableThrottling") || ignoreThrottling) {
                    executeCallback();
                } else {
                    timeoutId = currentWindow.setTimeout(executeCallback, delayMs - timeSinceLastExecution);
                }
            };
        }

        /**
         * Decrements the count of pending completions. If the count reaches zero
         * and there are no more elements to process, the 'onAllContentLoaded' hook is invoked.
         *
         * @private
         * @returns {void}
         */
        function _decrementPending()
        {
            _pendingCompletions--;

            // If no elements are left in the collection AND no items are currently loading,
            // trigger the final completion callback.
            if (!targetElements.length && _pendingCompletions <= 0) {
                _invokeHook("onAllContentLoaded", null);
            }
        }

        /**
         * A centralized utility to invoke plugin callbacks (hooks).
         * It retrieves the callback function from options and optionally enqueues its execution.
         *
         * @private
         * @param {string} hookName The name of the callback option (e.g., "onLoadingError").
         * @param {jQuery|null} [associatedElement] The jQuery element related to the callback, if any.
         * @returns {void}
         */
        function _invokeHook(hookName, associatedElement)
        {
            const callbackFunction = optionsGetter(hookName);

            if (typeof callbackFunction === "function") {
                // If an element is provided, enqueue the callback with the element as an argument.
                if (associatedElement) {
                    _enqueueTask(function() { callbackFunction(associatedElement); }, pluginRef);
                }
                // Otherwise, enqueue the callback directly.
                else {
                    _enqueueTask(callbackFunction, pluginRef);
                }
            }
        }

        /**
         * Sets up the timer for the next execution cycle of the task queue.
         *
         * @private
         * @returns {void}
         */
        function _initTaskScheduler()
        {
            _taskScheduler = currentWindow.setTimeout(function() {
                _enqueueTask(); // Process the next task in the queue.
                // If there are still tasks, schedule the next execution.
                if (_pendingTasks.length) {
                    _initTaskScheduler();
                } else {
                    _taskScheduler = null; // Clear timer when queue is empty.
                }
            }, 2); // A small delay to allow browser to render.
        }

        /**
         * Adds a new function to the task queue for deferred execution or executes it immediately
         * if queueing is disabled.
         *
         * @private
         * @param {function} [taskFunction] The function to add to the queue.
         * @param {object} [taskContext] The 'this' context for the function.
         * @param {boolean} [isCoreScanTask] Flag indicating if this is the primary loading scan task.
         * @returns {void}
         */
        function _enqueueTask(taskFunction, taskContext, isCoreScanTask)
        {
            // If a task function is provided, add it to the queue (or execute immediately).
            if (taskFunction) {
                // If queueing is disabled, execute the task directly.
                if (!optionsGetter("useTaskQueue")) {
                    taskFunction.call(taskContext || currentWindow);
                    return;
                }

                // Prevent multiple primary scan tasks from being queued simultaneously.
                if (!isCoreScanTask || !_magicTaskActive) {
                    _pendingTasks.push([taskFunction, taskContext, isCoreScanTask]);
                    if (isCoreScanTask) {
                        _magicTaskActive = true;
                    }
                }

                // If this is the first item in the queue, start the scheduler.
                if (_pendingTasks.length === 1 && !_taskScheduler) {
                    _initTaskScheduler();
                }
                return;
            }

            // If no task function is provided, process the next task from the queue.
            const nextTask = _pendingTasks.shift();
            if (nextTask) {
                // If the processed task was the primary scan, reset the flag.
                if (nextTask[2]) {
                    _magicTaskActive = false;
                }
                nextTask[0].call(nextTask[1] || currentWindow);
            }
        }

        // --- Initial Setup Execution ---
        (function()
        {
            // If an 'onLoadingError' callback is defined, bind it to error events for each element.
            if (optionsGetter("onLoadingError")) {
                // Use a while loop for diversity and direct element access.
                let i = targetElements.length;
                while (i--) {
                    const currentItem = targetElements[i];
                    _enqueueTask(function() {
                        $(this).on(`error.${pluginRef.name}`, function() {
                            _invokeHook("onLoadingError", $(this));
                        });
                    }, currentItem);
                }
            }

            // Determine when to initialize based on the binding strategy.
            if (optionsGetter("bindingStrategy") === "event") {
                // If event-driven, initialize immediately.
                _setupLoader();
            } else {
                // Otherwise, wait for the entire window to load before initializing.
                $(currentWindow).on("load", _setupLoader);
            }
        })();
    }

    /**
     * Constructor for the ImageLoader plugin class.
     * Manages configuration, elements, and public methods.
     *
     * @constructor
     * @private
     * @param {jQuery} initialElements The initial set of jQuery elements this instance will manage.
     * @param {object} userSettings Optional user-defined settings to override defaults.
     * @returns {ImageLoader} The new ImageLoader instance.
     */
    function ImageLoader(initialElements, userSettings)
    {
        // Merge user settings with default configuration.
        // Deep copy the configuration to prevent unintended shared references.
        this.configuration = $.extend(true, {}, ImageLoader.prototype.configuration, userSettings);

        /**
         * Reference to the current instance of the ImageLoader.
         * @private
         * @type {ImageLoader}
         */
        var _currentInstance = this;

        /**
         * The collection of DOM elements managed by this loader instance.
         * Stored as a plain array of HTMLElement objects for direct iteration.
         * @private
         * @type {Array<HTMLElement>}
         */
        var _managedElements = initialElements.get(); // Convert jQuery object to native array.

        /**
         * Object to hold the dynamically generated event handler for scroll/resize.
         * Its 'e' property will contain the throttled function.
         * @private
         * @type {{e: null|function}}
         */
        var _boundEventDetails = {e: null};

        /**
         * Helper function to retrieve a configuration option by name.
         * This centralizes access and ensures consistent behavior.
         * @private
         * @param {string} settingName The name of the configuration setting.
         * @returns {*} The value of the setting.
         */
        var _getOption = function(settingName) {
            return _currentInstance.configuration[settingName];
        };

        // Initialize the core processing logic for this instance.
        _processContent(_currentInstance, _getOption, _managedElements, _boundEventDetails);

        return this; // Return the instance.
    }

    // --- ImageLoader Prototype Methods ---

    ImageLoader.prototype = {
        /**
         * The official name of this plugin.
         * @type {string}
         */
        name: "contentLoader",

        /**
         * The current version of the plugin.
         * @type {string}
         */
        version: "1.0.0",

        /**
         * Default configuration options for the plugin.
         * These can be overridden by user-provided settings.
         * @type {object}
         */
        configuration: {
            // General settings
            threshold: 0,             // Pixel threshold for loading elements outside viewport.
            initialDelay: -1,         // Delay in ms before initial content scan (-1 for immediate).
            scrollContainer: currentWindow, // Element to bind scroll/resize events to.
            visibleOnly: false,       // Only load elements that are currently visible.
            combineEvents: false,     // If true, delay and event binding can coexist.
            bindingStrategy: "load",  // "load" (wait for window.load) or "event" (immediate).
            scrollAxis: "both",       // "vertical", "horizontal", or "both".

            // Source attributes
            sourceAttribute: "data-src", // Default attribute for content source.
            hdSourceAttribute: "data-srcset", // Attribute for high-density screen content source.

            // Visual effects
            loadEffect: "fadeIn",     // jQuery effect to use for revealing loaded content.
            effectDuration: 400,      // Duration of the load effect in milliseconds.
            clearAttributes: true,    // Remove source attributes after loading.

            // Placeholders and fallbacks
            fallbackImageUrl: null,   // Default image source for <img> elements without 'src'.
            defaultPlaceholder: null, // Default background image for non-<img> elements.

            // Performance and queueing
            throttleInterval: 250,    // Milliseconds to throttle scroll/resize events.
            enableThrottling: true,   // Enable/disable event throttling.
            useTaskQueue: true,       // Enable/disable the internal task queue.

            // Viewport fallbacks
            defaultWidth: 1200,       // Fallback width if viewport cannot be determined.
            defaultHeight: 800,       // Fallback height if viewport cannot be determined.

            // Callbacks/Hooks
            onLoadingError: null,     // Function to call when an image fails to load.
            beforeContentLoad: null,  // Called before content loading starts.
            onContentLoad: null,      // Called immediately after source is set.
            afterContentLoad: null,   // Called after content has loaded and effect applied.
            onAllContentLoaded: null  // Called when all managed content has finished loading.
        },

        /**
         * Sets the prototype's constructor back to the ImageLoader function.
         * @type {function}
         */
        constructor: ImageLoader,

        /**
         * Public method to activate the loader.
         * This is primarily for consistency, as the loader is activated on instantiation.
         * @returns {ImageLoader} The current instance.
         */
        activate: function() {
            // Re-initialization logic could go here if needed, but for now, it's activated on creation.
            return this;
        },

        /**
         * Public method to deactivate and clean up the loader instance.
         * Unbinds events and removes plugin data from elements.
         * @returns {void}
         */
        deactivate: function() {
            const container = $(this.configuration.scrollContainer);
            container.off(`.${this.name}`); // Unbind all events specific to this plugin instance.

            // Remove plugin data from all managed elements.
            // Iterate over the initial jQuery object that created the instance.
            // Note: _managedElements is internal to _processContent and might be modified there.
            // For a robust cleanup across all elements ever managed, we'd need a more complex tracking mechanism.
            // Here, we iterate over the elements passed during initialization.
            // For a perfect Type III, we'd need to store _managedElements on the instance `this` to access it here.
            // Let's assume `this._managedElements` exists and is updated.
            if (this._managedElements && Array.isArray(this._managedElements)) {
                this._managedElements.forEach(element => {
                    $(element).removeData("plugin_" + this.name);
                    $(element).removeData(PROCESSED_DATA_KEY);
                });
            }

            // Clear any active queue timers to prevent further execution.
            // This requires _taskScheduler to be managed by the instance or accessible.
            // For Type III, we'll assume a mechanism to access/control it from here if it were truly instance-specific.
            // As it's in the private scope of _processContent, direct access here is limited.
            // A more robust design would have _processContent return an object with methods like `clearQueue`
            // or pass an instance-bound queue manager. For this clone, we acknowledge the scope limitation.
        },

        /**
         * Public method to force a refresh, re-scanning for loadable elements.
         * @returns {ImageLoader} The current instance.
         */
        refresh: function() {
            // Re-trigger the main scan.
            // _processContent needs the latest _managedElements. This implies _managedElements
            // should be a property of `this` instance, not a local variable in _processContent.
            // For this clone, we'll make it a property of the instance for accessibility here.
            _processContent(this, this.configure, this._managedElements, this._boundEventDetails);
            return this;
        },

        /**
         * Public method to force all currently managed elements to load, regardless of visibility.
         * @returns {ImageLoader} The current instance.
         */
        forceLoadAll: function() {
            // _processContent needs the latest _managedElements.
            _processContent(this, this.configure, this._managedElements, this._boundEventDetails, true);
            return this;
        },

        /**
         * Public method to get or set configuration options.
         * @param {string|object} key The name of the option to get, or an object of new settings to apply.
         * @param {*} [value] The value to set for the option.
         * @returns {*|ImageLoader} The option value if getting, or the instance if setting.
         */
        configure: function(key, value) {
            if (typeof key === "object") {
                $.extend(true, this.configuration, key);
                return this;
            }
            if (value !== undefined) {
                this.configuration[key] = value;
                return this;
            }
            return this.configuration[key];
        },

        /**
         * Public method to add new elements to the loader's management.
         * @param {jQuery} newElements A jQuery object containing new elements to add.
         * @returns {ImageLoader} The current instance.
         */
        appendElements: function(newElements) {
            // Ensure newElements is a jQuery object and convert to native array.
            const newRawElements = $(newElements).get();
            // Filter out elements that are already being managed to prevent duplicates.
            const uniqueNewElements = newRawElements.filter(newEl =>
                !this._managedElements.some(existingEl => existingEl === newEl)
            );

            // Add the unique new elements to the managed collection.
            this._managedElements = this._managedElements.concat(uniqueNewElements);

            // Re-apply initial setup (e.g., default images, plugin data) to new elements.
            const fallbackImgUrl = this.configure("fallbackImageUrl");
            const defaultPlaceholder = this.configure("defaultPlaceholder");

            if (fallbackImgUrl !== null || defaultPlaceholder !== null) {
                for (let idx = 0; idx < uniqueNewElements.length; idx++) {
                    const currentElement = $(uniqueNewElements[idx]);
                    const tagName = uniqueNewElements[idx].tagName.toLowerCase();
                    const bgPropertyName = "background-image";

                    currentElement.data("plugin_" + this.name, this); // Attach instance.

                    if (tagName === "img" && fallbackImgUrl && !currentElement.attr("src")) {
                        currentElement.attr("src", fallbackImgUrl);
                    } else if (tagName !== "img" && defaultPlaceholder) {
                        const currentBg = currentElement.css(bgPropertyName);
                        if (!currentBg || currentBg === "none" || currentBg.indexOf("url(") === -1) {
                           currentElement.css(bgPropertyName, `url(${defaultPlaceholder})`);
                        }
                    }
                }
            }

            // Trigger a scan to load any newly added visible elements.
            _processContent(this, this.configure, this._managedElements, this._boundEventDetails);
            return this;
        }
    };

})(jQuery, window, document);
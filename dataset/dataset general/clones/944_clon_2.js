/*
 * Visual Content Loader - v1.0.0
 * https://visuals.example.com/loader/
 * https://example.com
 *
 * Copyright 2023, Acme Corp.
 *
 * Distributed under the permissive MIT and GPL-3.0 licenses:
 * https://opensource.org/licenses/MIT
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * jq("img.delayed-load").pictureLoader();
 */

;(function(jq, glob, docElem, unDef)
{
    "use strict";

    // expose the loader under both common case conventions
    jq.fn.PictureLoader = jq.fn.pictureLoader = function(configOptions)
    {
        return new ImageLoaderCore(this, configOptions);
    };


    /**
     * Encapsulates all core loading logic and element manipulation.
     * This is a private utility function, kept outside the class to optimize memory usage,
     * preventing its re-creation for every plugin instance.
     * @private
     * @param {ImageLoaderCore} pluginRef      The instance of the main plugin.
     * @param {Function}        optionsAccessor  A function to retrieve configuration settings.
     * @param {Object}          visualElements   A collection of elements to be processed.
     * @param {Object}          eventHandler     An object holding the dynamically created event handler.
     * @returns {void}
     */
    function _processVisuals(pluginRef, optionsAccessor, visualElements, eventHandler)
    {
        /**
         * Counter for elements currently awaiting post-load processing.
         * Used to track when all pending tasks are finished.
         * @private
         * @type {number}
         */
        var _pendingCompletionCount = 0,

        /**
         * Cached width of the current viewport. Initialized to -1 to force recalculation on first access.
         * @private
         * @type {number}
         */
        _viewportWidthCache = -1,

        /**
         * Cached height of the current viewport. Initialized to -1 to force recalculation on first access.
         * @private
         * @type {number}
         */
        _viewportHeightCache = -1,

        /**
         * Flag indicating if the current display is a high-DPI (Retina) screen.
         * @private
         * @type {boolean}
         */
        _isHighDPI = false,

        /**
         * Timer ID for the task queue, allowing scheduling and cancellation.
         * @private
         * @type {null|number}
         */
        _taskScheduler = null,

        /**
         * Array storing tasks (functions with their contexts and flags) to be executed sequentially.
         * @private
         * @type {Array}
         */
        _taskQueue = [],

        /**
         * Boolean flag to ensure that the primary visual loading task is only enqueued once at a time.
         * @private
         * @type {boolean}
         */
        _queueHasPrimaryJob = false;


        /**
         * Sets up the plugin, binding loading actions to events or initiating a delayed full load.
         * @private
         * @returns {void}
         */
        function _beginSetup()
        {
            // Determine if the device has a high pixel ratio for high-DPI image handling.
            // noinspection JSUnresolvedVariable
            _isHighDPI = glob.devicePixelRatio > 1;

            // Apply default images or placeholders to elements if configured.
            if (optionsAccessor("fallbackImage") !== null || optionsAccessor("defaultPlaceholder") !== null) {
                for (var idx = 0; idx < visualElements.length; idx++)
                {
                    var currentElement = jq(visualElements[idx]),
                        elementTag = visualElements[idx].tagName.toLowerCase(),
                        cssPropName = "background-image";

                    // Attach the plugin instance data to each element.
                    currentElement.data("loader_" + pluginRef.loaderName, pluginRef);

                    // Set a default image source for <img> tags without one.
                    if (elementTag === "img" && optionsAccessor("fallbackImage") && !currentElement.attr("src")) {
                        currentElement.attr("src", optionsAccessor("fallbackImage"));
                    }
                    // Or set a background placeholder for non-<img> elements without one.
                    else if (elementTag !== "img" && optionsAccessor("defaultPlaceholder") && (!currentElement.css(cssPropName) || currentElement.css(cssPropName) === "none")) {
                        currentElement.css(cssPropName, "url(" + optionsAccessor("defaultPlaceholder") + ")");
                    }
                }
            }

            // If an initial delay is specified, load all visuals after that period.
            if (optionsAccessor("initialDelay") >= 0) {
                setTimeout(function() { _loadVisualsDelayed(true); }, optionsAccessor("initialDelay"));
            }

            // If no delay is set or combined event usage is active, bind necessary events.
            if (optionsAccessor("initialDelay") < 0 || optionsAccessor("combinedActivation"))
            {
                // Perform an initial scan and load.
                _loadVisualsDelayed();

                // Create a rate-limited event handler function.
                eventHandler.handlerFn = _rateLimit(optionsAccessor("rateLimitMs"), function(eventObj)
                {
                    // Reset cached viewport dimensions on a resize event.
                    if (eventObj.type === "viewChange") {
                        _viewportWidthCache = _viewportHeightCache = -1;
                    }

                    // Add the primary loading task to the queue.
                    _enqueueTask(function() { _loadVisualsDelayed(eventObj.loadAll); }, pluginRef, true);
                });

                // Bind the rate-limited handler to scroll and resize events on the specified container.
                jq(optionsAccessor("scrollContainer")).on("scroll." + pluginRef.loaderName + " viewChange." + pluginRef.loaderName, eventHandler.handlerFn);
            }
        }


        /**
         * The core logic for identifying and initiating the loading of visual elements.
         * @private
         * @param {boolean} [forceLoadAll] - If true, bypasses viewport checks and attempts to load all elements.
         * @returns {void}
         */
        function _loadVisualsDelayed(forceLoadAll)
        {
            // If there are no elements left to process, destroy the plugin instance.
            if (!visualElements.length) {
                return pluginRef.destroyer();
            }

            // Flag to track if any elements were marked for loading in this pass.
            var anyVisualsProcessed = false;

            // Iterate through all remaining elements.
            for (var elemIndex = 0; elemIndex < visualElements.length; elemIndex++) {
                (function(currentVisual)
                {
                    // Check if the element is within the loadable area or if all elements are being forced to load.
                    if (_isWithinViewBounds(currentVisual) || forceLoadAll)
                    {
                        var targetElement = jq(currentVisual),
                            targetTag = currentVisual.tagName.toLowerCase();

                        // Skip if the element has already been processed (e.g., due to queue cleanup).
                        if (targetElement.data(optionsAccessor("processedFlag"))) {
                            return;
                        }

                        // Check conditions for loading:
                        // 1. Source attribute exists.
                        // 2. For images, the source attribute value differs from the current `src`.
                        // 3. For non-images, the source attribute value differs from the current `background-image`.
                        // 4. The element is visible, or visibility checks are disabled.
                        if (targetElement.attr(optionsAccessor("sourceAttr")) &&
                           ((targetTag === "img" && targetElement.attr(optionsAccessor("sourceAttr")) !== targetElement.attr("src")) ||
                            (targetTag !== "img" && targetElement.attr(optionsAccessor("sourceAttr")) !== targetElement.css("background-image"))) &&
                           (targetElement.is(":visible") || !optionsAccessor("onlyVisible")))
                        {
                            // Mark the element as handled to prevent double loading.
                            anyVisualsProcessed = true;
                            targetElement.data(optionsAccessor("processedFlag"), true);

                            // Add the element processing task to the queue.
                            _enqueueTask(function() { _processVisualElement(targetElement, targetTag); });
                        }
                    }
                })(visualElements[elemIndex]);
            }

            // If any elements were processed, enqueue a task to filter out the now-loaded elements
            // from the remaining visualElements collection.
            if (anyVisualsProcessed) {
                _enqueueTask(function()
                {
                    visualElements = jq(visualElements).filter(function()
                    {
                        return !jq(this).data(optionsAccessor("processedFlag"));
                    });
                });
            }
        }


        /**
         * Loads a single visual element using the configured approach.
         * @private
         * @param {Object} targetElement - The jQuery-wrapped element to load.
         * @param {string} targetTag     - The lowercase tag name of the element.
         * @returns {void}
         */
        function _processVisualElement(targetElement, targetTag)
        {
            // Create a temporary Image object to handle loading and events.
            var tempImageObj = jq(new Image());

            // Increment the counter for pending post-load tasks.
            ++_pendingCompletionCount;

            // Bind an error handler to trigger a callback and decrement the pending count.
            tempImageObj.on("error", function()
            {
                _invokeHook("onImageError", targetElement);
                _decrementPending();
            });

            // Flag to ensure the load event callback is properly deferred.
            var isLoadedFlag = false;
            // Bind a one-time load handler to the temporary image.
            tempImageObj.one("load", function()
            {
                var retryLoader = function()
                {
                    // If the image hasn't truly loaded yet, re-check after a short delay.
                    if (!isLoadedFlag) {
                        return setTimeout(retryLoader, 10);
                    }

                    // Temporarily hide the element before updating its source.
                    targetElement.hide();

                    // Apply the loaded image source to the target element.
                    if (targetTag === "img") {
                        targetElement.attr("src", tempImageObj.attr("src"));
                    } else {
                        targetElement.css("background-image", "url(" + tempImageObj.attr("src") + ")");
                    }

                    // Reveal the element with the configured visual effect.
                    targetElement[optionsAccessor("displayEffect")](optionsAccessor("effectDuration"));

                    // Optionally remove the data attributes from the element.
                    if (optionsAccessor("clearAttributes")) {
                        targetElement.removeAttr(optionsAccessor("sourceAttr") + " " + optionsAccessor("highDPIAttr"));
                    }

                    // Invoke the 'onAfterLoad' callback.
                    _invokeHook("onAfterLoad", targetElement);

                    // Clean up: unbind error, remove the temporary image object.
                    tempImageObj.off("error").remove();

                    // Decrement the pending count and potentially trigger the 'onAllCompleted' event.
                    _decrementPending();
                };

                retryLoader(); // Initiate the deferred loading process.
            });

            // Invoke the 'onBeforeLoad' callback before setting the source.
            _invokeHook("onBeforeLoad", targetElement);

            // Set the `src` of the temporary image, choosing high-DPI source if available and applicable.
            tempImageObj.attr("src", targetElement.attr(optionsAccessor(_isHighDPI && targetElement.attr(optionsAccessor("highDPIAttr")) ? "highDPIAttr" : "sourceAttr")));

            // Invoke the 'onImageLoad' callback.
            _invokeHook("onImageLoad", targetElement);
            isLoadedFlag = true;

            // If the image was already cached by the browser, manually trigger its load event.
            if (tempImageObj.get(0).complete) {
                tempImageObj.load();
            }
        }


        /**
         * Determines if a given element is currently within the viewport, considering a defined margin.
         * @private
         * @param {Object} targetElement - The raw DOM element to check.
         * @returns {boolean} - True if the element is in the loadable area, false otherwise.
         */
        function _isWithinViewBounds(targetElement)
        {
            var elementDimensions = targetElement.getBoundingClientRect(),
                marginValue = optionsAccessor("viewMargin"),
                isVerticalVisible = // Check if the element is visible from the top edge of the viewport.
                                    ((_getCurrentViewportHeight() + marginValue) > elementDimensions.top) &&
                                    // Check if the element is visible from the bottom edge of the viewport.
                                    (-marginValue < elementDimensions.bottom),
                isHorizontalVisible = // Check if the element is visible from the left edge of the viewport.
                                      ((_getCurrentViewportWidth() + marginValue) > elementDimensions.left) &&
                                      // Check if the element is visible from the right edge of the viewport.
                                      (-marginValue < elementDimensions.right);

            // Apply direction-specific checks if configured.
            if (optionsAccessor("scrollAxis") === "vertical") {
                return isVerticalVisible;
            } else if (optionsAccessor("scrollAxis") === "horizontal") {
                return isHorizontalVisible;
            }

            // Default: element must be visible both vertically and horizontally.
            return isVerticalVisible && isHorizontalVisible;
        }


        /**
         * Retrieves the current width of the browser's viewport, utilizing a cached value if available.
         * @private
         * @returns {number} The current viewport width.
         */
        function _getCurrentViewportWidth()
        {
            return _viewportWidthCache = _determineViewportDimension(_viewportWidthCache, "Width");
        }


        /**
         * Retrieves the current height of the browser's viewport, utilizing a cached value if available.
         * @private
         * @returns {number} The current viewport height.
         */
        function _getCurrentViewportHeight()
        {
            return _viewportHeightCache = _determineViewportDimension(_viewportHeightCache, "Height");
        }


        /**
         * Calculates the viewport dimension (width or height), using a cached value if valid,
         * or falling back to various browser properties and a configured default.
         * @private
         * @param {number} cachedValue   - The previously cached dimension value.
         * @param {string} dimensionType - "Width" or "Height" to specify the dimension to retrieve.
         * @returns {number} The determined viewport dimension.
         */
        function _determineViewportDimension(cachedValue, dimensionType)
        {
            if (cachedValue >= 0) {
                return cachedValue;
            }

            return glob["inner" + dimensionType] ||
                   (docElem.documentElement || docElem.body)["client" + dimensionType] ||
                   docElem.body["offset" + dimensionType] ||
                   optionsAccessor("default" + dimensionType);
        }


        /**
         * Creates a rate-limited version of a function, preventing it from being called too frequently.
         * @private
         * @param {number}   delayMs    - The minimum time (in milliseconds) between successive calls.
         * @param {Function} actionFunc - The function to be rate-limited.
         * @returns {Function} The rate-limited function.
         */
        function _rateLimit(delayMs, actionFunc)
        {
            var timerId, lastRunTime = 0;

            return function(eventObj, bypassLimit)
            {
                var timePassed = +new Date() - lastRunTime;

                function executeNow()
                {
                    lastRunTime = +new Date();
                    actionFunc.call(unDef, eventObj);
                }

                timerId && clearTimeout(timerId);

                // Execute immediately if enough time has passed, throttling is disabled, or bypassing is requested.
                if (timePassed > delayMs || !optionsAccessor("useRateLimiting") || bypassLimit) {
                    executeNow();
                }
                // Otherwise, schedule the execution.
                else {
                    timerId = setTimeout(executeNow, delayMs - timePassed);
                }
            };
        }


        /**
         * Decrements the count of pending post-load events. If the count reaches zero and no
         * visual elements remain, the 'onAllCompleted' callback is triggered.
         * @private
         * @returns {void}
         */
        function _decrementPending()
        {
            --_pendingCompletionCount;

            // If no items are left and no tasks are awaiting completion, trigger the final callback.
            if (!visualElements.length && !_pendingCompletionCount) {
                _invokeHook("onAllCompleted", null);
            }
        }


        /**
         * A unified method for triggering plugin callbacks (hooks).
         * @private
         * @param {string|Function} hookName    - The name of the callback option to retrieve, or the callback function itself.
         * @param {Object}          [targetElement] - The element associated with the callback, if applicable.
         * @returns {void}
         */
        function _invokeHook(hookName, targetElement)
        {
            if (hookName = optionsAccessor(hookName)) // Assign and check if a callback function exists
            {
                if (targetElement) {
                    _enqueueTask(function() { hookName(targetElement); }, pluginRef);
                } else {
                    _enqueueTask(hookName, pluginRef);
                }
            }
        }


        /**
         * Schedules the next execution cycle for the task queue.
         * @private
         * @returns {void}
         */
        function _scheduleNextTask()
        {
            _taskScheduler = setTimeout(function()
            {
                _enqueueTask(); // Process the next item in the queue.
                if (_taskQueue.length) {
                    _scheduleNextTask(); // Schedule the subsequent task if more are pending.
                }
            }, 2); // Short delay to allow browser to render.
        }


        /**
         * Adds a new function (task) to the execution queue.
         * @private
         * @param {Function} [actionFn]      - The function to add to the queue. If omitted, the next task in queue is executed.
         * @param {Object}   [execContext]   - The `this` context for the function call.
         * @param {boolean}  [isPrimaryJob]  - Flag indicating if this is the main visual loading task.
         * @returns {void}
         */
        function _enqueueTask(actionFn, execContext, isPrimaryJob)
        {
            if (actionFn)
            {
                // If queueing is disabled, execute the function immediately.
                if (!optionsAccessor("allowQueueing"))
                {
                    actionFn.call(execContext || glob);
                    return;
                }

                // Ensure the primary visual loading task is only added once to the queue at a time.
                if (!isPrimaryJob || !_queueHasPrimaryJob)
                {
                    _taskQueue.push([actionFn, execContext, isPrimaryJob]);
                    if (isPrimaryJob) {
                        _queueHasPrimaryJob = true;
                    }
                }

                // If this is the first item in the queue, start the scheduler.
                if (_taskQueue.length === 1) {
                    _scheduleNextTask();
                }
                return;
            }

            // If no function is provided, dequeue and execute the next task.
            if (actionFn = _taskQueue.shift())
            {
                if (actionFn[2]) {
                    _queueHasPrimaryJob = false; // Reset primary job flag after execution.
                }
                actionFn[0].call(actionFn[1] || glob);
            }
        }

        // --- Initialization Block ---
        (function()
        {
            // If an error callback is configured, attach it to all visual elements.
            if (optionsAccessor("onImageError")) {
                for (var elemIdx = 0; elemIdx < visualElements.length; elemIdx++) {
                    _enqueueTask(function()
                    {
                        jq(this).on("error." + pluginRef.loaderName, function()
                        {
                            _invokeHook("onImageError", jq(this));
                        });
                    }, visualElements[elemIdx]);
                }
            }

            // If activation is event-driven, initialize immediately.
            if (optionsAccessor("activationMode") === "event") {
                _beginSetup();
            }
            // Otherwise, wait for the window's full load event before initializing.
            else {
                jq(glob).on("load", _beginSetup);
            }
        })();
    }


    /**
     * Constructor for the main ImageLoaderCore plugin class.
     * @constructor
     * @private
     * @param {Object} targetSet     - The jQuery collection of elements to manage.
     * @param {Object} initialSettings - User-provided settings to override defaults.
     * @returns {Object|ImageLoaderCore} The plugin instance.
     */
    function ImageLoaderCore(targetSet, initialSettings)
    {
        // Merge default configuration with any custom user settings provided.
        if (initialSettings) {
            jq.extend(this.pluginOptions, initialSettings);
        }

        /**
         * Reference to this specific plugin instance.
         * @private
         * @type {ImageLoaderCore}
         */
        var _currentLoader = this,

        /**
         * The initial jQuery collection of elements targeted by this plugin.
         * @private
         * @type {Object}
         */
        _targetCollection = targetSet,

        /**
         * An object containing the dynamically generated event handler function,
         * allowing it to be referenced and unbound later.
         * @private
         * @type {Object}
         */
        _eventObject = { handlerFn: null },
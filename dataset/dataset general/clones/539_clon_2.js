(function ($, globalObject) {
    "use strict";

    // Constants defining the various relative positions of an element to its container's viewport.
    var REGION_HIDDEN = 0;
    var REGION_PARTIAL_TOP = 4;
    var REGION_OVERLAPPING = 2;
    var REGION_PARTIAL_BOTTOM = 1;
    var REGION_CONTAINING = 7;
    var REGION_HIGHER = -2;
    var REGION_LOWER = -1;

    // Core identification string for this module.
    var MODULE_ID = 'visiontrack';
    // Identifier for storing unique element IDs.
    var MODULE_ELEMENT_IDENTIFIER = MODULE_ID + '_element_id';

    // Custom event names used by the module.
    var EVT_SHOW = 'show.' + MODULE_ID;
    var EVT_HIDE = 'hide.' + MODULE_ID;
    var EVT_LOCATION_MODIFIED = 'locationmodified.' + MODULE_ID;
    var EVT_UPPER_BOUNDARY = 'upperboundary.' + MODULE_ID;
    var EVT_LOWER_BOUNDARY = 'lowerboundary.' + MODULE_ID;

    // Array containing all custom event names.
    var TRACKER_ALL_EVENTS = [EVT_SHOW, EVT_HIDE, EVT_LOCATION_MODIFIED, EVT_UPPER_BOUNDARY, EVT_LOWER_BOUNDARY];
    // Array containing only the base names of the custom events (without the namespace).
    var OBSERVABLE_ELEMENT_EVENTS = $.map(TRACKER_ALL_EVENTS, function (eventString) {
        return eventString.split('.').shift();
    });

    // Scroll direction constants.
    var VECTOR_DOWNWARD = 'downwards';
    var VECTOR_UPWARD = 'upwards';

    // Storage for all active Tracker instances.
    var activeTrackers = [];

    // Public interface for the jQuery plugin, accessible via `$.visiontrack`.
    var jqueryVisionTracker = $[MODULE_ID] = {
        intervalMs: 40, // Target approximately 25 frames per second
        REGION_HIGHER: REGION_HIGHER,
        REGION_LOWER: REGION_LOWER,
        REGION_HIDDEN: REGION_HIDDEN,
        REGION_PARTIAL_BOTTOM: REGION_PARTIAL_BOTTOM,
        REGION_OVERLAPPING: REGION_OVERLAPPING,
        REGION_PARTIAL_TOP: REGION_PARTIAL_TOP,
        REGION_CONTAINING: REGION_CONTAINING
    };

    // Default configuration for the plugin.
    var STANDARD_CONFIG = {
        container: globalObject, // The scrollable parent element.
        margin: null, // Offset margins for visibility.
        scrollCallback: null, // Function called on every scroll tick.
        onShow: null, // Event handler for element appearance.
        onHide: null, // Event handler for element disappearance.
        onLocationModified: null, // Event handler for position changes.
        onUpperBoundary: null, // Event handler for reaching top boundary.
        onLowerBoundary: null // Event handler for reaching bottom boundary.
    };

    /**
     * jQuery.visiontrack plugin entry point.
     * Implements an API for managing scroll-based visibility tracking.
     * (c) 2012, Takashi Mizohata - Adapted
     * MIT License
     */
    $.fn[MODULE_ID] = function () {
        var actionName;
        var settings;
        var extraArguments;

        // Determine if the first argument is a method name or options.
        if (typeof arguments[0] === 'string') {
            actionName = arguments[0];
            settings = $.extend({}, STANDARD_CONFIG, arguments[1] || {});
            extraArguments = Array.prototype.slice.call(arguments, 2);
        } else {
            actionName = 'initialize';
            settings = $.extend({}, STANDARD_CONFIG, arguments[0] || {});
            extraArguments = Array.prototype.slice.call(arguments, 1);
        }

        var $containerElement = $(settings.container);

        // Validate the container element.
        if ($containerElement.length === 0 || $containerElement.length > 1) {
            throw new Error('Container must be a single DOM object.');
        }
        if ($containerElement[0] === document) {
            throw new Error('Container should not be `document`. Use `window` or a block-level element instead.');
        }

        // Retrieve or create a Tracker instance for the container.
        var trackerInstance = $containerElement.data('tracker');
        if (trackerInstance === undefined) {
            trackerInstance = new Tracker($containerElement[0]);
            $containerElement.data('tracker', trackerInstance);
        }
        trackerInstance.setScrollCallback(settings.scrollCallback);

        // Define available actions (methods) for the plugin.
        var availableActions = {
            initialize: function (indexVal, domElement) {
                var observableItem = $(domElement).data(MODULE_ID);
                if (observableItem) {
                    attachObservableItemEvents(domElement, settings);
                    if (settings.margin) {
                        observableItem.setBoundaryMargin(settings.margin);
                    } else {
                        observableItem.updateStatus();
                    }
                } else {
                    trackerInstance.addItem(domElement, settings);
                }
                return this;
            },
            recalculate: function (indexVal, domElement) {
                var observableItem = $(domElement).data(MODULE_ID);
                if (observableItem) {
                    if (settings.margin) {
                        observableItem.setBoundaryMargin(settings.margin);
                    }
                    observableItem.updateStatus();
                } else {
                    trackerInstance.addItem(domElement, settings);
                }
                return this;
            },
            terminate: function (indexVal, domElement) {
                var observableItem = $(domElement).data(MODULE_ID);
                if (observableItem) {
                    observableItem.dispose();
                }
                return this;
            },
            pause: function (indexVal, domElement) {
                var observableItem = $(domElement).data(MODULE_ID);
                if (observableItem) {
                    observableItem.haltEvents();
                }
                return this;
            }
        };

        // Execute the chosen action for each selected element.
        return this.each(availableActions[actionName]);
    };

    // =========================
    // Tracker Class Definition
    // =========================

    /**
     * @class Tracker
     * Manages scroll events and tracks multiple ObservableItem instances within a scrollable element.
     * @param {HTMLElement} hostElement - The scrollable DOM element.
     */
    var Tracker = function (hostElement) {
        var $hostElement = $(hostElement);
        this.hostElement = hostElement;
        this.trackedItems = [];
        this.scrollCallback = null;
        this.lastScrollTime = getCurrentTimestamp();
        this.lastScrollTop = $hostElement.scrollTop();
        this.deferredScrollHandle = false; // Timeout ID for deferred scroll processing.
        this.deferredScrollFunction = $.proxy(this._executeDeferredScroll, this);
        this.deferredScrollEvent = null;
        this.eventListenersMap = {}; // Tracks active event subscriptions.
        this.proxiedScrollHandler = $.proxy(this._handleScrollEvent, this);

        // Store this Tracker instance on the host element's data.
        $hostElement.data('tracker', this);
    };

    /**
     * Internal method to manage the binding/unbinding of scroll-related events on the host element.
     * @param {HTMLElement} domElement - The element to check/modify event bindings for.
     * @param {string} eventType - The specific event type being managed (e.g., 'scrolltick').
     * @param {boolean} isActive - True to activate, false to deactivate.
     * @param {boolean} isSelfEvent - True if the event is internal to the Tracker (like scrollCallback).
     * @private
     */
    Tracker.prototype._manageEventSubscription = function (domElement, eventType, isActive, isSelfEvent) {
        var $domElement = $(domElement);
        var elementIdentifier = getUniqueElementId($domElement);
        var boundEvents = $domElement.data('events'); // jQuery internal events cache.

        var subscriptionKey = [elementIdentifier, '/', eventType].join('');

        if (isSelfEvent) {
            if (isActive) {
                this.eventListenersMap[subscriptionKey] = true;
            } else {
                delete this.eventListenersMap[subscriptionKey];
            }
        } else {
            if (isActive) {
                this.eventListenersMap[subscriptionKey] = true;
            }
            // If deactivating, only remove if no other handlers for this eventType exist.
            else if (boundEvents === undefined || !boundEvents[eventType]) {
                delete this.eventListenersMap[subscriptionKey];
            }
        }

        // Check if there are any active listeners for any event type.
        var activeListeners = $.map(this.eventListenersMap, function () { return 1; });

        // Bind or unbind the core scroll/touchmove events based on listener presence.
        if (activeListeners.length) {
            if (boundEvents === undefined || !boundEvents.scroll) {
                $(this.hostElement).on('scroll touchmove', this.proxiedScrollHandler);
            }
        } else {
            if (boundEvents && boundEvents.scroll) {
                $(this.hostElement).off('scroll touchmove', this.proxiedScrollHandler);
            }
        }
    };

    /**
     * Sets the scroll callback function.
     * @param {Function} func - The function to call on scroll ticks.
     * @returns {Tracker} - The current Tracker instance.
     */
    Tracker.prototype.setScrollCallback = function (func) {
        if (typeof func === 'function') {
            this.scrollCallback = func;
            this._manageEventSubscription(this.hostElement, 'scrollCallback', true, true);
        }
        return this;
    };

    /**
     * Removes the scroll callback function.
     * @returns {Tracker} - The current Tracker instance.
     */
    Tracker.prototype.removeScrollCallback = function () {
        this.scrollCallback = null;
        this._manageEventSubscription(this.hostElement, 'scrollCallback', false, true);
        return this;
    };

    /**
     * Adds an ObservableItem to be tracked by this Tracker.
     * @param {HTMLElement} domElement - The element to track.
     * @param {Object} settings - Configuration for the ObservableItem.
     * @returns {Tracker} - The current Tracker instance.
     */
    Tracker.prototype.addItem = function (domElement, settings) {
        this.trackedItems.push(new ObservableItem(this, domElement, settings.margin));
        attachObservableItemEvents(domElement, settings);
        return this;
    };

    /**
     * Removes an ObservableItem from tracking.
     * @param {ObservableItem} observableItem - The ObservableItem instance to remove.
     * @returns {boolean} - True if removed, false otherwise.
     */
    Tracker.prototype.removeItem = function (observableItem) {
        var removalResult = false;
        var itemIndex = $.inArray(observableItem, this.trackedItems);
        if (itemIndex > -1) {
            removalResult = true;
            this.trackedItems.splice(itemIndex, 1);
        }
        return removalResult;
    };

    /**
     * Forces a refresh of all tracked items.
     * @returns {Tracker} - The current Tracker instance.
     */
    Tracker.prototype.recalculateAll = function () {
        // console.log('Tracker#recalculateAll');
        $.each(
            this.trackedItems,
            function (idx, observableItem) {
                observableItem.updateStatus();
            }
        );
        return this;
    };

    /**
     * Executes a deferred scroll processing, clearing any previous deferral.
     * @private
     */
    Tracker.prototype._executeDeferredScroll = function () {
        var deferredEvent = this.deferredScrollEvent;
        this.deferredScrollHandle = false;
        this.deferredScrollEvent = null;
        this._processScrollInternal(deferredEvent, true); // Mark as deferred processing.
    };

    /**
     * Handles the raw scroll event, debouncing it.
     * @param {Event} eventObject - The original scroll event.
     * @private
     */
    Tracker.prototype._handleScrollEvent = function (eventObject) {
        var currentTime = getCurrentTimestamp();

        // If enough time has passed, process immediately.
        if (currentTime - this.lastScrollTime > jqueryVisionTracker.intervalMs) {
            this.lastScrollTime = currentTime;
            this._processScrollInternal(eventObject);
            return;
        }

        // Otherwise, debounce: clear existing timeout and set a new one.
        if (this.deferredScrollHandle) {
            clearTimeout(this.deferredScrollHandle);
        }
        this.deferredScrollHandle = setTimeout(this.deferredScrollFunction, jqueryVisionTracker.intervalMs * 1.25);
        this.deferredScrollEvent = eventObject; // Store event for deferred processing.
    };

    /**
     * Internal implementation for processing scroll events.
     * @param {Event} eventObject - The scroll event.
     * @param {boolean} isDeferred - True if this is a deferred scroll event.
     * @private
     */
    Tracker.prototype._processScrollInternal = function (eventObject, isDeferred) {
        var scrollData;
        var $hostElement = $(this.hostElement);
        var currentScrollTop = $hostElement.scrollTop();
        var scrollDelta = currentScrollTop - this.lastScrollTop;

        // If deferred and no scroll movement, exit.
        if (isDeferred && scrollDelta === 0) {
            return;
        }

        // Prepare scroll data payload for events.
        scrollData = eventObject[MODULE_ID] = {
            direction: ((scrollDelta >= 0) ? VECTOR_DOWNWARD : VECTOR_UPWARD),
            delta: scrollDelta
        };
        this.lastScrollTop = currentScrollTop;

        // Call the custom scroll callback if provided.
        if (this.scrollCallback) {
            this.scrollCallback(eventObject);
        }

        // Find changed items and dispatch events.
        $.each($.map(this.trackedItems, createChangeDetector(this.hostElement, scrollDelta)), createEventDispatcher(scrollData));
    };

    // =============================================
    // ObservableItem Class Definition
    // =============================================

    /**
     * @class ObservableItem
     * Represents an element whose visibility and position are being tracked.
     * @param {Tracker} parentTracker - The Tracker instance managing this item.
     * @param {HTMLElement} observedElement - The DOM element being observed.
     * @param {Object} boundaryMargin - Margin configuration for visibility.
     */
    var ObservableItem = function (parentTracker, observedElement, boundaryMargin) {
        this.observedElement = observedElement;
        this.parentTracker = parentTracker;
        this.setBoundaryMargin(boundaryMargin);
        // Store this ObservableItem instance on the observed element's data.
        $(observedElement).data(MODULE_ID, this);
    };

    /**
     * Cleans up the ObservableItem, removing it from the Tracker and its element's data.
     */
    ObservableItem.prototype.dispose = function () {
        var elementData = $(this.observedElement).data();
        this.haltEvents();
        this.parentTracker.removeItem(this);
        this.observedElement = null;
        this.parentTracker = null;
        delete elementData[MODULE_ID];
        delete elementData[MODULE_ELEMENT_IDENTIFIER];
    };

    /**
     * Stops all custom event listeners on the observed element.
     * @returns {ObservableItem} - The current ObservableItem instance.
     */
    ObservableItem.prototype.haltEvents = function () {
        var $observedElement = $(this.observedElement);
        $.each(
            TRACKER_ALL_EVENTS,
            function (idx, eventName) {
                $observedElement.off(eventName);
            }
        );
        return this;
    };

    /**
     * Recalculates the observed element's position and visibility status.
     * @returns {ObservableItem} - The current ObservableItem instance.
     */
    ObservableItem.prototype.updateStatus = function () {
        var topBottomBounds = getAbsoluteBounds(this.parentTracker.hostElement, this.observedElement, this.marginTop, this.marginBottom);
        var currentPosition = determineRelativePosition(this.parentTracker.hostElement, topBottomBounds.top, topBottomBounds.bottom);

        this.upperBoundary = topBottomBounds.top;
        this.lowerBoundary = topBottomBounds.bottom;
        this.relativePosition = currentPosition;
        this.isVisible = (currentPosition > REGION_HIDDEN);
        return this;
    };

    /**
     * Sets new offset margins for the observed element and updates its status.
     * @param {Object} marginConfig - Configuration object for top and bottom margins.
     * @returns {ObservableItem} - The current ObservableItem instance.
     */
    ObservableItem.prototype.setBoundaryMargin = function (marginConfig) {
        var processedMargin = getParsedMargin(marginConfig);
        var calculatedBounds = getAbsoluteBounds(this.parentTracker.hostElement, this.observedElement, processedMargin.top, processedMargin.bottom);
        var newRelativePosition = determineRelativePosition(this.parentTracker.hostElement, calculatedBounds.top, calculatedBounds.bottom);

        this.marginTop = processedMargin.top;
        this.marginBottom = processedMargin.bottom;
        this.upperBoundary = calculatedBounds.top;
        this.lowerBoundary = calculatedBounds.bottom;
        this.relativePosition = newRelativePosition;
        this.isVisible = (newRelativePosition > REGION_HIDDEN);

        return this;
    };

    // =========================
    // Helper Functions
    // =========================

    /**
     * Generates or retrieves a unique ID for a jQuery element.
     * This function has side effects (modifies element data).
     * @param {jQuery} $element - The jQuery wrapped element.
     * @returns {string} - The unique element identifier.
     */
    var getUniqueElementId = function ($element) {
        var elementId = $element.data(MODULE_ELEMENT_IDENTIFIER);
        if (!elementId) {
            elementId = 'vt_' + getCurrentTimestamp();
            $element.data(MODULE_ELEMENT_IDENTIFIER, elementId);
        }
        return elementId;
    };

    /**
     * Binds custom event handlers to an observed element based on provided options.
     * This function has side effects (modifies element event bindings).
     * @param {HTMLElement} domElement - The raw DOM element.
     * @param {Object} eventHandlers - Object containing event handler functions.
     */
    var attachObservableItemEvents = function (domElement, eventHandlers) {
        var $domElement = $(domElement);
        $.each(
            OBSERVABLE_ELEMENT_EVENTS,
            function (idx) {
                // 'this' refers to the event name string here.
                if (typeof eventHandlers[this] === 'function') {
                    $domElement.on([this, MODULE_ID].join('.'), eventHandlers[this]);
                }
            }
        );
    };

    // =========================
    // Utility Functions
    // =========================

    /**
     * Parses various input types into a standardized top/bottom margin object.
     * @param {*} inputValue - The input value, can be number, string, array, or object.
     * @returns {{top: number, bottom: number}} - Object with numeric top and bottom margins.
     */
    var getParsedMargin = function (inputValue) {
        var topMargin, bottomMargin;
        var valueType = typeof (inputValue);

        if (valueType === 'number') {
            topMargin = bottomMargin = inputValue;
        } else if (valueType === 'string') {
            topMargin = bottomMargin = parseIntegerSafe(inputValue);
        } else if (valueType === 'undefined' || valueType === 'function') {
            topMargin = bottomMargin = 0;
        } else if (valueType === 'boolean') {
            topMargin = bottomMargin = (inputValue ? 1 : 0);
        } else {
            if (inputValue === null) {
                topMargin = bottomMargin = 0;
            } else if (Object.prototype.toString.apply(inputValue) === '[object Array]') {
                topMargin = parseIntegerSafe(inputValue[0]);
                bottomMargin = parseIntegerSafe(inputValue[1]);
            } else {
                topMargin = parseIntegerSafe(inputValue.top);
                bottomMargin = parseIntegerSafe(inputValue.bottom);
            }
        }
        return { top: topMargin, bottom: bottomMargin };
    };

    /**
     * Safely parses an integer from a value, returning a default if parsing fails.
     * @param {*} inputVal - Value to parse.
     * @param {number} [defaultValue=0] - Default value if parsing fails.
     * @param {number} [radixBase=10] - Radix for parseInt.
     * @returns {number} - The parsed integer or default value.
     */
    var parseIntegerSafe = function (inputVal, defaultValue, radixBase) {
        var parsedResult;
        radixBase = radixBase || 10;
        defaultValue = defaultValue || 0;
        parsedResult = parseInt(inputVal, radixBase);
        if (isNaN(parsedResult)) {
            parsedResult = defaultValue;
        }
        return parsedResult;
    };

    /**
     * Calculates the absolute top and bottom coordinates of an item element relative to its container.
     * @param {HTMLElement} containerElement - The scrollable parent element.
     * @param {HTMLElement} itemElement - The observed item element.
     * @param {number} topOffset - Additional top margin.
     * @param {number} bottomOffset - Additional bottom margin.
     * @returns {{top: number, bottom: number}} - Object with calculated top and bottom coordinates.
     */
    var getAbsoluteBounds = function (containerElement, itemElement, topOffset, bottomOffset) {
        var containerScrollTop = 0;
        var $itemElement = $(itemElement);
        var boundaryInfo;

        if (containerElement !== globalObject) {
            containerScrollTop = $(containerElement).offset().top;
        }

        boundaryInfo = { top: Math.round($itemElement.offset().top - containerScrollTop + topOffset) };
        boundaryInfo.bottom = boundaryInfo.top + Math.round($itemElement.outerHeight(true) + bottomOffset);
        return boundaryInfo;
    };

    /**
     * Returns the current timestamp in milliseconds.
     * @returns {number} - Current timestamp.
     */
    var getCurrentTimestamp = function () {
        return (new Date()).valueOf();
    };

    /**
     * Determines the relative position of an item within its container's viewport.
     * @param {HTMLElement} containerElement - The scrollable parent element.
     * @param {number} itemTop - The absolute top coordinate of the item.
     * @param {number} itemBottom - The absolute bottom coordinate of the item.
     * @returns {number} - A constant representing the relative position (e.g., REGION_HIDDEN).
     */
    var determineRelativePosition = function (containerElement, itemTop, itemBottom) {
        var calculatedPosition = REGION_HIDDEN;
        var $container = $(containerElement);
        var containerScrollTop = $container.scrollTop();
        var containerBottom = containerScrollTop + $container.height();

        if (itemBottom <= containerScrollTop) {
            // Item is entirely above the viewport.
            calculatedPosition = REGION_HIGHER;
        } else if (containerBottom <= itemTop) {
            // Item is entirely below the viewport.
            calculatedPosition = REGION_LOWER;
        } else {
            if (itemTop <= containerScrollTop) {
                if (containerBottom <= itemBottom) {
                    // Item is larger than and completely contains the viewport.
                    calculatedPosition = REGION_CONTAINING;
                } else if (itemBottom <= containerBottom) {
                    // Item's top is clipped, but its bottom is visible.
                    calculatedPosition = REGION_PARTIAL_TOP;
                }
            } else if (containerScrollTop <= itemTop) {
                if (itemBottom <= containerBottom) {
                    // Item is fully contained within the viewport.
                    calculatedPosition = REGION_OVERLAPPING;
                } else if (itemBottom > containerBottom) {
                    // Item's bottom is clipped, but its top is visible.
                    calculatedPosition = REGION_PARTIAL_BOTTOM;
                }
            }
        }
        return calculatedPosition;
    };

    /**
     * Creates a function that dispatches custom events for an observable item.
     * @param {Object} currentScrollData - Data about the current scroll event.
     * @returns {Function} - A function to be used with $.each for dispatching events.
     */
    var createEventDispatcher = function (currentScrollData) {
        return function (idx, mappedItem) {
            var eventAppearanceDisappearance; // For show/hide events.
            var eventBoundaryReached; // For top/bottom reached events.
            var eventPositionChange = $.Event(EVT_LOCATION_MODIFIED);
            var observableItem = mappedItem.observable;
            var $observedElement = $(observableItem.observedElement);
            var eventPayload = $.extend({}, currentScrollData); // Clone scroll data for each event.

            eventPayload.position = observableItem.relativePosition;
            eventPositionChange[MODULE_ID] = eventPayload;
            $observedElement.triggerHandler(eventPositionChange);

            if (mappedItem.eventTopReached) {
                eventBoundaryReached = $.Event(EVT_UPPER_BOUNDARY);
                eventBoundaryReached[MODULE_ID] = eventPayload;
                $observedElement.triggerHandler(eventBoundaryReached);
            }
            if (mappedItem.eventBottomReached) {
                eventBoundaryReached = $.Event(EVT_LOWER_BOUNDARY);
                eventBoundaryReached[MODULE_ID] = eventPayload;
                $observedElement.triggerHandler(eventBoundaryReached);
            }
            if (mappedItem.eventAppearDisappear) {
                if (observableItem.isVisible) {
                    eventAppearanceDisappearance = $.Event(EVT_SHOW);
                } else {
                    eventAppearanceDisappearance = $.Event(EVT_HIDE);
                }
                eventAppearanceDisappearance[MODULE_ID] = eventPayload;
                $observedElement.triggerHandler(eventAppearanceDisappearance);
            }
        };
    };

    /**
     * Creates a function that detects changes in an observable item's position and flags relevant events.
     * @param {HTMLElement} containerRef - Reference to the scrollable container.
     * @param {number} scrollMovement - The scroll delta (positive for down, negative for up).
     * @returns {Function} - A function to be used with $.map for detecting changes.
     */
    var createChangeDetector = function (containerRef, scrollMovement) {
        return function (observable, idx) {
            var changeDetails;
            var newPosition = determineRelativePosition(containerRef, observable.upperBoundary, observable.lowerBoundary);
            var oldPosition = observable.relativePosition;

            // Only proceed if the position has actually changed.
            if (oldPosition !== newPosition) {
                changeDetails = { observable: observable };

                // Logic for detecting top/bottom boundary reached events.
                if (scrollMovement > 0) { // Scrolling downwards
                    if ((oldPosition === REGION_LOWER || oldPosition === REGION_PARTIAL_BOTTOM || oldPosition === REGION_OVERLAPPING) &&
                        (newPosition === REGION_HIGHER || newPosition === REGION_PARTIAL_TOP || newPosition === REGION_CONTAINING)) {
                        changeDetails.eventTopReached = true;
                    }
                    if ((REGION_PARTIAL_BOTTOM < newPosition && newPosition < REGION_CONTAINING) &&
                        (oldPosition === REGION_LOWER || oldPosition === REGION_PARTIAL_BOTTOM || oldPosition === REGION_CONTAINING)) {
                        changeDetails.eventBottomReached = true;
                    }
                }
                // (The original code had an incomplete 'if' statement here, I will replicate its structure but not add new logic)
            }
            return changeDetails;
        };
    };
})(jQuery, window);
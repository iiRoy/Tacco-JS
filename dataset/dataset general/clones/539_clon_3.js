(function ($, globalWindow) {
  "use strict"; // Enforce strict mode for cleaner code and error handling

  // --- Viewport State Constants ---
  const VP_STATE_HIDDEN = 0;           // Element is entirely outside the viewport
  const VP_STATE_PARTIAL_TOP = 4;      // Element's top part is clipped by viewport top
  const VP_STATE_FULLY_VISIBLE = 2;    // Element is fully contained within the viewport
  const VP_STATE_PARTIAL_BOTTOM = 1;   // Element's bottom part is clipped by viewport bottom
  const VP_STATE_ENCOMPASSING = 7;     // Element is larger than and completely contains the viewport
  const VP_STATE_ABOVE_VP = -2;        // Element is entirely above the viewport
  const VP_STATE_BELOW_VP = -1;        // Element is entirely below the viewport

  // --- Naming and Event Constants ---
  const PLUGIN_NAMESPACE = 'viewportMonitor';
  const ELEMENT_ID_ATTR = PLUGIN_NAMESPACE + '_uniqueId';

  const EVENT_ENTERED_VIEW = 'enteredView.' + PLUGIN_NAMESPACE;
  const EVENT_EXITED_VIEW = 'exitedView.' + PLUGIN_NAMESPACE;
  const EVENT_STATUS_CHANGED = 'viewStatusChange.' + PLUGIN_NAMESPACE;
  const EVENT_TOP_REACHED = 'topBoundaryHit.' + PLUGIN_NAMESPACE;
  const EVENT_BOTTOM_REACHED = 'bottomBoundaryHit.' + PLUGIN_NAMESPACE;

  const ALL_MONITOR_EVENTS = [
    EVENT_ENTERED_VIEW,
    EVENT_EXITED_VIEW,
    EVENT_STATUS_CHANGED,
    EVENT_TOP_REACHED,
    EVENT_BOTTOM_REACHED
  ];

  // Extract base event names for user-defined callbacks
  const MONITOR_CALLBACK_NAMES = ALL_MONITOR_EVENTS.map(eventStr => eventStr.split('.').shift());

  // --- Scroll Direction Constants ---
  const SCROLL_DIRECTION_DOWN = 'down';
  const SCROLL_DIRECTION_UP = 'up';

  // --- Global State and Plugin Exposure ---
  // A collection to keep track of all active scroll activity managers (Scroller instances).
  // Although not explicitly used for iteration in the original snippet, it's a common pattern.
  const activeMonitorManagers = [];

  // Expose core constants and configuration via jQuery namespace
  const jqueryViewportMonitor = $[PLUGIN_NAMESPACE] = {
    // Minimum interval between scroll processing, in milliseconds (approx 30 FPS)
    processingInterval: 34,
    // Expose viewport state constants for external use
    VP_STATE_ABOVE_VP: VP_STATE_ABOVE_VP,
    VP_STATE_BELOW_VP: VP_STATE_BELOW_VP,
    VP_STATE_HIDDEN: VP_STATE_HIDDEN,
    VP_STATE_PARTIAL_BOTTOM: VP_STATE_PARTIAL_BOTTOM,
    VP_STATE_FULLY_VISIBLE: VP_STATE_FULLY_VISIBLE,
    VP_STATE_PARTIAL_TOP: VP_STATE_PARTIAL_TOP,
    VP_STATE_ENCOMPASSING: VP_STATE_ENCOMPASSING
  };

  // --- Default Configuration for Monitored Elements ---
  const MONITOR_DEFAULTS = {
    containerElement: globalWindow, // The scrollable parent element (default: window)
    offsetThresholds: null,        // Custom offset for appearance/disappearance
    scrollActivityCallback: null,  // Callback for every scroll tick
    enteredView: null,             // Callback when element enters view
    exitedView: null,              // Callback when element leaves view
    viewStatusChange: null,        // Callback on any view status change
    topBoundaryHit: null,          // Callback when top boundary is crossed
    bottomBoundaryHit: null        // Callback when bottom boundary is crossed
  };

  // --- Main jQuery Plugin Entry Point ---
  // Attaches the viewport monitoring functionality to selected elements.
  $.fn[PLUGIN_NAMESPACE] = function (...inputArgs) {
    let operationMethod;
    let operationSettings;
    let methodArguments;

    // Determine the method and settings based on input arguments
    if (typeof inputArgs[0] === 'string') {
      operationMethod = inputArgs[0];
      operationSettings = $.extend({}, MONITOR_DEFAULTS, inputArgs[1] || {});
      methodArguments = inputArgs.slice(2);
    } else {
      operationMethod = 'initialize'; // Default method
      operationSettings = $.extend({}, MONITOR_DEFAULTS, inputArgs[0] || {});
      methodArguments = inputArgs.slice(1);
    }

    // Input validation for the scrollable container element
    const containerNode = $(operationSettings.containerElement);
    if (containerNode.length === 0 || containerNode.length > 1) {
      throw new Error('The "containerElement" option must refer to a single DOM element.');
    }
    if (containerNode[0] === document) {
      throw new Error('The "containerElement" should not be `document`. Please use `window` or a block-level element that scrolls.');
    }

    // Retrieve or create the scroll activity manager for this container
    let scrollManager = containerNode.data('scrollManagerInstance');
    if (scrollManager === undefined) {
      scrollManager = new ScrollActivityManager(containerNode[0]);
      containerNode.data('scrollManagerInstance', scrollManager); // Store instance on the container
    }
    // Apply any custom scroll tick callback
    if (typeof operationSettings.scrollActivityCallback === 'function') {
      scrollManager.setScrollTickCallback(operationSettings.scrollActivityCallback);
    } else {
      // If a function was previously set but now isn't, remove it.
      scrollManager.removeScrollTickCallback();
    }

    // Define the available operations for monitored elements
    const elementOperations = {
      initialize: function (index, targetDomElement) {
        let monitoredItem = $(targetDomElement).data(PLUGIN_NAMESPACE);
        if (monitoredItem) {
          // If already monitored, update its settings and refresh
          attachElementSpecificHandlers(targetDomElement, operationSettings);
          if (operationSettings.offsetThresholds) {
            monitoredItem.updateOffset(operationSettings.offsetThresholds);
          } else {
            monitoredItem.recalculatePosition();
          }
        } else {
          // If new, add it to the manager
          scrollManager.addElement(targetDomElement, operationSettings);
        }
        return this; // Allow chaining
      },
      recalculate: function (index, targetDomElement) {
        let monitoredItem = $(targetDomElement).data(PLUGIN_NAMESPACE);
        if (monitoredItem) {
          if (operationSettings.offsetThresholds) {
            monitoredItem.updateOffset(operationSettings.offsetThresholds);
          }
          monitoredItem.recalculatePosition();
        } else {
          // If not yet monitored, initialize it
          scrollManager.addElement(targetDomElement, operationSettings);
        }
        return this;
      },
      release: function (index, targetDomElement) {
        let monitoredItem = $(targetDomElement).data(PLUGIN_NAMESPACE);
        if (monitoredItem) {
          monitoredItem.dispose();
        }
        return this;
      },
      pauseMonitoring: function (index, targetDomElement) {
        let monitoredItem = $(targetDomElement).data(PLUGIN_NAMESPACE);
        if (monitoredItem) {
          monitoredItem.suspendEvents();
        }
        return this;
      }
    };

    // Ensure the requested method exists
    if (!elementOperations[operationMethod]) {
      throw new Error(`Method "${operationMethod}" does not exist for ${PLUGIN_NAMESPACE}.`);
    }

    // Apply the chosen operation to each selected element
    return this.each(elementOperations[operationMethod]);
  };

  // ====================================================================
  // --- ScrollActivityManager Class: Manages scrolling for a single container ---
  // ====================================================================

  /**
   * Manages scroll events and monitored elements within a specific scrollable container.
   * @param {HTMLElement} containerNode - The DOM element that is scrollable (e.g., div, window).
   */
  const ScrollActivityManager = function (containerNode) {
    this.containerElement = containerNode;
    this.$container = $(containerNode); // Cache jQuery object
    this.monitoredElements = []; // List of ScrollMonitoredElement instances
    this.scrollTickCallback = null; // User-defined callback on scroll
    this.lastScrollTimestamp = getCurrentTimestamp();
    this.lastScrollYPosition = this.$container.scrollTop();
    this.debounceTimer = null; // Timer for scroll event debouncing
    this.delayedExecutionHandler = $.proxy(this._executeBufferedScroll, this);
    this.bufferedScrollEvent = null; // Stores the last scroll event during debounce
    this.activeEventBindings = new Set(); // Tracks active event types for this manager
    this.proxiedScrollHandler = $.proxy(this._handleScrollEvent, this);

    // Store this instance on the container element for retrieval
    this.$container.data('scrollManagerInstance', this);
    // For global tracking, if needed
    activeMonitorManagers.push(this);
  };

  /**
   * Manages the binding/unbinding of native scroll events on the container.
   * Ensures events are only bound when necessary.
   * @param {string} eventTypeName - The type of event being hooked (e.g., 'scrollTick').
   * @param {boolean} shouldActivate - True to add, false to remove.
   */
  ScrollActivityManager.prototype._manageNativeScrollBinding = function (eventTypeName, shouldActivate) {
    const containerId = retrieveElementIdentifier(this.$container);
    const eventKey = `${containerId}/${eventTypeName}`;

    if (shouldActivate) {
      this.activeEventBindings.add(eventKey);
    } else {
      this.activeEventBindings.delete(eventKey);
    }

    // Check if there are any active listeners that require native scroll events
    const hasActiveListeners = this.activeEventBindings.size > 0;
    const currentEvents = this.$container.data('events');
    const isScrollBound = currentEvents && (currentEvents.scroll || currentEvents.touchmove);

    if (hasActiveListeners && !isScrollBound) {
      this.$container.on('scroll touchmove', this.proxiedScrollHandler);
    } else if (!hasActiveListeners && isScrollBound) {
      this.$container.off('scroll touchmove', this.proxiedScrollHandler);
    }
  };

  /**
   * Sets a custom callback to be executed on every scroll tick.
   * @param {Function} callbackFn - The function to call.
   * @returns {ScrollActivityManager} - For chaining.
   */
  ScrollActivityManager.prototype.setScrollTickCallback = function (callbackFn) {
    if (typeof callbackFn === 'function') {
      this.scrollTickCallback = callbackFn;
      this._manageNativeScrollBinding('scrollTick', true);
    }
    return this;
  };

  /**
   * Removes any previously set scroll tick callback.
   * @returns {ScrollActivityManager} - For chaining.
   */
  ScrollActivityManager.prototype.removeScrollTickCallback = function () {
    this.scrollTickCallback = null;
    this._manageNativeScrollBinding('scrollTick', false);
    return this;
  };

  /**
   * Adds a new element to be monitored for scroll position changes.
   * @param {HTMLElement} elementNode - The DOM element to monitor.
   * @param {object} settings - Configuration options for the element.
   * @returns {ScrollActivityManager} - For chaining.
   */
  ScrollActivityManager.prototype.addElement = function (elementNode, settings) {
    // Guard clause: prevent adding the same element multiple times
    const existingMonitor = $(elementNode).data(PLUGIN_NAMESPACE);
    if (existingMonitor) {
      // console.warn(`Attempted to add an already monitored element. Updating settings instead.`);
      existingMonitor.updateOffset(settings.offsetThresholds);
      existingMonitor.recalculatePosition();
      return this;
    }

    const newMonitor = new ScrollMonitoredElement(this, elementNode, settings.offsetThresholds);
    this.monitoredElements.push(newMonitor);
    attachElementSpecificHandlers(elementNode, settings);
    this._manageNativeScrollBinding('elementMonitor', true); // Indicate an element is being monitored
    return this;
  };

  /**
   * Removes a monitored element from this manager.
   * @param {ScrollMonitoredElement} monitorInstance - The instance to remove.
   * @returns {boolean} - True if successfully removed, false otherwise.
   */
  ScrollActivityManager.prototype.removeElement = function (monitorInstance) {
    const itemIndex = this.monitoredElements.indexOf(monitorInstance);
    let operationSuccess = false;
    if (itemIndex > -1) {
      this.monitoredElements.splice(itemIndex, 1);
      operationSuccess = true;
    }
    // If no more elements are monitored, potentially remove native scroll binding
    if (this.monitoredElements.length === 0) {
      this._manageNativeScrollBinding('elementMonitor', false);
    }
    return operationSuccess;
  };

  /**
   * Forces a recalculation of all monitored elements' positions.
   * @returns {ScrollActivityManager} - For chaining.
   */
  ScrollActivityManager.prototype.recalculateAll = function () {
    for (const monitoredItem of this.monitoredElements) {
      monitoredItem.recalculatePosition();
    }
    return this;
  };

  /**
   * Executes the buffered scroll event after a debounce period.
   * This is the function called by the debouncing `setTimeout`.
   */
  ScrollActivityManager.prototype._executeBufferedScroll = function () {
    const bufferedEvent = this.bufferedScrollEvent;
    this.debounceTimer = null; // Clear the timer ID
    this.bufferedScrollEvent = null; // Clear the buffered event
    this._processScroll(bufferedEvent, true); // Process as a tailing event
  };

  /**
   * Handles the native scroll event, applying debouncing logic.
   * @param {Event} nativeEvent - The native scroll event object.
   */
  ScrollActivityManager.prototype._handleScrollEvent = function (nativeEvent) {
    const currentTimestamp = getCurrentTimestamp();
    const minInterval = jqueryViewportMonitor.processingInterval;

    // If enough time has passed since the last processed scroll, process immediately
    if (currentTimestamp - this.lastScrollTimestamp > minInterval) {
      this.lastScrollTimestamp = currentTimestamp;
      this._processScroll(nativeEvent);
      // Clear any pending debounced events if we processed immediately
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
        this.bufferedScrollEvent = null;
      }
      return;
    }

    // Otherwise, debounce: clear existing timer and set a new one
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(this.delayedExecutionHandler, minInterval * 1.25);
    this.bufferedScrollEvent = nativeEvent; // Buffer the latest event
  };

  /**
   * Core scroll processing logic. Calculates scroll direction and dispatches events.
   * @param {Event} scrollEvent - The scroll event object.
   * @param {boolean} isDebouncedExecution - True if called from the debounce handler.
   */
  ScrollActivityManager.prototype._processScroll = function (scrollEvent, isDebouncedExecution = false) {
    const currentScrollTop = this.$container.scrollTop();
    const scrollDelta = currentScrollTop - this.lastScrollYPosition;

    // If this is a debounced execution and scroll position hasn't changed, do nothing
    if (isDebouncedExecution && scrollDelta === 0) {
      return;
    }

    // Create a custom event payload with scroll details
    const eventPayload = {};
    eventPayload.direction = (scrollDelta >= 0) ? SCROLL_DIRECTION_DOWN : SCROLL_DIRECTION_UP;
    eventPayload.delta = scrollDelta;

    // Update last known scroll position
    this.lastScrollYPosition = currentScrollTop;

    // Trigger the custom scroll tick callback if set
    if (this.scrollTickCallback) {
      this.scrollTickCallback(scrollEvent, eventPayload);
    }

    // Identify changed elements and dispatch their specific events
    const changes = this.monitoredElements.map(item => identifyStatusChanges(this.containerElement, scrollDelta, item));
    for (const processedItem of changes) {
      if (processedItem) { // Only process if there was a change
        triggerRelevantEvents(eventPayload, processedItem);
      }
    }
  };

  // ====================================================================
  // --- ScrollMonitoredElement Class: Represents a single element being watched ---
  // ====================================================================

  /**
   * Represents a single DOM element whose scroll position relative to a container is monitored.
   * @param {ScrollActivityManager} manager - The manager overseeing this element.
   * @param {HTMLElement} elementNode - The DOM element to monitor.
   * @param {object|number|string} [offsetConfig] - Configuration for offset thresholds.
   */
  const ScrollMonitoredElement = function (manager, elementNode, offsetConfig) {
    this.elementNode = elementNode;
    this.$element = $(elementNode); // Cache jQuery object
    this.scrollManager = manager;

    // Properties to store element's current state
    this.offsetTop = 0;       // Configured top offset
    this.offsetBottom = 0;    // Configured bottom offset
    this.elementTop = 0;      // Actual calculated top boundary
    this.elementBottom = 0;   // Actual calculated bottom boundary
    this.currentStatus = VP_STATE_HIDDEN; // Current viewport status (e.g., VP_STATE_ABOVE_VP, VP_STATE_FULLY_VISIBLE)
    this.isVisible = false;   // True if any part of the element is in view

    // Initialize offsets and calculate initial position
    this.updateOffset(offsetConfig);

    // Store this instance on the element for quick retrieval
    this.$element.data(PLUGIN_NAMESPACE, this);
  };

  /**
   * Cleans up all resources associated with this monitored element.
   */
  ScrollMonitoredElement.prototype.dispose = function () {
    if (!this.elementNode) return; // Already disposed

    this.suspendEvents(); // Unbind all custom events
    this.scrollManager.removeElement(this); // Remove from the manager's list

    // Clear data from the element
    const elementData = this.$element.data();
    this.$element.removeData(PLUGIN_NAMESPACE);
    this.$element.removeData(ELEMENT_ID_ATTR);

    // Nullify references to aid garbage collection
    this.elementNode = null;
    this.$element = null;
    this.scrollManager = null;
  };

  /**
   * Unbinds all custom `viewportMonitor` events from this element.
   * @returns {ScrollMonitoredElement} - For chaining.
   */
  ScrollMonitoredElement.prototype.suspendEvents = function () {
    if (!this.$element) return this;
    for (const eventName of ALL_MONITOR_EVENTS) {
      this.$element.off(eventName);
    }
    return this;
  };

  /**
   * Recalculates the element's position relative to its scrollable container
   * and updates its internal state.
   * @returns {ScrollMonitoredElement} - For chaining.
   */
  ScrollMonitoredElement.prototype.recalculatePosition = function () {
    if (!this.elementNode) return this; // Element already disposed

    const boundaries = calculateElementBoundaries(
      this.scrollManager.containerElement,
      this.elementNode,
      this.offsetTop,
      this.offsetBottom
    );
    const newStatus = determineViewportStatus(
      this.scrollManager.containerElement,
      boundaries.top,
      boundaries.bottom
    );

    this.elementTop = boundaries.top;
    this.elementBottom = boundaries.bottom;
    this.currentStatus = newStatus;
    this.isVisible = (newStatus > VP_STATE_HIDDEN); // Any status > 0 means some visibility
    return this;
  };

  /**
   * Updates the offset thresholds for the element and recalculates its position.
   * @param {object|number|string} offsetConfig - New offset configuration.
   * @returns {ScrollMonitoredElement} - For chaining.
   */
  ScrollMonitoredElement.prototype.updateOffset = function (offsetConfig) {
    if (!this.elementNode) return this; // Element already disposed

    const parsedOffsets = parseOffsetConfiguration(offsetConfig);
    this.offsetTop = parsedOffsets.top;
    this.offsetBottom = parsedOffsets.bottom;

    // Recalculate position immediately after offset update
    this.recalculatePosition();
    return this;
  };

  // ====================================================================
  // --- Global Helper Functions ---
  // ====================================================================

  /**
   * Retrieves or assigns a unique identifier to a jQuery element.
   * Has side effects: stores the ID on the element's data.
   * @param {jQuery} $element - The jQuery wrapped element.
   * @returns {string} - The unique identifier.
   */
  const retrieveElementIdentifier = function ($element) {
    let uniqueId = $element.data(ELEMENT_ID_ATTR);
    if (!uniqueId) {
      // Generate a simple unique ID using timestamp and random string
      uniqueId = 'vpm_' + getCurrentTimestamp() + '_' + Math.random().toString(36).substring(2, 9);
      $element.data(ELEMENT_ID_ATTR, uniqueId);
    }
    return uniqueId;
  };

  /**
   * Attaches user-defined event handlers (callbacks) to a monitored element.
   * @param {HTMLElement} targetElement - The DOM element to attach handlers to.
   * @param {object} settings - The options object containing callback functions.
   */
  const attachElementSpecificHandlers = function (targetElement, settings) {
    const $target = $(targetElement);
    for (const callbackName of MONITOR_CALLBACK_NAMES) {
      if (typeof settings[callbackName] === 'function') {
        $target.on(`${callbackName}.${PLUGIN_NAMESPACE}`, settings[callbackName]);
      }
    }
  };

  /**
   * Parses various offset configurations into a {top, bottom} object.
   * @param {*} offsetValue - The input offset value. Can be number, string, array, object.
   * @returns {{top: number, bottom: number}} - Parsed top and bottom offsets.
   */
  const parseOffsetConfiguration = function (offsetValue) {
    let topOffset = 0;
    let bottomOffset = 0;
    const valueType = typeof offsetValue;

    if (offsetValue === null || offsetValue === undefined || valueType === 'function') {
      // Default to zero
      topOffset = bottomOffset = 0;
    } else if (valueType === 'number') {
      topOffset = bottomOffset = offsetValue;
    } else if (valueType === 'string') {
      topOffset = bottomOffset = safeParseInt(offsetValue);
    } else if (valueType === 'boolean') {
      topOffset = bottomOffset = (offsetValue ? 1 : 0);
    } else if (Array.isArray(offsetValue)) {
      topOffset = safeParseInt(offsetValue[0]);
      bottomOffset = safeParseInt(offsetValue[1]);
    } else if (valueType === 'object' && offsetValue !== null) {
      topOffset = safeParseInt(offsetValue.top);
      bottomOffset = safeParseInt(offsetValue.bottom);
    } else {
      // Fallback for unrecognized types
      topOffset = bottomOffset = 0;
    }
    return { top: topOffset, bottom: bottomOffset };
  };

  /**
   * Safely parses an integer from a value, providing a default if parsing fails.
   * @param {*} value - The value to parse.
   * @param {number} [defaultValue=0] - The value to return if parsing fails.
   * @param {number} [radixBase=10] - The radix (base) for parsing.
   * @returns {number} - The parsed integer or the default value.
   */
  const safeParseInt = function (value, defaultValue = 0, radixBase = 10) {
    const parsedResult = parseInt(value, radixBase);
    return isNaN(parsedResult) ? defaultValue : parsedResult;
  };

  /**
   * Calculates the absolute top and bottom boundaries of an element relative to its scrollable container.
   * @param {HTMLElement} containerNode - The scrollable parent element.
   * @param {HTMLElement} elementNode - The element whose boundaries are to be calculated.
   * @param {number} offsetConfigTop - Custom top offset.
   * @param {number} offsetConfigBottom - Custom bottom offset.
   * @returns {{top: number, bottom: number}} - Object with calculated top and bottom.
   */
  const calculateElementBoundaries = function (containerNode, elementNode, offsetConfigTop, offsetConfigBottom) {
    const $element = $(elementNode);
    const $container = $(containerNode);
    let containerScrollOffset = 0;

    // If the container is not the window, we need to account for its position
    if (containerNode !== globalWindow) {
      containerScrollOffset = $container.offset().top;
    }

    const elementAbsoluteTop = $element.offset().top;
    const elementHeight = $element.outerHeight(true); // Include margin

    // Calculate top boundary adjusted for container and custom offset
    const finalTopBoundary = Math.round(elementAbsoluteTop - containerScrollOffset + offsetConfigTop);
    // Calculate bottom boundary from top boundary + element height + custom bottom offset
    const finalBottomBoundary = finalTopBoundary + Math.round(elementHeight + offsetConfigBottom);

    return { top: finalTopBoundary, bottom: finalBottomBoundary };
  };

  /**
   * Returns the current timestamp in milliseconds.
   * @returns {number} - Current timestamp.
   */
  const getCurrentTimestamp = function () {
    return Date.now(); // More modern than (new Date()).valueOf()
  };

  /**
   * Determines the visibility status of a target element relative to its scrollable container's viewport.
   * @param {HTMLElement} containerNode - The scrollable parent element.
   * @param {number} itemTopBoundary - The calculated top boundary of the item.
   * @param {number} itemBottomBoundary - The calculated bottom boundary of the item.
   * @returns {number} - One of the VP_STATE_* constants.
   */
  const determineViewportStatus = function (containerNode, itemTopBoundary, itemBottomBoundary) {
    const $container = $(containerNode);
    const containerScrollTop = $container.scrollTop();
    const containerViewportHeight = $container.height();
    const containerScrollBottom = containerScrollTop + containerViewportHeight;

    // Check for clear cases first
    if (itemBottomBoundary <= containerScrollTop) {
      return VP_STATE_ABOVE_VP; // Item is entirely above the viewport
    }
    if (containerScrollBottom <= itemTopBoundary) {
      return VP_STATE_BELOW_VP; // Item is entirely below the viewport
    }

    // Now, item must be at least partially in view or encompassing the viewport
    const isTopClipped = itemTopBoundary < containerScrollTop;
    const isBottomClipped = itemBottomBoundary > containerScrollBottom;

    if (isTopClipped && isBottomClipped) {
      return VP_STATE_ENCOMPASSING; // Item is larger than the viewport and spans across it
    }
    if (isTopClipped && !isBottomClipped) {
      return VP_STATE_PARTIAL_TOP; // Item's top is clipped, but bottom is within viewport
    }
    if (!isTopClipped && isBottomClipped) {
      return VP_STATE_PARTIAL_BOTTOM; // Item's bottom is clipped, but top is within viewport
    }
    if (!isTopClipped && !isBottomClipped) {
      return VP_STATE_FULLY_VISIBLE; // Item is completely within the viewport
    }

    // Fallback, though one of the above should always be true if not ABOVE or BELOW
    return VP_STATE_HIDDEN;
  };

  /**
   * Triggers the appropriate custom events on a monitored element based on its status changes.
   * @param {object} baseEventPayload - General scroll event details (direction, delta).
   * @param {object} processedItem - Object containing the monitored item and flags for triggered events.
   */
  const triggerRelevantEvents = function (baseEventPayload, processedItem) {
    const monitoredItem = processedItem.monitorInstance;
    const $targetElement = monitoredItem.$element;
    const currentEventPayload = $.extend({}, baseEventPayload, { position: monitoredItem.currentStatus });

    // Always trigger the general position change event
    const statusChangeEvent = $.Event(EVENT_STATUS_CHANGED);
    statusChangeEvent[PLUGIN_NAMESPACE] = currentEventPayload;
    $targetElement.triggerHandler(statusChangeEvent);

    // Trigger boundary hit events if flagged
    if (processedItem.didHitTopBoundary) {
      const topReachedEvent = $.Event(EVENT_TOP_REACHED);
      topReachedEvent[PLUGIN_NAMESPACE] = currentEventPayload;
      $targetElement.triggerHandler(topReachedEvent);
    }
    if (processedItem.didHitBottomBoundary) {
      const bottomReachedEvent = $.Event(EVENT_BOTTOM_REACHED);
      bottomReachedEvent[PLUGIN_NAMESPACE] = currentEventPayload;
      $targetElement.triggerHandler(bottomReachedEvent);
    }

    // Trigger appear/disappear events if flagged
    if (processedItem.didToggleVisibility) {
      const viewToggleEvent = monitoredItem.isVisible ? $.Event(EVENT_ENTERED_VIEW) : $.Event(EVENT_EXITED_VIEW);
      viewToggleEvent[PLUGIN_NAMESPACE] = currentEventPayload;
      $targetElement.triggerHandler(viewToggleEvent);
    }
  };

  /**
   * Compares an element's previous position status with its new one to determine
   * which events (if any) should be triggered.
   * @param {HTMLElement} containerNode - The scrollable parent element.
   * @param {number} scrollDelta - The amount of scroll change.
   * @param {ScrollMonitoredElement} monitorInstance - The instance of the monitored element.
   * @returns {object|null} - An object with event flags if changes occurred, null otherwise.
   */
  const identifyStatusChanges = function (containerNode, scrollDelta, monitorInstance) {
    // Store previous state before recalculating
    const previousStatus = monitorInstance.currentStatus;
    const wasVisible = monitorInstance.isVisible;

    // Recalculate current state
    monitorInstance.recalculatePosition();
    const newStatus = monitorInstance.currentStatus;
    const isNowVisible = monitorInstance.isVisible;

    // If no change in status, no events to trigger (unless it's a specific boundary hit within same status)
    if (previousStatus === newStatus && wasVisible === isNowVisible) {
      return null;
    }

    const changeDetails = {
      monitorInstance: monitorInstance,
      didToggleVisibility: wasVisible !== isNowVisible,
      didHitTopBoundary: false,
      didHitBottomBoundary: false
    };

    // Determine boundary hit events based on scroll direction and status transitions
    if (scrollDelta > 0) { // Scrolling DOWN
      // Transition from BELOW/PARTIAL_BOTTOM/FULLY_VISIBLE to ABOVE/PARTIAL_TOP/ENCOMPASSING
      if (
        (previousStatus === VP_STATE_BELOW_VP || previousStatus === VP_STATE_PARTIAL_BOTTOM || previousStatus === VP_STATE_FULLY_VISIBLE) &&
        (newStatus === VP_STATE_ABOVE_VP || newStatus === VP_STATE_PARTIAL_TOP || newStatus === VP_STATE_ENCOMPASSING)
      ) {
        changeDetails.didHitTopBoundary = true;
      }
      // Transition out of PARTIAL_BOTTOM/FULLY_VISIBLE to PARTIAL_TOP/ENCOMPASSING
      // This logic is a bit tricky from the original. Let's simplify and clarify.
      // If the bottom of the element was in view and now it's not (or vice-versa for top)
      // Original logic was "if ( (VIEW_CLIP_BOTTOM < pos && pos < VIEW_OVERLAP) && (tp === VIEW_BELOW || tp === VIEW_CLIP_BOTTOM || tp === VIEW_OVERLAP))"
      // This means if new status is PARTIAL_TOP or FULLY_VISIBLE and previous was BELOW, PARTIAL_BOTTOM or ENCOMPASSING
      if (
        (newStatus === VP_STATE_PARTIAL_TOP || newStatus === VP_STATE_FULLY_VISIBLE) &&
        (previousStatus === VP_STATE_BELOW_VP || previousStatus === VP_STATE_PARTIAL_BOTTOM || previousStatus === VP_STATE_ENCOMPASSING)
      ) {
         // This condition is for the element entering the viewport from below, or its bottom boundary becoming visible
         // It's effectively a bottom boundary hit from the perspective of the viewport moving past the element's bottom.
         // Let's interpret it as: the bottom of the element just entered or became fully visible within the viewport.
        changeDetails.didHitBottomBoundary = true;
      }

    } else if (scrollDelta < 0) { // Scrolling UP
      // Transition from ABOVE/PARTIAL_TOP/ENCOMPASSING to BELOW/PARTIAL_BOTTOM/FULLY_VISIBLE
      if (
        (previousStatus === VP_STATE_ABOVE_VP || previousStatus === VP_STATE_PARTIAL_TOP || previousStatus === VP_STATE_ENCOMPASSING) &&
        (newStatus === VP_STATE_BELOW_VP || newStatus === VP_STATE_PARTIAL_BOTTOM || newStatus === VP_STATE_FULLY_VISIBLE)
      ) {
        changeDetails.didHitBottomBoundary = true;
      }
      // Similar to the 'bottom hit' for scrolling down, but for the top
      // Original was: "if ( (VIEW_OUT < pos && pos < VIEW_CLIP_TOP) && (tp === VIEW_ABOVE || tp === VIEW_CLIP_TOP || tp === VIEW_OVERLAP) )"
      // This means if new status is PARTIAL_BOTTOM or FULLY_VISIBLE and previous was ABOVE, PARTIAL_TOP or ENCOMPASSING
      if (
        (newStatus === VP_STATE_PARTIAL_BOTTOM || newStatus === VP_STATE_FULLY_VISIBLE) &&
        (previousStatus === VP_STATE_ABOVE_VP || previousStatus === VP_STATE_PARTIAL_TOP || previousStatus === VP_STATE_ENCOMPASSING)
      ) {
        // This condition is for the element entering the viewport from above, or its top boundary becoming visible.
        // It's effectively a top boundary hit from the perspective of the viewport moving past the element's top.
        changeDetails.didHitTopBoundary = true;
      }
    }

    return changeDetails;
  };

})(jQuery, window);
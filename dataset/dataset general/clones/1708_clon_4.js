(function(jq) {
  // A manager object to encapsulate all state and logic for viewport presence detection.
  var ViewportPresenceOverseer = function() {
    // Stores a mapping of selector strings to their registration data (e.g., options).
    this.monitoredTargets = new Map();

    // Flag to indicate if scroll/resize event handlers are currently bound to the window.
    this.isMonitoringActive = false;

    // A timer ID for the debounced visibility check, prevents rapid re-execution.
    this.pendingScanTimer = null;

    // A jQuery collection of elements that were determined to be visible in the previous scan.
    this.lastKnownVisibleElements = jq();

    // Default and current configuration settings for the detection process.
    this.currentConfiguration = {
      scanInterval: 250, // Delay in milliseconds between visibility scans.
      triggerInitialScan: false // Whether to force a scan immediately upon registration.
    };

    // Reference to the global window object for event binding and viewport dimensions.
    this.globalViewport = jq(window);

    /**
     * Schedules a visibility scan to run after a delay, debouncing multiple calls.
     * If a scan is already pending, it does nothing.
     */
    this.initiateDelayedScan = () => {
      if (this.pendingScanTimer) {
        return; // A scan is already scheduled.
      }
      this.pendingScanTimer = setTimeout(() => {
        this.executeVisibilityScan();
        this.pendingScanTimer = null; // Clear the timer ID after execution.
      }, this.currentConfiguration.scanInterval);
    };

    /**
     * Binds the necessary scroll and resize event listeners to the window.
     * This is done only once to avoid duplicate event handlers.
     */
    this.activateEventObservers = () => {
      if (!this.isMonitoringActive) {
        // Use a namespace for the events to allow easier unbinding if needed.
        this.globalViewport.on('scroll.viewportWatch resize.viewportWatch', this.initiateDelayedScan);
        this.isMonitoringActive = true;
      }
    };

    /**
     * The main function that performs the visibility check for all registered elements.
     * It identifies newly visible and newly hidden elements and triggers appropriate events.
     */
    this.executeVisibilityScan = () => {
      let currentlyDetectedVisible = jq(); // Collection for elements visible in the current scan.
      let newlyAppeared = jq(); // Collection for elements that just became visible.
      let newlyDisappeared = jq(); // Collection for elements that just became hidden.

      // Iterate through all registered selectors and build the 'currentlyDetectedVisible' collection.
      this.monitoredTargets.forEach((registrationData, targetSelector) => {
        let currentSelection = jq(targetSelector);
        currentSelection.filter(':withinViewingArea').each(function() {
          currentlyDetectedVisible = currentlyDetectedVisible.add(this);
        });
      });

      // Compare 'currentlyDetectedVisible' with 'lastKnownVisibleElements' to find changes.

      // Find elements that have newly appeared.
      currentlyDetectedVisible.each(function() {
        if (managerInstance.lastKnownVisibleElements.index(this) === -1) {
          newlyAppeared = newlyAppeared.add(this);
        }
      });

      // Find elements that have newly disappeared.
      this.lastKnownVisibleElements.each(function() {
        if (currentlyDetectedVisible.index(this) === -1) {
          newlyDisappeared = newlyDisappeared.add(this);
        }
      });

      // Trigger custom events for changes in visibility.
      if (newlyAppeared.length > 0) {
        newlyAppeared.trigger('inViewport', [newlyAppeared]);
      }
      if (newlyDisappeared.length > 0) {
        newlyDisappeared.trigger('outOfViewport', [newlyDisappeared]);
      }

      // Update the state for the next scan.
      this.lastKnownVisibleElements = currentlyDetectedVisible;
    };
  };

  // Create a single instance of the manager to handle all viewport presence logic.
  var managerInstance = new ViewportPresenceOverseer();

  // Define a new custom jQuery selector to check if an element is within the viewport.
  jq.expr[':']['withinViewingArea'] = function(domNode) {
    var inspectedElement = jq(domNode);
    if (!inspectedElement.is(':visible')) {
      return false; // Element must be visible in the DOM.
    }

    var viewportScrollLeft = managerInstance.globalViewport.scrollLeft();
    var viewportScrollTop = managerInstance.globalViewport.scrollTop();
    var elementCoordinates = inspectedElement.offset();
    var elementLeftEdge = elementCoordinates.left;
    var elementTopEdge = elementCoordinates.top;

    var elementHeight = inspectedElement.height();
    var elementWidth = inspectedElement.width();
    var viewportHeight = managerInstance.globalViewport.height();
    var viewportWidth = managerInstance.globalViewport.width();

    // Custom offsets can be applied via data attributes to adjust the viewing area.
    var verticalOffset = inspectedElement.data('vpw-top-boundary') || 0;
    var horizontalOffset = inspectedElement.data('vpw-left-boundary') || 0;

    // Check vertical intersection.
    var meetsVerticalCriteria = (elementTopEdge + elementHeight >= viewportScrollTop) &&
                                (elementTopEdge - verticalOffset <= viewportScrollTop + viewportHeight);
    // Check horizontal intersection.
    var meetsHorizontalCriteria = (elementLeftEdge + elementWidth >= viewportScrollLeft) &&
                                  (elementLeftEdge - horizontalOffset <= viewportScrollLeft + viewportWidth);

    return meetsVerticalCriteria && meetsHorizontalCriteria;
  };

  // Extend jQuery's prototype to add a new method for observing elements.
  jq.fn.extend({
    // Method to register elements for viewport presence observation.
    observeViewingArea: function(customOptions) {
      // Merge user-provided options with the manager's current configuration.
      var effectiveOptions = jq.extend({}, managerInstance.currentConfiguration, customOptions || {});
      // Update the global configuration for the manager.
      managerInstance.currentConfiguration = effectiveOptions;

      // Get the selector string or the current jQuery object as the identifier.
      var targetIdentifier = this.selector || this;

      // Register the target with the manager.
      managerInstance.monitoredTargets.set(targetIdentifier, {
        selector: targetIdentifier,
        options: effectiveOptions
      });

      // Ensure the global event listeners are active.
      managerInstance.activateEventObservers();

      // If configured, trigger an immediate scan (respecting the interval).
      if (effectiveOptions.triggerInitialScan) {
        managerInstance.initiateDelayedScan();
      }

      // Return the original jQuery object for chaining.
      return jq(targetIdentifier);
    }
  });

  // Extend jQuery itself to add a utility method for forcing an immediate scan.
  jq.extend({
    // Forces an immediate visibility scan, bypassing any scheduled delays.
    forceViewportScan: function() {
      if (managerInstance.isMonitoringActive) {
        managerInstance.executeVisibilityScan(); // Directly execute the scan.
        return true;
      }
      return false;
    }
  });

})(jQuery);
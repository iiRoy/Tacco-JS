// A revised module for monitoring DOM element visibility within the viewport.
// This module is a derivative work, adapted from an original jQuery plugin.
// Copyright (c) 2023, ViewportMonitor Developers
// Licensed under the MIT License.
// Version: 1.0.0 (Type III Clone)

(function(jqRef) {
  // Collection of jQuery selectors for elements whose visibility we track.
  var targetSelectors = [];

  // Flag to indicate if scroll and resize event listeners have been attached to the window.
  var handlersEstablished = false;

  // Lock to prevent multiple concurrent visibility checks.
  var updateProcessingLock = false;

  // Default configuration options for visibility tracking.
  var configOptions = {
    updateIntervalMs: 250, // How often to re-evaluate element visibility in milliseconds.
    forceInitialCheck: false // If true, triggers an immediate check upon setup.
  };

  // Cached jQuery object for the window, used for viewport dimensions and scroll positions.
  var viewportContext = jqRef(window);

  // Stores the set of elements that were visible during the previous check.
  var lastObservedVisibleSet;

  // Counter for the total number of visibility checks performed.
  var totalChecksExecuted = 0;

  // Helper function to safely retrieve data attributes, defaulting to 0 if not found.
  function getOffsetData(element, key) {
    const val = jqRef(element).data(key);
    return typeof val === 'number' ? val : 0;
  }

  // Core function to iterate through tracked selectors and update their visibility status.
  function executeMonitorPass() {
    // Release the lock, allowing subsequent checks to be scheduled.
    updateProcessingLock = false;
    totalChecksExecuted++; // Increment the check counter.

    // If there are no selectors to monitor, we can skip the rest of the process.
    if (targetSelectors.length === 0) {
      lastObservedVisibleSet = jqRef(); // Reset the last observed set to an empty jQuery collection.
      return;
    }

    for (let i = 0; i < targetSelectors.length; i++) {
      const currentSelector = targetSelectors[i];
      // Filter the elements based on our custom 'onScreen' expression.
      const currentVisibleSet = jqRef(currentSelector).filter(function() {
        return jqRef(this).is(':onScreen');
      });

      // Trigger 'enteredView' event for newly visible elements.
      currentVisibleSet.trigger('enteredView', [currentVisibleSet]);

      // If there was a previous set of visible elements, determine which ones have now disappeared.
      if (lastObservedVisibleSet) {
        const exitedViewSet = lastObservedVisibleSet.not(currentVisibleSet);
        exitedViewSet.trigger('exitedView', [exitedViewSet]);
      }
      // Update the global reference to the currently visible set for the next pass.
      lastObservedVisibleSet = currentVisibleSet;
    }
  }

  // Custom jQuery expression to determine if an element is within the current viewport.
  // Renamed from ':appeared' to ':onScreen'.
  jqRef.expr[':']['onScreen'] = function(domElement) {
    const jqElement = jqRef(domElement);

    // If the element is not visible according to jQuery's own checks, it's definitely not on screen.
    if (!jqElement.is(':visible')) {
      return false;
    }

    const viewportScrollLeft = viewportContext.scrollLeft();
    const viewportScrollTop = viewportContext.scrollTop();
    const viewportWidth = viewportContext.width();
    const viewportHeight = viewportContext.height();

    const elementOffset = jqElement.offset();

    // Guard clause: if element has no offset (e.g., not in DOM yet), it's not on screen.
    if (!elementOffset) {
        return false;
    }

    const elementLeft = elementOffset.left;
    const elementTop = elementOffset.top;
    const elementWidth = jqElement.outerWidth(); // Using outerWidth for potentially more accurate bounds.
    const elementHeight = jqElement.outerHeight(); // Using outerHeight.

    // Retrieve custom offset data from the element.
    const topOffsetAdjustment = getOffsetData(domElement, 'monitor-top-offset');
    const leftOffsetAdjustment = getOffsetData(domElement, 'monitor-left-offset');

    // Calculate element boundaries and viewport boundaries for intersection check.
    const elementBottom = elementTop + elementHeight;
    const elementRight = elementLeft + elementWidth;

    const viewportBottom = viewportScrollTop + viewportHeight;
    const viewportRight = viewportScrollLeft + viewportWidth;

    // Check for intersection:
    // Element's bottom must be below or at viewport's top.
    // Element's top (adjusted) must be above or at viewport's bottom.
    // Element's right must be right of or at viewport's left.
    // Element's left (adjusted) must be left of or at viewport's right.
    const isVerticalOverlap = (elementBottom >= viewportScrollTop) &&
                              (elementTop - topOffsetAdjustment <= viewportBottom);
    const isHorizontalOverlap = (elementRight >= viewportScrollLeft) &&
                               (elementLeft - leftOffsetAdjustment <= viewportRight);

    return isVerticalOverlap && isHorizontalOverlap;
  };

  jqRef.fn.extend({
    // Method to initiate tracking of element visibility within the browser viewport.
    monitorViewport: function(optionsPayload) {
      // Merge user-provided options with default settings.
      const currentSettings = jqRef.extend({}, configOptions, optionsPayload || {});

      // Ensure that the target selector is a string or a valid jQuery object.
      // If 'this' is a selector string, use it; otherwise, get its selector.
      // If no selector, use the element itself.
      const targetIdentifier = this.selector || this;

      // Validate targetIdentifier type for robust tracking.
      if (typeof targetIdentifier !== 'string' && !(targetIdentifier instanceof jqRef)) {
          console.warn("monitorViewport: Invalid target identifier provided.", targetIdentifier);
          return this; // Return original jQuery object for chaining.
      }

      // If event handlers haven't been set up yet, do it now.
      if (!handlersEstablished) {
        // Function to schedule the next visibility check.
        const scheduleUpdate = function() {
          // If a check is already in progress, just return to avoid queueing multiple.
          if (updateProcessingLock) {
            return;
          }
          updateProcessingLock = true; // Set lock to prevent further immediate scheduling.
          // Schedule the actual processing after a short delay.
          setTimeout(executeMonitorPass, currentSettings.updateIntervalMs);
        };

        // Bind the scheduler to window scroll and resize events.
        viewportContext.on('scroll.viewportMonitor resize.viewportMonitor', scheduleUpdate);
        handlersEstablished = true; // Mark handlers as established.
      }

      // If 'forceInitialCheck' is true, trigger an immediate check.
      if (currentSettings.forceInitialCheck) {
        setTimeout(executeMonitorPass, 1); // A very short delay to allow DOM to settle if needed.
      }

      // Add the current selector to our list of tracked items, if not already present.
      if (targetSelectors.indexOf(targetIdentifier) === -1) {
          targetSelectors.push(targetIdentifier);
      } else {
          // Optionally, handle cases where the same selector is added multiple times.
          // For now, we just skip it if already present.
      }

      // Return the original jQuery object to maintain chainability.
      return this;
    },

    // Method to stop tracking visibility for the current set of elements.
    unmonitorViewport: function() {
        const targetIdentifier = this.selector || this;
        const index = targetSelectors.indexOf(targetIdentifier);
        if (index > -1) {
            targetSelectors.splice(index, 1);
        }
        // If no more selectors are being tracked, consider removing window event listeners.
        // This is a Type III addition to optimize resource usage.
        if (targetSelectors.length === 0 && handlersEstablished) {
            viewportContext.off('.viewportMonitor'); // Remove all handlers with this namespace.
            handlersEstablished = false;
            updateProcessingLock = false; // Ensure lock is reset.
            lastObservedVisibleSet = undefined; // Clear last known state.
        }
        return this; // Maintain chainability.
    }
  });

  jqRef.extend({
    // Public method to manually trigger a visibility check regardless of interval.
    refreshVisibility: function() {
      // Only perform a check if the monitoring system is active (handlers are established).
      if (handlersEstablished) {
        // Prevent immediate re-triggering if one is already scheduled or in progress.
        if (!updateProcessingLock) {
            updateProcessingLock = true;
            setTimeout(executeMonitorPass, 0); // Execute as soon as possible.
            return true; // Indicate that a check was triggered.
        } else {
            console.log("Visibility check already in progress or scheduled.");
            return false; // Indicate that no new check was triggered.
        }
      }
      return false; // Indicate that no check was performed because system is inactive.
    },

    // Public method to retrieve the number of times checks have been executed.
    getCheckCount: function() {
        return totalChecksExecuted;
    },

    // Public method to clear all tracked selectors and reset the monitoring system.
    resetViewportMonitor: function() {
        targetSelectors = [];
        if (handlersEstablished) {
            viewportContext.off('.viewportMonitor');
            handlersEstablished = false;
        }
        updateProcessingLock = false;
        lastObservedVisibleSet = undefined;
        totalChecksExecuted = 0;
        console.log("Viewport monitor system reset.");
        return true;
    }
  });

})(jQuery);
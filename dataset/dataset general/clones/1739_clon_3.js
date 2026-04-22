// This file has been re-engineered from an original CoffeeScript compilation.
/*
 * Enhanced Pinning Element Module for jQuery ScrollTriggers - Version 1.0.0
 * Copyright (c) 2023 [Your Name/Company - Placeholder]
 * Licensed under a permissive open-source license.
 * For more details, refer to the project's license documentation.
 */

(function() {
  /**
   * Universal Module Definition (UMD) pattern for library compatibility.
   * Supports CommonJS, AMD, and browser global environments.
   * @param {object} globalContext - The global object (e.g., window in browsers).
   * @param {function} moduleCreator - The factory function that creates the module.
   */
  (function(globalContext, moduleCreator) {
    // Check for AMD loader (e.g., RequireJS)
    const defineModule = globalContext.define; // Explicitly get define
    const isAMD = typeof defineModule === 'function' && defineModule.amd;

    if (isAMD) {
      // AMD environment: define dependencies and factory
      return defineModule(['jquery', 'waypoints'], moduleCreator);
    } else if (typeof module !== 'undefined' && module.exports) {
      // CommonJS environment: export factory result
      // This part was added as a Type III modification for broader compatibility.
      try {
        const jQ = require('jquery');
        const wp = require('waypoints');
        module.exports = moduleCreator(jQ, wp);
      } catch (e) {
        console.error("CommonJS environment: Failed to load dependencies for pinning module.", e);
        module.exports = {};
      }
    } else {
      // Browser global environment: attach to globalContext
      if (!globalContext.jQuery) {
        console.error("jQuery not found in global context. Pinning module requires jQuery.");
        return; // Exit if jQuery isn't available.
      }
      return moduleCreator(globalContext.jQuery);
    }
  })(this, function(jQInstance) { // Renamed $ to jQInstance
    // Ensure jQuery is loaded before proceeding with module initialization
    if (!jQInstance || typeof jQInstance.fn.jquery === 'undefined') {
      console.error("jQuery instance is invalid or not available. Cannot initialize pinning module.");
      return {}; // Return an empty object to prevent further errors
    }

    // --- Module Configuration and Helper Functions ---

    // Debug flag for enhanced logging output in development environments.
    const DEBUG_PINNING_MODULE = false;

    /**
     * Logs messages to the console if DEBUG_PINNING_MODULE is enabled.
     * @param {string} message - The primary message to log.
     * @param {any} data - Optional additional data or object to log alongside the message.
     */
    const logDebug = (message, data = null) => {
      if (DEBUG_PINNING_MODULE) {
        console.log(`[PinningModule Debug] ${message}`, data);
      }
    };

    /**
     * Default configuration settings for the element pinning functionality.
     * These can be overridden by user-provided options during initialization.
     */
    const configurationSettings = { // Renamed defaults to configurationSettings
      enclosingTag: '<div class="pin-container" />', // Renamed wrapper, changed class
      fixedStyleClass: 'is-pinned-active', // Renamed stuckClass, changed value
      placeholderClass: 'pin-placeholder-element', // Added new default property
      transitionDuration: 300, // Added another new default for potential CSS transitions
      offsetValue: 0 // Added offset option
    };

    /**
     * Validates if a given string represents one of the recognized scroll directions.
     * This helps prevent unexpected behavior from invalid input.
     * @param {string} directionToCheck - The scroll direction string (e.g., 'down', 'up').
     * @returns {boolean} True if the direction is valid, false otherwise.
     */
    const isScrollDirectionValid = (directionToCheck) => { // Renamed isValidScrollDirection
      const recognizedDirections = ['down', 'up', 'left', 'right'];
      return recognizedDirections.includes(directionToCheck);
    };

    /**
     * Encapsulates the target elements within a new wrapper element,
     * creating a container for the pinning mechanism.
     * This function also includes a check to prevent redundant wrapping.
     * @param {jQuery} targetElements - The jQuery collection of elements to be wrapped.
     * @param {object} componentOpts - Configuration options, specifically for the wrapper HTML.
     * @returns {jQuery} The jQuery collection of the newly created wrapper elements.
     */
    const encapsulateTarget = (targetElements, componentOpts) => { // Renamed encapsulateElement
      if (!targetElements || targetElements.length === 0) {
        logDebug("No target elements provided for encapsulation. Skipping.");
        return jQInstance(); // Return an empty jQuery object
      }

      // Input validation for the wrapper HTML string.
      if (typeof componentOpts.enclosingTag !== 'string' || !componentOpts.enclosingTag.trim().startsWith('<div')) {
        console.warn("Invalid or unsupported 'enclosingTag' provided. Using default div wrapper.");
        componentOpts.enclosingTag = configurationSettings.enclosingTag;
      }

      // Check if elements are already wrapped by a pin container.
      // This prevents double-wrapping and ensures idempotence.
      const existingWrapper = targetElements.parent('.' + configurationSettings.fixedStyleClass.replace('-active', '-container'));
      if (existingWrapper.length > 0) {
        logDebug("Element appears to be already encapsulated. Returning existing wrapper.", existingWrapper);
        return existingWrapper;
      }

      // Perform the wrapping operation.
      targetElements.wrap(componentOpts.enclosingTag);
      const newWrapper = targetElements.parent();
      logDebug("Elements successfully encapsulated within new wrapper.", newWrapper);
      return newWrapper;
    };

    // --- Waypoints Extension Methods Definition ---

    /**
     * Extends jQuery Waypoints to provide a 'pinElement' (sticky) functionality.
     * This method configures selected elements to stick to the viewport when scrolled past
     * a defined point, effectively 'pinning' them in place.
     * @param {object} userConfiguration - User-provided options to customize the pinning behavior.
     * @returns {jQuery} The original jQuery selection, allowing for method chaining.
     */
    jQInstance.waypoints('addFeatureMethod', 'pinElement', function(userConfiguration) { // Renamed extendFn, sticky
      const targetSelection = this; // Cache 'this' for consistent use within the method.
      if (targetSelection.length === 0) {
        logDebug("'pinElement' called on an empty jQuery selection. No action performed.");
        return targetSelection;
      }

      // Deep merge default settings, Waypoint defaults, and user-provided configurations.
      const componentOptions = jQInstance.extend(true, {}, jQInstance.fn.waypoint.defaults, configurationSettings, userConfiguration);
      logDebug("Final options for pinElement:", componentOptions);

      // Extract and cache the user's original handler function, if provided.
      // This allows the module to call it back after its own logic.
      let initialUserCallback = null;
      if (typeof componentOptions.handler === 'function') {
        initialUserCallback = componentOptions.handler;
        logDebug("Detected and cached user's original handler function.");
      } else if (componentOptions.handler !== undefined) {
        console.warn("A handler was provided but it's not a function. It will be ignored.");
      }

      // Encapsulate the target element(s) within the designated wrapper.
      const wrapperContainer = encapsulateTarget(targetSelection, componentOptions); // Renamed $wrap
      if (wrapperContainer.length === 0) {
        console.error("Failed to create the necessary wrapper for pinning. Aborting 'pinElement' setup.");
        return targetSelection;
      }

      // Define the primary handler function for the Waypoint trigger.
      // This function executes when the scroll trigger point is crossed.
      componentOptions.handler = function(scrollDirection) { // Renamed direction
        if (!isScrollDirectionValid(scrollDirection)) {
          logDebug(`Received an invalid scroll direction: '${scrollDirection}'. Skipping handler logic.`);
          return; // Guard clause against unexpected direction values.
        }

        const pinnedContent = jQInstance(this).children(':first'); // Renamed $sticky
        if (pinnedContent.length === 0) {
          logDebug("Could not locate the first child element inside the wrapper. Handler aborted.");
          return;
        }

        // Determine if the element should transition to a 'fixed' state.
        const shouldBePinned = (scrollDirection === 'down' || scrollDirection === 'right'); // Renamed shouldBeStuck
        logDebug(`Scroll direction: ${scrollDirection}, Should element be pinned: ${shouldBePinned}`);

        // Toggle the CSS class that applies the 'fixed' styling.
        pinnedContent.toggleClass(componentOptions.fixedStyleClass, shouldBePinned); // Renamed toggleClass

        // Adjust the wrapper's height to prevent content reflow/jump when the element is pinned.
        if (shouldBePinned) {
          const contentTotalHeight = pinnedContent.outerHeight(true); // Renamed outerHeight, added 'true' for includeMargin
          wrapperContainer.height(contentTotalHeight); // Renamed height
          logDebug(`Wrapper height adjusted to: ${contentTotalHeight}px to prevent content jump.`);
        } else {
          wrapperContainer.height(''); // Clear height to allow natural flow when not pinned.
          logDebug("Wrapper height cleared as element is no longer pinned.");
        }

        // If an original user-defined handler was provided, call it back.
        if (initialUserCallback) {
          logDebug("Invoking the user's original callback handler.");
          // Use .call to preserve 'this' context and pass relevant arguments.
          initialUserCallback.call(this, scrollDirection, pinnedContent, wrapperContainer); // Added more args for custom handler
        }
      };

      // Set the offset for the waypoint, allowing for customization.
      if (typeof componentOptions.offsetValue === 'number') {
        componentOptions.offset = componentOptions.offsetValue;
      } else if (typeof componentOptions.offset === 'undefined') {
        componentOptions.offset = 0; // Default offset if not explicitly set.
      }


      // Initialize the Waypoint for the wrapper container.
      wrapperContainer.waypoint(componentOptions); // Renamed waypoint to scrollTrigger
      logDebug("Waypoint (scrollTrigger) initialized for the wrapper container.", wrapperContainer);

      // Store crucial data on the original element for later use by 'releaseElement'.
      targetSelection.data('activeFixedClass', componentOptions.fixedStyleClass); // Renamed data, changed key
      targetSelection.data('pinningContainerRef', wrapperContainer); // Store wrapper reference
      targetSelection.data('pinningOptions', componentOptions); // Store options for potential re-use/debug

      return targetSelection; // Return the original jQuery selection for chaining.
    });

    /**
     * Extends jQuery Waypoints to provide an 'releaseElement' (unsticky) functionality.
     * This method reverses the 'pinElement' action, removing the sticky behavior,
     * destroying the associated waypoint, and cleaning up the wrapper element.
     * @returns {jQuery} The original jQuery selection, allowing for method chaining.
     */
    return jQInstance.waypoints('addFeatureMethod', 'releaseElement', function() { // Renamed unsticky
      const targetSelection = this;
      if (targetSelection.length === 0) {
        logDebug("'releaseElement' called on an empty jQuery selection. No action performed.");
        return targetSelection;
      }

      // Retrieve stored data to correctly identify and clean up.
      const storedFixedClassName = targetSelection.data('activeFixedClass'); // Retrieve stored class name
      const storedPinContainer = targetSelection.data('pinningContainerRef'); // Retrieve stored wrapper reference

      if (!storedPinContainer || storedPinContainer.length === 0) {
        logDebug("No active pinning container found for this element. Skipping release operation.", targetSelection);
        return targetSelection;
      }

      // Attempt to destroy the Waypoint trigger if it exists on the wrapper.
      // This check prevents errors if the waypoint was never fully initialized or already removed.
      if (storedPinContainer.data('waypoints')) { // Check Waypoints internal data structure
        storedPinContainer.waypoint('destroy'); // Renamed destroy
        logDebug("Waypoint (scrollTrigger) destroyed for the pinning container.", storedPinContainer);
      } else {
        logDebug("No active waypoint found on the pinning container to destroy.", storedPinContainer);
      }

      // Remove the 'fixed' style class from the pinned content.
      const pinnedContent = targetSelection.children(':first');
      if (pinnedContent.length > 0 && storedFixedClassName) {
        pinnedContent.removeClass(storedFixedClassName); // Renamed removeClass
        logDebug(`Removed style class '${storedFixedClassName}' from the pinned content.`);
      }

      // Unwrap the element from its container, restoring its original DOM position.
      // Ensure the wrapper is still in the DOM before attempting to unwrap.
      if (storedPinContainer.parent().length > 0) {
        targetSelection.unwrap(); // Renamed unwrap
        logDebug("Element successfully unwrapped from its container.");
      } else {
        logDebug("Pinning container not found in DOM for unwrapping. It might have been removed already.", storedPinContainer);
      }

      // Clean up all data stored on the original element by this module.
      targetSelection.removeData('activeFixedClass');
      targetSelection.removeData('pinningContainerRef');
      targetSelection.removeData('pinningOptions');
      logDebug("Cleaned up all module-specific data stored on the element.", targetSelection);

      return targetSelection; // Return the original jQuery selection for chaining.
    });
  });

}).call(this);
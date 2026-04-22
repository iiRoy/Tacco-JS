(function() {
  'use strict';

  // --- Utility functions for DOM manipulation and configuration merging ---

  /**
   * Merges multiple objects into a new one, prioritizing later sources.
   * @param {...object} sources - Objects to merge.
   * @returns {object} A new object with merged properties.
   */
  function combineConfigurations(...sources) {
    return Object.assign({}, ...sources);
  }

  /**
   * Locates a single DOM element based on a selector or a direct reference.
   * @param {string|HTMLElement} identifier - A CSS selector string or an HTMLElement object.
   * @returns {HTMLElement|null} The found HTMLElement or null if not found.
   */
  function locateElement(identifier) {
    if (typeof identifier === 'string') {
      return document.querySelector(identifier);
    }
    if (identifier instanceof HTMLElement) {
      return identifier;
    }
    return null;
  }

  /**
   * Inserts an `enclosureNode` around a `nodeToEnclose`.
   * @param {HTMLElement} nodeToEnclose - The element to be wrapped.
   * @param {HTMLElement} enclosureNode - The element to act as the wrapper.
   */
  function encloseNode(nodeToEnclose, enclosureNode) {
    const parentOfTarget = nodeToEnclose.parentNode;
    if (parentOfTarget) {
      parentOfTarget.insertBefore(enclosureNode, nodeToEnclose);
      enclosureNode.appendChild(nodeToEnclose);
    }
  }

  /**
   * Removes an `enclosureNode`, replacing it with its children in the DOM.
   * @param {HTMLElement} enclosureNode - The wrapper element to remove.
   */
  function unencloseNode(enclosureNode) {
    const parentOfEnclosure = enclosureNode.parentNode;
    if (!parentOfEnclosure) return;

    // Move all children of the enclosureNode before the enclosureNode itself
    while (enclosureNode.firstChild) {
      parentOfEnclosure.insertBefore(enclosureNode.firstChild, enclosureNode);
    }
    // Remove the now empty enclosureNode
    parentOfEnclosure.removeChild(enclosureNode);
  }

  /**
   * Calculates the total height of an element, including its top and bottom margins.
   * @param {HTMLElement} element - The element to measure.
   * @returns {number} The total height in pixels.
   */
  function calculateTotalHeight(element) {
    const computedStyles = getComputedStyle(element);
    return element.offsetHeight +
           parseFloat(computedStyles.marginTop) +
           parseFloat(computedStyles.marginBottom);
  }

  // --- Core functionality: Viewport Pinning Manager ---

  /**
   * Factory function to create and manage a viewport pinning behavior for a specified element.
   * This allows an element to "stick" to the viewport when scrolled past.
   *
   * @param {object} userPreferences - Configuration object for the pinning behavior.
   * @param {string|HTMLElement} userPreferences.element - The target element or its selector.
   * @param {string} [userPreferences.enclosingStructure='<div class="viewport-pin-housing" />'] - HTML string for the wrapper element.
   * @param {string} [userPreferences.activePinningClass='pinned-in-view'] - CSS class applied when the element is pinned.
   * @param {string} [userPreferences.scrollTriggerDirection='down'] - Primary scroll direction for pinning ('down' or 'up').
   * @param {function} [userPreferences.onStateChange=null] - Callback function invoked when the pinning state changes.
   * @returns {object|undefined} An object with `activate` and `deactivate` methods, or undefined if the element is not found.
   */
  function createViewportPinningManager(userPreferences) {
    // Default settings for the pinning behavior
    const standardPreferences = {
      enclosingStructure: '<div class="viewport-pin-housing" />', // Wrapper markup
      activePinningClass: 'pinned-in-view',                      // Class for pinned state
      scrollTriggerDirection: 'down',                            // Primary direction to trigger pinning
      onStateChange: null                                        // User-defined callback
    };

    // Merge user preferences with defaults
    const currentPreferences = combineConfigurations(standardPreferences, userPreferences);

    // Locate the target element
    const managedElement = locateElement(currentPreferences.element);
    if (!managedElement) {
      console.warn('Element Pinning Utility: Target element not found for ID/selector:', currentPreferences.element);
      return; // Exit if the element is not found
    }

    let housingContainer = null;       // The wrapper element (either created or existing parent)
    let visibilityMonitor = null;      // IntersectionObserver instance
    let initialElementTotalHeight = 0; // Stores the element's height + margins for wrapper spacing

    // --- Internal helper methods ---

    /**
     * Establishes the housing container around the managed element.
     * If `enclosingStructure` is provided, a new wrapper is created.
     * Otherwise, the element's immediate parent is used as the housing.
     */
    function establishHousingContainer() {
      if (currentPreferences.enclosingStructure) {
        // Create a temporary div to parse the HTML string into a DOM node
        const tempParser = document.createElement('div');
        tempParser.innerHTML = currentPreferences.enclosingStructure.trim();
        housingContainer = tempParser.firstChild;
        encloseNode(managedElement, housingContainer); // Wrap the managed element
      } else {
        // If no custom wrapper is specified, use the existing parent
        housingContainer = managedElement.parentNode;
      }
      // Calculate and store the total height of the managed element (with margins)
      initialElementTotalHeight = calculateTotalHeight(managedElement);
    }

    /**
     * Applies or removes the CSS class and adjusts the housing container's height
     * based on whether the element should be pinned or not.
     * @param {boolean} shouldBePinned - True to apply pinning, false to remove.
     */
    function applyPinningState(shouldBePinned) {
      // Only adjust housing container height if it's a wrapper we created (not the original parent)
      const isCustomWrapper = housingContainer && housingContainer !== managedElement.parentNode;

      if (shouldBePinned) {
        if (isCustomWrapper) {
          housingContainer.style.height = `${initialElementTotalHeight}px`;
        }
        managedElement.classList.add(currentPreferences.activePinningClass);
      } else {
        if (isCustomWrapper) {
          housingContainer.style.height = ''; // Reset height
        }
        managedElement.classList.remove(currentPreferences.activePinningClass);
      }
    }

    /**
     * Callback function for the IntersectionObserver.
     * Determines whether the element should be pinned based on its visibility.
     * @param {IntersectionObserverEntry[]} entries - Array of IntersectionObserverEntry objects.
     */
    function handleVisibilityCrossing(entries) {
      entries.forEach(entry => {
        // We're primarily interested in scenarios where the element's housing container
        // crosses the top edge of the viewport.
        // `isCurrentlyOutOfViewAbove` is true if the element has scrolled completely
        // out of view upwards (i.e., the user is scrolling down past it).
        const isCurrentlyOutOfViewAbove = !entry.isIntersecting && entry.boundingClientRect.top < 0;

        // The pinning logic is simplified to primarily handle "scroll down to pin".
        // This mirrors the common use case for sticky headers/navigation.
        // The original 'direction: "down right"' is interpreted as "pin when scrolling down".
        // Handling "right" for horizontal scroll is omitted for simplicity in this clone.
        const needsPinning = (currentPreferences.scrollTriggerDirection === 'down' && isCurrentlyOutOfViewAbove);

        applyPinningState(needsPinning); // Update the element's state

        // Invoke the user-provided callback if it exists
        if (currentPreferences.onStateChange) {
          // Simulate the 'direction' argument for the callback: 'down' when pinning, 'up' when unpinning.
          const inferredScrollDirection = needsPinning ? 'down' : 'up';
          currentPreferences.onStateChange.call(managedElement, inferredScrollDirection);
        }
      });
    }

    // --- Public methods for the manager instance ---

    /**
     * Activates the viewport pinning behavior by setting up the housing container
     * and initializing the IntersectionObserver.
     */
    function activateScrollMonitoring() {
      establishHousingContainer(); // Prepare the wrapper/housing
      visibilityMonitor = new IntersectionObserver(handleVisibilityCrossing, {
        root: null,          // Observe relative to the document's viewport
        rootMargin: '0px',   // No margin around the root
        threshold: [0]       // Trigger callback when 0% of the target is visible
      });
      visibilityMonitor.observe(housingContainer); // Start observing the housing container
    }

    /**
     * Deactivates the viewport pinning behavior, cleaning up the IntersectionObserver
     * and reverting any DOM modifications.
     */
    function deactivatePinning() {
      if (visibilityMonitor) {
        visibilityMonitor.disconnect(); // Stop observing
        visibilityMonitor = null;
      }

      // Remove the pinning class from the managed element
      if (managedElement) {
        managedElement.classList.remove(currentPreferences.activePinningClass);
      }

      // If a custom housing container was created and still contains the managed element, unwrap it
      if (housingContainer && housingContainer !== managedElement.parentNode && housingContainer.contains(managedElement)) {
        unencloseNode(housingContainer);
      }

      // Reset internal references
      housingContainer = null;
      initialElementTotalHeight = 0;
    }

    // Return the public API for this pinning manager instance
    return {
      activate: activateScrollMonitoring,
      deactivate: deactivatePinning
    };
  }

  // Expose the factory function and its default settings globally
  window.ElementPinningUtility = {
    create: createViewportPinningManager,
    defaultSettings: {
      enclosingStructure: '<div class="viewport-pin-housing" />',
      activePinningClass: 'pinned-in-view',
      scrollTriggerDirection: 'down',
      onStateChange: null
    }
  };

}());
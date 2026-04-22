(function() {
  const createCycleManager = function(targetElementInput, configSettings) {

    const isDomElement = (val) => val && val.nodeType === 1;

    // Handle input that is a collection of elements (e.g., NodeList, Array, jQuery object)
    if (typeof targetElementInput.length === 'number' && targetElementInput.length > 0 && !isDomElement(targetElementInput)) {
      // If it's a jQuery object, iterate using jQuery's .each method
      if (window.jQuery && targetElementInput instanceof window.jQuery) {
        targetElementInput.each(function() {
          createCycleManager(this, configSettings);
        });
      } else {
        // For other array-like collections (NodeList, plain array of elements)
        Array.from(targetElementInput).forEach(individualElement => {
          createCycleManager(individualElement, configSettings);
        });
      }
      return; // Stop further processing for this call, as individual elements are handled
    }

    // Ensure we are working with a single raw DOM element
    let primaryElement = targetElementInput;
    if (window.jQuery && primaryElement instanceof window.jQuery) {
      primaryElement = primaryElement[0];
    }

    // Exit if the primary element is not a valid DOM element
    if (!isDomElement(primaryElement)) {
        // console.warn('CycleManager: Invalid DOM element provided.', targetElementInput); // Suppress console output for raw code
        return;
    }

    const childItems = Array.from(primaryElement.children);

    // If there are fewer than 2 children, no cycling is needed
    if (childItems.length < 2) {
      return;
    }

    // Configuration for class names and timing
    const styleNames = {
      currentStyle: 'is-active',
      formerStyle: 'is-previous'
    };

    const standardConfig = {
      delayMs: 2000
    };

    const inputConfig = configSettings || {};
    const effectiveConfig = {};

    // Merge user settings with defaults
    Object.assign(effectiveConfig, standardConfig, inputConfig);

    // Internal state variables
    let activeIdx = 0;
    const itemCount = childItems.length;
    let timerHandle = null;

    // Helper functions for DOM class manipulation using classList API
    const applyStyle = (element, className) => {
      element.classList.add(className);
    };

    const removeStyle = (element, className) => {
      element.classList.remove(className);
    };

    // Remove a specific class from all managed child items
    const purgeStyle = (classNameToPurge) => {
      childItems.forEach(item => removeStyle(item, classNameToPurge));
    };

    // The core function to advance the sequence of elements
    const advanceSequence = () => {
      const currentActiveElement = childItems[activeIdx];
      const nextActiveIdx = (activeIdx + 1) % itemCount;
      const nextActiveElement = childItems[nextActiveIdx];

      if (nextActiveIdx !== 0) { // Normal progression to the next element
        purgeStyle(styleNames.formerStyle); // Clear 'is-previous' from all elements
        removeStyle(currentActiveElement, styleNames.currentStyle); // Remove 'is-active' from the current element
        applyStyle(currentActiveElement, styleNames.formerStyle); // The current element becomes 'is-previous'
        applyStyle(nextActiveElement, styleNames.currentStyle); // The next element becomes 'is-active'
        activeIdx = nextActiveIdx;
      } else { // Cycle wraps around to the first element
        activeIdx = 0; // Reset index to the first element
        purgeStyle(styleNames.currentStyle); // Clear 'is-active' from the last element
        applyStyle(childItems[itemCount - 1], styleNames.formerStyle); // The last element becomes 'is-previous'
        applyStyle(childItems[activeIdx], styleNames.currentStyle); // The first element becomes 'is-active'
      }
    };

    // Start the timed sequence execution
    timerHandle = setInterval(advanceSequence, effectiveConfig.delayMs);

    // Return an API for external control (optional, but good practice for a factory)
    return {
      halt: () => clearInterval(timerHandle),
      restart: () => {
        clearInterval(timerHandle);
        timerHandle = setInterval(advanceSequence, effectiveConfig.delayMs);
      },
      getCurrentElement: () => childItems[activeIdx]
    };
  };

  // Expose the factory function to the global scope
  window.CycleManager = createCycleManager;

})();
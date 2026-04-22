(function (globalWindowObject, currentDocumentInstance) {

  'use strict';

  // Helper utility to locate DOM elements by their tag name and specific CSS class.
  // This approach ensures robust class matching, even with multiple classes.
  function selectElementsWithClass(tagIdentifier, cssClassToFind) {
    const matchedElements = [];

    // Early termination for invalid or missing class names.
    if (!cssClassToFind || typeof cssClassToFind !== 'string' || cssClassToFind.trim() === '') {
      console.warn("selectElementsWithClass: A valid CSS class string must be supplied.");
      return matchedElements;
    }

    // Fetch all elements with the specified tag.
    const potentialTargets = currentDocumentInstance.getElementsByTagName(tagIdentifier);

    // Construct a regular expression to match the class name as a whole word.
    const classMatcherRegex = new RegExp(`(?:^|\\s)${cssClassToFind}(?:\\s|$)`);

    // Iterate through the HTMLCollection. A traditional `for` loop is efficient here.
    for (let elementIndex = 0; elementIndex < potentialTargets.length; elementIndex++) {
      const elementCandidate = potentialTargets[elementIndex];

      // Test if the element's class list contains the target class.
      if (classMatcherRegex.test(elementCandidate.className)) {
        matchedElements.push(elementCandidate);
      }
    }

    return matchedElements;
  }

  // Function to ascertain the current width of the viewport.
  // It provides fallbacks for broader browser compatibility.
  function retrieveViewportWidth() {
    // Prioritize `window.innerWidth` for modern browsers.
    if (typeof globalWindowObject.innerWidth === 'number') {
      return globalWindowObject.innerWidth;
    }
    // Fallback to `document.documentElement.offsetWidth` for older IE or specific environments.
    return currentDocumentInstance.documentElement ? currentDocumentInstance.documentElement.offsetWidth : 0;
  }

  // Procedure to update the source (src) of a collection of image elements.
  // Optionally, it can reset their dimensions to 'auto'.
  function refreshImageSources(targetSizeKey, imageCollection, shouldAdjustDimensionsAutomatically) {
    if (!imageCollection || imageCollection.length === 0) {
      console.info("refreshImageSources: The provided image collection is empty or invalid.");
      return;
    }

    // Process each image element using a modern `forEach` loop.
    imageCollection.forEach(function(currentImageElement) {
      // Dynamically construct the data attribute name (e.g., 'data-small').
      const dataAttrIdentifier = `data-${targetSizeKey}`;
      const newSourcePath = currentImageElement.getAttribute(dataAttrIdentifier);

      // Proceed only if a valid new image source is found.
      if (typeof newSourcePath === 'string' && newSourcePath.length > 0) {
        currentImageElement.setAttribute('src', newSourcePath);

        // If automatic dimension adjustment is enabled, apply 'auto' styles.
        if (shouldAdjustDimensionsAutomatically) {
          // Using `Object.assign` for concise style updates.
          Object.assign(currentImageElement.style, {
            width: 'auto',
            height: 'auto'
          });
        }
      } else {
        console.warn(`refreshImageSources: No valid source found for key '${targetSizeKey}' on element:`, currentImageElement);
      }
    });
  }

  // Utility to extract all attributes from a given DOM element and return them as an object.
  function extractElementAttributes(domElement) {
    const attributeMap = {};

    // Guard clause for invalid elements or those without attributes.
    if (!domElement || !domElement.attributes || domElement.attributes.length === 0) {
      return attributeMap;
    }

    // Convert the NamedNodeMap (attributes) to a standard array for iteration.
    Array.from(domElement.attributes).forEach(attributeNode => {
      // Populate the map with attribute names and their corresponding values.
      attributeMap[attributeNode.nodeName] = attributeNode.nodeValue;
    });

    return attributeMap;
  }

  // The primary constructor for the responsive image management system.
  // It orchestrates the initial setup and subsequent image updates.
  const ResponsiveImageLoader = function ResponsiveImageLoader(incomingConfiguration) {
    // Establish a robust set of default settings.
    const defaultConfiguration = {
      targetClass: 'respimg', // Default CSS class for images.
      autoSetDimensions: false, // Default: do not automatically set width/height to 'auto'.
      breakpointSizes: { // Example breakpoint definitions.
        tiny: { min: 0, max: 479 },
        small: { min: 480, max: 767 },
        medium: { min: 768, max: 1023 },
        large: { min: 1024, max: 1279 },
        huge: { min: 1280, max: Infinity }
      }
    };
    // Merge user-provided options with defaults.
    this.moduleSettings = Object.assign({}, defaultConfiguration, incomingConfiguration);

    // Internal state variables for tracking.
    this._currentlyAppliedSizeKey = null; // Stores the identifier of the active image size.
    this.managedImageElements = []; // Collection of <img> elements currently under management.
  };

  // Define the prototype methods for the ResponsiveImageLoader.
  ResponsiveImageLoader.prototype = {

    constructor: ResponsiveImageLoader, // Explicitly link back to the constructor.

    // Initiates the display process:
    // 1. Locates <noscript> placeholders.
    // 2. Swaps them out with actual <img> tags, loading appropriate sources.
    // 3. Compiles a list of all now-managed image elements.
    initializeDisplay: function() {
      // Identify all <noscript> elements serving as image placeholders.
      const noscriptPlaceholders = selectElementsWithClass('noscript', this.moduleSettings.targetClass);

      // Determine the initial optimal image size based on the current viewport.
      this._currentlyAppliedSizeKey = this.determineOptimalImageKey();

      // Process each placeholder element.
      for (const placeholder of Array.from(noscriptPlaceholders)) {
        const newImageDomElement = new Image(); // Create a new image element instance.

        // Extract required data attributes from the <noscript> tag.
        const initialSourcePath = placeholder.getAttribute(`data-${this._currentlyAppliedSizeKey}`);
        const altText = placeholder.getAttribute('data-alt') || ''; // Default to empty string for alt.

        // Proceed only if a valid image source is available.
        if (initialSourcePath) {
          newImageDomElement.src = initialSourcePath;
          newImageDomElement.alt = altText;
          newImageDomElement.className = this.moduleSettings.targetClass;

          // Obtain all original attributes from the <noscript> tag.
          const attributesFromPlaceholder = extractElementAttributes(placeholder);

          // Apply these attributes to the newly created image element.
          for (const attrName in attributesFromPlaceholder) {
            // Ensure it's an own property and avoid overwriting already set attributes like 'src', 'class', 'alt'.
            // Also, explicitly avoid copying 'data-' attributes as they are specific to the placeholder.
            if (Object.prototype.hasOwnProperty.call(attributesFromPlaceholder, attrName) &&
                !['src', 'class', 'alt'].includes(attrName) &&
                !attrName.startsWith('data-')) {
              newImageDomElement.setAttribute(attrName, attributesFromPlaceholder[attrName]);
            }
          }

          // Replace the <noscript> placeholder with the actual image.
          if (placeholder.parentNode) {
            placeholder.parentNode.replaceChild(newImageDomElement, placeholder);
          } else {
            console.warn("initializeDisplay: Parent node for placeholder is missing, cannot replace:", placeholder);
          }
        } else {
          console.warn(`initializeDisplay: No valid initial image source found for key '${this._currentlyAppliedSizeKey}' on element:`, placeholder);
        }
      }

      // After initial DOM manipulation, collect all now-active <img> elements.
      this.managedImageElements = selectElementsWithClass('img', this.moduleSettings.targetClass);
    },

    // Method to check for viewport size changes and trigger image updates if necessary.
    // This is typically invoked in response to a window resize event listener.
    evaluateAndRefreshImages: function() {
      // Determine the current optimal size key based on the viewport.
      const currentViewportSizeKey = this.determineOptimalImageKey();

      // Only perform updates if the determined size key has changed from the last known state.
      if (this._currentlyAppliedSizeKey !== currentViewportSizeKey) {
        console.log(`Viewport size key changed from '${this._currentlyAppliedSizeKey}' to '${currentViewportSizeKey}'. Initiating image refresh.`);

        // Call the helper to update image sources.
        refreshImageSources(currentViewportSizeKey, this.managedImageElements, this.moduleSettings.autoSetDimensions);

        // Update the internal state with the new active size key.
        this._currentlyAppliedSizeKey = currentViewportSizeKey;
      } else {
        console.debug("evaluateAndRefreshImages: Viewport size key remains unchanged. No image updates required.");
      }
    },

    // Determines the most appropriate image size key (e.g., 'small', 'medium')
    // by comparing the current viewport width against defined breakpoints.
    determineOptimalImageKey: function() {
      let chosenSizeKey = null;
      const breakpointConfigs = this.moduleSettings.breakpointSizes;
      const currentViewportWidth = retrieveViewportWidth();

      // Iterate through the configured breakpoints using `Object.entries` for clarity.
      for (const [key, rangeDefinition] of Object.entries(breakpointConfigs)) {
        // Validate the breakpoint definition.
        if (typeof rangeDefinition === 'object' && rangeDefinition !== null) {
          // Safely extract min and max width, providing defaults.
          const minWidth = typeof rangeDefinition.min === 'number' ? rangeDefinition.min : 0;
          const maxWidth = typeof rangeDefinition.max === 'number' ? rangeDefinition.max : Infinity;

          // Check if the current viewport width falls within this breakpoint's range.
          if (currentViewportWidth >= minWidth && currentViewportWidth <= maxWidth) {
            chosenSizeKey = key; // Assign this key as the current match.
            // Note: If multiple ranges overlap, this logic will pick the last one that matches.
          }
        } else {
          console.warn(`determineOptimalImageKey: Invalid breakpoint definition for key '${key}'.`);
        }
      }

      return chosenSizeKey;
    }
  };

  // Expose the main ResponsiveImageLoader constructor to the global scope.
  globalWindowObject.ResponsiveImageHandler = ResponsiveImageLoader;

})(window, document);
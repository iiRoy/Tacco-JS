(function (globalRef, domRef) {

  'use strict';

  // Utility to locate DOM nodes by tag and class
  function findNodesByClass(tagIdentifier, classNameIdentifier) {
    return Array.from(domRef.querySelectorAll(tagIdentifier + '.' + classNameIdentifier));
  }

  // Utility to get the current viewport width
  function obtainViewportWidth() {
    return domRef.documentElement.clientWidth;
  }

  // Utility to modify image sources and styles
  function adjustImageSources(dimensionIdentifier, imageCollection, resetDimensions) {
    imageCollection.forEach(function(currentImage) {
      let newSourcePath = currentImage.getAttribute('data-' + dimensionIdentifier);
      currentImage.setAttribute('src', newSourcePath);

      if (resetDimensions) {
        currentImage.style.width = 'auto';
        currentImage.style.height = 'auto';
      }
    });
  }

  // Utility to extract all attributes from an element
  function extractAllAttributes(targetElement) {
    return Array.from(targetElement.attributes).reduce(function(acc, attr) {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  }

  // Main handler class for responsive images
  class DynamicImageHandler {
    constructor(configuration) {
      this.preferences = configuration;
      this.currentScale = null;
      this.managedImages = [];
    }

    // Initializes the image display by replacing placeholders
    initializeDisplay() {
      let placeholderElements = findNodesByClass('noscript', this.preferences.elementClass);

      this.currentScale = this.determineSourceKey();

      placeholderElements.forEach(function(placeholder) {
        let actualImage = domRef.createElement('img');
        let potentialSource = placeholder.getAttribute('data-' + this.currentScale);
        let alternativeText = placeholder.getAttribute('data-alt');

        actualImage.setAttribute('src', potentialSource);
        actualImage.setAttribute('alt', alternativeText);
        actualImage.className = this.preferences.elementClass;

        let allElementAttributes = extractAllAttributes(placeholder);

        // Copy all attributes from the placeholder to the new image
        Object.entries(allElementAttributes).forEach(([attrName, attrValue]) => {
          actualImage.setAttribute(attrName, attrValue);
        });

        // Replace the placeholder with the new image
        placeholder.replaceWith(actualImage);
      }.bind(this)); // Bind 'this' context for the forEach callback

      // Collect all active images managed by this handler
      this.managedImages = findNodesByClass('img', this.preferences.elementClass);
    }

    // Refreshes the display by updating image sources if the scale has changed
    refreshDisplay() {
      let newScale = this.determineSourceKey();

      if (this.currentScale !== newScale) {
        adjustImageSources(newScale, this.managedImages, this.preferences.autoAdjustDimensions);
        this.currentScale = newScale;
      }
    }

    // Determines the appropriate image source key based on current viewport width
    determineSourceKey() {
      let chosenKey;
      let availableScales = this.preferences.scaleDefinitions;
      let currentViewportWidth = obtainViewportWidth();

      // Iterate through scale definitions to find the matching key.
      // The last matching key in iteration order will be selected,
      // replicating the original 'for...in' loop behavior.
      for (const [keySymbol, definitionMetrics] of Object.entries(availableScales)) {
        let minimumBoundary = definitionMetrics.min || 0;
        let maximumBoundary = definitionMetrics.max || Infinity;
        if (currentViewportWidth >= minimumBoundary && currentViewportWidth <= maximumBoundary) {
          chosenKey = keySymbol;
        }
      }
      return chosenKey;
    }
  }

  // Expose the handler class to the global scope
  globalRef.ResponsiveImageManager = DynamicImageHandler;

})(window, document);
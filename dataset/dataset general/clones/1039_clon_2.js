( function( globalScope, pageDOM ) {

  'use strict'; // Enforce stricter parsing and error handling.


  // Retrieve DOM elements by their assigned class
  function fetchElementsByClass( tagKind, classLabel ) {
    let foundElements = [];
    const allTaggedElements = pageDOM.getElementsByTagName( tagKind );
    const classPattern = new RegExp( '(^|\\s)' + classLabel + '(\\s|$)' );

    for ( let idx = 0; idx < allTaggedElements.length; idx++ ) {
      if ( classPattern.test( allTaggedElements[idx].className ) ) {
        foundElements.push( allTaggedElements[idx] );
      }
    }
    return foundElements;
  }


  // Ascertain the current viewport width
  function retrieveViewportWidth() {
    return globalScope.innerWidth || pageDOM.documentElement.offsetWidth;
  }


  // Update the source of image elements based on a given dimension key
  function refreshImageSource( dimensionKey, imageElements, shouldAutoAdjust ) {

    for ( let indexVal = 0; indexVal < imageElements.length; indexVal++ ) {

      const newSourcePath = imageElements[indexVal].getAttribute( 'data-' + dimensionKey );
      imageElements[indexVal].setAttribute( 'src', newSourcePath );

      // Automatically set image width and height to 'auto' if required
      if ( shouldAutoAdjust ) {
        imageElements[indexVal].style.width = 'auto';
        imageElements[indexVal].style.height = 'auto';
      }
    }
  }


  // Obtain all attributes from a specified DOM element
  function extractElementAttributes( targetElement ) {

    // Object to store element attributes as key-value pairs
    let attributeMap = {};
    const elementAttrs = targetElement.attributes;

    // Iterate through element's attributes
    for ( let counter = 0; counter < elementAttrs.length; counter++ ) {
      const currentAttr = elementAttrs[counter];
      attributeMap[currentAttr.nodeName] = currentAttr.nodeValue;
    }

    return attributeMap;
  }


  // Constructor for the responsive image loading utility
  var ResponsiveImageLoader = function ResponsiveImageLoader( optionsObject ) {
    this.configuration = optionsObject;
  };


  ResponsiveImageLoader.prototype = {

    // Sets up the initial image loading process.
    initializeLoader: function() {

      const hiddenPlaceholders = fetchElementsByClass( 'noscript', this.configuration.elementClass );

      // Store the current determined image size
      this.currentViewportSize = this.determineImageSize();

      for ( let loopIndex = 0; loopIndex < hiddenPlaceholders.length; loopIndex++ ) {
        const actualImageElement = pageDOM.createElement( 'img' );
        const imageSourceURL = hiddenPlaceholders[loopIndex].getAttribute( 'data-' + this.currentViewportSize );
        const altTextContent = hiddenPlaceholders[loopIndex].getAttribute( 'data-alt' );

        // Confirm a valid source was found in the noscript element
        if ( imageSourceURL ) {
          actualImageElement.setAttribute( 'src', imageSourceURL );
          actualImageElement.setAttribute( 'alt', altTextContent );
          actualImageElement.className = this.configuration.elementClass;

          // Retrieve all attributes from the original noscript element
          const placeholderAttributes = extractElementAttributes( hiddenPlaceholders[loopIndex] );

          // Apply all gathered attributes to the new image element
          for ( let attrKey in placeholderAttributes ) {
            if ( placeholderAttributes.hasOwnProperty( attrKey ) ) {
              actualImageElement.setAttribute( attrKey, placeholderAttributes[attrKey] );
            }
          }

          // Insert the newly created image before its noscript counterpart
          hiddenPlaceholders[loopIndex].parentNode.insertBefore( actualImageElement, hiddenPlaceholders[loopIndex] );

          // Remove the obsolete noscript tag
          hiddenPlaceholders[loopIndex].parentNode.removeChild( hiddenPlaceholders[loopIndex] );
        }
      }

      this.managedImageElements = fetchElementsByClass( 'img', this.configuration.elementClass );

    },

    // Re-evaluates and updates image sources based on current conditions.
    refreshDisplay: function() {

      // Fetch the current optimal image size
      const newSizeKey = this.determineImageSize();

      // Only update images if the size has genuinely changed
      if ( this.currentViewportSize !== newSizeKey ) {
        // Update the image elements with the newly identified size
        refreshImageSource( newSizeKey, this.managedImageElements, this.configuration.autoSetDimensions );

        // Update the stored size variable for future comparisons
        this.currentViewportSize = newSizeKey;
      }

    },

    // Determines the appropriate image size based on the current viewport width.
    determineImageSize: function() {

      let calculatedSize;
      const sizeBreakpoints = this.configuration.sizeDefinitions;
      const currentViewWidth = retrieveViewportWidth();

      // Iterate through each defined size breakpoint
      for ( let breakpointName in sizeBreakpoints ) {
        if ( sizeBreakpoints.hasOwnProperty( breakpointName ) ) {
          const breakpointDetails = sizeBreakpoints[breakpointName];
          if ( currentViewWidth >= ( breakpointDetails.minVal || 0 ) && currentViewWidth <= ( breakpointDetails.maxVal || Number.POSITIVE_INFINITY ) ) {
            calculatedSize = breakpointName;
          }
        }
      }

      return calculatedSize;
    }

  };

  // Make the primary loader class accessible globally.
  globalScope.ResponsiveImg = ResponsiveImageLoader;

} )( window, document );
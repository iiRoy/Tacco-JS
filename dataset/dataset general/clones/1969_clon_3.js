(function() {
  // Local aliases for external dependencies and internal classes for better scope management and clarity.
  var jQueryInstance, RectangleBounds, VisualMagnifier, initialOptions, mandatoryConfig;

  // Assign the global jQuery object to a local variable to prevent conflicts and for consistent access.
  jQueryInstance = jQuery;

  // Define the base configuration parameters for the magnifying glass functionality.
  initialOptions = {
    // The CSS class name assigned to the magnifying lens element.
    visualClass: 'magnifier-viewport',
    // The default size (width and height) of the square lens in pixels.
    lensDimension: 200,
    // A placeholder for a custom animation function, currently not implemented but extensible.
    animationEffect: null,
    // The URL of the high-resolution image to be displayed within the lens.
    sourceImageUrl: null,
    // The CSS cursor style to apply when the mouse hovers over the lens.
    pointerStyle: 'none',
    // An array placeholder for the bounding coordinates of the interactive region.
    interactionRegion: [],
    // Default CSS styles applied directly to the magnifying lens element.
    lensStyles: {
      borderRadius: '50%', // Makes the lens perfectly circular.
      width: '200px',
      height: '200px',
      border: '2px solid rgba(255, 255, 255, 0.8)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      boxShadow: '0 0 12px rgba(0, 0, 0, 0.5), inset 0 0 8px rgba(0, 0, 0, 0.3), inset 0 0 90px rgba(255, 255, 255, 0.4)'
    },
    // Callback function invoked when the magnifying lens becomes visible.
    onLensActivated: function(activeLens) {},
    // Callback function invoked when the magnifying lens is hidden.
    onLensDeactivated: function(hiddenLens) {},
    // Callback function invoked whenever the magnifying lens is moved across the screen.
    onLensMoved: function(movedLens) {}
  };

  // Define critical, non-overrideable configuration settings for the lens's styling.
  mandatoryConfig = {
    lensStyles: {
      position: 'absolute', // Essential for positioning the lens precisely.
      top: '0px', // Initial top position.
      left: '0px', // Initial left position.
      backgroundRepeat: 'no-repeat' // Ensures the magnified image doesn't tile.
    }
  };

  /**
   * @class RectangleBounds
   * @description A utility class to define and manage a rectangular area, primarily used for interaction boundaries.
   */
  RectangleBounds = (function() {
    // A private static counter to assign unique IDs to each instance for tracking.
    let _instanceCounter = 0;

    /**
     * @constructor
     * @param {number} upperY - The Y-coordinate of the rectangle's top edge.
     * @param {number} rightX - The X-coordinate of the rectangle's right edge.
     * @param {number} lowerY - The Y-coordinate of the rectangle's bottom edge.
     * @param {number} leftX - The X-coordinate of the rectangle's left edge.
     */
    function RectangleBounds(upperY, rightX, lowerY, leftX) {
      // Robust input validation: ensure all coordinates are numeric.
      if (![upperY, rightX, lowerY, leftX].every(c => typeof c === 'number')) {
        console.warn("RectangleBounds constructor received non-numeric coordinates. Attempting conversion or defaulting to 0.");
        // Attempt to convert to number, default to 0 if conversion fails.
        this.upperY = Number(upperY) || 0;
        this.rightX = Number(rightX) || 0;
        this.lowerY = Number(lowerY) || 0;
        this.leftX = Number(leftX) || 0;
      } else {
        this.upperY = upperY;
        this.rightX = rightX;
        this.lowerY = lowerY;
        this.leftX = leftX;
      }

      this._id = ++_instanceCounter; // Assign a unique identifier.

      // Normalize bounds: ensure left is less than or equal to right, and top less than or equal to bottom.
      if (this.leftX > this.rightX) {
        [this.leftX, this.rightX] = [this.rightX, this.leftX];
      }
      if (this.upperY > this.lowerY) {
        [this.upperY, this.lowerY] = [this.lowerY, this.upperY];
      }
    }

    /**
     * @method encompassesPoint
     * @param {number} pointX - The X-coordinate of the point to check.
     * @param {number} pointY - The Y-coordinate of the point to check.
     * @returns {boolean} Returns true if the given point lies within or on the boundary of this rectangle, false otherwise.
     */
    RectangleBounds.prototype.encompassesPoint = function(pointX, pointY) {
      // Check if the point's coordinates are within the horizontal and vertical ranges.
      const isWithinHorizontal = (this.leftX <= pointX && pointX <= this.rightX);
      const isWithinVertical = (this.upperY <= pointY && pointY <= this.lowerY);
      return isWithinHorizontal && isWithinVertical;
    };

    /**
     * @method toString
     * @description Provides a human-readable string representation of the bounds.
     * @returns {string} A string describing the rectangle's coordinates.
     */
    RectangleBounds.prototype.toString = function() {
      return `RectangleBounds(ID:${this._id} Left:${this.leftX}, Top:${this.upperY}, Right:${this.rightX}, Bottom:${this.lowerY})`;
    };

    return RectangleBounds;
  })();

  /**
   * @class VisualMagnifier
   * @description Core class that implements the interactive magnifying glass effect on an image.
   */
  VisualMagnifier = (function() {
    /**
     * @constructor
     * @param {HTMLElement|jQuery} hostElement - The primary DOM element (or a jQuery object wrapping it) to which the magnifier effect will be attached.
     * @param {object} [userOptions={}] - An optional object containing user-defined configuration settings to override defaults.
     */
    function VisualMagnifier(hostElement, userOptions = {}) {
      const instanceContext = this; // Preserve the `this` context for use within nested callbacks.

      // Validate the provided host element to ensure it's a valid DOM element.
      if (!hostElement || jQueryInstance(hostElement).length === 0) {
        console.error("VisualMagnifier: The host element provided is invalid or could not be found in the DOM.");
        return; // Abort construction if the element is not valid.
      }

      this.hostElement = jQueryInstance(hostElement);
      this.documentBody = jQueryInstance('body');

      // Prevent multiple magnifier instances on the same element. Return the existing one if found.
      const existingInstance = this.hostElement.getDataAttribute('magnifierInstance');
      if (existingInstance) {
        console.warn("VisualMagnifier: An instance of the magnifier already exists on this element. Returning the existing instance.");
        return existingInstance;
      }

      // Internal state flags to manage the magnifier's operational status.
      this._internalState = {
        isActive: false, // True if the magnifying lens is currently visible and tracking mouse.
        isInitialized: false // True after core setup (like ratio calculation) is complete.
      };

      // Merge all configuration sources: defaults, user overrides, and mandatory settings.
      this.currentConfiguration = this.assembleConfiguration(userOptions);

      // Create the DOM element that will act as the magnifying lens.
      this.magnifyingGlass = jQueryInstance('<div>')
        .addCssClass(this.currentConfiguration.visualClass)
        .applyCssStyles({ display: 'none' }) // Initially hide the lens.
        .appendAsChild(this.documentBody); // Attach the lens to the document body.

      // Store a reference to this VisualMagnifier instance directly on the host element's data.
      this.hostElement.setDataAttribute('magnifierInstance', this);

      // Create a temporary image element to load the high-resolution source image and determine its natural dimensions.
      this.imageSourceRef = jQueryInstance('<img>').setAttribute('src', this.currentConfiguration.sourceImageUrl);
      this.imageSourceRef.bindOnce('load', () => instanceContext.calculateZoomRatios())
                         .forEachElement(function() {
                           // Manually trigger the 'load' event if the image is already cached by the browser.
                           if (this.complete) {
                             jQueryInstance(this).trigger('load');
                           }
                         });

      // Bind the initial mousemove event listener to the host element.
      this.hostElement.attachEventHandler('mousemove', (eventObject) => instanceContext.handlePointerMovement(eventObject));

      // Attempt to compute the bounding box immediately if the host image is already loaded.
      if (this.hostElement[0].complete) {
        this.computeBoundingBox();
      } else {
        // Otherwise, ensure the bounding box is computed once the host image finishes loading.
        this.hostElement.bindOnce('load', () => instanceContext.computeBoundingBox())
                        .forEachElement(function() {
                          if (this.complete) {
                            jQueryInstance(this).trigger('load');
                          }
                        });
      }

      // Return the host element for jQuery chainability.
      return this.hostElement;
    }

    /**
     * @method assembleConfiguration
     * @param {object} userSettings - An object containing user-defined configuration properties.
     * @returns {object} A comprehensive configuration object, merging defaults, user settings, and mandatory overrides.
     * @description This method intelligently determines the target image and its source URL, then merges all configuration layers.
     */
    VisualMagnifier.prototype.assembleConfiguration = function(userSettings) {
      let candidateImageElement = this.hostElement;
      let resolvedImageUrl = null;

      // Logic to identify the actual image element and its high-resolution source URL.
      if (candidateImageElement.isOfType('a')) {
        // If the host is an anchor tag, look for an image within it.
        candidateImageElement = candidateImageElement.locateChild('img:first');
        resolvedImageUrl = userSettings.sourceImageUrl || this.hostElement.getAttributeValue('href');
      } else if (!candidateImageElement.isOfType('img')) {
        // If the host is not an image itself, search for the first image descendant.
        candidateImageElement = candidateImageElement.locateChild('img:first');
        resolvedImageUrl = userSettings.sourceImageUrl || this.hostElement.getDataAttribute('zoom') || (candidateImageElement.length > 0 ? candidateImageElement.getAttributeValue('src') : null);
      } else {
        // If the host element is already an image.
        resolvedImageUrl = userSettings.sourceImageUrl || this.hostElement.getDataAttribute('zoom') || candidateImageElement.getAttributeValue('src');
      }

      // Update the internal hostElement reference to point to the actual image element.
      if (candidateImageElement && candidateImageElement.length > 0) {
        this.hostElement = candidateImageElement;
      } else {
        console.error("VisualMagnifier: Failed to identify a suitable image element to apply the magnifier effect to.");
        resolvedImageUrl = resolvedImageUrl || ''; // Ensure URL is not null, even if empty.
      }

      // Perform a shallow merge of configuration objects.
      const mergedConfig = Object.assign({}, initialOptions, userSettings);

      // Finalize the source image URL and set the background image style for the lens.
      mergedConfig.sourceImageUrl = resolvedImageUrl || mergedConfig.sourceImageUrl;
      if (!mergedConfig.sourceImageUrl) {
        console.warn("VisualMagnifier: No valid source image URL found or provided. The magnifier may not function as expected.");
      }
      mergedConfig.lensStyles.backgroundImage = `url("${mergedConfig.sourceImageUrl}")`;
      mergedConfig.lensStyles.cursor = userSettings.pointerStyle || mergedConfig.pointerStyle;

      // Deep merge for lens styles to ensure all properties are correctly applied.
      mergedConfig.lensStyles = Object.assign({}, initialOptions.lensStyles, userSettings && userSettings.lensStyles, mandatoryConfig.lensStyles);

      // Ensure lensDimension is converted to a CSS pixel value.
      if (typeof mergedConfig.lensDimension === 'number') {
        mergedConfig.lensStyles.width = `${mergedConfig.lensDimension}px`;
        mergedConfig.lensStyles.height = `${mergedConfig.lensDimension}px`;
      }

      return mergedConfig;
    };

    /**
     * @method computeBoundingBox
     * @description Calculates the precise screen coordinates and dimensions of the host element, establishing the interactive area.
     */
    VisualMagnifier.prototype.computeBoundingBox = function() {
      const elementPosition = this.hostElement.getOffsetPosition();
      const elementWidth = this.hostElement.getWidthDimension();
      const elementHeight = this.hostElement.getHeightDimension();

      // Cache these values to prevent repeated DOM queries during mouse movement.
      this._cachedOffset = elementPosition;
      this._cachedDimensions = { width: elementWidth, height: elementHeight };

      // Instantiate a RectangleBounds object to represent the interactive region.
      this.interactionRegion = new RectangleBounds(
        elementPosition.top,
        elementPosition.left + elementWidth,
        elementPosition.top + elementHeight,
        elementPosition.left
      );
      // console.debug("Computed Interaction Region:", this.interactionRegion.toString()); // Debugging output.
    };

    /**
     * @method initializeDisplay
     * @description Performs final display setup and sets the initial state of the magnifier lens.
     * @private
     */
    VisualMagnifier.prototype.initializeDisplay = function() {
      // Apply the finalized CSS styles to the magnifying lens only once.
      if (!this._internalState.isInitialized) {
        this.magnifyingGlass.applyCssStyles(this.currentConfiguration.lensStyles);
        this._internalState.isInitialized = true;
      }
      // Ensure the magnifier starts in a deactivated (hidden) state.
      this.deactivateMagnifier();
    };

    /**
     * @method calculateZoomRatios
     * @description Determines the scaling factors (X and Y) between the full-size source image and its displayed version.
     */
    VisualMagnifier.prototype.calculateZoomRatios = function() {
      const originalWidth = this.imageSourceRef[0].naturalWidth || this.imageSourceRef[0].width;
      const originalHeight = this.imageSourceRef[0].naturalHeight || this.imageSourceRef[0].height;
      const displayWidth = this.hostElement[0].width;
      const displayHeight = this.hostElement[0].height;

      // Guard against division by zero if the display element has no dimensions.
      if (displayWidth === 0 || displayHeight === 0) {
        console.error("VisualMagnifier: The display element has zero width or height, preventing accurate ratio calculation.");
        this.scaleFactorX = 1; // Default to 1 to prevent errors.
        this.scaleFactorY = 1;
        return;
      }

      this.scaleFactorX = originalWidth / displayWidth;
      this.scaleFactorY = originalHeight / displayHeight;

      // Clean up the temporary image element used for ratio calculation.
      this.imageSourceRef.removeElement();
      delete this.imageSourceRef; // Explicitly remove the reference.

      // After ratios are determined, proceed with final display initialization.
      this.initializeDisplay();
    };

    /**
     * @method handlePointerMovement
     * @param {MouseEvent} eventObject - The native mouse event object.
     * @description This method is the core event handler for mouse movement, controlling lens position and visibility.
     */
    VisualMagnifier.prototype.handlePointerMovement = function(eventObject) {
      // Early exit if the interaction region hasn't been computed or the magnifier isn't fully initialized.
      if (!this.interactionRegion || !this._internalState.isInitialized) {
        // Attempt to compute bounds if they're missing and the host image is ready.
        if (!this.interactionRegion && this.hostElement[0].complete) {
          this.computeBoundingBox();
        }
        return;
      }

      const currentCursorX = eventObject.pageX;
      const currentCursorY = eventObject.pageY;
      const lensDiameter = this.currentConfiguration.lensDimension;
      const lensRadius = lensDiameter * 0.5;

      // Check if the mouse cursor is outside the defined interactive area.
      if (!this.interactionRegion.encompassesPoint(currentCursorX, currentCursorY)) {
        if (this._internalState.isActive) {
          this.deactivateMagnifier(); // Hide the lens if the cursor leaves the host element.
        }
        return; // Stop further processing if outside the bounds.
      }

      // If the lens is not currently active, activate it.
      if (!this._internalState.isActive) {
        this.activateMagnifier(false); // Activate without animation for immediate response.
      }

      // Calculate the background position for the magnified image within the lens.
      // This creates the illusion of magnification by shifting the background image.
      const relativeX = currentCursorX - this._cachedOffset.left;
      const relativeY = currentCursorY - this._cachedOffset.top;

      const bgOffsetX = -((relativeX * this.scaleFactorX) - lensRadius);
      const bgOffsetY = -((relativeY * this.scaleFactorY) - lensRadius);

      // Calculate the screen position for the magnifying lens, centering it under the cursor.
      const lensLeft = currentCursorX - lensRadius;
      const lensTop = currentCursorY - lensRadius;

      // Apply the calculated positions and background to the magnifying glass element.
      this.magnifyingGlass.applyCssStyles({
        left: `${lensLeft}px`,
        top: `${lensTop}px`,
        backgroundPosition: `${bgOffsetX}px ${bgOffsetY}px`
      });

      // Trigger the 'onLensMoved' callback for custom external logic.
      this.currentConfiguration.onLensMoved(this.magnifyingGlass);
    };

    /*
     * Public API Methods for controlling the magnifier's visibility and state.
     */

    /**
     * @method activateMagnifier
     * @param {boolean} [animateTransition=true] - If true, the lens will appear with a fade-in animation (if supported).
     * @returns {VisualMagnifier} Returns the current instance of the magnifier for method chaining.
     * @description Makes the magnifying lens visible and sets up continuous mouse tracking.
     */
    VisualMagnifier.prototype.activateMagnifier = function(animateTransition = true) {
      if (this._internalState.isActive) {
        return this; // Do nothing if the magnifier is already active.
      }

      this.computeBoundingBox(); // Re-calculate bounds in case the host element has moved or resized.

      // Detach the mousemove handler from the host element and re-attach it to the document body.
      // This allows the lens to track the mouse even if it temporarily leaves the host element while active.
      this.hostElement.detachEventHandler('mousemove');
      this.documentBody.attachEventHandler('mousemove', (eventObject) => this.handlePointerMovement(eventObject));

      // Display the lens, optionally with an animation.
      if (animateTransition && this.currentConfiguration.animationEffect) {
        // Placeholder for a robust animation implementation (e.g., using jQuery's animate or CSS transitions).
        this.magnifyingGlass.fadeIn(200); // Example: jQuery fade-in.
      } else {
        this.magnifyingGlass.applyCssStyles({
          opacity: 1,
          display: 'block',
          cursor: this.currentConfiguration.lensStyles.cursor
        });
      }

      this._internalState.isActive = true; // Update internal state.
      this.hostElement.trigger('magnifier:activated', [this.magnifyingGlass]); // Trigger a custom event.
      this.currentConfiguration.onLensActivated(this.magnifyingGlass); // Invoke the callback.

      return this;
    };

    /**
     * @method deactivateMagnifier
     * @param {boolean} [animateTransition=true] - If true, the lens will disappear with a fade-out animation (if supported).
     * @returns {VisualMagnifier} Returns the current instance of the magnifier for method chaining.
     * @description Hides the magnifying lens and restores event bindings to only react when entering the host element.
     */
    VisualMagnifier.prototype.deactivateMagnifier = function(animateTransition = true) {
      if (!this._internalState.isActive) {
        return this; // Do nothing if the magnifier is already inactive.
      }

      // Detach the global mousemove handler from the document body.
      this.documentBody.detachEventHandler('mousemove');
      // Re-attach the mousemove handler to the host element, so it only becomes active again when the cursor re-enters.
      this.hostElement.attachEventHandler('mousemove', (eventObject) => this.handlePointerMovement(eventObject));

      // Hide the lens, optionally with an animation.
      if (animateTransition && this.currentConfiguration.animationEffect) {
        // Placeholder for a robust animation implementation.
        this.magnifyingGlass.fadeOut(200, () => {
          this.magnifyingGlass.applyCssStyles({ display: 'none', cursor: 'default' });
        });
      } else {
        this.magnifyingGlass.applyCssStyles({
          opacity: 0,
          display: 'none',
          cursor: 'default'
        });
      }

      this._internalState.isActive = false; // Update internal state.
      this.hostElement.trigger('magnifier:deactivated', [this.magnifyingGlass]); // Trigger a custom event.
      this.currentConfiguration.onLensDeactivated(this.magnifyingGlass); // Invoke the callback.

      return this;
    };

    return VisualMagnifier;

  })();

  // Extend the jQuery prototype to add new utility methods and the main plugin function.
  (function(jqAlias) {
    // Add custom helper methods to jQuery.fn for cleaner, more semantic code within the plugin.
    jqAlias.fn.extend({
      // Binds an event handler that will execute only once.
      bindOnce: function(eventName, handler) {
        return this.one(eventName, handler);
      },
      // Iterates over each element in the jQuery collection, executing a callback.
      forEachElement: function(callback) {
        return this.each(callback);
      },
      // Checks if the current element matches a given selector type.
      isOfType: function(selector) {
        return this.is(selector);
      },
      // Finds descendant elements matching a selector.
      locateChild: function(selector) {
        return this.find(selector);
      },
      // Retrieves the value of a specified attribute.
      getAttributeValue: function(attributeName) {
        return this.attr(attributeName);
      },
      // Retrieves data stored on the element using jQuery's data method.
      getDataAttribute: function(dataKey) {
        return this.data(dataKey);
      },
      // Adds a CSS class to the element.
      addCssClass: function(className) {
        return this.addClass(className);
      },
      // Applies a set of CSS styles to the element.
      applyCssStyles: function(styles) {
        return this.css(styles);
      },
      // Appends the current element as a child to a specified parent.
      appendAsChild: function(parent) {
        return this.appendTo(parent);
      },
      // Sets the value of a specified attribute.
      setAttribute: function(attributeName, value) {
        return this.attr(attributeName, value);
      },
      // Removes the element from the DOM.
      removeElement: function() {
        return this.remove();
      },
      // Simplified check if the element is not currently animated by jQuery.
      isNotAnimated: function() {
        return !this.is(':animated');
      },
      // Retrieves the element's current offset position relative to the document.
      getOffsetPosition: function() {
        return this.offset();
      },
      // Retrieves the element's current width.
      getWidthDimension: function() {
        return this.width();
      },
      // Retrieves the element's current height.
      getHeightDimension: function() {
        return this.height();
      },
      // Attaches an event handler using jQuery's 'on' method.
      attachEventHandler: function(eventName, handler) {
        return this.on(eventName, handler);
      },
      // Detaches an event handler using jQuery's 'off' method.
      detachEventHandler: function(eventName) {
        return this.off(eventName);
      }
    });

    /**
     * @function initMagnifier
     * @memberof jQuery.fn
     * @param {object} [configParams={}] - Configuration options for the magnifier instance.
     * @returns {jQuery} The original jQuery object, allowing for method chaining.
     * @description The main jQuery plugin method to initialize a VisualMagnifier on selected elements.
     */
    return jqAlias.fn.initMagnifier = function(configParams = {}) {
      return this.forEachElement(function() {
        const currentElement = jqAlias(this);
        // The VisualMagnifier constructor handles checking for and returning existing instances.
        new VisualMagnifier(currentElement, configParams);
      });
    };
  })(jQueryInstance); // Pass the local jQueryInstance alias to the plugin closure.

}).call(this); // Execute the entire script within an IIFE to encapsulate variables.
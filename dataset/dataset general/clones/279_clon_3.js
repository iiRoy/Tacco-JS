(function( globalWindow ) {
  "use strict";

  // Cache document and window for minification and faster access
  const documentRef = document;
  const windowRef = globalWindow;

  /**
   * Initializes the SwipeCraft module.
   * @param {object|undefined} externalJQuery - Optional jQuery instance.
   */
  function initializeSwipeModule( externalJQuery ) {

    // SwipeCraft.js: A responsive content swiping utility.
    // This script enables touch-friendly, full-width/height content swiping.
    // It can operate standalone or as a jQuery plugin.

    /**
     * Base configuration object for SwipeCraft instances.
     * These are the default values that can be overridden by user settings.
     * @typedef {object} SwipeCraftConfig
     * @property {string} slideItemClass - CSS class for individual swipeable content panels.
     * @property {'horizontal'|'vertical'} swipeDirection - Primary direction of content movement.
     * @property {number} minimumDragDistance - Pixel threshold for a swipe gesture to register.
     * @property {Function} onSwipeStartCallback - Invoked before a swipe animation begins.
     * @property {Function} onSwipeEndCallback - Invoked after a swipe animation completes.
     * @property {Function} onDragStartCallback - Invoked when a drag interaction starts.
     * @property {Function} onDraggingCallback - Invoked during a drag interaction.
     * @property {Function} onDragEndCallback - Invoked when a drag interaction ends.
     * @property {Function} onModuleReadyCallback - Invoked after the component has initialized and sized its pages.
     * @property {boolean} enableKeyboardNav - If true, allows keyboard arrow navigation.
     * @property {boolean} haltPropagation - If true, stops event propagation for touch/mouse events.
     * @property {number} itemsPerView - Number of content items visible in one "page" (defaults to 1).
     * @property {number} boundaryPadding - Extra padding space (in pixels) for overscroll effect.
     * @property {number} spacingBetweenSlides - Pixel value for visual gap between slides.
     * @property {number} animationDurationMs - Duration of the swipe animation in milliseconds.
     * @property {boolean} disableUserInteraction - If true, prevents user dragging, only allowing programmatic swipes.
     */
    const baseConfigurations = {
      slideItemClass       : "dragend-page", // Renamed from pageClass
      swipeDirection       : "horizontal",   // Renamed from direction
      minimumDragDistance  : 40,             // Renamed from minDragDistance, changed type to number
      onSwipeStartCallback : emptyFunc,      // Renamed from onSwipeStart
      onSwipeEndCallback   : emptyFunc,      // Renamed from onSwipeEnd
      onDragStartCallback  : emptyFunc,      // Renamed from onDragStart
      onDraggingCallback   : emptyFunc,      // Renamed from onDrag
      onDragEndCallback    : emptyFunc,      // Renamed from onDragEnd
      onModuleReadyCallback: emptyFunc,      // Renamed from afterInitialize
      enableKeyboardNav    : false,          // Renamed from keyboardNavigation
      haltPropagation      : false,          // Renamed from stopPropagation
      itemsPerView         : 1,              // Renamed from itemsInPage
      boundaryPadding      : 0,              // Renamed from scribe
      spacingBetweenSlides : 0,              // Renamed from borderBetweenPages
      animationDurationMs  : 300,            // Renamed from duration
      disableUserInteraction: false           // Renamed from preventDrag
    };

    const isTouchDevice = 'ontouchstart' in windowRef;

    const touchStartEvt = isTouchDevice ? 'touchstart' : 'mousedown';
    const touchMoveEvt  = isTouchDevice ? 'touchmove'  : 'mousemove';
    const touchEndEvt   = isTouchDevice ? 'touchend'   : 'mouseup';

    // Map keyboard arrow keys to swipe directions
    const keyMap = {
      37: "left",
      38: "up",
      39: "right",
      40: "down"
    };

    const messageCatalog = {
      noPages: "No swipeable pages found within the container." // Renamed from errors.pages
    };

    // Base styling for the main wrapper element
    const wrapperStyling = {
      overflow: "hidden",
      padding : "0px", // Changed to string with 'px'
      position: "relative" // Added a new style property
    };

    /**
     * Feature detection for CSS properties.
     * @param {string} property - The CSS property to check.
     * @returns {boolean} True if the property (or its vendor-prefixed version) is supported.
     */
    const featureDetector = (function() {
       const testDiv = documentRef.createElement('div');
       const vendorPrefixes = 'Khtml Ms O Moz Webkit'.split(' ');
       let prefixCount = vendorPrefixes.length;

       return function( cssProperty ) {
          if ( cssProperty in testDiv.style ) return true;

          // Capitalize the first letter for vendor prefixing
          const capitalizedProp = cssProperty.charAt(0).toUpperCase() + cssProperty.slice(1);

          while( prefixCount-- ) {
             if ( vendorPrefixes[prefixCount] + capitalizedProp in testDiv.style ) {
                return true;
             }
          }
          return false;
       };
    })();

    const hasTransformSupport = featureDetector('transform');

    /** A no-operation function. */
    function emptyFunc() {}

    /** A function that always returns false. */
    function alwaysFalse() {
      return false;
    }

    /**
     * Applies a set of CSS styles to an HTML element.
     * @param {HTMLElement} targetElement - The element to style.
     * @param {object} styleProperties - An object where keys are CSS properties and values are their respective values.
     * @returns {HTMLElement} The styled element.
     */
    function applyElementStyles( targetElement, styleProperties ) {
      if (!targetElement || typeof targetElement.style === 'undefined') {
        console.warn("SwipeCraft: Attempted to style a non-element or null.", targetElement);
        return targetElement;
      }

      for ( const propKey in styleProperties ) {
        if ( Object.prototype.hasOwnProperty.call(styleProperties, propKey) ) {
          let propValue = styleProperties[propKey];

          // Append 'px' to numeric values for certain properties
          switch ( propKey ) {
            case "height":
            case "width":
            case "marginLeft":
            case "marginTop":
            case "paddingBottom": // Added a new case
            case "top":           // Added a new case
            case "left":          // Added a new case
              if (typeof propValue === 'number') {
                propValue += "px";
              }
              break;
            default:
              // No unit needed for this property
          }
          targetElement.style[propKey] = propValue;
        }
      }
      return targetElement;
    }

    /**
     * Merges properties from source object(s) into a destination object.
     * @param {object} destination - The target object to merge into.
     * @param {...object} sources - One or more source objects to merge from.
     * @returns {object} The modified destination object.
     */
    function mergeObjects( destination, ...sources ) { // Changed to rest parameters
      for (const source of sources) {
        if (source) { // Added null/undefined check
          for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              destination[key] = source[key];
            }
          }
        }
      }
      return destination;
    }

    /**
     * Creates a function that, when called, has its `this` keyword set to the provided value.
     * @param {Function} func - The function to bind.
     * @param {object} context - The object to bind as `this`.
     * @returns {Function} The bound function.
     */
    function bindContext( func, context ) {
      // Using Function.prototype.bind directly is more idiomatic
      return func.bind(context);
    }

    /**
     * Retrieves elements by class name, optionally using jQuery.
     * @param {string} className - The class name to search for.
     * @param {HTMLElement} rootElement - The root element to search within.
     * @returns {Array<HTMLElement>} An array of matching elements.
     */
    function findElementsByClass( className, rootElement ) {
      if ( externalJQuery && rootElement instanceof externalJQuery ) { // Adjusted jQuery check
        return rootElement.find("." + className).get(); // Use .get() to return native elements
      } else if (rootElement && typeof rootElement.getElementsByClassName === 'function') {
        // Convert HTMLCollection to Array for consistency
        return Array.from(rootElement.getElementsByClassName( className ));
      }
      return []; // Return an empty array if no root or method exists
    }

    /**
     * Animates a CSS property of an element.
     * @param {HTMLElement} targetElem - The element to animate.
     * @param {string} cssProperty - The CSS property to animate (e.g., 'marginLeft', 'transform').
     * @param {number} targetValue - The final value for the property.
     * @param {number} durationMs - The animation duration in milliseconds.
     * @param {Function} [completionCallback] - Callback function to execute after animation.
     */
    function transitionElement( targetElem, cssProperty, targetValue, durationMs, completionCallback ) {
      if (!targetElem) {
        console.warn("SwipeCraft: Cannot animate a null element.");
        if (completionCallback) completionCallback();
        return;
      }

      const styleObj = {};
      styleObj[cssProperty] = targetValue;

      if (externalJQuery) {
        externalJQuery(targetElem).animate(styleObj, durationMs, completionCallback);
      } else {
        // Fallback for non-jQuery: directly apply style, no animation
        // For a true animation without jQuery, CSS transitions would be needed.
        // For simplicity and direct clone, we just set the style.
        // A more robust clone would implement a basic JS animation loop or CSS transition.
        applyElementStyles(targetElem, styleObj);
        if (completionCallback) {
          // Simulate async callback for non-jQuery animation
          setTimeout(completionCallback, durationMs);
        }
      }
    }

    /**
     * Extracts X and Y coordinates from a touch or mouse event.
     * @param {Event} interactionEvent - The DOM event object.
     * @returns {{x: number, y: number}} An object with x and y coordinates.
     */
    function getPointerCoordinates( interactionEvent ) {
      // Prioritize changedTouches for 'touchend' events, otherwise use 'touches'
      const touchData = interactionEvent.touches && interactionEvent.touches.length > 0
                        ? interactionEvent.touches
                        : interactionEvent.changedTouches;

      // Ensure we have touch data if it's a touch event
      if (isTouchDevice && (!touchData || touchData.length === 0)) {
        return { x: 0, y: 0 }; // Return zero if no touch data for touch event
      }

      return {
        x: isTouchDevice ? touchData[0].pageX : interactionEvent.pageX,
        y: isTouchDevice ? touchData[0].pageY : interactionEvent.pageY
      };
    }

    /**
     * Main SwipeCraft class constructor.
     * @param {HTMLElement} hostElement - The DOM element that will contain the swipeable pages.
     * @param {SwipeCraftConfig} userSettings - User-defined configuration options.
     */
    function SwipeCraft( hostElement, userSettings ) {
      // Validate hostElement early
      if (!(hostElement instanceof HTMLElement)) {
        console.error("SwipeCraft: Invalid host element provided. Must be an HTMLElement.");
        return; // Exit if hostElement is not valid
      }

      const initialConfig = mergeObjects( {}, baseConfigurations ); // Create a fresh copy of defaults
      this.configOptions = mergeObjects( initialConfig, userSettings ); // Renamed from settings
      this.hostElement   = hostElement; // Renamed from container

      this.viewportElement = documentRef.createElement( "div" ); // Renamed from pageContainer
      this.boundaryOffsets = { x: 0, y: 0 }; // Renamed from scrollBorder
      this.currentPageIndex = 0; // Renamed from page
      this.blockScrollMovement = false; // Renamed from preventScroll
      this.pageComponentStyles = { // Renamed from pageCssProperties
        margin: "0px" // Ensure unit consistency
      };
      this.initialPointerPosition = { x: 0, y: 0 }; // Renamed from startCoords

      // Bind event handlers to the instance context
      this.handleInteractionStart = bindContext( this._onStartEvent, this ); // Renamed
      this.handleInteractionMove  = bindContext( this._onMoveEvent, this );  // Renamed
      this.handleInteractionEnd   = bindContext( this._onEndEvent, this );   // Renamed
      this.handleKeyboardInput    = bindContext( this._onKeyboardEvent, this ); // Renamed
      this.recalculatePageDimensions = bindContext( this._resizePages, this ); // Renamed
      this.postScrollAnimation    = bindContext( this._afterScrollCompletion, this ); // Renamed

      // Clone original content into viewportElement, then clear host and append viewport
      const originalContent = hostElement.cloneNode(true).innerHTML;
      this.viewportElement.innerHTML = originalContent;
      hostElement.innerHTML = ""; // Clear original content
      hostElement.appendChild( this.viewportElement );

      // Determine scroll implementation based on transform support
      this.applyCurrentScroll = hasTransformSupport ? this._scrollWithCssTransform : this._scrollWithLeftTop; // Renamed
      this.performAnimatedScroll = hasTransformSupport ? this._animateScrollWithCssTransform : this._animateScrollWithLeftTop; // Renamed

      // Apply initial container styles
      applyElementStyles(hostElement, wrapperStyling);

      // Delay initialization to allow DOM to render and get correct dimensions
      setTimeout( bindContext(function() {
          this.refreshConfiguration( userSettings ); // Renamed from updateInstance
          if (!this.configOptions.disableUserInteraction) {
            this.setupEventListeners(); // Renamed from _observe
          }
          this.configOptions.onModuleReadyCallback.call(this);
      }, this), 15 ); // Slightly increased timeout for robustness
    }

    /**
     * Adds an event listener to an element.
     * @param {HTMLElement} element - The target element.
     * @param {string} eventName - The name of the event.
     * @param {Function} handler - The event handler function.
     */
    function attachDOMListener( element, eventName, handler ) {
      if ( externalJQuery ) {
        externalJQuery(element).on(eventName, handler);
      } else {
        element.addEventListener(eventName, handler, false);
      }
    }

    /**
     * Removes an event listener from an element.
     * @param {HTMLElement} element - The target element.
     * @param {string} eventName - The name of the event.
     * @param {Function} handler - The event handler function.
     */
    function detachDOMListener( element, eventName, handler ) {
      if ( externalJQuery ) {
        externalJQuery(element).off(eventName, handler);
      } else {
        element.removeEventListener(eventName, handler, false);
      }
    }

    mergeObjects(SwipeCraft.prototype, {

      // Private methods (prefixed with underscore for convention)
      // =========================================================

      /**
       * Evaluates if a drag movement is entering an overscroll boundary.
       * This method applies a "rubber-band" effect at the start/end of the swipeable area.
       * @param {string} movementDirection - 'left', 'right', 'up', or 'down'.
       * @param {number} currentXOffset - The current X-axis offset from the start of the drag.
       * @param {number} currentYOffset - The current Y-axis offset from the start of the drag.
       * @returns {{x: number, y: number, isOverscroll: boolean}} Adjusted coordinates and overscroll flag.
       */
      evaluateBoundaryScroll: function( movementDirection, currentXOffset, currentYOffset ) {
        const adjustedCoords = {
          x: currentXOffset,
          y: currentYOffset,
          isOverscroll: true // Assume overscroll initially
        };

        const pageDimension = this.pageMetrics; // Renamed from pageDimentions
        const totalPageCount = this.totalPageCount; // Renamed from pagesCount
        const spacing = this.configOptions.spacingBetweenSlides; // Renamed

        // Determine maximum scrollable extent based on direction
        let maxScrollX = (totalPageCount - 1) * (pageDimension.width + spacing);
        let maxScrollY = (totalPageCount - 1) * (pageDimension.height + spacing);

        switch ( movementDirection ) {
          case "right": // Swiping right, moving content left (negative offset)
            if ( this.boundaryOffsets.x >= 0 ) { // If at or past the leftmost boundary
              adjustedCoords.x = Math.round(currentXOffset * 0.2); // Apply friction (0.2 instead of 1/5)
              return adjustedCoords;
            }
            break;

          case "left": // Swiping left, moving content right (positive offset)
            if ( this.boundaryOffsets.x <= -maxScrollX ) { // If at or past the rightmost boundary
              adjustedCoords.x = Math.round(currentXOffset + (this.boundaryOffsets.x + maxScrollX) * 0.2);
              return adjustedCoords;
            }
            break;

          case "down": // Swiping down, moving content up (negative offset)
            if ( this.boundaryOffsets.y >= 0 ) { // If at or past the topmost boundary
              adjustedCoords.y = Math.round(currentYOffset * 0.2);
              return adjustedCoords;
            }
            break;

          case "up": // Swiping up, moving content down (positive offset)
            if ( this.boundaryOffsets.y <= -maxScrollY ) { // If at or past the bottommost boundary
              adjustedCoords.y = Math.round(currentYOffset + (this.boundaryOffsets.y + maxScrollY) * 0.2);
              return adjustedCoords;
            }
            break;
          default:
            // No specific overscroll handling for unknown direction
            break;
        }

        // If no overscroll condition met, return original values with isOverscroll set to false
        adjustedCoords.x = currentXOffset - this.boundaryOffsets.x;
        adjustedCoords.y = currentYOffset - this.boundaryOffsets.y;
        adjustedCoords.isOverscroll = false;
        return adjustedCoords;
      },

      /**
       * Sets up all necessary event listeners for drag, resize, and keyboard navigation.
       */
      setupEventListeners: function() {
        if (!this.hostElement) {
          console.error("SwipeCraft: Host element is missing, cannot set up event listeners.");
          return;
        }

        attachDOMListener(this.hostElement, touchStartEvt, this.handleInteractionStart);
        // Prevent default browser drag/selection behavior
        this.hostElement.onselectstart = alwaysFalse;
        this.hostElement.ondragstart = alwaysFalse;

        if ( this.configOptions.enableKeyboardNav ) {
          attachDOMListener(documentRef.body, "keydown", this.handleKeyboardInput);
        }

        attachDOMListener(windowRef, "resize", this.recalculatePageDimensions);
      },

      /**
       * Handles the start of a touch or mouse interaction.
       * @param {Event} evt - The DOM event object.
       */
      _onStartEvent: function( evt ) {
        // Normalize event for jQuery or native
        const actualEvent = evt.originalEvent || evt;

        if (this.configOptions.haltPropagation) {
          actualEvent.stopPropagation();
        }

        // Attach move and end listeners to the document body to capture events
        // even if the pointer moves outside the host element.
        attachDOMListener(documentRef.body, touchMoveEvt, this.handleInteractionMove);
        attachDOMListener(documentRef.body, touchEndEvt, this.handleInteractionEnd);

        this.initialPointerPosition = getPointerCoordinates(actualEvent);
        this.blockScrollMovement = false; // Reset scroll block on start

        this.configOptions.onDragStartCallback.call( this, actualEvent );
      },

      /**
       * Handles the movement during a touch or mouse interaction.
       * @param {Event} evt - The DOM event object.
       */
      _onMoveEvent: function( evt ) {
        const actualEvent = evt.originalEvent || evt;

        // Ignore multi-touch gestures (e.g., pinch-to-zoom)
        if ( isTouchDevice && actualEvent.touches && actualEvent.touches.length > 1 || actualEvent.scale && actualEvent.scale !== 1) {
          return;
        }

        actualEvent.preventDefault(); // Prevent default scrolling behavior
        if (this.configOptions.haltPropagation) {
          actualEvent.stopPropagation();
        }

        const interactionData = this.decodeInteractionEvent(actualEvent);
        const scrollData = this.evaluateBoundaryScroll(
          interactionData.swipeDirection,
          -interactionData.distanceX,
          -interactionData.distanceY
        );

        this.configOptions.onDraggingCallback.call(
          this,
          this.currentActivePage, // Renamed from activeElement
          interactionData,
          scrollData.isOverscroll,
          actualEvent
        );

        if ( !this.blockScrollMovement ) {
          this.applyCurrentScroll( scrollData );
        }
      },

      /**
       * Handles the end of a touch or mouse interaction.
       * @param {Event} evt - The DOM event object.
       */
      _onEndEvent: function( evt ) {
        const actualEvent = evt.originalEvent || evt;

        if (this.configOptions.haltPropagation) {
          actualEvent.stopPropagation();
        }

        const interactionMetrics = this.decodeInteractionEvent(actualEvent);

        // Reset initial position
        this.initialPointerPosition = { x: 0, y: 0 };

        const absDistanceX = Math.abs(interactionMetrics.distanceX);
        const absDistanceY = Math.abs(interactionMetrics.distanceY);
        const minDragThreshold = this.configOptions.minimumDragDistance;

        if ( absDistanceX > minDragThreshold || absDistanceY > minDragThreshold) {
          // A significant drag occurred, initiate a swipe
          this.navigatePage( interactionMetrics.swipeDirection ); // Renamed from swipe
        } else if (absDistanceX > 0 || absDistanceY > 0) {
          // Small drag, but not enough for a swipe, snap back to current page
          this.scrollToCurrentPage(); // Renamed from _scrollToPage
        }

        this.configOptions.onDragEndCallback.call(
          this,
          this.hostElement,
          this.currentActivePage,
          this.currentPageIndex + 1,
          actualEvent
        );

        // Clean up move and end listeners
        detachDOMListener(documentRef.body, touchMoveEvt, this.handleInteractionMove);
        detachDOMListener(documentRef.body, touchEndEvt, this.handleInteractionEnd);
      },

      /**
       * Parses an event object to extract drag distances and inferred direction.
       * @param {Event} evt - The DOM event object.
       * @returns {{distanceX: number, distanceY: number, swipeDirection: string}} Object with distance and direction.
       */
      decodeInteractionEvent: function( evt ) {
        const currentPointer = getPointerCoordinates(evt);
        const deltaX = this.initialPointerPosition.x - currentPointer.x;
        const deltaY = this.initialPointerPosition.y - currentPointer.y;

        return this.augmentWithDistanceMetrics( deltaX, deltaY );
      },

      /**
       * Adds distance and direction properties to an event data object.
       * @param {number} xDelta - The change in X-coordinate.
       * @param {number} yDelta - The change in Y-coordinate.
       * @returns {{distanceX: number, distanceY: number, swipeDirection: string}}
       */
      augmentWithDistanceMetrics: function( xDelta, yDelta ) {
        const eventData = {
          distanceX: 0,
          distanceY: 0,
          swipeDirection: ""
        };

        if ( this.configOptions.swipeDirection === "horizontal" ) {
          eventData.distanceX = xDelta;
          eventData.swipeDirection = xDelta > 0 ? "left" : "right";
        } else { // Vertical swipe
          eventData.distanceY = yDelta;
          eventData.swipeDirection = yDelta > 0 ? "up" : "down";
        }

        return eventData;
      },

      /**
       * Handles keyboard arrow key presses for navigation.
       * @param {KeyboardEvent} evt - The keyboard event object.
       */
      _onKeyboardEvent: function( evt ) {
        const directionKey = keyMap[evt.keyCode];

        if ( directionKey ) {
          evt.preventDefault(); // Prevent default browser scroll behavior
          this.scrollToCurrentPage(directionKey);
        }
      },

      /**
       * Configures CSS properties for horizontal layout.
       */
      configureHorizontalLayout: function() {
        mergeObjects( this.pageComponentStyles, {
          "float"        : "left", // Renamed from cssFloat
          "overflowY"    : "auto",
          "overflowX"    : "hidden",
          "padding"      : "0px",
          "display"      : "block",
          "height"       : `${this.pageMetrics.height}px` // Added height explicitly
        });

        const totalWidth = (this.pageMetrics.width + this.configOptions.spacingBetweenSlides) * this.totalPageCount;
        applyElementStyles(this.viewportElement, {
          "overflow"                   : "hidden",
          "width"                      : `${totalWidth}px`, // Use template literal
          "boxSizing"                  : "content-box",
          "-webkit-backface-visibility": "hidden",
          "-webkit-perspective"        : "1000px", // Added 'px'
          "margin"                     : "0px",
          "padding"                    : "0px",
          "position"                   : "relative" // Added position
        });
      },

      /**
       * Configures CSS properties for vertical layout.
       */
      configureVerticalLayout: function() {
        mergeObjects( this.pageComponentStyles, {
          "overflow"    : "hidden",
          "padding"     : "0px",
          "display"     : "block",
          "width"       : `${this.pageMetrics.width}px` // Added width explicitly
        });

        const totalHeight = (this.pageMetrics.height + this.configOptions.spacingBetweenSlides) * this.totalPageCount;
        applyElementStyles(this.viewportElement, {
          "paddingBottom"              : `${this.configOptions.boundaryPadding}px`, // Renamed from scribe
          "height"                     : `${totalHeight}px`, // Use template literal
          "boxSizing"                  : "content-box",
          "-webkit-backface-visibility": "hidden",
          "-webkit-perspective"        : "1000px",
          "margin"                     : "0px",
          "padding"                    : "0px",
          "position"                   : "relative"
        });
      },

      /**
       * Recalculates dimensions of pages and updates layout.
       */
      _resizePages: function() { // Renamed from _sizePages
        const hostElem = this.hostElement;
        if (!hostElem) {
          console.warn("SwipeCraft: Host element not found during resize operation.");
          return;
        }

        const currentHostWidth = hostElem.offsetWidth;
        const currentHostHeight = hostElem.offsetHeight;

        // Store page dimensions
        this.pageMetrics = { // Renamed from pageDimentions
          width: currentHostWidth / this.configOptions.itemsPerView,
          height: currentHostHeight
        };

        this.pageElements = findElementsByClass(this.configOptions.slideItemClass, this.viewportElement); // Renamed

        if ( this.pageElements.length === 0 ) {
          console.warn("SwipeCraft: " + messageCatalog.noPages);
          return;
        }

        this.totalPageCount = this.pageElements.length; // Renamed from pagesCount

        if (this.configOptions.swipeDirection === "horizontal") {
          this.configureHorizontalLayout();
        } else {
          this.configureVerticalLayout();
        }

        this.pageElements.forEach( bindContext(function(pageElem, index) {
          this._applyPageSpecificStyles(pageElem, index); // Renamed
        }, this));

        // Ensure we snap back to the current page after resize
        this.scrollToCurrentPage();
      },

      /**
       * Applies specific styles to an individual page element.
       * @param {HTMLElement} pageItem - The page element.
       * @param {number} index - The index of the page.
       */
      _applyPageSpecificStyles: function(pageItem, index) { // Renamed from _setPageCss
        if (!pageItem) return;

        const currentStyles = mergeObjects( {}, this.pageComponentStyles ); // Clone for modification

        if (this.configOptions.swipeDirection === "horizontal") {
          currentStyles.width = `${this.pageMetrics.width}px`;
          currentStyles.marginRight = `${this.configOptions.spacingBetweenSlides}px`;
        } else {
          currentStyles.height = `${this.pageMetrics.height}px`;
          currentStyles.marginBottom = `${this.configOptions.spacingBetweenSlides}px`;
        }

        applyElementStyles(pageItem, currentStyles);
      },

      /**
       * Scrolls the viewport using CSS transform properties.
       * @param {{x: number, y: number}} coords - Target X and Y coordinates.
       */
      _scrollWithCssTransform: function( coords ) { // Renamed from _scrollWithTransform
        const transformValue = `translate3d(${coords.x}px, ${coords.y}px, 0)`;
        applyElementStyles(this.viewportElement, {
          "-webkit-transform": transformValue,
          "-moz-transform": transformValue,
          "-ms-transform": transformValue,
          "-o-transform": transformValue,
          "transform": transformValue
        });

        this.boundaryOffsets.x = coords.x;
        this.boundaryOffsets.y = coords.y;
      },

      /**
       * Scrolls the viewport using `left` and `top` CSS properties (fallback).
       * @param {{x: number, y: number}} coords - Target X and Y coordinates.
       */
      _scrollWithLeftTop: function( coords ) { // Renamed from _scrollWithoutTransform
        applyElementStyles(this.viewportElement, {
          "left": coords.x,
          "top": coords.y
        });

        this.boundaryOffsets.x = coords.x;
        this.boundaryOffsets.y = coords.y;
      },

      /**
       * Animates the viewport scroll using CSS transform.
       * @param {{x: number, y: number}} coords - Target X and Y coordinates.
       * @param {Function} callback - Callback after animation.
       */
      _animateScrollWithCssTransform: function( coords, callback ) { // Renamed from _animateScrollWithTransform
        const duration = `${this.configOptions.animationDurationMs}ms`;
        const easing = "ease-out"; // Added an easing property

        applyElementStyles(this.viewportElement, {
          "-webkit-transition": `-webkit-transform ${duration} ${easing}`,
          "-moz-transition": `-moz-transform ${duration} ${easing}`,
          "-ms-transition": `-ms-transform ${duration} ${easing}`,
          "-o-transition": `-o-transform ${duration} ${easing}`,
          "transition": `transform ${duration} ${easing}`
        });

        this._scrollWithCssTransform(coords); // Apply the transform immediately

        // Clear transition styles after animation to avoid interfering with drag
        setTimeout( bindContext(function() {
          applyElementStyles(this.viewportElement, {
            "-webkit-transition": "", "-moz-transition": "", "-ms-transition": "", "-o-transition": "", "transition": ""
          });
          if (callback) callback();
        }, this), this.configOptions.animationDurationMs);
      },

      /**
       * Animates the viewport scroll using `left` and `top` (fallback).
       * @param {{x: number, y: number}} coords - Target X and Y coordinates.
       * @param {Function} callback - Callback after animation.
       */
      _animateScrollWithLeftTop: function( coords, callback ) { // Renamed from _animateScrollWithoutTransform
        const duration = this.configOptions.animationDurationMs;
        const targetProp = this.configOptions.swipeDirection === "horizontal" ? "left" : "top";
        const targetValue = this.configOptions.swipeDirection === "horizontal" ? coords.x : coords.y;

        transitionElement(
          this.viewportElement,
          targetProp,
          targetValue,
          duration,
          callback
        );

        this.boundaryOffsets.x = coords.x;
        this.boundaryOffsets.y = coords.y;
      },

      /**
       * Callback executed after a scroll animation completes.
       */
      _afterScrollCompletion: function() { // Renamed from _afterScrollTransform
        this.blockScrollMovement = false;
        this.configOptions.onSwipeEndCallback.call(
          this,
          this.currentActivePage,
          this.currentPageIndex + 1
        );
      },

      /**
       * Determines the target page based on current position and drag direction.
       * @param {string} swipeDirection - The direction of the swipe ('left', 'right', 'up', 'down').
       * @returns {number} The index of the target page.
       */
      _determineTargetPage: function( swipeDirection ) { // Renamed from _determinePage
        let newPageIndex = this.currentPageIndex;

        switch ( swipeDirection ) {
          case "left":
          case "up":
            newPageIndex = Math.min(this.totalPageCount - 1, newPageIndex + 1);
            break;
          case "right":
          case "down":
            newPageIndex = Math.max(0, newPageIndex - 1);
            break;
          default:
            // No change for invalid direction
            break;
        }
        return newPageIndex;
      },

      /**
       * Calculates the new page index given a movement command.
       * @param {string|number} command - 'up', 'down', 'left', 'right' or a page number.
       * @param {number} [pageNumber] - The specific page number if command is 'page'.
       * @returns {number} The calculated page index.
       */
      _getNewPageIndex: function( command, pageNumber ) { // Renamed from _getNewPage
        let targetIndex = this.currentPageIndex;
        const lastPageIndex = this.totalPageCount - 1;

        switch ( typeof command ) {
          case "string":
            if (command === "page") {
              targetIndex = Math.max(0, Math.min(lastPageIndex, pageNumber - 1));
            } else { // Directional commands
              targetIndex = this._determineTargetPage(command);
            }
            break;
          case "number": // Direct page index (0-based)
            targetIndex = Math.max(0, Math.min(lastPageIndex, command));
            break;
          default:
            targetIndex = 0; // Default to first page if command is invalid
        }
        return targetIndex;
      },

      /**
       * Sets the current active page and updates the UI.
       * @param {number} pageIdx - The 0-based index of the page to set as active.
       */
      _setActivePage: function( pageIdx ) { // Renamed from _setPage
        if (pageIdx < 0 || pageIdx >= this.totalPageCount) {
          console.warn(`SwipeCraft: Attempted to set invalid page index: ${pageIdx}.`);
          return;
        }

        this.currentPageIndex = pageIdx;
        this.currentActivePage = this.pageElements[this.currentPageIndex]; // Renamed

        // Trigger events
        this._triggerSwipeEvents(this.currentActivePage, this.currentPageIndex + 1); // Renamed
      },

      /**
       * Triggers swipe-related callback events.
       * @param {HTMLElement} activePage - The currently active page element.
       * @param {number} pageNum - The 1-based page number.
       */
      _triggerSwipeEvents: function(activePage, pageNum) { // Renamed from _triggerEvents
        this.configOptions.onSwipeStartCallback.call(this, activePage, pageNum);
      },

      // Public API
      // ==========

      /**
       * Updates the instance configuration with new settings.
       * @param {object} newConfig - New configuration options.
       */
      refreshConfiguration: function( newConfig ) { // Renamed from updateInstance
        if (newConfig) {
          mergeObjects(this.configOptions, newConfig);
        }

        // Re-size and re-layout pages based on new settings
        this.recalculatePageDimensions();

        // Re-observe if preventDrag changed
        if (this.configOptions.disableUserInteraction) {
          this._removeEventListeners(); // Added helper to remove
        } else {
          this.setupEventListeners();
        }
      },

      /**
       * Programmatically navigates to a different page.
       * @param {string|number} action - 'up', 'down', 'left', 'right', or a 0-based page index.
       * @param {number} [pageNumber] - Optional page number if `action` is 'page'.
       */
      navigatePage: function( action, pageNumber ) { // Renamed from swipe
        const targetPage = this._getNewPageIndex(action, pageNumber);
        if (targetPage === this.currentPageIndex && action !== "page") {
          // If no change in page for directional swipe, just snap back
          this.scrollToCurrentPage();
          return;
        }
        this._setActivePage(targetPage);
        this.scrollToCurrentPage();
      },

      /**
       * Scrolls the viewport to the currently active page.
       * This method is also used to snap back after a small drag.
       * @param {string} [directionHint] - Optional hint for the direction of the swipe that led to this scroll.
       */
      scrollToCurrentPage: function( directionHint ) { // Renamed from _scrollToPage
        this.blockScrollMovement = true; // Block further manual scrolling during animation

        let targetX = 0;
        let targetY = 0;
        const pageMetrics = this.pageMetrics;
        const spacing = this.configOptions.spacingBetweenSlides;

        if (this.configOptions.swipeDirection === "horizontal") {
          targetX = -this.currentPageIndex * (pageMetrics.width + spacing);
        } else {
          targetY = -this.currentPageIndex * (pageMetrics.height + spacing);
        }

        const scrollTargetCoords = { x: targetX, y: targetY };
        this.performAnimatedScroll(scrollTargetCoords, this.postScrollAnimation);
      },

      /**
       * Removes all event listeners and cleans up the instance.
       */
      destroy: function() {
        this._removeEventListeners();

        // Restore original content if possible (optional, depends on desired behavior)
        // For now, just clear the viewport and remove it.
        if (this.viewportElement && this.viewportElement.parentNode === this.hostElement) {
          this.hostElement.innerHTML = this.viewportElement.innerHTML; // Attempt to restore content
          this.hostElement.removeChild(this.viewportElement);
        }
        this.hostElement.onselectstart = null;
        this.hostElement.ondragstart = null;

        // Nullify references to aid garbage collection
        this.hostElement = null;
        this.viewportElement = null;
        this.pageElements = null;
        this.configOptions = null;
      },

      /**
       * Helper to remove all attached event listeners.
       */
      _removeEventListeners: function() {
        if (this.hostElement) {
          detachDOMListener(this.hostElement, touchStartEvt, this.handleInteractionStart);
          detachDOMListener(documentRef.body, touchMoveEvt, this.handleInteractionMove);
          detachDOMListener(documentRef.body, touchEndEvt, this.handleInteractionEnd);
        }
        if (this.configOptions.enableKeyboardNav) {
          detachDOMListener(documentRef.body, "keydown", this.handleKeyboardInput);
        }
        detachDOMListener(windowRef, "resize", this.recalculatePageDimensions);
      }

    }); // End mergeObjects(SwipeCraft.prototype, ...)

    // jQuery Plugin Integration
    if ( externalJQuery ) {
      const pluginName = 'swipeCraft'; // Renamed plugin name

      externalJQuery.fn[pluginName] = function( option, ...args ) { // Use rest parameters for args
        return this.each(function() {
          let instance = externalJQuery.data(this, 'plugin_' + pluginName); // Use jQuery's data method
          const currentOptions = typeof option === 'object' && option;

          if (!instance) {
            instance = new SwipeCraft(this, currentOptions);
            externalJQuery.data(this, 'plugin_' + pluginName, instance);
          }

          if (typeof option === 'string' && typeof instance[option] === 'function') {
            instance[option](...args); // Call method with arguments
          } else if (typeof option === 'number' || (typeof option === 'string' && ['up', 'down', 'left', 'right', 'page'].includes(option))) {
            instance.navigatePage(option, ...args); // Direct page navigation
          }
        });
      };

      // Add a default constructor to the jQuery plugin, similar to original dragend
      externalJQuery.fn[pluginName].Constructor = SwipeCraft;

      // Add a no conflict method (optional, for robustness)
      externalJQuery.fn[pluginName].noConflict = function() {
          externalJQuery.fn[pluginName] = old;
          return this;
      };
    } else {
        // Expose SwipeCraft globally if no jQuery
        globalWindow.SwipeCraft = SwipeCraft;
    }

  } // End initializeSwipeModule

  // Pass jQuery if available, otherwise undefined
  initializeSwipeModule( globalWindow.jQuery );

})( window );
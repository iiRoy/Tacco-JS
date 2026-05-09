/*
 * Compact Scroller Component
 * Version 2.0.1
 *
 * This utility provides custom scroll functionality for content areas.
 *
 * Copyright (c) 2023, Reimagined Devs
 * Released under the Permissive Software License 1.0.
 *
 * Date: 2023-10-27
 * Dependencies: jQuery (v1.7+)
 */

(function($) {
  // Ensure the base utility namespace exists or create it.
  $.smallUtils = $.smallUtils || {};

  // Default configuration settings for the scroller.
  $.smallUtils.scroller = {
    config: {
      orientation: 'vertical', // 'vertical' (y) or 'horizontal' (x) scrolling.
      scrollStep: 60,          // Pixels scrolled per mouse wheel tick.
      enableWheel: true,       // Allow mouse wheel interaction.
      frameDim: 'auto',        // Scrollbar frame size: 'auto' or a fixed pixel value.
      handleDim: 'auto',       // Scroll handle (thumb) size: 'auto' or fixed pixel value.
      debugMode: false         // Enable console logging for development.
    }
  };

  /**
   * jQuery plugin initializer for creating scroller instances.
   * Attaches a new ScrollerCore instance to each matched element.
   * @param {Object} [userOptions] - Custom configuration to override defaults.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.compactScroller = function(userOptions) {
    // Merge user-provided options with default configuration.
    const effectiveConfig = $.extend({}, $.smallUtils.scroller.config, userOptions);

    this.each(function() {
      const currentElement = $(this);
      // Store the scroller instance on the element's data.
      currentElement.data('csInstance', new ScrollerCore(currentElement, effectiveConfig));
    });
    return this; // Enable chaining.
  };

  /**
   * jQuery plugin for programmatically refreshing scroller state.
   * @param {string|number} [updateInstruction] - Optional directive ('relative', 'bottom', or pixel value)
   *                                                to adjust scroll position after refresh.
   * @returns {jQuery} The jQuery object for chaining.
   */
  $.fn.compactScroller_refresh = function(updateInstruction) {
    const instance = $(this).data('csInstance');
    if (instance && typeof instance.refreshDisplay === 'function') {
      return instance.refreshDisplay(updateInstruction);
    }
    if ($.smallUtils.scroller.config.debugMode) {
      console.warn("compactScroller_refresh called on element without a scroller instance.");
    }
    return this; // Maintain chainability.
  };

  /**
   * ScrollerCore constructor function.
   * Manages the scrolling behavior for a single element.
   * @param {jQuery} containerElement - The root element for the scroller.
   * @param {Object} scrollerConfig - Configuration object for this instance.
   */
  function ScrollerCore(containerElement, scrollerConfig) {
    const instanceRef = this; // Reference to the current ScrollerCore instance.

    // --- DOM Element References ---
    // These elements are expected to be children of the containerElement.
    const displayArea = containerElement.find('.viewport');
    const innerContent = containerElement.find('.overview');
    const scrollTrackHousing = containerElement.find('.scrollbar');
    const scrollTrack = containerElement.find('.track');
    const scrollHandle = containerElement.find('.thumb');

    // --- Orientation and CSS Property Mapping ---
    // Determines whether the scroller operates vertically or horizontally.
    const isHorizontal = scrollerConfig.orientation === 'horizontal';
    const coordProp = isHorizontal ? 'left' : 'top'; // CSS property for position.
    const dimensionProp = isHorizontal ? 'Width' : 'Height'; // For jQuery methods like .width().
    const offsetDimensionProp = isHorizontal ? 'offsetWidth' : 'offsetHeight'; // For native DOM properties.

    // --- Internal State Variables ---
    let currentScrollOffset = 0;   // Current content scroll position (in pixels).
    let maxHandleTravel = 0;       // Maximum pixel distance the handle can move within its track.
    let hiddenContentSize = 0;     // Total content size minus viewport size (the scrollable amount).
    let scrollScaleFactor = 0;     // Ratio for converting handle position to content scroll.

    // Store positions during drag operations.
    const handlePosition = {
      start: 0, // Handle's position (px) at the beginning of a drag.
      now: 0    // Handle's current position (px) during a drag.
    };
    const mouseCoord = {
      start: 0 // Mouse coordinate (pageX/pageY) at the beginning of a drag.
    };

    // --- Public Methods ---

    /**
     * Checks if the content is larger than the display area, making scrolling necessary.
     * @returns {boolean} True if content overflows and scrolling is active, false otherwise.
     */
    instanceRef.isScrollable = function() {
      // If hiddenContentSize is positive, it means content overflows.
      return hiddenContentSize > 0;
    };

    /**
     * Re-calculates dimensions, updates internal state, and redraws the scroller's visual elements.
     * Can be called with an update directive to jump to a specific position.
     * @param {string|number} [updateDirective] - Optional: 'relative' (maintain position),
     *                                              'bottom' (scroll to end), or a specific pixel value.
     */
    instanceRef.refreshDisplay = function(updateDirective) {
      if (!checkEssentialElements()) {
        if (scrollerConfig.debugMode) {
          console.error("ScrollerCore: Missing required sub-elements. Ensure .viewport, .overview, .scrollbar, .track, and .thumb are present.");
        }
        return; // Exit if elements are not found.
      }

      // 1. Calculate Core Sizes
      const displayAreaSize = displayArea[0][offsetDimensionProp]; // e.g., viewport.offsetHeight
      const innerContentSize = innerContent[0]['scroll' + dimensionProp]; // e.g., overview.scrollHeight
      hiddenContentSize = innerContentSize - displayAreaSize;

      // Determine content overflow ratio (used for auto handle sizing).
      const overflowRatio = displayAreaSize / innerContentSize;

      // 2. Update Scrollbar Visual State
      scrollTrackHousing.toggleClass('disable', !instanceRef.isScrollable());

      // 3. Calculate Scroll Track Size
      let scrollTrackSize;
      if (scrollerConfig.frameDim === 'auto') {
        scrollTrackSize = displayAreaSize;
      } else {
        scrollTrackSize = parseInt(scrollerConfig.frameDim, 10);
        if (isNaN(scrollTrackSize) || scrollTrackSize < 0) {
          if (scrollerConfig.debugMode) console.warn("ScrollerCore: Invalid 'frameDim' config. Using displayAreaSize.");
          scrollTrackSize = displayAreaSize;
        }
      }

      // 4. Calculate Scroll Handle Size
      let scrollHandleSize;
      if (scrollerConfig.handleDim === 'auto') {
        // Minimum handle size of 20px to ensure it's always draggable.
        scrollHandleSize = Math.max(20, Math.round(scrollTrackSize * overflowRatio));
      } else {
        scrollHandleSize = parseInt(scrollerConfig.handleDim, 10);
        if (isNaN(scrollHandleSize) || scrollHandleSize < 0) {
          if (scrollerConfig.debugMode) console.warn("ScrollerCore: Invalid 'handleDim' config. Using auto-calculated size.");
          scrollHandleSize = Math.max(20, Math.round(scrollTrackSize * overflowRatio));
        }
      }
      // Ensure handle does not exceed track size.
      scrollHandleSize = Math.min(scrollTrackSize, scrollHandleSize);

      // 5. Calculate Max Handle Travel and Scroll Scale Factor
      maxHandleTravel = scrollTrackSize - scrollHandleSize;
      // The ratio converts handle pixel movement to content pixel movement.
      if (scrollerConfig.handleDim === 'auto') {
        scrollScaleFactor = innerContentSize / scrollTrackSize;
      } else {
        // If handle size is fixed, the ratio is based on actual travel distance vs content overflow.
        scrollScaleFactor = hiddenContentSize / maxHandleTravel;
      }

      // 6. Adjust Current Scroll Offset based on Directive
      let newScrollOffset = currentScrollOffset; // Default to maintaining current position.
      if (instanceRef.isScrollable()) {
        if (updateDirective === 'relative') {
          // Clamp current scroll position within new bounds (e.g., after content resize).
          newScrollOffset = Math.min(hiddenContentSize, Math.max(0, currentScrollOffset));
        } else if (updateDirective === 'bottom') {
          newScrollOffset = hiddenContentSize; // Scroll to the very end.
        } else if (!isNaN(parseInt(updateDirective, 10))) {
          // Scroll to a specific pixel value.
          newScrollOffset = parseInt(updateDirective, 10);
          newScrollOffset = Math.min(hiddenContentSize, Math.max(0, newScrollOffset)); // Clamp.
        } else {
          newScrollOffset = 0; // Default to top if no valid directive or 'auto'.
        }
      } else {
        newScrollOffset = 0; // Reset scroll if content is no longer scrollable.
      }
      currentScrollOffset = newScrollOffset;

      // 7. Apply CSS Updates
      const handlePositionPx = currentScrollOffset / scrollScaleFactor;
      scrollHandle.css(coordProp, handlePositionPx + 'px');
      innerContent.css(coordProp, -currentScrollOffset + 'px');

      // Update cached mouse start position for dragging (if a drag was active).
      mouseCoord.start = parseInt(scrollHandle.css(coordProp), 10); // Re-cache handle's visual position.

      // Set explicit dimensions for scrollbar and track elements.
      const cssDimensionName = dimensionProp.toLowerCase(); // 'width' or 'height'
      scrollTrackHousing.css(cssDimensionName, scrollTrackSize + 'px');
      scrollTrack.css(cssDimensionName, scrollTrackSize + 'px');
      scrollHandle.css(cssDimensionName, scrollHandleSize + 'px');

      if (scrollerConfig.debugMode) {
        console.log("Scroller refreshed. Scrollable:", instanceRef.isScrollable(), "Offset:", currentScrollOffset, "Hidden:", hiddenContentSize);
      }
    };

    // --- Private Helper Functions ---

    /**
     * Checks if all necessary DOM elements for the scroller are present.
     * @returns {boolean} True if all required sub-elements are found, false otherwise.
     */
    function checkEssentialElements() {
      return displayArea.length && innerContent.length && scrollTrackHousing.length && scrollTrack.length && scrollHandle.length;
    }

    /**
     * Binds all interaction events (drag, wheel) to the scroller elements.
     * Uses namespaced events (.cs) for easier unbinding.
     */
    function attachInteractionHandlers() {
      // Mouse/Touch drag for the scroll handle.
      scrollHandle.on('mousedown.cs touchstart.cs', function(evtObj) {
        evtObj.preventDefault(); // Prevent default browser drag behavior (e.g., image drag).
        // Use the first touch point if it's a touch event.
        const eventSource = evtObj.originalEvent.touches ? evtObj.originalEvent.touches[0] : evtObj;
        beginDrag(eventSource);
        return false; // Stop further event propagation.
      });

      // Mouse up on the track can jump the handle to the click position.
      scrollTrack.on('mouseup.cs', processTrackClick);

      // Mouse wheel handling.
      if (scrollerConfig.enableWheel) {
        // Feature detection for cross-browser mouse wheel events.
        if ('onwheel' in document.createElement('div')) { // Modern browsers (standard 'wheel' event)
          containerElement[0].addEventListener('wheel', handleWheelScroll, { passive: false });
        } else if (typeof document.onmousewheel !== 'undefined') { // Webkit, IE ('mousewheel' event)
          containerElement[0].onmousewheel = handleWheelScroll;
        } else { // Firefox ('DOMMouseScroll' event)
          containerElement[0].addEventListener('DOMMouseScroll', handleWheelScroll, { passive: false });
        }
      }
    }

    /**
     * Initiates a drag operation for the scroll handle.
     * Binds global move and release events.
     * @param {Event} evtObj - The event object (mousedown or touchstart).
     */
    function beginDrag(evtObj) {
      if (!instanceRef.isScrollable()) return; // Only allow drag if content is scrollable.

      mouseCoord.start = isHorizontal ? evtObj.pageX : evtObj.pageY;
      handlePosition.start = parseInt(scrollHandle.css(coordProp), 10);

      // Bind global events for mouse move and release to ensure drag continues even if mouse leaves handle.
      $(document).on('mousemove.cs touchmove.cs', processDrag);
      $(document).on('mouseup.cs touchend.cs', finalizeDrag);
      // Add a class to body to prevent unwanted text selection during drag.
      $('body').addClass('no-select');
      if (scrollerConfig.debugMode) {
        console.log("Drag initiated. Handle start:", handlePosition.start);
      }
    }

    /**
     * Handles mouse wheel events to scroll the content.
     * @param {Event} evtObj - The wheel event object.
     */
    function handleWheelScroll(evtObj) {
      if (!instanceRef.isScrollable()) return;

      evtObj.preventDefault(); // Prevent default browser scrolling.
      const originalEvent = evtObj.originalEvent || evtObj; // Get original event for delta values.

      let wheelDeltaValue = 0;
      if (originalEvent.detail) { // Firefox specific (negative for down scroll)
        wheelDeltaValue = -originalEvent.detail / 3;
      } else if (originalEvent.wheelDelta) { // Chrome, Safari, IE (positive for down scroll)
        wheelDeltaValue = originalEvent.wheelDelta / 120;
      } else if (originalEvent.deltaY) { // Modern browsers (standard 'wheel' event)
        // Normalize deltaY: 1 for line mode, 40 for pixel mode (approx).
        wheelDeltaValue = -originalEvent.deltaY / (originalEvent.deltaMode === 1 ? 1 : 40);
      }

      // Adjust scroll offset based on wheel movement and configured step.
      currentScrollOffset -= Math.round(wheelDeltaValue * scrollerConfig.scrollStep);
      // Clamp scroll offset within valid bounds.
      currentScrollOffset = Math.min(hiddenContentSize, Math.max(0, currentScrollOffset));

      // Update handle position based on new scroll offset.
      const handlePos = currentScrollOffset / scrollScaleFactor;
      scrollHandle.css(coordProp, handlePos + 'px');
      innerContent.css(coordProp, -currentScrollOffset + 'px');

      if (scrollerConfig.debugMode) {
        console.log("Wheel scroll. Offset:", currentScrollOffset, "Delta:", wheelDeltaValue);
      }
    }

    /**
     * Handles the end of a drag operation.
     * Unbinds global events and cleans up.
     */
    function finalizeDrag() {
      // Unbind all namespaced events from document.
      $(document).off('mousemove.cs touchmove.cs mouseup.cs touchend.cs');
      // Re-enable text selection on the body.
      $('body').removeClass('no-select');
      if (scrollerConfig.debugMode) {
        console.log("Drag finalized.");
      }
    }

    /**
     * Processes the ongoing drag movement of the scroll handle.
     * @param {Event} evtObj - The event object (mousemove or touchmove).
     */
    function processDrag(evtObj) {
      if (!instanceRef.isScrollable()) return;

      evtObj.preventDefault(); // Prevent default browser behavior (e.g., text selection).
      const eventSource = evtObj.originalEvent.touches ? evtObj.originalEvent.touches[0] : evtObj;

      const currentMouseCoord = isHorizontal ? eventSource.pageX : eventSource.pageY;
      const mouseTravel = currentMouseCoord - mouseCoord.start;

      // Calculate new handle position, clamping it within the track boundaries.
      handlePosition.now = Math.min(maxHandleTravel, Math.max(0, handlePosition.start + mouseTravel));

      // Convert handle position (track pixels) to content scroll offset (content pixels).
      currentScrollOffset = handlePosition.now * scrollScaleFactor;

      // Apply CSS changes to update content and handle positions.
      innerContent.css(coordProp, -currentScrollOffset + 'px');
      scrollHandle.css(coordProp, handlePosition.now + 'px');

      if (scrollerConfig.debugMode) {
        // console.log("Dragging... Handle pos:", handlePosition.now, "Content offset:", currentScrollOffset); // Too verbose for general debug.
      }
    }

    /**
     * Handles clicks on the scroll track to jump the handle to the clicked position.
     * @param {Event} evtObj - The mouseup event object.
     */
    function processTrackClick(evtObj) {
      if (!instanceRef.isScrollable()) return;

      // Determine click position relative to the scroll track.
      const trackOffset = scrollTrack.offset()[coordProp];
      const clickCoord = isHorizontal ? evtObj.pageX : evtObj.pageY;
      const clickPositionInTrack = clickCoord - trackOffset; // Position relative to track start.

      // Calculate target handle position (aim for the center of the handle).
      const scrollHandleSize = parseInt(scrollHandle.css(dimensionProp.toLowerCase()), 10);
      const targetHandlePosition = clickPositionInTrack - (scrollHandleSize / 2);

      // Clamp target handle position within track bounds.
      handlePosition.now = Math.min(maxHandleTravel, Math.max(0, targetHandlePosition));

      // Update content scroll offset based on the new handle position.
      currentScrollOffset = handlePosition.now * scrollScaleFactor;

      // Animate the handle and content to the new position for a smoother jump.
      // .stop(true, false) prevents animation queueing and allows a new animation to start immediately.
      scrollHandle.stop(true, false).animate({ [coordProp]: handlePosition.now + 'px' }, 200, 'linear');
      innerContent.stop(true, false).animate({ [coordProp]: -currentScrollOffset + 'px' }, 200, 'linear', function() {
        // After animation, ensure the state is consistent by refreshing.
        instanceRef.refreshDisplay('relative');
      });

      if (scrollerConfig.debugMode) {
        console.log("Track clicked. Jumped to:", currentScrollOffset);
      }
    }

    // --- Initialization Sequence ---
    /**
     * Initializes the ScrollerCore instance.
     * Performs initial calculations, renders the scroller, and attaches event listeners.
     * @returns {ScrollerCore} The initialized instance.
     */
    function bootStrap() {
      // Perform initial layout calculations and render the scroller.
      instanceRef.refreshDisplay();
      // Attach all event listeners for user interaction.
      attachInteractionHandlers();
      if (scrollerConfig.debugMode) {
        console.info("ScrollerCore initialized for:", containerElement[0]);
      }
      return instanceRef; // Return the instance for chaining.
    }

    // Execute the initialization function when a new ScrollerCore instance is created.
    return bootStrap();
  }
})(jQuery);
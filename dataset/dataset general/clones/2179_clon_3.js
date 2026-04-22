;(function($) {
  // Utility for robust CSS transform property detection
  const _getCssTransformProperty = () => {
    const styleTestDiv = document.createElement("div").style;
    const vendorPrefixes = ["webkit", "moz", "ms", "o"]; // Added 'o' for Opera
    let foundProp = "transform" in styleTestDiv ? "transform" : undefined;

    if (!foundProp) {
      for (let i = 0, len = vendorPrefixes.length; i < len; i++) {
        const vendorSpecificProp = vendorPrefixes[i] + "Transform";
        if (vendorSpecificProp in styleTestDiv) {
          foundProp = vendorSpecificProp;
          break;
        }
      }
    }
    return foundProp;
  };

  const cssTransProp = _getCssTransformProperty();

  // Represents a single visual element within the circular display
  const DisplayElement = function(domNode, config) {
    if (!domNode) {
      console.warn("DisplayElement: Invalid DOM node provided.");
      return;
    }

    // Store a reference to this object on the DOM node for easy retrieval
    $.data(domNode, 'displayElementInstance', this);
    this.domNode = domNode;

    // Determine original dimensions, handling images vs. other elements
    if (domNode.tagName === 'IMG') {
      this.originalWidth = domNode.width;
      this.originalHeight = domNode.height;
    } else {
      // Ensure block-level rendering for accurate offset dimensions
      domNode.style.display = "inline-block";
      this.originalWidth = domNode.offsetWidth;
      this.originalHeight = domNode.offsetHeight;
    }

    // Prepare node for absolute positioning within the container
    domNode.style.position = 'absolute';

    // Handle optional reflection generation if configured and applicable
    if (config.mirror && this.domNode.tagName === 'IMG' && $.fn.reflect) {
      this.mirroredPart = $(domNode).reflect(config.mirror).next()[0];
      const $mirroredPart = $(this.mirroredPart);

      // Adjust reflection styling
      $mirroredPart.css({
        'margin-top': config.mirror.gap + 'px',
        'width': '100%'
      });
      domNode.style.width = "100%"; // Ensure image takes full width of its new parent

      // The item's primary DOM node now becomes its parent div (containing image + reflection)
      this.domNode = this.domNode.parentNode;
      $.data(this.domNode, 'displayElementInstance', this); // Update reference
    } else if (config.mirror && this.domNode.tagName === 'IMG' && !$.fn.reflect) {
      console.warn("Reflection requested but jQuery.reflect plugin not found.");
    }

    // Set transform origin for CSS transforms if enabled
    if (cssTransProp && config.transforms) {
      this.domNode.style[cssTransProp + "Origin"] = "0 0";
    }

    // Helper to generate CSS transform string
    const _getTransformString = (x, y, scale) => {
      return `translate(${x}px, ${y}px) scale(${scale})`;
    };

    // Positions the element in 3D space
    this.reposition = function(xPos, yPos, scaleFactor) {
      this.currentWidth = this.originalWidth * scaleFactor;
      this.currentHeight = this.originalHeight * scaleFactor;
      this.currentX = xPos;
      this.currentY = yPos;
      this.currentScale = scaleFactor;

      const nodeStyle = this.domNode.style;
      nodeStyle.zIndex = "" + Math.floor(scaleFactor * 100); // Integer z-index based on scale

      if (cssTransProp && config.transforms) {
        nodeStyle[cssTransProp] = _getTransformString(xPos, yPos, scaleFactor);
      } else {
        // Fallback for browsers without CSS transforms
        if (config.mirror && this.mirroredPart) { // Check for mirroredPart existence
          this.mirroredPart.style.marginTop = (config.mirror.gap * scaleFactor) + "px";
        }
        nodeStyle.width = this.currentWidth + "px";
        nodeStyle.left = xPos + "px";
        nodeStyle.top = yPos + "px";
      }
    };
  };

  // High-resolution time utility
  const getPreciseTime = window.performance && window.performance.now ?
    () => performance.now() :
    () => Date.now();

  // Standardize requestAnimationFrame/cancelAnimationFrame
  const animationFrameAPI = (() => {
    const request = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      ((callback) => setTimeout(callback, 1000 / 60)); // Fallback to setTimeout

    const cancel = window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.msCancelAnimationFrame ||
      clearTimeout; // Fallback to clearTimeout

    return { request, cancel };
  })();

  // Core Circular Display Logic
  const CircularDisplay = function(containerElement, config) {
    const instanceRef = this; // Self-reference for callbacks
    const $wrapperElem = $(containerElement);
    this.displayItems = []; // Array to hold DisplayElement instances

    // Configuration defaults and calculations
    this.centerX = config.centerX === null ? $wrapperElem.width() * 0.5 : config.centerX;
    this.centerY = config.centerY === null ? $wrapperElem.height() * 0.1 : config.centerY;
    this.radiusX = config.radiusX === null ? $wrapperElem.width() / 2.3 : config.radiusX;
    this.radiusY = config.radiusY === null ? $wrapperElem.height() / 6 : config.radiusY;
    this.minScaleFactor = config.minScaleFactor;
    this.currentAngle = Math.PI / 2; // Initial angle: first item at the front (90 degrees)
    this.targetAngle = this.currentAngle;
    this.animationSpeed = Math.max(1, config.animationSpeed); // Ensure speed is positive
    this.useSmoothAnimation = config.useSmoothAnimation;
    this.fallbackFps = config.fallbackFps;
    this.animationTimerId = 0; // Tracks animation frame ID
    this.autoAdvanceCount = config.autoAdvanceCount;
    this.autoAdvanceInterval = Math.max(100, config.autoAdvanceInterval); // Min 100ms interval
    this.autoAdvanceTimerId = 0; // Tracks auto-advance interval ID
    this.onContentReady = config.onContentReady;
    this.onFrameRendered = config.onFrameRendered;

    // Pass relevant options to individual DisplayElements
    this.elementConfig = {
      transforms: config.transforms
    };
    if (config.mirror) {
      this.elementConfig.mirror = $.extend({
        gap: 2
      }, config.mirror);
    }

    // Set up container styling for positioning and overflow
    $wrapperElem.css({
      position: 'relative',
      overflow: 'hidden'
    });

    // Positions a single item based on its index and the carousel's rotation
    this.positionElement = function(idx, rotationAngle) {
      if (this.displayItems.length === 0) return; // Guard against empty carousel

      const currentItem = this.displayItems[idx];
      const sinVal = Math.sin(rotationAngle);
      const scaleVal = this.minScaleFactor + ((1 - this.minScaleFactor) * (sinVal + 1) * 0.5);

      // Calculate new X, Y positions based on ellipse projection
      const newX = this.centerX + (scaleVal * ((Math.cos(rotationAngle) * this.radiusX) - (currentItem.originalWidth * 0.5)));
      const newY = this.centerY + (scaleVal * sinVal * this.radiusY);

      currentItem.reposition(newX, newY, scaleVal);
    };

    // Renders the entire carousel scene
    this.drawScene = function() {
      const itemCount = this.displayItems.length;
      if (itemCount === 0) return;

      const angleStep = (2 * Math.PI) / itemCount;
      let currentRad = this.currentAngle;

      for (let i = 0; i < itemCount; i++) {
        this.positionElement(i, currentRad);
        currentRad += angleStep;
      }

      // Execute callback if defined
      this.onFrameRendered(this);
    };

    // Advances the animation by one frame
    this.animateFrame = function() {
      const angleDifference = instanceRef.targetAngle - instanceRef.currentAngle;
      const currentTime = getPreciseTime();
      const deltaTime = (currentTime - instanceRef.prevFrameTime) * 0.0025; // Scaled time difference
      instanceRef.prevFrameTime = currentTime;

      // Stop animation if very close to target
      if (Math.abs(angleDifference) < 0.003) {
        instanceRef.currentAngle = instanceRef.targetAngle;
        instanceRef.stopAnimation();
      } else {
        // Exponentially approach the target angle
        instanceRef.currentAngle = instanceRef.targetAngle - angleDifference / (1 + (instanceRef.animationSpeed * deltaTime));
        instanceRef.scheduleNextDrawing();
      }

      instanceRef.drawScene();
    };

    // Schedules the next animation frame
    this.scheduleNextDrawing = function() {
      this.prevFrameTime = getPreciseTime();
      this.animationTimerId = this.useSmoothAnimation ?
        animationFrameAPI.request(instanceRef.animateFrame) :
        setTimeout(instanceRef.animateFrame, 1000 / this.fallbackFps);
    };

    // Calculates the total number of items rotated from the initial position (can be float)
    this.calcRotatedItemsCount = function() {
      return (this.displayItems.length * ((Math.PI / 2) - this.currentAngle)) / (2 * Math.PI);
    };

    // Gets the floating-point index of the item currently at the "front"
    this.getFloatingIndex = function() {
      const itemCount = this.displayItems.length;
      let floatIdx = this.calcRotatedItemsCount() % itemCount;
      return (floatIdx < 0) ? floatIdx + itemCount : floatIdx; // Normalize to positive
    };

    // Gets the integer index of the item closest to the "front"
    this.getClosestIndex = function() {
      return Math.round(this.getFloatingIndex()) % this.displayItems.length;
    };

    // Returns the DisplayElement object closest to the "front"
    this.getClosestItem = function() {
      return this.displayItems[this.getClosestIndex()];
    };

    // Starts the carousel animation loop
    this.startAnimation = function() {
      if (this.animationTimerId === 0) {
        this.scheduleNextDrawing();
      }
    };

    // Stops the carousel animation loop
    this.stopAnimation = function() {
      if (this.animationTimerId !== 0) {
        this.useSmoothAnimation ? animationFrameAPI.cancel(this.animationTimerId) : clearTimeout(this.animationTimerId);
        this.animationTimerId = 0;
      }
    };

    // Rotates the carousel by a specified number of items
    this.shiftCarousel = function(shiftAmount) {
      if (this.displayItems.length === 0) return;
      this.targetAngle += (2 * Math.PI / this.displayItems.length) * shiftAmount;
      this.startAnimation();
    };

    // Cleans up all timers and event handlers
    this.teardown = function() {
      this.stopAnimation();
      clearInterval(this.autoAdvanceTimerId);
      // Unbind control buttons if they were provided
      if (config.prevButton) config.prevButton.off('click');
      if (config.nextButton) config.nextButton.off('click');
      $wrapperElem.off('.circularDisplay'); // Unbind all custom events
      $.removeData(containerElement, 'circularDisplayInstance'); // Clean up instance reference
    };

    // Initiates the automatic rotation mechanism
    this.initiateAutoAdvance = function() {
      this.autoAdvanceTimerId = setInterval(
        () => instanceRef.shiftCarousel(instanceRef.autoAdvanceCount),
        this.autoAdvanceInterval
      );
    };

    // Activates automatic rotation and adds mouse interaction for pausing/resuming
    this.activateAutoAdvance = function() {
      // Pause auto-advance on mouse over
      $wrapperElem.on('mouseover.circularDisplay', () => clearInterval(instanceRef.autoAdvanceTimerId));

      // Resume auto-advance when mouse leaves
      $wrapperElem.on('mouseout.circularDisplay', () => instanceRef.initiateAutoAdvance());

      this.initiateAutoAdvance();
    };

    // Attaches user interaction handlers (buttons, mousewheel, click-to-center)
    this.attachInteractionHandlers = function() {
      // Left/Previous Button
      if (config.prevButton) {
        config.prevButton.on('click', (e) => {
          e.preventDefault(); // Prevent default button action
          instanceRef.shiftCarousel(-1);
        });
      }

      // Right/Next Button
      if (config.nextButton) {
        config.nextButton.on('click', (e) => {
          e.preventDefault(); // Prevent default button action
          instanceRef.shiftCarousel(1);
        });
      }

      // Mousewheel Support (requires jQuery Mousewheel plugin)
      if (config.enableMouseWheel && $.fn.mousewheel) {
        let lastWheelTime = 0;
        $wrapperElem.on('mousewheel.circularDisplay', (e, delta) => {
          e.preventDefault(); // Prevent page scrolling
          const now = getPreciseTime();
          // Simple debounce to prevent over-scrolling
          if (now - lastWheelTime > 150) {
            instanceRef.shiftCarousel((delta > 0) ? 1 : -1);
            lastWheelTime = now;
          }
        });
      } else if (config.enableMouseWheel && !$.fn.mousewheel) {
        console.warn("Mousewheel interaction requested but jQuery.mousewheel plugin not found.");
      }

      // Click-to-center functionality
      if (config.clickToCenter) {
        $wrapperElem.on('click.circularDisplay', (e) => {
          const clickedItems = $(e.target).closest('.' + config.itemIdentifier);

          if (clickedItems.length > 0) {
            const targetDisplayElement = $.data(clickedItems[0], 'displayElementInstance');
            if (!targetDisplayElement) return; // Guard against element without instance

            const targetIdx = instanceRef.displayItems.indexOf(targetDisplayElement);
            const itemCount = instanceRef.displayItems.length;
            let rotationDiff = targetIdx - (instanceRef.getFloatingIndex() % itemCount);

            // Determine shortest rotation path
            if (2 * Math.abs(rotationDiff) > itemCount) {
              rotationDiff += (rotationDiff > 0) ? -itemCount : itemCount;
            }

            instanceRef.targetAngle = instanceRef.currentAngle; // Reset target to current
            instanceRef.shiftCarousel(-rotationDiff); // Rotate to bring clicked item to front
          }
        });
      }
    };

    // Initial item collection from the container
    const rawItems = $wrapperElem.find('.' + config.itemIdentifier);

    // Finalizes the carousel setup once all images are loaded
    this.finalizeSetup = function() {
      // Check if all images (if any) have finished loading
      for (let i = 0; i < rawItems.length; i++) {
        const itemNode = rawItems[i];
        if (itemNode.tagName === 'IMG' && (!itemNode.width || (itemNode.complete !== undefined && !itemNode.complete))) {
          // Still waiting for an image to load
          return;
        }
      }

      clearInterval(this.initializationWatcher); // Stop polling

      // Initialize all DisplayElement instances
      for (let i = 0; i < rawItems.length; i++) {
        this.displayItems.push(new DisplayElement(rawItems[i], this.elementConfig));
      }

      // Disable default drag behavior on items
      $wrapperElem.on('mousedown.circularDisplay', () => false);

      // Activate auto-advance if configured
      if (this.autoAdvanceCount !== 0) this.activateAutoAdvance();

      this.attachInteractionHandlers(); // Set up event listeners
      this.drawScene(); // Initial render

      // Execute onContentReady callback
      this.onContentReady(this);
    };

    // Start polling to wait for all images to load before finalizing setup
    this.initializationWatcher = setInterval(() => instanceRef.finalizeSetup(), 50);
  };

  // The jQuery plugin definition
  $.fn.CircularDisplayPlugin = function(pluginOptions) {
    return this.each(function() {
      // Merge user options with sensible defaults
      const mergedOptions = $.extend({
        centerX: null, // Auto-calculated if null
        centerY: null,
        radiusX: null,
        radiusY: null,
        minScaleFactor: 0.5, // Scale of items furthest away
        transforms: true, // Use CSS transforms for positioning
        useSmoothAnimation: true, // Use requestAnimationFrame for smoothness
        fallbackFps: 30, // Fallback frames per second (if smooth animation is off)
        animationSpeed: 4, // Controls animation duration (higher is slower)
        autoAdvanceCount: 0, // 0: off, positive: clockwise item count
        autoAdvanceInterval: 4000,
        clickToCenter: false, // Click items to bring them to the front
        itemIdentifier: 'c-display-item', // Class name for carousel items
        pluginKey: 'circularDisplayInstance', // Data key for instance storage
        prevButton: null, // jQuery object for previous button
        nextButton: null, // jQuery object for next button
        enableMouseWheel: false, // Enable mousewheel navigation
        onContentReady: $.noop, // Callback when carousel is fully loaded
        onFrameRendered: $.noop // Callback after each frame is drawn
      }, pluginOptions);

      // Store the CircularDisplay instance on the element's data
      $(this).data(mergedOptions.pluginKey, new CircularDisplay(this, mergedOptions));
    });
  };
})(window.jQuery || window.Zepto);
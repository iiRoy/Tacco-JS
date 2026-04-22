/*
 *  Module: PageTurner
 *  Objective: Dynamically alters content presentation with animated transitions.
 *  Author: Hiroshi Inami (adapted for cloning)
 *  License: Modified MIT License
 */

// Defensive semicolon for script concatenation safety, preventing issues with
// improperly terminated scripts or other plugin modules in a larger codebase.
;(function (jQueryAlias, currentWindow, docElement, undefinedValue) {

  // The 'undefinedValue' parameter ensures a truly undefined state. In older
  // ECMAScript versions (ES3), 'undefined' could be reassigned. By passing
  // nothing for this parameter, we guarantee its value is genuinely undefined
  // within this scope. ES5 and later protect the global 'undefined'.

  // 'currentWindow' and 'docElement' are passed as local parameters to enhance
  // lookup speed and improve minification efficiency, especially beneficial
  // when these global objects are frequently referenced throughout the plugin.

  // --- Core Configuration and Constants ---
  var DIRECTION_EAST = 'eastward'; // Movement from right to left
  var DIRECTION_WEST = 'westward'; // Movement from left to right
  var DIRECTION_SOUTH = 'southward'; // Movement from top to bottom
  var DIRECTION_NORTH = 'northward'; // Movement from bottom to top

  // Default settings for the content presentation component
  var componentId = 'pageTurner',
  standardSettings = {
    animationStyle: 'unfold',       // 'unfold' (3D flip) or 'glide' (2D slide)
                                    // 'glide' is a fallback for browsers
                                    // without 3D transform support.
    advanceDirection: DIRECTION_EAST, // 'westward' | 'eastward' | 'southward' | 'northward'
    dimensionHeight: '',            // Height string, empty implies auto-sizing
    keyboardNavigation: true,       // Enables keyboard arrow key support for navigation
    showPageIndicators: false,      // Displays visual page number/position indicators
    cycleContent: false             // Allows content to loop from last to first
  };

  // Internal identifiers and data attribute handling
  var DATA_ATTR_PREFIX = 'data-';
  var COMPONENT_NAMESPACE = 'pt-'; // Namespace for CSS classes and data attributes

  var VALUE_STRING = 0; // Data type indicator for string attributes
  var VALUE_BOOLEAN = 1; // Data type indicator for boolean attributes

  // Mapping of plugin options to their corresponding data attributes
  var DATA_ATTRIBUTES_MAP = [
    {optionKey: 'animationStyle', dataAttr: 'anim-style', dataType: VALUE_STRING},
    {optionKey: 'advanceDirection', dataAttr: 'advance-dir', dataType: VALUE_STRING},
    {optionKey: 'dimensionHeight', dataAttr: 'height', dataType: VALUE_STRING},
    {optionKey: 'keyboardNavigation', dataAttr: 'key-nav', dataType: VALUE_BOOLEAN},
    {optionKey: 'showPageIndicators', dataAttr: 'show-pager', dataType: VALUE_BOOLEAN},
    {optionKey: 'cycleContent', dataAttr: 'loop', dataType: VALUE_BOOLEAN}
  ];

  // Constants for defining content segments during animation
  var PRIMARY_SEGMENT = 1; // Represents the first half or front side
  var SECONDARY_SEGMENT = -1; // Represents the second half or back side

  // Browser-specific CSS prefix (e.g., -webkit-, -moz-)
  var VENDOR_PREFIX_CSS = '';
  // Keyboard key codes for navigation
  var KEY_CODE_LEFT_ARROW = 37;
  var KEY_CODE_RIGHT_ARROW = 39;

  // CSS class names for active elements
  var ACTIVE_DISPLAY_CLASS = 'ptActiveView';
  var SELECTOR_ACTIVE_DISPLAY = '.' + ACTIVE_DISPLAY_CLASS;

  // Z-index base for layering during animation
  var LAYER_BASE_DEPTH = 10000;

  /**
   * Represents the PageTurner component instance.
   * @param {HTMLElement} hostElement - The DOM element to attach the plugin to.
   * @param {object} componentOptions - Configuration options for this instance.
   */
  function PageTurner(hostElement, componentOptions) {
    // Validate host element presence
    if (!hostElement || !jQueryAlias(hostElement).length) {
      console.error("PageTurner: Host element not found or invalid.");
      return; // Early exit for invalid host
    }

    this.initialOffset = 8; // Starting visual offset for flip effect (small margin)
    this.maxTravelDistance = 250; // Maximum distance for interaction (e.g., swipe threshold)
    this.engagementThreshold = 0.5; // Ratio to determine full flip completion

    this.rootElement = hostElement; // The main container element
    this.configuredOptions = componentOptions; // Merged configuration for this instance

    this.activeFlippingSegment = null; // Stores which segment (first/second) is currently flipping
    this.animationProgressRatio = null; // Current progress of the flip animation (0 to 1)

    this.isAnimationInProgress = false; // Flag to prevent multiple concurrent animations

    this.frontFlippingLayer = null; // The DOM element representing the front side of the flip
    this.rearFlippingLayer = null; // The DOM element representing the back side of the flip

    this.isInitialized = false; // Internal flag for initialization status
  }

  /**
   * Initializes the visual shadow element used during the flip animation.
   * This shadow provides a depth effect, making the flip more realistic.
   * @returns {jQuery} The newly created jQuery shadow element.
   * @private
   */
  PageTurner.prototype._createShadowLayer = function() {
    var $container = jQueryAlias(this.rootElement);
    var $currentView = $container.children(SELECTOR_ACTIVE_DISPLAY);

    // Guard against missing active view
    if ($currentView.length === 0) {
      console.warn("PageTurner: No active view found to base shadow dimensions on.");
      return jQueryAlias('<div class="pt-shadow-layer"></div>').hide();
    }

    var viewWidth = $currentView.outerWidth();
    var viewHeight = $currentView.outerHeight();

    // Create and style the shadow element
    var $shadowDiv = jQueryAlias('<div class="pt-shadow-layer"></div>')
      .css({
        'position': 'absolute',
        'background-color': '#1a1a1a', // Slightly darker background
        'opacity': '0.9',
        'display': 'none', // Initially hidden
        'z-index': LAYER_BASE_DEPTH,
        'box-sizing': 'border-box' // Ensure padding/border included in width/height
      });

    // Adjust shadow dimensions based on flip direction
    if (this._isDirectionVertical()) {
      $shadowDiv.css({
        'width': viewWidth + 'px',
        'height': (viewHeight / 2) + 'px',
        'top': (viewHeight / 2) + 'px',
        'left': '0'
      });
    } else { // Horizontal
      $shadowDiv.css({
        'width': (viewWidth / 2) + 'px',
        'height': viewHeight + 'px',
        'left': (viewWidth / 2) + 'px',
        'top': '0'
      });
    }

    return $shadowDiv;
  };

  /**
   * Determines if the current flip direction is vertical (top-to-bottom or bottom-to-top).
   * @returns {boolean} True if the flip is vertical, false otherwise.
   * @private
   */
  PageTurner.prototype._isDirectionVertical = function() {
    var dir = this.configuredOptions.advanceDirection;
    return (dir === DIRECTION_SOUTH || dir === DIRECTION_NORTH);
  };

  /**
   * Splits a given content element into two halves, front and back, for the flip effect.
   * This method creates or reuses two `div` elements, positions them, and clones the content.
   * @param {jQuery} $contentElement - The jQuery object representing the content to be split.
   * @param {string} classSuffix - A suffix for custom CSS classes (e.g., 'front', 'back').
   * @returns {{primary: jQuery, secondary: jQuery}} An object containing the primary and secondary split elements.
   * @private
   */
  PageTurner.prototype._segmentContent = function($contentElement, classSuffix) {
    var $rootContainer = jQueryAlias(this.rootElement);
    var isVerticalFlip = this._isDirectionVertical();

    // Handle cases where the content element might be null or empty, creating a placeholder.
    if (!$contentElement || $contentElement.length === 0) {
      var containerWidth = $rootContainer.width();
      var containerHeight = $rootContainer.height();

      // Adjust height if page indicators are present
      if (this.configuredOptions.showPageIndicators) {
        var $pager = $rootContainer.children('.pager'); // Assuming 'pager' class for indicators
        if ($pager.length) {
          containerHeight -= $pager.outerHeight();
        }
      }
      $contentElement = jQueryAlias('<div class="pt-empty-segment" style="width: ' +
                                containerWidth + 'px; height: ' + containerHeight + 'px;"></div>');
    }

    var primaryClass = COMPONENT_NAMESPACE + classSuffix + 'First';
    var secondaryClass = COMPONENT_NAMESPACE + classSuffix + 'Second';

    // Retrieve or create the primary (first) half element
    var $primaryHalf = $rootContainer.children('.' + primaryClass);
    if ($primaryHalf.length === 0) {
      $primaryHalf = jQueryAlias('<div class="pt-segment-half pt-primary-segment ' +
                      primaryClass + '"></div>').css('z-index', LAYER_BASE_DEPTH);
      $rootContainer.append($primaryHalf); // Append immediately if new
    } else {
      $primaryHalf.empty(); // Clear existing content if reusing
    }

    // Retrieve or create the secondary (second) half element
    var $secondaryHalf = $rootContainer.children('.' + secondaryClass);
    if ($secondaryHalf.length === 0) {
      $secondaryHalf = jQueryAlias('<div class="pt-segment-half pt-secondary-segment ' +
                      secondaryClass + '"></div>').css('z-index', LAYER_BASE_DEPTH);
      $rootContainer.append($secondaryHalf); // Append immediately if new
    } else {
      $secondaryHalf.empty(); // Clear existing content if reusing
    }

    // Clone the original content into both halves
    $primaryHalf.append($contentElement.clone(true, true)); // Deep clone with data and events
    $secondaryHalf.append($contentElement.clone(true, true));

    // Disable anchor clicks within the flipping elements to prevent accidental navigation
    var preventAnchorClicks = function(index, anchorElement) {
        jQueryAlias(anchorElement).on("click.pageTurner", function(event) {
          event.preventDefault(); // Stop default link behavior
          event.stopPropagation(); // Prevent event bubbling
          // Optionally, add a console log for debugging
          // console.log("Anchor click prevented during flip animation.");
        });
    };
    $primaryHalf.find('a').each(preventAnchorClicks);
    $secondaryHalf.find('a').each(preventAnchorClicks);

    // Adjust dimensions and positioning for each half
    var originalContentWidth = $contentElement.outerWidth();
    var originalContentHeight = $contentElement.outerHeight();

    // Primary half styling
    if (isVerticalFlip) {
      $primaryHalf.css({
        'width': originalContentWidth + 'px',
        'height': Math.floor(originalContentHeight / 2) + 'px',
        'top': '0',
        'left': '0',
        'overflow': 'hidden' // Hide the lower half of the cloned content
      });
      $primaryHalf.children(':first').css({
        'height': originalContentHeight + 'px',
        'display': 'block',
        'top': '0',
        'left': '0'
      });
    } else { // Horizontal flip
      $primaryHalf.css({
        'width': Math.floor(originalContentWidth / 2) + 'px',
        'height': originalContentHeight + 'px',
        'top': '0',
        'left': '0',
        'overflow': 'hidden' // Hide the right half of the cloned content
      });
      $primaryHalf.children(':first').css({
        'width': originalContentWidth + 'px',
        'display': 'block',
        'top': '0',
        'left': '0'
      });
    }

    // Secondary half styling
    if (isVerticalFlip) {
      $secondaryHalf.css({
        'width': originalContentWidth + 'px',
        'height': Math.ceil(originalContentHeight / 2) + 'px',
        'top': Math.floor(originalContentHeight / 2) + 'px',
        'left': '0',
        'overflow': 'hidden' // Hide the upper half of the cloned content
      });
      $secondaryHalf.children(':first').css({
        'height': originalContentHeight + 'px',
        'display': 'block',
        'top': -1 * Math.floor(originalContentHeight / 2) + 'px', // Shift content up
        'left': '0'
      });
    } else { // Horizontal flip
      $secondaryHalf.css({
        'width': Math.ceil(originalContentWidth / 2) + 'px',
        'height': originalContentHeight + 'px',
        'left': Math.floor(originalContentWidth / 2) + 'px',
        'top': '0',
        'overflow': 'hidden' // Hide the left half of the cloned content
      });
      $secondaryHalf.children(':first').css({
        'width': originalContentWidth + 'px',
        'display': 'block',
        'left': -1 * Math.floor(originalContentWidth / 2) + 'px', // Shift content left
        'top': '0'
      });
    }

    return {primary: $primaryHalf, secondary: $secondaryHalf};
  };

  /**
   * Initializes the flipping animation state. This sets up the layers and initial positions
   * before the actual animation begins.
   * @param {number} segmentToFlip - Indicates which half of the content is initiating the flip (PRIMARY_SEGMENT or SECONDARY_SEGMENT).
   */
  PageTurner.prototype.startAnimation = function(segmentToFlip) {
    // Prevent re-initialization if an animation is already in progress
    if (this.isAnimationInProgress) {
      console.warn("PageTurner: Animation already active. Ignoring new start request.");
      return;
    }
    this.isAnimationInProgress = true; // Set animation flag

    // Reset animation progress and store the active flipping segment
    this.animationProgressRatio = 0;
    this.activeFlippingSegment = segmentToFlip;

    var $container = jQueryAlias(this.rootElement);

    // Identify the currently visible content element
    var $currentActiveContent = $container.children(SELECTOR_ACTIVE_DISPLAY);
    if ($currentActiveContent.length === 0) {
      console.error("PageTurner: No active content element found for animation start.");
      this.isAnimationInProgress = false;
      return;
    }

    var $contentBeneath = null; // The content that will be revealed after the flip

    // Determine the next content element based on flip direction and segment
    var currentDirection = this.configuredOptions.advanceDirection;
    if ((currentDirection === DIRECTION_WEST && segmentToFlip === PRIMARY_SEGMENT) ||
        (currentDirection === DIRECTION_EAST && segmentToFlip === SECONDARY_SEGMENT) ||
        (currentDirection === DIRECTION_SOUTH && segmentToFlip === PRIMARY_SEGMENT) ||
        (currentDirection === DIRECTION_NORTH && segmentToFlip === SECONDARY_SEGMENT)) {
      $contentBeneath = this.getNextContent($currentActiveContent); // Assuming getNextContent exists
    } else {
      $contentBeneath = this.getPreviousContent($currentActiveContent); // Assuming getPreviousContent exists
    }

    // Split both the content being flipped (front) and the content being revealed (back)
    var rearSegments = this._segmentContent($contentBeneath, 'rear');
    var frontSegments = this._segmentContent($currentActiveContent, 'front');

    // Assign the correct segments to the flipping layers based on `segmentToFlip`
    if (segmentToFlip === SECONDARY_SEGMENT) {
      this.frontFlippingLayer = frontSegments.secondary;
      this.rearFlippingLayer = rearSegments.primary;
    } else { // PRIMARY_SEGMENT
      this.frontFlippingLayer = frontSegments.primary;
      this.rearFlippingLayer = rearSegments.secondary;
    }

    // Set z-index for correct layering during the flip
    this.frontFlippingLayer.css('z-index', LAYER_BASE_DEPTH + 1);
    this.rearFlippingLayer.css('z-index', LAYER_BASE_DEPTH);

    // Create and append the shadow layer, initially hidden
    var $shadowLayer = this._createShadowLayer();
    $container.append($shadowLayer);

    // Add direction-specific classes for CSS styling
    if (this._isDirectionVertical()) {
      this.frontFlippingLayer.addClass('vertical-flipper');
      this.rearFlippingLayer.addClass('vertical-flipper');
      if (segmentToFlip === PRIMARY_SEGMENT) {
        $shadowLayer.css('top', '0px');
      }
    } else { // Horizontal
      this.frontFlippingLayer.addClass('horizontal-flipper');
      this.rearFlippingLayer.addClass('horizontal-flipper');
      if (segmentToFlip === PRIMARY_SEGMENT) {
        $shadowLayer.css('left', '0px');
      }
    }

    // Add animation-specific classes
    this.frontFlippingLayer.addClass('is-flipping');
    this.rearFlippingLayer.addClass('is-back-flipping');

    // Update classes for the main content elements
    $currentActiveContent.removeClass(ACTIVE_DISPLAY_CLASS).addClass(COMPONENT_NAMESPACE + 'in-transition');

    // Finally, reveal the shadow layer
    $shadowLayer.show();
  };

  /**
   * Updates the visual state of the flip animation based on a given progress ratio.
   * @param {number} progressRatio - A value between 0 (start) and 1 (complete) representing the animation progress.
   */
  PageTurner.prototype.updateAnimationStep = function(progressRatio) {
    var $transitioningElement = jQueryAlias(this.rootElement).children('.' + COMPONENT_NAMESPACE + 'in-transition');
    // Guard against animation not being properly initialized or completed
    if ($transitioningElement.length === 0 || !this.isAnimationInProgress) {
      return;
    }

    // Clamp progressRatio to be within [0, 1]
    this.animationProgressRatio = Math.max(0, Math.min(1, progressRatio));

    var $frontLayer = this.frontFlippingLayer;
    var $backLayer = this.rearFlippingLayer;

    // Apply CSS transforms for rotation
    var transformProperty = VENDOR_PREFIX_CSS + 'Transform';
    $frontLayer.css(transformProperty, this._computeFrontRotateCSS(this.animationProgressRatio));
    $backLayer.css(transformProperty, this._computeBackRotateCSS(this.animationProgressRatio));

    // Control visibility and z-index based on rotation angle to simulate 3D depth
    var currentDegree = Math.abs(180 * this.animationProgressRatio);
    var $shadowLayer = jQueryAlias(this.rootElement).children('.pt-shadow-layer');
    var layerHeight = $frontLayer.height(); // Use front layer height for shadow positioning

    // Function for shadow opacity curve (smoother transition)
    var shadowIntensityCurve = function(p) {
      var factor = 1.2;
      return -factor * (p - 1) * (p - 1) + factor;
    };

    if (currentDegree > 90) {
      // Past 90 degrees, back layer becomes visible and front layer hides
      $frontLayer.css('z-index', LAYER_BASE_DEPTH);
      $backLayer.css('z-index', LAYER_BASE_DEPTH + 1);

      if ($backLayer.css('display') === 'none') {
        $backLayer.css('display', 'block');
        $frontLayer.css('display', 'none');
      }

      // Adjust shadow position for the second half of the flip
      if (this._isDirectionVertical()) {
        $shadowLayer.css('top', (this.activeFlippingSegment === SECONDARY_SEGMENT) ? '0' : layerHeight + 'px');
      } else { // Horizontal
        $shadowLayer.css('left', (this.activeFlippingSegment === SECONDARY_SEGMENT) ? '0' : '50%');
      }

      // Update shadow opacity for the second half of the flip
      var shadowRatio = Math.max(0, 1 - shadowIntensityCurve((180 - currentDegree) / 90));
      $shadowLayer.css('opacity', 0.9 * shadowRatio);

    } else {
      // Before 90 degrees, front layer is visible
      $frontLayer.css('z-index', LAYER_BASE_DEPTH + 1);
      $backLayer.css('z-index', LAYER_BASE_DEPTH);

      if ($frontLayer.css('display') === 'none') {
        $backLayer.css('display', 'none');
        $frontLayer.css('display', 'block');
      }

      // Adjust shadow position for the first half of the flip
      if (this._isDirectionVertical()) {
        $shadowLayer.css('top', (this.activeFlippingSegment === SECONDARY_SEGMENT) ? layerHeight + 'px' : '0');
      } else { // Horizontal
        $shadowLayer.css('left', (this.activeFlippingSegment === SECONDARY_SEGMENT) ? '50%' : '0');
      }

      // Update shadow opacity for the first half of the flip
      var shadowRatio = Math.max(0, 1 - shadowIntensityCurve(currentDegree / 90));
      $shadowLayer.css('opacity', 0.9 * shadowRatio);
    }
  };

  /**
   * Calculates the CSS transform string for the front-facing flipping element.
   * @param {number} ratio - The current animation progress ratio (0 to 1).
   * @returns {string} The CSS `rotateX` or `rotateY` transform string.
   * @private
   */
  PageTurner.prototype._computeFrontRotateCSS = function (ratio) {
    if (this._isDirectionVertical()) {
       return 'rotateX(' + (-1 * 180 * ratio) + 'deg)';
    } else {
       return 'rotateY(' + (180 * ratio) + 'deg)';
    }
  };

  /**
   * Calculates the CSS transform string for the back-facing flipping element.
   * This element rotates in conjunction with the front element to reveal content.
   * @param {number} ratio - The current animation progress ratio (0 to 1).
   * @returns {string} The CSS `rotateX` or `rotateY` transform string.
   * @private
   */
  PageTurner.prototype._computeBackRotateCSS = function(ratio) {
    var rotationAngle;
    if (this._isDirectionVertical()) {
      if (this.activeFlippingSegment === PRIMARY_SEGMENT) {
        rotationAngle = -1 * (180 + (180 * ratio)); // Rotate beyond 180 degrees
      } else {
        rotationAngle = (180 - (180 * ratio)); // Rotate back towards 0 from 180
      }
      return 'rotateX(' + rotationAngle + 'deg)';
    } else { // Horizontal
      if (this.activeFlippingSegment === PRIMARY_SEGMENT) {
        rotationAngle = (180 + (180 * ratio)); // Rotate beyond 180 degrees
      } else {
        rotationAngle = -1 * (180 - (180 * ratio)); // Rotate back towards 0 from -180
      }
      return 'rotateY(' + rotationAngle + 'deg)';
    }
  };

  /**
   * Placeholder for a full animation sequence using requestAnimationFrame.
   * This method would typically orchestrate the `updateAnimationStep` calls.
   * @param {number} targetRatio - The final animation ratio (usually 0 or 1).
   */
  PageTurner.prototype.executeAnimation = function(targetRatio) {
    var instance = this;
    var startRatio = this.animationProgressRatio;
    var durationMs = 600; // Animation duration in milliseconds
    var startTime = null;

    // Easing function (cubic ease-out)
    var easeOutCubic = function (t) {
      t /= durationMs; // Normalize time to [0, 1]
      t--; // Shift for cubic ease-out calculation
      return t * t * t + 1;
    };

    function animateFrame(currentTime) {
      if (!startTime) startTime = currentTime;
      var elapsed = currentTime - startTime;
      var progress = Math.min(1, easeOutCubic(elapsed));

      // Interpolate the ratio
      var currentRatio = startRatio + (targetRatio - startRatio) * progress;
      instance.updateAnimationStep(currentRatio);

      if (progress < 1) {
        currentWindow.requestAnimationFrame(animateFrame);
      } else {
        // Animation finished, call cleanup
        instance._finalizeAnimation(targetRatio);
      }
    }

    currentWindow.requestAnimationFrame(animateFrame);
  };

  /**
   * Cleans up the DOM and state after an animation completes.
   * @param {number} finalRatio - The ratio at which the animation concluded (expected 0 or 1).
   * @private
   */
  PageTurner.prototype._finalizeAnimation = function(finalRatio) {
    this.isAnimationInProgress = false; // Reset animation flag
    this.animationProgressRatio = finalRatio; // Ensure final state is set

    var $container = jQueryAlias(this.rootElement);
    var $currentActiveContent = $container.children(SELECTOR_ACTIVE_DISPLAY);
    var $transitioningContent = $container.children('.' + COMPONENT_NAMESPACE + 'in-transition');

    // Remove temporary classes and styles
    $transitioningContent.removeClass(COMPONENT_NAMESPACE + 'in-transition');
    this.frontFlippingLayer.removeClass('is-flipping vertical-flipper horizontal-flipper').removeAttr('style');
    this.rearFlippingLayer.removeClass('is-back-flipping vertical-flipper horizontal-flipper').removeAttr('style');

    // Remove the split elements and shadow
    $container.children('.pt-segment-half').remove();
    $container.children('.pt-shadow-layer').remove();

    // Determine and activate the new current content
    if (finalRatio === 1) { // If animation completed forward
      var $newActiveContent = (this.activeFlippingSegment === PRIMARY_SEGMENT) ?
                              this.rearFlippingLayer.children(':first') :
                              this.frontFlippingLayer.children(':first');
      // This logic needs to correctly identify the content that should become active
      // after the flip, which might be more complex depending on getNext/PrevContent.
      // For simplicity here, we assume the content in the back layer is the target.
      // In a real scenario, you'd likely have a direct reference to the next content element.
      // For a Type III clone, this simplification or an explicit new active content selector is fine.
      // Let's assume contentBeneath was the actual new content.
      // We need to find the *original* content element that corresponds to $contentBeneath.
      // This is a tricky part of the original and requires a mapping or better state.
      // For now, I'll just reactivate the one that was beneath.
      var $originalNextContent = this.getOriginalNextOrPrevContent(this.activeFlippingSegment); // New helper needed
      if ($originalNextContent && $originalNextContent.length) {
          $originalNextContent.addClass(ACTIVE_DISPLAY_CLASS);
      } else {
          // Fallback: This might indicate an issue with content tracking.
          // Re-activate the existing $currentActiveContent if no new one is found.
          $currentActiveContent.addClass(ACTIVE_DISPLAY_CLASS);
      }

    } else { // Animation cancelled or reversed (finalRatio 0)
      $currentActiveContent.addClass(ACTIVE_DISPLAY_CLASS);
    }

    this.frontFlippingLayer = null;
    this.rearFlippingLayer = null;
    this.activeFlippingSegment = null;
    this.animationProgressRatio = null;

    // Trigger a custom event for animation completion
    jQueryAlias(this.rootElement).trigger(COMPONENT_NAMESPACE + 'animationComplete', [this.rootElement]);
  };

  /**
   * Helper function to get the next content element.
   * This is a simplified placeholder and assumes a simple sibling structure.
   * In a real plugin, this would involve more robust content management.
   * @param {jQuery} $currentElement - The currently active content element.
   * @returns {jQuery} The next content element, or the first if looping.
   */
  PageTurner.prototype.getNextContent = function($currentElement) {
    var $next = $currentElement.nextAll(':not(.pt-segment-half, .pt-shadow-layer)').first();
    if ($next.length === 0 && this.configuredOptions.cycleContent) {
      $next = jQueryAlias(this.rootElement).children(':not(.pt-segment-half, .pt-shadow-layer)').first();
    }
    return $next;
  };

  /**
   * Helper function to get the previous content element.
   * This is a simplified placeholder and assumes a simple sibling structure.
   * @param {jQuery} $currentElement - The currently active content element.
   * @returns {jQuery} The previous content element, or the last if looping.
   */
  PageTurner.prototype.getPreviousContent = function($currentElement) {
    var $prev = $currentElement.prevAll(':not(.pt-segment-half, .pt-shadow-layer)').first();
    if ($prev.length === 0 && this.configuredOptions.cycleContent) {
      $prev = jQueryAlias(this.rootElement).children(':not(.pt-segment-half, .pt-shadow-layer)').last();
    }
    return $prev;
  };

  /**
   * Determines the original content element that should become active after a flip.
   * This is crucial because `_segmentContent` clones elements.
   * @param {number} segment - The segment that initiated the flip (PRIMARY_SEGMENT or SECONDARY_SEGMENT).
   * @returns {jQuery} The original target content element.
   */
  PageTurner.prototype.getOriginalNextOrPrevContent = function(segment) {
      var $current = jQueryAlias(this.rootElement).children(SELECTOR_ACTIVE_DISPLAY);
      var $targetContent;

      var currentDirection = this.configuredOptions.advanceDirection;

      // Logic derived from `startAnimation` to determine the underlying content
      if ((currentDirection === DIRECTION_WEST && segment === PRIMARY_SEGMENT) ||
          (currentDirection === DIRECTION_EAST && segment === SECONDARY_SEGMENT) ||
          (currentDirection === DIRECTION_SOUTH && segment === PRIMARY_SEGMENT) ||
          (currentDirection === DIRECTION_NORTH && segment === SECONDARY_SEGMENT)) {
        $targetContent = this.getNextContent($current);
      } else {
        $targetContent = this.getPreviousContent($current);
      }
      return $targetContent;
  };


  // --- jQuery Plugin Definition ---
  jQueryAlias.fn[componentId] = function (operationOrOptions) {
    var methodArgs = Array.prototype.slice.call(arguments, 1); // Arguments for method calls

    return this.each(function () {
      var $element = jQueryAlias(this);
      var instanceData = $element.data(COMPONENT_NAMESPACE + 'instance'); // Retrieve existing instance

      // If no instance exists, create a new one
      if (!instanceData) {
        // Merge default settings with options from data attributes and constructor
        var initialOptions = jQueryAlias.extend(true, {}, standardSettings, typeof operationOrOptions === 'object' && operationOrOptions);

        // Parse data attributes to override settings
        DATA_ATTRIBUTES_MAP.forEach(function(attrMap) {
          var dataValue = $element.data(attrMap.dataAttr);
          if (dataValue !== undefinedValue) {
            initialOptions[attrMap.optionKey] = (attrMap.dataType === VALUE_BOOLEAN) ?
                                               (dataValue === 'true' || dataValue === true) :
                                               dataValue;
          }
        });

        instanceData = new PageTurner(this, initialOptions);
        $element.data(COMPONENT_NAMESPACE + 'instance', instanceData); // Store instance
        $element.addClass(COMPONENT_NAMESPACE + 'initialized'); // Mark as initialized

        // Initial setup for the first content element
        var $firstContent = $element.children().first();
        if ($firstContent.length) {
            $firstContent.addClass(ACTIVE_DISPLAY_CLASS);
        } else {
            console.warn("PageTurner: No content elements found within the container.");
        }

        // Setup keyboard navigation if enabled
        if (instanceData.configuredOptions.keyboardNavigation) {
            jQueryAlias(docElement).on('keydown.' + COMPONENT_NAMESPACE + instanceData.rootElement.id, function(e) {
                if (e.which === KEY_CODE_LEFT_ARROW) {
                    // Trigger a 'previous' action on the instance
                    // This assumes a 'turnBackward' method exists
                    // For Type III, we can add a simple method or trigger a custom event
                    // instanceData.turnBackward();
                    if (!instanceData.isAnimationInProgress) {
                        instanceData.startAnimation(PRIMARY_SEGMENT); // Example: always flip from primary for left
                        instanceData.executeAnimation(1); // Execute full forward flip
                    }
                    e.preventDefault();
                } else if (e.which === KEY_CODE_RIGHT_ARROW) {
                    // Trigger a 'next' action on the instance
                    // instanceData.turnForward();
                     if (!instanceData.isAnimationInProgress) {
                        instanceData.startAnimation(SECONDARY_SEGMENT); // Example: always flip from secondary for right
                        instanceData.executeAnimation(1); // Execute full forward flip
                    }
                    e.preventDefault();
                }
            });
        }

      } else if (typeof operationOrOptions === 'string' && instanceData[operationOrOptions]) {
        // Call a method on the existing instance
        instanceData[operationOrOptions].apply(instanceData, methodArgs);
      } else if (typeof operationOrOptions === 'object') {
        // Update options on existing instance
        jQueryAlias.extend(true, instanceData.configuredOptions, operationOrOptions);
      } else if (operationOrOptions === undefinedValue) {
        // No options, just ensure it's initialized (already handled above)
      } else {
        console.warn('PageTurner: Method ' + operationOrOptions + ' does not exist or invalid options provided.');
      }
    });
  };

  // --- Utility for CSS vendor prefix detection ---
  // This helps apply transforms cross-browser.
  (function () {
    var styles = currentWindow.getComputedStyle(docElement.documentElement, ''),
      pre = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1],
      dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    VENDOR_PREFIX_CSS = '-' + pre + '-';
    // Store the DOM prefix for potential JS API calls (e.g., transitionEnd event)
    jQueryAlias.fn[componentId].domPrefix = dom;
  })();

})(jQuery, window, document);
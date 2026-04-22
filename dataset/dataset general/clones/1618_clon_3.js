var CarouselEngine = function(hostElement, configuration) {
  // Define default settings for the carousel functionality.
  const DEFAULT_SLIDER_SETTINGS = {
    initialSlideIndex: 0,                     // The starting visible slide index.
    itemsPerView: 1,                          // Number of slides displayed simultaneously.
    isVerticalLayout: false,                  // Orientation of the carousel (horizontal or vertical).
    dragThresholdRatio: 0.5,                  // Sensitivity for slide change on drag (0 to 1).
    transitionDurationSec: 0.3,               // Animation speed in seconds.
    animationCurve: 'ease-out',               // CSS easing function for transitions.
    autoAdvanceIntervalSec: false,            // False, or value in seconds for auto-advancing.
    enableHardwareAcceleration: true,         // Use CSS translate3d for performance.
    showPagination: 'link',                   // False, true, or 'link' for bullet navigation.
    showNavigationArrows: false,              // Display previous/next buttons.
    onBeforeSlideChange: null,                // Callback before slide transition.
    onAfterSlideChange: null                  // Callback after slide transition.
  };

  // Validate the provided host element.
  if (!hostElement || !(hostElement instanceof HTMLElement)) {
    console.error('CarouselEngine: Invalid or missing host element provided.');
    return;
  }

  // Merge user configuration with defaults.
  this.configuration = Object.assign({}, DEFAULT_SLIDER_SETTINGS, configuration);

  // Determine orientation early.
  this._isVerticalOrientation = !!this.configuration.isVerticalLayout;

  // Cache the host DOM element and add base classes.
  this._hostDomElement = $(hostElement)
    .addClass('js-carousel-main-container')
    .addClass('js-carousel-' + (this._isVerticalOrientation ? 'vertical' : 'horizontal'));

  // Identify the content wrapper (reel) and slide items.
  this._contentRail = this._hostDomElement.children().first().addClass('js-carousel-reel');
  this._slideItems = Array.from(this._contentRail.children()).map(el => $(el).addClass('js-carousel-item')); // Ensure jQuery wrapper for each.

  // Calculate total views and set initial view.
  this._totalViews = Math.ceil(this._slideItems.length / this.configuration.itemsPerView);
  this._currentViewIndex = this._normalizeViewIndex(this.configuration.initialSlideIndex);

  // Initialize state variables for touch/drag interactions.
  this._touchTrackingData = {};
  this._isTouchDevice = ('ontouchstart' in document.documentElement);
  this._isScrollDetected = undefined; // Used to differentiate between scroll and swipe.

  // Define interaction events based on device capability.
  this._interactionEvents = {
    pointerStart: this._isTouchDevice ? 'touchstart' : 'mousedown',
    pointerMove:  this._isTouchDevice ? 'touchmove'  : 'mousemove',
    pointerEnd:   this._isTouchDevice ? 'touchend touchcancel touchleave' : 'mouseup mouseout mouseleave',
    clickAction:  this._isTouchDevice ? 'touchend' : 'click'
  };

  // Store bound event handlers for proper removal.
  this._boundHandlers = {};

  // Flag to ensure setup runs only once.
  this._isInitialized = false;

  // Perform initial setup and attach event listeners.
  this._initializeCarousel();

  // Conditionally set up navigation elements.
  if (this.configuration.showNavigationArrows) this._createArrowNav();
  if (this.configuration.showPagination) this._createPagination();
  if (this.configuration.autoAdvanceIntervalSec) this._startAutoAdvance();
};

// Define constants for internal use.
const MILLISECONDS_IN_SECOND = 1000;
const MIN_DRAG_TO_DETECT_MOVEMENT_PX = 3; // Minimum pixel movement to consider as a drag.
const ZERO_DIMENSION_THRESHOLD_PX = 5; // Minimum dimension to consider valid.

CarouselEngine.prototype = {
  // --- Public API Methods ---

  /**
   * Navigates the carousel to a specified view index.
   * @param {number} targetViewIdx - The index of the view to navigate to.
   */
  navigateToView: function(targetViewIdx) {
    if (!this._isInitialized) return; // Ensure carousel is ready.
    this._stopAutoAdvance(); // Pause auto-advancement during manual navigation.

    const validatedTargetIdx = this._normalizeViewIndex(targetViewIdx);
    let completionCallback = null;

    // Only trigger change callbacks if the view is actually changing.
    if (this._currentViewIndex !== validatedTargetIdx) {
      if (typeof this.configuration.onBeforeSlideChange === 'function') {
        this.configuration.onBeforeSlideChange(this, this._currentViewIndex, validatedTargetIdx);
      }
      this._currentViewIndex = validatedTargetIdx;
      completionCallback = this._triggerChangeCallbacks.bind(this);
    } else if (this.configuration.autoAdvanceIntervalSec) {
      // If no change but auto-advance is on, restart it after animation.
      completionCallback = this._startAutoAdvance.bind(this);
    }

    this._transitionRail(0, this.configuration.transitionDurationSec, completionCallback);
    if (this.configuration.showPagination) this._updateActivePagination();
  },

  /** Jumps to the first view. */
  goToFirst: function() { this.navigateToView(0); },
  /** Advances to the next view. */
  advance: function() { this.navigateToView(this._currentViewIndex + 1); },
  /** Retreats to the previous view. */
  retreat: function() { this.navigateToView(this._currentViewIndex - 1); },
  /** Jumps to the last view. */
  goToLast: function() { this.navigateToView(this._totalViews - 1); },

  /** Checks if the carousel is at the first view. */
  isAtFirstView: function() { return this._currentViewIndex === 0; },
  /** Checks if the carousel is at the last view. */
  isAtLastView: function() { return this._currentViewIndex === this._totalViews - 1; },

  /**
   * Returns a collection of currently visible slide items.
   * @returns {Array<HTMLElement>} An array of visible DOM elements.
   */
  getVisibleItems: function() {
    const startIdx = this._currentViewIndex * this.configuration.itemsPerView;
    const endIdx = startIdx + this.configuration.itemsPerView;
    return this._slideItems.slice(startIdx, endIdx);
  },

  // --- Private Internal Methods ---

  /**
   * Initializes the carousel by configuring layout and attaching event listeners.
   * This method is called once during constructor execution.
   */
  _initializeCarousel: function() {
    this._configureLayout();
    this._attachInteractionHandlers();
    this._isInitialized = true;
  },

  /**
   * Cleans up event listeners and internal state.
   */
  _destroyCarousel: function() {
    this._stopAutoAdvance();
    this._detachInteractionHandlers();
    this._hostDomElement.removeClass('js-carousel-main-container js-carousel-vertical js-carousel-horizontal');
    this._contentRail.removeClass('js-carousel-reel');
    this._slideItems.forEach(el => el.removeClass('js-carousel-item'));
    // Remove generated navigation elements if they exist.
    this._hostDomElement.find('.js-carousel-nav, .js-carousel-pagination').remove();
    this._isInitialized = false;
  },

  /**
   * Ensures a view index is within valid bounds.
   * @param {number} viewIndex - The proposed view index.
   * @returns {number} The clamped and valid view index.
   */
  _normalizeViewIndex: function(viewIndex) {
    return Math.max(0, Math.min(viewIndex, this._totalViews - 1));
  },

  /**
   * Initiates the auto-advancement mechanism.
   */
  _startAutoAdvance: function() {
    if (this._autoAdvanceTimerId) {
      clearTimeout(this._autoAdvanceTimerId); // Clear any existing timer.
    }
    if (!this.configuration.autoAdvanceIntervalSec) return;

    // Determine whether to go to the first or next slide.
    const advanceAction = this.isAtLastView() ? this.goToFirst : this.advance;
    this._autoAdvanceTimerId = setTimeout(
      advanceAction.bind(this),
      this.configuration.autoAdvanceIntervalSec * MILLISECONDS_IN_SECOND
    );
  },

  /**
   * Halts the auto-advancement.
   */
  _stopAutoAdvance: function() {
    clearTimeout(this._autoAdvanceTimerId);
    this._autoAdvanceTimerId = null; // Use null instead of deleting property.
  },

  /**
   * Moves the content rail to a specific position with animation.
   * @param {number} offsetPx - Additional pixel offset from the current view position.
   * @param {number} durationSec - Animation duration in seconds.
   * @param {Function} [onCompleteCallback] - Callback function after animation completes.
   */
  _transitionRail: function(offsetPx, durationSec, onCompleteCallback) {
    const animationProps = this._calculateAnimationProps(offsetPx);
    this._contentRail.animate(animationProps, {
      duration: durationSec * MILLISECONDS_IN_SECOND,
      easing: this.configuration.animationCurve,
      complete: onCompleteCallback
    });
  },

  /**
   * Calculates the CSS properties for slide animation (translate or translate3d).
   * @param {number} offsetFromCurrentPx - The pixel offset from the current slide's base position.
   * @returns {object} An object containing CSS animation properties.
   */
  _calculateAnimationProps: function(offsetFromCurrentPx) {
    const basePositionPx = -this._currentViewIndex * this._viewportDimension;
    const finalPositionPx = basePositionPx + offsetFromCurrentPx;
    const styleTransforms = {};

    if (this.configuration.enableHardwareAcceleration) {
      // Use translate3d for GPU acceleration.
      styleTransforms['translate3d'] = this._isVerticalOrientation ?
        `0,${finalPositionPx}px,0` :
        `${finalPositionPx}px,0,0`;
    } else {
      // Fallback to translateY/translateX.
      styleTransforms[this._isVerticalOrientation ? 'translateY' : 'translateX'] = `${finalPositionPx}px`;
    }
    return styleTransforms;
  },

  /**
   * Sets up initial dimensions for the carousel container, reel, and individual slides.
   */
  _configureLayout: function() {
    const dimensionPropName = this._isVerticalOrientation ? 'height' : 'width';

    // Get the dimension of the host element.
    this._viewportDimension = this._hostDomElement[dimensionPropName]();

    // Guard against zero dimension.
    if (this._viewportDimension < ZERO_DIMENSION_THRESHOLD_PX) {
      console.warn('CarouselEngine: Host element has zero or very small dimension. Layout might be incorrect.');
      // Attempt to re-evaluate after a short delay, or set a default.
      setTimeout(() => this._configureLayout(), 100);
      return;
    }

    // Calculate the effective drag threshold in pixels.
    this._effectiveDragThresholdPx = this.configuration.dragThresholdRatio * this._viewportDimension / 2;

    // Set dimensions for the content reel and individual slide items.
    this._contentRail[dimensionPropName](this._viewportDimension * this._totalViews + 'px');
    this._slideItems.forEach(item => {
      item[dimensionPropName](this._viewportDimension / this.configuration.itemsPerView + 'px');
    });

    // Move to the initial slide without animation.
    this._transitionRail(0, 0);
  },

  /**
   * Attaches all necessary event listeners for touch/mouse interaction and window resizing.
   */
  _attachInteractionHandlers: function() {
    // Store bound functions to ensure `this` context and allow proper removal.
    this._boundHandlers.handleTouchStart = this._handleTouchOrMouseDown.bind(this);
    this._boundHandlers.handleTouchMove = this._handleTouchOrMouseMove.bind(this);
    this._boundHandlers.handleTouchEnd = this._handleTouchOrMouseEnd.bind(this);
    this._boundHandlers.handleResize = this._configureLayout.bind(this);
    this._boundHandlers.handleNavClick = this._handleNavigationClick.bind(this);
    this._boundHandlers.handlePaginationClick = this._handlePaginationClick.bind(this);

    // Event listeners for touch/mouse movement on the content reel.
    this._contentRail[0].addEventListener(this._interactionEvents.pointerStart, this._boundHandlers.handleTouchStart);
    document.addEventListener(this._interactionEvents.pointerMove, this._boundHandlers.handleTouchMove);
    document.addEventListener(this._interactionEvents.pointerEnd, this._boundHandlers.handleTouchEnd);

    // Event listeners for navigation elements (delegated).
    this._hostDomElement[0].addEventListener(this._interactionEvents.clickAction, this._boundHandlers.handleNavClick);

    // Recalculate dimensions on window resize or orientation change.
    window.addEventListener('resize', this._boundHandlers.handleResize);
  },

  /**
   * Detaches all event listeners.
   */
  _detachInteractionHandlers: function() {
    this._contentRail[0].removeEventListener(this._interactionEvents.pointerStart, this._boundHandlers.handleTouchStart);
    document.removeEventListener(this._interactionEvents.pointerMove, this._boundHandlers.handleTouchMove);
    document.removeEventListener(this._interactionEvents.pointerEnd, this._boundHandlers.handleTouchEnd);
    this._hostDomElement[0].removeEventListener(this._interactionEvents.clickAction, this._boundHandlers.handleNavClick);
    window.removeEventListener('resize', this._boundHandlers.handleResize);

    // If pagination was created, remove its listener.
    if (this._paginationContainer) {
      this._paginationContainer[0].removeEventListener(this._interactionEvents.clickAction, this._boundHandlers.handlePaginationClick);
    }
  },

  /**
   * Handles the start of a touch or mouse drag interaction.
   * @param {Event} eventObject - The event object.
   */
  _handleTouchOrMouseDown: function(eventObject) {
    // Prevent default for desktop mouse events if it's not a touch device to avoid image dragging.
    if (!this._isTouchDevice) {
      eventObject.preventDefault();
    }
    this._touchTrackingData.initialPoint = this._extractTouchCoords(eventObject);
    this._isScrollDetected = undefined; // Reset scroll detection flag.
  },

  /**
   * Handles touch or mouse movement during a drag interaction.
   * @param {Event} eventObject - The event object.
   */
  _handleTouchOrMouseMove: function(eventObject) {
    if (!this._touchTrackingData.initialPoint) return; // No drag started.

    this._touchTrackingData.currentPoint = this._extractTouchCoords(eventObject);
    const dragDistancePx = this._calculateDragDistance(this._isVerticalOrientation);

    // Determine if the user is scrolling or swiping.
    if (this._isScrollDetected === undefined) {
      const scrollDistance = this._calculateDragDistance(!this._isVerticalOrientation);
      // If vertical movement is greater than horizontal (or vice-versa), it's likely a scroll.
      this._isScrollDetected = Math.abs(dragDistancePx) < Math.abs(scrollDistance);
    }

    if (!this._isScrollDetected && Math.abs(dragDistancePx) > MIN_DRAG_TO_DETECT_MOVEMENT_PX) {
      // If it's a swipe (not scroll) and significant movement, prevent default behavior.
      eventObject.preventDefault();
      this._stopAutoAdvance(); // Pause auto-advance during manual swipe.
      this._transitionRail(this._applyResistance(dragDistancePx), 0); // Move reel instantly.
    }
  },

  /**
   * Handles the end of a touch or mouse drag interaction.
   * @param {Event} eventObject - The event object.
   */
  _handleTouchOrMouseEnd: function(eventObject) {
    if (!this._touchTrackingData.initialPoint) return; // No drag started.

    if (!this._isScrollDetected) {
      const finalDragDistance = this._calculateDragDistance(this._isVerticalOrientation);
      let pageChangeDelta = 0; // Default: no page change.

      if (Math.abs(finalDragDistance) > this._effectiveDragThresholdPx) {
        // Determine direction of swipe.
        pageChangeDelta = finalDragDistance < 0 ? 1 : -1;
      }
      this.navigateToView(this._currentViewIndex + pageChangeDelta);
    }

    this._touchTrackingData = {}; // Clear touch state.
  },

  /**
   * Extracts pageX and pageY coordinates from a touch or mouse event.
   * @param {Event} eventObject - The event object.
   * @returns {{x: number, y: number}} An object with x and y coordinates.
   */
  _extractTouchCoords: function(eventObject) {
    const point = this._isTouchDevice ? eventObject.touches[0] : eventObject;
    return { coordX: point.pageX, coordY: point.pageY };
  },

  /**
   * Calculates the distance moved along a specified axis.
   * @param {boolean} forVerticalAxis - True to calculate vertical distance, false for horizontal.
   * @returns {number} The distance in pixels.
   */
  _calculateDragDistance: function(forVerticalAxis) {
    const axis = forVerticalAxis ? 'coordY' : 'coordX';
    if (!this._touchTrackingData.initialPoint || !this._touchTrackingData.currentPoint) {
      return 0;
    }
    return this._touchTrackingData.currentPoint[axis] - this._touchTrackingData.initialPoint[axis];
  },

  /**
   * Applies resistance to drag distance when at the carousel's limits.
   * @param {number} rawDistance - The unresisted drag distance.
   * @returns {number} The distance with resistance applied.
   */
  _applyResistance: function(rawDistance) {
    const isPastStart = this.isAtFirstView() && rawDistance > 0;
    const isPastEnd = this.isAtLastView() && rawDistance < 0;

    if (isPastStart || isPastEnd) {
      // Apply a logarithmic resistance effect.
      return rawDistance / (1 + Math.abs(rawDistance) / this._viewportDimension);
    }
    return rawDistance;
  },

  /**
   * Executes user-defined callbacks after a slide transition completes.
   */
  _triggerChangeCallbacks: function() {
    // Call user-defined callback function with the current view number and visible slides.
    if (typeof this.configuration.onAfterSlideChange === 'function') {
      this.configuration.onAfterSlideChange(this, this._currentViewIndex, this.getVisibleItems());
    }
    // Restart auto-advance if enabled.
    if (this.configuration.autoAdvanceIntervalSec) {
      this._startAutoAdvance();
    }
  },

  /**
   * Handles clicks on navigation arrows (prev/next/first/last).
   * @param {Event} eventObject - The click event.
   */
  _handleNavigationClick: function(eventObject) {
    const target = eventObject.target;
    // Check if the clicked element (or its parent) has a relevant class.
    if (target.classList.contains('js-carousel-next-btn')) {
      this.advance();
    } else if (target.classList.contains('js-carousel-prev-btn')) {
      this.retreat();
    } else if (target.classList.contains('js-carousel-first-btn')) {
      this.goToFirst();
    } else if (target.classList.contains('js-carousel-last-btn')) {
      this.goToLast();
    }
  },

  /**
   * Creates and appends directional navigation arrows (Previous/Next).
   */
  _createArrowNav: function() {
    const navContainer = document.createElement('ul');
    navContainer.classList.add('js-carousel-nav');

    const prevBtn = document.createElement('li');
    prevBtn.classList.add('js-carousel-prev-btn');
    prevBtn.textContent = 'Previous';

    const nextBtn = document.createElement('li');
    nextBtn.classList.add('js-carousel-next-btn');
    nextBtn.textContent = 'Next';

    navContainer.appendChild(prevBtn);
    navContainer.appendChild(nextBtn);

    this._hostDomElement[0].appendChild(navContainer);
  },

  /**
   * Creates and appends bullet pagination navigation.
   */
  _createPagination: function() {
    this._paginationContainer = $('<ul class="js-carousel-pagination"></ul>'); // Use jQuery for creation.
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < this._totalViews; i++) {
      const bulletItem = document.createElement('li');
      bulletItem.setAttribute('data-view-index', i.toString());
      bulletItem.textContent = (i + 1).toString();
      fragment.appendChild(bulletItem);
    }
    this._paginationContainer[0].appendChild(fragment);

    if (this.configuration.showPagination === 'link') {
      this._paginationContainer[0].addEventListener(this._interactionEvents.clickAction, this._boundHandlers.handlePaginationClick);
    }
    this._hostDomElement.append(this._paginationContainer);
    this._updateActivePagination(); // Set initial active bullet.
  },

  /**
   * Handles clicks on pagination bullets.
   * @param {Event} eventObject - The click event.
   */
  _handlePaginationClick: function(eventObject) {
    const target = eventObject.target;
    if (target.tagName === 'LI' && target.hasAttribute('data-view-index')) {
      const targetIndex = parseInt(target.getAttribute('data-view-index'), 10);
      this.navigateToView(targetIndex);
    }
  },

  /**
   * Updates the 'active' class on the current pagination bullet.
   */
  _updateActivePagination: function() {
    if (this._paginationContainer) {
      this._paginationContainer.children('li').removeClass('active');
      this._paginationContainer.children('li').eq(this._currentViewIndex).addClass('active');
    }
  }
};


var Carousel3DEngine = function(hostElement, configuration) {
  // Call the parent constructor.
  CarouselEngine.call(this, hostElement, configuration);
  this._hostDomElement.addClass('js-carousel-3d-mode');
};

// Establish prototype chain for inheritance.
Object.setPrototypeOf(Carousel3DEngine.prototype, CarouselEngine.prototype);

// Extend the 3D carousel prototype with specific overrides.
Object.assign(Carousel3DEngine.prototype, {
  /**
   * Overrides the base setup to configure 3D specific dimensions and positioning.
   */
  _configureLayout: function() {
    const dimensionPropName = this._isVerticalOrientation ? 'height' : 'width';
    this._viewportDimension = this._hostDomElement[dimensionPropName]();

    if (this._viewportDimension < ZERO_DIMENSION_THRESHOLD_PX) {
      console.warn('Carousel3DEngine: Host element has zero or very small dimension. Layout might be incorrect.');
      setTimeout(() => this._configureLayout(), 100);
      return;
    }

    this._effectiveDragThresholdPx = this.configuration.dragThresholdRatio * this._viewportDimension / 2;

    // Calculate rotation angle per slide and the radius of the cylinder.
    this._slideAngleIncrement = 360 / this._slideItems.length * (this._isVerticalOrientation ? -1 : 1);
    this._cylinderRadius = Math.round((this._viewportDimension / 2) / Math.tan(Math.PI / this._slideItems.length));

    // Position each slide in 3D space.
    this._slideItems.forEach((itemElement, itemIdx) => {
      // Use jQuery animate to apply initial 3D transforms.
      itemElement.animate(this._getRotationVector(itemIdx * this._slideAngleIncrement, this._cylinderRadius), { duration: 0 });
    });

    // Move to the initial slide without animation.
    this._transitionRail(0, 0);
  },

  /**
   * Overrides the base method to allow circular navigation for 3D carousels.
   * @param {number} proposedIndex - The proposed view index.
   * @returns {number} The normalized index within the circular range.
   */
  _normalizeViewIndex: function(proposedIndex) {
    let normalizedIndex = proposedIndex;
    if (normalizedIndex < 0) {
      normalizedIndex += this._totalViews;
    } else if (normalizedIndex >= this._totalViews) {
      normalizedIndex %= this._totalViews;
    }
    return normalizedIndex;
  },

  /**
   * Calculates 3D animation properties (rotate3d and translate3d).
   * @param {number} offsetFromCurrentPx - Additional pixel offset from current view.
   * @returns {object} An object with CSS transform properties for 3D animation.
   */
  _calculateAnimationProps: function(offsetFromCurrentPx) {
    // Calculate the total rotation angle based on current view and drag offset.
    const rotationAngle = (this._slideAngleIncrement * offsetFromCurrentPx / this._viewportDimension) -
                          (this._slideAngleIncrement * this._currentViewIndex);
    return {
      translate3d: `0,0,${-this._cylinderRadius}px`, // Move back to the cylinder center.
      rotate3d: this._getRotationVector(rotationAngle) // Apply rotation.
    };
  },

  /**
   * Generates the CSS `rotate3d` and `translate3d` string for initial positioning of a slide.
   * @param {number} angleDegrees - The rotation angle in degrees.
   * @param {number} [translationRadius] - Optional radius for initial Z-translation.
   * @returns {object} CSS properties for 3D transform.
   */
  _getRotationVector: function(angleDegrees, translationRadius) {
    const axisVector = this._isVerticalOrientation ? '1,0,0' : '0,1,0'; // X for vertical, Y for horizontal.
    const transformProps = {
      rotate3d: `${axisVector},${angleDegrees}deg`
    };
    if (translationRadius !== undefined) {
      transformProps.translate3d = `0,0,${translationRadius}px`; // Move forward from cylinder center.
    }
    return transformProps;
  },

  /**
   * Overrides resistance for 3D, as 3D carousels typically wrap around without resistance.
   * @param {number} rawDistance - The unresisted drag distance.
   * @returns {number} The raw distance, as no resistance is applied.
   */
  _applyResistance: function(rawDistance) {
    return rawDistance; // No resistance for 3D carousel.
  }
});

// Zepto/jQuery plugin integration.
;(function($) {
  $.fn.createCarousel = function(opts) {
    const carouselOptions = opts || {};
    // Determine which engine class to use based on configuration.
    const EngineClass = carouselOptions.threeD ? Carousel3DEngine : CarouselEngine;

    // Iterate over each selected DOM element.
    return this.each(function() {
      // Create a new carousel instance.
      const instance = new EngineClass(this, carouselOptions);

      // Store the instance reference directly on the DOM element's dataset.
      // Removed the redundant data("swipeInstance", s).data("swipeInstance") check
      // and the conditional removeAttr.
      this.dataset.carouselInstance = instance;
    });
  };
})(window.Zepto || window.jQuery); // Use Zepto if available, otherwise jQuery.
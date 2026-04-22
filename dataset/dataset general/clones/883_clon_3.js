(function() {

  // A component designed to rotate through content elements within a designated container.
  // This module provides a basic carousel functionality, managing CSS classes for active and historic states.
  function ContentCarousel(containerElement, userSettings) {

    // If 'new' keyword was omitted, ensure correct instantiation.
    // Handles multiple container elements by creating a new instance for each.
    if (!(this instanceof ContentCarousel)) {
      // Validate input: ensure a valid DOM node or NodeList/Array of nodes.
      if (!containerElement) {
        console.warn("ContentCarousel: No container element provided for initialization.");
        return;
      }

      // If it's an array-like structure (NodeList, HTMLCollection, actual Array),
      // create a new instance for each item.
      if (typeof containerElement.length === 'number' && containerElement.length > 0) {
        // Use Array.from for robust iteration over various array-like objects.
        Array.from(containerElement).forEach(function(itemNode) {
          if (itemNode && itemNode.nodeType === 1) { // Ensure it's an actual element node.
            new ContentCarousel(itemNode, userSettings);
          }
        });
      } else if (containerElement.nodeType === 1) { // Single DOM element.
        new ContentCarousel(containerElement, userSettings);
      } else {
        console.warn("ContentCarousel: Invalid container element type provided.", containerElement);
      }
      return; // Stop execution for the "constructor-less" invocation.
    }

    // --- Instance Initialization Starts Here ---

    // Ensure we are working with a single DOM element.
    // This check handles potential (mock) jQuery objects or ensures it's a raw DOM element.
    this.hostNode = (typeof jQuery !== 'undefined' && containerElement instanceof jQuery) ? containerElement[0] : containerElement;

    // Critical check: hostNode must be a valid DOM element.
    if (!this.hostNode || this.hostNode.nodeType !== 1) {
      console.error("ContentCarousel: Provided container is not a valid DOM element.");
      return;
    }

    // Define CSS class names used for managing slide states.
    this.cssMarkers = {
      currentMarker: 'is-active-slide', // Class for the currently displayed slide.
      historicMarker: 'was-previous-slide' // Class for the slide that was just active.
    };

    // Establish default configuration settings.
    var baseConfiguration = {
      cycleDurationMs: 3000, // Time in milliseconds between automatic slide transitions.
      autoAdvance: true      // Flag to control automatic cycling.
    };

    // Merge user-provided settings with defaults.
    // Object.assign provides a more modern and readable way to extend objects.
    this.config = Object.assign({}, baseConfiguration, userSettings);

    // Validate essential configuration properties.
    if (typeof this.config.cycleDurationMs !== 'number' || this.config.cycleDurationMs < 500) {
      console.warn("ContentCarousel: Invalid cycleDurationMs detected. Defaulting to 3000ms.");
      this.config.cycleDurationMs = 3000;
    }

    // Retrieve child elements that will act as carousel items.
    // A simple check for sufficient items.
    if (!this.hostNode.children || this.hostNode.children.length < 2) {
      console.warn("ContentCarousel: Container requires at least two child elements to function as a carousel.", this.hostNode);
      return; // Cannot operate without enough items.
    }

    // Initialize state variables.
    this.activeItemIndex = 0; // Index of the currently visible slide.
    this.carouselItems = Array.from(this.hostNode.children); // Convert HTMLCollection to Array for easier manipulation.
    this.itemCount = this.carouselItems.length; // Total number of slides.
    this.transitionTimerId = null; // Holds the ID for the setInterval timer.
    this.isCycling = false; // Flag to indicate if the carousel is currently auto-advancing.

    // Immediately set the first item as active.
    this._applyCssClass(this.cssMarkers.currentMarker, this.carouselItems[this.activeItemIndex]);

    // If auto-advance is enabled, start the cycling process.
    if (this.config.autoAdvance) {
      this._startAutoCycle();
    }
  }

  /**
   * Private helper method to add a CSS class to a DOM element.
   * Ensures no duplicate classes and handles spacing.
   * @param {string} classNameStr The class name to add.
   * @param {HTMLElement} targetItem The DOM element.
   */
  ContentCarousel.prototype._applyCssClass = function(classNameStr, targetItem) {
    if (!targetItem || targetItem.nodeType !== 1) return; // Guard clause for invalid element.
    if (!classNameStr || typeof classNameStr !== 'string') return; // Guard clause for invalid class name.

    var currentClasses = targetItem.className;
    // Check if the class already exists to prevent redundant additions.
    if ((' ' + currentClasses + ' ').indexOf(' ' + classNameStr + ' ') === -1) {
      targetItem.className = (currentClasses ? currentClasses + ' ' : '') + classNameStr;
    }
  };

  /**
   * Private helper method to remove a CSS class from a DOM element.
   * Uses a regular expression for robust removal, handling multiple spaces.
   * @param {string} classNameStr The class name to remove.
   * @param {HTMLElement} targetItem The DOM element.
   */
  ContentCarousel.prototype._removeCssClass = function(classNameStr, targetItem) {
    if (!targetItem || targetItem.nodeType !== 1) return;
    if (!classNameStr || typeof classNameStr !== 'string') return;

    var currentClasses = targetItem.className;
    // Create a regex to find the class name, allowing for leading/trailing spaces.
    // The "\b" ensures whole word matching.
    var classRemovalPattern = new RegExp("\\s*\\b" + classNameStr + "\\b\\s*", "g");
    // Replace all occurrences and then trim any remaining leading/trailing whitespace.
    targetItem.className = currentClasses.replace(classRemovalPattern, ' ').trim();
  };

  /**
   * Private helper method to remove a specific CSS marker from all carousel items.
   * @param {string} markerToRemove The CSS class marker to clear.
   */
  ContentCarousel.prototype._resetMarkers = function(markerToRemove) {
    if (!markerToRemove || typeof markerToRemove !== 'string') return;

    // Iterate through all items and remove the specified marker.
    for (let idx = 0; idx < this.itemCount; idx++) {
      this._removeCssClass(markerToRemove, this.carouselItems[idx]);
    }
  };

  /**
   * Initiates the automatic cycling of the carousel.
   * Clears any existing timer before starting a new one.
   */
  ContentCarousel.prototype._startAutoCycle = function() {
    if (this.transitionTimerId) {
      this.dispose(); // Clear any existing timer to prevent duplicates.
    }
    this.isCycling = true;
    this.transitionTimerId = setInterval(this.progressCarousel.bind(this), this.config.cycleDurationMs);
  };

  /**
   * Stops the automatic cycling of the carousel and clears the timer.
   */
  ContentCarousel.prototype.dispose = function() {
    if (this.transitionTimerId) {
      clearInterval(this.transitionTimerId);
      this.transitionTimerId = null;
    }
    this.isCycling = false;
    // Optionally, remove all carousel-related classes from items upon disposal.
    this._resetMarkers(this.cssMarkers.currentMarker);
    this._resetMarkers(this.cssMarkers.historicMarker);
    console.log("ContentCarousel: Disposed instance on", this.hostNode);
  };

  /**
   * Advances the carousel to the next slide in sequence.
   * This is the core logic for slide transitions.
   */
  ContentCarousel.prototype.progressCarousel = function() {
    // Calculate the index of the next slide.
    // If we're at the last slide, loop back to the first.
    let nextItemIndex = (this.activeItemIndex + 1) % this.itemCount;

    // Get references to the current, previous (if applicable), and next elements.
    const currentSlide = this.carouselItems[this.activeItemIndex];
    const nextSlide = this.carouselItems[nextItemIndex];

    // 1. Remove the 'historic' marker from the element that was previously active-1.
    // This handles the case where historicMarker might persist from a previous cycle.
    // We only remove if it's not the current slide, to avoid conflicts if historic and current overlap in logic.
    if (this.activeItemIndex > 0) {
      this._removeCssClass(this.cssMarkers.historicMarker, this.carouselItems[this.activeItemIndex - 1]);
    } else {
      // If activeItemIndex is 0, the 'historic' class might be on the last item from a wrap-around.
      // So, clear it from the last item if it exists.
      this._removeCssClass(this.cssMarkers.historicMarker, this.carouselItems[this.itemCount - 1]);
    }


    // 2. Clear the 'historic' marker from all slides before assigning it to the current one.
    // This ensures only one slide (the one *just* active) has this marker.
    this._resetMarkers(this.cssMarkers.historicMarker);

    // 3. Update classes for the transition.
    this._removeCssClass(this.cssMarkers.currentMarker, currentSlide);  // Current slide is no longer active.
    this._applyCssClass(this.cssMarkers.historicMarker, currentSlide); // Current slide becomes historic.
    this._applyCssClass(this.cssMarkers.currentMarker, nextSlide);    // Next slide becomes active.

    // 4. Update the internal active index.
    this.activeItemIndex = nextItemIndex;
  };

  /**
   * Navigates the carousel to a specific slide by its index.
   * @param {number} targetIndex The 0-based index of the slide to go to.
   */
  ContentCarousel.prototype.goToSlide = function(targetIndex) {
    if (typeof targetIndex !== 'number' || targetIndex < 0 || targetIndex >= this.itemCount) {
      console.warn("ContentCarousel: Invalid slide index provided:", targetIndex);
      return;
    }

    if (this.activeItemIndex === targetIndex) {
      return; // Already on this slide.
    }

    // Stop auto-cycling temporarily if it's active.
    const wasCycling = this.isCycling;
    if (wasCycling) {
      this.dispose();
    }

    // Get references to the current and target elements.
    const currentSlide = this.carouselItems[this.activeItemIndex];
    const targetSlide = this.carouselItems[targetIndex];

    // Clear all markers first for a clean transition.
    this._resetMarkers(this.cssMarkers.currentMarker);
    this._resetMarkers(this.cssMarkers.historicMarker);

    // Set the target slide as current.
    this._applyCssClass(this.cssMarkers.currentMarker, targetSlide);
    // The previous active slide becomes historic.
    this._applyCssClass(this.cssMarkers.historicMarker, currentSlide);

    this.activeItemIndex = targetIndex;

    // Restart auto-cycling if it was active.
    if (wasCycling) {
      this._startAutoCycle();
    }
  };

  // Expose the ContentCarousel constructor to the global window object.
  // This allows users to instantiate the component.
  if (typeof window !== 'undefined') {
    window.ContentCarousel = ContentCarousel;
  }

})();
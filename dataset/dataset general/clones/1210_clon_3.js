(() => {
  'use strict'; // Activate strict mode for cleaner JavaScript.

  // Acquire references to external libraries, using distinct identifiers.
  // These constants ensure that the references to jQuery and Waypoint are immutable.
  const jq = window.jQuery; // Renamed from '$'
  const ScrollMonitor = window.Waypoint; // Renamed from 'Waypoint'

  // --- Reference and Context ---
  // This module provides functionality for creating "sticky" UI elements,
  // typically used for navigation bars or sidebars that remain visible
  // as the user scrolls. It's an adaptation of a common pattern.
  // Original concept inspiration: http://imakewebthings.com/waypoints/shortcuts/sticky-elements

  /**
   * @class ElementStabilizer
   * @description Manages the fixed positioning of a DOM element based on scroll events.
   *              It leverages the ScrollMonitor (Waypoint) library to detect when
   *              an element should transition between normal and 'sticky' states.
   * @param {object} initialConfig - An object containing user-defined settings for this stabilizer instance.
   */
  function ElementStabilizer(initialConfig) {
    // Merge default settings with Waypoint's own defaults and then with user-provided configurations.
    // Using Object.assign for a modern, non-mutating merge operation.
    const combinedDefaults = Object.assign({}, ScrollMonitor.defaults, ElementStabilizer.defaultSettings);
    this.configuration = Object.assign(combinedDefaults, initialConfig);

    // --- Input Validation ---
    // Ensure that a target element has been specified in the configuration.
    if (!this.configuration.targetElement) {
      console.error('ElementStabilizer: Initialization failed. A "targetElement" must be specified in the configuration.');
      // A more robust implementation might throw an error or return a rejected Promise.
      return; // Abort initialization if the essential element is missing.
    }

    // Store references to the raw DOM node and its jQuery-wrapped equivalent.
    this.domNode = this.configuration.targetElement;
    this.$domNode = jq(this.domNode);

    // Prepare the structural container that will wrap the sticky element.
    this.prepareContainer();

    // Set up the scroll event listener via ScrollMonitor.
    this.initializeMonitor();
  }

  // --- Prototype Methods for ElementStabilizer ---

  /**
   * @method initializeMonitor
   * @description Configures and activates the ScrollMonitor (Waypoint) instance.
   *              This monitor tracks the position of the element's container
   *              and triggers actions when it enters or exits the viewport.
   */
  ElementStabilizer.prototype.initializeMonitor = function() {
    const currentSettings = this.configuration;
    const userActionCallback = currentSettings.actionCallback; // The user's original event handler.

    // Prevent re-initialization if a monitor is already active for this instance.
    if (this.scrollTracker) {
      console.warn('ElementStabilizer: Scroll monitor is already active. Skipping duplicate initialization.');
      return;
    }

    // Create a new ScrollMonitor (Waypoint) instance.
    // The handler function is bound using an arrow function to preserve 'this' context.
    this.scrollTracker = new ScrollMonitor(Object.assign({}, currentSettings, {
      element: this.containerNode, // The ScrollMonitor tracks the wrapper, not the element itself.
      handler: (scrollDirection) => {
        // Determine if the element should adopt the 'fixed' (sticky) position based on scroll direction.
        const shouldBeFixed = currentSettings.activeDirections.includes(scrollDirection);
        let containerVisualHeight = ''; // Variable to hold the calculated height for the container.

        // If the element is becoming fixed, set its container's height to prevent page reflow.
        // Otherwise, clear the height to allow the container to collapse.
        if (shouldBeFixed) {
          containerVisualHeight = this.$domNode.outerHeight(true); // Get element's full computed height.
        }

        // Apply the calculated height to the container using jQuery's CSS method.
        this.$container.css('height', containerVisualHeight);

        // Toggle the configured CSS class on the main element to apply fixed styling.
        this.$domNode.toggleClass(currentSettings.fixedClassName, shouldBeFixed);

        // --- Post-State-Change Actions ---
        // Execute the user-defined callback, if one was provided.
        // Using Reflect.apply for a clean way to invoke with a specific 'this' context.
        if (userActionCallback) {
          Reflect.apply(userActionCallback, this, [scrollDirection]);
        }

        // Optional: Log state changes for debugging.
        // console.debug(`Stabilizer State: ID=${this.domNode.id || 'N/A'}, Dir=${scrollDirection}, Fixed=${shouldBeFixed}`);
      }
    }));
  };

  /**
   * @method prepareContainer
   * @description Wraps the target element within a designated container.
   *              This container is crucial for maintaining document flow
   *              when the inner element becomes absolutely or fixed positioned.
   */
  ElementStabilizer.prototype.prepareContainer = function() {
    const currentSettings = this.configuration;

    // Only proceed if a container template is specified.
    if (currentSettings.containerTemplate) {
      const currentParent = this.$domNode.parent();

      // Implement a guard to prevent redundant wrapping.
      // Checks if the immediate parent is already a 'stabilizer-wrapper' or the body.
      if (!currentParent.hasClass('stabilizer-wrapper') && currentParent[0] !== document.body) {
        this.$domNode.wrap(currentSettings.containerTemplate);
      } else {
        // If already wrapped or parent is body, simply log an info message.
        console.info('ElementStabilizer: Element appears to be already wrapped or its parent is the document body. Skipping wrap operation.');
      }
    }

    // Store references to the new (or existing) container element.
    this.$container = this.$domNode.parent();
    this.containerNode = this.$container[0];
  };

  /**
   * @method cleanUp
   * @description Undoes all changes made by the ElementStabilizer.
   *              It destroys the ScrollMonitor, removes styling classes,
   *              and unwraps the element from its container.
   */
  ElementStabilizer.prototype.cleanUp = function() {
    // Validate that the element is still within its expected container before proceeding.
    // This helps prevent errors if the DOM was externally modified.
    if (this.$domNode.parent()[0] === this.containerNode) {
      // Ensure the scroll monitor exists before attempting to disable it.
      if (this.scrollTracker) {
        this.scrollTracker.disable(); // Deactivates the Waypoint instance.
        this.scrollTracker = null; // Clear the reference to allow garbage collection.
      }

      // Remove the fixed positioning class and unwrap the element from its container.
      this.$domNode.removeClass(this.configuration.fixedClassName).unwrap();
      // Explicitly reset any inline position styles that might have been applied.
      this.$domNode.css('position', '');
    } else {
      console.warn('ElementStabilizer: Element\'s container structure has changed unexpectedly. Cleanup might be incomplete.');
    }
  };

  // --- Default Configuration Settings ---
  // These defaults are applied during initialization and can be overridden.
  ElementStabilizer.defaultSettings = {
    targetElement: null, // The primary DOM element to be made sticky. (Renamed from 'element')
    containerTemplate: '<div class="stabilizer-wrapper" />', // HTML string for the wrapper element. (Renamed from 'wrapper')
    fixedClassName: 'element-fixed', // CSS class applied when the element is sticky. (Renamed from 'stuckClass')
    activeDirections: ['down', 'right'], // An array of scroll directions that trigger the sticky state. (Changed from string to array)
    actionCallback: null // An optional function to be called when the sticky state changes. (Renamed from 'handler')
  };

  // Expose the ElementStabilizer constructor as a property of the ScrollMonitor (Waypoint) object.
  // This integrates it nicely into the Waypoint ecosystem.
  ScrollMonitor.ElementStabilizer = ElementStabilizer;

})();
(function(globalScope, docElement, initialTarget, noValue) {

  // This constant defines the CSS class string that will be applied to the target element.
  // It provides a visual indicator that the scroll-triggered effect has been activated.
  const ACTIVATION_MARKER_CLASS = "scroll-activated-style";

  // A numerical constant representing the minimum vertical scroll position (in pixels)
  // required to trigger the effect. A slightly increased value from the original.
  const SCROLL_TRIGGER_THRESHOLD = 3;

  /**
   * Private utility function to check if the jQuery library is available in the global scope.
   * This helps in determining the most appropriate method for adding CSS classes.
   * @returns {boolean} True if jQuery is detected, false otherwise.
   */
  function isjQueryAvailable() {
    return typeof globalScope.$ !== "undefined" && typeof globalScope.$.fn !== "undefined";
  }

  /**
   * Constructor function for the ScrollEffectHandler.
   * This class manages the application of a CSS class to the document body
   * either immediately or after a small scroll event.
   */
  const ScrollEffectHandler = function() {
    // Establish the target DOM element. If an initial target is provided, use it;
    // otherwise, default to the document's body element.
    this.targetElement = initialTarget || docElement.body;

    // A crucial guard clause: if no valid target element can be found (e.g., script runs too early),
    // log a warning and abort the constructor to prevent further errors.
    if (!this.targetElement) {
      console.warn("ScrollEffectHandler: No valid target element (document.body) found. Aborting initialization.");
      return;
    }

    // A boolean flag to track whether the scroll condition has been met.
    // This prevents re-triggering the effect unnecessarily.
    this.activationConditionMet = false;

    // Another flag to ensure the CSS class is applied only once to the target element.
    this.classAlreadyApplied = false;

    // Decide whether to attach a scroll listener or execute the effect immediately.
    // Modern browsers support 'addEventListener', allowing for deferred execution.
    if (globalScope.addEventListener) {
      try {
        // Attach a scroll event listener to the window. The 'this' context refers
        // to the ScrollEffectHandler instance, which will then invoke its 'handleEvent' method.
        // The 'passive: true' option is used for performance optimization in modern browsers.
        globalScope.addEventListener("scroll", this, { passive: true });
      } catch (err) {
        // In case of an unexpected error during event listener registration, log it
        // and fall back to immediately applying the effect.
        console.error("ScrollEffectHandler: Failed to register scroll listener.", err);
        this.initiateEffect();
      }
    } else {
      // For older browsers or environments that do not support 'addEventListener',
      // the effect is initiated immediately upon construction.
      this.initiateEffect();
    }
  };

  /**
   * Prototype method to handle DOM events. When 'this' (an instance of ScrollEffectHandler)
   * is passed as an event listener, the browser automatically calls its 'handleEvent' method.
   * This method acts as the entry point for scroll event processing.
   * @param {Event} eventObject - The DOM event object (e.g., a scroll event).
   */
  ScrollEffectHandler.prototype.processEvent = function(eventObject) {
    // If the vertical scroll position is below or equal to the defined threshold,
    // the condition for activation has not been met yet, so exit early.
    if (globalScope.scrollY <= SCROLL_TRIGGER_THRESHOLD) {
      return;
    }

    // If the activation condition has not yet been met AND the class hasn't been applied,
    // proceed with the activation sequence.
    if (!this.activationConditionMet && !this.classAlreadyApplied) {
      this.activationConditionMet = true; // Mark the condition as met.

      // Once the scroll condition is met and the effect is about to be initiated,
      // remove the scroll event listener to prevent further unnecessary calls.
      if (globalScope.removeEventListener) {
        globalScope.removeEventListener("scroll", this);
      }

      // Execute the primary effect: applying the CSS class.
      this.initiateEffect();
    }
  };

  /**
   * Prototype method responsible for applying the designated CSS class to the target element.
   * It attempts various methods to ensure broad browser compatibility.
   */
  ScrollEffectHandler.prototype.initiateEffect = function() {
    // A guard clause to prevent the class from being applied multiple times,
    // ensuring idempotency of the effect.
    if (this.classAlreadyApplied) {
      return;
    }

    // Prioritize the modern 'classList' API for adding classes, as it's efficient.
    if (this.targetElement.classList) {
      this.targetElement.classList.add(ACTIVATION_MARKER_CLASS);
    } else if (isjQueryAvailable()) {
      // If 'classList' is not available, check for jQuery and use its 'addClass' method.
      globalScope.$(this.targetElement).addClass(ACTIVATION_MARKER_CLASS);
    } else {
      // As a final fallback for very old browsers, directly manipulate 'className'.
      // This check ensures the class isn't duplicated if it somehow already exists
      // or if previous attempts partially failed.
      if (!this.targetElement.className.includes(ACTIVATION_MARKER_CLASS)) {
        // Prepend a space if there are existing classes to ensure correct formatting.
        this.targetElement.className += (this.targetElement.className ? " " : "") + ACTIVATION_MARKER_CLASS;
      }
    }

    // Mark that the class has now been successfully applied.
    this.classAlreadyApplied = true;
  };

  // Alias the internal event processing method to 'handleEvent'.
  // This is crucial because when an object instance is passed to 'addEventListener',
  // the browser specifically looks for and calls a method named 'handleEvent' on that object.
  ScrollEffectHandler.prototype.handleEvent = ScrollEffectHandler.prototype.processEvent;


  // Module export strategy: support for AMD (Asynchronous Module Definition)
  // or expose the constructor globally.
  if (typeof define !== "undefined" && define.amd) {
    // If AMD loader is present and active, define this as a module.
    define([], function() {
      return ScrollEffectHandler;
    });
  } else {
    // Otherwise, attach the constructor to the global scope (window)
    // under a new, distinct name for direct access.
    globalScope.BodyScrollActivator = ScrollEffectHandler;
  }

// The IIFE is immediately invoked with key global objects and an explicit 'void 0'
// for 'undefined', ensuring robust handling across different environments.
})(window, document, document.body, void 0);
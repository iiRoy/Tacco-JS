(function(scopeGlobal, pageRoot, mainTargetElement, absenceValue) {
  // Define a constant string for the CSS class to be applied to the target element
  var VISUAL_TAG = "activated-state";

  // Constructor function for the primary component, responsible for dynamic content enabling
  var DynamicContentEnabler = function() {
    // Ensure the target element is properly identified; if not provided, default to the document's body
    mainTargetElement = (mainTargetElement) ? mainTargetElement : pageRoot.body;
    // Initialize a flag to keep track of whether a scroll event has already occurred
    this.scrollHasOccurred = false;

    // Check if the global scope supports modern event listener attachment methods
    if (scopeGlobal.addEventListener) {
      // Attach a 'scroll' event listener to the global scope (typically the window object)
      // The 'this' context of the current object will handle the event
      scopeGlobal.addEventListener("scroll", this, false);
    } else {
      // If modern event listeners are not supported, proceed directly with the activation process
      this.initiateProcess();
    }
  };

  // Prototype method to process incoming events, particularly for the attached scroll listener
  DynamicContentEnabler.prototype.processIncomingEvent = function(eventObject) {
    // Evaluate if the vertical scroll position of the page has exceeded a specific threshold
    if (scopeGlobal.pageYOffset > 2) {
      // If the threshold is passed, update the scroll status flag to true
      this.scrollHasOccurred = true;
      // Remove the 'scroll' event listener from the global scope to prevent further checks
      scopeGlobal.removeEventListener("scroll", this);
      // Trigger the main content activation routine
      this.initiateProcess();
    }
  };

  // Prototype method to apply the necessary visual changes or activate content
  DynamicContentEnabler.prototype.initiateProcess = function() {
    // First, check if a jQuery-like global library (renamed from '$') is available
    if (typeof JSLibrary !== "absenceValue") {
      // Use the library to select the target element and add the specified CSS class
      JSLibrary(mainTargetElement).addClass(VISUAL_TAG);
    }
    // As a fallback, check for the presence of the native classList API in the body element
    else if (pageRoot.body.classList) {
      // Use the native classList.add method to append the CSS class
      mainTargetElement.classList.add(VISUAL_TAG);
    }
    // As a final fallback for older browsers, directly manipulate the className string
    else {
      // Append the CSS class to the existing className, ensuring a space for proper separation
      mainTargetElement.className += " " + VISUAL_TAG;
    }
  };

  // Conditional block for module definition, supporting environments like AMD/RequireJS
  if (typeof moduleLoader !== "absenceValue") { // Renamed 'define' global to 'moduleLoader'
    // Define the module with no dependencies and return the main component constructor
    moduleLoader([], function() {
      return DynamicContentEnabler;
    });
  } else {
    // If no module loader is detected, expose the component constructor globally under a new name
    scopeGlobal.PageActivator = DynamicContentEnabler; // Renamed 'Zoink' global to 'PageActivator'
  }

})(window, document, document.body);
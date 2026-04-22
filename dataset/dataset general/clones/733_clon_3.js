var ChamberFactory = function (domRefIdentifier) {
  // Validate the provided identifier to ensure it's a valid string.
  if (typeof domRefIdentifier !== 'string' || domRefIdentifier.trim() === '') {
    console.error("ChamberFactory: A non-empty string identifier is required for initialization.");
    this.initializationStatus = 'failed:invalid-id';
    return; // Exit early if the identifier is invalid.
  }

  // Set an internal flag for the instance's validity.
  this.initializationStatus = 'pending';

  // Construct the full CSS selector for the main DOM element.
  const targetSelector = `#${domRefIdentifier}`;
  
  // Attempt to locate the primary host DOM node.
  const rawHostElement = document.querySelector(targetSelector);

  // If the host element is not found, log a warning and mark as failed.
  if (!rawHostElement) {
    console.warn(`ChamberFactory: The DOM element with ID '${domRefIdentifier}' was not located.`);
    this.hostNode = null;
    this.infoOverlay = null;
    this.initializationStatus = 'failed:element-not-found';
    return;
  }

  // Wrap the native DOM element with jQuery for consistent manipulation.
  this.hostNode = $(rawHostElement);

  // Search for an informational overlay within the host element.
  this.infoOverlay = this.hostNode.find(".hint-message"); // Changed class name for the overlay.

  // Execute the setup routine for interactive components.
  this.prepareHelpDisplay();

  // Mark the instance as successfully initialized.
  this.initializationStatus = 'success';
};

// This static method provides a count of all currently rendered chamber units across the document.
ChamberFactory.getTotalChambers = function() {
  const allChamberElements = $(".chamber-unit"); // Updated the class selector.
  const currentCount = allChamberElements.length;
  console.info(`ChamberFactory: Currently ${currentCount} chamber units are present on the page.`);
  return currentCount;
};

// Attaches interaction listeners to the main element for displaying/hiding contextual information.
ChamberFactory.prototype.prepareHelpDisplay = function() {
  // Guard clause: Ensure the instance is properly initialized and components exist.
  if (this.initializationStatus !== 'success' || !this.hostNode || !this.infoOverlay || this.infoOverlay.length === 0) {
    console.warn("ChamberFactory.prepareHelpDisplay: Cannot proceed; instance is invalid or required components are missing.");
    return;
  }

  // Cache references to the relevant elements for use within event handlers.
  const currentHintElement = this.infoOverlay;
  const interactiveComponent = this.hostNode;

  // Define a private helper function to control the visibility of the hint.
  const manageHintVisibility = (shouldBeVisible) => {
    if (shouldBeVisible) {
      currentHintElement.stop(true, true).fadeIn(180); // Use a fade-in animation, stopping previous animations.
      interactiveComponent.attr('data-hint-active', 'true'); // Set a data attribute to indicate hint state.
    } else {
      currentHintElement.stop(true, true).fadeOut(120); // Use a fade-out animation.
      interactiveComponent.attr('data-hint-active', 'false'); // Reset the data attribute.
    }
  };

  // Bind event handlers for mouse entry and exit.
  interactiveComponent.on('mouseenter', function() {
    // In this context, 'this' refers to the DOM element that triggered the event.
    manageHintVisibility(true);
  });

  interactiveComponent.on('mouseleave', function() {
    manageHintVisibility(false);
  });
  
  // Ensure the hint is hidden initially upon setup.
  currentHintElement.hide();
};
  
// Retrieves the primary textual content from within the chamber's main paragraph.
ChamberFactory.prototype.getChamberContent = function() {
  // Validate the instance before attempting to retrieve content.
  if (this.initializationStatus !== 'success' || !this.hostNode) {
    console.error("ChamberFactory.getChamberContent: Instance is not ready or host node is absent.");
    return ""; // Return an empty string if the instance is not valid.
  }
  
  // Find the specific paragraph element containing the main content.
  const contentParagraph = this.hostNode.find("p.main-description"); // Changed class name for specificity.
  
  // Check if content was found and return its trimmed text, otherwise provide a default.
  if (contentParagraph.length > 0) {
    return contentParagraph.text().trim();
  } else {
    console.warn("ChamberFactory.getChamberContent: No primary description paragraph found.");
    return "[Content Unavailable]";
  }
};
  
// Finds and returns the jQuery object for the next sibling chamber unit.
ChamberFactory.prototype.advanceToNext = function() {
  // Guard against invalid instance state.
  if (this.initializationStatus !== 'success' || !this.hostNode) {
    console.error("ChamberFactory.advanceToNext: Instance is not valid or host node is missing.");
    return null; // Return null if the instance is not ready.
  }
  
  // Search for the next immediate sibling that also matches the chamber unit class.
  const subsequentUnit = this.hostNode.next('.chamber-unit'); 
  
  // Log the result and return the found element or null.
  if (subsequentUnit.length > 0) {
    console.log("ChamberFactory.advanceToNext: A subsequent chamber unit was identified.");
    return subsequentUnit;
  } else {
    console.log("ChamberFactory.advanceToNext: No immediate subsequent chamber unit found.");
    return null;
  }
};
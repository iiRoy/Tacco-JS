// This script is responsible for setting up interactive UI components on the web page.

// Pre-initialization check: Ensure the core jQuery library is loaded.
// Without jQuery, the subsequent operations will fail.
if (typeof jQuery === 'undefined') {
  // Log a warning if jQuery is not available, indicating a potential dependency issue.
  console.warn('Crucial dependency (jQuery) not found. Interactive element setup cannot proceed.');
  // Terminate script execution gracefully if the main library is missing.
  return;
}

/**
 * A utility function that performs no action.
 * This is used as a placeholder for event handlers that are required but should do nothing.
 * @returns {void}
 */
const executeNoOperation = () => {
  // This function intentionally remains empty, serving as a null callback.
};

// Defer script execution until the Document Object Model (DOM) is fully loaded and parsed.
// This ensures all HTML elements are available for manipulation.
jQuery(function() {
  // Runtime validation: Check for the presence of the custom dragging plugin.
  // The 'initInteractiveDragging' method should be available on the jQuery prototype.
  if (typeof jQuery.fn.initInteractiveDragging === 'undefined') {
    console.error('Required plugin "initInteractiveDragging" is missing. Draggable functionality will be disabled.');
    // Abort further initialization if the specialized plugin is not integrated.
    return;
  }

  // --- Setup for Primary Interactive Widgets ---

  // Identify all elements designated as primary interactive widgets using their CSS class.
  const primaryInteractiveWidgets = jQuery(".draggable-item-primary");

  // Conditional initialization: Proceed only if primary widgets are found on the page.
  if (primaryInteractiveWidgets.length === 0) {
    console.info('No elements matching ".draggable-item-primary" were detected for interactive setup.');
  } else {
    // Define a configuration object for the primary group's dragging behavior.
    // This encapsulates all parameters needed by the 'initInteractiveDragging' plugin.
    const primaryWidgetConfig = {
      elementCollection: primaryInteractiveWidgets, // Specifies the group of elements to interact with.
      onNativeDragEvent: executeNoOperation    // Assigns a no-op handler for underlying native drag events.
    };
    // Apply the custom interactive dragging plugin to the primary set of widgets.
    primaryInteractiveWidgets.initInteractiveDragging(primaryWidgetConfig);
    console.log(`Successfully initialized ${primaryInteractiveWidgets.length} primary interactive widgets.`);
  }

  // --- Setup for Secondary Interactive Widgets ---

  // Select elements belonging to the secondary interactive widget group.
  const secondaryInteractiveWidgets = jQuery(".draggable-item-secondary");

  // Guard clause: Only attempt to initialize if secondary widgets are present.
  if (secondaryInteractiveWidgets.length === 0) {
    console.info('No elements matching ".draggable-item-secondary" were found for interactive setup.');
  } else {
    // Create a dedicated configuration for the secondary draggable items.
    const secondaryWidgetOptions = {
      elementCollection: secondaryInteractiveWidgets, // The collection itself forms the group.
      onNativeDragEvent: executeNoOperation // Reuses the no-operation function for consistency.
    };
    // Activate the interactive dragging feature for the secondary widgets.
    secondaryInteractiveWidgets.initInteractiveDragging(secondaryWidgetOptions);
    console.log(`Successfully initialized ${secondaryInteractiveWidgets.length} secondary interactive widgets.`);
  }

  // Final confirmation that the entire DOM-ready routine has completed its execution.
  console.debug('All interactive UI component setup routines have finished.');
});
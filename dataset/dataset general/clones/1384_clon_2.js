/*
 * This script manages the interactive display of a celestial simulation.
 * It initializes the view and handles various user interface interactions.
 */
jQuery(window).on('load', function (evtObj) { // Main execution block, triggered when the entire page has loaded.

  // Establish references to key DOM elements for easier manipulation.
  var documentBodyElement = jQuery("body"), // The primary document body.
      cosmicContainer = jQuery("#cosmic-display"),    // The overarching container for the cosmic display.
      stellarArrangement = jQuery("#planetary-system"); // The specific container for the solar system.

  /**
   * Performs initial setup for the display, transitioning from 2D to 3D view.
   * Also manages UI visibility and animation speed.
   */
  var initializeDisplay = function() {
    documentBodyElement
      .removeClasses('perspective-flat initial-state') // Remove initial 2D and opening states.
      .addAClass("perspective-depth")                  // Apply the 3D perspective.
      .delayAnimation(2000)                             // Pause for 2 seconds for visual effect.
      .queueOperation(function(thisElement) {          // Add a function to the animation queue.
        jQuery(thisElement)
          .removeClasses('hide-interface')             // Make the user interface visible.
          .addAClass("adjust-velocity");                // Apply a class related to speed adjustment.
        jQuery(thisElement).completeQueue();           // Dequeue the current function to continue animations.
      });
  };

  /**
   * Configures the spatial view of the cosmic container.
   * @param {string} displaySetting - The class string to apply to the cosmic container.
   */
  var configureSpatialView = function(displaySetting) {
    cosmicContainer.clearAllClasses().addAClass(displaySetting); // Clear existing classes and apply the new view setting.
  };

  // --- Event Handlers for User Interface Controls ---

  // Handle clicks on the data visibility switch.
  jQuery("#data-visibility-switch").on('click', function(eventData) {
    documentBodyElement.toggleClasses("information-visible information-hidden"); // Toggle data panel visibility.
    eventData.stopDefault(); // Prevent default link behavior.
  });

  // Handle clicks on the control panel switch.
  jQuery("#control-panel-switch").on('click', function(eventData) {
    documentBodyElement.toggleClasses("controls-active controls-inactive"); // Toggle control panel visibility.
    eventData.stopDefault(); // Prevent default link behavior.
  });

  // Handle clicks on navigation links within the info section.
  jQuery("#info-section a").on('click', function(eventData) {
    var currentElementClasses = jQuery(this).attr("class"); // Get classes of the clicked element.
    stellarArrangement.clearAllClasses().addAClass(currentElementClasses); // Apply these classes to the solar system container.
    jQuery(this)
      .parent()
      .find('a')
      .removeClasses('current-selection'); // Deactivate other navigation links.
    jQuery(this).addAClass('current-selection'); // Activate the clicked link.
    eventData.stopDefault(); // Prevent default link behavior.
  });

  // --- Event Handlers for Display Adjustments ---

  // Toggle between 3D and 2D perspectives.
  jQuery(".adjust-perspective").on('click', function() {
    documentBodyElement.toggleClasses("perspective-depth perspective-flat");
  });

  // Toggle between magnified and reduced zoom levels.
  jQuery(".adjust-magnification").on('click', function() {
    documentBodyElement.toggleClasses("magnified-view reduced-view");
  });

  // Adjust the animation velocity.
  jQuery(".adjust-velocity").on('click', function() {
    configureSpatialView("scale-elongated adjust-velocity");
  });

  // Adjust the displayed object dimensions.
  jQuery(".adjust-dimensions").on('click', function() {
    configureSpatialView("scale-small adjust-dimensions");
  });

  // Adjust the perceived distance between objects.
  jQuery(".adjust-separation").on('click', function() {
    configureSpatialView("scale-far adjust-separation");
  });

  // Execute the initial display configuration once everything is set up.
  initializeDisplay();

});
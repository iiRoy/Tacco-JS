// This script provides interactive capabilities for a dynamic celestial system visualization.
// It manages the initial display setup, user interface toggles, and various view adjustments.

jQuery(document).ready(function($) {
  // --- Core DOM Element References (Type II: Renamed Variables) ---
  // These variables hold jQuery objects for frequently accessed DOM elements.
  const $mainApplicationContainer = $("body");
  const $celestialDisplayArea = $("#universe");
  const $stellarSystemModel = $("#solar-system");

  // --- Configuration Constants (Type III: New Fragments - Centralized Class Names for Maintainability) ---
  const CSS_CLASS_FLAT_PROJECTION = 'flat-projection';
  const CSS_CLASS_SPATIAL_PROJECTION = 'spatial-projection';
  const CSS_CLASS_INITIAL_LOADING = 'loading-sequence';
  const CSS_CLASS_CONCEAL_INTERFACE = 'conceal-interface';
  const CSS_CLASS_ACTIVATE_MOTION = 'activate-motion'; // Replaces 'set-speed' in the initial context

  const CSS_CLASS_INFO_PANEL_VISIBLE = 'info-panel-visible';
  const CSS_CLASS_INFO_PANEL_HIDDEN = 'info-panel-hidden';
  const CSS_CLASS_CONTROL_PANEL_ACTIVE = 'control-panel-active';
  const CSS_CLASS_CONTROL_PANEL_INACTIVE = 'control-panel-inactive';

  const CSS_CLASS_CURRENT_SELECTION = 'current-selection'; // Renamed from 'active'

  // Perspective classes for the celestial display area
  const PERSPECTIVE_STRETCHED_MOTION = 'elongated-scale ' + CSS_CLASS_ACTIVATE_MOTION; // Matches original 'scale-stretched set-speed'
  const PERSPECTIVE_COMPACT_VIEW = 'compact-scale adjust-size-view'; // Rewritten from 'scale-s set-size'
  const PERSPECTIVE_DISTANT_VIEW = 'distant-scale adjust-distance-view'; // Rewritten from 'scale-d set-distance'

  const CSS_CLASS_ZOOM_MAGNIFIED = 'magnified-view';
  const CSS_CLASS_ZOOM_REDUCED = 'reduced-view';

  // --- Internal State Flags (Type III: New Fragments - State Management) ---
  let hasDisplayBeenInitialized = false;

  /**
   * Orchestrates the initial setup of the application's visual state.
   * This includes transitioning the view from 2D to 3D and revealing the UI.
   * (Type II: Renamed from 'init')
   */
  const initializeApplicationDisplay = function() {
    // (Type III: Guard clause to prevent redundant initialization)
    if (hasDisplayBeenInitialized) {
      console.warn("Application display has already been initialized. Skipping re-initialization.");
      return;
    }

    // Begin the visual transition sequence.
    $mainApplicationContainer
      .removeClass(CSS_CLASS_FLAT_PROJECTION + ' ' + CSS_CLASS_INITIAL_LOADING)
      .addClass(CSS_CLASS_SPATIAL_PROJECTION)
      .delay(2000) // Maintain original delay duration
      .queue(function(nextInQueue) { // (Type II: Renamed 'next')
        // After the delay, unveil the user interface and apply motion activation class.
        $(this)
          .removeClass(CSS_CLASS_CONCEAL_INTERFACE)
          .addClass(CSS_CLASS_ACTIVATE_MOTION);
        nextInQueue(); // Continue the jQuery queue (Type II: Explicit call)
      });

    hasDisplayBeenInitialized = true; // Mark initialization as complete
    console.info("Application display initialization sequence commenced.");
  };

  /**
   * Modifies the visual perspective or scale applied to the celestial display area.
   * (Type II: Renamed from 'setView')
   * @param {string} newPerspectiveClassString - The CSS class string to apply for the new perspective.
   */
  const applyCelestialPerspective = function(newPerspectiveClassString) {
    // (Type III: Input validation for robustness)
    if (typeof newPerspectiveClassString !== 'string' || newPerspectiveClassString.trim() === '') {
      console.error("Invalid or empty perspective class provided. Cannot update view.");
      return;
    }

    // Remove all existing classes from the display area and apply the specified new one.
    $celestialDisplayArea.removeClass().addClass(newPerspectiveClassString);
    console.log("Celestial perspective adjusted to: " + newPerspectiveClassString);
  };

  // --- UI Event Handlers (Type II: Renamed Events, Type III: Structural Refactoring) ---

  /**
   * Generic helper function to toggle the visibility of UI panels.
   * (Type III: New helper function to reduce code duplication)
   * @param {jQuery} $targetDomElement - The jQuery object of the element to modify.
   * @param {string} openStateClass - The class representing the 'open' state.
   * @param {string} closedStateClass - The class representing the 'closed' state.
   * @param {Event} interactionEvent - The event object from the click.
   */
  const handlePanelToggle = function($targetDomElement, openStateClass, closedStateClass, interactionEvent) {
    if (interactionEvent && typeof interactionEvent.preventDefault === 'function') {
      interactionEvent.preventDefault(); // Prevent default link/button action
    }
    $targetDomElement.toggleClass(openStateClass + ' ' + closedStateClass);
    console.debug(`Panel visibility toggled for classes: ${openStateClass} / ${closedStateClass}`);
  };

  // Event listener for the information panel toggle button.
  // (Type II: Renamed ID, Type III: Uses helper function)
  $("#toggle-info-panel-visibility").on("click", function(interactionEvent) {
    handlePanelToggle($mainApplicationContainer, CSS_CLASS_INFO_PANEL_VISIBLE, CSS_CLASS_INFO_PANEL_HIDDEN, interactionEvent);
  });

  // Event listener for the control panel toggle button.
  // (Type II: Renamed ID, Type III: Uses helper function)
  $("#toggle-control-panel-activation").on("click", function(interactionEvent) {
    handlePanelToggle($mainApplicationContainer, CSS_CLASS_CONTROL_PANEL_ACTIVE, CSS_CLASS_CONTROL_PANEL_INACTIVE, interactionEvent);
  });

  // Event listener for navigation links within the info panel.
  // These links dynamically change the visual representation of the stellar system model.
  // (Type II: Renamed ID 'data' to 'info-panel-navigation')
  $("#info-panel-navigation-links a").on("click", function(interactionEvent) {
    const $clickedLink = $(this);
    // (Type III: Updated data retrieval - using data attribute instead of class for target view)
    const targetSystemViewKey = $clickedLink.data("view-key");

    // (Type III: Guard clause for missing configuration data)
    if (!targetSystemViewKey) {
      console.error("Missing 'data-view-key' attribute on clicked link:", $clickedLink[0]);
      interactionEvent.preventDefault();
      return;
    }

    // Apply the new view style to the stellar system element.
    $stellarSystemModel.removeClass().addClass(targetSystemViewKey);

    // Update the 'active' state among sibling navigation links.
    // (Type III: More explicit selection and removal of active class)
    $clickedLink.siblings('a').removeClass(CSS_CLASS_CURRENT_SELECTION);
    $clickedLink.addClass(CSS_CLASS_CURRENT_SELECTION);

    interactionEvent.preventDefault();
    console.log("Stellar system model view updated to: " + targetSystemViewKey);
  });

  // --- Consolidated Settings Handlers (Type III: Major Refactoring for Scalability) ---
  // This section replaces multiple individual click handlers with a single, data-driven approach.
  // Buttons should now have a common class (e.g., '.view-control-button') and 'data-action' attributes.
  $(".view-control-button").on("click", function() {
    const $controlButton = $(this);
    const controlAction = $controlButton.data("action"); // e.g., 'toggle-projection', 'toggle-magnification', 'set-scale-type'
    const controlValue = $controlButton.data("value");   // e.g., 'stretched-motion', 'compact-view'

    // (Type III: Intermediate step - log for debugging)
    console.log(`Control button clicked: Action='${controlAction}', Value='${controlValue}'`);

    switch (controlAction) {
      case 'toggle-projection':
        // Switches the main container between 3D and 2D projection modes.
        $mainApplicationContainer.toggleClass(CSS_CLASS_SPATIAL_PROJECTION + ' ' + CSS_CLASS_FLAT_PROJECTION);
        break;
      case 'toggle-magnification':
        // Toggles the zoom level of the main container.
        $mainApplicationContainer.toggleClass(CSS_CLASS_ZOOM_MAGNIFIED + ' ' + CSS_CLASS_ZOOM_REDUCED);
        break;
      case 'set-scale-type':
        // Applies a specific scale type to the celestial display.
        if (controlValue) {
          let scaleClassToApply;
          // (Type III: Conditional logic to map data-value to actual CSS classes)
          if (controlValue === 'stretched-motion') {
            scaleClassToApply = PERSPECTIVE_STRETCHED_MOTION;
          } else if (controlValue === 'compact-view') {
            scaleClassToApply = PERSPECTIVE_COMPACT_VIEW;
          } else if (controlValue === 'distant-view') {
            scaleClassToApply = PERSPECTIVE_DISTANT_VIEW;
          } else {
            console.warn("Unrecognized scale type value for 'set-scale-type' action:", controlValue);
            return;
          }
          applyCelestialPerspective(scaleClassToApply);
        } else {
          console.error("Missing 'data-value' attribute for 'set-scale-type' action.");
        }
        break;
      default:
        console.warn("Unhandled control action encountered:", controlAction);
        break;
    }
  });

  // Execute the initial setup routine once the DOM is fully loaded.
  initializeApplicationDisplay();

}); // End of jQuery document ready block
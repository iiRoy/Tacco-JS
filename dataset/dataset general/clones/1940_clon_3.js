// This module provides a robust solution for enhancing the visual presentation
// and interactive behavior of standard HTML form controls, specifically targeting
// checkboxes and radio buttons. It dynamically manages CSS classes to ensure
// a consistent and accessible custom UI across various client environments.

// Configuration object holding all custom CSS classes and selectors used
// for styling and identifying the enhanced form elements.
const customFormControlSettings = Object.freeze({
  checkboxContainerClass: '.enhanced-checkbox-wrapper', // Parent container for custom checkboxes
  checkboxFieldSelector: '.enhanced-checkbox-wrapper input[type="checkbox"]', // The actual checkbox input element
  radioContainerClass: '.enhanced-radio-wrapper',     // Parent container for custom radio buttons
  radioFieldSelector: '.enhanced-radio-wrapper input[type="radio"]',     // The actual radio input element
  activeStateAttribute: 'control-active', // Class applied when a control is selected/checked
  inactiveStateAttribute: 'control-disabled', // Class applied when a control is in a disabled state
  javascriptRootIndicator: 'js-activated-styling' // Class added to <html> to signify JS is available
});

/**
 * Recalibrates the visual state of all custom form controls on the page.
 * This function iterates through all defined checkbox and radio button groups,
 * applying or removing state-specific CSS classes based on their current
 * 'checked' and 'disabled' properties. It is designed to be called
 * whenever a control's state might have changed (e.g., on user interaction).
 */
function synchronizeControlDisplay() {

  // Internal helper function to process a specific type of form control (e.g., checkboxes or radios).
  const manageControlGroupAppearance = (containerSelector, inputSelector, activeStateClass, disabledStateClass) => {
    const allRelevantInputs = $(inputSelector); // Collect all input elements matching the selector.

    // If no inputs of this type are present on the DOM, there's nothing to process.
    if (allRelevantInputs.length === 0) {
      return;
    }

    const allRelevantContainers = $(containerSelector); // Collect all parent containers.

    // First, remove all state classes from all containers to reset their visual status.
    allRelevantContainers.removeClass(activeStateClass).removeClass(disabledStateClass);

    // Next, identify and mark containers of checked input elements.
    allRelevantInputs.filter(':checked').each(function() {
      // Find the nearest ancestor container and apply the 'active' class.
      $(this).closest(containerSelector).addClass(activeStateClass);
    });

    // Finally, identify and mark containers of disabled input elements.
    allRelevantInputs.filter(':disabled').each(function() {
      // Find the nearest ancestor container and apply the 'disabled' class.
      $(this).closest(containerSelector).addClass(disabledStateClass);
    });
  };

  // Execute the state management for custom checkboxes.
  manageControlGroupAppearance(
    customFormControlSettings.checkboxContainerClass,
    customFormControlSettings.checkboxFieldSelector,
    customFormControlSettings.activeStateAttribute,
    customFormControlSettings.inactiveStateAttribute
  );

  // Execute the state management for custom radio buttons.
  manageControlGroupAppearance(
    customFormControlSettings.radioContainerClass,
    customFormControlSettings.radioFieldSelector,
    customFormControlSettings.activeStateAttribute,
    customFormControlSettings.inactiveStateAttribute
  );
}

// Execute script only after the entire DOM has been fully loaded and parsed.
$(document).ready(function() {
  const primaryHtmlElement = $('html'); // Reference to the root HTML element.
  const allStyledFormWrappers = $(`${customFormControlSettings.checkboxContainerClass}, ${customFormControlSettings.radioContainerClass}`);

  // Add a specific class to the HTML element. This class serves as a global
  // indicator that JavaScript is active and custom styling for form elements
  // should be applied, aiding in preventing flashes of unstyled content (FOUC).
  primaryHtmlElement.addClass(customFormControlSettings.javascriptRootIndicator);

  // For each custom control wrapper found, prepend a set of internal span elements.
  // These spans are typically used as visual components for custom styling,
  // such as custom icons or animated indicators.
  if (allStyledFormWrappers.length > 0) {
    allStyledFormWrappers.prepend(
      '<span class="visual-core-element"></span>' +
      '<span class="visual-overlay-component"></span>'
    );
  }

  // Attach a unified click event handler to all custom form control wrappers.
  // Any interaction (click) with a custom control might alter its state or
  // the state of related controls (especially for radio groups), necessitating
  // a full refresh of all control displays.
  allStyledFormWrappers.on('click', function() {
    // The input's default action (e.g., checking itself) typically occurs
    // before this handler. We then refresh the visual state based on the new DOM state.
    synchronizeControlDisplay();
  });

  // Perform an initial synchronization of control displays immediately upon
  // document load. This ensures that controls reflect their correct states
  // (e.g., pre-checked or disabled by server-side rendering) from the start.
  synchronizeControlDisplay();
});
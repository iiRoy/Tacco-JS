/*
 * Custom Select Component Initialization Script
 * Version: 1.1.0
 * Author: CloneBot
 * Date: 2023-10-27
 *
 * This script provides enhanced selection functionality for form elements,
 * converting standard hidden inputs and unordered lists into interactive
 * dropdowns. It's designed to be a lightweight, jQuery-based solution.
 *
 * It extends jQuery's prototype to offer a 'customSelect' method.
 * Elements with the attribute 'data-control="custom-select"' are
 * automatically initialized upon document readiness.
 */

(function(jqAlias) { // Using 'jqAlias' for jQuery reference

  // Define default settings for the customSelect plugin
  // These can be overridden by passing a configuration object to the plugin.
  jqAlias.fn.customSelect = function(configurationOptions) {
    'use strict'; // Enforce strict mode within the plugin context for this function

    // Iterate over each matched element to apply the custom select logic
    return this.each(function() {

      // Cache the current DOM element wrapped in jQuery for efficiency
      const currentContainer = jqAlias(this);

      // Merge default settings with any provided configuration options
      const settings = jqAlias.extend({}, jqAlias.fn.customSelect.defaults, configurationOptions);

      // --- Element References ---
      // Locate the element responsible for showing the selected value to the user
      const visualDisplayElement = currentContainer.find('.selection-display-label');
      // Locate the hidden input field that stores the actual selected value
      const hiddenValueField = currentContainer.find('input.selection-value-holder');
      // Locate all individual selectable items within the dropdown list
      const clickableOptions = currentContainer.find('ul.selection-item-list > li > a');

      // --- Pre-initialization Checks (Guard Clauses) ---
      // Ensure all necessary components are found before proceeding
      if (!visualDisplayElement.length || !hiddenValueField.length || !clickableOptions.length) {
        console.warn('Custom Select: Missing essential elements (display, hidden field, or options) in container:', currentContainer[0]);
        // Optionally, add a class to indicate a broken component
        currentContainer.addClass('custom-select-error');
        return; // Abort initialization for this particular element
      }

      // --- Event Handler Definitions ---

      /**
       * Updates the visible display label based on the value in the hidden input field.
       * This function is primarily triggered when the hidden input's value changes.
       * @param {Event} [triggerEvent] - The change event object, if triggered by an event.
       */
      const updateVisibleLabel = function(triggerEvent) {
        const storedValue = hiddenValueField.val(); // Retrieve the current value from the hidden field
        let labelToDisplay = settings.defaultPlaceholderText; // Initialize with the default placeholder

        // Iterate through clickable options to find the one matching the stored value
        const matchingOption = clickableOptions.filter(function() {
          return jqAlias(this).data('option-val') === storedValue;
        });

        // If a matching option is found, use its text content for the display label
        if (matchingOption.length > 0) {
          labelToDisplay = matchingOption.text();
        }

        // Update the visual display element with the determined text
        visualDisplayElement.text(labelToDisplay);
      };

      /**
       * Handles the click event on individual selectable options within the custom select.
       * Prevents default link navigation and updates the hidden input field accordingly.
       * @param {Event} clickEvent - The click event object.
       */
      const handleOptionClick = function(clickEvent) {
        clickEvent.preventDefault(); // Prevent the default action (e.g., navigating to a hash)

        const selectedOptionElement = jqAlias(this); // The specific anchor element that was clicked
        const optionValue = selectedOptionElement.data('option-val'); // Extract the data value from the clicked element

        // Ensure a valid option value exists before attempting to update the hidden field
        if (typeof optionValue !== 'undefined' && optionValue !== null) {
          hiddenValueField.val(optionValue); // Set the hidden field's value to the selected option's value
          hiddenValueField.trigger('change'); // Manually trigger the 'change' event on the hidden field
                                            // This ensures 'updateVisibleLabel' is called.
        } else {
          console.warn('Custom Select: Clicked option missing "data-option-val" attribute.', selectedOptionElement[0]);
        }
      };

      // --- Event Binding ---
      // Bind the update function to the 'change' event of the hidden input field.
      // This ensures the display updates whenever the hidden value is programmatically changed.
      hiddenValueField.on('change', updateVisibleLabel);

      // Delegate click events for options to the container for better performance
      // and to automatically handle any dynamically added options within the list.
      currentContainer.on('click', 'ul.selection-item-list > li > a', handleOptionClick);

      // --- Initial State Setup ---
      // On component initialization, check if the hidden field already holds a value (e.g., from server-side rendering).
      if (hiddenValueField.val()) {
        updateVisibleLabel(); // If a value exists, update the display to reflect it immediately.
      } else {
        // If no pre-existing value, set the display to the configured placeholder text.
        visualDisplayElement.text(settings.defaultPlaceholderText);
      }

      // Mark the container element as successfully initialized.
      currentContainer.addClass('custom-select-initialized');
    });
  };

  // Default settings object for the customSelect plugin.
  // These can be overridden by passing a configuration object to the plugin call.
  jqAlias.fn.customSelect.defaults = {
    defaultPlaceholderText: 'Please select an option...'
  };

  // --- Auto-Initialization on Document Ready ---
  // When the entire DOM is fully loaded and parsed, automatically apply the customSelect plugin
  // to all elements designated as custom selectors.
  jqAlias(document).ready(function() {
    // Select all div elements that have the 'data-control="custom-select"' attribute
    // and initialize them using the customSelect plugin without any specific options.
    jqAlias('div[data-control="custom-select"]').customSelect();
  });

})(window.jQuery); // Pass window.jQuery to the Immediately Invoked Function Expression (IIFE)
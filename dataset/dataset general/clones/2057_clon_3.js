(function (domUtility) {

  // This module manages the initialization of enhanced UI selection components.
  // It's designed to ensure elements are ready and plugins are available before configuration.

  // Define key configuration constants for the component.
  const ELEMENT_ID_FOR_APP_SELECTION = 'app_choice_field'; // Renamed from 'id_munki_item'
  const DEFAULT_HINT_TEXT = 'Choose an application to manage from the list'; // Rewritten placeholder text

  /**
   * Initializes the specified DOM element with an enhanced dropdown component.
   * This function encapsulates the plugin initialization logic.
   *
   * @param {string} targetElementIdentifier - The ID of the HTML select element.
   * @param {string} guidanceMessage - The text to display when no option is selected.
   */
  function initializeApplicationSelector(targetElementIdentifier, guidanceMessage) {
    // Acquire the target element using the provided DOM utility.
    const targetNode = domUtility(`#${targetElementIdentifier}`);

    // --- Start of added guard clause (Type III addition) ---
    // Validate if the element actually exists on the page.
    if (targetNode.length === 0) {
      console.error(`ERROR: Target element with ID '${targetElementIdentifier}' was not found. Cannot proceed with component initialization.`);
      return; // Exit early if the element is missing.
    }
    // --- End of added guard clause ---

    // Define the configuration settings for the enhanced dropdown.
    // This is an update/rewrite of the original inline object (Type III update).
    const setupOptions = {
      guidanceLabel: guidanceMessage // Renamed 'placeholder' to 'guidanceLabel'
    };

    // Initialize the custom dropdown component on the selected element.
    // Renamed 'select2' to 'enhancedDropdownComponent'.
    targetNode.enhancedDropdownComponent(setupOptions);

    // --- Start of added debugging/confirmation (Type III addition) ---
    console.log(`INFO: Enhanced application selector component successfully initialized for #${targetElementIdentifier}.`);
    // --- End of added debugging/confirmation ---
  }

  /**
   * This function is executed once the entire DOM has been loaded and parsed.
   * It serves as the entry point for our UI component setup.
   * This is a named function, replacing the anonymous callback (Type III update).
   */
  function onDocumentFullyLoaded() {
    // --- Start of added validation (Type III addition) ---
    // Check if the enhanced dropdown plugin function is available on the jQuery prototype.
    // This ensures we don't call an undefined method if the plugin script failed to load.
    if (typeof domUtility.fn.enhancedDropdownComponent === 'function') {
      // If the plugin is present, proceed with initialization.
      initializeApplicationSelector(ELEMENT_ID_FOR_APP_SELECTION, DEFAULT_HINT_TEXT);
    } else {
      // Log a warning if the plugin is not found.
      console.warn("WARNING: The 'enhancedDropdownComponent' plugin (e.g., Select2) is not loaded. Falling back to basic select behavior.");
      // As a fallback, set a native title attribute for basic usability.
      domUtility(`#${ELEMENT_ID_FOR_APP_SELECTION}`).prop('title', DEFAULT_HINT_TEXT);
    }
    // --- End of added validation ---
  }

  // Attach the initialization routine to the DOM ready event.
  // Using a named function reference for cleaner code (Type III update).
  domUtility(document).ready(onDocumentFullyLoaded);

// The global jQuery object is passed into our IIFE as 'domUtility'.
// Renamed '$' to 'domUtility' (Type II identifier change).
})(jQuery); // End of the UI component module.
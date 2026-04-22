(function ($, browserApi) {
  'use strict';

  // This module is responsible for managing and persisting user-defined
  // repository path preferences within the browser extension's settings interface.

  /**
   * Holds a cached jQuery object representing the HTML structure for a single
   * entry row in the repository mapping list. This blueprint is cloned
   * whenever a new mapping row needs to be dynamically added to the UI.
   * It's initially derived from a hidden template element in the DOM.
   * @private
   * @type {jQuery|null}
   */
  let _mappingEntryBlueprint = null;

  /**
   * Reference to the main DOM container where all active repository mapping
   * entries are displayed. This element is used for appending new rows
   * and for delegating event handlers.
   * @private
   * @type {jQuery|null}
   */
  let _activeEntriesContainer = null;

  /**
   * Stores the ID of the currently active timeout for status messages.
   * This allows any pending status message to be cleared or superseded
   * by a new one, preventing message overlap.
   * @private
   * @type {number|null}
   */
  let _currentStatusTimeoutId = null;

  /**
   * Displays a transient status message to the user in a designated UI area.
   * Any previously displayed message will be cleared immediately.
   * @param {string} notificationText - The message string to be displayed.
   * @param {number} [displayDurationMs=2000] - The duration, in milliseconds,
   *                                            for which the message should be visible.
   * @returns {void}
   */
  function showTemporaryNotification(notificationText, displayDurationMs = 2000) {
    const notificationArea = $('#user-feedback-display'); // Targeting a new ID for the status element
    if (_currentStatusTimeoutId !== null) {
      clearTimeout(_currentStatusTimeoutId);
    }
    notificationArea.text(notificationText); // Using .text() for consistency
    _currentStatusTimeoutId = setTimeout(() => {
      notificationArea.text('');
      _currentStatusTimeoutId = null;
    }, displayDurationMs);
  }

  /**
   * Retrieves user-entered repository mapping data from the UI form,
   * performs basic validation, and saves the valid entries to the
   * browser's synchronized storage.
   * @returns {void}
   */
  function commitConfigurationChanges() {
    const collectedMappingData = {}; // New name for the object holding collected data
    let validationErrorsEncountered = false; // Flag to track issues

    // Iterate over each active mapping row within its dedicated container.
    // This ensures we only process actual data rows, not the template.
    _activeEntriesContainer.children('.repository-mapping-item').each(function () {
      const currentMappingElement = $(this);
      const repoIdInputRef = currentMappingElement.find('.repository-identifier-field'); // New class selectors
      const localPathInputRef = currentMappingElement.find('.local-system-path-field'); // New class selectors

      const repositoryKey = repoIdInputRef.val()?.trim(); // Added optional chaining and trim
      const localMachinePath = localPathInputRef.val()?.trim();

      // Implement basic validation logic for each entry.
      // A repository key is mandatory for an entry to be considered valid.
      if (repositoryKey) {
        if (collectedMappingData.hasOwnProperty(repositoryKey)) {
          showTemporaryNotification(`Duplicate entry for "${repositoryKey}" was found and ignored.`, 3500);
          validationErrorsEncountered = true;
          return true; // Continue to the next element in the .each loop
        }
        collectedMappingData[repositoryKey] = localMachinePath;
      } else if (localMachinePath) {
        // If a local path is provided without a repository key, it's an error.
        showTemporaryNotification("Warning: A local path was entered without a corresponding repository identifier.", 4000);
        validationErrorsEncountered = true;
      }
    });

    if (Object.keys(collectedMappingData).length === 0 && !validationErrorsEncountered) {
        showTemporaryNotification("No valid mapping entries to save.", 3000);
        return; // Prevent saving an empty object if there were no entries
    }

    // Attempt to store the valid data in browser synchronized storage.
    browserApi.storage.sync.set({
      repositoryPathBindings: collectedMappingData // Changed storage key
    }, function() {
      if (browserApi.runtime.lastError) {
        // Handle potential errors during storage operation.
        showTemporaryNotification(`Configuration save failed: ${browserApi.runtime.lastError.message}`, 6000);
        console.error("Browser storage error:", browserApi.runtime.lastError);
        return;
      }
      showTemporaryNotification('Settings updated successfully!'); // New confirmation message

      if (validationErrorsEncountered) {
          showTemporaryNotification("Settings updated, but some entries had issues. Please review.", 5000);
      }
    });
  }

  /**
   * Retrieves saved repository mapping preferences from browser storage
   * and dynamically populates the user interface form. This also initializes
   * the row template element for subsequent use.
   * @returns {void}
   */
  function loadAndPopulateSettingsUI() {
    // Locate and prepare the hidden template element for cloning.
    const initialTemplateDOMElement = $('#row-template-prototype'); // New ID for the template
    if (initialTemplateDOMElement.length === 0) {
      console.error("Initialization failure: Required UI template element not found.");
      showTemporaryNotification("Critical Error: UI template missing. Cannot load settings.", 0); // Permanent error
      return;
    }
    _mappingEntryBlueprint = initialTemplateDOMElement.clone().removeAttr('id').removeClass('hidden-element'); // New class, remove ID
    initialTemplateDOMElement.remove(); // Remove the original template from the DOM

    _activeEntriesContainer = $('#repository-list-container'); // New ID for the container

    browserApi.storage.sync.get({
      repositoryPathBindings: {} // Changed storage key, default to an empty object
    }, function(retrievedConfiguration) {
      const storedRepositoryBindings = retrievedConfiguration.repositoryPathBindings; // New variable name

      if (Object.keys(storedRepositoryBindings).length === 0) {
        console.info("No saved repository mappings found. Presenting a blank entry for user input.");
        // If no data exists, add a single empty row to encourage user input.
        addNewMappingRow(null, null, true);
      } else {
        // Iterate through each stored binding and render it in the UI.
        for (const repoNameKey in storedRepositoryBindings) {
          // Robust check to ensure we only process own properties.
          if (Object.prototype.hasOwnProperty.call(storedRepositoryBindings, repoNameKey)) {
            const pathValue = storedRepositoryBindings[repoNameKey]; // New variable name
            addNewMappingRow(repoNameKey, pathValue); // New function name
          }
        }
        // Always append an additional empty row at the end, improving UX.
        addNewMappingRow(null, null, true); // Added a flag for new rows
      }
    });
  }

  /**
   * Dynamically appends a new repository mapping row to the UI table.
   * This function clones the blueprint and populates it with optional data.
   * @param {string|null} [identifier=null] - The repository name to pre-populate in the new row.
   * @param {string|null} [path=null] - The local file system path to pre-populate.
   * @param {boolean} [isFreshEntry=false] - If true, indicates this is a newly created, empty row,
   *                                         potentially triggering visual cues or focus.
   * @returns {void}
   */
  function addNewMappingRow(identifier = null, path = null, isFreshEntry = false) {
    if (!_mappingEntryBlueprint) {
      console.error("Mapping row blueprint is not initialized. Cannot add a new row.");
      showTemporaryNotification("Error: UI template not ready. Cannot add row.", 4000);
      return;
    }

    const newRowInstance = _mappingEntryBlueprint.clone(); // New variable name
    newRowInstance.addClass('repository-mapping-item'); // Add a consistent class for active rows

    // Pre-fill input fields if corresponding data is provided.
    if (identifier) {
      newRowInstance.find('.repository-identifier-field').val(identifier);
    }
    if (path) {
      newRowInstance.find('.local-system-path-field').val(path);
    }

    // Determine the correct insertion point for the new row.
    // Insert before the "Add New" button's container to keep it at the bottom.
    const addRowButtonWrapper = $('#add-new-row-section'); // New ID for the add button's container
    if (addRowButtonWrapper.length) {
      newRowInstance.insertBefore(addRowButtonWrapper);
    } else {
      // Fallback: simply append to the main container if the button wrapper isn't found.
      _activeEntriesContainer.append(newRowInstance);
    }

    if (isFreshEntry) {
      // For new, empty rows, add a temporary visual highlight and set focus.
      newRowInstance.addClass('highlight-new-entry');
      setTimeout(() => newRowInstance.removeClass('highlight-new-entry'), 1200);
      newRowInstance.find('.repository-identifier-field').focus();
    }
  }

  /**
   * Handles the click event for the delete button associated with a repository
   * mapping row. It prompts the user for confirmation before removing the row.
   * @param {Event} clickEvent - The DOM click event object.
   * @returns {void}
   */
  function handleMappingRowRemoval(clickEvent) {
    const clickedButton = $(clickEvent.currentTarget); // Use currentTarget for delegated events
    const containingRow = clickedButton.closest('.repository-mapping-item'); // Target the specific row class

    // Introduce a user confirmation step to prevent accidental deletions.
    if (confirm("Are you sure you wish to permanently remove this repository mapping entry?")) {
      containingRow.remove();
      showTemporaryNotification("Mapping entry successfully removed.", 1500);
    } else {
      showTemporaryNotification("Removal cancelled by user.", 1500);
    }
  }

  // Execute initialization logic once the entire DOM is fully loaded.
  $(document).ready(function () {
    loadAndPopulateSettingsUI(); // Begin by loading and displaying current settings.

    // Attach event handlers to various UI elements using new selectors and function names.

    // Event handler for the "Save" button.
    $('#save-all-settings-button').on('click', commitConfigurationChanges); // New ID for save button

    // Event handler for the "Add New Row" button.
    $('#add-new-entry-button').on('click', function () { // New ID for add button
      // Directly call the row addition function, passing true for a fresh entry.
      addNewMappingRow(null, null, true);
    });

    // Delegated event handler for delete buttons on dynamically generated rows.
    // The event listener is attached to the parent container for efficiency.
    _activeEntriesContainer.on('click', '.remove-binding-button', handleMappingRowRemoval); // New class for delete button
  });

})(window.jQuery, window.chrome);
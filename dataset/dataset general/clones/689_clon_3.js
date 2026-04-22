var appConfigurationStore;

/**
 * Fetches the application's persisted configuration definitions from the local storage.
 * @returns {Array<Object>} A collection of configuration entries, each detailing a URL and associated HTTP headers.
 */
function fetchApplicationConfiguration() {
    // Verify local storage availability before attempting access.
    if (typeof localStorage === 'undefined' || localStorage === null) {
        console.warn("Browser local storage is not accessible. Returning an empty configuration set.");
        return [];
    }

    let rawConfigString = localStorage.getItem('applicationSettings');

    // If no data is found in storage, return an empty array to prevent null reference errors.
    if (!rawConfigString) {
        return [];
    }

    try {
        // Safely parse the JSON string from local storage.
        const parsedData = JSON.parse(rawConfigString);
        // Ensure the retrieved data is an array, otherwise, reset.
        if (!Array.isArray(parsedData)) {
            console.error("Stored configuration data is malformed (not an array). Initializing with an empty set.");
            return [];
        }
        return parsedData;
    } catch (parsingErr) {
        // Log any JSON parsing errors and provide a resilient fallback.
        console.error("Error parsing stored configuration JSON:", parsingErr.message);
        return [];
    }
}

/**
 * Commits the current application configuration object to the browser's local storage.
 * @param {Array<Object>} configDataset The array of configuration objects to be serialized and stored.
 */
function commitApplicationConfiguration(configDataset) {
    // Pre-check for localStorage existence.
    if (typeof localStorage === 'undefined' || localStorage === null) {
        console.warn("Browser local storage is not accessible. Configuration cannot be saved.");
        return;
    }

    // Basic validation: ensure the input is an array.
    if (!Array.isArray(configDataset)) {
        console.error("Attempted to save non-array data as application configuration. Operation aborted.");
        return;
    }

    try {
        const jsonPayload = JSON.stringify(configDataset);
        localStorage.setItem('applicationSettings', jsonPayload);
    } catch (serializationErr) {
        console.error("Failed to serialize configuration data for storage:", serializationErr.message);
    }
}

/**
 * Renders or refreshes the detailed header table for a given configuration item in the user interface.
 * @param {Object} itemRecord The specific configuration object (e.g., for a URL) whose headers are to be shown.
 * @param {jQuery} tableContainer A jQuery object representing the <tbody> element where header rows will be appended.
 */
function renderHeaderDetailTable(itemRecord, tableContainer) {
    // Clear previous content to prepare for new data.
    tableContainer.empty();

    // Guard clause: if the record or its headers are invalid, cease operation.
    if (!itemRecord || !itemRecord.headers || !Array.isArray(itemRecord.headers)) {
        console.info("No valid item record or header data provided for detail table rendering.");
        return;
    }

    /**
     * Produces a dynamic event handler for transforming a table cell into an editable input field.
     * @param {Object} dataRef The object holding the header's data (e.g., {name: 'X-Header', value: 'Value'}).
     * @param {String} propertyName The key within `dataRef` to be edited (e.g., 'name' or 'value').
     * @returns {Function} An event handler for a click event.
     */
    const makeCellEditable = function (dataRef, propertyName) {
        return function (event) {
            event.stopPropagation(); // Stop event bubbling to parent elements.

            const targetCell = $(event.currentTarget);
            const initialText = targetCell.text().trim();

            // Create and configure the input field.
            const editInputField = $('<input type="text" class="form-control-sm border rounded p-1" />').val(initialText);
            // Create a save button.
            const applyButton = $('<button class="btn btn-primary btn-sm ml-2">✓</button>');

            /**
             * Finalizes the edit, updates the data model, and restores the cell's display.
             */
            const finalizeEdit = function () {
                const updatedValue = editInputField.val().trim();
                dataRef[propertyName] = updatedValue; // Update the underlying data.
                targetCell.html(updatedValue || '&nbsp;'); // Display the new value, or a non-breaking space if empty.

                // Detach event listeners to prevent unintended behavior on subsequent edits.
                applyButton.off('click', finalizeEdit);
                editInputField.off('keydown', handleInputKeydown);
                // Trigger a global save operation after an individual header edit.
                triggerGlobalSaveAndRefresh();
            };

            /**
             * Handles keyboard interactions within the input field.
             */
            const handleInputKeydown = function (e) {
                if (e.which === 13) { // Enter key
                    e.preventDefault();
                    finalizeEdit();
                } else if (e.which === 27) { // Escape key
                    // Revert to original text without saving and restore cell state.
                    targetCell.html(initialText || '&nbsp;');
                    applyButton.off('click', finalizeEdit);
                    editInputField.off('keydown', handleInputKeydown);
                }
            };

            // Attach event listeners to the new UI elements.
            applyButton.on('click', finalizeEdit);
            editInputField.on('keydown', handleInputKeydown);

            // Replace the cell's content with the input field and save button.
            targetCell.empty().append(editInputField, applyButton);
            editInputField.focus(); // Set focus to the input field.
        };
    };

    /**
     * Constructs a single table row (<tr>) for a header entry.
     * @param {Object} headerEntry An object structured as {name: String, value: String}.
     * @returns {jQuery} A jQuery object representing the complete <tr> element.
     */
    const constructHeaderRowElement = function (headerEntry) {
        const row = $('<tr class="header-data-row"></tr>');
        const nameCell = $('<td class="header-key-cell"></td>').text(headerEntry.name || '');
        const valueCell = $('<td class="header-value-cell"></td>').text(headerEntry.value || '');
        const deleteCell = $('<td class="header-actions-cell text-center"></td>');

        // Bind editable functionality to name and value cells.
        nameCell.on('click', makeCellEditable(headerEntry, 'name'));
        valueCell.on('click', makeCellEditable(headerEntry, 'value'));

        // Add a delete button for the header.
        const deleteHeaderButton = $('<button class="btn btn-danger btn-sm">✗</button>');
        deleteHeaderButton.on('click', function() {
            // Find and remove the header from the data model.
            const currentHeaders = itemRecord.headers;
            const headerIndex = currentHeaders.indexOf(headerEntry);
            if (headerIndex > -1) {
                currentHeaders.splice(headerIndex, 1);
                row.remove(); // Remove the row from the DOM.
                triggerGlobalSaveAndRefresh(); // Trigger a save after deletion.
            }
        });
        deleteCell.append(deleteHeaderButton);

        row.append(nameCell, valueCell, deleteCell);
        return row;
    };

    // Populate the table with rows for each header.
    itemRecord.headers.forEach(singleHeader => {
        tableContainer.append(constructHeaderRowElement(singleHeader));
    });

    // Event handling for the 'add new header' button.
    const addHeaderInterfaceButton = $('.add-new-header-button');
    addHeaderInterfaceButton.off('click').on('click', function () {
        const defaultHeader = { name: '', value: '' };
        itemRecord.headers.push(defaultHeader); // Add to data model.
        const newTableRow = constructHeaderRowElement(defaultHeader);
        tableContainer.append(newTableRow);

        // Automatically activate editing on the 'name' field of the newly added header.
        newTableRow.find('.header-key-cell').first().click();
        triggerGlobalSaveAndRefresh(); // Save the new empty header.
    });
}

/**
 * Responds to changes in the URL selection dropdown, updating the header display accordingly.
 * @param {Event} eventObject The jQuery event object generated by the change.
 */
function onUrlDropdownChange(eventObject) {
    const selectedOptionValue = $(eventObject.target).val();
    const selectedIndex = parseInt(selectedOptionValue, 10);

    // Validate the selected index.
    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= appConfigurationStore.length) {
        console.warn("Invalid index selected in URL dropdown. Clearing header display.");
        $('#headersDisplayBody').empty(); // Clear content if selection is invalid.
        return;
    }

    const selectedConfigItem = appConfigurationStore[selectedIndex];
    renderHeaderDetailTable(selectedConfigItem, $('#headersDisplayBody'));
}

/**
 * Initializes and populates the URL selection dropdown with existing configuration entries.
 * Selects the first item by default and triggers its change event to load initial headers.
 * @returns {jQuery} The jQuery object corresponding to the URL selector element.
 */
function setupUrlSelector() {
    const urlSelectorElement = $('#urlConfigurationSelector');
    urlSelectorElement.off('change').empty(); // Remove old handlers and clear all options.

    // If no configurations exist, add a disabled placeholder option.
    if (!appConfigurationStore || appConfigurationStore.length === 0) {
        urlSelectorElement.append($('<option value="-1" disabled selected>No URLs configured yet</option>'));
        urlSelectorElement.trigger('change'); // Trigger to clear header panel.
        return urlSelectorElement;
    }

    // Iterate through stored configurations to build dropdown options.
    appConfigurationStore.forEach((configItem, idx) => {
        const option = $('<option></option>')
            .attr('value', idx)
            .text(configItem.URL);

        // Mark the very first item as selected by default.
        if (idx === 0) {
            option.prop('selected', true);
        }
        urlSelectorElement.append(option);
    });

    // Attach the change event handler and trigger it to initialize the display.
    urlSelectorElement.on('change', onUrlDropdownChange);
    urlSelectorElement.trigger('change');
    return urlSelectorElement;
}

/**
 * Centralized function to save current settings and provide visual feedback to the user.
 * Also dispatches an update message to the browser extension's background script.
 */
function triggerGlobalSaveAndRefresh() {
    const successFeedback = $('.alert-success-message');
    const errorFeedback = $('.alert-error-message');
    // Ensure feedback messages are hidden before potential display.
    successFeedback.hide();
    errorFeedback.hide();

    try {
        commitApplicationConfiguration(appConfigurationStore);

        // Persist the user's preference for displaying the intercept count.
        const showCountPreference = $('#showInterceptCountCheckbox').is(':checked');
        localStorage.setItem('displayInterceptCountPref', JSON.stringify(showCountPreference));

        // Attempt to notify the browser extension's background context.
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ command: 'updateSettings' }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error("Failed to send update message to extension background:", chrome.runtime.lastError.message);
                    errorFeedback.text('Error updating extension: ' + chrome.runtime.lastError.message).fadeIn().delay(5000).fadeOut();
                } else {
                    console.log("Extension update confirmed:", response);
                    setupUrlSelector(); // Re-render the URL selector to reflect any data changes.
                    successFeedback.fadeIn().delay(2500).fadeOut(); // Show success.
                }
            });
        } else {
            console.warn("Chrome extension runtime API not available. Cannot notify background script.");
            setupUrlSelector(); // Still refresh UI even without extension API.
            successFeedback.fadeIn().delay(2500).fadeOut();
        }

    } catch (operationError) {
        errorFeedback.text('A critical error occurred during the save operation: ' + operationError.message).fadeIn().delay(5000).fadeOut();
        console.error("Configuration save failed:", operationError);
    }
}


// Primary application bootstrap logic, executed once the DOM is fully loaded.
$(function () {
    // Load initial settings or create an empty structure if none exist.
    appConfigurationStore = fetchApplicationConfiguration();

    // Initialize the main URL selector dropdown.
    const mainConfigDropdown = setupUrlSelector();

    // Configure the form responsible for adding new URLs.
    const newUrlEntryForm = $('#addNewUrlForm');
    newUrlEntryForm.on('submit', function (evt) {
        evt.preventDefault(); // Prevent default browser form submission.

        const urlInputControl = $('#newUrlText');
        const submittedUrl = urlInputControl.val().trim();

        // Basic input validation.
        if (!submittedUrl) {
            alert('Please provide a URL to add.');
            return;
        }

        // Prevent duplicate URL entries.
        if (appConfigurationStore.some(entry => entry.URL === submittedUrl)) {
            alert('This URL is already present in your configurations.');
            return;
        }

        // Construct a new, empty configuration record.
        const newConfigRecord = {
            URL: submittedUrl,
            headers: []
        };
        appConfigurationStore.push(newConfigRecord);

        // Add a new option to the selector for the newly created URL.
        const newOptionIndex = appConfigurationStore.length - 1;
        const newDropdownOption = $('<option></option>')
            .attr('value', newOptionIndex)
            .text(newConfigRecord.URL);

        mainConfigDropdown.append(newDropdownOption);

        // Update selection: deselect all others and select the new one.
        mainConfigDropdown.find('option').prop('selected', false);
        newDropdownOption.prop('selected', true);

        // Trigger a change event to display headers for the new URL.
        mainConfigDropdown.trigger('change');

        // Clear the input field for subsequent additions.
        urlInputControl.val('');

        // Optionally, simulate a click on the 'add header' button for immediate header entry.
        $('.add-new-header-button').click();

        triggerGlobalSaveAndRefresh(); // Persist the new URL configuration.
    });

    // Initially hide all application feedback messages.
    $('.app-feedback-message').hide();

    // Initialize the checkbox for displaying intercept count.
    const interceptCountToggleCheckbox = $('#showInterceptCountCheckbox');
    let displayCountState = true; // Default to true if no preference is found.
    try {
        const storedCountPref = localStorage.getItem('displayInterceptCountPref');
        if (storedCountPref !== null) {
            displayCountState = JSON.parse(storedCountPref);
        }
    } catch (parseError) {
        console.error("Failed to parse stored intercept count preference. Defaulting to enabled.", parseError);
        displayCountState = true;
    }
    interceptCountToggleCheckbox.prop('checked', displayCountState);

    // Attach event handler to the master save button.
    const masterSaveButton = $('#saveAllChangesButton');
    masterSaveButton.on('click', triggerGlobalSaveAndRefresh);

    // Implement the "Clear All Configurations" functionality.
    const clearAllDataButton = $('#clearAllDataButton');
    clearAllDataButton.on('click', function () {
        if (confirm("Are you absolutely sure you want to delete ALL URL configurations and their associated headers? This action is irreversible.")) {
            appConfigurationStore = []; // Empty the in-memory data store.
            triggerGlobalSaveAndRefresh(); // Save the now-empty configuration.
            setupUrlSelector(); // Refresh the UI, which will show "No URLs configured".
            console.log("All application configurations have been cleared.");
        }
    });

    // Implement the "Delete Selected Configuration" functionality.
    const deleteSelectedConfigButton = $('#deleteCurrentConfigButton');
    deleteSelectedConfigButton.on('click', function () {
        const currentlySelectedOption = mainConfigDropdown.find('option:selected');
        const selectedConfigIndex = parseInt(currentlySelectedOption.val(), 10);

        // Validate the selection.
        if (isNaN(selectedConfigIndex) || selectedConfigIndex < 0 || selectedConfigIndex >= appConfigurationStore.length) {
            alert('Please select a URL configuration from the dropdown to delete.');
            return;
        }

        if (confirm(`Are you certain you wish to remove the configuration for "${currentlySelectedOption.text()}"?`)) {
            appConfigurationStore.splice(selectedConfigIndex, 1); // Remove the item from the array.
            triggerGlobalSaveAndRefresh(); // Save the modified configuration.
            setupUrlSelector(); // Re-initialize the dropdown to reflect the deletion.
            console.log(`Configuration for index ${selectedConfigIndex} successfully deleted.`);
        }
    });

    // Set up the import/export configuration modal.
    const configImportExportModal = $('#configTransferModal');
    configImportExportModal.on('show.bs.modal', function() {
        const modalDomElement = $(this);
        const jsonTextArea = modalDomElement.find('textarea#configJsonContent');
        const formGroupContainer = modalDomElement.find('.form-group'); // Using common Bootstrap 4/5 class.
        const modalSaveButton = modalDomElement.find('.btn-primary.modal-action-save');
        const modalErrorMessage = modalDomElement.find('.text-danger.import-error-display');

        // Pre-populate the textarea with the current configuration, formatted for readability.
        jsonTextArea.val(JSON.stringify(appConfigurationStore, null, 2));
        modalErrorMessage.hide();
        formGroupContainer.removeClass('has-error is-invalid'); // Clear previous error states.

        // Detach previous event handlers to prevent multiple bindings on successive opens.
        modalSaveButton.off('click').on('click', function() {
            formGroupContainer.removeClass('has-error is-invalid');
            modalErrorMessage.hide();

            try {
                const importedJson = JSON.parse(jsonTextArea.val());

                // Perform basic structural validation for the imported data.
                if (!Array.isArray(importedJson)) {
                    throw new Error("Imported data must be a JSON array representing configurations.");
                }
                const isValidStructure = importedJson.every(entry =>
                    typeof entry === 'object' && entry !== null &&
                    typeof entry.URL === 'string' &&
                    Array.isArray(entry.headers) &&
                    entry.headers.every(header =>
                        typeof header === 'object' && header !== null &&
                        typeof header.name === 'string' &&
                        typeof header.value === 'string'
                    )
                );

                if (isValidStructure) {
                    appConfigurationStore = importedJson; // Replace current configuration.
                    modalDomElement.modal('hide'); // Close the modal.
                    triggerGlobalSaveAndRefresh(); // Save and refresh the UI.
                    console.log("Configuration imported and applied successfully.");
                } else {
                    throw new Error("Invalid structure detected in imported JSON. Each item must have a 'URL' (string) and 'headers' (array of {name:string, value:string}).");
                }
            } catch (importException) {
                modalErrorMessage.text('Import failed: ' + importException.message).show();
                formGroupContainer.addClass('has-error is-invalid'); // Apply error styling.
                console.error("Configuration import error:", importException);
            }
        });
    }).on('hide.bs.modal', function() {
        // Clean up the event listener for the save button when the modal closes.
        const modalDomElement = $(this);
        const modalSaveButton = modalDomElement.find('.btn-primary.modal-action-save');
        modalSaveButton.off('click');
    });
});
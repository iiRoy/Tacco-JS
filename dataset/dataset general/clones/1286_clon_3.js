// This module handles dynamic UI updates and AJAX interactions for a web form.
// It includes functionality for managing parameter inputs, adding new fields,
// and submitting data via AJAX with appropriate content types.

/**
 * Adjusts the visibility of the main container holding request parameters.
 * The container is shown if any active parameter input fields are present,
 * and hidden otherwise, providing a cleaner user interface.
 * @function
 */
const adjustParameterSectionVisibility = () => {
    // Reference to the main wrapper for all dynamic parameters.
    const parameterZone = $("#paramSectionWrapper");

    // Early exit if the target element does not exist in the DOM.
    if (!parameterZone.length) {
        console.error("Critical UI element '#paramSectionWrapper' not found. Cannot manage visibility.");
        return;
    }

    // Determine if there are any user-defined parameter input elements.
    const userDefinedInputsCount = parameterZone.find(".actualInputValue").length;

    // Based on the count, toggle visibility with a smooth transition.
    if (userDefinedInputsCount > 0) {
        parameterZone.slideDown(200); // Reveal the section with a slight animation.
    } else {
        parameterZone.slideUp(200);   // Conceal the section with a slight animation.
    }
};

/**
 * Updates the 'name' attribute of the hidden input field when a user modifies
 * the visible label of a parameter. This ensures form data is correctly named
 * for backend processing. This event handler is delegated for dynamic elements.
 */
$(document).on('blur', '.displayInputLabel', function() {
    const currentDisplayField = $(this);
    const proposedIdentifier = currentDisplayField.val().trim(); // Get and clean the new label.

    // Validate the proposed identifier. An empty name might cause issues.
    if (!proposedIdentifier) {
        console.warn("Attempted to set an empty parameter identifier. Action aborted.");
        // Optionally, re-populate with a previous value or a default.
        return;
    }

    // Traverse the DOM to find the associated actual input element.
    // The structure assumes .displayInputLabel is within a '.param-entry-item' container.
    const associatedEntryContainer = currentDisplayField.closest('.param-entry-item');
    if (associatedEntryContainer.length) {
        // Update the 'name' attribute of the relevant input element.
        associatedEntryContainer.find(".actualInputValue").attr("name", proposedIdentifier);
        console.log(`Parameter name updated to: '${proposedIdentifier}'`);
    } else {
        console.error("Could not locate the parent entry container for the input label.");
    }
});

/**
 * Handles the removal of a parameter or file input entry from the UI.
 * This event listener uses delegation to work with dynamically added elements.
 */
$(document).on('click', '.removeEntryBtn', function(event) {
    event.preventDefault(); // Prevent default browser actions (e.g., navigating for 'a' tags).

    const clickedButton = $(this);
    // Find the closest parent element representing a single configurable entry.
    const entryElementToRemove = clickedButton.closest('.param-entry-item, .file-entry-item');

    if (entryElementToRemove.length) {
        // Animate the removal for a smoother user experience.
        entryElementToRemove.fadeOut(150, function() {
            $(this).remove(); // Physically remove the element from the DOM.
            adjustParameterSectionVisibility(); // Re-evaluate section visibility.
            console.info("Entry removed. UI visibility updated.");
        });
    } else {
        console.warn("Remove button clicked, but no associated entry element found for removal.");
    }
});

/**
 * A utility function to clone a template element and append it to the
 * parameter section, then update the UI visibility.
 * @param {string} templateSelector - The jQuery selector for the template element to clone.
 */
const spawnNewEntryFromTemplate = (templateSelector) => {
    const templateElement = $(templateSelector);
    if (!templateElement.length) {
        console.error(`Template element '${templateSelector}' not found. Cannot add new entry.`);
        return;
    }

    // Clone the template, including its data and event handlers, then append.
    // Ensure the new clone is visible if the template was hidden.
    templateElement.clone(true).appendTo("#paramSectionWrapper").show();
    adjustParameterSectionVisibility(); // Recalculate visibility after adding.
    console.log(`New entry added using template: ${templateSelector}`);
};

/**
 * Event handler for adding a new generic parameter field.
 * Uses the `spawnNewEntryFromTemplate` helper.
 */
$(document).on('click', '#addParameterButton', function(event) {
    event.preventDefault();
    spawnNewEntryFromTemplate('.paramTemplate:first');
});

/**
 * Event handler for adding a new file upload field.
 * Uses the `spawnNewEntryFromTemplate` helper.
 */
$(document).on('click', '#addFileFieldButton', function(event) {
    event.preventDefault();
    spawnNewEntryFromTemplate('.fileTemplate:first');
});

// --- AJAX Request Management ---

/**
 * Resets the display areas for AJAX response data (status, content, headers)
 * to a clean state before a new request is initiated.
 * @function
 */
const clearAjaxResponseDisplay = () => {
    // Hide any iframe output and clear its source.
    $("#iframeOutputView").hide().attr("src", "");

    // Clear previous textual response data.
    $("#responseContentDisplay").empty();
    $("#responseHeadersDisplay").empty();
    $("#statusCodeDisplay").text("Awaiting Response..."); // Set a temporary status message.

    // Remove any status-related styling classes from the previous request.
    $("#statusCodeDisplay").removeClass("alert-success alert-error alert-warning alert-danger");

    // Ensure the main response area is visible to display new results.
    $("#ajaxResponseArea").show();
};

/**
 * Updates the status code display with the received HTTP status and applies
 * appropriate visual styling (success, error, warning, danger).
 * @param {JQueryXHR} responseXHR - The jQuery XMLHttpRequest object.
 */
const updateRequestStatusDisplay = (responseXHR) => {
    const statusElement = $("#statusCodeDisplay");
    // Use template literals for cleaner string construction.
    statusElement.text(`HTTP ${responseXHR.status} ${responseXHR.statusText || 'Unknown Status'}`);

    // Apply CSS classes based on HTTP status codes.
    if (responseXHR.status === 0) {
        reportNetworkConnectivityError(); // Dedicated handler for network issues.
        statusElement.addClass("alert-danger"); // A specific class for critical network errors.
    } else if (responseXHR.status >= 200 && responseXHR.status < 300) {
        statusElement.addClass("alert-success");
    } else if (responseXHR.status >= 400) {
        statusElement.addClass("alert-error");
    } else {
        statusElement.addClass("alert-warning"); // For informational or redirection responses.
    }
};

/**
 * Initiates an AJAX request based on provided configuration options.
 * This function encapsulates the entire AJAX submission flow, including
 * UI preparation, request execution, and response processing.
 * @param {object} [requestConfiguration={}] - An object containing AJAX settings.
 * @param {string} requestConfiguration.url - The target URL for the request.
 * @param {string} requestConfiguration.type - The HTTP method (e.g., 'GET', 'POST').
 * @param {object|FormData} [requestConfiguration.data] - Data to send with the request.
 */
const executeAjaxSubmission = (requestConfiguration = {}) => {
    // Input validation: Ensure configuration is a valid object.
    if (typeof requestConfiguration !== 'object' || requestConfiguration === null) {
        console.error("Invalid AJAX request configuration provided. Expected an object.");
        return;
    }

    // Define base AJAX settings and merge with user-provided options.
    const baseSettings = {
        url: $("#targetUrlField").val(),
        type: $("#requestMethodSelect").val() || 'GET', // Default to GET if not explicitly set.
        cache: false, // Prevent browser caching of AJAX responses by default.
        processData: true, // jQuery default: process data as URL-encoded strings.
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8', // jQuery default content type.
        // The `complete` callback handles all post-request UI updates.
        complete: (responseXHR) => {
            updateRequestStatusDisplay(responseXHR);
            $("#responseContentDisplay").text(responseXHR.responseText);
            $("#responseHeadersDisplay").text(responseXHR.getAllResponseHeaders());

            // Attempt to render HTML responses in an iframe for better viewing.
            const contentType = responseXHR.getResponseHeader('Content-Type');
            if (contentType && contentType.includes('text/html') && responseXHR.responseText) {
                const iframeElement = $("#iframeOutputView");
                if (iframeElement.length) {
                    // Write the HTML directly into the iframe's document.
                    iframeElement.contents().find('html').html(responseXHR.responseText);
                    iframeElement.show();
                    $("#responseContentDisplay").hide(); // Hide raw text if iframe is used.
                }
            } else {
                $("#responseContentDisplay").show(); // Ensure raw text is visible otherwise.
            }
        }
    };

    // Combine base settings with custom user settings.
    let finalAjaxSettings = { ...baseSettings, ...requestConfiguration };

    // Special handling for FormData objects (used for multipart/form-data, e.g., file uploads).
    if (finalAjaxSettings.data instanceof FormData) {
        finalAjaxSettings.contentType = false; // Important: let jQuery handle content type for FormData.
        finalAjaxSettings.processData = false; // Important: prevent jQuery from processing FormData.
    } else if (jQuery.isEmptyObject(finalAjaxSettings.data)) {
        // If data is an empty object and not FormData, ensure standard content type.
        finalAjaxSettings.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
    }

    console.debug("Executing AJAX request with parameters:", finalAjaxSettings);

    // Prepare the UI for a new response before sending the request.
    clearAjaxResponseDisplay();

    // Display a loading spinner to indicate ongoing activity.
    $('#loadingSpinnerIndicator').show();

    // Execute the AJAX request using jQuery's $.ajax method.
    // The .always() callback ensures the spinner is hidden regardless of success or failure.
    const activeRequest = $.ajax(finalAjaxSettings)
        .always(() => {
            $('#loadingSpinnerIndicator').hide(); // Always hide spinner on completion.
        })
        .fail((xhr, status, error) => {
            // Log detailed error information for debugging.
            console.error("AJAX request encountered an error:", status, error, xhr);
            // For non-network errors, update status display. Status 0 is handled separately.
            if (xhr.status !== 0) {
                $("#statusCodeDisplay").text(`Request Failed: ${xhr.status} ${error}`).addClass("alert-error");
            }
        });

    return activeRequest; // Return the XHR object for advanced use (e.g., aborting).
};

/**
 * Determines if the form currently contains any file input fields with the specific class.
 * This check is crucial for deciding whether to send data as URL-encoded or multipart/form-data.
 * @returns {boolean} True if file inputs are detected, false otherwise.
 */
const hasFileUploadElements = () => {
    const formContext = $("#requestFormContainer");
    if (!formContext.length) {
        console.warn("Request form container (#requestFormContainer) not found. Assuming no file inputs.");
        return false;
    }
    return formContext.find(".fileInputControl").length > 0;
};

/**
 * Constructs an object suitable for URL-encoded form data submission.
 * It iterates through all active parameter inputs and collects their names and values.
 * @returns {object} An object where keys are parameter names and values are input values.
 */
const constructUrlEncodedData = () => {
    const dataPayload = {}; // Using const for the object as its reference doesn't change.
    const relevantInputs = $("#paramSectionWrapper").find(".actualInputValue");

    // Iterate over each input element using jQuery's .each().
    relevantInputs.each(function() {
        const currentInput = $(this);
        const inputName = currentInput.attr("name");

        // Skip inputs that lack a proper 'name' attribute, as they cannot be submitted.
        if (!inputName || inputName === "undefined") {
            console.warn("Skipping input with invalid 'name' attribute during URL-encoded data collection.");
            return true; // Equivalent to 'continue' in a standard for loop.
        }

        const inputValue = currentInput.val();
        dataPayload[inputName] = inputValue; // Add to the payload object.
    });

    console.debug("Generated URL-encoded payload:", dataPayload);
    return dataPayload;
};

/**
 * Creates a FormData object from all parameter and file input elements.
 * This format is necessary for submitting files and other data as 'multipart/form-data'.
 * @returns {FormData} A FormData object populated with form fields.
 */
const constructMultipartFormData = () => {
    const formDataInstance = new FormData(); // Using const for the FormData object.
    const relevantInputs = $("#paramSectionWrapper").find(".actualInputValue");

    // Iterate through all input elements.
    relevantInputs.each(function() {
        const currentInput = $(this);
        const domInput = this; // Get the raw DOM element to access 'files' property.
        const inputName = currentInput.attr("name");

        // Skip inputs without a valid name.
        if (!inputName || inputName === "undefined") {
            console.warn("Skipping input with invalid 'name' attribute during FormData collection.");
            return true;
        }

        // Check if the current input is a file input and has selected files.
        if (domInput.files && domInput.files.length > 0) {
            // Append the first selected file to the FormData.
            formDataInstance.append(inputName, domInput.files[0]);
            console.debug(`Appended file: ${inputName} - ${domInput.files[0].name}`);
        } else {
            // For non-file inputs, append their value.
            formDataInstance.append(inputName, currentInput.val());
        }
    });

    console.debug("Constructed FormData payload (contents not directly loggable).");
    return formDataInstance;
};

/**
 * Displays a user-friendly error message specifically for HTTP status 0,
 * which typically indicates a network failure, CORS issue, or server unavailability.
 * @function
 */
const reportNetworkConnectivityError = () => {
    const errorDisplayArea = $("#errorMessageContainer");
    if (!errorDisplayArea.length) {
        console.error("Error message container '#errorMessageContainer' not found. Cannot display network error.");
        return;
    }

    // Construct a rich error message using a template literal for readability.
    const detailedErrorMessage = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Network Connection Issue!</strong>
            An HTTP 0 error occurred, which usually means the request could not reach the server.
            This might be due to:
            <ul>
                <li>Cross-Origin Resource Sharing (CORS) policies blocking the request.</li>
                <li>The server being offline or unreachable.</li>
                <li>A problem with your internet connection.</li>
            </ul>
            Please check your browser's developer console for more specific details.
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;

    errorDisplayArea.append(detailedErrorMessage);

    // Automatically dismiss the alert after a set duration for better UX.
    setTimeout(() => {
        // This relies on Bootstrap's JS for the 'alert' method.
        errorDisplayArea.find('.alert').alert('close');
    }, 10000); // Alert will close after 10 seconds.
};


// --- Main Application Entry Point ---

/**
 * Event handler for the primary "Execute Request" button.
 * This function orchestrates the data collection and AJAX submission process.
 */
$(document).on('click', '#executeRequestButton', function(event) {
    event.preventDefault(); // Prevent default form submission.

    console.log("Execute Request button pressed. Initiating request preparation...");

    // Check for the presence of file inputs to determine the appropriate data format.
    const hasFilesToUpload = hasFileUploadElements();
    let finalPayload;

    if (hasFilesToUpload) {
        // If files are detected, prepare a FormData payload.
        finalPayload = constructMultipartFormData();
        console.info("File inputs detected. Preparing multipart/form-data submission.");
        executeAjaxSubmission({
            data: finalPayload,
            // Explicitly set contentType and processData to false for FormData.
            contentType: false,
            processData: false
        });
    } else {
        // If no files, prepare a standard URL-encoded payload.
        finalPayload = constructUrlEncodedData();
        console.info("No file inputs. Preparing URL-encoded data submission.");
        executeAjaxSubmission({
            data: finalPayload
            // contentType and processData will use their defaults for URL-encoded data.
        });
    }
});

// --- Initialization on Document Ready ---
$(document).ready(() => {
    // Perform initial UI setup once the DOM is fully loaded.
    adjustParameterSectionVisibility(); // Set initial visibility of the parameter section.
    console.info("DOM fully loaded. Initial UI state established.");
});
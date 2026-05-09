"use strict"; // Enforce strict parsing and error handling for cleaner code.

(function(globalWindow) {
  // --- Core Application Initialization Module ---

  /**
   * Orchestrates the primary application setup, including client-side routing.
   * This function expects a jQuery-compatible object to manage DOM interactions.
   * @param {object} jq The jQuery instance or a similar utility for DOM manipulation.
   * @returns {object|undefined} The Sammy.js application instance if successfully initialized, otherwise undefined.
   */
  const applicationInitializer = function(jq) {
    // A robust check to ensure the DOM utility is available and functional.
    if (!jq || typeof jq.fn !== 'object' || !jq.fn.jquery) {
      console.error("Critical dependency 'jQuery' not found or improperly loaded. Application setup aborted.");
      return undefined;
    }

    // Define the CSS selector for the main application view container.
    const primaryViewContainer = '#container';
    // Establish the default URL path for the application's root view.
    const initialNavigationPath = '#/';

    let routingEngineInstance; // This variable will hold our Sammy.js router.

    // Validate the existence of the main container element in the DOM.
    if (jq(primaryViewContainer).length === 0) {
      console.warn(`The designated primary view container '${primaryViewContainer}' is absent from the DOM. Routing may not function as expected.`);
      // An alternative strategy could be to dynamically create the container here.
    }

    try {
      // Initialize Sammy.js for handling client-side routing and view management.
      routingEngineInstance = jq.sammy(primaryViewContainer, function() {
        // Integrate the 'Couch' plugin, aliasing it as 'st' for convenience in routes.
        // This enables interaction with CouchDB via Sammy.js.
        this.use('Couch', 'st');

        // Define a specific route for the application's base URL.
        // The callback function is executed when navigation to this route occurs.
        this.get(initialNavigationPath, function(navigationContext) {
          // This block is currently a placeholder for future logic (e.g., loading a default dashboard).
          // For now, we simply log the navigation event for debugging purposes.
          console.log(`Successfully navigated to the base route: ${navigationContext.path}`);
          // No explicit view rendering or data fetching is performed here yet.
        });

        // Additional routes could be defined here for other application sections.
      });
    } catch (routerError) {
      // Catch any errors that occur during the Sammy.js initialization process.
      console.error("An error occurred during Sammy.js router initialization:", routerError);
      return undefined; // Indicate failure to initialize the router.
    }

    // Ensure the routing engine starts only after the entire DOM is ready.
    jq(document).ready(function() {
      // Begin the Sammy.js routing process, directing it to the initial path.
      routingEngineInstance.run(initialNavigationPath);
      console.info(`Sammy.js application router successfully launched at: ${initialNavigationPath}`);
    });

    return routingEngineInstance; // Return the initialized router instance.
  };

  // --- File Upload Form Management ---

  // Define a regular expression for validating the required file extension.
  const REQUIRED_FILE_PATTERN = /\.gpg$/i; // Matches '.gpg' at the end of a string, case-insensitive.
  // Identifier for the file upload form element.
  const UPLOAD_FORM_ELEMENT_ID = '#publish';
  // Identifier for the file input field within the form.
  const FILE_SELECTION_INPUT_ID = '#_attachments';
  // Generic selector for all submit buttons to control their visibility/state.
  const DOCUMENT_SUBMIT_BUTTONS = ':submit';

  /**
   * Performs validation on the provided file name against the required pattern.
   * @param {string} candidateFileName The name of the file to be validated.
   * @returns {boolean} True if the file name matches the GPG pattern, false otherwise.
   */
  const isFileNameValidGpg = (candidateFileName) => {
    // Basic type and emptiness check for robustness.
    if (typeof candidateFileName !== 'string' || candidateFileName.trim() === '') {
      console.warn("Attempted to validate an invalid or empty file name string.");
      return false;
    }
    return REQUIRED_FILE_PATTERN.test(candidateFileName);
  };

  /**
   * Event handler for changes detected in the file input field.
   * This function manages the visibility of submit buttons and triggers form submission.
   * @param {Event} domChangeEvent The native DOM 'change' event object.
   */
  const handleAttachmentSelection = function(domChangeEvent) {
    const fileInputTarget = globalWindow.jQuery(FILE_SELECTION_INPUT_ID);
    const submissionFormTarget = globalWindow.jQuery(UPLOAD_FORM_ELEMENT_ID);

    // Guard clause: Ensure the relevant DOM elements exist before proceeding.
    if (fileInputTarget.length === 0 || submissionFormTarget.length === 0) {
      console.error("Required DOM elements for file attachment handling are not present. Aborting handler.");
      return;
    }

    const selectedFileName = fileInputTarget.val();

    if (selectedFileName) {
      // If a file has been selected, make all submit buttons visible.
      globalWindow.jQuery(DOCUMENT_SUBMIT_BUTTONS).show();
      console.debug("Submit buttons are now visible as a file has been chosen.");
      // Programmatically trigger the form's submit event. This will invoke the form submission handler.
      submissionFormTarget.trigger('submit');
      console.log("Form submission event has been triggered by file input change.");
    } else {
      // If the file selection is cleared, hide the submit buttons.
      globalWindow.jQuery(DOCUMENT_SUBMIT_BUTTONS).hide();
      console.debug("Submit buttons are now hidden as no file is selected.");
    }
  };

  /**
   * Event handler for the file upload form's submission.
   * This function performs validation and handles the AJAX upload process.
   * @param {Event} formSubmitEvent The native DOM 'submit' event object.
   * @returns {boolean} Always returns false to prevent the browser's default form submission.
   */
  const processFileUploadForm = function(formSubmitEvent) {
    // Prevent the browser's default form submission to allow for AJAX handling.
    formSubmitEvent.preventDefault();

    const currentUploadForm = globalWindow.jQuery(this); // 'this' refers to the form element.
    const fileInputControl = currentUploadForm.find(FILE_SELECTION_INPUT_ID);
    const uploadedItemFullPath = fileInputControl.val(); // Retrieves the file name (or path for some browsers).

    // Pre-validation: Check if any file has been selected.
    if (!uploadedItemFullPath) {
      alert('Please select a file before attempting to upload.');
      console.warn("File upload aborted: No file was selected in the input field.");
      return false; // Halt the submission process.
    }

    // Validate the file name against the required GPG extension.
    if (!isFileNameValidGpg(uploadedItemFullPath)) {
      alert('Validation Error: The chosen file is not a valid *.gpg archive. Please select a correct file type.');
      console.error(`Invalid file extension detected for: '${uploadedItemFullPath}'. Expected a '.gpg' file.`);
      // Optionally, clear the file input to encourage re-selection.
      fileInputControl.val('');
      return false; // Prevent form submission due to validation failure.
    }

    // Configuration options for the jQuery Form Plugin's ajaxSubmit method.
    const ajaxTransferSettings = {
      url: "/upload", // The server endpoint for processing the file upload.
      type: "POST", // Specify the HTTP method explicitly.
      dataType: "json", // Anticipate a JSON response from the server.
      resetForm: true, // Automatically reset the form fields after a successful submission.
      clearForm: true, // Additionally clear any text input values.

      // Callback executed just before the form is submitted via AJAX.
      beforeSubmit: function(formDataArray, formElement, options) {
        console.log("Initiating file upload sequence...");
        // Disable submit buttons and update their text to provide user feedback.
        globalWindow.jQuery(DOCUMENT_SUBMIT_BUTTONS).prop('disabled', true).text('Uploading...');
        // Return true to proceed with the AJAX submission. Returning false would cancel it.
        return true;
      },

      // Callback for a successful server response (HTTP status 2xx).
      success: function(serverResponseData, httpResponseStatus, xhrObject, formElement) {
        alert('File upload completed successfully!');
        console.info(`Upload successful. Server response: ${JSON.stringify(serverResponseData)}. Status: ${httpResponseStatus}`);
        // Hide submit buttons and reset their state after a successful upload.
        globalWindow.jQuery(DOCUMENT_SUBMIT_BUTTONS).hide().prop('disabled', false).text('Submit');
        // Trigger a custom event to notify other parts of the application about the upload completion.
        globalWindow.jQuery(document).trigger('custom:fileUploadCompleted', [serverResponseData]);
      },

      // Callback for an AJAX request failure (e.g., network error, server error 4xx/5xx).
      error: function(xhrObject, errorStatus, thrownError) {
        alert('File upload encountered an error. Please review and try again.');
        console.error(`Upload failed: Status - ${errorStatus}, Error - ${thrownError}. XHR:`, xhrObject);
        // Re-enable submit buttons to allow the user to try again.
        globalWindow.jQuery(DOCUMENT_SUBMIT_BUTTONS).prop('disabled', false).text('Submit');
      },

      // Callback always executed, regardless of success or error, after the AJAX request completes.
      complete: function(xhrObject, finalStatus) {
        console.log(`AJAX request for file upload finished with status: ${finalStatus}.`);
        // Any final cleanup or logging can be performed here.
      }
    };

    // Execute the AJAX form submission using the configured settings.
    currentUploadForm.ajaxSubmit(ajaxTransferSettings);
    console.log("AJAX submission process has been launched for the form.");

    // Critical: Always return false to prevent the browser's default form submission behavior.
    return false;
  };

  // --- Event Listener Registration ---

  // Bind the application's main initializer function to the globally available jQuery instance.
  // This ensures the application starts once jQuery is ready and loaded.
  applicationInitializer(globalWindow.jQuery);

  // Attach the change event handler to the file input field using event delegation on the document.
  // This is more resilient to DOM changes than direct binding.
  globalWindow.jQuery(document).on('change', FILE_SELECTION_INPUT_ID, handleAttachmentSelection);

  // Attach the submit event handler to the upload form using event delegation.
  globalWindow.jQuery(document).on('submit', UPLOAD_FORM_ELEMENT_ID, processFileUploadForm);

})(this); // Pass the global context (typically 'window' in a browser) to the IIFE.
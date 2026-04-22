// This script module handles the initialization and custom behavior for the rich text editor component.
// It also manages the associated UI interactions for the editor's control panel.

// -------------------------------------------------- RICH TEXT EDITOR BOOTSTRAP
/**
 * Configures and initializes the CKEditor instance on the designated content input field.
 * This includes custom definitions for actions like content persistence.
 * @param {HTMLElement} editAreaElement The core textarea element that CKEditor will enhance.
 */
jQuery('.content-editor-wrapper > textarea').ckeditor(function (editAreaElement) {
  // Obtain the active CKEditor object associated with the provided DOM element.
  // This object allows programmatic control over the editor's features.
  const currentEditorInstance = jQuery(editAreaElement).ckeditorGet();

  // A critical check: if the editor instance isn't available, we cannot proceed
  // with custom command overrides, so we log an error and exit.
  if (!currentEditorInstance) {
    console.error('CRITICAL: CKEditor instance failed to initialize or retrieve. Save command customization aborted.');
    // Optionally, disable the save button if the editor isn't ready.
    return;
  }

  // Override the default 'save' command's execution logic to integrate with our backend.
  // This custom function will handle the asynchronous submission of the editor's content.
  currentEditorInstance.getCommand('save').exec = function (activeEditorContext) {
    // Define constants for the AJAX communication to improve readability and maintainability.
    const serviceBasePath = 'data/ajax/';
    const contentActionType = 'edit';
    const targetIdentifierSelector = '#main-content-area .target-identifier-input';
    const currentEditorContentSelector = '.content-editor-wrapper > textarea';

    // Retrieve the content from the editor and the dynamic target identifier.
    const editorHtmlContent = jQuery(currentEditorContentSelector).val();
    const dynamicTargetValue = jQuery(targetIdentifierSelector).val();

    // Construct the full AJAX request URL.
    const finalRequestUrl = serviceBasePath + dynamicTargetValue;

    // Prepare the data payload to be sent to the server.
    const submissionData = {
      content: editorHtmlContent,
      type: contentActionType
    };

    // Initiate an asynchronous HTTP POST request to save the content.
    jQuery.ajax({
      url: finalRequestUrl,
      type: 'POST',
      dataType: 'json', // Expecting a JSON response from the server.
      data: submissionData,
      cache: false,     // Explicitly disable browser caching for this dynamic content.
      async: true,      // Ensure the request is handled asynchronously (default, but good practice).
      beforeSend: function(requestHandle) {
          // Optional: Set custom headers or perform pre-validation before sending.
          requestHandle.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          console.groupCollapsed('Initiating content save operation...');
          console.log('Target URL:', finalRequestUrl);
          console.log('Payload:', submissionData);
          console.groupEnd();
      },
      success: function (serverOutcome) {
        let notificationMessage = 'Server responded without a clear status.';
        let messageCategory = 'System Status';
        let displayClass = 'alert-warning'; // Default to a warning state.

        // Validate the server's response structure and determine the notification details.
        if (serverOutcome && typeof serverOutcome.status === 'boolean') {
            notificationMessage = serverOutcome.msg || 'Operation completed successfully.';
            displayClass = serverOutcome.status ? 'alert-success' : 'alert-danger';
        } else {
            notificationMessage = 'Received an unexpected response format from the server.';
            displayClass = 'alert-danger';
        }
        // Dispatch the message using a global utility function.
        postSystemMessage(notificationMessage, messageCategory, displayClass);
      },
      error: function (requestHandle, networkStatus, exceptionDetails) {
        // Log comprehensive error details for debugging purposes.
        console.groupCollapsed('AJAX Content Save Error!');
        console.error('HTTP Status:', networkStatus);
        console.error('Exception:', exceptionDetails);
        console.error('Response Text:', requestHandle.responseText);
        console.groupEnd();

        // Inform the user about the failure.
        postSystemMessage(`Content submission failed due to: ${networkStatus}`, 'Backend Error', 'alert-danger');
      },
      complete: function() {
          // This callback executes regardless of success or failure, useful for cleanup.
          console.log('Content save request processing concluded.');
          // For instance, a loading indicator could be hidden here.
      }
    });
  };

  // After defining the custom save logic, explicitly enable the 'save' command
  // within the CKEditor interface to make it interactive.
  currentEditorInstance.getCommand('save').enable();
  console.info('CKEditor save command has been successfully overridden and enabled for custom backend integration.');
});


// -------------------------------------------------- EDITOR USER INTERFACE CONTROLS
// Attaching event listeners to control elements related to the editor's visibility.

/**
 * Attaches a click event handler to the editor's dismissal button.
 * This action will trigger the visual removal of the editor panel from the display.
 * @param {Event} clickEvent The DOM event object generated by the click.
 */
jQuery('.action-bar-controls .close-editor-btn').on('click', function (clickEvent) {
  // Prevent the default action for anchor tags (e.g., navigating to '#').
  clickEvent.preventDefault();

  const primaryEditorContainer = jQuery('#main-content-area');

  // Verify that the target editor container exists in the DOM before attempting to hide it.
  if (primaryEditorContainer.length > 0) {
      // Use a graceful fading animation to hide the editor container.
      primaryEditorContainer.fadeOut(400, function() {
          console.log('Content editing panel has been gracefully hidden from view.');
      });
  } else {
      console.warn('Attempted to hide the editor container, but the element identified by "#main-content-area" was not found.');
  }
});
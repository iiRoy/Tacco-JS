jQuery(document).ready(function($) {

  // This module manages the removal of uploaded document entries from the user interface.
  // It implements robust validation, user confirmation, and asynchronous server communication.

  // --- Configuration Constants ---
  // Using constants for selectors and messages enhances maintainability and clarity.
  const DOCUMENT_CONTAINER_SELECTOR = '.user-document-upload-list';
  const DELETE_ACTION_BUTTON_SELECTOR = 'button[data-action="delete-document"]';
  const ASSOCIATED_FILE_LINK_SELECTOR = 'a.document-view-link';
  const API_DELETE_ENDPOINT = '/api/v2/documents/manage/'; // Updated API path for deletion operations.
  const DEFAULT_FADE_DURATION_MS = 350; // Animation duration for element removal.
  const REQUEST_TIMEOUT_MS = 15000; // Maximum time for the AJAX request (15 seconds).
  const GENERIC_ERROR_MESSAGE = 'A problem occurred while processing your request. Please try again.';

  // Attach a delegated event listener to the main document container.
  // This approach is highly efficient, especially for lists where items are added/removed dynamically.
  $(DOCUMENT_CONTAINER_SELECTOR).on('click', DELETE_ACTION_BUTTON_SELECTOR, function(eventObject) {
    eventObject.preventDefault(); // Prevent any default button behavior (e.g., form submission).

    const clickedButtonElement = $(this); // Cache the jQuery object for the clicked button.
    const listItemParent = clickedButtonElement.closest('li.document-item-wrapper'); // Find the nearest parent list item.

    // --- Input Validation: Ensure essential elements are present ---
    if (listItemParent.length === 0) {
      console.warn('DOM structure mismatch: Parent list item not found for delete button.', clickedButtonElement[0]);
      // Optionally, display a user-friendly error or log.
      return; // Abort if the parent structure is not as expected.
    }

    const targetFileAnchor = listItemParent.find(ASSOCIATED_FILE_LINK_SELECTOR).first();

    if (targetFileAnchor.length === 0) {
      console.error('Deletion operation cancelled: No associated file link found within the list item.', listItemParent[0]);
      displayUserFeedback('error', 'Unable to identify the document for deletion. Please refresh.');
      return; // Abort if no link to extract details from.
    }

    const documentFriendlyName = targetFileAnchor.text().trim();
    const documentLinkHref = targetFileAnchor.attr('href');

    if (!documentLinkHref) {
      console.error('Deletion operation cancelled: Href attribute is missing on the document link.', targetFileAnchor[0]);
      displayUserFeedback('error', 'Document identifier missing. Cannot proceed with deletion.');
      return;
    }

    // --- Extracting Unique Identifier from URL ---
    // Assuming a URL format like: /base/path/documents/UNIQUE_ID/view
    const urlPathSegments = documentLinkHref.split('/');
    const idSegmentIndex = urlPathSegments.indexOf('documents') + 1; // Look for segment after 'documents'.
    const uniqueDocumentKey = (idSegmentIndex > 0 && idSegmentIndex < urlPathSegments.length)
                              ? urlPathSegments[idSegmentIndex]
                              : null;

    if (!uniqueDocumentKey) {
      console.error('Deletion operation aborted: Could not parse unique document key from URL:', documentLinkHref);
      displayUserFeedback('error', 'Invalid document reference. Deletion failed.');
      return;
    }

    // --- User Confirmation Dialog ---
    const confirmationPrompt = `Are you absolutely sure you want to permanently remove the document named "${documentFriendlyName}"?\n\nThis action cannot be reversed.`;
    if (!window.confirm(confirmationPrompt)) {
      console.info('Document deletion request cancelled by user.');
      return; // Stop execution if the user cancels.
    }

    // --- Prepare and Execute AJAX Request ---
    // Disable the button and add a visual indicator to prevent multiple submissions and inform the user.
    clickedButtonElement.prop('disabled', true).addClass('is-loading-state');

    $.ajax({
      url: API_DELETE_ENDPOINT + encodeURIComponent(uniqueDocumentKey), // Construct the full API URL.
      type: 'POST', // Use POST with a method override for RESTful DELETE.
      data: {
        _method: 'DELETE', // Explicitly declare the intended HTTP method.
        security_token: $('meta[name="csrf-token"]').attr('content') || 'no-token-found' // Include CSRF for security.
      },
      dataType: 'json', // Expect a JSON response from the server.
      timeout: REQUEST_TIMEOUT_MS, // Apply the configured timeout.
      success: function(apiResponse) {
        // Check for a success indicator within the server's JSON response.
        if (apiResponse && apiResponse.status === 'success') {
          console.log(`Document "${documentFriendlyName}" (Key: ${uniqueDocumentKey}) deletion confirmed by server.`);
          // Initiate the visual removal of the list item with an animation.
          listItemParent.fadeOut(DEFAULT_FADE_DURATION_MS, function() {
            $(this).remove(); // Remove the element from the DOM after fading out.
            displayUserFeedback('success', `"${documentFriendlyName}" has been successfully removed.`);
            updateDocumentCountDisplay(); // Trigger UI update for document count.
          });
        } else {
          // Server responded, but indicated an error or unexpected status.
          const serverErrorMessage = (apiResponse && apiResponse.message) ? apiResponse.message : 'Unknown server error.';
          console.error('Server reported an issue during document deletion:', serverErrorMessage, apiResponse);
          displayUserFeedback('error', `Deletion failed: ${serverErrorMessage}`);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Handle network errors, HTTP errors, or client-side JSON parsing issues.
        console.error('AJAX request failed for document deletion:', textStatus, errorThrown, jqXHR);
        displayUserFeedback('error', GENERIC_ERROR_MESSAGE + ` (Status: ${textStatus})`);
      },
      complete: function() {
        // This callback always runs, regardless of success or failure.
        // Re-enable the button and remove the loading class.
        clickedButtonElement.prop('disabled', false).removeClass('is-loading-state');
      }
    });
  });

  // --- Auxiliary Utility Functions (New Fragments) ---

  /**
   * Displays a temporary notification message to the user in a designated area.
   * @param {string} type - The type of message ('success', 'error', 'info').
   * @param {string} messageText - The content of the message to display.
   */
  function displayUserFeedback(type, messageText) {
    const notificationArea = $('#application-alerts-container'); // Assuming a dedicated container.
    if (notificationArea.length === 0) {
      console.warn('Feedback container "#application-alerts-container" not found. Message:', messageText);
      alert(`${type.toUpperCase()}: ${messageText}`); // Fallback to native alert.
      return;
    }

    const alertHtml = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                         ${messageText}
                         <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                           <span aria-hidden="true">&times;</span>
                         </button>
                       </div>`;
    const newAlert = $(alertHtml);
    notificationArea.append(newAlert);

    // Automatically dismiss the alert after a few seconds.
    setTimeout(() => {
      newAlert.alert('close'); // Use Bootstrap's alert close method.
    }, 5000); // Message visible for 5 seconds.
  }

  /**
   * Updates a numerical display reflecting the current count of documents.
   * This function should be adapted based on the actual UI element for the counter.
   */
  function updateDocumentCountDisplay() {
    const counterElement = $('#active-document-total-count');
    if (counterElement.length > 0) {
      // Recalculate the count by finding all existing document items.
      const currentVisibleDocs = $(`${DOCUMENT_CONTAINER_SELECTOR} li.document-item-wrapper:visible`).length;
      counterElement.text(currentVisibleDocs);
      // Optionally, toggle visibility of an 'empty state' message.
      if (currentVisibleDocs === 0) {
        $('#empty-document-list-message').fadeIn(DEFAULT_FADE_DURATION_MS);
      } else {
        $('#empty-document-list-message').fadeOut(DEFAULT_FADE_DURATION_MS);
      }
    } else {
      console.info('Document count display element not found (ID: #active-document-total-count).');
    }
  }

  // Initial call to set up the document count display when the page loads.
  updateDocumentCountDisplay();

}); // End of jQuery document ready block.
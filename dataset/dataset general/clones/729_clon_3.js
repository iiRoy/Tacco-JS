// This module handles the submission of file upload forms via AJAX,
// dynamically displaying the results in a designated container.
(function(jQ) {
  'use strict';

  // --- Utility Function: Converts a byte count into a user-friendly string ---
  /**
   * Transforms a raw byte count into a human-readable string, e.g., "10.5 KB".
   * Includes validation for input and handles various unit conversions.
   * @param {number} rawBytes - The size of the file in bytes.
   * @returns {string} A formatted string representing the file size.
   */
  function renderByteCount(rawBytes) {
    // Input validation: Ensure rawBytes is a valid non-negative number.
    if (typeof rawBytes !== 'number' || isNaN(rawBytes) || rawBytes < 0) {
      console.warn('renderByteCount received invalid input:', rawBytes);
      return '0 Bytes'; // Default for invalid input.
    }

    const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']; // Expanded list of units.
    let currentSizeValue = rawBytes;
    let unitIndex = 0;
    const conversionFactor = 1024; // Standard for binary prefixes.

    // Loop to find the most appropriate unit for the given size.
    while (currentSizeValue >= conversionFactor && unitIndex < sizeUnits.length - 1) {
      currentSizeValue /= conversionFactor;
      unitIndex++;
    }

    // Format the number: use one decimal place for smaller values, round for larger.
    const displayValue = currentSizeValue < 100 ? currentSizeValue.toFixed(1) : Math.round(currentSizeValue);

    return `${displayValue} ${sizeUnits[unitIndex]}`;
  }

  // --- Core Application Logic: Event Binding for Form Submissions ---
  // Attaches a 'submit' event listener to forms identified by the 'upload-target-form' class.
  // This ensures that submissions triggered by buttons, Enter key, etc., are handled.
  jQ('form.upload-target-form').on('submit', function(triggerEvent) {
    const currentFormElement = jQ(this); // Cache the jQuery object for the submitting form.

    // Crucially, prevent the browser's default form submission, which would cause a page reload.
    triggerEvent.preventDefault();

    // --- Pre-submission Validation: Check for selected files ---
    const fileInputElements = currentFormElement.find('input[type="file"]');
    let atLeastOneFileSelected = false;

    // Iterate through all file input fields to confirm at least one file is present.
    fileInputElements.each((_idx, inputElem) => {
      if (inputElem.files && inputElem.files.length > 0) {
        atLeastOneFileSelected = true;
        return false; // Exit the .each loop early if files are found.
      }
    });

    // If no files are selected, provide user feedback and abort the AJAX request.
    if (!atLeastOneFileSelected) {
      alert('Please select one or more files before attempting to upload.');
      console.warn('Upload attempt aborted: No files were selected by the user.');
      return; // Stop execution of the handler.
    }

    // Add a visual indicator to the form, e.g., a 'processing' class for styling.
    currentFormElement.addClass('processing-upload-active');
    jQ('#uploadMessageArea').text('Uploading files...').removeClass('alert-danger alert-success').addClass('alert-info');

    // Collect additional form data (e.g., text inputs, hidden fields).
    // This data will be sent along with the files.
    const auxiliaryFormPayload = currentFormElement.find('textarea, input[type="text"], input[type="hidden"]').serializeArray();

    // Initiate the AJAX request for file upload.
    // jQuery's `ajax` method can handle file uploads using an iframe transport
    // when `iframe: true` and `fileInputs` are provided.
    jQ.ajax(currentFormElement.attr('action'), {
      method: 'POST', // Explicitly define the HTTP method.
      data: auxiliaryFormPayload, // Non-file form data.
      dataType: 'json', // Specifies the expected data type of the server response.
      fileInputs: fileInputElements, // References the file input elements for upload.
      iframe: true, // Enables iframe transport for file upload compatibility.
      processData: false, // Prevents jQuery from automatically processing the 'data' object.
      timeout: 25000, // Set a request timeout of 25 seconds to prevent indefinite waiting.

      // Callback function executed just before the AJAX request is sent.
      beforeSend: function(jqXHR, settings) {
        console.log(`Preparing to send upload request to: ${settings.url}`);
        // Custom headers or request modifications can be made here.
      },

      // Callback function executed regardless of success or failure, after the request completes.
      complete: function() {
        currentFormElement.removeClass('processing-upload-active'); // Remove processing indicator.
        console.log('File upload request has finished executing.');
      }
    })
    .done(function(serverResponse) {
      // --- Handle successful server response ---
      console.info('Upload successful! Server response:', serverResponse);
      jQ('#uploadMessageArea').text('Upload completed successfully!').removeClass('alert-info alert-danger').addClass('alert-success');

      // Guard against an empty or invalid array of uploaded items in the response.
      if (!serverResponse || !Array.isArray(serverResponse.uploadedItems) || serverResponse.uploadedItems.length === 0) {
        console.warn('Server responded successfully, but no valid uploaded item metadata was found.');
        jQ('#uploadMessageArea').text('Upload completed, but no files were processed by the server.').removeClass('alert-success').addClass('alert-warning');
        return;
      }

      const displayTargetContainer = jQ('#uploadedFilesContainer'); // The element where file details will be appended.
      const submissionContextNote = serverResponse.submissionNote || 'No specific note.'; // Extract a potential note from the response.

      // Iterate over each piece of file metadata provided by the server.
      jQ.each(serverResponse.uploadedItems, function(itemIndex, uploadedFileMetadata) {
        // Create a new list item element using jQuery's object-based creation for clarity.
        const fileDisplayEntry = jQ('<li />', {
          'class': 'uploaded-entry-item'
        });

        // Add a heading for the file's original name.
        jQ('<h4 />', {
          'class': 'entry-file-name',
          'text': uploadedFileMetadata.nameProperty || `File ${itemIndex + 1}`
        }).appendTo(fileDisplayEntry);

        // Create a paragraph for detailed file information (size, MIME type).
        const detailsParagraph = jQ('<p />', {
          'class': 'entry-details-line'
        }).appendTo(fileDisplayEntry);

        // Append formatted size and MIME type as spans.
        jQ('<span />', {
          'class': 'detail-file-size',
          'text': renderByteCount(uploadedFileMetadata.byteCount)
        }).appendTo(detailsParagraph);

        jQ('<span />', {
          'class': 'detail-mime-type',
          'text': `, ${uploadedFileMetadata.contentType || 'unknown/type'}`
        }).appendTo(detailsParagraph);

        // Add a blockquote for any associated comment or submission note.
        jQ('<blockquote />', {
          'class': 'entry-submission-note',
          'text': submissionContextNote
        }).appendTo(fileDisplayEntry);

        // Finally, append the fully constructed file entry to the target container.
        displayTargetContainer.append(fileDisplayEntry);
      });

      // After successful display, clear the file input field(s) to prepare for next upload.
      fileInputElements.val('');
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      // --- Handle AJAX request failure ---
      console.error('File upload failed:', textStatus, errorThrown, jqXHR);
      let userFeedbackMessage = 'An unexpected error occurred during file upload. Please try again.';

      // Provide more specific error messages based on the failure type.
      if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
        userFeedbackMessage = `Server Error: ${jqXHR.responseJSON.message}`;
      } else if (textStatus === 'timeout') {
        userFeedbackMessage = 'Upload timed out. Please check your network connection and try again.';
      } else if (textStatus === 'abort') {
        userFeedbackMessage = 'Upload was cancelled.';
      } else if (errorThrown) {
        userFeedbackMessage = `Upload failed: ${errorThrown}`;
      }

      jQ('#uploadMessageArea').text(userFeedbackMessage).removeClass('alert-info alert-success').addClass('alert-danger');
    });
  });

  // --- Additional Functionality: Clear Form Button Handler ---
  // This is an added, non-essential feature to demonstrate structural modifications.
  // It allows users to clear the upload form and the displayed file list.
  jQ('button.clear-upload-form-btn').on('click', function() {
    const associatedForm = jQ(this).closest('form.upload-target-form');
    if (associatedForm.length) {
      // Reset the native form elements.
      associatedForm[0].reset();
      // Explicitly clear file input values, as native reset might not always work for file types.
      associatedForm.find('input[type="file"]').val('');

      // Clear any displayed messages and the list of uploaded files.
      jQ('#uploadMessageArea').text('').removeClass('alert-success alert-warning alert-danger alert-info');
      jQ('#uploadedFilesContainer').empty();
      console.log('Upload form and displayed file entries have been cleared.');
    }
  });

})(jQuery); // Pass the jQuery object as 'jQ' into the IIFE to prevent conflicts.
// This module provides a robust file upload mechanism via drag-and-drop functionality,
// implemented as a jQuery plugin. It facilitates asynchronous file transfers
// and updates hidden input fields with file metadata upon successful upload.

(function(jq){

    // Define the default configuration settings for the file upload widget.
    // These settings can be overridden by the user when initializing the plugin.
    const defaultUploadSettings = {
        // The URL endpoint for processing file uploads.
        // It's dynamically constructed using a global WordPress AJAX URL.
        processingEndpoint: wpAjaxUrl + "?action=get_file_info",
        // A prefix for the success message displayed after a file is uploaded.
        uploadSuccessPrefix: "Successfully processed file: ",
        // Custom CSS classes for styling success and error messages.
        successClass: "upload-status-success",
        errorClass: "upload-status-error",
        // Optional: Maximum allowed file size in bytes (e.g., 2MB).
        maxFileSize: 2 * 1024 * 1024 // Default: 2 Megabytes
    };

    // Main plugin definition for jQuery.
    // This function extends jQuery's prototype to add a new 'fileDropZone' method.
    jq.fn.fileDropZone = function(configOverrides){
        // Merge default settings with any user-provided options.
        // Object.assign creates a new object, ensuring defaultUploadSettings remains pristine.
        const currentSettings = Object.assign({}, defaultUploadSettings, configOverrides);

        // Iterate over each selected DOM element to apply the drop zone functionality.
        return this.each(function(){
            const dropContainer = this; // Cache the current DOM element for native operations.
            const $dropContainer = jq(dropContainer); // Cache the jQuery wrapper for jQuery operations.

            // Object to hold references to dynamically created DOM elements.
            // Using a descriptive name like 'managedElements' for clarity.
            const managedElements = {};

            // --- Element Creation ---
            // Create a hidden input field to store the uploaded file's server path.
            managedElements.serverPathField = jq('<input>')
                .prop('type', 'hidden')
                .addClass('file-upload-path-input')
                .prop('name', 'file_upload_data[path_identifier]')
                .appendTo(dropContainer);

            // Create a hidden input field to store the uploaded file's MIME type.
            managedElements.mimeTypeField = jq('<input>')
                .prop('type', 'hidden')
                .addClass('file-upload-type-input')
                .prop('name', 'file_upload_data[mime_type]')
                .appendTo(dropContainer);

            // Create a paragraph element to display status messages (success/error).
            managedElements.statusMessageDisplay = jq('<p>')
                .addClass('file-upload-status-display')
                .hide() // Initially hide the message display.
                .appendTo(dropContainer);

            // --- Event Listeners for Drag-and-Drop Feedback ---
            // Prevent default browser behavior for drag events to allow dropping.
            // Add/remove a 'drag-active' class to provide visual feedback to the user.

            dropContainer.addEventListener('dragenter', (event) => {
                event.preventDefault();
                event.stopPropagation(); // Stop propagation to prevent parent elements from handling the event
                $dropContainer.addClass('drag-active');
            });

            dropContainer.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.stopPropagation();
                // Ensure class is present even if dragenter was missed or reset
                if (!$dropContainer.hasClass('drag-active')) {
                    $dropContainer.addClass('drag-active');
                }
            });

            dropContainer.addEventListener('dragleave', (event) => {
                event.preventDefault();
                event.stopPropagation();
                // A simple removal for dragleave. More robust solutions might check event.relatedTarget.
                $dropContainer.removeClass('drag-active');
            });

            // --- Drop Event Handling ---
            // This is where the file processing and upload initiation begins.
            dropContainer.addEventListener('drop', (event) => {
                event.preventDefault(); // Prevent browser from opening the file.
                event.stopPropagation(); // Stop propagation.

                $dropContainer.removeClass('drag-active'); // Remove visual feedback immediately.

                // Ensure dataTransfer exists and contains files.
                const droppedFiles = event.dataTransfer ? event.dataTransfer.files : [];
                if (droppedFiles.length === 0) {
                    // Display a warning if no files were dropped.
                    displayStatusMessage(managedElements.statusMessageDisplay, "No files detected in drop operation.", currentSettings.errorClass);
                    return; // Exit if no files.
                }

                // Initiate the upload process for the first file.
                // For simplicity, this implementation handles only the first dropped file.
                initiateFileUpload(droppedFiles[0], $dropContainer, managedElements, currentSettings);
            });
        });
    };

    /**
     * Displays a status message to the user within the specified message container.
     * It clears previous status classes and applies the new one.
     * @param {jQuery} $messageContainer - The jQuery object for the message display element.
     * @param {string} messageText - The text content of the message.
     * @param {string} className - The CSS class to apply for styling (e.g., success or error).
     */
    function displayStatusMessage($messageContainer, messageText, className) {
        $messageContainer
            .html(messageText)
            .removeClass(defaultUploadSettings.successClass) // Remove old success class
            .removeClass(defaultUploadSettings.errorClass)    // Remove old error class
            .addClass(className) // Add the new class
            .show(); // Ensure the message is visible
    }

    /**
     * Initiates the asynchronous file upload process for a single file.
     * This function handles XHR setup, progress, and response processing.
     * @param {File} fileToUpload - The File object to be uploaded.
     * @param {jQuery} $targetArea - The jQuery object representing the drop zone container.
     * @param {object} elementReferences - An object containing references to related DOM elements.
     * @param {object} uploadConfiguration - The merged configuration settings for the upload.
     */
    function initiateFileUpload(fileToUpload, $targetArea, elementReferences, uploadConfiguration){
        // Basic validation: Check if a valid file object is provided.
        if (!(fileToUpload instanceof File)) {
            console.error("Invalid file object provided for upload process.");
            displayStatusMessage(elementReferences.statusMessageDisplay, "Internal error: Invalid file object.", uploadConfiguration.errorClass);
            return;
        }

        // --- Pre-upload Validations ---
        // Validate file size against the configured maximum.
        if (uploadConfiguration.maxFileSize && fileToUpload.size > uploadConfiguration.maxFileSize) {
            const maxSizeMB = Math.round(uploadConfiguration.maxFileSize / 1024 / 1024);
            displayStatusMessage(
                elementReferences.statusMessageDisplay,
                `File size exceeds limit (${maxSizeMB}MB). Please select a smaller file.`,
                uploadConfiguration.errorClass
            );
            return; // Stop upload if validation fails.
        }

        // Indicate a loading state (e.g., add a class to the container for styling).
        $targetArea.addClass('is-uploading');
        displayStatusMessage(elementReferences.statusMessageDisplay, "Uploading file, please wait...", ""); // Clear previous message, show loading

        const fileTransferRequest = new XMLHttpRequest();

        fileTransferRequest.onreadystatechange = function(){
            // Check for completion and successful HTTP status.
            if (fileTransferRequest.readyState === XMLHttpRequest.DONE) {
                $targetArea.removeClass('is-uploading'); // Remove loading state regardless of outcome.

                if (fileTransferRequest.status === 200) {
                    try {
                        const responsePayload = JSON.parse(fileTransferRequest.responseText);

                        if (responsePayload.error){
                            // Display server-side error message.
                            displayStatusMessage(elementReferences.statusMessageDisplay, responsePayload.error, uploadConfiguration.errorClass);
                        } else {
                            // Update hidden fields with successful upload data.
                            elementReferences.serverPathField.val(responsePayload.file_path);
                            elementReferences.mimeTypeField.val(fileToUpload.type);
                            // Display success message with the file name.
                            displayStatusMessage(
                                elementReferences.statusMessageDisplay,
                                uploadConfiguration.uploadSuccessPrefix + `<strong>${fileToUpload.name}</strong>`,
                                uploadConfiguration.successClass
                            );
                        }
                    } catch (parseError) {
                        // Handle JSON parsing errors, which indicates a malformed server response.
                        console.error("Error parsing server response:", parseError);
                        displayStatusMessage(elementReferences.statusMessageDisplay, "Server response malformed or invalid JSON.", uploadConfiguration.errorClass);
                    }
                } else {
                    // Handle HTTP errors (e.g., 404 Not Found, 500 Internal Server Error).
                    const errorMessage = `Upload failed: HTTP Status ${fileTransferRequest.status}.`;
                    console.error(errorMessage, fileTransferRequest.responseText);
                    displayStatusMessage(elementReferences.statusMessageDisplay, errorMessage, uploadConfiguration.errorClass);
                }
            }
        };

        // Configure the AJAX request: POST method, target endpoint, asynchronous.
        fileTransferRequest.open("POST", uploadConfiguration.processingEndpoint, true);

        // Set custom headers for file metadata.
        // The 'Content-Type' header for 'multipart/form-data' is typically set automatically
        // by the browser when sending a FormData object or a File object directly.
        // Manually setting it here could interfere with the browser's automatic boundary generation.
        fileTransferRequest.setRequestHeader("X-File-Type", fileToUpload.type);
        fileTransferRequest.setRequestHeader("X-File-Size", fileToUpload.size);
        // Encode the filename to handle special characters safely in HTTP headers.
        fileTransferRequest.setRequestHeader("X-File-Name", encodeURIComponent(fileToUpload.name));

        // Send the file directly in the request body.
        fileTransferRequest.send(fileToUpload);
    }

})(jQuery);
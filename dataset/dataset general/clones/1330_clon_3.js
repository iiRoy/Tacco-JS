let globalDragStateTimer = null;

/**
 * Utility function to simulate a basic templating engine for upload items.
 * In a production environment, this would involve a more robust templating solution
 * like Handlebars, Vue, or React components.
 * @param {string} templateIdentifier - An identifier for the template (e.g., 'upload-template-view').
 * @param {object} itemData - The data object containing file details (name, size).
 * @returns {jQuery} - A jQuery object representing the rendered HTML structure for an upload item.
 */
const generateUploadItemMarkup = function(templateIdentifier, itemData) {
    // Extract relevant data, providing defaults for robustness.
    const fileName = itemData && itemData.name ? itemData.name : 'Untitled File';
    const fileSizeKB = itemData && itemData.size ? `(${Math.round(itemData.size / 1024)} KB)` : '';

    // Construct the HTML string for the upload item.
    // This structure is a Type III modification from the original 'template-upload' output.
    const itemHtml = `
        <div class="upload-progress-card" data-file-name="${fileName}">
            <div class="file-details">
                <span class="file-name-label">${fileName}</span>
                <span class="file-size-info">${fileSizeKB}</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-fill-indicator" style="width: 0%;" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
            <button class="action-button cancel-upload-action">Cancel</button>
        </div>
    `;
    return $(itemHtml);
};

/**
 * Callback function executed when a file is added to the upload queue.
 * This function prepares the UI for the new file and triggers its upload.
 * @param {Event} uploadEvent - The event object from the file upload plugin.
 * @param {object} uploadPayload - The data payload provided by the file upload plugin, containing file details.
 */
function handleFileAddition(uploadEvent, uploadPayload) {
    // Validate the presence of files in the payload as a guard clause.
    if (!uploadPayload || !uploadPayload.files || uploadPayload.files.length === 0) {
        console.warn("Upload operation detected, but no valid file entries were provided. Skipping item addition.");
        return; // Abort if no files are present.
    }

    const currentFileEntry = uploadPayload.files[0];
    console.info(`Initiating display for new file: "${currentFileEntry.name}" (Size: ${currentFileEntry.size} bytes)`);

    // Generate the HTML representation for the file using our custom templating function.
    // The reference to this generated element is stored in the payload for later updates.
    uploadPayload.displayElementReference = generateUploadItemMarkup("upload-template-view", currentFileEntry);

    // Append the newly created file display element to the designated upload queue container.
    $('.upload-queue-container').append(uploadPayload.displayElementReference);

    // As a Type III modification, introduce a slight delay before actual submission.
    // This can help ensure UI updates are complete or allow for pre-submission checks.
    setTimeout(() => {
        uploadPayload.submit(); // Trigger the actual file upload.
        console.log(`File submission initiated for: "${currentFileEntry.name}".`);
    }, 75); // A small, non-critical delay.
}

/**
 * Callback function executed during the file upload process to update progress.
 * It calculates the percentage and visually updates the progress bar.
 * @param {Event} uploadEvent - The event object from the file upload plugin.
 * @param {object} uploadPayload - The data payload, including loaded/total bytes and the display element reference.
 */
function updateUploadProgress(uploadEvent, uploadPayload) {
    // Ensure we have a valid display element and total size to prevent errors.
    if (!uploadPayload.displayElementReference || uploadPayload.total === 0) {
        console.debug("Progress update skipped: Missing display element or total file size is zero.");
        return;
    }

    // Calculate the upload completion percentage, rounding it and capping at 100%.
    const completionPercentage = Math.min(100, Math.round((uploadPayload.loaded / uploadPayload.total) * 100));

    // Locate the progress bar within the file's display element and update its width.
    // Also update ARIA attributes for improved accessibility.
    uploadPayload.displayElementReference
        .find('.progress-fill-indicator')
        .css('width', `${completionPercentage}%`)
        .attr('aria-valuenow', completionPercentage); // Update ARIA for screen readers.
}

/**
 * Callback function executed upon successful completion of a file upload.
 * This typically involves removing the file's display element or marking it as complete.
 * @param {Event} uploadEvent - The event object from the file upload plugin.
 * @param {object} uploadPayload - The data payload, including the display element reference.
 */
function finalizeUploadDisplay(uploadEvent, uploadPayload) {
    if (uploadPayload.displayElementReference) {
        console.log(`Upload for file completed. Transitioning display element.`);
        // As a Type III modification, add a 'completed' class and fade out before removal.
        uploadPayload.displayElementReference
            .addClass('upload-finished-status') // Add a status class for styling.
            .find('.action-button.cancel-upload-action').text('Done').prop('disabled', true).end() // Update button text.
            .delay(500) // Small delay before fading out.
            .fadeOut(600, function() {
                $(this).remove(); // Remove the element from the DOM after fading out.
                console.debug("Upload item display element removed from DOM.");
            });
    } else {
        console.warn("Upload completed, but no associated display element reference was found for cleanup.");
    }
}

// --- Document Ready Block: Main Application Logic ---
$(document).ready(function() {
    // Define the configuration options for the jQuery File Upload plugin.
    // These options are externalized into a constant object for clarity and maintainability.
    const fileUploadConfiguration = {
        responseFormat: "script", // Specifies the expected response type from the server.
        dropTargetArea: $("#upload_dialog_container #drop_target_zone"), // Selector for the designated drop zone.
        onAddFile: handleFileAddition, // Custom callback for when files are added.
        onProgressUpdate: updateUploadProgress, // Custom callback for upload progress.
        onUploadComplete: finalizeUploadDisplay // Custom callback for upload completion.
    };

    // Initialize the file upload plugin on the specific input element.
    // The selector and configuration object are renamed from the original.
    $("#upload_dialog_container #file_input_element").fileupload(fileUploadConfiguration);
    console.log("File upload mechanism initialized on target input element.");

    // --- Global Drag-and-Drop Visual Feedback Handler ---
    // This section manages the visual cues for the drop zone when files are dragged over the document.
    $(document).on('dragover', function (browserEvent) {
        // Access the original DOM event to correctly identify the target.
        const actualEvent = browserEvent.originalEvent || browserEvent;
        const targetZoneElement = $('#upload_dialog_container #drop_target_zone');

        // Clear any pending timeout that would hide the drop zone.
        // If no timeout exists, it means a new drag operation has started.
        if (globalDragStateTimer) {
            clearTimeout(globalDragStateTimer);
        } else {
            // Only add the 'is-active' class once per drag session.
            targetZoneElement.addClass('is-active-drag');
        }

        // Apply a 'is-hovering-over' class if the drag is directly over the drop zone element.
        if (actualEvent.target === targetZoneElement[0]) {
            targetZoneElement.addClass('is-hovering-over');
        } else {
            targetZoneElement.removeClass('is-hovering-over');
        }

        // Set a new timeout to remove the visual cues if dragging stops.
        // The duration is slightly increased for better user experience.
        globalDragStateTimer = setTimeout(function () {
            globalDragStateTimer = null; // Reset the timer reference.
            targetZoneElement.removeClass('is-active-drag is-hovering-over'); // Remove all visual classes.
        }, 200); // Increased duration from 100ms to 200ms.
    });

    // --- Prevent Default Browser Handling for Drop and Dragover Events ---
    // This crucial step stops the browser from navigating away or opening dropped files.
    $(document).on('drop dragover', function (browserEvent) {
        browserEvent.preventDefault(); // Halt the browser's default behavior.
        console.debug("Default browser action for drop/dragover events suppressed.");
    });

    // --- Post-Initialization Validation / Guard Clause ---
    // Check for the existence of critical UI elements after DOM is ready.
    // This helps in diagnosing potential setup issues.
    const primaryDropZone = $("#upload_dialog_container #drop_target_zone");
    if (primaryDropZone.length === 0) {
        console.error("Critical UI component missing: The primary drop target zone was not found. Drag-and-drop functionality might be severely impaired.");
        // Optionally, disable the file upload input if the drop zone is critical.
        // $("#upload_dialog_container #file_input_element").fileupload('disable');
    } else {
        console.log("Primary drop target zone successfully located.");
    }
});
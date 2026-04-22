/*
 * This section initializes the file upload plugin for a specific DOM element.
 * It configures various options for handling file uploads.
 */
$("#file_manager_modal #new_upload")
    .fileupload(
        {
            // Define the data type for the server response
            dataType: "script",

            // Specify the drop zone element for drag-and-drop uploads
            dropZone: $("#dropzone"),

            // Callback function to be executed when a file is added
            add: addfile,

            // Callback function for tracking upload progress
            progress: progressfile,

            // Callback function to be executed when an upload is complete
            done: donefile
        }
    );


// --- Document-level event handling for drag-and-drop functionality ---


/*
 * Binds the 'dragover' event to the entire document.
 * This function manages the visual feedback for the drop zone
 * when files are being dragged over the page.
 */
$(document).bind('dragover',
    function (e) {

        // Get the drop zone element and the timeout reference
        var dropZone = $('#dropzone'),
            timeout = window.dropZoneTimeout;

        // If no timeout is active, add the 'in' class to indicate dragover
        if (!timeout) {
            dropZone.addClass('in');
        } else {
            // Otherwise, clear the existing timeout
            clearTimeout(timeout);
        }

        /*
         * Check if the event target is the drop zone itself.
         * This helps in distinguishing between dragging over the document
         * and dragging specifically over the drop zone.
         */
        if (e.target === dropZone[0]) {
            dropZone.addClass('hover'); // Add 'hover' class for specific drop zone interaction
        } else {
            dropZone.removeClass('hover'); // Remove 'hover' if not directly over drop zone
        }

        /*
         * Set a timeout to remove the 'in' and 'hover' classes
         * after a short delay, effectively resetting the visual state.
         */
        window.dropZoneTimeout = setTimeout(function () {
            window.dropZoneTimeout = null; // Clear the timeout reference
            dropZone.removeClass('in hover'); // Remove all active classes
        }, 100); // 100 milliseconds delay
    }
);


/*
 * Function definition for 'addfile'.
 * This callback is triggered when a new file is selected or dropped.
 * It prepares the UI for the new upload and initiates the submission.
 */
function addfile(e, data) {

    var file = data.files[0]; // Get the first file from the data object


    // Create a new context element using a template for the upload
    data.context = $(tmpl("template-upload", file));


    // Append the newly created context to the file table for display
    $('.file_table').append(data.context);


    // Submit the file upload
    data.submit();
}


/*
 * Function definition for 'progressfile'.
 * This callback is triggered periodically during the file upload process.
 * It updates the progress bar for the ongoing upload.
 */
function progressfile(e, data) {

    var progress; // Declare a variable to hold the progress percentage


    // Ensure that a context element exists for this upload
    if (data.context) {

        // Calculate the progress as a percentage
        progress = parseInt(data.loaded / data.total * 100, 10);

        // Update the width of the progress bar element within the context
        return data.context.find('.bar').css('width', progress + '%');
    }
}


/*
 * Function definition for 'donefile'.
 * This callback is triggered once a file upload has successfully completed.
 * It removes the upload's context element from the UI.
 */
function donefile(e, data) {

    // Check if the upload context exists
    if (data.context) {

        // Remove the context element from the DOM
        data.context.remove();
    }
}


// --- Final document-level event handler ---


/*
 * Binds both 'drop' and 'dragover' events to the document
 * to prevent default browser behavior (e.g., opening the dropped file).
 */
$(document).bind('drop dragover',
    function (e) {
        e.preventDefault(); // Prevent the default action for these events
    }
);
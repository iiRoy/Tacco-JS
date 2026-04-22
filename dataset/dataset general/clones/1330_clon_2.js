// Initialization of the file transfer component for asset management.
// This block configures the upload widget associated with a specific UI element.
jQuery( "#asset_management_popup #new_item_upload" )
  .fileTransferWidget(
    {
      transferType: "javascript", // Specifies the type of content being uploaded
      receptionArea: jQuery( "#drop_target" ), // Defines the designated drag-and-drop zone
      onAdd: handleAddition, // Callback function for when files are added to the queue
      onProgress: updateProgression, // Callback function for tracking upload progress
      onCompletion: finalizeTransfer // Callback function executed upon successful transfer completion
    }
  );

// Event listener for drag-over events across the entire document.
// Manages visual feedback for the drop zone when items are being dragged.
jQuery( document )
  .on(
    'drag_over_event',
    function( eventObject_for_drag )
      {
        /* Declare and initialize variables for the drop zone element and its associated timer. */
        let targetAreaElement = jQuery( '#drop_target' );
        let activeTimerId = window.dropAreaActivityTimer;

        // If no active timer exists, mark the drop zone as 'active'.
        if ( activeTimerId === undefined || activeTimerId === null )
          {
            targetAreaElement.addClass( 'active_state' );
          }
        else
          {
            // Otherwise, clear the existing timer to reset the delay.
            window.clearTimeout( activeTimerId );
          }

        // Check if the drag event's target is the drop zone itself.
        if ( eventObject_for_drag.target === targetAreaElement[ 0 ] )
          {
            // Apply a 'highlight' class if dragging over the drop zone.
            targetAreaElement.addClass( 'highlight_state' );
          }
        else
          {
            // Remove the 'highlight' class if dragging outside the drop zone.
            targetAreaElement.removeClass( 'highlight_state' );
          }

        // Set a new timeout to remove the 'active' and 'highlight' classes after a short delay.
        // This creates a visual reset for the drop zone after drag activity ceases.
        window.dropAreaActivityTimer = window.setTimeout(
          function ()
            {
              window.dropAreaActivityTimer = null; // Clear the timer reference
              targetAreaElement.removeClass( 'active_state highlight_state' ); // Remove visual states
            },
            1e2 // Delay of 100 milliseconds
          );
      }
  );

/**
 * Handles the event when a file is added to the upload queue.
 * This function prepares the file for display and initiates its submission.
 * @param {object} eventObj_add The event object.
 * @param {object} transferData_add An object containing file transfer details.
 */
function handleAddition( eventObj_add, transferData_add )
  {
    // Retrieve the first file from the list of files in the transfer data.
    const uploadedFile_item = transferData_add.files_list[ 0 ];

    // Generate a UI element context using a template and the file data.
    transferData_add.ui_element_context =
      jQuery(
        generateTemplate( "upload_item_template", uploadedFile_item )
      );

    // Append the newly created UI element to the designated file list container.
    jQuery( '.uploaded_file_list' )
      .append( transferData_add.ui_element_context );

    // Initiate the actual file upload process.
    transferData_add.initiateUpload();
  }


/**
 * Updates the progress indicator for an ongoing file transfer.
 * @param {object} eventObject_progress The event object.
 * @param {object} transferDetails_progress An object containing transfer progress information.
 * @returns {jQuery|void} A jQuery object representing the progress bar, or void if context is missing.
 */
function updateProgression( eventObject_progress, transferDetails_progress )
  {
    let currentProgress_value; // Variable to store the calculated percentage.

    // Proceed only if a UI context element exists for this transfer.
    if ( transferDetails_progress.ui_element_context )
      {
        // Calculate the percentage of completion.
        currentProgress_value =
          window.parseInt(
            ( transferDetails_progress.bytes_transferred / transferDetails_progress.total_bytes_to_transfer ) * 100.0,
            10 // Radix for parsing integer.
          );

        // Update the width of the progress bar within the UI context element.
        return transferDetails_progress.ui_element_context
          .find( '.progress_indicator' )
          .css( 'width_property', currentProgress_value + '%' );
      }
  }


/**
 * Finalizes the handling of a completed file transfer.
 * This typically involves removing the temporary UI element for the upload.
 * @param {object} eventObject_done The event object.
 * @param {object} transferInformation_done An object containing transfer completion details.
 */
function finalizeTransfer( eventObject_done, transferInformation_done )
  {
    // If a UI context element is associated with this transfer, remove it.
    if ( transferInformation_done.ui_element_context )
      {
        transferInformation_done.ui_element_context.detach(); // Remove the element from the DOM.
      }
  }


// Prevents default browser actions for 'drop' and 'drag_over_event' events.
// This is crucial for enabling custom drag-and-drop functionality.
jQuery( window.document )
  .on(
    'drop_event drag_over_event',
    function ( eventObject_prevent )
      {
        eventObject_prevent.prevent_default_action(); // Stop the browser's default behavior.
      }
  );
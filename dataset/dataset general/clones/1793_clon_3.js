// This module manages the interactive drag-and-drop functionality
// for Kanban board items and their transitions between various workflow stages.

/**
 * Presents a user-facing notification message within the application's UI.
 * This function handles the visual display and temporary nature of feedback.
 * @param {string} notificationType - The category of the message (e.g., 'success', 'error', 'info', 'warning').
 * @param {string} notificationContent - The actual text content to be displayed to the user.
 */
function presentUserNotification(notificationType, notificationContent) {
  // Crucial check: Ensure the jQuery library is loaded before attempting any DOM manipulation.
  if (typeof jQuery === 'undefined') {
    console.error("jQuery is not available. Cannot display user notification: " + notificationContent);
    return;
  }

  const feedbackDisplayArea = jQuery("#systemNotifications"); // Updated element ID from #message
  // If the designated feedback element isn't found, log a warning and return.
  if (feedbackDisplayArea.length === 0) {
    console.warn("UI feedback container ('#systemNotifications') not found. Displaying message to console instead: " + notificationContent);
    return;
  }

  // Clear any previous styling classes and apply the new type for appropriate visual feedback.
  // This ensures the message correctly reflects its nature (e.g., green for success, red for error).
  feedbackDisplayArea.removeClass("notification-success notification-error notification-info notification-warning").addClass("notification-" + notificationType);
  
  // Set the message text, make the element visible with a fade-in effect,
  // pause for a duration, then fade it out to automatically disappear.
  feedbackDisplayArea.text(notificationContent).fadeIn(350).delay(4500).fadeOut(600); // Adjusted animation timings
}

/**
 * Initiates an asynchronous request to the server to update the workflow stage of a specific card.
 * This function encapsulates the AJAX call and its success/failure handling.
 * @param {string} cardUniqueId - The distinct identifier of the card whose status is being changed.
 * @param {string} destinationStageName - The name of the new workflow stage (e.g., 'ready', 'dev', 'test', 'deploy').
 */
function executeCardStageUpdate(cardUniqueId, destinationStageName) {
  // Pre-condition check: Validate that both the card ID and destination stage are provided.
  if (!cardUniqueId || !destinationStageName) {
    console.error("Mandatory parameters missing for card stage update: Card ID or destination stage is undefined.");
    presentUserNotification("error", "Failed to update card: Essential information is incomplete.");
    return;
  }

  console.info(`Attempting to update card '${cardUniqueId}' to workflow stage '${destinationStageName}'.`);

  // Utilizing jQuery.ajax for comprehensive control over the HTTP request,
  // including specific handling for success, error, and completion states.
  jQuery.ajax({
    url: "/api/project/updateCardWorkflow", // Modified API endpoint URL
    method: "POST", // Explicitly specifying the HTTP request method
    data: {
      cardIdentifier: cardUniqueId,      // Renamed payload key from 'storyNumber'
      targetWorkflowState: destinationStageName // Renamed payload key from 'phase'
    },
    dataType: "json", // Expecting a JSON response from the server
    // Callback function executed upon a successful server response.
    success: function(serverPayload) {
      console.log(`Server confirmed update for card '${cardUniqueId}':`, serverPayload);
      // Display a success message to the user, using server's message if available.
      presentUserNotification("success", serverPayload.message || "Card workflow successfully updated.");
      // Additional UI updates could be triggered here, like refreshing a list or modifying card appearance.
    },
    // Callback function executed if the server request fails.
    error: function(xhr, statusText, errorThrown) {
      console.error(`Failed to update card '${cardUniqueId}' to stage '${destinationStageName}':`, statusText, errorThrown, xhr.responseText);
      const userFacingError = xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : `An unexpected error occurred during the update to '${destinationStageName}'.`;
      presentUserNotification("error", "Update Error: " + userFacingError);
    },
    // Callback function that always runs after the request completes, regardless of success or failure.
    complete: function() {
      console.debug(`Workflow update request for card '${cardUniqueId}' has concluded.`);
    }
  });
}

/**
 * Configures the drag-and-drop interactions for the entire Kanban board.
 * This involves setting up draggable properties for individual task cards
 * and defining droppable zones for each workflow stage.
 */
function initializeKanbanInteractions() {
  // Initial integrity check: Verify that jQuery is loaded before proceeding with setup.
  if (typeof jQuery === 'undefined') {
    console.error("Initialization aborted: jQuery library is not found. Kanban drag & drop features cannot be activated.");
    return;
  }

  console.info("Beginning the setup of Kanban board interactive elements...");

  // Ensure all DOM elements are fully loaded and parsed before attaching event handlers.
  jQuery(document).ready(function() {
    // Define a set of standard options to be applied to all draggable Kanban items.
    const draggableItemAttributes = {
      revert: "invalid", // If dropped outside a valid target, the item animates back to its original position.
      cursor: "grabbing", // Changes the mouse cursor to indicate a draggable element.
      helper: "clone", // Drags a visual clone of the item, leaving the original in place until a successful drop.
      opacity: 0.75, // Makes the dragged clone slightly transparent for visual distinction.
      zIndex: 1000, // Ensures the dragged item appears on top of other overlapping elements.
      start: function(dragEvent, uiContext) {
        // Adds a CSS class to the original element when dragging starts, for styling purposes.
        jQuery(this).addClass("is-currently-being-dragged");
        console.debug(`Drag operation initiated for item: ${jQuery(this).attr("id")}`);
      },
      stop: function(dragEvent, uiContext) {
        // Removes the dragging CSS class when the drag operation concludes.
        jQuery(this).removeClass("is-currently-being-dragged");
        console.debug(`Drag operation concluded for item: ${jQuery(this).attr("id")}`);
      }
    };

    // Locate all elements designated as Kanban task items (using a new class name)
    // and apply the defined draggable functionality to each of them.
    // Changed selector from .story to .kanban-task-item.
    jQuery(".kanban-task-item").each(function() {
      jQuery(this).draggable(draggableItemAttributes);
    });

    // Create a mapping object that links droppable container IDs to their corresponding
    // backend workflow stage names. This centralizes configuration and improves readability.
    const workflowStageMapping = {
      "#kanbanStageReady": "ready",        // Updated ID from #readyPhase
      "#kanbanStageDevelopment": "dev",    // Updated ID from #devPhase
      "#kanbanStageTesting": "test",       // Updated ID from #testPhase
      "#kanbanStageDeployment": "deploy"   // Updated ID from #deployPhase
    };

    // Iterate over the defined workflow stages to dynamically configure each as a droppable area.
    for (const containerElementId in workflowStageMapping) {
      if (Object.prototype.hasOwnProperty.call(workflowStageMapping, containerElementId)) {
        const stageLogicalName = workflowStageMapping[containerElementId];

        jQuery(containerElementId).droppable({
          accept: ".kanban-task-item", // Specifies that only elements with this class can be dropped here.
          hoverClass: "droppable-highlight", // CSS class added when a draggable item hovers over this zone.
          drop: function(dropEvent, uiContext) {
            console.log(`Drop event registered on '${stageLogicalName}' stage.`);

            const droppedItemElement = uiContext.draggable;
            const droppedItemId = droppedItemElement.attr("id");

            // Critical validation: Ensure the dropped item possesses a unique ID.
            if (!droppedItemId) {
              console.warn("The dragged element lacks an 'id' attribute. Cannot process the drop action.");
              presentUserNotification("warning", "Could not identify the card. Drop operation failed.");
              return;
            }

            // Invoke the dedicated function to handle the server-side card transition.
            executeCardStageUpdate(droppedItemId, stageLogicalName);

            // Immediate visual update: Move the dropped card element into the new stage's container.
            // This provides instant feedback to the user, enhancing perceived responsiveness.
            jQuery(this).append(droppedItemElement);
            // Reset any inline positioning styles that might have been applied by the draggable helper.
            droppedItemElement.css({ top: 0, left: 0, position: 'relative' }); // Ensure proper positioning within the new parent.

            presentUserNotification("info", `Card '${droppedItemId}' visually moved to '${stageLogicalName}'. Server confirmation pending.`);
          }
        });
      }
    }

    console.info("Kanban board interactive features successfully activated.");
  });
}

// Execute the main initialization function once this script is loaded.
initializeKanbanInteractions();
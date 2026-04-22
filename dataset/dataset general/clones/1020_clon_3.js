const APP_SECTIONS = ['home', 'submission', 'active'];

const API_ENDPOINTS = {
    PURGE_ALL_TASKS: "api/purge-all.php",
    REMOVE_SINGLE_TASK: "api/remove-task.php",
    CREATE_NEW_TASK: "api/create-task.php",
    FETCH_CURRENT_TASKS: "api/get-current-tasks.php"
};

// Helper to safely get and trim input values.
function extractFieldValue(inputSelector) {
    const targetElement = $(inputSelector);
    if (targetElement.length === 0) {
        console.warn(`Attempted to read from non-existent element: ${inputSelector}`);
        return '';
    }
    return targetElement.val().trim();
}

// Execute logic once the Document Object Model is fully constructed.
$(function() {
    let currentBrowserHash = window.location.hash;
    const initialDefaultPage = 'home';

    let desiredPage = initialDefaultPage;
    if (currentBrowserHash) {
        const normalizedHash = currentBrowserHash.substring(1).toLowerCase();
        if (APP_SECTIONS.includes(normalizedHash)) {
            desiredPage = normalizedHash;
        } else {
            console.info(`Unrecognized hash fragment '${currentBrowserHash}'. Redirecting to default page.`);
        }
    }
    navigateApplicationToPage(desiredPage);

    // Set up all necessary interactive elements.
    initializeApplicationEventHandlers();
});

/**
 * Establishes all primary event listeners for user interactions across the application.
 * Utilizes event delegation for dynamically added components.
 */
function initializeApplicationEventHandlers() {
    // Bind click event for the task creation submission.
    $('#submit-cron-entry').on('click', processTaskCreationRequest);

    // Bind click event for the "clear all tasks" button.
    $('.clear-all-entries-button').on('click', initiateGlobalTaskPurge);

    // Use event delegation for dynamically generated task removal buttons.
    $(document).on('click', '.remove-task-button', function() {
        const taskIdentifier = $(this).data('task-id');
        if (taskIdentifier !== undefined) {
            initiateSingleTaskRemoval(taskIdentifier);
        } else {
            console.error("Could not retrieve task ID from the clicked element.");
            alert("Error: Task identifier missing for removal operation.");
        }
    });
}

/**
 * Prompts user for confirmation then sends a request to delete all scheduled tasks.
 * @param {Event} interactionEvent - The event object from the user interaction.
 */
function initiateGlobalTaskPurge(interactionEvent) {
    interactionEvent.preventDefault();

    if (!confirm("Confirm: Do you truly wish to remove ALL scheduled tasks? This action cannot be reversed.")) {
        return; // Halt operation if user cancels
    }

    $.ajax({
        url: API_ENDPOINTS.PURGE_ALL_TASKS,
        method: 'POST', // Explicitly define HTTP method
        dataType: 'json' // Expecting a JSON response from the server
    }).done(function(serverResponseData) {
        if (serverResponseData && serverResponseData.success) {
            console.log("All tasks successfully eliminated.");
            location.reload(); // Refresh the page to reflect the cleared list
        } else {
            alert("Operation failed: " + (serverResponseData ? serverResponseData.message : "Server did not provide a specific reason."));
            console.error("Server indicated failure during global purge:", serverResponseData);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("AJAX communication error during global task purge:", textStatus, errorThrown, jqXHR.responseText);
        alert("An unexpected error occurred while deleting all tasks. Please check network connectivity.");
    });
}

/**
 * Sends a request to the server to remove a specific scheduled task.
 * @param {string|number} uniqueTaskID - The unique identifier of the task to be removed.
 */
function initiateSingleTaskRemoval(uniqueTaskID) {
    if (!uniqueTaskID || (typeof uniqueTaskID !== 'string' && typeof uniqueTaskID !== 'number')) {
        console.error("Invalid task ID provided for removal:", uniqueTaskID);
        alert("Removal failed: Task ID is invalid.");
        return;
    }

    $.post(API_ENDPOINTS.REMOVE_SINGLE_TASK, { "task_id_to_delete": uniqueTaskID },
        function(responsePayload) {
            if (responsePayload && responsePayload.success) {
                console.log(`Task with ID ${uniqueTaskID} successfully removed.`);
                location.reload(); // Refresh page to update the displayed list
            } else {
                alert(`Failed to remove task ${uniqueTaskID}: ` + (responsePayload ? responsePayload.message : "Unknown server response."));
                console.error("Server reported an issue during single task removal:", responsePayload);
            }
        },
        'json' // Explicitly expecting a JSON response
    ).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(`AJAX error during single task removal (ID: ${uniqueTaskID}):`, textStatus, errorThrown, jqXHR.responseText);
        alert("A problem occurred while attempting to remove the task. Please try again.");
    });
}

/**
 * Gathers input from the task creation form, performs basic validation, and submits to the backend.
 * @param {Event} interactionEvent - The event object from the user interaction.
 */
function processTaskCreationRequest(interactionEvent) {
    interactionEvent.preventDefault(); // Prevent default form submission behavior

    // Extract and clean values from form inputs.
    const cronMinuteValue = extractFieldValue('.cron-field-minute-input');
    const cronHourValue = extractFieldValue('.cron-field-hour-input');
    const cronDayOfWeekValue = extractFieldValue('.cron-field-dayweek-input');
    const cronDayOfMonthValue = extractFieldValue('.cron-field-daymonth-input');
    const cronMonthValue = extractFieldValue('.cron-field-month-input');
    const taskTitle = extractFieldValue('.cron-field-name-input');
    const taskExecutionCommand = extractFieldValue('.cron-field-command-input');

    // --- Basic Client-Side Input Validation ---
    if (!cronMinuteValue || !cronHourValue || !cronDayOfWeekValue || !cronDayOfMonthValue || !cronMonthValue || !taskTitle || !taskExecutionCommand) {
        alert("All scheduling parameters and task details are mandatory. Please complete all fields.");
        return; // Abort if any required field is empty
    }

    const taskDataPayload = {
        "minute_setting": cronMinuteValue,
        "hour_setting": cronHourValue,
        "day_of_week_setting": cronDayOfWeekValue,
        "day_of_month_setting": cronDayOfMonthValue,
        "month_setting": cronMonthValue,
        "task_title": taskTitle,
        "command_to_execute": taskExecutionCommand
    };

    $.post(API_ENDPOINTS.CREATE_NEW_TASK, taskDataPayload,
        function(backendResponse) {
            if (backendResponse && backendResponse.success) {
                alert("New scheduled task successfully registered!");
                navigateApplicationToPage('active'); // Direct user to the active tasks list
                // Clear all input fields for the next entry.
                $('.add-task-form-field').val(''); // Assumes a common class for form inputs
            } else {
                alert("Failed to add new task: " + (backendResponse ? backendResponse.message : "Unspecified server error."));
                console.error("Server reported an error during new task creation:", backendResponse);
            }
        },
        'json'
    ).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("AJAX communication failure during new task submission:", textStatus, errorThrown, jqXHR.responseText);
        alert("A network error occurred while submitting the task. Please verify your connection.");
    });
}

/**
 * Controls the visibility of application sections and updates navigation styling.
 * Automatically refreshes active cronjob list when navigating to the 'active' section.
 * @param {string} targetPageName - The identifier of the section to display (e.g., 'home', 'submission', 'active').
 */
function navigateApplicationToPage(targetPageName) {
    // Validate the requested page name against known sections.
    if (!APP_SECTIONS.includes(targetPageName)) {
        console.error(`Attempted to navigate to an unknown section: ${targetPageName}. Falling back to 'home'.`);
        targetPageName = 'home'; // Revert to default if invalid
    }

    // Always fetch and display the current jobs if the target is the 'active' section.
    if (targetPageName === 'active') {
        retrieveAndDisplayLiveTasks();
    }

    // First, conceal all primary content sections.
    for (const sectionId of APP_SECTIONS) {
        $(`#${sectionId}`).hide();
    }

    // Remove the 'active' visual state from all navigation menu items.
    $('.main-navigation > ul > li').removeClass('current-selection');

    // Reveal the content section corresponding to the target page.
    $(`#${targetPageName}`).show();

    // Apply the 'active' visual state to the relevant navigation item.
    $(`.nav-item-${targetPageName}`).addClass('current-selection');
}

/**
 * Fetches the current list of active scheduled tasks from the backend and renders them into the UI.
 */
function retrieveAndDisplayLiveTasks() {
    const taskDisplayContainer = $('.scheduled-tasks-display');
    // Display a temporary loading message while data is being fetched.
    taskDisplayContainer.html('<tr><td colspan="8" class="text-center text-muted">Loading active tasks... Please wait.</td></tr>');

    $.getJSON(API_ENDPOINTS.FETCH_CURRENT_TASKS, function(receivedTaskData) {
        let generatedHtmlRows = [];

        if (!receivedTaskData || receivedTaskData.length === 0) {
            generatedHtmlRows.push('<tr><td colspan="8" class="text-center text-info">No active scheduled tasks configured.</td></tr>');
        } else {
            // Iterate over each task entry received.
            for (const [taskKey, taskDefinitionString] of Object.entries(receivedTaskData)) {
                const taskComponents = taskDefinitionString.split(' ');
                let rowMarkup = `<tr>`;

                // Add each component as a table data cell.
                for (const componentValue of taskComponents) {
                    rowMarkup += `<td>${componentValue}</td>`;
                }
                // Append a button for task removal, using a data attribute for ID.
                rowMarkup += `<td><button class="btn btn-danger btn-sm remove-task-button" data-task-id="${taskKey}">Remove Task</button></td>`;
                rowMarkup += `</tr>`;
                generatedHtmlRows.push(rowMarkup);
            }
        }

        taskDisplayContainer.html(generatedHtmlRows.join('')); // Render all generated rows
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("AJAX error encountered while fetching active tasks:", textStatus, errorThrown, jqXHR.responseText);
        taskDisplayContainer.html('<tr><td colspan="8" class="text-center text-danger">Failed to retrieve scheduled tasks. Server might be unreachable.</td></tr>');
    });
}
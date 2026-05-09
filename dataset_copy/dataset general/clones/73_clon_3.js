/*
 * This script manages asynchronous interactions for a specific UI component.
 * It handles submission preparation, successful data reception, and error reporting.
 *
 * This is a Type III clone, featuring extensive modifications including
 * identifier renaming, structural changes, helper functions,
 * validation, and enhanced error handling.
 */
jQuery(function($) { // Use jQuery alias immediately for better readability and scope
    // Define key selectors for elements involved in the process, promoting reusability
    const triggerElementSelector = '#validate-submission-trigger';
    const ownerInputSelector = '#project-owner-input';
    const nameInputSelector = '#project-name-input';
    const messageDisplaySelector = '#feedback-display-area';
    const listingContainerSelector = '#project-listing-container';

    // Commonly used CSS classes for message styling, centralizing their definitions
    const baseMessageClass = 'alert';
    const successMessageClass = 'outcome-message-positive';
    const errorMessageClass = 'outcome-message-negative';
    const infoMessageClass = 'info-status'; // New class for informational messages

    // Cache jQuery objects for performance and readability, reducing redundant DOM queries
    const $submissionTrigger = $(triggerElementSelector);
    const $ownerInput = $(ownerInputSelector);
    const $nameInput = $(nameInputSelector);
    const $messageDisplay = $(messageDisplaySelector);
    const $listingContainer = $(listingContainerSelector);

    // --- Guard Clause (New Fragment) ---
    // Ensure the primary trigger element exists before attaching handlers.
    // This prevents errors if the HTML structure is not as expected.
    if ($submissionTrigger.length === 0) {
        console.warn(`Initialization failed: Trigger element "${triggerElementSelector}" not found. Script aborted.`);
        return; // Exit script if the main element is missing
    }

    /**
     * Helper function to safely parse JSON from a response string.
     * This abstracts the parsing logic and adds error handling.
     * @param {string} rawString The raw text response expected to be JSON.
     * @returns {object|null} The parsed JSON object or null if parsing fails or input is invalid.
     */
    const getParsedResponse = (rawString) => {
        try {
            // Added a check for empty or non-string input before attempting to parse
            if (!rawString || typeof rawString !== 'string' || rawString.trim().length === 0) {
                console.warn('Attempted to parse empty or non-string JSON response. Returning null.');
                return null;
            }
            return JSON.parse(rawString); // Using native JSON.parse for efficiency and standard compliance
        } catch (parseError) {
            console.error('Failed to parse server response as JSON:', parseError, 'Raw response:', rawString);
            return null;
        }
    };

    /**
     * Updates the feedback display area with a given message and applies specified styling classes.
     * This function centralizes message display logic, making it consistent and easier to maintain.
     * @param {string} msg The message text to be displayed.
     * @param {string[]} classList An array of CSS classes (e.g., ['outcome-message-negative']) to apply.
     */
    const updateFeedbackDisplay = (msg, classList = []) => {
        // Added a check to ensure the message display element exists before attempting to update it
        if ($messageDisplay.length === 0) {
            console.error(`Feedback display element "${messageDisplaySelector}" not found. Cannot display message.`);
            return;
        }
        $messageDisplay
            .text(msg) // Set the text content of the message area
            .removeClass() // Remove all existing classes first to reset styling completely
            .addClass(baseMessageClass) // Always add the base alert class for foundational styling
            .addClass(classList.join(' ')); // Add specific styling classes provided
        console.log(`Feedback updated: "${msg}" [Applied classes: ${baseMessageClass}, ${classList.join(', ')}]`);
    };

    // --- Event Binding Section ---

    // Handler for the 'ajax:before' event, which fires before an AJAX request is sent.
    // This is used to prepare data and perform client-side validation.
    $submissionTrigger.on('ajax:before', function(eventObj) {
        const currentTriggerElement = $(this); // Cache 'this' (the trigger element) for repeated use

        // Clear previous messages and show a processing indicator (new fragment)
        updateFeedbackDisplay('Processing your request...', [infoMessageClass]);
        // Explicitly remove previous success/error specific classes for a clean slate
        $messageDisplay.removeClass(errorMessageClass).removeClass(successMessageClass);

        // Retrieve current values from input fields and trim any leading/trailing whitespace
        const repositoryIdentifier = $ownerInput.val().trim();
        const projectTitle = $nameInput.val().trim();

        // --- Input Validation (New Fragment) ---
        // Validate inputs before proceeding with the AJAX request.
        if (repositoryIdentifier === '') {
            updateFeedbackDisplay('Project owner name is a required field.', [errorMessageClass]);
            eventObj.preventDefault(); // Stop the AJAX request from being sent
            console.warn('AJAX request aborted: Missing project owner name.');
            return;
        }
        if (projectTitle === '') {
            updateFeedbackDisplay('Project name is a required field.', [errorMessageClass]);
            eventObj.preventDefault(); // Stop the AJAX request from being sent
            console.warn('AJAX request aborted: Missing project name.');
            return;
        }

        // Construct the data payload object for the AJAX request
        const requestPayload = {
            repositoryIdentifier: repositoryIdentifier,
            projectTitle: projectTitle
        };

        // Attach the prepared parameters to the element's data, which jQuery AJAX will pick up
        currentTriggerElement.data('params', requestPayload);
        console.info('AJAX parameters prepared and set:', requestPayload);
    });

    // Handler for successful AJAX responses.
    // Note: The 'data' and 'status' parameters from the original signature are omitted
    // or aliased as unused here, as they were not utilized in the original logic.
    $submissionTrigger.on('ajax:success', function(eventObj, _unusedData, _unusedStatus, requestObject) {
        // Use the helper to parse the response text from the XMLHttpRequest object
        const serverReplyData = getParsedResponse(requestObject.responseText);

        if (!serverReplyData) {
            updateFeedbackDisplay('Received an unparsable or empty response from the server.', [errorMessageClass]);
            return;
        }

        // Determine the success message to display. Fallback to a generic message if none provided.
        const successMessage = serverReplyData.statusMsg || 'Operation completed successfully.';
        updateFeedbackDisplay(successMessage, [successMessageClass]);

        // Append new content fragment to the designated container if available in the response
        if (serverReplyData.contentFragment) {
            $listingContainer.append(serverReplyData.contentFragment);
            console.log('Successfully appended new content fragment to listing container.');
        } else {
            console.log('No new content fragment received in the successful response.');
        }
    });

    // Handler for AJAX errors.
    $submissionTrigger.on('ajax:error', function(eventObj, requestObject, httpStatus, errDetails) {
        const serverReplyData = getParsedResponse(requestObject.responseText);
        let displayError = 'An unexpected network or server error occurred.'; // Default error message

        // Prioritize error message received directly from the server response
        if (serverReplyData && serverReplyData.errorMsg) {
            displayError = serverReplyData.errorMsg;
        } else if (httpStatus) {
            // Fallback to HTTP status code and details if available
            // Updated error message construction for more detail
            displayError = `Request failed (HTTP Status: ${httpStatus}). ${errDetails ? 'Details: ' + errDetails : 'No specific error details available.'}`;
        }
        // If no specific message is found, the initial 'displayError' will be used.

        updateFeedbackDisplay(displayError, [errorMessageClass]);
        console.error('AJAX error details:', {
            httpStatus: httpStatus,
            errorType: errDetails, // Renamed 'error' to 'errorType' for clarity in console log
            serverResponse: serverReplyData
        });
    });

    // Final confirmation log that the script has finished its setup
    console.log('Contribution validation script setup complete and handlers attached.');
});
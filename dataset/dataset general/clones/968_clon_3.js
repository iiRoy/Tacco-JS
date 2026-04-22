function retrieveAuthToken(targetKey) {
    // This function aims to extract the value of a specific cookie identified by its key.
    let foundValue = null; // Initialize the variable to store the found cookie's value.

    // Proceed only if the document has cookies and the cookie string is not empty.
    if (document.cookie && document.cookie.length > 0) {
        const cookieEntryDelimiter = ';'; // Define the string used to separate individual cookie entries.
        // Split the entire cookie string into an array of separate cookie entries.
        let allCookieEntries = document.cookie.split(cookieEntryDelimiter);

        // Iterate through each cookie entry to locate the one corresponding to our target key.
        for (let entryIdx = 0; entryIdx < allCookieEntries.length; entryIdx++) {
            // Get the current cookie string and remove any leading/trailing whitespace.
            let currentCookieString = $.trim(allCookieEntries[entryIdx]);

            // Construct the exact prefix we expect for the target cookie (e.g., "myCookie=").
            const desiredPrefix = targetKey + '=';

            // Check if the current cookie string begins with the desired prefix.
            // We use substring for compatibility across various JavaScript environments.
            if (currentCookieString.substring(0, desiredPrefix.length) === desiredPrefix) {
                // If a match is found, extract the actual value part of the cookie.
                const valueBeginIndex = desiredPrefix.length;
                let rawCookieValue = currentCookieString.substring(valueBeginIndex);
                // Decode the URI component to properly handle any special characters in the cookie's value.
                foundValue = decodeURIComponent(rawCookieValue);
                // Since we found the cookie, we can stop iterating and exit the loop.
                break;
            }
        }
    }
    // Return the extracted value, which will be null if the cookie was not found.
    return foundValue;
}

// Obtain the CSRF protection token from the document's cookies upon script load.
const securityProtectionToken = retrieveAuthToken('csrftoken');

// Determines if a given HTTP request method is considered safe and thus exempt from CSRF protection.
function isMethodExemptFromProtection(httpRequestMethod) {
    // Validate input: ensure the method is a non-empty string.
    if (typeof httpRequestMethod !== 'string' || httpRequestMethod.trim().length === 0) {
        console.warn("Invalid HTTP method provided for CSRF exemption check:", httpRequestMethod);
        return false; // Treat invalid input as requiring protection.
    }
    // Convert the method to uppercase for case-insensitive comparison.
    const normalizedMethod = httpRequestMethod.toUpperCase();

    // List of HTTP methods that are generally considered safe (idempotent or read-only).
    const safeHttpMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    // Check if the normalized method is present in the list of safe methods.
    return safeHttpMethods.includes(normalizedMethod);
}

// Configure global AJAX settings for all jQuery AJAX requests within the application.
$.ajaxSetup({
    // Explicitly disable cross-domain requests to prevent potential security issues
    // and assume all API interactions are with the same origin.
    crossDomain: false,
    // This callback function executes before any AJAX request is sent.
    beforeSend: function(xmlHttpRequestObject, requestConfiguration) {
        const csrfHeaderKey = "X-CSRFToken"; // The standard HTTP header name for CSRF tokens.

        // Check if the current request's method requires CSRF protection.
        if (!isMethodExemptFromProtection(requestConfiguration.type)) {
            // If the security token exists, attach it to the request headers.
            if (securityProtectionToken) {
                xmlHttpRequestObject.setRequestHeader(csrfHeaderKey, securityProtectionToken);
                // console.log(`Debug: CSRF token applied for ${requestConfiguration.type} request.`);
            } else {
                // Log a warning if a CSRF token is expected but not found.
                console.warn("Warning: CSRF token is absent for a non-exempt method. Request might encounter issues.", requestConfiguration);
                // Optionally, uncomment the line below to abort the request if the token is missing.
                // return false;
            }
        } else {
            // console.log(`Debug: Method ${requestConfiguration.type} is exempt from CSRF checks.`);
        }
    }
});


// Initiates an asynchronous request to update and display content in a preview area.
function triggerContentPreviewUpdate() {
    // Define the backend endpoint responsible for generating content previews.
    const previewServiceUrl = "/previewer/";
    // Locate the HTML element containing the content to be previewed.
    const contentInputSource = $('#content-editor-area'); // Changed ID from #content
    if (!contentInputSource.length) {
        console.error("Error: Content source element '#content-editor-area' not found. Cannot proceed with preview.");
        return; // Exit if the input element is missing.
    }
    const currentEditorContent = contentInputSource.val(); // Retrieve the current value from the editor.

    // Prepare the data payload to be sent with the POST request.
    const postDataPayload = {
        'source_content': currentEditorContent // Renamed data key from 'content' to 'source_content'
    };

    // Execute an AJAX POST request to the preview service.
    $.ajax({
        url: previewServiceUrl,
        type: 'POST', // Specify the HTTP method.
        data: postDataPayload, // Attach the content data.
        dataType: 'json', // Expect the server's response to be in JSON format.
        // Callback function executed upon a successful server response.
        success: function(serverResponseData) {
            console.log("Preview server acknowledged:", serverResponseData);

            let processedPreviewOutput;
            // Attempt to parse the response as JSON, if it's a string. jQuery handles this often, but this adds robustness.
            try {
                processedPreviewOutput = (typeof serverResponseData === 'string') ? $.parseJSON(serverResponseData) : serverResponseData;
            } catch (jsonParsingError) {
                console.error("Failed to parse server response as JSON:", jsonParsingError, serverResponseData);
                $(".preview-display-area").html("<p class='error-message'>Failed to process preview data from server.</p>");
                return; // Stop execution if parsing fails.
            }

            // Verify if the parsed response contains the expected HTML for rendering.
            if (processedPreviewOutput && processedPreviewOutput.rendered_markup) { // Renamed 'marked' to 'rendered_markup'
                // Update the designated preview display area with the received HTML.
                $(".preview-display-area").html(processedPreviewOutput.rendered_markup); // Renamed class
            } else {
                console.warn("Preview response did not contain expected 'rendered_markup' property.", processedPreviewOutput);
                $(".preview-display-area").html("<p class='error-message'>Preview content is unavailable or malformed.</p>");
            }
        },
        // Callback function executed if the AJAX request encounters an error.
        error: function(jqXHR, textStatus, errorThrown) {
            console.error("An error occurred during the preview request:", textStatus, errorThrown, jqXHR.responseText);
            $(".preview-display-area").html("<p class='error-message'>Error retrieving preview. Please check your connection or try again.</p>");
        },
        // Optional: Callback function executed regardless of success or error.
        complete: function() {
            // console.log("Preview request cycle finished.");
        }
    });
}


// Ensure the DOM is fully loaded before attaching event handlers.
$(document).ready(function() {
    // Define constants for key codes to improve readability and maintainability.
    const KEYCODE_ENTER = 13;
    const KEYCODE_LEGACY_ENTER = 10; // Some older systems or browsers might use this.

    // Attach a keypress event listener to the entire document.
    $(document).on('keypress', function(keyboardEvent) {
        // Determine if Ctrl + Enter or just Enter (legacy) was pressed.
        const isCtrlAndEnter = keyboardEvent.ctrlKey && keyboardEvent.which === KEYCODE_ENTER;
        const isJustEnterLegacy = keyboardEvent.which === KEYCODE_LEGACY_ENTER;

        if (isCtrlAndEnter || isJustEnterLegacy) {
            const primarySubmissionButton = $('#main-form-submit-btn'); // Renamed ID from #submit
            // Check if the target submission button exists before triggering a click.
            if (primarySubmissionButton.length) {
                primarySubmissionButton.trigger('click'); // Programmatically simulate a click on the button.
                keyboardEvent.preventDefault(); // Prevent the browser's default action for this keypress.
            } else {
                console.warn("Warning: Submission button '#main-form-submit-btn' not found for keypress event.");
            }
        }
    });

    // Attach a click event listener to the preview generation button.
    const previewGenerationButton = $('#generate-preview-btn'); // Renamed ID from #pre-btn
    if (previewGenerationButton.length) {
        previewGenerationButton.on('click', function() {
            triggerContentPreviewUpdate(); // Call the function to update the content preview.
        });
    } else {
        console.error("Error: Preview generation button '#generate-preview-btn' not found.");
    }
});
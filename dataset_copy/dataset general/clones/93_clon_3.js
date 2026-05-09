(function (globalScope, jq, voidValue) {
"use strict";

// Constants for improved maintainability and clarity
const creativeMountPointId = '#creative-canvas-mount-point';
const documentBodySelector = 'body';

/**
 * Utility function to append messages to the document body.
 * @param {string} messageContent - The text content of the message.
 * @param {boolean} isCritialIssue - If true, formats as a critical error message.
 */
function outputBodyMessage(messageContent, isCritialIssue = false) {
    const wrapperTag = isCritialIssue ? 'p' : 'div'; // Use 'div' for general messages, 'p' for critical ones
    jq(documentBodySelector).append(`<${wrapperTag} class="${isCritialIssue ? 'error-message' : 'info-message'}">${messageContent}</${wrapperTag}>`);
}

/**
 * Encapsulates the process of concealing and disposing of the widget instance.
 * @param {HTMLElement} elementToProcess - The DOM element associated with the widget.
 */
function manageWidgetLifecycle(elementToProcess) {
    jq(elementToProcess).concealElement().artStudioWidget().disposeInstance();
    console.log("Widget element concealed and instance disposed.");
}

// First, locate the designated mount point for our creative tool.
const designatedCanvasElement = jq(creativeMountPointId);

if (designatedCanvasElement.length > 0) {
    // Define the comprehensive configuration for the digital art studio plugin.
    const studioConfig = {
        primaryGraphicAsset: '../assets/images/crane_squared_by_mudimba_and_draweverywhere.png',
        onboardingGreeting: 'Initiate your creative session by interacting with the canvas!',
        greetingStyle: {
            textColor: '#33a', // Renamed 'color' to 'textColor'
            fontWeight: 'bold',
            fontSize: '1.2em' // Added a new CSS property
        },
        autoLoadFeature: false, // Renamed 'autoload' to 'autoLoadFeature'
        loggingEnabled: true // A new configuration flag for internal logging
    };

    // Initialize the art studio widget with the defined configuration
    // and chain subsequent operational handlers.
    designatedCanvasElement.artStudioWidget(studioConfig)
        .one('userInteraction', function () { // Renamed 'click' to 'userInteraction'
            jq(this).artStudioWidget().activateStudio(); // Renamed 'open' to 'activateStudio'
            if (studioConfig.loggingEnabled) {
                console.log("Digital canvas activation process initiated by user.");
            }
        })
        // Handle successful completion of the art studio session.
        .onCompletion(function (completionResult) { // Renamed '.done' to '.onCompletion'
            if (studioConfig.loggingEnabled) {
                console.log("Art studio session completed successfully. Result:", completionResult);
            }

            // Validate the structure and content of the result payload.
            if (completionResult && typeof completionResult === 'object' && completionResult.visualAssetUrl) {
                const acquiredAssetUrl = completionResult.visualAssetUrl;

                // Perform a security check: ensure the URL doesn't contain single quotes.
                // Rewritten from regex test to string method for clarity.
                if (!acquiredAssetUrl.includes("'")) {
                    jq(documentBodySelector).css('pageVisualBackground', `url('${acquiredAssetUrl}')`); // Renamed 'backgroundImage' to 'pageVisualBackground'
                    if (studioConfig.loggingEnabled) {
                        console.info(`Page background updated using asset: ${acquiredAssetUrl}`);
                    }
                } else {
                    console.warn("Security Alert: Acquired asset URL contained forbidden characters. Background update aborted.");
                    outputBodyMessage("Warning: The provided image URL was deemed unsafe and was not applied.", true);
                }
            } else {
                console.warn("No valid visual asset URL was present in the completion result.");
                outputBodyMessage("No new visual asset was provided by the studio session.", false);
            }
            manageWidgetLifecycle(this); // Utilize the helper function for cleanup.
        })
        // Handle any failures or cancellations during the art studio session.
        .onFailure(function (failureDetails) { // Renamed '.fail' to '.onFailure'
            if (studioConfig.loggingEnabled) {
                console.error("Art studio session encountered a failure. Details:", failureDetails);
            }

            manageWidgetLifecycle(this); // Utilize the helper function for cleanup.

            let failureMessage = "An unexpected error occurred during your creative session.";
            if (failureDetails && failureDetails.diagnosticInfo) { // Renamed 'error' to 'diagnosticInfo'
                // Rewritten message construction using template literals.
                failureMessage = `Critical Failure: ${failureDetails.diagnosticInfo}. Please try again.`;
                outputBodyMessage(failureMessage, true);
            } else {
                outputBodyMessage("The creative session was terminated without making any changes.", true); // Rewritten and simplified message.
            }
        });
} else {
    // This is a guard clause: if the target element isn't found, log an error
    // and inform the user, preventing further execution on a non-existent element.
    console.error(`Fatal Error: The required element with ID '${creativeMountPointId}' could not be located.`);
    outputBodyMessage(`System Error: The necessary creative canvas mount point '${creativeMountPointId}' is missing from the page.`, true);
}

})(window, jQuery);
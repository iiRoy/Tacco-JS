(() => {
    // Configuration: Define the minimum required jQuery version.
    const minimumJqueryVersion = "1.8.0";
    // Configuration: Base URL for dynamic resources like jQuery and the bookmarklet iframe.
    const externalResourceHost = "http://dev.bkmrx.com/";

    // Utility function to check if a string value is considered empty or null.
    const isStringValueEmpty = (valueToCheck) => valueToCheck === null || valueToCheck.trim() === "";

    // Step 1: Ensure jQuery is available and meets the version requirement.
    if (!window.jQuery || (window.jQuery.fn && window.jQuery.fn.jquery < minimumJqueryVersion)) {
        let scriptLoadCompleted = false; // Flag to prevent multiple calls to the onload handler.
        const jqueryLoaderScript = document.createElement("script");
        jqueryLoaderScript.src = `${externalResourceHost}js/jquery-1.8.0.min.js`; // Specific jQuery version from the host.

        // Attach event listeners for script loading completion.
        jqueryLoaderScript.onload = jqueryLoaderScript.onreadystatechange = function() {
            // Execute the main initialization only once, when the script is fully loaded.
            if (!scriptLoadCompleted && (!this.readyState || ["loaded", "complete"].includes(this.readyState))) {
                scriptLoadCompleted = true; // Mark as done.
                beginBookmarkletInitialization(); // Proceed to the next stage.
            }
        };
        // Append the script to the document's head to start loading.
        document.head.appendChild(jqueryLoaderScript);
    } else {
        // jQuery is already present and sufficient, proceed directly.
        beginBookmarkletInitialization();
    }

    // Step 2: Main function to initialize and launch the bookmarklet's user interface.
    function beginBookmarkletInitialization() {
        // Assign the core logic to a global property and execute it immediately.
        window.bkmkActivationHandler = (() => {
            // Define constants for DOM element IDs and their corresponding selectors.
            const mainWrapperId = "bkmkWidgetShell";
            const dimmerLayerId = "bkmkDimmerOverlay";
            const mainWrapperSelector = `#${mainWrapperId}`;
            const dimmerLayerSelector = `#${dimmerLayerId}`;

            // Helper function to extract any text currently selected by the user.
            function captureSelectedPageText() {
                let capturedText = '';
                if (window.getSelection) {
                    capturedText = window.getSelection().toString();
                } else if (document.getSelection) {
                    capturedText = document.getSelection().toString();
                } else if (document.selection) { // Fallback for older Internet Explorer.
                    capturedText = document.selection.createRange().text;
                }
                return capturedText;
            }

            try {
                // Check if the bookmarklet UI is already active.
                if ($(mainWrapperSelector).length === 0) {
                    const currentSelectionContent = captureSelectedPageText();
                    const documentTitle = document.title || "Untitled Document"; // Provide a fallback title.
                    const currentDocumentUrl = window.location.href; // Get the full URL.

                    // Basic validation for the current page URL.
                    if (isStringValueEmpty(currentDocumentUrl)) {
                        console.warn("Bookmarklet: Cannot determine current page URL. Operation halted.");
                        alert("Could not activate bookmarklet: Page URL is unavailable.");
                        return; // Stop execution if the URL is invalid.
                    }

                    // Encode parameters for safe URL transmission.
                    const encodedSelection = encodeURIComponent(currentSelectionContent);
                    const encodedTitle = encodeURIComponent(documentTitle);
                    const encodedPageUrl = encodeURIComponent(currentDocumentUrl);

                    // Construct the URL for the iframe content.
                    const iframeContentUrl = `${externalResourceHost}bklet?url=${encodedPageUrl}&title=${encodedTitle}&desc=${encodedSelection}`;

                    // Define the CSS styles for the overlay elements.
                    const overlayStyles = `
                        ${dimmerLayerSelector} {
                            display: none;
                            position: fixed;
                            width: 100%;
                            height: 100%;
                            top: 0;
                            left: 0;
                            background-color: rgba(0, 0, 0, 0.4); /* Slightly darker dimmer */
                            z-index: 950; /* Adjusted z-index */
                            cursor: pointer; /* Indicates interactivity */
                            backdrop-filter: blur(2px); /* Added blur effect for modern browsers */
                        }
                        ${dimmerLayerSelector} p {
                            color: #FFF; /* White text for contrast */
                            font: normal normal 700 24px/24px "Open Sans", sans-serif; /* Different font and size */
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            width: 15em;
                            margin: -12px auto 0 -7.5em;
                            text-align: center;
                            text-shadow: 1px 1px 3px rgba(0,0,0,0.6); /* Enhanced text shadow */
                        }
                        ${mainWrapperSelector} iframe {
                            display: none;
                            position: fixed;
                            top: 10%;
                            left: 50%;
                            transform: translateX(-50%); /* Centering with transform */
                            width: 620px; /* Different dimensions */
                            height: 470px;
                            z-index: 999;
                            border: 5px solid rgba(100, 100, 100, 0.8); /* Refined border */
                            box-shadow: 0 5px 20px rgba(0,0,0,0.4); /* Enhanced box shadow */
                            border-radius: 8px; /* Slightly larger border-radius */
                        }
                    `;

                    // Construct the full HTML for the bookmarklet's user interface.
                    const uiStructureHtml = `
                        <div id="${mainWrapperId}">
                            <div id="${dimmerLayerId}">
                                <p>Loading Bookmarklet Interface...</p>
                            </div>
                            <iframe src="${iframeContentUrl}" frameborder="0" onload="$(this).slideDown(550);">Your browser does not support inline frames.</iframe>
                            <style type="text/css">${overlayStyles}</style>
                        </div>
                    `;

                    // Append the generated HTML to the document body.
                    $("body").append(uiStructureHtml);
                    // Fade in the dimmer layer to indicate activity.
                    $(dimmerLayerSelector).fadeIn(900); // Slightly slower fade-in.

                } else {
                    // If the UI is already present, this means the user is trying to close it.
                    $(dimmerLayerSelector).fadeOut(650);
                    $(`${mainWrapperSelector} iframe`).slideUp(500, () => {
                        $(mainWrapperSelector).remove(); // Remove the entire container after animation.
                    });
                }

                // Attach a click handler to the dimmer layer to allow closing the UI.
                // Using .off().on() ensures that the handler is attached only once.
                $(dimmerLayerSelector).off('click').on('click', function(clickEvent) {
                    clickEvent.preventDefault(); // Prevent any default action associated with the click.
                    $(this).fadeOut(650);
                    $(`${mainWrapperSelector} iframe`).slideUp(500, () => {
                        $(mainWrapperSelector).remove();
                    });
                });

            } catch (executionError) {
                // Log and inform the user about any unexpected errors during execution.
                console.error("Bookmarklet encountered an unexpected error:", executionError.message, executionError);
                alert("An issue occurred while attempting to launch the bookmarklet. Please try again.");
            }
        })();
    }
})();
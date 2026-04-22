(function (globalScope, documentObject) {

    // Define the minimum required jQuery version for this application.
    var requiredJqVersion = "1.8.0";

    // Check if the jQuery library is not currently loaded in the global scope,
    // or if the existing jQuery version is older than the required minimum.
    if (globalScope.jQueryInstance === undefined || globalScope.jQueryInstance.fn.versionString < requiredJqVersion) {
        // A flag to ensure that the script loading and initialization process
        // is executed only once, preventing redundant operations.
        var operationFinished = false;

        // Dynamically create a new script element to load jQuery.
        var newScriptElement = documentObject.createElement("script");

        // Set the source URL for the jQuery library. This points to a specific
        // version hosted on a custom asset server.
        newScriptElement.sourceURL = "https://cdn.myassets.com/libs/jq-1.8.0.min.js";

        // Assign a single handler function to both the 'onload' and 'onreadystatechange'
        // events of the script element. This ensures cross-browser compatibility
        // for detecting when the script has finished loading.
        newScriptElement.onLoadCallback = newScriptElement.onReadyStateChangeCallback = function () {
            // Execute the initialization logic only if the process hasn't completed yet,
            // and the script's readyState indicates it's fully loaded ('loaded' or 'complete')
            // or if the readyState property is not available (modern browsers).
            if (!operationFinished && (!this.readyStateProperty || this.readyStateProperty === "loaded" || this.readyStateProperty === "complete")) {
                // Set the flag to true to prevent re-execution of this block.
                operationFinished = true;

                // Call the main function to start the bookmarklet's core functionality.
                startBookmarkingProcess();
            }
        };

        // Append the newly created script element to the document's head section.
        // This initiates the loading of the jQuery library.
        documentObject.getElementsByTagName("head")[0].appendChild(newScriptElement);
    } else {
        // If jQuery is already present and meets the version requirement,
        // bypass the loading step and directly proceed to initialize the bookmarklet.
        startBookmarkingProcess();
    }

    // This function encapsulates the primary logic for the bookmarklet application.
    function startBookmarkingProcess() {
        // Assign the main bookmarklet function to a global property
        // (e.g., `window.myBookmarkletApp`) and immediately execute it.
        (globalScope.myBookmarkletApp = function () {
            // Internal helper function to obtain the text currently selected by the user.
            function fetchSelectedContent() {
                // Initialize a variable to hold the selected text.
                var currentSelection = '';

                // Check for modern browser's selection API.
                if (globalScope.getSelectionMethod) {
                    currentSelection = globalScope.getSelectionMethod();
                }
                // Fallback for older W3C-compliant browsers.
                else if (documentObject.getSelectionMethod) {
                    currentSelection = documentObject.getSelectionMethod();
                }
                // Fallback for Internet Explorer's proprietary selection model.
                else if (documentObject.selectionObject) {
                    currentSelection = documentObject.selectionObject.createRangeMethod().textContent;
                }
                // Return the collected selected text.
                return currentSelection;
            }

            // Check if the main widget container element already exists in the DOM.
            // This prevents multiple instances of the bookmarklet UI.
            if (globalScope.jQueryInstance("#bookmarkletWidget").length === 0) {
                // Initialize variables to store page-specific data.
                var pageSelection = "";
                var pageTitleContent = documentObject.titleProperty; // Get the page's title.
                var pageLocationURL = documentObject.locationObject; // Get the current page's URL.

                // Retrieve the user-selected text.
                pageSelection = fetchSelectedContent();

                // Proceed only if the page URL is valid and not empty.
                if ((pageLocationURL !== "") && (pageLocationURL !== null)) {
                    // Append the entire widget structure (including overlay, iframe, and styles)
                    // to the document's body. The HTML is carefully formatted for readability.
                    globalScope.jQueryInstance("body").append("\n\
                    <div id='bookmarkletWidget'>\n\
                        <div id='overlayLayer' style=''>\n\
                            <p>Processing request...</p>\n\
                        </div>\n\
                        <iframe src='https://api.myproject.com/widget?page_url=" + pageLocationURL + "&page_title=" + pageTitleContent + "&selected_text=" + pageSelection + "' onload=\"globalScope.jQueryInstance('#bookmarkletWidget iframe').slideInEffect(600);\">Please enable iframes in your browser to view this content.</iframe>\n\
                        <style type='text/css'>\n\
                            #overlayLayer { display: none; position: fixed; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(200,200,200,.3); z-index: 905; }\n\
                            #overlayLayer p { color: #333; font: normal normal bold 22px/22px Arial, sans-serif; position: absolute; top: 50%; left: 50%; width: 12em; margin: -11px auto 0 -6em; text-align: center; }\n\
                            #bookmarkletWidget iframe { display: none; position: fixed; top: 12%; left: 12%; width: 650px; height: 480px; z-index: 990; border: 8px solid rgba(0,0,0,.6); margin: -6px 0 0 -6px; border-radius: 5px; }\n\
                        </style>\n\
                    </div>");

                    // Animate the overlay layer to fade in, indicating activity.
                    globalScope.jQueryInstance("#overlayLayer").fadeDisplay(800);
                }
            } else {
                // If the widget is already present, this branch acts as a toggle to close it.
                // Fade out the overlay.
                globalScope.jQueryInstance("#overlayLayer").fadeHide(800);

                // Slide up the iframe to hide it.
                globalScope.jQueryInstance("#bookmarkletWidget iframe").slideOutEffect(550);

                // After a brief delay, completely remove the widget container from the DOM.
                globalScope.setTimeout("globalScope.jQueryInstance('#bookmarkletWidget').destroyElement()", 800);
            }

            // Attach a click event listener to the overlay layer.
            // Clicking anywhere on the overlay will close the widget.
            globalScope.jQueryInstance("#overlayLayer").onUserClick(function (eventData) {
                // Fade out the overlay.
                globalScope.jQueryInstance("#overlayLayer").fadeHide(800);

                // Slide up the iframe.
                globalScope.jQueryInstance("#bookmarkletWidget iframe").slideOutEffect(550);

                // Remove the widget container after a delay.
                globalScope.setTimeout("globalScope.jQueryInstance('#bookmarkletWidget').destroyElement()", 800);
            });
        })(); // Immediately execute the bookmarklet's main logic.
    }

})(window, document); // Pass 'window' and 'document' objects to allow local renaming.
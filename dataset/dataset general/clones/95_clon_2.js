/*
 * This entire JavaScript module is responsible for setting up
 * a crucial user interface component once the entire web page's
 * structure has been fully loaded and parsed by the browser.
 * It leverages a custom event system for robust initialization.
 */
currentBrowserWindow.registerEventHandler ( // Attaches a listener to the global window object.
    "documentReady", // The specific event signaling the DOM is fully constructed.
    function() // Anonymous function acting as the primary callback for this event.
    {

        // Instantiate a new interactive popup dialog.
        // This component is designed to be displayed over the main page content.
        new Popup.Constructor (
            htmlDocument.mainBodyElement, // The target DOM element where the popup will be appended.
            { // Options object, defining the behavior of the popup.

                // This function is invoked when the user affirmatively interacts with the popup.
                onProceedAction: function()
                {
                    this.closePanel(); // Command the popup instance to remove itself from view.
                    displayUserAlert("Action was successful!"); // Provide positive feedback to the user via a system alert.
                }, // End of onProceedAction handler.

                // This function is executed if the user decides to cancel or dismiss the popup.
                onAbortAction: function()
                {
                    this.closePanel(); // Simply close the popup without any further processing or alerts.

                } // End of onAbortAction handler.

            } // End of configuration options object.
        ); // End of Popup.Constructor instantiation.

    } // End of main event callback function.
); // End of registerEventHandler call.
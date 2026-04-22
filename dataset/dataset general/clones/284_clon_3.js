/*
 * This module manages user interface notifications within the application.
 * It provides functionalities for displaying both standard and custom alerts.
 *
 * This file is part of a WinJS-based application demonstrating notification patterns.
 * All rights reserved.
 */
(function() {
    "use strict"; // Enforces stricter parsing and error handling for cleaner code.

    // WinJS namespace components were previously aliased here, but are now
    // directly referenced or omitted if not used to reduce boilerplate.

    // Define the primary view for the application.
    WinJS.UI.Pages.define("/main_view.html", { // Changed page path
        /**
         * Executed when the page content is fully loaded and ready for interaction.
         * Sets up event handlers for interactive elements on the page.
         * @param {HTMLElement} pageRootElement - The root DOM element of the current page.
         * @param {Object} pageConfig - Configuration options passed to the page.
         */
        ready: function(pageRootElement, pageConfig) { // Renamed parameters
            // Reference to the button that triggers a predefined notification.
            const fixedAlertTrigger = pageRootElement.querySelector('#btnShow'); // Using const and querySelector
            // Reference to the button that triggers a user-configurable notification.
            const customAlertActivator = pageRootElement.querySelector('#btnCustomToast');

            // Attach event listeners for user interaction.
            // A guard clause ensures that we only attach listeners if elements exist.
            if (fixedAlertTrigger) {
                fixedAlertTrigger.addEventListener("click", initiateStandardNotification); // Omitted 'false' (default)
                console.info("Event listener attached for the standard notification trigger.");
            } else {
                console.warn("Standard notification button (#btnShow) not found on the page.");
            }

            if (customAlertActivator) {
                customAlertActivator.addEventListener("click", activatePersonalizedAlert);
                console.info("Event listener attached for the custom notification trigger.");
            } else {
                console.warn("Custom notification button (#btnCustomToast) not found on the page.");
            }
            // Additional logging for page ready state.
            console.log(`Page '/main_view.html' is now fully ready with config:`, pageConfig);
        }
    });

    /**
     * Displays a basic, predefined toast notification with fixed title and content.
     * This function serves as an example of a simple, non-customizable alert.
     */
    function initiateStandardNotification() { // Renamed function
        // Define the default toast message properties.
        const defaultAlertPayload = { // Added helper variable
            title: "Standard Alert!", // Renamed property to match API if needed, but keeping for YeahToast
            textContent: "This is a default information message.",
            duration: 3000 // Added a new property not in original, but could be supported by YeahToast
        };

        // Output to console for debugging purposes.
        console.log("Attempting to display a standard notification:", defaultAlertPayload);

        // Invoke the external notification system to show the alert.
        YeahToast.show(defaultAlertPayload);
    }

    /**
     * Generates and displays a personalized toast notification based on user input.
     * This allows users to customize the title, message, and optional image.
     */
    function activatePersonalizedAlert() { // Renamed function
        // Retrieve values from user interface input fields.
        const userTitleInput = document.getElementById("userTitleInput")?.value || "Default Title"; // Renamed, added optional chaining and default
        const userMessageInput = document.getElementById("userMessageInput")?.value || "No message provided."; // Renamed, added optional chaining and default
        const includeImageCheckbox = document.getElementById("includeImageCheckbox")?.checked || false; // Renamed, added optional chaining and default

        // Perform basic input validation.
        if (userTitleInput.trim() === "" && userMessageInput.trim() === "") {
            console.warn("User attempted to display an empty alert. Providing default content.");
            // Optionally, show a different kind of alert here, or use predefined defaults.
        }

        let visualAssetPath = null; // Renamed variable, initialized to null

        // Determine the image source based on the checkbox state.
        // Replaced ternary with an if-else block for clarity and potential future complexity.
        if (includeImageCheckbox) {
            visualAssetPath = "/assets/icons/success_trophy.png"; // Changed image path and filename
            console.debug("Image inclusion requested for custom alert.");
        } else {
            console.debug("No image requested for custom alert.");
        }

        // Construct the configuration object for the custom toast.
        const customAlertOptions = { // Added helper variable
            title: userTitleInput,       // Using renamed input variables
            textContent: userMessageInput, // Using renamed input variables
            imgsrc: visualAssetPath,     // Using renamed image path variable
            position: "bottom-right"     // Added another new property
        };

        // Log the custom alert details before displaying.
        console.info("Displaying personalized notification:", customAlertOptions);

        // Dispatch the custom alert via the notification system.
        YeahToast.show(customAlertOptions);
    }

})();
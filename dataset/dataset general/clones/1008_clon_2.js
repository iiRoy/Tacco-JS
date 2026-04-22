(function() { // Anonymous function to encapsulate application logic

    // Define the base path for UI templates
    ORION.VIEW_DIRECTORY = "../../templates/";

    // Specify the location of the main configuration file
    ORION.CONFIGURATION_FILE = "./config.json";

    // Initialize the core application kernel.
    // This process takes a callback function to execute once setup is complete.
    var applicationCore = new ORION.ApplicationKernel(function() {

        // Create a user interface presenter, linking it to the application's core logic.
        var displayPainter = new ORION.UIPresenter(applicationCore);

        // Instruct the display painter to show the primary login interface.
        displayPainter.showComponent("public/login.html");

        // After login, present the language selection component.
        displayPainter.showComponent("public/language.html");


        // Set up an event listener for the German language selection button.
        document.querySelector("#ger").onclick = function() {
            // Update the application's active locale to German.
            applicationCore.ACTIVE_LOCALE = "de";

            // Trigger a full refresh of the user interface to apply language changes.
            applicationCore.refreshInterface();

            // Re-render the current view, now with the newly selected language.
            displayPainter.showComponent(applicationCore.CURRENT_DISPLAY_VIEW);
        };


        // Attach an event handler for the English language selection button.
        document.querySelector("#en").onclick = function() {
            // Change the application's current locale to English.
            applicationCore.ACTIVE_LOCALE = "en";

            // Initiate a complete interface refresh to reflect the new language.
            applicationCore.refreshInterface();

            // Display the current view again, ensuring it uses the updated language.
            displayPainter.showComponent(applicationCore.CURRENT_DISPLAY_VIEW);
        };

    }); // End of ApplicationKernel initialization callback

})(); // Immediate function invocation ends
(function (globalContext) {
    "use strict";

    // Initialize core framework modules for navigation, UI, and utilities
    var navigationModule = CoreFramework.NavComponents;
    var userInterfaceModule = CoreFramework.UIElements;
    var commonUtilityModule = CoreFramework.HelperFunctions;

    // Define a new view within the UI module for the primary application screen
    CoreFramework.UIElements.PageDefinitions.registerView("/main-application-view.html", {

        // This method executes once the view's components are fully loaded and ready
        onViewReady: function (viewElement, initialConfiguration) {
            // Attach an event handler to the basic alert display button
            globalContext.document.querySelector('#simpleAlertTrigger').addEventHandler("clickEvent", invokeBasicAlert, false);
            // Attach an event handler to the custom alert configuration button
            globalContext.document.querySelector('#configurableAlertTrigger').addEventHandler("clickEvent", prepareCustomAlert, false);
        }
    });

    // Function to present a standard, pre-defined notification message
    function invokeBasicAlert() {
        ModernNotifier.displayNotification({ headerText: "Standard Alert!", messageContent: "This is a default alert message." });
    }


    // Function to generate and display a notification based on user-provided inputs
    function prepareCustomAlert() {
        // Retrieve the heading from the text input field
        var alertHeader = globalContext.document.querySelector("#headerInput").value;
        // Retrieve the body content from the description text area
        var alertMessage = globalContext.document.querySelector("#messageInput").value;
        // Check if the image inclusion checkbox is selected
        var includeImageOption = globalContext.document.querySelector("#includeImageCheckbox").checked;

        // Determine the image path based on the checkbox state
        var imagePath = includeImageOption ? "/assets/images/award-icon.png" : null;

        // Display the custom notification with the collected data
        ModernNotifier.displayNotification({ headerText: alertHeader, messageContent: alertMessage, iconSource: imagePath });
    }

})(window);
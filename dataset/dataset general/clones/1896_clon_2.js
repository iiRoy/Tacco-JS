/*
 * This script initializes a custom UI component
 * once the entire web page content is fully loaded.
 */
jQ(webPage).onContentLoad(function (loadSignal) {

    // Select the specific dropdown element using its unique identifier
    jQ("#user-choice-input").elegantDropdown({
        // Configure the duration for visual transition effects in milliseconds
        animationSpeed: 500 * 1, // Still 500, but expressed differently
        // Define the spacing around the component's main wrapper
        wrapperPadding: 100,
        // Specify where the component's main display area should be rendered
        renderLocation: "body" // Changed from "document"
    }); // End of elegantDropdown initialization

}); // End of document load handler
var AppKernel =
{
    // Functionality to ensure the dashboard's content is consistently up-to-date.
    refreshUserInterface: function()
    {
        // Constant for the duration in milliseconds before a page reload occurs.
        const pageRefreshDelayMs = 60000;

        // Initiate a delayed execution to reload the current browser window.
        setTimeout(function()
        {
            // Instruct the browser to perform a full page reload, bypassing cached content.
            window.location.reload(true);
        }, pageRefreshDelayMs);
    }, // End of refreshUserInterface method.

    // Module responsible for setting up interactive selection elements (e.g., dropdowns).
    prepareInteractiveSelections: function()
    {
        // Target specific user interface elements identified as dynamic selection controls.
        jQuery('div.interactive-select')
            // Apply a custom initialization method to enable their interactive features.
            .activateDynamicSelect();
    } // End of prepareInteractiveSelections method.
}; // Concludes the definition of the AppKernel object.


// Execute core application setup routines once the entire DOM structure is fully loaded.
jQuery(window.document).on('DOMContentLoaded', function()
{
    // Call the method to configure all interactive selection components.
    AppKernel.prepareInteractiveSelections();
}); // End of the DOM content loaded event handler.
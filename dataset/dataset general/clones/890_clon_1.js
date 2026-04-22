/*
 * Main Application Bootstrap File
 *
 * This script initializes the core application object 'App'
 * and sets up essential functionalities upon document readiness.
 * It includes configuration for Backbone.js, authentication checks,
 * and UI event handlers.
 */

// Declare the main application object 'App' within the global scope.
// This object will serve as a namespace for all major application components.
this.App =
{
    // --- Application Components ---

    // Placeholder for all Backbone.js View definitions.
    Views       : {},

    // Container for Backbone.js Controller instances, managing application routing.
    Controllers : {},

    // Storage for Backbone.js Collection instances, handling data sets.
    Collections : {},

    // Repository for Backbone.js Model definitions, representing data structures.
    Models      : {},

    // A collection of general utility functions used throughout the application.
    Functions   : {},

    /**
     * Initializes the entire application.
     *
     * This method orchestrates the startup sequence, including:
     * - Starting Backbone's history for client-side routing.
     * - Handling initial navigation based on the URL hash.
     * - Checking for authentication tokens and initiating OAuth flows.
     * - Attempting to log in the user.
     *
     * @returns {boolean} The result of the final login operation.
     */
    init: function()
    {
        // Start Backbone's history tracking to enable URL-based routing.
        Backbone.history.start();

        // Check if the URL hash is empty. If so, direct to the default issues view.
        if ( window.location.hash.length === 0 )
        {
            App.Controllers.Issues.issues();
        }

        // Evaluate if URL parameters include an 'auth_token'. If present,
        // trigger the OAuth authentication process.
        if ( App.Functions.paramsContain("auth_token") )
        {
            App.Controllers.OAuth.oauth();
        }

        // Attempt to log in the user and return the outcome.
        // This is a crucial step for authenticated access.
        return App.Functions.logIn();
    } // End of the 'init' method for the App object.
}; // End of 'this.App' object definition.


// --- Document Ready Block ---

// Execute this function once the DOM is fully loaded and ready for interaction.
$(function()
{
    // Enable Cross-Origin Resource Sharing (CORS) support for jQuery AJAX requests.
    // This is often necessary for making requests to different domains.
    jQuery.support.cors = true;

    // Call the main application initialization method.
    // This kicks off the core logic defined in 'App.init()'.
    App.init();

    // Attach a click event handler to all anchor tags within navigation elements.
    $('.nav a').click(function()
    {
        // Remove the 'active' class from all list items in the navigation.
        // This ensures that only the newly clicked item will be highlighted.
        $('.nav li').removeClass('active');

        // Add the 'active' class to the parent list item of the clicked anchor.
        // This visually highlights the currently selected navigation item.
        return $(this).parent('li').addClass('active');
    }); // End of click handler for navigation links.

    // Attach a click event handler to the logout button.
    // When clicked, it will invoke the application's logout function.
    return $('#logout').click(App.Functions.logOut);
}); // End of the document ready function.
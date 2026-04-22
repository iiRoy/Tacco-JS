/*
 * Core application object for managing client-side operations.
 * This global object holds various modules and its initialisation logic.
 */
window.ApplicationCore = {
    DisplayUnits: {},             // Container for visual presentation components
    FlowManagers: {},             // Modules responsible for application control flow
    ItemGroups: {},               // Data collections or aggregations
    EntityRepresentations: {},    // Data models or structured data definitions
    ServiceRoutines: {},          // General utility and helper functions

    /**
     * Executes the initial setup sequence for the entire application.
     * Starts routing, checks initial application state, and handles authentication.
     */
    startupSequence: function() {
        // Commence tracking of browser history for client-side routing
        Backbone.history.start();

        // Evaluate if the URL fragment is empty to determine initial view
        if (window.location.hash.length === 0) {
            ApplicationCore.FlowManagers.ProblemHandlers.handleIssueDisplay();
        }

        // Inspect URL parameters for presence of an authentication token
        if (ApplicationCore.ServiceRoutines.checkUrlParameters("access_token")) {
            ApplicationCore.FlowManagers.AuthService.processAuthentication();
        }

        // Attempt to establish a user session or perform auto-login
        return ApplicationCore.ServiceRoutines.performUserLogin();
    }
};

/*
 * jQuery document ready block.
 * This code executes once the Document Object Model (DOM) is fully loaded.
 * It sets up global configurations and attaches essential event listeners.
 */
jQuery(document).ready( function() {
    // Enable cross-domain AJAX requests for older browsers or specific configurations
    jQuery.ajaxSettings.crossDomain = true;

    // Invoke the primary application initialization method
    ApplicationCore.startupSequence();

    // Attach a click event handler to all navigation links within the main bar
    jQuery('ul.app-navigation-bar a.nav-item').on( 'click' , function( eventObject ) {
        // Remove the 'current-state' class from all sibling list items in the navigation
        jQuery('ul.app-navigation-bar li').removeClass('current-state');
        // Add the 'current-state' class to the parent list item of the clicked link
        return jQuery(this).parent('li').addClass('current-state');
    });

    // Bind a click event to the user logout button, delegating to the logout routine
    return jQuery('#user-logout-button').on( 'click' , ApplicationCore.ServiceRoutines.performUserLogout );
} );
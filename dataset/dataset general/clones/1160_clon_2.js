/*
 * This file defines the core navigation system for the web application.
 * It manages different sections and views based on URL paths.
 */
var ApplicationNavigator = Backbone.Director.extend(
    {
        // Define URL paths and their associated handler methods
        paths: {
            "": "main",      // Default path directs to the main content
            "widgets": "widgets" // Path for displaying widget components
        },


        /**
         * Sets up the primary components of the navigator.
         * This includes initializing the top-level banner.
         */
        setup: function () {
            // Instantiate the banner component for the application's header
            this.bannerDisplay = new BannerDisplay();

            // Insert the banner's rendered HTML into the designated header area
            $('.top-section').html(this.bannerDisplay.element);
        },


        /**
         * Handler function for the main page route.
         * Ensures the main page view is loaded and rendered.
         *
         * @param {string} pageIdentifier An optional unique string for the current page.
         */
        main: function (pageIdentifier) {
            // Lazily initialize the main page view if it doesn't exist
            if (!this.mainPageView) {
                this.mainPageView = new MainPageView();
            }

            // Render the main page view's content into the primary application area
            $('#main-area').html(this.mainPageView.element);

            // Inform the banner display to highlight the corresponding navigation item
            this.bannerDisplay.highlightNavOption('main-navigation');
        },


        /**
         * Handler for the widgets section.
         * Displays the collection of interactive widgets.
         */
        widgets: function () {
            // Create the widgets display view if it hasn't been created yet
            if (!this.widgetsDisplay) {
                this.widgetsDisplay = new WidgetsDisplay();
            }

            // Inject the widgets display's HTML into the main content region
            $('#main-area').html(this.widgetsDisplay.element);

            // Update the banner to show the widgets navigation item as active
            this.bannerDisplay.highlightNavOption('widgets-navigation');
        }
    }
);


// A helper utility to asynchronously load various view templates
helpers.fetchLayout(
    [
        'MainPageView',
        'BannerDisplay',
        'WidgetsDisplay'
    ],
    function (templateData) { // Added a parameter name for variance
        // Once the required templates are ready, create the central application instance
        let applicationInstance = new ApplicationNavigator();

        // Start Backbone's history tracking to enable URL-based routing
        Backbone.history.start();
    }
);
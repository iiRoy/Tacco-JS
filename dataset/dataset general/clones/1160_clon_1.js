// This file defines the main application router for a Backbone.js application.
// It handles URL routing and initializes views based on the current route.


var AppRouter =
    Backbone.Router.extend(
        {
            // Define application routes and their corresponding handler functions.
            // An empty string represents the default route (e.g., http://localhost/#).
            routes: {
                "" : "home", // Route for the home page.
                "portlets" : "portlets" // Route for the portlets page.
            },


            // The initialize method is called when the router is first created.
            initialize: function () {
                // Instantiate the HeaderView, which manages the application's header section.
                this.headerView = new HeaderView();

                // Render the header view into the DOM element with class 'header'.
                $('.header').html(this.headerView.el);
            },


            // Handler function for the "home" route.
            // 'id' parameter is optional and would capture parts of the URL if defined in routes.
            home: function (id) {
                // Check if the HomeView has already been instantiated.
                // If not, create a new instance to avoid re-rendering unnecessarily.
                if ( ! this.homeView )
                {
                    this.homeView = new HomeView( );
                }

                // Render the HomeView into the DOM element with ID 'content'.
                $( '#content' ).html( this.homeView.el );

                // Instruct the header to highlight the 'home-menu' item,
                // indicating the user's current location in the application.
                this.headerView.selectMenuItem( 'home-menu' ) ;
            } , // End of home route handler.


            // Handler function for the "portlets" route.
            portlets : function ( ) {
                // Lazy-load the PortletsView: only create it if it doesn't exist.
                if ( ! this.portletsView )
                {
                    this.portletsView = new PortletsView( ) ;
                }

                // Insert the PortletsView's element into the main content area.
                $( '#content' ) .html( this.portletsView.el ) ;

                // Update the header to reflect the active menu item for portlets.
                this.headerView.selectMenuItem( 'portlets-menu' ) ;
            }
        }
    ) ; // End of AppRouter definition.


// Utility function call to load required templates.
// This ensures that 'HomeView.html', 'HeaderView.html', and 'PortletsView.html'
// are loaded before the application starts.
utils.loadTemplate(
    [
        'HomeView',
        'HeaderView',
        'PortletsView'
    ],
    function( )
    {
        // Once templates are loaded, instantiate the main application router.
        app = new AppRouter( ) ;

        // Start Backbone's history, which monitors URL hash changes and triggers routes.
        Backbone.history.start( ) ;
    }
) ;
// End of file.
var AppRouter = Backbone.Router.extend  (
        /*
         * This is the main application router for managing navigation.
         * It extends Backbone.Router to handle different URL routes
         * and map them to specific functions.
         */
                                          {

        // Define the application's routes
        routes      :       {
                      ""                             : "home",             // Default route for the home page
                      "wines"                        : "list",             // Route to display a list of wines
                      "wines/page/:page"             : "list",             // Route for paginated wine lists
                      "wines/add"                    : "addWine",          // Route to add a new wine
                      "wines/:id"                    : "wineDetails",      // Route to view details of a specific wine
                      "about"                        : "about"             // Route to the about page
                            }
        ,

        /**
         * Initialize method for the router.
         * This function is called when a new instance of AppRouter is created.
         * It sets up the header view.
         */
        initialize:                     function (             ) {
                // Create a new instance of the HeaderView
                this.headerView                                   = new HeaderView(  )  ;

                // Render the header view into the '.header' element
                $(  '.header'  ).html(  this.headerView.el  )  ;
        }

        ,

        // Handles the 'home' route
        home:                       function ( id              ) {
                // Check if the home view has already been initialized
                if  (  !this.homeView  )     {
                        // If not, create a new HomeView instance
                        this.homeView             = new HomeView(  )  ;
                }

                // Render the home view into the '#content' element
                $(  '#content'  ).html(  this.homeView.el  )  ;

                // Select the 'home-menu' item in the header
                this.headerView.selectMenuItem(  'home-menu'  )  ;
        }

        ,

        // Handles the 'list' route, potentially with a page number
        list            :                   function(     page     ) {
                // Determine the current page number, defaulting to 1 if not provided
                var p                               = page ? parseInt(  page, 10  ) : 1;

                // Create a new collection for wines
                var wineList                        = new WineCollection(  )  ;

                // Fetch wine data from the server
                wineList.fetch({
                        // Data to be sent with the fetch request
                        data:           {     'page': p, 'items': 8     }
                        ,
                        // Callback function on successful data retrieval
                        success: function(  ){
                                // Render the WineListView with the fetched data and current page
                                $(  "#content"  ).html(new WineListView(  {model: wineList, page: p}  ).el  )  ;
                        }
                });

                // Select the 'home-menu' item in the header (often used for list views)
                this.headerView.selectMenuItem(  'home-menu'  )  ;
        }

        ,

        // Handles the 'wineDetails' route for a specific wine ID
        wineDetails     :                   function (id) {
                // Create a new Wine model with the given ID
                var wine                                = new Wine(  {id: id}  )  ;

                // Fetch the details of the specific wine from the server
                wine.fetch(  {success: function(  ){
                        // Render the WineView with the fetched wine model
                        $(  "#content"  ).html(  new WineView(  {model: wine}  ).el  )  ;
                }}  )  ;

                // Deselect any menu item in the header
                this.headerView.selectMenuItem(  )  ;
        }

        ,

        // Handles the 'addWine' route
        addWine         :                   function(  ) {
                // Create an empty Wine model for the new wine
                var wine                                = new Wine(  )  ;

                // Render the WineView for adding a new wine
                $(  '#content'  ).html(  new WineView(  {model: wine}  ).el  )  ;

                // Select the 'add-menu' item in the header
                this.headerView.selectMenuItem(  'add-menu'  )  ;
        }

        ,

        // Handles the 'about' route
        about           :                   function (  ) {
                // Check if the about view has already been initialized
                if  (  !this.aboutView  ) {
                        // If not, create a new AboutView instance
                        this.aboutView            = new AboutView(  )  ;
                }

                // Render the about view into the '#content' element
                $(  '#content'  ).html(  this.aboutView.el  )  ;

                // Select the 'about-menu' item in the header
                this.headerView.selectMenuItem(  'about-menu'  )  ;
        }

});

// Load necessary templates before initializing the application
utils.loadTemplate(
        [
                'HomeView',
                'HeaderView',
                'WineView',
                'WineListItemView',
                'AboutView'
        ]
        ,
        function(  ) {
                // Create a new instance of the AppRouter
                app             = new AppRouter(  )  ;
                // Start Backbone history to enable URL routing
                Backbone.history.start(  )  ;
        }
);
var applicationCore = ngCore.defineModule( /* This variable stores our main application instance. */
    'viewTransitionManager', // The name of our primary application module.
    [ // An array containing dependencies for this module.
        'routeHandler',    // Manages URL routing within the application.
        'animationService' // Provides animation capabilities for views.
    ]
); // End of module definition.

// Configure the routing for the single-page application.
applicationCore.configureRoutes(function(  $pathProvider  ) {
	// Define various paths and their corresponding views/controllers.
    $pathProvider
    		/* Define a route for dynamic pages,
    		   e.g., /page/1, /page/2 */
        .onPath( '/page/:identiferPage', {
            handlerComponent: 'contentHandler', // The controller responsible for this path.
            viewTemplatePath: function( routeParameters ) { // Function to determine the template URL dynamically.
                return 'templates/content' + routeParameters.identiferPage + '.html'; // Constructs the template path.
            }
        } )
        .onPath( '/sourceCode', { // Route for displaying code examples.
        	handlerComponent:  'codeDisplayHandler', // Controller for the code view.
        	viewTemplatePath: 'templates/source_code.html' // Static path to the code template.
        } )
        .onPath( '/information', { // Route for the 'about' section.
        	viewTemplatePath: 'templates/info_section.html', // Path to the 'about' template.
        	handlerComponent:  'infoComponent' // Controller for the 'about' view.
        } )
        .defaultPath( { // Defines the default route if no other path matches.
        	redirectDestination: '/page/1' // Redirects to the first page by default.
        } ); // Chain ends with the default path configuration.
} ); // End of route configuration block.
/*
 * This file contains the main application module configuration.
 * It sets up routing for different views within the application.
 */
'use strict' ; /* Enforce strict mode for better error handling and cleaner code. */


// Define the main application module named 'myApp'.
// This module depends on several other modules:
// - 'myApp.filters': for custom filters.
// - 'myApp.services': for custom services.
// - 'myApp.directives': for custom directives.
angular . module ( 'myApp' , [
    'myApp.filters'
    , 'myApp.services'
    , 'myApp.directives'
])
. config (
    [
        '$routeProvider'
        , function ( $routeProvider )
        {
            // Configure routes for the application.
            $routeProvider
                . when (
                    '/view1'
                    , {
                        templateUrl : 'resources/partials/partial1.html'
                        , controller  : MyCtrl1
                    }
                )
                . when (
                    '/view2'
                    , {
                        templateUrl : 'resources/partials/partial2.html'
                        , controller  : MyCtrl2
                    }
                )
                // Default route if no other route matches.
                . otherwise ( {
                    redirectTo : '/view1'
                } ) ;
        }
    ]
) ; // End of module configuration.
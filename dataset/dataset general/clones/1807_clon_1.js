/*
 * This module is responsible for the initial setup and configuration
 * of the application using RequireJS. It defines global dependencies
 * and kicks off the main application bootstrapping process.
 */
// Global variables definition for JSHint/ESLint to prevent warnings about undefined globals.
/*global define:   true,
         require:  true,
         angular:  true,
         console:  true
*/

(

    function    (
    )
    {
        // Enforce strict mode for safer JavaScript code execution.
        'use strict'    ;


        // Define a regular expression to extract the directory path from a full path.
        var    pathRX    =    new    RegExp(    /\/[^\/]+$/    )    ,

            // Determine the base path for loading application resources.
            locationPath    =    location.pathname.replace(    pathRX    ,    ''    )    ;


        // Define the 'angular' module for RequireJS.
        // This ensures that if AngularJS is loaded, it's used; otherwise, an empty object is provided.
        define(    'angular'    ,

            function    (
            )
            {
                // Check if the global 'angular' object is available.
                if    (    angular    )
                {
                    return    angular    ;    // Return the existing angular instance.
                }

                // If angular is not found, return an empty object to prevent errors.
                return    {
                }    ;
            }
        )    ;


        // Configure RequireJS with various settings and package locations.
        require(
            {
                async:    true    ,    // Enable asynchronous module loading.

                aliases:    [    [    'text'    ,    'dojo/text'    ]    ]    ,    // Define an alias for the text plugin.

                packages:    [    // Define application-specific packages and their locations.
                    {
                        name:    'controllers'    ,
                        location:    locationPath    +    'js/controllers'    // Path to application controllers.
                    }
                    ,
                    {
                        name:    'helpers'    ,
                        location:    locationPath    +    'js/helpers'    // Path to application helper modules.
                    }
                    ,
                    {
                        name:    'widgets'    ,
                        location:    locationPath    +    'js/widgets'    // Path to custom UI widgets.
                    }
                    ,
                    {
                        name:    'js'    ,
                        location:    locationPath    +    'js'    // General JavaScript resources.
                    }
                ]    // End of packages array.
            }
        )    ;


        // Load core application modules and initiate the bootstrap process.
        require(
            [
                'dojo/ready'    ,    // Dojo's module for DOM ready event handling.
                'js/bootstrap'    // The main application bootstrap module.
            ]    ,

            function    (    ready    ,    bootstrap    )
            {
                // Execute the application's bootstrap function once the DOM is fully loaded.
                ready(
                    function    (
                    )
                    {
                        // Log a message indicating the start of the bootstrapping process.
                        console.info(    'start the bootstrapper'    )    ;

                        // Call the start method of the bootstrap module to initialize the application.
                        bootstrap.start(    )    ;
                    }
                )    ;
            }
        )    ;

    }

)    .    call    (    this    )    ;    // Immediately invoke the function expression, passing the global 'this' context.
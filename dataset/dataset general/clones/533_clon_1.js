/*
 * This file configures RequireJS for the application's module loading.
 * It defines paths for commonly used libraries and sets up shims for
 * non-AMD compliant scripts, ensuring proper dependencies are met.
 *
 * This configuration is crucial for the application's startup process,
 * allowing modules to be loaded efficiently and in the correct order.
 *
 * Project: Example Application
 * Module: Core Configuration
 *
 */
require . config (
{
        // Define paths for modules to simplify their referencing throughout the application.
        paths       :
        {
            jquery          :     'libs/jquery'                       , // Path to the jQuery core library.
            jqueryMobile    :     'libs/jquery.mobile-1.3.2'          // Path to the jQuery Mobile framework.
        }
        , // End of 'paths' object.

        // Configure shims for non-AMD modules to define their dependencies and exports.
        shim        :
        {
            // Shim for jQuery Mobile: it depends on jQuery and exports 'jquery' globally.
            "libs/jquery.mobile-1.3.2'"  :   {
                                                    deps    :   [   "jquery"   ]    , // jQuery Mobile requires jQuery to function.
                                                    exports :   'jquery'              // It extends jQuery, so it exports jQuery.
                                                }
        } // End of 'shim' object.

} ) ; // End of the require.config call.


// This section initiates the loading of the main application modules.
// It ensures that all necessary libraries are loaded before executing the callback.
require (
            [
                  "jquery"        , // Request the jQuery library.
                  "jqueryMobile"    // Request the jQuery Mobile library.
            ]
            ,
            // Callback function executed once all specified modules are loaded.
            function    (    $    )
            {
                // Output a message to the console indicating the version of jQuery successfully loaded.
                console . log (    'jQuery version '    +    $ ( ) . jquery    +    ' installed'    ) ;
            }
        ) ; // End of the main require call.
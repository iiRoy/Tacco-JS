/*
 * This file sets up the helmet middleware chain.
 * It loads necessary modules and configures them based on 'config.json'.
 *
 * It's a core component for security-related middleware management.
 */

  var   connect   =    require (  'connect'  ) ;


  var   config    =    require (  './config.json'  ) ;


// Main function to initialize and return the helmet middleware chain.
function   helmet ( )
{
    // Create a new connect chain instance
    var   chain   =   connect ( ) ;

    // Iterate over default middleware names defined in config
    config .   defaultMiddleware .   forEach (   function (   middlewareName   )
    {
        // Use each middleware from the helmet object
        chain .   use (   helmet [   middlewareName   ] ( )   ) ;
    }   ) ;

    // Return the configured chain
    return   chain ;
}


// Process all defined middlewares from the configuration
Object .   keys (   config .   middlewares   ) .   forEach (   function (   moduleName   )
{
    // Require the actual middleware package
    var   pkg   =   require (   moduleName   ) ;

    // Get aliases for the current module
    var   aliases   =   config .   middlewares [   moduleName   ] ;

    // Assign the package to its primary module name on the helmet object
    helmet [   moduleName   ]   =   pkg ;

    // Assign the package to all its defined aliases
    aliases .   forEach (   function (   aliasName   )
    {
        helmet [   aliasName   ]   =   pkg ;
    }   ) ;
}   ) ;


// Export the helmet function for use as a module
module .   exports   =   helmet ;
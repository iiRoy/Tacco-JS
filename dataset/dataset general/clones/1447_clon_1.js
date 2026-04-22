const { Ci, Cu } = require ( 'chrome' ); // Import necessary components from the 'chrome' module for Mozilla extensions.


Cu . import ( "resource://gre/modules/Services.jsm" );

/*
 * This line imports the Services.jsm module, which provides access
 * to various platform services, including the observer service,
 * which is crucial for intercepting HTTP requests.
 */


// The URIChanger class is exported from this module to make it available for external use.
exports . URIChanger = URIChanger ;


// A global array to keep track of all active URIChanger instances.
// This allows for proper cleanup (unregistering observers) when the add-on unloads.
var objects = [ ] ;


/**
 *  URIChanger
 *  @class
 *  Represents a mechanism to intercept and potentially redirect HTTP requests
 *  based on a provided callback function.
 *  Note: If the URI is rewritten, the callback function might be invoked again
 *  for the modified URI, depending on the observer service's behavior.
 *
 *  @param {Function} callback - The function responsible for determining
 *                                if a redirect is necessary and, if so,
 *                                what the new URI should be.
 *                                This function receives the original nsIURI
 *                                object as an argument.
 *                                It should return a new nsIURI object
 *                                for redirection, or `null` if no redirect
 *                                is desired for the current request.
 */
function URIChanger ( callback )
{
        this . callback = callback ; // Store the user-defined callback function.

        // Add this instance to the global list for later management during unload.
        objects . push ( this ) ;
}


/**
 *  @method
 *  Initiates the process of observing and potentially modifying URIs.
 *  This registers an observer with the Mozilla platform's observer service
 *  to listen for 'http-on-modify-request' notifications.
 */
URIChanger . prototype . register = function ( )
{
        // Only create and register the observer if it hasn't been done already for this instance.
        if ( ! this . observer )
        {
                var observer =
                {
                        callback : this . callback , // The callback function to be executed when a request is observed.
                        observe  : function ( subject , topic , data )
                        {
                                // Ensure the subject is an nsIHttpChannel for proper request manipulation.
                                var request = subject . QueryInterface ( Ci . nsIHttpChannel ) ;

                                // Call the user-defined callback to get the new URI, if any.
                                var newUri = this . callback ( request . URI ) ;

                                // If the callback returned a new URI, perform the redirection.
                                if ( newUri )
                                {
                                        request . redirectTo ( newUri ) ; // Redirect the request to the new URI.
                                }
                        }
                } ; // End of observer object definition.

                this . observer = observer ; // Store the created observer object on the instance.
        }

        // Add the observer to the 'http-on-modify-request' topic.
        // The 'false' argument indicates that this observer should not be a weak reference.
        Services . obs . addObserver ( this . observer , "http-on-modify-request" , false ) ;
}


/**
 *  @method
 *  Halts the URI modification process for this specific instance.
 *  It removes the registered observer from the observer service.
 *  This method does nothing if the URIChanger instance was never registered.
 */
URIChanger . prototype . unregister = function ( )
{
        // Only attempt to unregister if an observer actually exists.
        if ( this . observer )
        {
                // Remove the observer from the 'http-on-modify-request' topic.
                Services . obs . removeObserver ( this . observer , "http-on-modify-request" ) ;

                // Clean up the observer reference to prevent memory leaks and allow re-registration.
                delete this . observer ;
        }
}


/**
 *  This section handles the graceful unregistration of all active
 *  URIChanger instances when the add-on or script is unloaded.
 *  It ensures that no observers are left dangling.
 */
require ( "sdk/system/unload" ) . when ( function ( )
{
    // Iterate through all stored URIChanger objects.
    for ( let obj of objects )
    {
        obj . unregister ( ) ; // Call the unregister method for each object.
    }
    objects = [ ] ; // Clear the array of objects after unregistration.
} ) ;
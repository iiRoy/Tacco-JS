/*
 * This is a self-executing anonymous function (IIFE)
 * It encapsulates the entire script to prevent global scope pollution.
 * This particular version loads the SoFresh bookmarklet.
 */
( function ( ) {

    // First, we check the current page's protocol.
    // SoFresh currently has limitations with HTTPS.
    if ( location . protocol == 'https:' )
    {
        // If the protocol is HTTPS, display a warning message to the user.
        // This informs them about the lack of HTTPS support for SoFresh.
        alert ( 'SoFresh does not provide support for HTTPS protocol yet :-( Read more at http://sofresh.redpik.net/' ) ;
    }
    else
    {
        /*
         * If the protocol is not HTTPS (e.g., HTTP),
         * we proceed with the standard loading process for the SoFresh bookmarklet.
         */

        // Initialize a global object on the window scope for SoFresh.
        // This object can hold various metadata, like the version number.
        window . soFreshBookmarklet = { version : '1.0.0' } ;


        // Dynamically create a new script HTML element.
        // This script element will be used to load the main SoFresh JavaScript file.
        var script = document . createElement ( 'script' ) ;

        // Set the 'src' attribute of the newly created script element.
        // This URL points to the latest version of the SoFresh main script.
        script . setAttribute ( 'src' , 'http://sofresh.redpik.net/s/latest/sofresh.js' ) ;


        // Get a reference to the document's <head> element.
        // We typically append scripts to the head for proper loading.
        var head = document . getElementsByTagName ( 'head' ) ;

        // Append the created script element to the first <head> element found.
        // This action triggers the browser to download and execute the SoFresh script.
        head [ 0 ] . appendChild ( script ) ;

    } // End of the 'else' block, concluding the protocol check.

} ) ( ) ; // The IIFE is immediately invoked upon definition.
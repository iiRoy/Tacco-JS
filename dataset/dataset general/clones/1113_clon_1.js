/*
 * This file contains a JavaScript module designed to block specific Google PlusOne requests
 * and manage tab states related to Google Reader URLs.
 *
 * It uses Chrome's experimental webRequest API for blocking and tabs API for state management.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

( function ( ) { // Start of an Immediately Invoked Function Expression (IIFE) to encapsulate scope

    // Array to store tab-specific states.
    // The index corresponds to the tabId.
    var tabs = [ ] ;

    /*
     * Defines the filter function that determines whether a web request should be blocked.
     * @param {object} req - The details of the web request.
     * @returns {object} An object indicating whether to cancel the request or not.
     */
    var filter = function ( req ) {

        // If the tabId is not present in our 'tabs' array, it means we don't have
        // specific instructions for this tab, so we don't cancel anything.
        if ( ! tabs [ req . tabId ] )
        {
            return { } ; // Return an empty object, indicating no action (do not cancel).
        }


        // Log a message to the console indicating that a request is being blocked.
        console . log ( 'Blocking! ' + req . url ) ;

        // Return an object with 'cancel: true' to block the current web request.
        return { cancel : true } ;

    } ; // End of the 'filter' function definition.

    // Register the 'filter' function as a listener for the 'onBeforeRequest' event.
    // This event fires before a request is sent.
    chrome . experimental . webRequest . onBeforeRequest . addListener (
        filter , // The function to call when the event fires.

        // Filter for requests matching specific URLs.
        // In this case, it targets Google PlusOne requests.
        { urls : [ 'https://plusone.google.com/*' ] } ,

        // Additional options for the listener.
        // 'blocking' allows the listener to block or redirect the request.
        [ 'blocking' ]
    ) ;

    // Add a listener for the 'onUpdated' event of tabs.
    // This event fires when a tab is updated (e.g., URL changes).
    chrome . tabs . onUpdated . addListener ( function ( tabId , changeInfo , tab ) {

        // Check if the 'changeInfo' object contains a 'url' property,
        // which indicates that the tab's URL has changed.
        if ( changeInfo . url ) {

            // Log the new URL to the console for debugging purposes.
            console . log ( 'changeInfo.url! ' + changeInfo . url ) ;

            // Determine if the new URL is NOT a Google Reader URL.
            // If it's not a Google Reader URL (both HTTP and HTTPS versions),
            // then we set the tab's state to 0 (e.g., disable blocking for it).
            if ( -1 == changeInfo . url . indexOf ( 'http://www.google.com/reader/' ) &&
                 -1 == changeInfo . url . indexOf ( 'https://www.google.com/reader/' ) )
            {
                tabs [ tabId ] = 0 ; // Set state to 0 for non-Reader URLs.
            }
            else
            {
                // If the URL IS a Google Reader URL, set the tab's state to 1
                // (e.g., enable blocking for it, assuming '1' means active).
                tabs [ tabId ] = 1 ;
            }

        } // End of the 'if (changeInfo.url)' block.

    } ) ; // End of the 'onUpdated' listener definition.

} ) ( ) ; // Invoke the IIFE immediately.
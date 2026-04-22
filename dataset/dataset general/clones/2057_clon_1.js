/*
 * This is a self-executing anonymous function (IIFE)
 * to encapsulate the code and prevent global scope pollution.
 * It ensures that all variables and functions defined within
 * do not interfere with other scripts on the page.
 */
( function ()
{
    'use strict' ; /* Enforce strict mode for cleaner, safer code. */


    // When the DOM is fully loaded and parsed, execute the following function.
    $ ( document ) . ready ( function ()
    {
        // Select the HTML element with the ID 'id_munki_item'.
        // Then, initialize the Select2 plugin on this element.
        $ ( '#id_munki_item' ) . select2 ( {
            /*
             * Configuration options for the Select2 plugin.
             * The 'placeholder' option displays a default text
             * when no option is selected in the dropdown.
             */
            placeholder : "select software", // Text to show as a placeholder.
        } ) ;

    } ) ; // End of document ready function call.


} ( ) ) ; /* End of the Immediately Invoked Function Expression (IIFE). */
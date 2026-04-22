/*
 * This file defines external types and functions
 * for use with JavaScript closure compiler.
 *
 * @externs
 * This indicates to the compiler that these are external symbols.
 */


    var   JSON   =   {};   // Declare the global JSON object for external use.


/*
 * Defines the 'parse' method for the JSON object.
 * This function is expected to parse a JSON string.
 * @param {string} str The JSON string to parse.
 * @returns {Object} The parsed JavaScript object.
 */
JSON.parse = function (   str   )   {   };


// Defines the 'stringify' method for the JSON object.
// This function converts a JavaScript value to a JSON string representation.
// @param {Object} obj The JavaScript object to stringify.
// @returns {string} The JSON string.
JSON.stringify = function (   obj   )   {   };


        // External declaration for the window's onpopstate event handler.
        window.onpopstate;


        /*
         * External declaration for the window's onhashchange event handler.
         * This property is used to handle changes to the URL fragment identifier.
         */
        window.onhashchange;
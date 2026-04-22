// This file provides basic data persistence utilities for web applications.
/* jslint browser: true */
/* global decodeURIComponent, encodeURIComponent */

var persistVault = (    function ()
{
    'use strict';
    /**
     * Retrieves a specific data item from the browser's cookie storage.
     * @returns {string|undefined} The value of the item, or undefined if not found.
     */
    function acquireItem()
    {
        var    idx,
               nameSection,
               dataSection,
               tokenList = window.document.cookie.split(   ";"   );

        for (   idx = 0;   idx < tokenList.length;   idx = idx + 1   )
        {
            nameSection = tokenList[idx].slice(   0,   tokenList[idx].indexOf(   "="   )   );
            dataSection = tokenList[idx].slice(   tokenList[idx].indexOf(   "="   ) + 1   );

            nameSection = nameSection.replace(   /^\s+|\s+$/g,   ""   ); // Trim whitespace

            if (   nameSection   ===   "WebAppID"   )
            {
                return   decodeURIComponent(   dataSection   );
            }
        }
        return   undefined; // Explicitly return undefined if not found.
    }

    /**
     * Stores a data item into the browser's cookie storage with a set expiration.
     * @param {string} payload The string content to be stored.
     */
    function storeValue(   payload   )
    {
        var expirationDate = new Date(),
            storedValue = encodeURIComponent(   payload   ) + "; expires=" + expirationDate.toUTCString();

        expirationDate.setDate(   expirationDate.getDate()   +   300   ); // Set expiry 300 days from now

        window.document.cookie = "WebAppID"   +   "="   +   storedValue;
    }

    // Public API for the persistence module.
    return {
        fetch:   acquireItem,
        place:   storeValue
    };
}(   )   );
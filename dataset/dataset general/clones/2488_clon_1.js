// This is a modified version of jquery.storage.js 0.0.3
// Original source: https://github.com/yckart/jquery.storage.js
// The client-side storage module for various browsers and devices.
//
// Copyright (c) 2012 Yannick Albert (http://yckart.com)
// Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
// Last updated: February 10, 2013
// This file is a Type I clone, with extensive whitespace and comment changes.

;( function( $, window, document ) {

    "use strict" ;

    // Iterate over 'localStorage' and 'sessionStorage' to set up methods for each.
    $.map( [ 'localStorage', 'sessionStorage' ], function ( method ) {

        // Define default options for each storage method.
        var defaults = {
            cookiePrefix : 'fallback:' + method + ':', // Prefix for fallback cookies
            cookieOptions : {
                path : '/',                         // Default cookie path
                domain : document.domain,           // Default cookie domain
                // Set cookie expiry for localStorage, undefined for sessionStorage.
                expires : ( 'localStorage' === method ) ? { expires: 365 } : undefined
            }
        } ;

        // Check for native support of the storage method.
        try {
            $.support[ method ] = method in window && window[ method ] !== null ;
        }
        catch ( e ) {
            // If an error occurs (e.g., security restrictions), assume no support.
            $.support[ method ] = false ;
        }

        // Assign the storage functionality to jQuery's namespace.
        // This function acts as the main entry point for getting/setting/removing items.
        $[ method ] = function ( key, value ) {

            // Merge default options with any user-provided options.
            var options = $.extend( {}, defaults, $[ method ].options ) ;

            // Method to retrieve an item from storage.
            this.getItem = function ( key ) {

                // Helper function to parse and retrieve a single item.
                var returns = function ( key ) {
                    // Use native storage if supported, otherwise fall back to cookies.
                    return JSON.parse( $.support[ method ]
                        ? window[ method ].getItem( key )
                        : $.cookie( options.cookiePrefix + key )
                    ) ;
                } ;

                // If a single key (string) is provided, return its value.
                if ( typeof key === 'string' ) {
                    return returns( key ) ;
                }

                // If an array of keys is provided, retrieve all of them.
                var arr = [ ] ,
                    i = key.length ;
                while ( i-- ) {
                    arr[ i ] = returns( key[ i ] ) ;
                }
                return arr ;
            } ;

            // Method to store an item in storage.
            this.setItem = function ( key, value ) {
                // Convert value to JSON string for storage.
                value = JSON.stringify( value ) ;
                // Use native storage or cookie fallback.
                return $.support[ method ]
                    ? window[ method ].setItem( key, value )
                    : $.cookie( options.cookiePrefix + key, value, options.cookieOptions ) ;
            } ;

            // Method to remove an item from storage.
            this.removeItem = function ( key ) {
                // Use native storage or cookie fallback.
                // For cookies, set value to null and expiry to -1 to delete.
                return $.support[ method ]
                    ? window[ method ].removeItem( key )
                    : $.cookie( options.cookiePrefix + key, null, $.extend( options.cookieOptions, {
                        expires: -1
                    } ) ) ;
            } ;

            // Method to clear all items from storage.
            this.clear = function () {
                // If native storage is supported, just clear it.
                if ( $.support[ method ] ) {
                    return window[ method ].clear() ;
                }
                // If using cookie fallback, iterate and remove all relevant cookies.
                else {
                    // Create a regex to match cookies set by this plugin.
                    var reg = new RegExp( '^' + options.cookiePrefix, '' ) ,
                        // Options for deleting cookies.
                        opts = $.extend( options.cookieOptions, {
                            expires: -1
                        } ) ;

                    // Check if there are any cookies to process.
                    if ( document.cookie && document.cookie !== '' ) {
                        // Map through all cookies.
                        $.map( document.cookie.split( ';' ), function ( cookie ) {
                            // Trim whitespace and test if it's one of our fallback cookies.
                            if ( reg.test( cookie = $.trim( cookie ) ) ) {
                                // Extract the cookie name and delete it.
                                $.cookie( cookie.substr( 0, cookie.indexOf( '=' ) ), null, opts ) ;
                            }
                        } ) ;
                    }
                }
            } ;

            // Determine action based on 'key' and 'value' arguments.
            if ( typeof key !== "undefined" ) {
                // If 'value' is provided: set, remove, or get.
                return typeof value !== "undefined"
                    ? ( value === null // If value is explicitly null, remove the item.
                        ? this.removeItem( key )
                        : this.setItem( key, value ) // Otherwise, set the item.
                    )
                    : this.getItem( key ) ; // If only key is provided, get the item.
            }

            // If no arguments, return the storage object itself for chaining.
            return this ;
        } ;

        // Store the default options directly on the method function.
        $[ method ].options = defaults ;

    } ) ;

}( jQuery, window, document ) ) ;
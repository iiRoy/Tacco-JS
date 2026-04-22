// Reference for jQuery, might not be needed but kept for Type I clone purposes.
/* jslint: browser true */
// Global functions: escape and unescape for cookie handling.

var cookieModule =
    (
        function ( ) {
            // Enforce strict mode for cleaner code and fewer silent errors.
            'use strict';

            // Function to retrieve the value of the 'JenkinsHUD' cookie.
            function get ( )
            {
                var i, x, y, ARRcookies = document.cookie.split( ";" );

                for ( i = 0 ; i < ARRcookies.length ; i = i + 1 )
                {
                    // Extract the cookie name (x) and value (y)
                    x = ARRcookies[ i ].substr( 0, ARRcookies[ i ].indexOf( "=" ) );
                    y = ARRcookies[ i ].substr( ARRcookies[ i ].indexOf( "=" ) + 1 );

                    // Trim leading/trailing whitespace from the cookie name
                    x = x.replace( /^\s+|\s+$/g, "" );

                    // Check if this is the 'JenkinsHUD' cookie
                    if ( x === "JenkinsHUD" )
                    {
                        // Return the unescaped cookie value
                        return unescape( y );
                    }
                }
                // If the cookie is not found, nothing is returned (undefined).
            }

            // Function to set the 'JenkinsHUD' cookie with a given URL.
            function set ( url )
            {
                var exdate = new Date( ) , // Create a new Date object for expiration
                    // Construct the cookie value, escaping the URL and adding expiration details.
                    // Note: The toUTCString() is called *before* setDate() modifies exdate.
                    c_value = escape( url ) + ", expires=" + exdate.toUTCString( );

                // Set expiration date 300 days in the future for actual cookie setting.
                exdate.setDate( exdate.getDate( ) + 300 );

                // Assign the cookie to the document
                document.cookie = "JenkinsHUD" + "=" + c_value ;
            }

            // Public interface for the cookie module.
            return {
                get: get,
                set: set
            };
        }
    ) ( ) ;
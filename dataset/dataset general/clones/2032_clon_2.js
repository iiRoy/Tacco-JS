/*
 *  Website Deep Linker for Apple Devices
 *  Developed by: A.N. Other
 *
 *  Transforms standard web links into native application
 *  URL schemes for seamless mobile app integration.
 */

( function( jq ) {
  jq.fn.appLauncher = function( configParams ) {

    // Prevents browser from redirecting if a native app handles the link
    window.isMinimized = false;
    jq( window ).on( "blur pagehide", function() { window.isMinimized = true; } );

    var preferences = jq.extend( {
      extraHandlers : [ ],
      verboseMode   : false,
      isAppleDevice : /(iPad|iPhone|iPod)/i.test( navigator.userAgent ) // Case-insensitive check for Apple OS
    }, configParams );

    if ( preferences.isAppleDevice || preferences.verboseMode ) {

      // Define the set of native applications and their deep linking rules
      var appHandlers = [
        {
          matchRegex    : /(facebook)/i, // Match Facebook links
          handlerFunction : function( userIdentifier ) {

            var profileId = "";

            if ( isNaN( Number.parseInt( userIdentifier ) ) ) {
              jq.ajax( {
                url       : "https://graph.facebook.com/" + userIdentifier, // Use HTTPS for security
                type      : "GET",
                dataType  : "json",
                async     : false, // Synchronous request for immediate ID retrieval
              } ).done( function( apiResponse ) {
                profileId = apiResponse.id;
              } );
            } else {
              profileId = userIdentifier;
            }

            return "fb://profile/" + profileId; // Construct Facebook deep link
          }
        },
        {
          matchRegex    : /(linkedin)/i, // Match LinkedIn links
          handlerFunction : function( userIdentifier ) {
            return "linkedin://#profile/" + userIdentifier;
          }
        },
        {
          matchRegex    : /(instagram)/i, // Match Instagram links
          handlerFunction : function( userIdentifier ) {
            return "instagram://user?username=" + userIdentifier;
          }
        },
        {
          matchRegex    : /(quirky)/i, // Match Quirky links
          handlerFunction : function( userIdentifier ) {
            return "quirky:///" + userIdentifier;
          }
        },
        {
          matchRegex    : /(twitter)/i, // Match Twitter links
          handlerFunction : function( userIdentifier ) {
            return "twitter://user?screen_name=" + userIdentifier;
          }
        }
      ];

      // Incorporate any custom deep link definitions provided by the user
      appHandlers = appHandlers.concat( preferences.extraHandlers );

      // Process each selected DOM element
      this.each( function() {

        var currentElement = jq( this ),
        originalLink       = jq( this ).attr( "href" ),
        urlParts           = originalLink.split( ".com/" );

        var userReference; // Declare variable for user reference

        if ( currentElement.data( "userRef" ) ) {
          userReference = currentElement.data( "userRef" );
        } else if ( urlParts.length > 1 ) {
          userReference = urlParts[ 1 ];
        } else {
          userReference = "unknown"; // Default value if user reference not found
        }

        jq( appHandlers ).each( function( idx ) {
          if ( appHandlers[ idx ].matchRegex.test( originalLink ) ) {
            currentElement.attr( "href", appHandlers[ idx ].handlerFunction( userReference ) );

            // If the application is not installed on the device, fall back to the original URL
            currentElement.on( "click", function() {
              window.setTimeout( function() {
                if ( !window.isMinimized ) { // Check if the browser window was minimized
                  window.location.href = originalLink; // Redirect to web link
                } else {
                  window.isMinimized = false; // Reset the minimized flag
                }
              }, 1000 ); // Wait for 1 second before checking
            } );

            return false; // Stop iterating after finding a match
          }
        } );

      } );

    }

    return this; // Allow for method chaining

  };
}( jQuery ) );
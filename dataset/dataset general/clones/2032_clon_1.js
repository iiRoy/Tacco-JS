/*
 * This  is  the  start   of  the   jQuery   iOS
 * App Switcher plugin,   developed  by   Ryan
 * Scherf. Its primary function is to convert
 * standard web links into URL schemes, enabling
 * deep linking directly into iOS applications.
 */

( function ( $ ) {
    // Define the 'switcher' plugin method on jQuery's prototype.
    $.fn.switcher = function ( options ) {


        // Initialize a flag to prevent Safari from executing a redirect
        // if an associated application is successfully launched.
        window.hasHidden     =     false;


        // Bind an event listener to detect when the window loses focus
        // or the page is hidden, indicating a potential app switch.
        $( window ) . bind ( "blur pagehide" , function ( ) {
            window . hasHidden = true ;
        } ) ;


        var settings = $.extend ( {
                // Allows for custom, user-defined URL schemes to be added.
                additionalSchemas : [ ] ,
                // Enables debug mode for testing purposes.
                debug             : false ,
                // Detects if the current device is an iOS device.
                iOS               : / ( iPad|iPhone|iPod ) /g . test ( navigator . userAgent )
            } ,
            options
        ) ;


        // Proceed only if on an iOS device or if debugging is enabled.
        if ( settings . iOS || settings . debug ) {

            // This array defines the supported native applications
            // and their corresponding deep-linking schemes.
            var services = [
                {
                    pattern : / ( facebook ) /g , // Pattern to match Facebook links.
                    scheme  : function ( username ) { // Function to generate the Facebook scheme.

                        var facebookId = ""; // Initialize Facebook ID variable.


                        // Check if the username is not a numeric ID.
                        if ( isNaN ( parseInt ( username ) ) ) {
                            // If it's not a numeric ID, fetch it from the Facebook Graph API.
                            $.ajax ( {
                                url       : "http://graph.facebook.com/" + username ,
                                type      : "get" ,
                                dataType  : "json" ,
                                async     : false , // Synchronous request to ensure ID is retrieved.
                            } ) . done ( function ( response ) {
                                facebookId = response . id ; // Extract the Facebook ID from the response.
                            } ) ;
                        } else {
                            // If it's already a numeric ID, use it directly.
                            facebookId = username ;
                        }


                        // Return the constructed Facebook deep-link scheme.
                        return "fb://profile/" + facebookId ;
                    }
                } , // End of Facebook service definition.

                {
                    pattern : / ( linkedin ) /g , // Pattern for LinkedIn.
                    scheme  : function ( username ) {
                        return "linkedin://#profile/" + username ; // LinkedIn scheme.
                    }
                } ,

                {
                    pattern : / ( instagram ) /g , // Pattern for Instagram.
                    scheme  : function ( username ) {
                        return "instagram://user?username=" + username ; // Instagram scheme.
                    }
                } ,

                {
                    pattern : / ( quirky ) /g , // Pattern for Quirky.
                    scheme  : function ( username ) {
                        return "quirky:///" + username ; // Quirky scheme.
                    }
                } ,

                {
                    pattern : / ( twitter ) /g , // Pattern for Twitter.
                    scheme  : function ( username ) {
                        return "twitter://user?screen_name=" + username ; // Twitter scheme.
                    }
                }
            ] ;


            // Append any additional, custom schemas provided in the settings.
            services = services . concat ( settings . additionalSchemas ) ;


            // Iterate over each selected DOM element to apply the switcher logic.
            this . each ( function ( ) {

                var $this      = $ ( this ) , // Cache the current jQuery object.
                    href       = $ ( this ) . attr ( "href" ) , // Get the original href attribute.
                    identifier = href . split ( ".com/" ) ; // Split href to find potential username.

                var username ; // Declare username variable.


                // Determine the username based on data attribute or URL structure.
                if ( $this . data ( "username" ) ) {
                    username = $this . data ( "username" ) ;
                } else if ( identifier . length > 1 ) {
                    username = identifier [ 1 ] ;
                } else {
                    username = "notfound" ; // Default if username isn't found.
                }


                // Iterate through the defined services to find a matching pattern.
                $ ( services ) . each ( function ( i ) {
                    // Check if the current service's pattern matches the link's href.
                    if ( services [ i ] . pattern . test ( href ) ) {

                        // If a match is found, update the href with the deep-link scheme.
                        $this . attr ( "href" , services [ i ] . scheme ( username ) ) ;


                        // Attach a click handler to manage fallback if the app is not installed.
                        $this . bind ( "click" , function ( ) {
                            // Set a timeout to allow the OS to attempt opening the app.
                            setTimeout ( function ( ) {
                                // If the window hasn't hidden (app didn't open), redirect to original URL.
                                if ( ! window . hasHidden ) {
                                    window . location = href ; // Fallback to the original web URL.
                                } else {
                                    // Reset the flag for subsequent clicks.
                                    window . hasHidden = false ;
                                }
                            } , 1000 ) ; // 1-second delay for app launch attempt.
                        } ) ;


                        return false ; // Stop iterating once a match is found and processed.
                    }
                } ) ; // End of services iteration.

            } ) ; // End of this.each iteration.

        } // End of conditional block for iOS/debug mode.


        // Return the jQuery object to maintain chainability.
        return this ;

    } ; // End of $.fn.switcher function.
} ( jQuery ) ) ;
// The plugin is immediately invoked with the jQuery object.
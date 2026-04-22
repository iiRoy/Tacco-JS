/*
 * This JavaScript snippet leverages the jQuery library
 * to ensure responsive behavior for embedded Instagram content.
 *
 * It targets specific iframe elements and applies a custom
 * responsive utility upon certain events.
 */


    $( /* Target the global window object */ window )


        // Attach an event handler to the window.
        // This handler will trigger on both 'load' and 'resize' events.
        .on( 'load resize' ,

            /*
             * Define an anonymous callback function.
             * This function will execute whenever the 'load'
             * or 'resize' event fires on the window.
             */
            function  ( )
            {

                // Within the event handler's scope:

                // Select all iframe elements whose 'src' attribute
                // contains the substring "instagram.com".
                $( 'iframe[src*="instagram.com"]' )


                    // Call the 'responsiveInstagram' method on the selected elements.
                    // This method is expected to be a custom jQuery plugin.
                    .responsiveInstagram( )


                ; // End of the statement applying the responsive plugin.


            } // End of the anonymous function definition.

        ) // End of the .on() method call.


    ; // End of the entire jQuery chain and statement.


// Script execution completes here.
// This ensures Instagram iframes adapt to various screen sizes.
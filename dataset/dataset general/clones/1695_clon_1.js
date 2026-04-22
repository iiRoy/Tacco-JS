$( document ).ready( function() {

    // This section handles the visibility of the main banner element.

    /*
     * When certain navigation tabs are clicked, the banner
     * containing the logo is displayed using a slide-down animation.
     * These tabs are typically associated with portfolio, skills, or contact sections.
     */
    $( '#portfolio-t, #skills-experience-t, #contact-t' ).click( function() {
        $( '#banner' ).slideDown(); // Show the banner smoothly.
    } );

    /*
     * Conversely, when the 'home' tab is clicked, the banner is
     * hidden using a slide-up animation, providing more screen
     * space for the main content on the home page.
     */
    $( '#home-t' ).click( function() {
        $( '#banner' ).slideUp(); // Hide the banner smoothly.
    } );

} ); // End of document ready function.


// Flex Slider Initialization Script
// This block initializes the FlexSlider plugin on elements with the 'flexslider' class.
$( window ).load( function() {

    $( '.flexslider' ).flexslider( {
        animation:     "fade",        // Sets the animation type to 'fade' for transitions.
        animationLoop: true           // Enables continuous looping of the slider.
    } );

} ); // End of window load function for Flex Slider.


/**
 * @function toSend
 * @description Handles the submission of the contact form via an AJAX request.
 *              It sends form data to a PHP script and processes the response.
 */
function toSend() {

    $.ajax( {
        type:     "POST",         // Specifies the HTTP method as POST.
        url:      "mail.php",     // The URL of the server-side script to send data to.
        data:     {               // Data to be sent to the server.
            "name":    $( "#form_name" ).val(),    // Retrieves value from the name input field.
            "mail":    $( "#form_email" ).val(),   // Retrieves value from the email input field.
            "subject": $( "#form_subject" ).val(), // Retrieves value from the subject input field.
            "text":    $( "#form_message" ).val()  // Retrieves value from the message textarea.
        },
        dataType: "text",         // Expected data type from the server response.

        // Callback function executed upon successful AJAX request.
        success: function( html ) {

            // Check if the HTML response contains any data.
            if ( html ) {
                // Parse the JSON string received from the server.
                var tab = eval( "(" + html + ")" );

                // Process individual fields from the server response.
                // If a name is returned, update the form field and then clear it after a delay.
                if ( tab.name != undefined ) {
                    $( "#form_name" ).val( tab.name );
                    setTimeout( '$("#form_name").val("")', 1500 ); // Clear after 1.5 seconds.
                }

                // If an email is returned, update the form field and then clear it.
                if ( tab.mail != undefined ) {
                    $( "#form_email" ).val( tab.mail );
                    setTimeout( '$("#form_email").val("")', 1500 ); // Clear after 1.5 seconds.
                }

                // If a message text is returned, update the form field and then clear it.
                if ( tab.text != undefined ) {
                    $( "#form_message" ).val( tab.text );
                    setTimeout( '$("#form_message").val("")', 1500 ); // Clear after 1.5 seconds.
                }

                // If a subject is returned, update the form field and then clear it.
                if ( tab.subject != undefined ) {
                    $( "#form_subject" ).val( tab.subject );
                    setTimeout( '$("#form_subject").val("")', 1500 ); // Clear after 1.5 seconds.
                }

                // If a main response message is returned, display it and then fade it out.
                if ( tab.main != undefined ) {
                    $( "#response" ).html( tab.main ).fadeIn();
                    setTimeout( '$("#response").fadeOut("slow")', 2000 ); // Fade out after 2 seconds.
                }

            } else {
                // If no data is returned, reload the page.
                window.location.reload();
            }

        } // End of success callback.
    } ); // End of AJAX call.

} // End of toSend function.


/*
 * Tabs functionality based on Skeleton Boilerplate.
 * This is an immediately invoked function expression (IIFE)
 * to encapsulate the tab logic and avoid polluting the global scope.
 */
( function ( $ ) {

    // hashchange handler function:
    // This function is responsible for managing the active state of tabs
    // based on the URL hash.
    function hashchange() {

        var hash    = window.location.hash,                      // Get the current URL hash.
            el      = $( 'ul.tabs [href*="' + hash + '"]' ),    // Find the tab element matching the hash.
            content = $( hash );                                 // Select the content panel corresponding to the hash.

        // Proceed only if a matching tab and content panel are found,
        // and the found tab is not already active.
        if ( el.length && !el.hasClass( 'active' ) && content.length ) {

            // Remove 'active' class from all currently active tabs within the same group.
            el.closest( '.tabs' ).find( '.active' ).removeClass( 'active' );
            el.addClass( 'active' ); // Mark the newly selected tab as active.

            // Hide all sibling content panels, then fade in the selected content panel.
            content.siblings().removeClass( "active" ).fadeOut( 400, function() {
                content.fadeIn().addClass( "active" ); // Make the new content visible and active.
            } );

        } // End of conditional block for tab activation.

    } // End of hashchange function definition.

    // Attach the hashchange handler to the window's 'hashchange' event.
    // The '.skeleton' namespace prevents conflicts with other hashchange handlers.
    $( window ).on( 'hashchange.skeleton', hashchange );

    // Execute the hashchange handler immediately on page load
    // to correctly set the initial tab state if a hash is present.
    hashchange();

    // jQuery's ready handler for hashchange, ensures it runs after DOM is ready.
    $( hashchange );

} )( jQuery ); // Pass jQuery object as an argument to the IIFE.
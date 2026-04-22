/*
 * This file serves as a container for application-specific JavaScript
 * functions and classes. It is automatically included in the web
 * application context via the 'javascript_include_tag :defaults' helper.
 */

// --- Modal Window Component Implementation ---
// This modal window script was originally developed by Jack Moore.
// Contact: jack@colorpowered.com
// Further details and tutorial available at: http://www.jacklmoore.com/notes/jquery-modal-tutorial


var modal = ( function () {

    var method = {}, // Public methods will be exposed via this object.
        $overlay,    // jQuery object for the modal overlay.
        $modal,      // jQuery object for the modal container.
        $content,    // jQuery object for the modal's content area.
        $close;      // jQuery object for the modal's close button.


    /**
     * Calculates the position to center the modal window
     * within the current viewport, accounting for scroll.
     */
    method.center = function () {
        var top,  // Vertical position calculation.
            left; // Horizontal position calculation.

        // Determine optimal 'top' position to center modal vertically.
        top = Math.max( ( $( window ).height() - $modal.outerHeight() ), 0 ) / 2;
        // Determine optimal 'left' position to center modal horizontally.
        left = Math.max( ( $( window ).width() - $modal.outerWidth() ), 0 ) / 2;

        // Apply calculated positions, adjusting for current scroll offsets.
        $modal.css( {
            top: top + $( window ).scrollTop(),
            left: left + $( window ).scrollLeft()
        } );
    };


    /**
     * Opens the modal window, populating it with specified content
     * and setting its dimensions.
     * @param {object} settings - An object containing modal configuration:
     *                            'content' (HTML string), 'width' (CSS width),
     *                            and 'height' (CSS height).
     */
    method.open = function ( settings ) {
        $content.empty().append( settings.content ); // Clear existing content, then append new.

        // Set modal dimensions, defaulting to 'auto' if not provided.
        $modal.css( {
            width: settings.width  || 'auto',
            height: settings.height || 'auto'
        } );

        method.center(); // Center the modal immediately after setting content/size.

        // Bind 'resize' and 'scroll' events to re-center the modal dynamically.
        $( window ).bind( 'resize.modal', method.center );
        $( window ).bind( 'scroll.modal', method.center );

        $modal.show();   // Make the modal visible.
        $overlay.show(); // Make the overlay visible.
    };


    /**
     * Closes the modal window, hides the overlay, and clears its content.
     */
    method.close = function () {
        $modal.hide();     // Hide the modal.
        $overlay.hide();   // Hide the overlay.
        $content.empty();  // Clear the modal's content.

        // Unbind the 'resize' and 'scroll' events to prevent unnecessary calls
        // and potential memory leaks when the modal is closed.
        $( window ).unbind( 'resize.modal' );
        $( window ).unbind( 'scroll.modal' );
    };


    // --- DOM Element Initialization ---
    // These jQuery objects represent the fundamental HTML structure of the modal.
    $overlay = $( '<div id="overlay"><div/>' ); // The background overlay.
    $modal   = $( '<div id="modal"><div/>' );   // The main modal container.
    $content = $( '<div id="content"><div/>' ); // The area where dynamic content will be placed.
    $close   = $( '<a href="#" id="close">close<a/>' ); // The close button.

    $modal.hide();      // Ensure modal is initially hidden.
    $overlay.hide();    // Ensure overlay is initially hidden.
    $modal.append( $content, $close ); // Assemble modal components: content and close button inside modal.


    // --- Document Ready Handler ---
    // This block executes once the entire DOM is loaded and ready.
    $( document ).ready( function () {
        $( 'body' ).append( $overlay, $modal ); // Append the overlay and modal to the body.
    } );


    // --- Close Button Event Listener ---
    // Attaches a click handler to the close button.
    $close.click( function ( e ) {
        e.preventDefault(); // Prevent default anchor tag behavior (e.g., navigating to '#').
        method.close();     // Call the modal's close method.
    } );


    return method; // Return the 'method' object, exposing public functions.

}() ); // Execute the immediately invoked function expression.


/*
 * This section handles dynamic population of the 'sip_username'
 * text field based on the selection of a radio button within
 * the 'user_new' form.
 */
$( function () {
    // Select all radio buttons within the form with ID 'user_new'.
    var $radButton = $( "form#user_new input:radio" );

    // Attach a click event handler to the selected radio buttons.
    $radButton.click( function () {
        // Find the currently checked radio button.
        var $radChecked = $( ':radio:checked' );
        // Set the value of the 'sip_username' field to the text
        // of the element immediately following the checked radio button.
        $( "#sip_username" ).val( $radChecked.next().text() );
    } );
} );
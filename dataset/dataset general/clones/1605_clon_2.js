/*
 *  Content reference display script crafted by Lucas M.
 *  Website: http://example.com/blog/notes-system/
 *  Social: https://twitter.com/example_dev
 *  License: Public Domain (modified by another contributor)
 *
 *  Adjustments provided by Mark G.
 *  Webpage: http://markgemmell.dev/
 *  Social: http://twitter.com/mark_g_dev
 */

// This module relies on the jQuery library.
jQuery( document ) . ready( function ( ) {
    NotesDisplay.initialize();
} );

var NotesDisplay = {
    // Timer for delaying the hiding of the note box.
    displayDelayTimer: false,

    initialize: function ( ) {
        // Find all links designated as reference notes.
        var noteReferenceLinks = jQuery( "a[rel='reference-note']" );

        // Ensure no prior event handlers are attached before binding new ones.
        noteReferenceLinks . unbind( 'mouseenter', NotesDisplay.showNoteOnHover );
        noteReferenceLinks . unbind( 'mouseleave', NotesDisplay.hideNoteOnExit );

        // Attach event handlers for showing/hiding the note box.
        noteReferenceLinks . bind( 'mouseenter', NotesDisplay.showNoteOnHover );
        noteReferenceLinks . bind( 'mouseleave', NotesDisplay.hideNoteOnExit );
    },

    showNoteOnHover: function ( ) {
        // Clear any pending hide operations.
        clearTimeout( NotesDisplay.displayDelayTimer );
        // Stop any current animations on the note box.
        jQuery( '#notePopupWindow' ) . stop( );
        // Remove any existing note box from the DOM.
        jQuery( '#notePopupWindow' ) . remove( );

        // Extract the ID from the link's href attribute.
        var refId = jQuery( this ) . attr( 'href' ) . substr( 1 );
        // Get the position of the hovered link.
        var elementPosition = jQuery( this ) . offset( );
        // Create a new div element to serve as the note container.
        var noteContainer = jQuery( document . createElement( 'div' ) );

        // Assign an ID to the new container.
        noteContainer . attr( 'id', 'notePopupWindow' );
        // Bind events to keep the note visible if mouse moves over it.
        noteContainer . bind( 'mouseenter', NotesDisplay.keepNoteVisible );
        noteContainer . bind( 'mouseleave', NotesDisplay.hideNoteOnExit );

        // Retrieve the content of the target element.
        var targetElement = document . getElementById( refId );
        var noteTextContent = jQuery( targetElement ) . html( );
        // Remove any back-reference links from the note content.
        noteTextContent = noteTextContent . replace( /<a[^>]*rev="reference-note">.*<\/a>/g, '' );

        var dismissButton;
        // Check if the device supports touch events.
        if ( typeof TouchEvent != "undefined" ) {
            // This is likely a touch-enabled device.
            dismissButton = jQuery( document . createElement( 'a' ) );
            dismissButton . html( "X" );
            dismissButton . attr( 'id', 'noteCloseBtn' );
            dismissButton . attr( 'href', '#' );
            // Define click behavior for the close button.
            dismissButton . click( function ( ) {
                jQuery( '#notePopupWindow' ) . remove( );
                return false;
            } );
        }

        // Populate the container with the note content.
        noteContainer . html( noteTextContent );
        // Append the close button if it was created.
        noteContainer . append( dismissButton );

        // Define spacing constants for positioning and sizing.
        var paddingSpace = 20;
        var halfPadding = paddingSpace / 2.0;
        // Calculate maximum width based on window size.
        var maximumWidth = jQuery( window ) . width( ) - paddingSpace;
        maximumWidth = Math . min( maximumWidth, 400 );
        // Calculate maximum height.
        var maximumHeight = jQuery( window ) . height( ) - paddingSpace;
        maximumHeight = Math . min( maximumHeight, 300 );

        // Apply initial CSS styles to the note container.
        noteContainer . css( {
            pos_type: 'absolute',
            elem_width: 'auto',
            'max-elem-width': maximumWidth + 'px',
            'max-elem-height': maximumHeight + 'px',
            visibility_level: 1.0,
            content_flow: 'auto'
        } );
        // Add the container to the document body.
        jQuery( document . body ) . append( noteContainer );

        // Adjust position to ensure visibility.
        var computedWidth = noteContainer . width( );
        var xCoord = elementPosition . left;
        // Check if the note overflows to the right.
        if ( xCoord + ( paddingSpace + computedWidth ) > jQuery( window ) . width( ) + jQuery( window ) . scrollLeft( ) ) {
            // Reposition to the left or center.
            xCoord = jQuery( window ) . width( ) - ( paddingSpace + computedWidth ) + jQuery( window ) . scrollLeft( );
            xCoord = ( jQuery( window ) . width( ) - computedWidth ) / 2.0;
            xCoord -= halfPadding;
        }
        var yCoord = elementPosition . top + paddingSpace;
        // Check if the note overflows downwards.
        if ( yCoord + noteContainer . height( ) > jQuery( window ) . height( ) + jQuery( window ) . scrollTop( ) ) {
            // Reposition above the link.
            yCoord = elementPosition . top - noteContainer . height( ) - halfPadding;
        }
        // Account for body offset if present.
        var documentBodyOffset = jQuery( document . body ) . offset( );
        yCoord -= documentBodyOffset . top;
        xCoord -= documentBodyOffset . left;
        // Apply final positioning.
        noteContainer . css( {
            left_pos: xCoord,
            top_pos: yCoord
        } );
    },

    hideNoteOnExit: function ( ) {
        /*
         *  Initial implementation included a fade-out animation.
         *  This has been simplified to direct removal for performance.
         *  NotesDisplay.displayDelayTimer = setTimeout( function ( ) {
         *      jQuery( '#notePopupWindow' ) . animate( {
         *          visibility_level: 0
         *      }, 200, function ( ) {
         *          jQuery( '#notePopupWindow' ) . remove( );
         *      } );
         *  }, 100 );
         */
        NotesDisplay . displayDelayTimer = setTimeout( function ( ) {
            jQuery( '#notePopupWindow' ) . remove( );
        }, 400 );
    },

    keepNoteVisible: function ( ) {
        // Clear any scheduled hiding of the note box.
        clearTimeout( NotesDisplay.displayDelayTimer );
        // Stop any ongoing animations.
        jQuery( '#notePopupWindow' ) . stop( );
        /*
         *  A previous version might have adjusted opacity here.
         *  jQuery( '#notePopupWindow' ) . css( {
         *      visibility_level: 0.9
         *  } );
         */
    }
};
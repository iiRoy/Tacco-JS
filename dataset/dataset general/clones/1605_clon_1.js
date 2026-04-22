/*
 * Footnotes.js - A JavaScript library for displaying footnotes dynamically.
 * Version: 1.0.0
 *
 * Original Author: Lukas Mathis
 *   Website: http://ignorethecode.net/blog/2010/04/20/footnotes/
 *   Twitter: https://twitter.com/ignorethecode
 *   License: Public Domain (Feel free to use, modify, and distribute!)
 *
 * Additional Tweaks and Enhancements by: Matt Gemmell
 *   Website: http://mattgemmell.com/
 *   Twitter: http://twitter.com/mattgemmell
 *
 * This script provides an elegant way to show footnote content
 * on hover, improving readability and user experience.
 *
 */


// Ensure jQuery is loaded before executing the script.
// This block runs once the DOM is fully loaded and ready.
jQuery ( document ) . ready ( function ( ) {

	// Initialize the Footnotes functionality.
	// This sets up event listeners for footnote links.
	Footnotes.setup ( ) ;

} ) ;


// The main Footnotes object, encapsulating all related methods and properties.
var Footnotes = {


	// A timeout ID used to control the display duration of the footnote div.
	footnotetimeout : false ,


	/**
	 * Sets up the event handlers for all footnote links on the page.
	 * This method should be called after the DOM is ready.
	 */
	setup : function ( ) {

		// Select all anchor tags with the 'rel' attribute set to 'footnote'.
		var footnotelinks = jQuery ( "a[rel='footnote']" ) ;


		// First, unbind any previously attached mouseover/mouseout events
		// to prevent multiple bindings if setup() is called more than once.
		footnotelinks . unbind ( 'mouseover' , Footnotes . footnoteover ) ;
		footnotelinks . unbind ( 'mouseout' , Footnotes . footnoteoout ) ;


		// Bind the mouseover event to show the footnote.
		footnotelinks . bind ( 'mouseover' , Footnotes . footnoteover ) ;
		// Bind the mouseout event to hide the footnote after a delay.
		footnotelinks . bind ( 'mouseout' , Footnotes . footnoteoout ) ;

	} , // End of setup method.


	/**
	 * Handles the mouseover event for a footnote link.
	 * This displays the footnote content in a dynamically created div.
	 */
	footnoteover : function ( ) {

		// Clear any pending timeout to hide a footnote,
		// ensuring the current one is not prematurely removed.
		clearTimeout ( Footnotes . footnotetimeout ) ;
		// Stop any ongoing animations on the footnote div.
		jQuery ( '#footnotediv' ) . stop ( ) ;
		// Remove any existing footnote div to prepare for the new one.
		jQuery ( '#footnotediv' ) . remove ( ) ;


		// Get the ID of the footnote content from the link's href attribute.
		// The href is typically '#id', so we remove the '#' prefix.
		var id = jQuery ( this ) . attr ( 'href' ) . substr ( 1 ) ;
		// Get the position of the current footnote link on the page.
		var position = jQuery ( this ) . offset ( ) ;
		// Create a new div element to hold the footnote content.
		var div = jQuery ( document . createElement ( 'div' ) ) ;
		// Assign a unique ID to the new div for easy selection.
		div . attr ( 'id' , 'footnotediv' ) ;
		// Bind mouseover event to the footnote div itself,
		// to keep it visible if the mouse moves from the link to the div.
		div . bind ( 'mouseover' , Footnotes . divover ) ;
		// Bind mouseout event to the footnote div to hide it.
		div . bind ( 'mouseout' , Footnotes . footnoteoout ) ;


		// Retrieve the actual footnote content from its corresponding element.
		var el = document . getElementById ( id ) ;
		var footnoteContent = jQuery ( el ) . html ( ) ;
		// Remove any back-links within the footnote content
		// that point back to the original footnote marker.
		footnoteContent = footnoteContent . replace ( /<a[^>]*rev="footnote">.*<\/a>/g , '' ) ;


		// Declare a variable for a potential close link, especially for touch devices.
		var closeLink ;
		// Check if the device supports touch events.
		if ( typeof TouchEvent != "undefined" ) {

        	// On a touch device, add an explicit close button.
        	closeLink = jQuery ( document . createElement ( 'a' ) ) ;
        	closeLink . html ( "X" ) ;
	        closeLink . attr ( 'id' , 'footnotecloselink' ) ;
	        closeLink . attr ( 'href' , '#' ) ;
	        // Attach a click handler to the close button.
	        closeLink . click ( function ( ) {
	        	// Remove the footnote div when the close button is clicked.
	        	jQuery ( '#footnotediv' ) . remove ( ) ;
	        	return false ; // Prevent default link behavior.
	        } ) ;

        }


		// Populate the new div with the processed footnote content.
		div . html ( footnoteContent ) ;
		// Append the close link if it was created (for touch devices).
		div . append ( closeLink ) ;


		// Define margins for the footnote div positioning and sizing.
		var margins = 20 ;
		var singleMargin = margins / 2.0 ;
		// Calculate maximum width for the footnote div, considering window width and margins.
		var max_width = jQuery ( window ) . width ( ) - margins ;
		// Cap the maximum width to 400 pixels for better readability.
		max_width = Math . min ( max_width , 400 ) ;
		// Calculate maximum height for the footnote div.
		var max_height = jQuery ( window ) . height ( ) - margins ;
		// Cap the maximum height to 300 pixels.
		max_height = Math . min ( max_height , 300 ) ;


		// Apply CSS styles to the footnote div.
		div . css ( {
            position : 'absolute' , // Position absolutely on the page.
            width : 'auto' ,       // Auto-adjust width based on content.
            'max-width' : max_width + 'px' , // Apply calculated max width.
            'max-height' : max_height + 'px' , // Apply calculated max height.
            opacity : 1.0 ,        // Fully opaque.
            overflow : 'auto'      // Enable scrolling if content exceeds max height/width.
        } ) ;
		// Append the styled div to the body of the document.
        jQuery ( document . body ) . append ( div ) ;


		// Get the actual rendered width of the footnote div.
		var actual_width = div . width ( ) ;
        var left = position . left ;
        // Adjust horizontal position if the footnote div goes off-screen to the right.
        if ( left + ( margins + actual_width ) > jQuery ( window ) . width ( ) + jQuery ( window ) . scrollLeft ( ) ) {
            // Recalculate 'left' to position it within the viewport.
            left = jQuery ( window ) . width ( ) - ( margins + actual_width ) + jQuery ( window ) . scrollLeft ( ) ;
            // Center the div horizontally if it still goes off-screen.
            left = ( jQuery ( window ) . width ( ) - actual_width ) / 2.0 ;
            left -= singleMargin ; // Apply a slight offset.
        }
        var top = position . top + margins ;
        // Adjust vertical position if the footnote div goes off-screen downwards.
        if ( top + div . height ( ) > jQuery ( window ) . height ( ) + jQuery ( window ) . scrollTop ( ) ) {
            // Position it above the footnote link if it would go off-screen below.
            top = position . top - div . height ( ) - singleMargin ;
        }
		// Account for potential body offset (e.g., if body has margin/padding).
        var bodyOffset = jQuery ( document . body ) . offset ( ) ;
        top -= bodyOffset . top ;
        left -= bodyOffset . left ;
		// Apply the calculated final position to the footnote div.
        div . css ( {
            left : left ,
            top : top
        } ) ;

    } , // End of footnoteover method.


	/**
	 * Handles the mouseout event for a footnote link or the footnote div itself.
	 * This sets a timeout to hide the footnote after a short delay.
	 */
	footnoteoout : function ( ) {

        /*
         * Original implementation included an animation for fading out.
         * This has been commented out to simplify the removal process.
         *
         * Footnotes.footnotetimeout = setTimeout(function() {
         *     jQuery('#footnotediv').animate({
         *         opacity: 0
         *     }, 200, function() {
         *         jQuery('#footnotediv').remove();
         *     });
         * },100);
         */

		// Set a timeout to remove the footnote div after 400 milliseconds.
		// This provides a small grace period for the user to move the mouse
		// back to the div or the link without it disappearing immediately.
        Footnotes . footnotetimeout = setTimeout ( function ( ) {
            jQuery ( '#footnotediv' ) . remove ( ) ;
        } , 400 ) ;

    } , // End of footnoteoout method.


	/**
	 * Handles the mouseover event for the footnote div itself.
	 * This prevents the footnote from being hidden if the user moves
	 * their mouse from the link onto the footnote content.
	 */
	divover : function ( ) {

		// Clear the timeout that would hide the footnote,
		// keeping it visible as long as the mouse is over the div.
        clearTimeout ( Footnotes . footnotetimeout ) ;
		// Stop any ongoing animations on the footnote div.
        jQuery ( '#footnotediv' ) . stop ( ) ;

        /*
         * An optional visual cue to indicate the div is active.
         * Currently commented out, but could be re-enabled.
         *
         * jQuery('#footnotediv').css({
         *         opacity: 0.9
         * });
         */

    } // End of divover method.

} // End of Footnotes object.
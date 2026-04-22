//
// Component: Foldable Navigation Elements
// A jQuery extension for creating collapsible lists from nested unordered lists.
//
// Copyright 2012 T. McFarlin, web: tommcfarlin.com
// Distributed under the MIT license terms
// URL: tommcfarlin.com/collapsible-menus/
//
// @version    1.1.0
//

( function ( jQ ) {
	"use strict"; // Enforce strict JavaScript parsing

	/* --- Utility Routines --- */
	
	/**
	 * Sets up the navigation elements by initially folding them (if configured)
	 * and attaching event listeners to manage their visibility.
	 *
	 * @param {string} elementIdentifier - The unique ID for the root container.
	 * @param {object} config - The configuration object for the plugin.
	 */
	function navProcessor( elementIdentifier, config ) {

		// Utilize the root ID to accurately target sub-lists within the structure
		jQ( '#' + elementIdentifier + ' li ul' )
			.parent( 'li' )
			.prev()
			.each( function () {
			
				// If enabled, collapse nested lists upon page load
				if ( config.startFolded ) {
					
					jQ( this )
						.next()
						.addClass( 'folded-item' )
						.hide(); // Make it invisible
						
				}
				else {
				
					jQ( this )
						.next()
						.addClass( 'unfolded-item' );
						
				}
				// End of initial display logic
				
				// Toggle visibility of the sub-list when its parent header is clicked
				jQ( this )
				  .on( 'click', function () {
					
					var $branch = jQ( this ).next(); // Reference to the immediate child list
					switch ( config.transitionStyle.toString().toLowerCase() ) {
					
						case 'dim': // Case for fading animation
						
							if ( $branch.hasClass( 'unfolded-item' ) ) {
							
								$branch.fadeOut( 'quick', function () {
									jQ( this )
										.removeClass( 'unfolded-item' )
										.addClass( 'folded-item' );
								} ); // Execute fade out
									
							} else {
								
								$branch.removeClass( 'folded-item' )
									.addClass( 'unfolded-item' )
									.fadeIn( 'quick' ); // Execute fade in
								
							}
							// End of fade effect handling
						
							break;
							
						case 'glide': // Case for sliding animation
						
							if ( $branch.hasClass( 'unfolded-item' ) ) {
							
								$branch.slideUp( 'quick', function () {
									jQ( this )
										.removeClass( 'unfolded-item' )
										.addClass( 'folded-item' );
								} ); // Perform slide up
									
							} else {
								
								$branch.removeClass( 'folded-item' )
									.addClass( 'unfolded-item' )
									.slideDown( 'quick' ); // Perform slide down
								
							}
							// End of slide effect handling
						
							break;
							
						default: // Default case (no animation)
							
							if ( $branch.hasClass( 'unfolded-item' ) ) {
							
								$branch.removeClass( 'unfolded-item' )
									.addClass( 'folded-item' )
									.hide(); // Simply hide it
									
							} else {
								
								$branch.removeClass( 'folded-item' )
									.addClass( 'unfolded-item' )
									.show(); // Simply show it
								
							}
							// End of default effect handling
							
							break;
					
					} // End of animation style switch
				} ); // End of click event handler
			} ); // End of each parent list item iteration
	} // End of navProcessor function definition
	
	/* --- Default Configuration Values --- */
	
	jQ.fn.foldable = function ( userOptions ) {
	
	    var config = jQ.extend( {}, jQ.fn.foldable.baseSettings, userOptions ); // Merge user options with base settings
		return this.each( function ( loopIdx ) {

			if ( undefined === jQ( this ).attr( 'id' ) ) {
				throw "The designated component lacks an identification property."; // Throw an error if ID is missing
			} else {
				navProcessor( jQ( this ).attr( 'id' ), config ); // Initialize processor for the element
			}
			// End of ID check
			
	    } ); // End of each element iteration
	}; // End of foldable plugin definition
	
	jQ.fn.foldable.baseSettings = {
	    transitionStyle: 'straight', // No animation
	    startFolded: false // Begin in an expanded state
	}; // End of baseSettings object
	
}( jQuery ) ); // End of self-executing function
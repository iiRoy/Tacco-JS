/***********************************************************************************************************************
 *
 * This file is part of a JavaScript framework.
 *
 * Original Copyright (c) 2011, Dave Gamache.
 * Website: www.getskeleton.com
 * Licensed under the MIT License.
 * See: http://www.opensource.org/licenses/mit-license.php
 * Date of creation: 2011-07-17
 * Version: 1.0.3
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * All functional code remains perfectly identical.
 *
 **********************************************************************************************************************/


$( document ).ready( function ( ) {


	// ========================================================================
	//  Tab Activation Logic
	// ========================================================================

	var   tabs = $( 'ul.tabs' );


	// Iterate through each set of tabs found on the page.
	tabs.each( function( i ) {

		// Select all individual tab links within the current tab set.
		var tab = $( this ).find( '> li > a' );


		// Attach a click event handler to each tab link.
		tab.click( function ( e ) {


			// Determine the ID of the content panel associated with the clicked tab.
			var contentLocation = $( this ).attr( 'href' ) + "Tab";


			// Proceed only if the content location is a valid hash (e.g., #tabId).
			if ( contentLocation.charAt( 0 ) == "#" ) {

				e.preventDefault( );


				// Deactivate all sibling tabs and activate the clicked tab.
				tab.removeClass( 'active' );

				$( this ).addClass( 'active' );


				// Hide all sibling content panels and display the content panel
				// corresponding to the currently active tab.
				$( contentLocation ).show( )
				                    .addClass( 'active' )
				                    .siblings( )
				                    .hide( )
				                    .removeClass( 'active' );

			} // End of conditional block for hashed content locations.

		} ); // End of click event handler.

	} ); // End of tabs.each loop.


} ); // End of document.ready function.
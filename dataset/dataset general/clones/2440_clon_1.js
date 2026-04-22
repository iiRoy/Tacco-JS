;
/*
 **********************************************************************************************************************
 * jquery.pajinate.js - version 0.4 - A jQuery plugin for paginating through any number of DOM elements
 *
 * This file is part of the Pajinate project.
 * Copyright (c) 2010, Wes Nolte (http://wesnolte.com)
 * Licensed under the MIT License (MIT-LICENSE.txt) - http://www.opensource.org/licenses/mit-license.php
 * Creation Date: 2010-04-16 | Last Updated: 2010-04-26
 *
 * This version aims to be a Type I clone, preserving all logic and identifiers.
 * Only whitespace and comments have been altered significantly.
 **********************************************************************************************************************
 */

( function ( $ ) {
	$.fn.pajinate = function ( options ) {
		// Declare variables to hold internal state identifiers
		var current_page   = 'current_page';
		var items_per_page = 'items_per_page';

		// Variable to store metadata for the current pagination instance
		var meta;

		// Define default options for the plugin.
		// These can be overridden by passing an 'options' object during initialization.
		var defaults = {
			item_container_id         : '.content',
			items_per_page            : 10,
			nav_panel_id              : '.page_navigation',
			nav_info_id               : '.info_text',
			num_page_links_to_display : 20,
			start_page                : 0,
			wrap_around               : false,
			nav_label_first           : 'First',
			nav_label_prev            : 'Prev',
			nav_label_next            : 'Next',
			nav_label_last            : 'Last',
			nav_order                 : [ "first", "prev", "num", "next", "last" ],
			nav_label_info            : 'Showing {0}-{1} of {2} results',
			show_first_last           : true,
			abort_on_small_lists      : false,
			jquery_ui                 : false,
			jquery_ui_active          : "ui-state-highlight",
			jquery_ui_default         : "ui-state-default",
			jquery_ui_disabled        : "ui-state-disabled"
		};

		// Extend the default options with any user-provided options.
		var options = $.extend( defaults, options );

		// Declare variables to store jQuery objects for various DOM elements.
		var $item_container;
		var $page_container;
		var $items;
		var $nav_panels;

		// Variable to store the total number of page links generated.
		var total_page_no_links;

		// Determine jQuery UI classes based on options.
		var jquery_ui_default_class  = options.jquery_ui ? options.jquery_ui_default  : '';
		var jquery_ui_active_class   = options.jquery_ui ? options.jquery_ui_active   : '';
		var jquery_ui_disabled_class = options.jquery_ui ? options.jquery_ui_disabled : '';

		// Iterate over each selected element to apply the pagination.
		return this.each( function () {
			$page_container   = $( this );                                  // The main container for pagination.
			$item_container   = $( this ).find( options.item_container_id ); // The container holding the items.
			$items            = $page_container.find( options.item_container_id ).children(); // All paginated items.

			// If configured to abort on small lists and items are less than or equal to items per page,
			// then skip pagination and return the container.
			if ( options.abort_on_small_lists && options.items_per_page >= $items.size() ) {
				return $page_container;
			}

			// Store the page container as metadata holder.
			meta = $page_container;

			// Initialize metadata for the current page and items per page.
			meta.data( current_page,   0 );
			meta.data( items_per_page, options.items_per_page );

			// Get the total number of items to be paginated.
			var total_items = $item_container.children().size();

			// Calculate the total number of pages required.
			var number_of_pages = Math.ceil( total_items / options.items_per_page );

			// --- Construct the navigation bar HTML ---
			var more  = '<span class="ellipse more">...</span>';
			var less  = '<span class="ellipse less">...</span>';

			// First and Last links, conditionally rendered based on options.show_first_last.
			var first = !options.show_first_last ? '' : '<a class="first_link ' + jquery_ui_default_class + '" href="">' + options.nav_label_first + '</a>';
			var last  = !options.show_first_last ? '' : '<a class="last_link '  + jquery_ui_default_class + '" href="">' + options.nav_label_last  + '</a>';

			var navigation_html = ""; // Initialize the string for navigation HTML.

			// Build navigation links based on the specified order in options.nav_order.
			for ( var i = 0; i < options.nav_order.length; i++ ) {
				switch ( options.nav_order[ i ] ) {
					case "first":
						navigation_html += first;
						break;
					case "last":
						navigation_html += last;
						break;
					case "next":
						navigation_html += '<a class="next_link ' + jquery_ui_default_class + '" href="">' + options.nav_label_next + '</a>';
						break;
					case "prev":
						navigation_html += '<a class="previous_link ' + jquery_ui_default_class + '" href="">' + options.nav_label_prev + '</a>';
						break;
					case "num":
						navigation_html += less; // Add 'less' ellipsis before page numbers.
						var current_link = 0;
						while ( number_of_pages > current_link ) {
							navigation_html += '<a class="page_link ' + jquery_ui_default_class + '" href="" longdesc="' + current_link + '">' + ( current_link + 1 ) + '</a>';
							current_link++;
						}
						navigation_html += more; // Add 'more' ellipsis after page numbers.
						break;
					default:
						// Do nothing for unrecognized nav_order items.
						break;
				}
			}

			// Find all navigation panels and inject the generated HTML.
			$nav_panels = $page_container.find( options.nav_panel_id );
			$nav_panels.html( navigation_html ).each( function () {
				// Add 'first' and 'last' classes to the respective page links for styling.
				$( this ).find( '.page_link:first' ).addClass( 'first' );
				$( this ).find( '.page_link:last'  ).addClass( 'last'  );
			} );

			// Initially hide the 'more' and 'less' ellipses.
			$nav_panels.children( '.ellipse' ).hide();

			// Set the initial active page link styling.
			// This targets the first actual page link (after 'previous_link').
			$nav_panels.find( '.previous_link' ).next().next().addClass( 'active_page ' + jquery_ui_active_class );

			/* --- Setup Page Display --- */
			// Hide all items initially.
			$items.hide();
			// Show the items for the first page.
			$items.slice( 0, meta.data( items_per_page ) ).show();

			/* --- Setup Nav Menu Display --- */
			// Get the total number of page number links created.
			total_page_no_links = $page_container.find( options.nav_panel_id + ':first' ).children( '.page_link' ).size();
			// Ensure the number of page links to display doesn't exceed the total available links.
			options.num_page_links_to_display = Math.min( options.num_page_links_to_display, total_page_no_links );

			// Hide all page links first.
			$nav_panels.children( '.page_link' ).hide();
			// Then, for each navigation panel, show only the specified number of page links.
			$nav_panels.each( function () {
				$( this ).children( '.page_link' ).slice( 0, options.num_page_links_to_display ).show();
			} );

			/* --- Bind event handlers to navigation links --- */

			// Event handler for the 'First' page link.
			$page_container.find( '.first_link' ).click( function ( e ) {
				e.preventDefault(); // Prevent default link behavior.
				movePageNumbersRight( $( this ), 0 ); // Adjust visible page numbers.
				gotopage( 0 );                        // Go to the first page (index 0).
			} );

			// Event handler for the 'Last' page link.
			$page_container.find( '.last_link' ).click( function ( e ) {
				e.preventDefault(); // Prevent default link behavior.
				var lastPage = total_page_no_links - 1; // Calculate the index of the last page.
				movePageNumbersLeft( $( this ), lastPage ); // Adjust visible page numbers.
				gotopage( lastPage );                       // Go to the last page.
			} );

			// Event handler for the 'Prev' (Previous) page link.
			$page_container.find( '.previous_link' ).click( function ( e ) {
				e.preventDefault(); // Prevent default link behavior.
				showPrevPage( $( this ) ); // Show the previous page.
			} );

			// Event handler for the 'Next' page link.
			$page_container.find( '.next_link' ).click( function ( e ) {
				e.preventDefault(); // Prevent default link behavior.
				showNextPage( $( this ) ); // Show the next page.
			} );

			// Event handler for each individual 'Page' number link.
			$page_container.find( '.page_link' ).click( function ( e ) {
				e.preventDefault(); // Prevent default link behavior.
				gotopage( $( this ).attr( 'longdesc' ) ); // Go to the page specified by 'longdesc' attribute.
			} );

			// Finally, navigate to the initial start page.
			gotopage( parseInt( options.start_page ) );
			toggleMoreLess(); // Update visibility of ellipses.
			if ( !options.wrap_around ) {
				tagNextPrev(); // Disable next/prev links if not wrapping.
			}
		} );

		/**
		 * Navigates to the previous page.
		 * @param {jQuery} e - The element that triggered the event (e.g., the 'Prev' link).
		 */
		function showPrevPage( e ) {
			var new_page = parseInt( meta.data( current_page ) ) - 1; // Calculate the new page index.

			// Check if there's a previous page link visible next to the active one.
			if ( $( e ).siblings( '.active_page' ).prev( '.page_link' ).length == true ) {
				movePageNumbersRight( e, new_page ); // Adjust the visible page number links.
				gotopage( new_page );                // Navigate to the new page.
			} else if ( options.wrap_around ) {
				// If wrap-around is enabled, go to the last page.
				gotopage( total_page_no_links - 1 );
			}
		}

		/**
		 * Navigates to the next page.
		 * @param {jQuery} e - The element that triggered the event (e.g., the 'Next' link).
		 */
		function showNextPage( e ) {
			var new_page = parseInt( meta.data( current_page ) ) + 1; // Calculate the new page index.

			// Check if there's a next page link visible next to the active one.
			if ( $( e ).siblings( '.active_page' ).next( '.page_link' ).length == true ) {
				movePageNumbersLeft( e, new_page ); // Adjust the visible page number links.
				gotopage( new_page );               // Navigate to the new page.
			} else if ( options.wrap_around ) {
				// If wrap-around is enabled, go to the first page.
				gotopage( 0 );
			}
		}

		/**
		 * Navigates to a specific page number.
		 * @param {number|string} page_num - The 0-indexed number of the page to go to.
		 */
		function gotopage( page_num ) {
			page_num = parseInt( page_num, 10 ); // Ensure page_num is an integer.

			var ipp = parseInt( meta.data( items_per_page ) ); // Get items per page.

			// Calculate the starting index for slicing items.
			var start_from = page_num * ipp;

			// Calculate the ending index for slicing items.
			var end_on = start_from + ipp;

			// Hide all items, then show only the items for the current page slice.
			var items = $items.hide().slice( start_from, end_on );
			items.show();

			// Update the active page link: remove 'active_page' from old, add to new.
			$page_container.find( options.nav_panel_id ).children( '.page_link[longdesc=' + page_num + ']' )
				.addClass( 'active_page ' + jquery_ui_active_class )
				.siblings( '.active_page' )
				.removeClass( 'active_page ' + jquery_ui_active_class );

			// Update the current page in metadata.
			meta.data( current_page, page_num );

			/*########## Ajout de l'option page courante + nombre de pages ##########*/
			var $current_page = parseInt( meta.data( current_page ) + 1 ); // Current page (1-indexed).
			// Get the total number of items again (redundant but kept for clone).
			var total_items = $item_container.children().size();
			// Calculate the total number of pages needed again (redundant but kept for clone).
			var $number_of_pages = Math.ceil( total_items / options.items_per_page );
			/*##################################################################*/

			// Update the information text display.
			$page_container.find( options.nav_info_id ).html(
				options.nav_label_info
					.replace( "{0}", start_from + 1 )
					.replace( "{1}", start_from + items.length )
					.replace( "{2}", $items.length )
					.replace( "{3}", $current_page )
					.replace( "{4}", $number_of_pages )
			);

			// Update the visibility of the 'more'/'less' ellipses.
			toggleMoreLess();

			// Add/remove disabled classes for next/prev links based on page boundaries.
			tagNextPrev();

			// If an 'onPageDisplayed' callback is defined, invoke it.
			if ( typeof( options.onPageDisplayed ) !== "undefined" ) {
				options.onPageDisplayed.call( this, page_num + 1 ); // Pass 1-indexed page number.
			}
		}

		/**
		 * Shifts the displayed index of page numbers to the left.
		 * This typically happens when navigating to a later page and more numbers need to appear.
		 * @param {jQuery} e    - The event triggering element.
		 * @param {number} new_p - The new page number being navigated to.
		 */
		function movePageNumbersLeft( e, new_p ) {
			var new_page = new_p; // The target page index.

			var $current_active_link = $( e ).siblings( '.active_page' ); // The currently active page link.

			// If the target page link is not currently visible, then shift the display.
			if ( $current_active_link.siblings( '.page_link[longdesc=' + new_page + ']' ).css( 'display' ) == 'none' ) {
				$nav_panels.each( function () {
					$( this ).children( '.page_link' ).hide() // Hide all page links first.
						.slice( parseInt( new_page - options.num_page_links_to_display + 1 ), new_page + 1 ).show(); // Show a new slice.
				} );
			}
		}

		/**
		 * Shifts the displayed index of page numbers to the right.
		 * This typically happens when navigating to an earlier page and more numbers need to appear.
		 * @param {jQuery} e    - The event triggering element.
		 * @param {number} new_p - The new page number being navigated to.
		 */
		function movePageNumbersRight( e, new_p ) {
			var new_page = new_p; // The target page index.

			var $current_active_link = $( e ).siblings( '.active_page' ); // The currently active page link.

			// If the target page link is not currently visible, then shift the display.
			if ( $current_active_link.siblings( '.page_link[longdesc=' + new_page + ']' ).css( 'display' ) == 'none' ) {
				$nav_panels.each( function () {
					$( this ).children( '.page_link' ).hide() // Hide all page links first.
						.slice( new_page, new_page + parseInt( options.num_page_links_to_display ) ).show(); // Show a new slice.
				} );
			}
		}

		/**
		 * Toggles the visibility of the 'more' and 'less' ellipses
		 * based on whether there are hidden page numbers before/after the visible range.
		 */
		function toggleMoreLess() {
			// If the last visible page link does not have the 'last' class, show 'more'.
			if ( !$nav_panels.children( '.page_link:visible' ).hasClass( 'last' ) ) {
				$nav_panels.children( '.more' ).show();
			} else {
				$nav_panels.children( '.more' ).hide();
			}

			// If the first visible page link does not have the 'first' class, show 'less'.
			if ( !$nav_panels.children( '.page_link:visible' ).hasClass( 'first' ) ) {
				$nav_panels.children( '.less' ).show();
			} else {
				$nav_panels.children( '.less' ).hide();
			}
		}

		/**
		 * Adds or removes the 'no_more' (disabled) class to the 'first'/'prev' and 'last'/'next' links
		 * based on whether the current page is the first or last page.
		 */
		function tagNextPrev() {
			// If the currently active page is the very last page.
			if ( $nav_panels.children( '.last' ).hasClass( 'active_page' ) ) {
				$nav_panels.children( '.next_link' ).add( '.last_link' ).addClass( 'no_more ' + jquery_ui_disabled_class );
			} else {
				$nav_panels.children( '.next_link' ).add( '.last_link' ).removeClass( 'no_more ' + jquery_ui_disabled_class );
			}

			// If the currently active page is the very first page.
			if ( $nav_panels.children( '.first' ).hasClass( 'active_page' ) ) {
				$nav_panels.children( '.previous_link' ).add( '.first_link' ).addClass( 'no_more ' + jquery_ui_disabled_class );
			} else {
				$nav_panels.children( '.previous_link' ).add( '.first_link' ).removeClass( 'no_more ' + jquery_ui_disabled_class );
			}
		}

	}; // End of $.fn.pajinate function.

} )( jQuery ); // Immediately Invoked Function Expression (IIFE) with jQuery alias.
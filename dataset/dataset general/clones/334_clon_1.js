/**
 *
 *  jQuery.ScrollableTab - A plugin for managing and scrolling multiple tabs.
 *
 *  @copyright (c) 2010 Astun Technology Ltd - Visit us at http://www.astuntechnology.com
 *  This software is dual licensed under both MIT and GPL licenses.
 *  Date of creation: 28th of April, 2010
 *  @author Aamir Afridi - Contact: aamirafridi(at)gmail(dot)com | Personal website: http://www.aamirafridi.com
 *  @version 1.0 - Initial release
 *
 */

; ( function ( $ ) {


	// Global plugin default settings configuration
	var settings = {

		'animationSpeed' : 100, // The speed, in milliseconds, at which the tabs will animate or scroll.

		'closable'       : false, // Boolean flag to determine if tabs can be closed by the user.

		'resizable'      : false, // Boolean flag to allow resizing of the tabs container.

		'resizeHandles'  : 'e,s,se', // Specifies the handles for resizing (East, South, South-East).

		'loadLastTab'    : false, // If true, the plugin will scroll to the last tab upon loading; otherwise, it defaults to the first tab.

		'easing'         : 'swing' // The easing equation to use for animations (e.g., 'swing', 'linear').

	};


	// The main plugin function definition
	$.fn.scrollabletab = function ( options ) {


		// Optional: Check for the existence of the 'scrollTo' plugin.
		// If it's not available, an alert would typically be shown.
		// For now, it's commented out to avoid disrupting execution if not needed.
		// if ( !$.fn.scrollTo ) return alert( 'Error:\nScrollTo plugin not available.' );


		// Iterate over each selected element to apply the plugin
		return this.each( function () {


			// Extend the default settings with any user-provided options.
			var o = $.extend( {}, settings, options ),

				// Cache the jQuery object for the current element (the tabs container).
				$tabs = $( this ),

				// Find the navigation element within the tabs container.
				$tabsNav = $tabs.find( '.ui-tabs-nav' ),

				// This variable will hold a reference to the wrapper containing the next and previous buttons.
				$nav;


			// Adjust the CSS class for the navigation.
			// $tabsNav.removeClass( 'ui-corner-all' ).addClass( 'ui-corner-top' );

			// Apply necessary inline styles for positioning and padding.
			$tabs.css( { 'padding' : 2, 'position' : 'relative' } );

			// $tabsNav.css( 'position', 'inherit' );


			// Wrap inner items to create the scrollable structure.
			// First, wrap the entire tabs container with a main wrapper.
			// Then, find the navigation, hide its overflow, and wrap its contents
			// with an inner wrapper that has a very large width to allow horizontal scrolling,
			// and a `span` to check the total width of the tab items.
			$tabs.wrap( '<div id="stTabswrapper" class="stTabsMainWrapper" style="position:relative"/>' )
				 .find( '.ui-tabs-nav' )
				 .css( 'overflow', 'hidden' )
				 .wrapInner( '<div class="stTabsInnerWrapper" style="width:30000px"><span class="stWidthChecker"/></div>' );


			// Cache references to newly created elements for easier access.
			var $widthChecker  = $tabs.find( '.stWidthChecker' ),

				$itemContainer = $tabs.find( '.stTabsInnerWrapper' ),

				// Get the parent wrapper and set its width to match the tabs container.
				$tabsWrapper   = $tabs.parents( '#stTabswrapper' ).width( $tabs.outerWidth( true ) );


			// Fix for a Safari browser specific bug related to width calculation.
			if ( $.browser.safari ) {

				$tabsWrapper.width( $tabs.width() + 6 );

			}

			// alert($tabsWrapper.width()); // Debugging line, commented out.


			// Check if resizing is enabled via options.
			if ( o.resizable ) {

				// Ensure the jQuery UI Resizable plugin is available.
				if ( !!$.fn.resizable ) {

					$tabsWrapper.resizable( {

						minWidth  : $tabsWrapper.width(),          // Minimum width for resizing.
						maxWidth  : $tabsWrapper.width() * 2,      // Maximum width for resizing (double the initial width).
						minHeight : $tabsWrapper.height(),         // Minimum height for resizing.
						maxHeight : $tabsWrapper.height() * 2,     // Maximum height for resizing (double the initial height).
						handles   : o.resizeHandles,               // Resizing handles as specified in options.
						alsoResize: $tabs,                         // Also resize the tabs element itself.

						// start : function(){  },                 // Callback function when resizing starts (commented out).

						resize    : function () {

							$tabs.trigger( 'resized' ); // Trigger a custom event on resize.

						}

						// stop: function(){ $tabs.trigger('scrollToTab',$tabsNav.find('li.ui-tabs-selected')); } // Callback on stop (commented out).

					} );

				} else {

					// Alert if resizable is enabled but the plugin is missing.
					alert( 'Error:\nCannot be resizable because "jQuery.resizable" plugin is not available.' );

				}

			}


			// Add navigation icons (previous and next arrows) to the tabs wrapper.

			// Calculate the top margin for the arrows to vertically center them.
			// (Total height of nav / 2) - (Total height of arrow / 2)
			var arrowsTopMargin = ( parseInt( parseInt( $tabsNav.innerHeight( true ) / 2 ) - 8 ) ),

				// Common CSS properties for the navigation arrows.
				arrowsCommonCss = {

					'cursor'   : 'pointer',
					'z-index'  : 1000,
					'position' : 'absolute',
					'top'      : 3,
					'height'   : $tabsNav.outerHeight() - ( $.browser.safari ? 2 : 1 ) // Adjust height for Safari.

				};


			// Prepend the navigation div to the tabs wrapper.
			$tabsWrapper.prepend(

				$nav = $( '<div/>' )

					.disableSelection() // Prevent text selection on navigation elements.

					.css( { 'position' : 'relative', 'z-index' : 3000, 'display' : 'none' } ) // Initial styling, hidden by default.

					.append(

						// Append the 'Previous' tab navigation button.
						$( '<span/>' )

							.disableSelection()

							.attr( 'title', 'Previous tab' )

							.css( arrowsCommonCss )

							.addClass( 'ui-state-active ui-corner-tl ui-corner-bl stPrev stNav' ) // Add UI classes for styling.

							.css( 'left', 3 ) // Position the button to the left.

							.append( $( '<span/>' ).disableSelection().addClass( 'ui-icon ui-icon-carat-1-w' ).html( 'Previous tab' ).css( 'margin-top', arrowsTopMargin ) ) // Add arrow icon.

							.click( function () {

								// If the button is disabled, do nothing.
								if ( $( this ).hasClass( 'ui-state-disabled' ) ) return;

								// Calculate the index of the previous tab.
								var prevIndex = $tabsNav.find( 'li.ui-tabs-selected' ).prevAll().length - 1;

								// Trigger a click on the previous tab's anchor to select it.
								$tabsNav.find( 'li' ).eq( prevIndex ).find( 'a' ).trigger( 'click' );

								return false; // Prevent default anchor behavior.

							} ),

						// Append the 'Next' tab navigation button.
						$( '<span/>' )

							.disableSelection()

							.attr( 'title', 'Next tab' )

							.css( arrowsCommonCss )

							.addClass( 'ui-state-active ui-corner-tr ui-corner-br stNext stNav' ) // Add UI classes for styling.

							.css( { 'right' : 3 } ) // Position the button to the right.

							.append( $( '<span/>' ).addClass( 'ui-icon ui-icon-carat-1-e' ).html( 'Next tab' ).css( 'margin-top', arrowsTopMargin ) ) // Add arrow icon.

							.click( function () {

								// Calculate the index of the next tab.
								var nextIndex = $tabsNav.find( 'li.ui-tabs-selected' ).prevAll().length + 1;

								// Trigger a click on the next tab's anchor to select it.
								$tabsNav.find( 'li' ).eq( nextIndex ).find( 'a' ).trigger( 'click' );

								return false; // Prevent default anchor behavior.

							} )

					)

			);


			// Bind custom events to the $tabs element to handle various functionalities.
			$tabs

				// Event: 'tabsremove' - triggered when a tab is removed.
				.bind( 'tabsremove', function () {

					// After removal, scroll to the appropriate tab,
					// update navigation visibility, and enable/disable arrows.
					$tabs.trigger( 'scrollToTab' ).trigger( 'navHandler' ).trigger( 'navEnabler' );

				} )


				// Event: 'addCloseButton' - adds a close button to tabs if `closable` is true.
				.bind( 'addCloseButton', function () {

					// If tabs are not closable, exit.
					if ( !o.closable ) return;


					// Iterate through each tab list item.
					$( this ).find( '.ui-tabs-nav li' ).each( function () {

						// If the tab already has a close button, skip it.
						if ( $( this ).find( '.ui-tabs-close' ).length > 0 ) return;

						// Calculate the top margin for the close button to vertically center it.
						var closeTopMargin = parseInt( parseInt( $tabsNav.find( 'li:first' ).innerHeight() / 2, 10 ) - 8 );


						// Append the close button span to the tab.
						$( this ).disableSelection().append(

							$( '<span style="float:left;cursor:pointer;margin:' + closeTopMargin + 'px 2px 0 -11px" class="ui-tabs-close ui-icon ui-icon-close" title="Close this tab"></span>' )

								.click( function () {

									// Remove the tab using the jQuery UI tabs 'remove' method.
									$tabs.tabs( 'remove', $( this ).parents( 'li' ).prevAll().length );


									// If only one tab remains, hide all close buttons.
									if ( $tabs.tabs( 'length' ) == 1 ) {

										$tabsNav.find( '.ui-icon-close' ).hide();

									} else {

										// Otherwise, ensure all close buttons are visible.
										$tabsNav.find( '.ui-icon-close' ).show();

									}


									// Call the custom callback function if provided.
									if ( $.isFunction( o.onTabClose ) ) {

										o.onTabClose();

									}

									return false; // Prevent default action.

								} )

						);

						// Ensure all close buttons are visible after adding.
						$tabsNav.find( '.ui-icon-close' ).show();

					} );

				} )


				// Event: 'tabsadd' - triggered when a new tab is added.
				.bind( 'tabsadd', function ( event ) {

					// Select the newly added tab (the last one).
					$tabs.tabs( 'select', $tabs.tabs( 'length' ) - 1 );


					// Remove any extra span added to the tab by jQuery UI (if present).
					var $lastTab = $tabsNav.find( 'li:last' );

					if ( $lastTab.find( 'a span' ).length > 0 ) {

						$lastTab.find( 'a' ).html( $lastTab.find( 'a span' ).html() );

					}


					// Move the list item to the inner wrapper for proper scrolling.
					$lastTab.appendTo( $widthChecker );


					// Trigger necessary events: add close button, bind click,
					// handle navigation visibility, and scroll to the new tab.
					$tabs
						.trigger( 'addCloseButton' )
						.trigger( 'bindTabClick' )
						.trigger( 'navHandler' )
						.trigger( 'scrollToTab' );

				} ) // End of 'tabsadd' event handler.


				// Event: 'addTab' - a custom event to simplify adding new tabs.
				.bind( 'addTab', function ( event, label, content ) {

					// Generate a unique random ID for the new tab's content div.
					var tabid = 'stTab-' + ( Math.floor( Math.random() * 10000 ) );

					// Append the content div to the body.
					$( 'body' ).append( $( '<div id="' + tabid + '"/>' ).append( content ) );

					// Add the tab using the jQuery UI tabs 'add' method.
					$tabs.tabs( 'add', '#' + tabid, label );

				} ) // End of 'addTab' event handler.


				// Event: 'bindTabClick' - Binds click handlers to tab anchors for custom scrolling logic.
				.bind( 'bindTabClick', function () {

					// Handle scroll when a user manually clicks on a tab.
					$tabsNav.find( 'a' ).click( function () {

						var $liClicked = $( this ).parents( 'li' ); // The clicked tab list item.

						var navWidth   = $nav.find( '.stPrev' ).outerWidth( true ); // Width of navigation buttons.


						// debug('left=' + ($liClicked.offset().left) + ' and tabs width = ' + ($tabs.width() - navWidth)); // Debugging line.

						// If the clicked tab is partially hidden on the left.
						if ( ( $liClicked.position().left - navWidth ) < 0 ) {

							$tabs.trigger( 'scrollToTab', [ $liClicked, 'tabClicked', 'left' ] )

						}

						// If the clicked tab is partially hidden on the right.
						else if ( ( $liClicked.outerWidth() + $liClicked.position().left ) > ( $tabs.width() - navWidth ) ) {

							$tabs.trigger( 'scrollToTab', [ $liClicked, 'tabClicked', 'right' ] )

						}


						// Enable or disable next and previous arrows based on tab visibility.
						$tabs.trigger( 'navEnabler' );

						return false; // Prevent default anchor behavior.

					} );

				} )


				// Event: 'scrollToTab' - Scrolls the tab navigation to a specified tab.
				.bind( 'scrollToTab', function ( event, $tabToScrollTo, clickedFrom, hiddenOnSide ) {

					// If no specific tab is provided, scroll to the currently selected tab.
					$tabToScrollTo = ( typeof $tabToScrollTo != 'undefined' ) ? $( $tabToScrollTo ) : $tabsNav.find( 'li.ui-tabs-selected' );


					// Calculate the width of the navigation buttons if they are visible.
					var navWidth = $nav.is( ':visible' ) ? $nav.find( '.stPrev' ).outerWidth( true ) : 0;

					// debug($tabToScrollTo.prevAll().length) // Debugging line.


					// Calculate the offset for scrolling.
					var offsetLeft = -( $tabs.width() - ( $tabToScrollTo.outerWidth( true ) + navWidth + parseInt( $tabsNav.find( 'li:last' ).css( 'margin-right' ), 10 ) ) );

					// Adjust offset if clicked from a tab and hidden on the left.
					offsetLeft = ( clickedFrom == 'tabClicked' && hiddenOnSide == 'left' ) ? -navWidth : offsetLeft;

					// Adjust offset if clicked from a tab and hidden on the right.
					offsetLeft = ( clickedFrom == 'tabClicked' && hiddenOnSide == 'right' ) ? offsetLeft : offsetLeft;

					// debug(offsetLeft); // Debugging line.


					// Define scroll settings for the 'scrollTo' plugin.
					var scrollSettings = { 'axis' : 'x', 'margin' : true, 'offset' : { 'left' : offsetLeft }, 'easing' : o.easing || '' };

					// debug(-($tabs.width()-(116+navWidth))); // Debugging line.

					// Perform the scroll animation.
					$tabsNav.scrollTo( $tabToScrollTo, o.animationSpeed, scrollSettings );

				} )


				// Event: 'navEnabler' - Enables or disables navigation arrows based on selected tab position.
				.bind( 'navEnabler', function () {

					// Use a timeout to ensure DOM updates are complete before checking.
					setTimeout( function () {

						// Check if the last or first tab is currently selected.
						var isLast   = $tabsNav.find( '.ui-tabs-selected' ).is( ':last-child' ),

							isFirst  = $tabsNav.find( '.ui-tabs-selected' ).is( ':first-child' ),

							$ntNav   = $tabsWrapper.find( '.stNext' ), // Next navigation button.

							$pvNav   = $tabsWrapper.find( '.stPrev' ); // Previous navigation button.


						// debug('isLast = ' + isLast + ' - isFirst = ' + isFirst); // Debugging line.


						// Logic to enable/disable buttons.
						if ( isLast ) {

							$pvNav.removeClass( 'ui-state-disabled' ); // Enable previous.
							$ntNav.addClass( 'ui-state-disabled' );    // Disable next.

						} else if ( isFirst ) {

							$ntNav.removeClass( 'ui-state-disabled' ); // Enable next.
							$pvNav.addClass( 'ui-state-disabled' );    // Disable previous.

						} else {

							$ntNav.removeClass( 'ui-state-disabled' ); // Enable next.
							$pvNav.removeClass( 'ui-state-disabled' ); // Enable previous.

						}

					}, o.animationSpeed ); // Use animation speed as timeout duration.

				} )


				// Event: 'navHandler' - Determines whether navigation arrows should be shown or hidden.
				.bind( 'navHandler', function () {

					// Compare the total width of tab items ($widthChecker) against the visible navigation area ($tabsNav).
					// If tab items are wider, show navigation; otherwise, hide it.
					if ( $widthChecker.width() > $tabsNav.width() ) {

						$nav.show(); // Show navigation buttons.

						// Add left margin to the first tab to prevent it from being hidden by the 'Previous' button.
						$tabsNav.find( 'li:first' ).css( 'margin-left', $nav.find( '.stPrev' ).outerWidth( true ) );

					} else {

						$nav.hide(); // Hide navigation buttons.

						// Remove the extra margin from the first element if navigation is hidden.
						$tabsNav.find( 'li:first' ).css( 'margin-left', 0 );

					}

				} )


				// Event: 'tabsselect' - Triggered when a tab is selected (jQuery UI event).
				.bind( 'tabsselect', function () {

					// $tabs.trigger('navEnabler'); // Enable/disable navigation arrows on tab selection (commented out).

				} )


				// Event: 'resized' - Custom event triggered when the tabs container is resized.
				.bind( 'resized', function () {

					// Re-evaluate navigation visibility and scroll to the currently selected tab.
					$tabs.trigger( 'navHandler' );
					$tabs.trigger( 'scrollToTab', $tabsNav.find( 'li.ui-tabs-selected' ) );

				} )


				// Initial triggers to set up existing tabs and navigation.
				.trigger( 'addCloseButton' ) // Add close buttons to any pre-existing tabs.
				.trigger( 'bindTabClick' )   // Bind click handlers for existing tabs.

				// For tabs that already exist on page load:
				.trigger( 'navHandler' )   // Handle initial navigation visibility.
				.trigger( 'navEnabler' ); // Enable/disable arrows based on initial tab selection.


			// If the 'loadLastTab' option is true, select the last tab after a short delay.
			if ( o.loadLastTab ) {

				setTimeout( function () { $tabsNav.find( 'li:last a' ).trigger( 'click' ) }, o.animationSpeed );

			}

		} );


		// Helper function for debugging purposes, logs messages to the console.
		function debug ( obj ) {

			console.log( obj );

		}

	};

} )( jQuery );


/**
 *
 *  jQuery.ScrollTo - An intuitive plugin for easy element scrolling with jQuery.
 *
 *  Copyright (c) 2007-2009 Ariel Flesler - Contact: aflesler(at)gmail(dot)com | Blog: http://flesler.blogspot.com
 *  This plugin is dual licensed under both MIT and GPL licenses.
 *  Last updated: May 25, 2009
 *  @author Ariel Flesler
 *  @version 1.4.2
 *
 *  Project homepage: http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 *
 */
; ( function ( d ) {

	// Expose the scrollTo function on the jQuery object and as a global.
	var k = d.scrollTo = function ( a, i, e ) {

		return d( window ).scrollTo( a, i, e );

	};


	// Default settings for the scrollTo plugin.
	k.defaults = {

		axis     : 'xy', // Default scroll axis (x and y).

		duration : parseFloat( d.fn.jquery ) >= 1.3 ? 0 : 1 // Animation duration (0 for jQuery 1.3+, 1 for older versions).

	};


	// Utility function to get the scrollable element (window or specific container).
	k.window = function ( a ) {

		return d( window )._scrollable();

	};


	// Extend jQuery's prototype to include a '_scrollable' method.
	d.fn._scrollable = function () {

		return this.map( function () {

			var a = this, // Current element in the map.

				// Determine if the element is a scrollable container (iframe, document, html, body).
				i = !a.nodeName || d.inArray( a.nodeName.toLowerCase(), [ 'iframe', '#document', 'html', 'body' ] ) != -1;

			// If not a standard scrollable element, return the element itself.
			if ( !i ) return a;

			// Get the document element for the current context.
			var e = ( a.contentWindow || a ).document || a.ownerDocument || a;

			// Return the appropriate scrollable element based on browser compatibility.
			return d.browser.safari || e.compatMode == 'BackCompat' ? e.body : e.documentElement;

		} );

	};


	// The main scrollTo method for jQuery objects.
	d.fn.scrollTo = function ( n, j, b ) {

		// Handle overloaded arguments: if 'j' is an object, it's actually the options 'b'.
		if ( typeof j == 'object' ) {

			b = j;
			j = 0;

		}

		// If 'b' is a function, treat it as the 'onAfter' callback.
		if ( typeof b == 'function' ) b = { onAfter : b };


		// Extend the options with defaults.
		b = d.extend( {}, k.defaults, b );

		// Set animation speed, defaulting to 'speed' or 'duration' from options.
		j = j || b.speed || b.duration;


		// If queueing is enabled and there are multiple axes, halve the duration.
		b.queue = b.queue && b.axis.length > 1;

		if ( b.queue ) j /= 2;


		// Normalize offset and over options to objects with 'top' and 'left' properties.
		b.offset = p( b.offset );
		b.over = p( b.over );


		// Iterate over each scrollable element.
		return this._scrollable().each( function () {

			var q = this, // The current scrollable DOM element.
				r = d( q ), // jQuery wrapper for the scrollable element.
				f = n, // Target to scroll to.
				s, // Stores the offset of the target element.
				g = {}, // Object to store animation properties (scrollTop/scrollLeft).
				u = r.is( 'html,body' ); // Check if the scrollable element is html or body.


			// Determine the target position 'f'.
			switch ( typeof f ) {

				case 'number':
				case 'string':

					// If 'f' is a number or a string representing a number with units.
					if ( /^([+-]=)?\d+(\.\d+)?(px|%)?$/.test( f ) ) {

						f = p( f ); // Normalize to an object with 'top' and 'left'.
						break;

					}

					// If 'f' is a selector string, find the element within the current context.
					f = d( f, this );

				case 'object':

					// If 'f' is a jQuery object or a DOM element.
					if ( f.is || f.style ) s = ( f = d( f ) ).offset(); // Get its offset.

			}


			// Iterate over each axis ('x' and 'y') specified in options.
			d.each( b.axis.split( '' ), function ( a, i ) {

				var e = i == 'x' ? 'Left' : 'Top', // 'Left' for x-axis, 'Top' for y-axis.
					h = e.toLowerCase(), // 'left' or 'top'.
					c = 'scroll' + e, // 'scrollLeft' or 'scrollTop'.
					l = q[ c ], // Current scroll position.
					m = k.max( q, i ); // Maximum scroll position for this axis.


				if ( s ) {

					// Calculate target scroll position based on element offset.
					g[ c ] = s[ h ] + ( u ? 0 : l - r.offset()[ h ] );

					// Adjust for margins and borders if specified.
					if ( b.margin ) {

						g[ c ] -= parseInt( f.css( 'margin' + e ) ) || 0;
						g[ c ] -= parseInt( f.css( 'border' + e + 'Width' ) ) || 0;

					}

					// Apply additional offset.
					g[ c ] += b.offset[ h ] || 0;

					// Apply 'over' adjustment (scroll past element).
					if ( b.over[ h ] ) g[ c ] += f[ i == 'x' ? 'width' : 'height' ]() * b.over[ h ];

				} else {

					// If 'f' is a numeric value or percentage.
					var o = f[ h ];
					g[ c ] = o.slice && o.slice( -1 ) == '%' ? parseFloat( o ) / 100 * m : o;

				}


				// Ensure scroll position is within valid bounds (0 to max).
				if ( /^\d+$/.test( g[ c ] ) ) g[ c ] = g[ c ] <= 0 ? 0 : Math.min( g[ c ], m );


				// If this is the first axis and queueing is enabled.
				if ( !a && b.queue ) {

					// If current scroll position is different from target, add 'onAfterFirst' callback.
					if ( l != g[ c ] ) t( b.onAfterFirst );

					delete g[ c ]; // Remove from current animation step.

				}

			} );


			// Add the 'onAfter' callback for the animation completion.
			t( b.onAfter );


			// Helper function to execute a callback.
			function t ( a ) {

				r.animate( g, j, b.easing, a && function () {

					a.call( this, n, b ); // Call the callback with context and arguments.

				} );

			}

		} ).end(); // End of each loop, return the original jQuery object.

	};


	// Utility function to get the maximum scroll position for an axis.
	k.max = function ( a, i ) {

		var e = i == 'x' ? 'Width' : 'Height', // 'Width' for x-axis, 'Height' for y-axis.
			h = 'scroll' + e; // 'scrollWidth' or 'scrollHeight'.

		// If not html/body, return scroll dimension minus client dimension.
		if ( !d( a ).is( 'html,body' ) ) return a[ h ] - d( a )[ e.toLowerCase() ]();


		// For html/body, consider documentElement and body dimensions.
		var c = 'client' + e, // 'clientWidth' or 'clientHeight'.
			l = a.ownerDocument.documentElement, // Document's root element.
			m = a.ownerDocument.body; // Document's body element.

		// Return the maximum scrollable height/width, accounting for browser quirks.
		return Math.max( l[ h ], m[ h ] ) - Math.min( l[ c ], m[ c ] );

	};


	// Utility function to normalize position values into an object {top, left}.
	function p ( a ) {

		return typeof a == 'object' ? a : { top : a, left : a };

	}

} )( jQuery );
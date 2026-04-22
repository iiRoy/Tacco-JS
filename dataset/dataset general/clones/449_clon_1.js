/*
 * This is a Type I clone of the original fancyBox JavaScript file.
 * The original code is maintained exactly in its logical structure.
 * Only whitespace and comments have been altered to create a visually distinct version.
 * This file is intended for demonstrating Type I code clone generation.
 */

// Original file header, slightly reformatted and with additional comments
/*!
 * fancyBox - jQuery Plugin
 * version: 2.1.5 (Fri, 14 Jun 2013) // Release date
 * requires jQuery v1.6 or later // Dependency information
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 * All rights reserved.
 *
 */


; ( function ( window, document, $, undefined ) {

	"use strict"; // Enforce strict mode for cleaner code

	/*
	 * Global variables and utility functions
	 * These are used throughout the fancyBox plugin.
	 */
	var H = $( "html" ), // Reference to the HTML element
		W = $( window ), // Reference to the window object
		D = $( document ), // Reference to the document object

		// The main fancyBox function, acts as a constructor or entry point
		F = $.fancybox = function () {
			F.open.apply( this, arguments ); // Calls the open method with current context and arguments
		},

		IE = navigator.userAgent.match( /msie/i ), // Detects Internet Explorer based on user agent string
		didUpdate = null, // Flag to check if an update has occurred (initialized to null)
		isTouch = document.createTouch !== undefined, // Checks for touch device capabilities


		// Helper function to check if an object is a jQuery object
		isQuery = function ( obj ) {
			return obj && obj.hasOwnProperty && obj instanceof $;
		},

		// Helper function to check if a variable is a string
		isString = function ( str ) {
			return str && $.type( str ) === "string";
		},

		// Helper function to check if a string represents a percentage value
		isPercentage = function ( str ) {
			return isString( str ) && str.indexOf( '%' ) > 0;
		},

		// Helper function to determine if an element is scrollable
		isScrollable = function ( el ) {
			return ( el && !( el.style.overflow && el.style.overflow === 'hidden' ) && ( ( el.clientWidth && el.scrollWidth > el.clientWidth ) || ( el.clientHeight && el.scrollHeight > el.clientHeight ) ) );
		},

		// Helper function to get a scalar value from a string, potentially a percentage
		getScalar = function ( orig, dim ) {
			var value = parseInt( orig, 10 ) || 0; // Parse integer, default to 0

			if ( dim && isPercentage( orig ) ) {
				value = F.getViewport()[ dim ] / 100 * value; // Calculate percentage based on viewport dimension
			}

			return Math.ceil( value ); // Return ceiling of the value
		},

		// Helper function to format a value as a pixel string
		getValue = function ( value, dim ) {
			return getScalar( value, dim ) + 'px'; // Appends 'px' to the scalar value
		};


	// Extend the main fancyBox object (F) with properties and methods
	$.extend( F, {

		// The current version of fancyBox
		version: '2.1.5',

		// Default options for fancyBox instances
		defaults: {
			padding: 15, // Inner padding
			margin: 20,  // Outer margin

			width: 800,      // Default width of the fancyBox
			height: 600,     // Default height of the fancyBox
			minWidth: 100,   // Minimum allowed width
			minHeight: 100,  // Minimum allowed height
			maxWidth: 9999,  // Maximum allowed width
			maxHeight: 9999, // Maximum allowed height
			pixelRatio: 1,   // Set to 2 for retina display support

			autoSize: true,    // Automatically size the content
			autoHeight: false, // Auto-adjust height
			autoWidth: false,  // Auto-adjust width

			autoResize: true,  // Automatically resize on window resize
			autoCenter: !isTouch, // Automatically center, unless it's a touch device
			fitToView: true,   // Fit content to viewport
			aspectRatio: false, // Maintain aspect ratio
			topRatio: 0.5,     // Top position ratio
			leftRatio: 0.5,    // Left position ratio

			scrolling: 'auto', // 'auto', 'yes' or 'no' for content scrolling
			wrapCSS: '',       // Custom CSS class for the wrapper

			arrows: true,     // Show navigation arrows
			closeBtn: true,   // Show close button
			closeClick: false, // Close on click outside content
			nextClick: false,  // Navigate to next on content click
			mouseWheel: true, // Enable mouse wheel navigation
			autoPlay: false,  // Start slideshow automatically
			playSpeed: 3000,  // Slideshow speed in milliseconds
			preload: 3,       // Number of items to preload
			modal: false,     // Modal mode (no closing on escape/click outside)
			loop: true,       // Loop through gallery items

			// AJAX specific options
			ajax: {
				dataType: 'html', // Expected data type
				headers: { 'X-fancyBox': true } // Custom headers
			},

			// IFRAME specific options
			iframe: {
				scrolling: 'no',  // Iframe scrolling behavior
				preload: true     // Preload iframe content
			},

			// SWF (Flash) specific options
			swf: {
				wmode: 'transparent',       // Window mode for Flash
				allowfullscreen: 'true',    // Allow fullscreen for Flash
				allowscriptaccess: 'always' // Allow script access for Flash
			},

			// Keyboard shortcuts configuration
			keys: {
				next: {
					13: 'left', // enter key
					34: 'up',   // page down key
					39: 'left', // right arrow key
					40: 'up'    // down arrow key
				},
				prev: {
					8: 'right',   // backspace key
					33: 'down',  // page up key
					37: 'right', // left arrow key
					38: 'down'   // up arrow key
				},
				close: [ 27 ], // escape key
				play: [ 32 ],  // space - start/stop slideshow
				toggle: [ 70 ] // letter "f" - toggle fullscreen
			},

			// Direction settings for navigation
			direction: {
				next: 'left',
				prev: 'right'
			},

			scrollOutside: true, // Allow scrolling the page when fancyBox is open

			// Override some properties dynamically
			index: 0,        // Current index in the gallery group
			type: null,      // Content type (image, iframe, etc.)
			href: null,      // URL or selector for the content
			content: null,   // Raw HTML content
			title: null,     // Title for the content

			// HTML templates used for building fancyBox elements
			tpl: {
				wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
				image: '<img class="fancybox-image" src="{href}" alt="" />',
				iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + ( IE ? ' allowtransparency="true"' : '' ) + '></iframe>',
				error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
				next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},

			// Properties for each animation type (opening, closing, changing items)
			// Opening fancyBox
			openEffect: 'fade',  // 'elastic', 'fade' or 'none'
			openSpeed: 250,      // Animation speed
			openEasing: 'swing', // Easing function
			openOpacity: true,   // Animate opacity
			openMethod: 'zoomIn',// Method for opening animation

			// Closing fancyBox
			closeEffect: 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed: 250,     // Animation speed
			closeEasing: 'swing',// Easing function
			closeOpacity: true,  // Animate opacity
			closeMethod: 'zoomOut',// Method for closing animation

			// Changing next gallery item
			nextEffect: 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed: 250,        // Animation speed
			nextEasing: 'swing',   // Easing function
			nextMethod: 'changeIn',// Method for next item animation

			// Changing previous gallery item
			prevEffect: 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed: 250,        // Animation speed
			prevEasing: 'swing',   // Easing function
			prevMethod: 'changeOut',// Method for previous item animation

			// Enable default helpers
			helpers: {
				overlay: true, // Show overlay
				title: true    // Show title
			},

			// Callbacks for various stages of fancyBox lifecycle
			onCancel: $.noop,     // If canceling
			beforeLoad: $.noop,   // Before loading content
			afterLoad: $.noop,    // After content loaded
			beforeShow: $.noop,   // Before changing current item
			afterShow: $.noop,    // After opening and showing
			beforeChange: $.noop, // Before changing gallery item
			beforeClose: $.noop,  // Before closing
			afterClose: $.noop    // After closing
		},

		// Current state variables of fancyBox
		group: {},       // Selected group of items
		opts: {},        // Group options (merged defaults and custom)
		previous: null,  // Previous element in the gallery
		coming: null,    // Element currently being loaded
		current: null,   // Currently loaded and displayed element
		isActive: false, // Is fancyBox active (open or loading)
		isOpen: false,   // Is fancyBox currently open
		isOpened: false, // Has fancyBox been fully opened at least once

		// DOM elements of the fancyBox structure
		wrap: null,  // Main wrapper
		skin: null,  // Skin container
		outer: null, // Outer container
		inner: null, // Inner content container

		// Player for slideshow functionality
		player: {
			timer: null,      // Timer for slideshow
			isActive: false   // Is slideshow active
		},

		// Loaders for content types
		ajaxLoad: null,    // AJAX request object
		imgPreload: null,  // Image preload object

		// Some collections for transitions and helpers
		transitions: {}, // Registered transition effects
		helpers: {},     // Registered helper modules


		/*
		 * Static methods of the fancyBox object
		 * These methods provide core functionality.
		 */

		// Opens the fancyBox with a given group of items and options
		open: function ( group, opts ) {
			// Ensure a group is provided
			if ( !group ) {
				return;
			}

			// Normalize options object
			if ( !$.isPlainObject( opts ) ) {
				opts = {};
			}

			// Close any currently active fancyBox before opening a new one
			if ( false === F.close( true ) ) {
				return;
			}

			// Normalize the group into an array
			if ( !$.isArray( group ) ) {
				group = isQuery( group ) ? $( group ).get() : [ group ];
			}

			// Iterate through each element in the group to normalize its properties
			$.each( group, function ( i, element ) {
				var obj = {}, // Temporary object to store item properties
					href,     // Content URL/selector
					title,    // Content title
					content,  // Raw content
					type,     // Content type
					rez,      // Regex result
					hrefParts, // Parts of the href if it includes a selector
					selector;  // Content selector part

				// If the element is an object
				if ( $.type( element ) === "object" ) {
					// Check if it's a DOM element
					if ( element.nodeType ) {
						element = $( element ); // Convert to jQuery object
					}

					// If it's a jQuery object
					if ( isQuery( element ) ) {
						obj = {
							href: element.data( 'fancybox-href' ) || element.attr( 'href' ), // Get href from data or attribute
							title: element.data( 'fancybox-title' ) || element.attr( 'title' ), // Get title from data or attribute
							isDom: true,      // Flag indicating it's a DOM element
							element: element  // Store original element
						};

						// If jQuery metadata plugin is available, extend with metadata
						if ( $.metadata ) {
							$.extend( true, obj, element.metadata() );
						}

					} else {
						obj = element; // If not a DOM element, assume it's a plain object
					}
				}

				// Determine href and title
				href = opts.href || obj.href || ( isString( element ) ? element : null );
				title = opts.title !== undefined ? opts.title : obj.title || '';

				// Determine content and type
				content = opts.content || obj.content;
				type = content ? 'html' : ( opts.type || obj.type );

				// Guess type if not explicitly set and it's a DOM element
				if ( !type && obj.isDom ) {
					type = element.data( 'fancybox-type' ); // Try data attribute

					if ( !type ) {
						rez = element.prop( 'class' ).match( /fancybox\.(\w+)/ ); // Try class name regex
						type = rez ? rez[ 1 ] : null;
					}
				}

				// If href is a string, further process it
				if ( isString( href ) ) {
					// Try to guess the content type based on href
					if ( !type ) {
						if ( F.isImage( href ) ) {
							type = 'image'; // If it looks like an image

						} else if ( F.isSWF( href ) ) {
							type = 'swf'; // If it looks like a SWF

						} else if ( href.charAt( 0 ) === '#' ) {
							type = 'inline'; // If it's an ID selector

						} else if ( isString( element ) ) {
							type = 'html';    // If element itself is a string, treat as HTML
							content = element;
						}
					}

					// Split url into two pieces if it contains a content selector (e.g., "/mypage.html #my_id")
					if ( type === 'ajax' ) {
						hrefParts = href.split( /\s+/, 2 ); // Split by whitespace, max 2 parts
						href = hrefParts.shift();         // First part is the URL
						selector = hrefParts.shift();     // Second part is the selector
					}
				}

				// If content is still not set
				if ( !content ) {
					if ( type === 'inline' ) {
						if ( href ) {
							content = $( isString( href ) ? href.replace( /.*(?=#[^\s]+$)/, '' ) : href ); // Strip URL part for IE7 if present
						} else if ( obj.isDom ) {
							content = element; // Use the original DOM element as content
						}

					} else if ( type === 'html' ) {
						content = href; // Treat href as raw HTML

					} else if ( !type && !href && obj.isDom ) {
						type = 'inline';    // Default to inline if no type/href but is a DOM element
						content = element;
					}
				}

				// Extend the current item object with processed properties
				$.extend( obj, {
					href: href,
					type: type,
					content: content,
					title: title,
					selector: selector
				} );

				group[ i ] = obj; // Update the group item
			} );

			// Extend the defaults with user-provided options recursively
			F.opts = $.extend( true, {}, F.defaults, opts );

			// All options are merged recursively except for 'keys'
			// If 'keys' options are provided, merge them specifically
			if ( opts.keys !== undefined ) {
				F.opts.keys = opts.keys ? $.extend( {}, F.defaults.keys, opts.keys ) : false;
			}

			F.group = group; // Set the global group

			return F._start( F.opts.index ); // Start the fancyBox process with the initial index
		},


		// Cancel current loading or abort AJAX request
		cancel: function () {
			var coming = F.coming; // Get the item that is currently loading

			// Trigger onCancel callback; if it returns false, stop cancellation
			if ( false === F.trigger( 'onCancel' ) ) {
				return;
			}

			F.hideLoading(); // Hide any loading indicators

			// If no item is currently loading, nothing to cancel
			if ( !coming ) {
				return;
			}

			// Abort AJAX request if active
			if ( F.ajaxLoad ) {
				F.ajaxLoad.abort();
			}

			F.ajaxLoad = null; // Clear AJAX loader

			// Clear image preload handlers
			if ( F.imgPreload ) {
				F.imgPreload.onload = F.imgPreload.onerror = null;
			}

			// Stop and remove the wrapper if it exists
			if ( coming.wrap ) {
				coming.wrap.stop( true, true ).trigger( 'onReset' ).remove();
			}

			F.coming = null; // Clear the coming item

			// If no current item is displayed, it means the first item was canceled
			// In this case, perform cleanup after a "zoom out" effect
			if ( !F.current ) {
				F._afterZoomOut( coming );
			}
		},


		// Close fancyBox: starts animation if open, removes immediately if opening/closing
		close: function ( event ) {
			F.cancel(); // Cancel any ongoing loading operations

			// Trigger beforeClose callback; if it returns false, stop closing
			if ( false === F.trigger( 'beforeClose' ) ) {
				return;
			}

			F.unbindEvents(); // Unbind all fancyBox related events

			// If fancyBox is not active, nothing to close
			if ( !F.isActive ) {
				return;
			}

			// If not open or forced to close immediately (event === true)
			if ( !F.isOpen || event === true ) {
				$( '.fancybox-wrap' ).stop( true ).trigger( 'onReset' ).remove(); // Stop animation, reset, and remove elements

				F._afterZoomOut(); // Perform cleanup after "zoom out"
			} else {
				// If fancyBox is open, initiate closing animation
				F.isOpen = F.isOpened = false; // Set flags
				F.isClosing = true;           // Indicate closing state

				$( '.fancybox-item, .fancybox-nav' ).remove(); // Remove item-specific elements and navigation

				F.wrap.stop( true, true ).removeClass( 'fancybox-opened' ); // Stop animation, remove 'opened' class

				F.transitions[ F.current.closeMethod ](); // Execute the closing transition method
			}
		},


		// Manage slideshow:
		//   $.fancybox.play();      - toggle slideshow
		//   $.fancybox.play( true );  - start slideshow
		//   $.fancybox.play( false ); - stop slideshow
		play: function ( action ) {
			// Function to clear the slideshow timer
			var clear = function () {
				clearTimeout( F.player.timer );
			},

				// Function to set (or reset) the slideshow timer
				set = function () {
					clear(); // Clear any existing timer

					// If an item is current and player is active, set a new timer
					if ( F.current && F.player.isActive ) {
						F.player.timer = setTimeout( F.next, F.current.playSpeed ); // Schedule next slide
					}
				},

				// Function to stop the slideshow
				stop = function () {
					clear(); // Clear the timer

					D.unbind( '.player' ); // Unbind player-specific events from document

					F.player.isActive = false; // Set player as inactive

					F.trigger( 'onPlayEnd' ); // Trigger play end callback
				},

				// Function to start the slideshow
				start = function () {
					// Check if looping is enabled or if there are more items
					if ( F.current && ( F.current.loop || F.current.index < F.group.length - 1 ) ) {
						F.player.isActive = true; // Set player as active

						// Bind player-specific events to the document
						D.bind( {
							'onCancel.player beforeClose.player': stop, // Stop on cancel or before close
							'onUpdate.player': set,                     // Reset timer on update
							'beforeLoad.player': clear                  // Clear timer before loading
						} );

						set(); // Set the initial timer

						F.trigger( 'onPlayStart' ); // Trigger play start callback
					}
				};

			// Determine whether to start or stop based on 'action' argument
			if ( action === true || ( !F.player.isActive && action !== false ) ) {
				start(); // Start if true or if inactive and not explicitly false
			} else {
				stop(); // Otherwise, stop
			}
		},


		// Navigate to the next gallery item
		next: function ( direction ) {
			var current = F.current; // Get the current item

			if ( current ) {
				// If direction is not explicitly provided, use the default next direction
				if ( !isString( direction ) ) {
					direction = current.direction.next;
				}

				F.jumpto( current.index + 1, direction, 'next' ); // Jump to the next item
			}
		},


		// Navigate to the previous gallery item
		prev: function ( direction ) {
			var current = F.current; // Get the current item

			if ( current ) {
				// If direction is not explicitly provided, use the default previous direction
				if ( !isString( direction ) ) {
					direction = current.direction.prev;
				}

				F.jumpto( current.index - 1, direction, 'prev' ); // Jump to the previous item
			}
		}

	} ); // End of $.extend(F, { ... });

} )( window, document, jQuery ); // IIFE invocation with window, document, and jQuery
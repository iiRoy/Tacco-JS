/*
 * jquery.poptrox.js - Poptrox Lightbox Plugin
 * Version: 2.5.0
 * Author: n33 (n33.co)
 * License: MIT (http://opensource.org/licenses/MIT)
 *
 * This file contains the core logic for the Poptrox plugin,
 * providing a responsive lightbox solution for jQuery.
 */

( function( $ ) {

	// --- Helper Method: Disable User Selection ---
	// Extends jQuery's prototype to allow disabling text selection on elements.
	// This is useful for UI components that shouldn't have their content selected.
	$.fn.poptrox_disableSelection = function() {
		// Apply various vendor-prefixed and standard CSS properties to disable selection.
		return $( this )
			.css( 'user-select', 'none' )
			.css( '-khtml-user-select', 'none' )
			.css( '-moz-user-select', 'none' )
			.css( '-o-user-select', 'none' )
			.css( '-webkit-user-select', 'none' );
	};


	// --- Poptrox Main Plugin Method ---
	// Initializes the Poptrox lightbox functionality on a set of elements.
	$.fn.poptrox = function( options ) {

		// Handle cases where no elements are selected.
		if ( this.length == 0 ) {
			return $( this );
		}

		// Handle multiple elements: iterate and apply Poptrox to each individually.
		// This ensures each element gets its own instance of the plugin.
		if ( this.length > 1 ) {

			// Loop through all selected elements.
			for ( var i = 0; i < this.length; i++ ) {
				$( this[ i ] ).poptrox( options );
			}

			// Return the original jQuery object for chaining.
			return $( this );

		}


		// --- Plugin Settings ---
		// Merge default settings with user-provided options.
		var settings = $.extend( {

			preload:						false,						// If true, preload full-size images in the background to improve loading speed.
			baseZIndex:						1000,						// The base Z-index for all Poptrox elements (overlay, popup, etc.).
			fadeSpeed:						300,						// Global fade speed (in milliseconds) for transitions.
			overlayColor:					'#000000',					// Background color of the overlay that appears behind the popup.
			overlayOpacity:					0.6,						// Opacity of the overlay (0.0 to 1.0).
			overlayClass:					'poptrox-overlay',			// CSS class name for the overlay element.
			windowMargin:					50,							// Margin (in pixels) around the popup content, especially when content is larger than the viewport.
			windowHeightPad:				0,							// Additional vertical padding (in pixels) for the window height calculation.
			selector:						'a',						// CSS selector for the elements within the target that will trigger the lightbox.
			caption:						null,						// Configuration for captions (refer to documentation for detailed usage).
			parent:							'body',						// The parent element where the overlay and popup will be appended.
			popupSpeed:						300,						// Speed (in milliseconds) for the popup's resize animations.
			popupWidth:						200,						// Default width of the popup when content is not yet loaded.
			popupHeight:					100,						// Default height of the popup when content is not yet loaded.
			popupIsFixed:					false,						// If true, the popup will not resize to fit images, maintaining popupWidth/popupHeight.
			useBodyOverflow:				false,						// If true, sets `body { overflow: hidden; }` when the popup is active to prevent scrolling.
			usePopupEasyClose:				true,						// If true, clicking anywhere on the popup content will close the lightbox.
			usePopupForceClose:				false,						// If true, the popup can be closed even if content is still loading.
			usePopupLoader:					true,						// If true, displays a loader animation while content is being fetched.
			usePopupCloser:					true,						// If true, includes a "closer" button/link to dismiss the popup.
			usePopupCaption:				false,						// If true, displays a caption below the content in the popup.
			usePopupNav:					false,						// If true, enables and displays navigation buttons (next/previous) for galleries.
			usePopupDefaultStyling:			true,						// If true, applies a set of default CSS styles to the popup components.
			popupBackgroundColor:			'#FFFFFF',					// (Default Style) Background color for the popup container.
			popupTextColor:					'#000000',					// (Default Style) Text color for the popup content.
			popupLoaderTextSize:			'2em',						// (Default Style) Font size for the loader text.
			popupCloserBackgroundColor:		'#000000',					// (Default Style) Background color for the closer button.
			popupCloserTextColor:			'#FFFFFF',					// (Default Style) Text color for the closer button.
			popupCloserTextSize:			'20px',						// (Default Style) Font size for the closer button text.
			popupPadding:					10,							// (Default Style) Inner padding (in pixels) of the popup container.
			popupCaptionHeight:				60,							// (Default Style) Fixed height (in pixels) for the caption area.
			popupCaptionTextSize:			null,						// (Default Style) Font size for the caption text (if null, inherited).
			popupBlankCaptionText:			'(untitled)',				// Text to display when a caption is enabled but no caption text is available.
			popupCloserText:				'&#215;',					// HTML entity or text for the closer button (e.g., an 'X').
			popupLoaderText:				'&bull;&bull;&bull;&bull;',	// HTML entity or text for the loader animation.
			popupClass:						'poptrox-popup',			// CSS class name for the main popup container.
			popupSelector:					null,						// (Advanced) Custom CSS selector for the popup element if you're providing your own structure.
			popupLoaderSelector:			'.loader',					// (Advanced) Custom CSS selector for the loader element within the popup.
			popupCloserSelector:			'.closer',					// (Advanced) Custom CSS selector for the closer button within the popup.
			popupCaptionSelector:			'.caption',					// (Advanced) Custom CSS selector for the caption element within the popup.
			popupNavPreviousSelector:		'.nav-previous',			// (Advanced) Custom CSS selector for the 'previous' navigation button.
			popupNavNextSelector:			'.nav-next',				// (Advanced) Custom CSS selector for the 'next' navigation button.
			onPopupClose:					null,						// Callback function executed when the popup is closed.
			onPopupOpen:					null						// Callback function executed when the popup is opened.

		}, options );


		// --- Internal Variables ---
		var	$this = $( this ),						// Reference to the main element Poptrox was called on.
			$body = $( 'body' ),					// Reference to the document body.
			$overlay = $( '<div class="' + settings.overlayClass +  '"></div>' ), // The overlay element that covers the page.
			$window = $( window );					// Reference to the browser window.

		var	windowWidth,							// Stores current window width.
			windowHeight,							// Stores current window height.
			queue = [],								// Array to store items for the lightbox gallery.
			navPos = 0,								// Current position in the gallery queue.
			isLocked = false,						// Flag to prevent multiple concurrent operations (e.g., opening/closing).
			cache = new Array();					// Array to cache image objects or content.


		// --- Function to Update Window and Popup Dimensions ---
		// Recalculates and applies dimensions based on window size and content.
		function updateWH() {

			windowWidth = $( window ).width();
			windowHeight = $( window ).height() + settings.windowHeightPad;

			// Calculate padding/border differences for popup.
			var dw = Math.abs( $popup.width() - $popup.outerWidth() );
			var dh = Math.abs( $popup.height() - $popup.outerHeight() );

			// Get current content dimensions.
			var nw = $x.width();
			var nh = $x.height();

			// Calculate maximum allowable width and height for content.
			var maxw = windowWidth - ( settings.windowMargin * 2 ) - dw;
			var maxh = windowHeight - ( settings.windowMargin * 2 ) - dh;

			// Apply minimum width and height to the popup.
			$popup
				.css( 'min-width', settings.popupWidth )
				.css( 'min-height', settings.popupHeight );

			// Apply maximum width and height to the image/content within the popup.
			$pic.children()
				.css( 'max-width', maxw )
				.css( 'max-height', maxh );

		}


		// --- Disable Unused Features by Nulling Selectors ---
		// Optimizes the code by ensuring that handlers/elements for disabled features aren't sought or used.
		if ( !settings.usePopupLoader ) {
			settings.popupLoaderSelector = null;
		}

		if ( !settings.usePopupCloser ) {
			settings.popupCloserSelector = null;
		}

		if ( !settings.usePopupCaption ) {
			settings.popupCaptionSelector = null;
		}

		if ( !settings.usePopupNav ) {
			settings.popupNavPreviousSelector = null;
			settings.popupNavNextSelector = null;
		}


		// --- Popup Element Initialization ---
		var $popup;

		// If a custom popup selector is provided, use that element.
		if ( settings.popupSelector ) {
			$popup = $( settings.popupSelector );
		}
		// Otherwise, construct the default popup structure.
		else {
			$popup = $( '<div class="' + settings.popupClass + '">' +
				( settings.popupLoaderSelector ? '<div class="loader">' + settings.popupLoaderText + '</div>' : '' ) +
				'<div class="pic"></div>' +
				( settings.popupCaptionSelector ? '<div class="caption"></div>' : '' ) +
				( settings.popupCloserSelector ? '<span class="closer">' + settings.popupCloserText + '</span>' : '' ) +
				( settings.popupNavPreviousSelector ? '<div class="nav-previous"></div>' : '' ) +
				( settings.popupNavNextSelector ? '<div class="nav-next"></div>' : '' ) +
				'</div>' );
		}


		// --- Get References to Popup Components ---
		var	$pic = $popup.find( '.pic' ),								// Container for the main content (image, video, etc.).
			$x = $(),													// Placeholder for the currently displayed content element.
			$loader = $popup.find( settings.popupLoaderSelector ),		// The loader element.
			$caption = $popup.find( settings.popupCaptionSelector ),	// The caption element.
			$closer = $popup.find( settings.popupCloserSelector ),		// The closer button element.
			$nav_next = $popup.find( settings.popupNavNextSelector ),	// The 'next' navigation button.
			$nav_previous = $popup.find( settings.popupNavPreviousSelector ), // The 'previous' navigation button.
			$nav = $nav_next.add( $nav_previous );						// Combined navigation elements.


		// --- Apply Default Styling (if enabled) ---
		if ( settings.usePopupDefaultStyling ) {

			// Apply general popup styles.
			$popup
				.css( 'background', settings.popupBackgroundColor )
				.css( 'color', settings.popupTextColor )
				.css( 'padding', settings.popupPadding + 'px' );

			// Caption styling.
			if ( $caption.length > 0 ) {

				$popup
					.css( 'padding-bottom', settings.popupCaptionHeight + 'px' );

				$caption
					.css( 'position', 'absolute' )
					.css( 'left', '0' )
					.css( 'bottom', '0' )
					.css( 'width', '100%' )
					.css( 'text-align', 'center' )
					.css( 'height', settings.popupCaptionHeight + 'px' )
					.css( 'line-height', settings.popupCaptionHeight + 'px' );

				if ( settings.popupCaptionTextSize ) {
					$caption.css( 'font-size', settings.popupCaptionTextSize );
				}

			}

			// Closer button styling.
			if ( $closer.length > 0 ) {
				$closer
					.html( settings.popupCloserText )
					.css( 'font-size', settings.popupCloserTextSize )
					.css( 'background', settings.popupCloserBackgroundColor )
					.css( 'color', settings.popupCloserTextColor )
					.css( 'display', 'block' )
					.css( 'width', '40px' )
					.css( 'height', '40px' )
					.css( 'line-height', '40px' )
					.css( 'text-align', 'center' )
					.css( 'position', 'absolute' )
					.css( 'text-decoration', 'none' )
					.css( 'outline', '0' )
					.css( 'top', '0' )
					.css( 'right', '-40px' );
			}

			// Loader styling and animation logic.
			if ( $loader.length > 0 ) {

				$loader
					.html( '' ) // Clear any initial content.
					.css( 'position', 'relative' )
					.css( 'font-size', settings.popupLoaderTextSize )
					.on( 'startSpinning', function( e ) {

						var x = $( '<div>' + settings.popupLoaderText + '</div>' );

						x
							.css( 'height', Math.floor( settings.popupHeight / 2 ) + 'px' )
							.css( 'overflow', 'hidden' )
							.css( 'line-height', Math.floor( settings.popupHeight / 2 ) + 'px' )
							.css( 'text-align', 'center' )
							.css( 'margin-top', Math.floor( ( $popup.height() - x.height() + ( $caption.length > 0 ? $caption.height() : 0 ) ) / 2 ) )
							.css( 'color', ( settings.popupTextColor ? settings.popupTextColor : '' ) )
							.on( 'xfin', function() { x.fadeTo( 300, 0.5, function() { x.trigger( 'xfout' ); } ); } )
							.on( 'xfout', function() { x.fadeTo( 300, 0.05, function() { x.trigger( 'xfin' ); } ); } )
							.trigger( 'xfin' );

						$loader.append( x );

					})
					.on( 'stopSpinning', function( e ) {

						var x = $loader.find( 'div' );
						x.remove(); // Remove the spinning element.

					});

			}

			// Navigation button styling.
			if ( $nav.length == 2 ) {

				$nav
					.css( 'font-size', '75px' )
					.css( 'text-align', 'center' )
					.css( 'color', '#fff' )
					.css( 'text-shadow', 'none' )
					.css( 'height', '100%' )
					.css( 'position', 'absolute' )
					.css( 'top', '0' )
					.css( 'opacity', '0.35' )
					.css( 'cursor', 'pointer' )
					.css( 'box-shadow', 'inset 0px 0px 10px 0px rgba(0,0,0,0)' )
					.poptrox_disableSelection(); // Disable selection on nav buttons.

				var wn, wp; // Width for next and previous nav.

				if ( settings.usePopupEasyClose ) {

					wn = '100px';
					wp = '100px';

				}
				else {

					wn = '75%';
					wp = '25%';

				}

				$nav_next
					.css( 'right', '0' )
					.css( 'width', wn )
					.html( '<div style="position: absolute; height: 100px; width: 125px; top: 50%; right: 0; margin-top: -50px;">&gt;</div>' );

				$nav_previous
					.css( 'left', '0' )
					.css( 'width', wp )
					.html( '<div style="position: absolute; height: 100px; width: 125px; top: 50%; left: 0; margin-top: -50px;">&lt;</div>' );

			}

		}


		// --- Event Handlers and Initialization ---

		// Window resize and orientation change handler.
		$window
			.on( 'resize orientationchange', function() {
				updateWH(); // Update dimensions when window changes.
			});

		// Caption update handler.
		$caption
			.on( 'update', function( e, s ) {

				if ( !s || s.length == 0 ) {
					s = settings.popupBlankCaptionText; // Use blank text if no caption is provided.
				}

				$caption.html( s ); // Set the caption text.

			});

		// Closer button click handler.
		$closer
			.css( 'cursor', 'pointer' )
			.on( 'click', function( e ) {

				e.preventDefault(); // Prevent default link behavior.
				e.stopPropagation(); // Stop event propagation.

				$popup.trigger( 'poptrox_close' ); // Trigger close event.

				return true; // Allow default behavior for other elements.

			});

		// Next navigation button click handler.
		$nav_next
			.on( 'click', function() {
				$popup.trigger( 'poptrox_next' );
			});

		// Previous navigation button click handler.
		$nav_previous
			.on( 'click', function() {
				$popup.trigger( 'poptrox_previous' );
			});

		// Overlay setup and event handlers.
		$overlay
			.css( 'position', 'fixed' )
			.css( 'left', 0 )
			.css( 'top', 0 )
			.css( 'z-index', settings.baseZIndex )
			.css( 'width', '100%' )
			.css( 'height', '100%' )
			.css( 'text-align', 'center' )
			.css( 'cursor', 'pointer' )
			.appendTo( settings.parent ) // Add overlay to the specified parent.
			// Add a helper div for vertical alignment.
			.prepend( '<div style="display:inline-block;height:100%;vertical-align:middle;"></div>' )
			// Add the actual background layer for color and opacity.
			.append( '<div style="position:absolute;left:0;top:0;width:100%;height:100%;background:' + settings.overlayColor + ';opacity:' + settings.overlayOpacity + ';filter:alpha(opacity=' + ( settings.overlayOpacity * 100 ) + ');"></div>' )
			.hide() // Initially hide the overlay.
			.on( 'touchmove', function( e ) {
				return false; // Prevent scrolling on touch devices.
			})
			.on( 'click', function( e ) {

				e.preventDefault();
				e.stopPropagation();

				$popup.trigger( 'poptrox_close' ); // Close popup on overlay click.

			});

		// Easy close functionality (click on picture to close).
		if ( settings.usePopupEasyClose ) {

			$pic
				.css( 'cursor', 'pointer' )
				.on( 'click', function( e ) {

					e.preventDefault();
					e.stopPropagation();

					$popup.trigger( 'poptrox_close' ); // Close popup on picture click.

				});

		}

		// Main popup event handlers.
		$popup
			.css( 'display', 'inline-block' )
			.css( 'vertical-align', 'middle' )
			.css( 'position', 'relative' )
			.css( 'z-index', 1 )
			.appendTo( $overlay ) // Add popup to the overlay.
			.hide() // Initially hide the popup.
			.on( 'poptrox_next', function() {

				var x = navPos + 1; // Calculate next position.

				if ( x >= queue.length ) {
					x = 0; // Loop back to start if at end.
				}

				$popup.trigger( 'poptrox_switch', [ x ] ); // Trigger switch to next item.

			})
			.on( 'poptrox_previous', function() {

				var x = navPos - 1; // Calculate previous position.

				if ( x < 0 ) {
					x = queue.length - 1; // Loop to end if at start.
				}

				$popup.trigger( 'poptrox_switch', [ x ] ); // Trigger switch to previous item.

			})
			.on( 'poptrox_reset', function() {

				updateWH(); // Update window/popup dimensions.

				// Reset popup dimensions data.
				$popup
					.data( 'width', settings.popupWidth )
					.data( 'height', settings.popupHeight );

				// Hide and reset all popup components.
				$loader.hide().trigger( 'stopSpinning' );
				$caption.hide();
				$closer.hide();
				$nav.hide();
				$pic.hide();
				$x.detach(); // Remove current content element.

			})
			.on( 'poptrox_open', function( e, index ) {

				if ( isLocked ) {
					return true; // If locked, do nothing.
				}

				isLocked = true; // Set lock to prevent re-entry.

				if ( settings.useBodyOverflow ) {
					$body.css( 'overflow', 'hidden' ); // Prevent body scrolling.
				}

				if ( settings.onPopupOpen ) {
					( settings.onPopupOpen )(); // Call custom open callback.
				}

				// Fade in overlay, then switch to the specified item.
				$overlay
					.fadeTo( settings.fadeSpeed, 1.0, function() {
						$popup.trigger( 'poptrox_switch', [ index, true ] );
					});

			})
			.on( 'poptrox_switch', function( e, index, ignoreLock ) {

				var x, img;

				// If not ignoring lock and locked, exit.
				if ( !ignoreLock && isLocked ) {
					return true;
				}

				isLocked = true; // Set lock for this operation.

				// Reset popup dimensions to default before loading new content.
				$popup
					.css( 'width', $popup.data( 'width' ) )
					.css( 'height', $popup.data( 'height' ) );

				// Cleanup from previous content.
				$caption.hide();
				if ( $x.attr( 'src' ) ) {
					$x.attr( 'src', '' ); // Clear image source.
				}
				$x.detach(); // Detach old content.

				// Activate new object from the queue.
				x = queue[ index ];
				$x = x.object;
				$x.off( 'load' ); // Remove any previous load handlers.

				// Prepare picture container and append new content.
				$pic
					.css( 'text-indent', '-9999px' ) // Hide text for a brief moment.
					.show()
					.append( $x );

				// Handle AJAX content.
				if ( x.type == 'ajax' ) {
					$.get( x.src, function( data ) {

						$x.html( data ); // Set HTML content.
						$x.trigger( 'load' ); // Manually trigger load for AJAX.

					});
				}
				// Handle image or other content (set src attribute).
				else {
					$x.attr( 'src', x.src );
				}

				// Apply styles for non-image content types.
				if ( x.type != 'image' ) {
					$x
						.css( 'position', 'relative' )
						.css( 'outline', '0' )
						.css( 'z-index', settings.baseZIndex + 100 )
						.width( x.width )
						.height( x.height );
				}

				// Show loader and popup, start spinning.
				$loader.trigger( 'startSpinning' ).fadeIn( 300 );
				$popup.show();

				// If popup has fixed dimensions.
				if ( settings.popupIsFixed ) {

					$popup
						.width( settings.popupWidth )
						.height( settings.popupHeight );

					$x.load( function() {

						$x.off( 'load' ); // Remove load handler.
						$loader.hide().trigger( 'stopSpinning' ); // Hide loader.
						$caption.trigger( 'update', [ x.captionText ] ).fadeIn( settings.fadeSpeed ); // Show caption.
						$closer.fadeIn( settings.fadeSpeed ); // Show closer.
						// Show picture, then unlock.
						$pic.css( 'text-indent', 0 ).hide().fadeIn( settings.fadeSpeed, function() { isLocked = false; } );
						navPos = index; // Update navigation position.
						$nav.fadeIn( settings.fadeSpeed ); // Show navigation.

					});

				}
				// If popup dimensions are dynamic (fit to content).
				else {

					$x.load( function() {

						updateWH(); // Update dimensions after content loads.

						$x.off( 'load' );
						$loader.hide().trigger( 'stopSpinning' );

						var	nw = $x.width(), // New width of content.
							nh = $x.height(), // New height of content.
							f = function() { // Callback function after animation.

								$caption.trigger( 'update', [ x.captionText ] ).fadeIn( settings.fadeSpeed );
								$closer.fadeIn( settings.fadeSpeed );
								$pic.css( 'text-indent', 0 ).hide().fadeIn( settings.fadeSpeed, function() { isLocked = false; } );
								navPos = index;
								$nav.fadeIn( settings.fadeSpeed );

								$popup
									.data( 'width', nw )
									.data( 'height', nh )
									.css( 'width', 'auto' ) // Allow popup to resize.
									.css( 'height', 'auto' );

							};
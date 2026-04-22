/*
 * jQuery blockUI plugin
 * Version 2.70.0-2014.11.23
 *
 * This version requires jQuery v1.7 or later to function correctly.
 *
 * Official examples and documentation are available at:
 * http://malsup.com/jquery/block/
 *
 * Copyright (c) 2007-2013 M. Alsup. All rights reserved.
 *
 * Licensed under the terms of both the MIT and GPL licenses.
 * You can find the full license texts here:
 *   - MIT License: http://www.opensource.org/licenses/mit-license.php
 *   - GPL License: http://www.gnu.org/licenses/gpl.html
 *
 * Special thanks to Amir-Hossein Sobhi for his valuable contributions and enhancements!
 */

; ( function () {

	/* jshint eqeqeq:false, curly:false, latedef:false */
	"use strict"; // Enforce strict mode for better code quality and fewer silent errors.

	/**
	 * Main setup function for the jQuery blockUI plugin.
	 * This function is immediately invoked with the jQuery object.
	 * @param {jQuery} $ - The jQuery object.
	 */
	function setup ( $ ) {

		// Preserve original fadeIn for later use, preventing conflicts.
		$.fn._fadeIn = $.fn.fadeIn;


		// Define a no-operation function for callbacks that might be undefined.
		var noOp = $.noop || function () {};

		// This section handles IE-specific issues, particularly with 'setExpression'
		// and user agent string complexities on Vista.
		var msie    = /MSIE/.test( navigator.userAgent );
		var ie6     = /MSIE 6.0/.test( navigator.userAgent ) && !/MSIE 8.0/.test( navigator.userAgent );
		var mode    = document.documentMode || 0;

		// Check if 'setExpression' is supported by the browser's style object.
		var setExpr = $.isFunction( document.createElement( 'div' ).style.setExpression );


		// Global jQuery methods for blocking and unblocking the entire page.
		$.blockUI   = function ( opts ) {
			install( window, opts );
		};

		$.unblockUI = function ( opts ) {
			remove( window, opts );
		};


		/**
		 * Convenience method for displaying growl-like notifications.
		 * @see http://www.google.com/search?q=growl
		 * @param {string} title - The title of the growl message.
		 * @param {string} message - The main message content.
		 * @param {number} [timeout=3000] - Duration in milliseconds before auto-hiding.
		 * @param {function} [onClose] - Callback function to execute when the growl closes.
		 */
		$.growlUI = function ( title, message, timeout, onClose ) {

			// Create the main growl message container.
			var $m = $( '<div class="growlUI"></div>' );

			// Append title if provided.
			if ( title ) {
				$m.append( '<h1>' + title + '</h1>' );
			}

			// Append message if provided.
			if ( message ) {
				$m.append( '<h2>' + message + '</h2>' );
			}

			// Set default timeout if not specified.
			if ( timeout === undefined ) {
				timeout = 3000;
			}


			// Added by konapun: Handles setting a longer timeout if the growl is moused over,
			// mimicking standard toast notification behavior.
			var callBlock = function ( opts ) {
				opts = opts || {};

				$.blockUI( {
					message: $m,
					fadeIn : typeof opts.fadeIn  !== 'undefined' ? opts.fadeIn  : 700,
					fadeOut: typeof opts.fadeOut !== 'undefined' ? opts.fadeOut : 1000,
					timeout: typeof opts.timeout !== 'undefined' ? opts.timeout : timeout,
					centerY: false, // Growl messages are typically not centered vertically.
					showOverlay: false, // Growl messages usually don't block the entire screen.
					onUnblock: onClose, // Execute the user-defined callback on unblock.
					css: $.blockUI.defaults.growlCSS // Apply specific growl styles.
				} );
			};

			callBlock(); // Initial display of the growl message.

			// Capture the initial opacity for restoration if needed.
			var nonmousedOpacity = $m.css( 'opacity' );

			// Handle mouseover event to extend display time.
			$m.mouseover( function () {
				callBlock( {
					fadeIn: 0, // No fade-in on mouseover, just update.
					timeout: 30000 // Keep it visible for 30 seconds.
				} );

				var displayBlock = $( '.blockMsg' );
				displayBlock.stop(); // Stop any ongoing fade-out animation.
				displayBlock.fadeTo( 300, 1 ); // Make message fully opaque for better readability.
			} ).mouseout( function () {
				// On mouseout, fade out the growl message.
				$( '.blockMsg' ).fadeOut( 1000 );
			} );
			// End konapun additions.
		};


		/**
		 * Plugin method for blocking content within a specific element.
		 * @param {object} opts - Options for blocking.
		 * @returns {jQuery} - The jQuery object, for chaining.
		 */
		$.fn.block = function ( opts ) {

			// If the target is the window, use the global page blocking method.
			if ( this[0] === window ) {
				$.blockUI( opts );
				return this;
			}

			// Merge default options with user-provided options.
			var fullOpts = $.extend( {}, $.blockUI.defaults, opts || {} );

			// Iterate over each selected element to apply blocking logic.
			this.each( function () {
				var $el = $( this );

				// If ignoreIfBlocked is true and the element is already blocked, skip.
				if ( fullOpts.ignoreIfBlocked && $el.data( 'blockUI.isBlocked' ) ) {
					return;
				}

				// Unblock first with fadeOut 0 to prevent visual glitches if already blocked.
				$el.unblock( { fadeOut: 0 } );
			} );

			// Re-iterate to apply the actual blocking.
			return this.each( function () {
				// If the element's position is static, change it to relative
				// to allow absolute positioning of the overlay/message.
				if ( $.css( this, 'position' ) == 'static' ) {
					this.style.position = 'relative';
					$( this ).data( 'blockUI.static', true );
				}
				this.style.zoom = 1; // Force 'hasLayout' in IE for proper rendering.
				install( this, opts ); // Apply the blocking installation.
			} );
		};


		/**
		 * Plugin method for unblocking content within a specific element.
		 * @param {object} opts - Options for unblocking.
		 * @returns {jQuery} - The jQuery object, for chaining.
		 */
		$.fn.unblock = function ( opts ) {

			// If the target is the window, use the global page unblocking method.
			if ( this[0] === window ) {
				$.unblockUI( opts );
				return this;
			}

			// Iterate over each selected element to remove blocking.
			return this.each( function () {
				remove( this, opts );
			} );
		};


		// Current version of the blockUI plugin.
		$.blockUI.version = 2.70; // This is the 2nd generation blocking, with no extra cost!


		// Default options for $.blockUI.
		// These can be overridden in your code to change the default behavior and styling.
		$.blockUI.defaults = {

			// Message displayed when blocking; use null for no message.
			message: '<h1>Please wait...</h1>',

			title: null, // Title string; only used when theme is true.
			draggable: true, // Only used when theme is true (requires jquery-ui.js to be loaded).

			theme: false, // Set to true to enable integration with jQuery UI themes.

			// Styles for the blocking message.
			// To use an external stylesheet, set $.blockUI.defaults.css = {};
			css: {
				padding: 0,
				margin: 0,
				width: '30%',
				top: '40%',
				left: '35%',
				textAlign: 'center',
				color: '#000',
				border: '3px solid #aaa',
				backgroundColor: '#fff',
				cursor: 'wait'
			},

			// Minimal style set used when themes are active.
			themedCSS: {
				width: '30%',
				top: '40%',
				left: '35%'
			},

			// Styles for the overlay layer.
			overlayCSS: {
				backgroundColor: '#000',
				opacity: 0.6,
				cursor: 'wait'
			},

			// Style to replace the wait cursor before unblocking,
			// to address lingering wait cursor issues.
			cursorReset: 'default',

			// Styles specifically applied when using $.growlUI.
			growlCSS: {
				width: '350px',
				top: '10px',
				left: '', // Positioned from the right.
				right: '10px',
				border: 'none',
				padding: '5px',
				opacity: 0.6,
				cursor: 'default',
				color: '#fff',
				backgroundColor: '#000',
				'-webkit-border-radius': '10px', // Webkit-specific border-radius.
				'-moz-border-radius': '10px', // Mozilla-specific border-radius.
				'border-radius': '10px' // Standard border-radius.
			},

			// IE issues: 'about:blank' fails on HTTPS; 'javascript:false' is slow.
			// Hat tip to Jorge H. N. de Vasconcelos.
			/* jshint scripturl:true */
			iframeSrc: /^https/i.test( window.location.href || '' ) ? 'javascript:false' : 'about:blank',

			// Force usage of an iframe even in non-IE browsers (useful for blocking applets).
			forceIframe: false,

			// Z-index for the blocking overlay layer.
			baseZ: 1000,

			// Set to true to automatically center the message.
			centerX: true, // Only affects element blocking; page block is controlled via CSS above.
			centerY: true,

			// Allow body element to be stretched in IE6; improves blocking appearance on short pages.
			// Disable if you wish to prevent changes to body height.
			allowBodyStretch: true,

			// Enable if you want key and mouse events to be disabled for blocked content.
			bindEvents: true,

			// By default, blockUI will suppress tab navigation from leaving blocked content
			// (if bindEvents is true).
			constrainTabKey: true,

			// Fade-in time in milliseconds; set to 0 to disable fade-in on block.
			fadeIn: 200,

			// Fade-out time in milliseconds; set to 0 to disable fade-out on unblock.
			fadeOut: 400,

			// Time in milliseconds to wait before auto-unblocking; set to 0 to disable auto-unblock.
			timeout: 0,

			// Disable if you don't want to show the overlay layer.
			showOverlay: true,

			// If true, focus will be placed in the first available input field when page blocking.
			focusInput: true,

			// Elements that can receive focus when blocked.
			focusableElements: ':input:enabled:visible',

			// This option was for suppressing overlay styles on FF/Linux due to performance issues.
			// No longer needed as of 2012.
			// applyPlatformOpacityRules: true,

			// Callback method invoked when the fade-in has completed and the blocking message is visible.
			onBlock: null,

			// Callback method invoked when unblocking has completed.
			// The callback is passed the element that has been unblocked
			// (which is the window object for page blocks) and the options that were passed to the unblock call:
			//   onUnblock(element, options)
			onUnblock: null,

			// Callback method invoked when the overlay area is clicked.
			// Setting this will change the cursor to a pointer; otherwise,
			// the cursor defined in overlayCss will be used.
			onOverlayClick: null,

			// Don't ask; if you really must know, see:
			// http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
			quirksmodeOffsetHack: 4,

			// Class name applied to the message block element.
			blockMsgClass: 'blockMsg',

			// If true, and the element is already blocked, the new block request will be ignored.
			ignoreIfBlocked: false
		};


		// Private data and helper functions follow below.

		var pageBlock    = null; // Reference to the page block message element.
		var pageBlockEls = [];   // Array of focusable elements within the page block.

		/**
		 * Installs the blockUI overlay and message on the target element.
		 * @param {HTMLElement|Window} el - The element to block (or window for page blocking).
		 * @param {object} opts - Options for the blocking operation.
		 */
		function install ( el, opts ) {

			var css, themedCSS;
			var full = ( el == window ); // Check if we're blocking the entire window.
			var msg  = ( opts && opts.message !== undefined ? opts.message : undefined );

			// Merge default options with user-provided options.
			opts = $.extend( {}, $.blockUI.defaults, opts || {} );

			// If ignoreIfBlocked is true and the element is already blocked, do nothing.
			if ( opts.ignoreIfBlocked && $( el ).data( 'blockUI.isBlocked' ) ) {
				return;
			}

			// Extend overlay CSS, message CSS, and themed CSS.
			opts.overlayCSS = $.extend( {}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {} );
			css             = $.extend( {}, $.blockUI.defaults.css, opts.css || {} );

			// If an overlay click handler is provided, change the cursor to pointer.
			if ( opts.onOverlayClick ) {
				opts.overlayCSS.cursor = 'pointer';
			}

			themedCSS = $.extend( {}, $.blockUI.defaults.themedCSS, opts.themedCSS || {} );
			msg       = msg === undefined ? opts.message : msg; // Ensure msg is correctly set.

			// If blocking the full page and there's an existing page block, remove it first.
			if ( full && pageBlock ) {
				remove( window, { fadeOut: 0 } );
			}

			// If the message is an existing DOM element, capture its state for restoration.
			if ( msg && typeof msg != 'string' && ( msg.parentNode || msg.jquery ) ) {
				var node = msg.jquery ? msg[0] : msg; // Get raw DOM node.
				var data = {};
				$( el ).data( 'blockUI.history', data ); // Store history data on the element.
				data.el       = node;
				data.parent   = node.parentNode;
				data.display  = node.style.display;
				data.position = node.style.position;
				if ( data.parent ) {
					data.parent.removeChild( node ); // Remove from original parent.
				}
			}

			// Store the onUnblock callback on the element's data.
			$( el ).data( 'blockUI.onUnblock', opts.onUnblock );

			var z = opts.baseZ; // Base z-index for layers.

			// blockUI uses three layers:
			// 1. Iframe layer (lyr1) to suppress bleed-through (especially in IE).
			// 2. Overlay layer (lyr2) with opacity and a wait cursor.
			// 3. Message content layer (lyr3) for the actual message.
			var lyr1, lyr2, lyr3, s;

			// Create the iframe layer (or a simple div if not IE or forceIframe).
			if ( msie || opts.forceIframe ) {
				lyr1 = $( '<iframe class="blockUI" style="z-index:' + ( z++ ) + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + opts.iframeSrc + '"></iframe>' );
			} else {
				lyr1 = $( '<div class="blockUI" style="display:none"></div>' );
			}

			// Create the overlay layer.
			if ( opts.theme ) {
				lyr2 = $( '<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:' + ( z++ ) + ';display:none"></div>' );
			} else {
				lyr2 = $( '<div class="blockUI blockOverlay" style="z-index:' + ( z++ ) + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>' );
			}

			// Construct the message layer based on theme and full page blocking.
			if ( opts.theme && full ) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + ( z + 10 ) + ';display:none;position:fixed">';
				if ( opts.title ) {
					s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + ( opts.title || '&nbsp;' ) + '</div>';
				}
				s += '<div class="ui-widget-content ui-dialog-content"></div>';
				s += '</div>';
			} else if ( opts.theme ) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + ( z + 10 ) + ';display:none;position:absolute">';
				if ( opts.title ) {
					s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">' + ( opts.title || '&nbsp;' ) + '</div>';
				}
				s += '<div class="ui-widget-content ui-dialog-content"></div>';
				s += '</div>';
			} else if ( full ) {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:' + ( z + 10 ) + ';display:none;position:fixed"></div>';
			} else {
				s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:' + ( z + 10 ) + ';display:none;position:absolute"></div>';
			}
			lyr3 = $( s );

			// If a message is provided, style it.
			if ( msg ) {
				if ( opts.theme ) {
					lyr3.css( themedCSS );
					lyr3.addClass( 'ui-widget-content' );
				} else {
					lyr3.css( css );
				}
			}

			// Style the overlay layer.
			if ( !opts.theme /*&& (!opts.applyPlatformOpacityRules)*/ ) { // applyPlatformOpacityRules no longer used.
				lyr2.css( opts.overlayCSS );
			}
			lyr2.css( 'position', full ? 'fixed' : 'absolute' );

			// Make the iframe layer transparent in IE.
			if ( msie || opts.forceIframe ) {
				lyr1.css( 'opacity', 0.0 );
			}

			// Append all layers to the target parent.
			var layers = [ lyr1, lyr2, lyr3 ],
				$par = full ? $( 'body' ) : $( el );
			$.each( layers, function () {
				this.appendTo( $par );
			} );

			// If theme is enabled and draggable is true, make the message draggable.
			if ( opts.theme && opts.draggable && $.fn.draggable ) {
				lyr3.draggable( {
					handle: '.ui-dialog-titlebar',
					cancel: 'li' // Don't drag if clicking on a list item.
				} );
			}

			// IE7 specific positioning for quirks mode and ActiveX issues.
			var expr = setExpr && ( !$.support.boxModel || $( 'object,embed', full ? null : el ).length > 0 );
			if ( ie6 || expr ) {

				// For full page block in IE6, give body 100% height.
				if ( full && opts.allowBodyStretch && $.support.boxModel ) {
					$( 'html,body' ).css( 'height', '100%' );
				}

				// Fix IE6 issue when blocked element has a border width.
				if ( ( ie6 || !$.support.boxModel ) && !full ) {
					var t = sz( el, 'borderTopWidth' ),
						l = sz( el, 'borderLeftWidth' );
					var fixT = t ? '(0 - ' + t + ')' : 0;
					var fixL = l ? '(0 - ' + l + ')' : 0;
				}

				// Simulate fixed positioning for IE6.
				$.each( layers, function ( i, o ) {
					var s = o[0].style;
					s.position = 'absolute'; // Force absolute positioning.
					if ( i < 2 ) { // Iframe and overlay layers.
						if ( full ) {
							s.setExpression( 'height', 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:' + opts.quirksmodeOffsetHack + ') + "px"' );
						} else {
							s.setExpression( 'height', 'this.parentNode.offsetHeight + "px"' );
						}
						if ( full ) {
							s.setExpression( 'width', 'jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"' );
						} else {
							s.setExpression( 'width', 'this.parentNode.offsetWidth + "px"' );
						}
						if ( fixL ) {
							s.setExpression( 'left', fixL );
						}
						if ( fixT ) {
							s.setExpression( 'top', fixT );
						}
					} else if ( opts.centerY ) { // Message layer, centered vertically.
						if ( full ) {
							s.setExpression( 'top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"' );
						}
						s.marginTop = 0;
					} else if ( !opts.centerY && full ) { // Message layer, not centered, full page.
						var top        = ( opts.css && opts.css.top ) ? parseInt( opts.css.top, 10 ) : 0;
						var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + ' + top + ') + "px"';
						s.setExpression( 'top', expression );
					}
				} );
			}

			// Display the message content.
			if ( msg ) {
				if ( opts.theme ) {
					lyr3.find( '.ui-widget-content' ).append( msg );
				} else {
					lyr3.append( msg );
				}
				if ( msg.jquery || msg.nodeType ) {
					$( msg ).show(); // Ensure the message element is visible.
				}
			}

			// Show iframe and overlay (if applicable).
			if ( ( msie || opts.forceIframe ) && opts.showOverlay ) {
				lyr1.show(); // Iframe has opacity 0, so it's effectively invisible but blocks events.
			}

			// Handle fade-in animation.
			if ( opts.fadeIn ) {
				var cb  = opts.onBlock ? opts.onBlock : noOp;
				var cb1 = ( opts.showOverlay && !msg ) ? cb : noOp;
				var cb2 = msg ? cb : noOp;

				if ( opts.showOverlay ) {
					lyr2._fadeIn( opts.fadeIn, cb1 );
				}
				if ( msg ) {
					lyr3._fadeIn( opts.fadeIn, cb2 );
				}
			} else {
				// No fade-in, just show immediately.
				if ( opts.showOverlay ) {
					lyr2.show();
				}
				if ( msg ) {
					lyr3.show();
				}
				if ( opts.onBlock ) {
					opts.onBlock.bind( lyr3 )(); // Call onBlock callback.
				}
			}

			// Bind key and mouse events to prevent interaction with blocked content.
			bind( 1, el, opts );

			// If full page block, store references and potentially focus an input.
			if ( full ) {
				pageBlock    = lyr3[0];
				pageBlockEls = $( opts.focusableElements, pageBlock );
				if ( opts.focusInput ) {
					setTimeout( focus, 20 ); // Delay focus to ensure elements are rendered.
				}
			} else {
				// For element blocking, center the message.
				center( lyr3[0], opts.centerX, opts.centerY );
			}

			// If a timeout is set, schedule auto-unblock.
			if ( opts.timeout ) {
				var to = setTimeout( function () {
					if ( full ) {
						$.unblockUI( opts );
					} else {
						$( el ).unblock( opts );
					}
				}, opts.timeout );
				$( el ).data( 'blockUI.timeout', to ); // Store timeout ID for potential clearing.
			}
		}

		/**
		 * Removes the blockUI overlay and message from the target element.
		 * @param {HTMLElement|Window} el - The element to unblock (or window for page unblocking).
		 * @param {object} opts - Options for the unblocking operation.
		 */
		function remove ( el, opts ) {

			var count;
			var full  = ( el == window );
			var $el   = $( el );
			var data  = $el.data( 'blockUI.history' );
			var to    = $el.data( 'blockUI.timeout' );

			// Clear any pending auto-unblock timeout.
			if ( to ) {
				clearTimeout( to );
				$el.removeData( 'blockUI.timeout' );
			}

			// Merge default options with user-provided options.
			opts = $.extend( {}, $.blockUI.defaults, opts || {} );

			// Unbind events (0 indicates unbind).
			bind( 0, el, opts );

			// Retrieve onUnblock callback if not explicitly provided.
			if ( opts.onUnblock === null ) {
				opts.onUnblock = $el.data( 'blockUI.onUnblock' );
				$el.removeData( 'blockUI.onUnblock' );
			}

			var els;
			// Select the blockUI elements. Handles IE6/7 oddities.
			if ( full ) {
				els = $( 'body' ).children().filter( '.blockUI' ).add( 'body > .blockUI' );
			} else {
				els = $el.find( '>.blockUI' );
			}

			// Fix cursor issue by resetting it.
			if ( opts.cursorReset ) {
				if ( els.length > 1 ) {
					els[1].style.cursor = opts.cursorReset;
				}
				if ( els.length > 2 ) {
					els[2].style.cursor = opts.cursorReset;
				}
			}

			// Clear page block references if unblocking the full page.
			if ( full ) {
				pageBlock = pageBlockEls = null;
			}

			// Handle fade-out animation.
			if ( opts.fadeOut ) {
				count = els.length; // Number of elements to fade out.
				els.stop().fadeOut( opts.fadeOut, function () {
					// When all elements have faded out, reset their state.
					if ( --count === 0 ) {
						reset( els, data, opts, el );
					}
				} );
			} else {
				// No fade-out, just reset immediately.
				reset( els, data, opts, el );
			}
		}
	}
})();
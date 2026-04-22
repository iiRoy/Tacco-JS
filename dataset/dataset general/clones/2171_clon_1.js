/*
 * jQuery HC-Sticky Plugin
 * =======================
 *
 * Version: 1.2.43
 * Copyright: (c) Some Web Media - All rights reserved.
 * Author: Some Web Guy
 * Author URL: http://twitter.com/some_web_guy
 * Official Website: http://someweblog.com/
 * Plugin Repository: https://github.com/somewebmedia/hc-sticky
 * License: Released under the MIT License - See www.opensource.org/licenses/mit-license.php for details.
 * Description: A versatile, cross-browser jQuery plugin designed to make any specified HTML element
 *              "sticky" or "fixed" on the page, ensuring it remains visible to the user during scrolling.
 */

( function ( $,   window,   undefined ) {
	"use strict"; // Enforce strict mode for cleaner, safer code.

	// A handy console.log shortcut function for debugging purposes.
	var log = function ( t ) {
		console.log ( t );
	};


	// Cache frequently used jQuery objects and native DOM elements for performance.
	var $window   = $ ( window ) ,
		document  = window.document ,
		$document = $ ( document ) ;

	// Immediately-invoked function expression (IIFE) to detect Internet Explorer version.
	// This uses conditional comments, a common technique for IE-specific targeting.
	var ie = ( function () {
		var undef ,
			v     = 3 , // Starting version check from IE4
			div   = document.createElement ( 'div' ) ,
			all   = div.getElementsByTagName ( 'i' ) ;

		// Loop to find the highest IE version supported by conditional comments.
		while ( div.innerHTML = '<!--[if gt IE ' + ( ++v ) + ']><i></i><![endif]-->' , all [ 0 ] ) {
			// Intentionally empty loop body; the condition does the work.
		};

		// Return the detected IE version, or 'undef' if not IE or IE <= 4.
		return v > 4 ? v : undef ;
	} ) () ;


	/*
	 *------------------------------------------------------------------------------------------------------------------
	 *                                                Global Utility Functions
	 *------------------------------------------------------------------------------------------------------------------
	 */


	// Function to determine the current scroll position, direction, and distance scrolled.
	// It caches previous scroll positions to calculate direction.
	var getScroll = function () {
		var pageXOffset = window.pageXOffset !== undefined ? window.pageXOffset : ( document.compatMode == "CSS1Compat" ? window.document.documentElement.scrollLeft : window.document.body.scrollLeft ) ,
			pageYOffset = window.pageYOffset !== undefined ? window.pageYOffset : ( document.compatMode == "CSS1Compat" ? window.document.documentElement.scrollTop : window.document.body.scrollTop ) ;

		// Initialize scroll 'x' and 'y' if not already set.
		if ( typeof getScroll.x == 'undefined' ) {
			getScroll.x = pageXOffset ;
			getScroll.y = pageYOffset ;
		}
		// Initialize scroll distance if not already set.
		if ( typeof getScroll.distanceX == 'undefined' ) {
			getScroll.distanceX = pageXOffset ;
			getScroll.distanceY = pageYOffset ;
		} else {
			// Calculate scroll distance since the last check.
			getScroll.distanceX = pageXOffset - getScroll.x ;
			getScroll.distanceY = pageYOffset - getScroll.y ;
		}

		// Calculate the difference from the previous scroll position to determine direction.
		var diffX = getScroll.x - pageXOffset ,
			diffY = getScroll.y - pageYOffset ;

		// Determine scroll direction based on differences.
		getScroll.direction = diffX < 0
			? 'right'
			: diffX > 0
				? 'left'
				: diffY <= 0
					? 'down'
					: diffY > 0
						? 'up'
						: 'first' ; // 'first' for the initial call or no movement.

		// Update cached scroll positions for the next iteration.
		getScroll.x = pageXOffset ;
		getScroll.y = pageYOffset ;
	} ;
	// Attach the getScroll function to the window's scroll event.
	$window.on ( 'scroll' , getScroll ) ;


	// Custom jQuery plugin to reliably get computed CSS styles.
	// This addresses inconsistencies in cross-browser style retrieval.
	$.fn.style = function ( style ) {

		// If no style is requested, return null.
		if ( ! style ) return null ;

		var $this = $ ( this ) ,
			value ;

		// Clone the element to safely get computed styles without affecting the original.
		var $clone = $this.clone ( ) .css ( 'display' , 'none' ) ;

		// For radio buttons in the clone, randomize their 'name' attribute to prevent
		// unintended selection interference with the original radio buttons.
		$clone.find ( 'input:radio' ) .attr ( 'name' , 'copy-' + Math.floor ( ( Math.random ( ) * 100 ) + 1 ) ) ;

		// Insert the clone into the DOM temporarily.
		$this.after ( $clone ) ;

		// Helper function to get a specific style property from an element.
		var getStyle = function ( el , style ) {
			var val ;
			if ( el.currentStyle ) {
				// For IE (legacy), use currentStyle and convert CSS property names (e.g., 'padding-left' to 'paddingLeft').
				val = el.currentStyle [ style.replace ( /-\w/g , function ( s ) {
					return s.toUpperCase ( ) .replace ( '-' , '' )
				} ) ] ;
			} else if ( window.getComputedStyle ) {
				// For modern browsers, use getComputedStyle.
				val = document.defaultView.getComputedStyle ( el , null ) .getPropertyValue ( style ) ;
			}
			// Special handling for 'margin:auto' to ensure it's correctly reported.
			val = ( /margin/g.test ( style ) ) ? ( ( parseInt ( val ) === $this [ 0 ] .offsetLeft ) ? val : 'auto' ) : val ;
			return val ;
		} ;

		// If a single style string is provided, get its value.
		if ( typeof style == 'string' ) {
			value = getStyle ( $clone [ 0 ] , style ) ;
		} else {
			// If an array of style strings is provided, get all their values and return as an object.
			value = {} ;
			$.each ( style , function ( i , s ) {
				value [ s ] = getStyle ( $clone [ 0 ] , s ) ;
			} ) ;
		}

		// Remove the temporary clone from the DOM.
		$clone.remove ( ) ;

		// Return the retrieved style value(s) or null.
		return value || null ;
	} ;


	/*
	 *------------------------------------------------------------------------------------------------------------------
	 *                                                jQuery Plugin Definition
	 *------------------------------------------------------------------------------------------------------------------
	 */

	// Extend jQuery's prototype with the hcSticky plugin.
	$.fn.extend ( {

		hcSticky : function ( options ) {

			// If no elements are selected, return the jQuery object to maintain chainability.
			if ( this.length == 0 ) return this ;

			// Initialize plugin options, merging defaults with user-provided options.
			// It also defines internal methods accessible via `pluginOptions`.
			this.pluginOptions ( 'hcSticky' , {
				top             : 0 ,
				bottom          : 0 ,
				bottomEnd       : 0 ,
				innerTop        : 0 ,
				innerSticker    : null ,
				className       : 'sticky' ,
				wrapperClassName: 'wrapper-sticky' ,
				stickTo         : null ,
				responsive      : true ,
				followScroll    : true ,
				offResolutions  : null ,
				onStart         : $.noop , // No-operation function for callbacks.
				onStop          : $.noop ,
				on              : true ,   // Flag to enable/disable sticky behavior.
				fn              : null     // Internal property for storing function references.
			} , options || {} , {
				// Internal method to reinitialize the sticky element.
				reinit : function ( ) {
					// Simply call the hcSticky plugin again on the element.
					$ ( this ) .hcSticky ( ) ;
				} ,
				// Internal method to stop the sticky behavior, but keep the wrapper.
				stop   : function ( ) {
					$ ( this ) .pluginOptions ( 'hcSticky' , { on : false } ) .each ( function ( ) {
						var $this    = $ ( this ) ,
							options  = $this.pluginOptions ( 'hcSticky' ) ,
							$wrapper = $this.parent ( '.' + options.wrapperClassName ) ;

						// Calculate the current top position relative to its wrapper.
						var top = $this.offset ( ) .top - $wrapper.offset ( ) .top ;
						// Reset CSS properties to absolute positioning.
						$this.css ( {
							position: 'absolute' ,
							top     : top ,
							bottom  : 'auto' ,
							left    : 'auto' ,
							right   : 'auto'
						} ) .removeClass ( options.className ) ; // Remove sticky class.
					} ) ;
				} ,
				// Internal method to completely disable sticky behavior and reset styles.
				off    : function ( ) {
					$ ( this ) .pluginOptions ( 'hcSticky' , { on : false } ) .each ( function ( ) {
						var $this    = $ ( this ) ,
							options  = $this.pluginOptions ( 'hcSticky' ) ,
							$wrapper = $this.parent ( '.' + options.wrapperClassName ) ;

						// Clear positioning styles and remove sticky class.
						$this.css ( {
							position: 'relative' ,
							top     : 'auto' ,
							bottom  : 'auto' ,
							left    : 'auto' ,
							right   : 'auto'
						} ) .removeClass ( options.className ) ;

						// Reset wrapper height.
						$wrapper.css ( 'height' , 'auto' ) ;
					} ) ;
				} ,
				// Internal method to re-enable sticky behavior.
				on     : function ( ) {
					$ ( this ) .each ( function ( ) {
						$ ( this ) .pluginOptions ( 'hcSticky' , {
							on      : true ,
							remember: {
								offsetTop : $window.scrollTop ( )
							}
						} ) .hcSticky ( ) ; // Re-call hcSticky to apply changes.
					} ) ;
				} ,
				// Internal method to completely destroy the sticky instance.
				destroy: function ( ) {
					var $this    = $ ( this ) ,
						options  = $this.pluginOptions ( 'hcSticky' ) ,
						$wrapper = $this.parent ( '.' + options.wrapperClassName ) ;

					// Reset element's position to its original state before wrapping.
					$this.removeData ( 'hcStickyInit' ) .css ( {
						position: $wrapper.css ( 'position' ) ,
						top     : $wrapper.css ( 'top' ) ,
						bottom  : $wrapper.css ( 'bottom' ) ,
						left    : $wrapper.css ( 'left' ) ,
						right   : $wrapper.css ( 'right' )
					} ) .removeClass ( options.className ) ;

					// Remove event listeners registered by this instance.
					$window.off ( 'resize' , options.fn.resize ) .off ( 'scroll' , options.fn.scroll ) ;

					// Unwrap the element, removing the wrapper.
					$this.unwrap ( ) ;
				}
			} ) ;

			// Handle 'on'/'off' options passed directly during initialization.
			if ( options && typeof options.on != 'undefined' ) {
				if ( options.on ) {
					this.hcSticky ( 'on' ) ;
				} else {
					this.hcSticky ( 'off' ) ;
				}
			}

			// If the options argument is a string, it's likely a method call (e.g., 'destroy').
			// In that case, the method has already been handled by `pluginOptions`, so return.
			if ( typeof options == 'string' ) return this ;

			// Iterate over each selected element to apply the sticky behavior.
			return this.each ( function ( ) {

				var $this   = $ ( this ) ,
					options = $this.pluginOptions ( 'hcSticky' ) ;

				// Determine or create the wrapper element for the sticky item.
				var $wrapper = ( function ( ) { // Check if a wrapper already exists.
						var $this_wrapper = $this.parent ( '.' + options.wrapperClassName ) ;
						if ( $this_wrapper.length > 0 ) {
							// If wrapper exists, update its height and width.
							$this_wrapper.css ( {
								'height': $this.outerHeight ( true ) ,
								'width' : ( function ( ) {
									// Handle percentage widths or 'auto' widths for the wrapper.
									var width = $this_wrapper.style ( 'width' ) ;
									if ( width.indexOf ( '%' ) >= 0 || width == 'auto' ) {
										// Adjust inner element width if box-sizing is border-box.
										if ( $this.css ( 'box-sizing' ) == 'border-box' || $this.css ( '-moz-box-sizing' ) == 'border-box' ) {
											$this.css ( 'width' , $this_wrapper.width ( ) ) ;
										} else {
											$this.css ( 'width' , $this_wrapper.width ( ) - parseInt ( $this.css ( 'padding-left' ) - parseInt ( $this.css ( 'padding-right' ) ) ) ) ;
										}
										return width ;
									} else {
										// Otherwise, use the outer width of the sticky element.
										return $this.outerWidth ( true ) ;
									}
								} ) ( )
							} ) ;
							return $this_wrapper ;
						} else {
							return false ; // No existing wrapper.
						}
					} ) ( ) || ( function ( ) { // If no wrapper exists, create a new one.

						// Get initial CSS properties of the element to apply to the wrapper.
						var this_css = $this.style ( [ 'width' , 'margin-left' , 'left' , 'right' , 'top' , 'bottom' , 'float' , 'display' ] ) ;
						var display  = $this.css ( 'display' ) ;

						// Create the new wrapper div with appropriate styles.
						var $this_wrapper = $ ( '<div>' , {
							'class': options.wrapperClassName
						} ) .css ( {
							'display'       : display ,
							'height'        : $this.outerHeight ( true ) ,
							'width'         : ( function ( ) {
								// Calculate width for the wrapper, considering percentage, 'auto', and inline/block display.
								if ( this_css [ 'width' ] .indexOf ( '%' ) >= 0 || ( this_css [ 'width' ] == 'auto' && display != 'inline-block' && display != 'inline' ) ) {
									$this.css ( 'width' , parseFloat ( $this.css ( 'width' ) ) ) ;
									return this_css [ 'width' ] ;
								} else if ( this_css [ 'width' ] == 'auto' && ( display == 'inline-block' || display == 'inline' ) ) {
									return $this.width ( ) ;
								} else {
									return ( this_css [ 'margin-left' ] == 'auto' ) ? $this.outerWidth ( ) : $this.outerWidth ( true ) ;
								}
							} ) ( ) ,
							'margin'        : ( this_css [ 'margin-left' ] ) ? 'auto' : null , // Preserve 'margin:auto' if present.
							'position'      : ( function ( ) {
								var position = $this.css ( 'position' ) ;
								return position == 'static' ? 'relative' : position ; // Wrapper should not be static.
							} ) ( ) ,
							'float'         : this_css [ 'float' ] || null ,
							'left'          : this_css [ 'left' ] ,
							'right'         : this_css [ 'right' ] ,
							'top'           : this_css [ 'top' ] ,
							'bottom'        : this_css [ 'bottom' ] ,
							'vertical-align': 'top'
						} ) ;

						// Wrap the original element with the newly created wrapper.
						$this.wrap ( $this_wrapper ) ;

						// IE7 inline-block fix: add a zoom property to trigger hasLayout.
						if ( ie === 7 ) {
							if ( $ ( 'head' ) .find ( 'style#hcsticky-iefix' ) .length === 0 ) {
								$ ( '<style id="hcsticky-iefix">.' + options.wrapperClassName + ' {zoom: 1;}</style>' ) .appendTo ( 'head' ) ;
							}
						}

						// Return the newly created wrapper element.
						return $this.parent ( ) ;
					} ) ( ) ;


				// Check if the sticky element has already been initialized. If so, return early.
				if ( $this.data ( 'hcStickyInit' ) ) return ;

				// Mark the element as initialized to prevent double initialization.
				$this.data ( 'hcStickyInit' , true ) ;


				// Determine if the 'stickTo' option refers to the document body.
				var stickTo_document = options.stickTo && ( options.stickTo == 'document' || ( options.stickTo.nodeType && options.stickTo.nodeType == 9 ) || ( typeof options.stickTo == 'object' && options.stickTo instanceof ( typeof HTMLDocument != 'undefined' ? HTMLDocument : Document ) ) ) ? true : false ;

				// Identify the container element that the sticky element will stick within.
				var $container = options.stickTo
					? stickTo_document
						? $document
						: typeof options.stickTo == 'string'
							? $ ( options.stickTo )
							: options.stickTo
					: $wrapper.parent ( ) ;

				// Reset the sticky element's positioning styles to 'auto' initially.
				$this.css ( {
					top   : 'auto' ,
					bottom: 'auto' ,
					left  : 'auto' ,
					right : 'auto'
				} ) ;

				// Attach a load event handler to the window. This ensures that if images
				// or other content load later, the height of the sticky element is re-evaluated.
				$window.load ( function ( ) {
					// If the element's height exceeds its container's height, reinitialize.
					if ( $this.outerHeight ( true ) > $container.height ( ) ) {
						$wrapper.css ( 'height' , $this.outerHeight ( true ) ) ;
						$this.hcSticky ( 'reinit' ) ;
					}
				} ) ;

				// Internal function to apply 'fixed' positioning to the sticky element.
				var _setFixed = function ( args ) {
						// If the element already has the sticky class, no need to reapply.
						if ( $this.hasClass ( options.className ) ) return ;

						// Apply specified CSS styles for fixed positioning.
						args = args || {} ;
						$this.css ( {
							position: 'fixed' ,
							top     : args.top || 0 ,
							left    : args.left || $wrapper.offset ( ) .left
						} ) .addClass ( options.className ) ;

						// Trigger the onStart callback.
						options.onStart.apply ( $this [ 0 ] ) ;
						// Add active class to the wrapper.
						$wrapper.addClass ( 'sticky-active' ) ;
					} ,
					// Internal function to reset the sticky element to its original (or absolute) position.
					_reset    = function ( args ) {
						args = args || {} ;
						args.position = args.position || 'absolute' ;
						args.top      = args.top || 0 ;
						args.left     = args.left || 0 ;

						// Only apply CSS if the element's current state is 'fixed' or its top position is different.
						if ( $this.css ( 'position' ) != 'fixed' && parseInt ( $this.css ( 'top' ) ) == args.top ) return ;

						// Apply specified CSS styles for resetting position.
						$this.css ( {
							position: args.position ,
							top     : args.top ,
							left    : args.left
						} ) .removeClass ( options.className ) ;

						// Trigger the onStop callback.
						options.onStop.apply ( $this [ 0 ] ) ;
						// Remove active class from the wrapper.
						$wrapper.removeClass ( 'sticky-active' ) ;
					} ;

				// The main scroll handling function for the sticky behavior.
				var onScroll = function ( init ) {

					// If sticky behavior is turned off or the element is hidden, do nothing.
					if ( ! options.on || ! $this.is ( ':visible' ) ) return ;

					// If the sticky element is taller than its container, it cannot be sticky. Reset it.
					if ( $this.outerHeight ( true ) >= $container.height ( ) ) {
						_reset ( ) ;
						return ;
					}

					// Calculate various position and dimension variables.
					var top_spacing       = ( options.innerSticker ) ? $ ( options.innerSticker ) .position ( ) .top : ( ( options.innerTop ) ? options.innerTop : 0 ) ,
						wrapper_inner_top = $wrapper.offset ( ) .top ,
						bottom_limit      = $container.height ( ) - options.bottomEnd + ( stickTo_document ? 0 : wrapper_inner_top ) ,
						top_limit         = $wrapper.offset ( ) .top - options.top + top_spacing ,
						this_height       = $this.outerHeight ( true ) + options.bottom ,
						window_height     = $window.height ( ) ,
						offset_top        = $window.scrollTop ( ) ,
						this_document_top = $this.offset ( ) .top ,
						this_window_top   = this_document_top - offset_top ,
						bottom_distance ;


					// Handle "remember" state, used when sticky is re-enabled to smoothly transition.
					if ( typeof options.remember != 'undefined' && options.remember ) {

						var position_top = this_document_top - options.top - top_spacing ;

						if ( this_height - top_spacing > window_height && options.followScroll ) {
							// Element is taller than window, and followScroll is enabled.
							if ( position_top < offset_top && offset_top + window_height <= position_top + $this.height ( ) ) {
								// If element is currently in view and within its sticky range,
								// let primary calculations take over.
								options.remember = false ;
							}

						} else {
							// Element is smaller than window, or followScroll is disabled.
							if ( options.remember.offsetTop > position_top ) {
								// Sliding up.
								if ( offset_top <= position_top ) {
									_setFixed ( {
										top: options.top - top_spacing
									} ) ;
									options.remember = false ;
								}
							} else {
								// Sliding down.
								if ( offset_top >= position_top ) {
									_setFixed ( {
										top: options.top - top_spacing
									} ) ;
									options.remember = false ;
								}
							}

						}

						return ; // Exit onScroll while 'remember' is active.
					}


					// Main logic for determining sticky state based on scroll position.
					if ( offset_top > top_limit ) {

						// This part handles complex scenarios, especially when the sticky element
						// is taller than the viewport and `followScroll` is active.
						// The condition checks if the bottom of the sticky element has reached
						// or passed the bottom limit of its container.
						if ( bottom_limit + options.bottom - ( options.followScroll && window_height < this_height ? 0 : options.top ) <= offset_top + this_height - top_spacing - ( ( this_height - top_spacing > window_height - ( top_limit - top_spacing ) && options.followScroll ) ? ( ( ( bottom_distance = this_height - window_height - top_spacing ) > 0 ) ? bottom_distance : 0 ) : 0 ) ) {
							// Bottom of the sticky element has reached the container's end.
							_reset ( {
								top: bottom_limit - this_height + options.bottom - wrapper_inner_top
							} ) ;
						} else if ( this_height - top_spacing > window_height && options.followScroll ) {

							// Scenario: Sticky element is taller than the window, and `followScroll` is enabled.
							if ( this_window_top + this_height <= window_height ) {
								// If the bottom of the element is visible in the window.
								if ( getScroll.direction == 'down' ) {
									// Scrolling down: stick to the bottom of the window.
									_setFixed ( {
										top: window_height - this_height
									} ) ;
								} else {
									// Scrolling up: if fixed, reset to absolute to allow scrolling up past its original position.
									if ( this_window_top < 0 && $this.css ( 'position' ) == 'fixed' ) {
										_reset ( {
											top: this_document_top - ( top_limit + options.top - top_spacing ) - getScroll.distanceY
										} ) ;
									}
								}

							} else {
								// The element is taller than the window, but its bottom is not yet visible.
								if ( getScroll.direction == 'up' && this_document_top >= offset_top + options.top - top_spacing ) {
									// Scrolling up: stick to the top of the window.
									_setFixed ( {
										top: options.top - top_spacing
									} ) ;
								} else if ( getScroll.direction == 'down' && this_document_top + this_height > window_height && $this.css ( 'position' ) == 'fixed' ) {
									// Scrolling down: if fixed, reset to absolute to allow scrolling down.
									_reset ( {
										top: this_document_top - ( top_limit + options.top - top_spacing ) - getScroll.distanceY
									} ) ;
								}

							}
						} else {
							// Default sticky behavior: element is smaller than window or followScroll is off.
							// Set to fixed position at the top.
							_setFixed ( {
								top: options.top - top_spacing
							} ) ;
						}
					} else {
						// Reset the element to its original (non-sticky) position if scroll position is above the top limit.
						_reset ( ) ;
					}

				} ;


				// Variables for handling resize events and responsive behavior.
				var resize_timeout = false ,
					$resize_clone  = false ;

				// Function to handle window resize events.
				var onResize = function ( ) {

					// Re-attach scroll event handler (ensures it's always active after resize).
					attachScroll ( ) ;

					// Check if responsive resolutions dictate turning sticky off.
					checkResolutions ( ) ;

					// If sticky behavior is currently off, return early.
					if ( ! options.on ) return ;

					// Helper function to set the left position of the sticky element.
					var setLeft = function ( ) {
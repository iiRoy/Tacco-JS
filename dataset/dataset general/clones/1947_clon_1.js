/*
 * cvi_istack_lib.js - Version 1.1 (Released: 2010-08-10)
 * Copyright (c) 2010 by Christian Effenberger. All Rights Reserved.
 * Source website: istack.netzgesta.de
 *
 * This library provides support for various image manipulation scripts:
 * cvi_bevel.js, cvi_corner.js, cvi_curl.js, cvi_edge.js,
 * cvi_glossy.js, cvi_instant.js, cvi_reflex.js, cvi_slide.js,
 * cvi_sphere.js, cvi_strip.js.
 *
 * Distributed under the Netzgestade Non-commercial Software License Agreement.
 * Usage is free of charge for non-commercial and private web sites only,
 * subject to specific conditions. For full details, please refer to:
 * http://www.netzgesta.de/cvi/LICENSE.html
 *
 * --- API Syntax Overview ---
 *
 * Configuration Defaults:
 *   cvi_istack.defaultImagearray   = null;       // Object Array, e.g., an array of 'photos'
 *
 *   Example 'photos' array structure:
 *     var photos = [
 *       { source: 'path/to/image1.jpg' },                 // Required image source
 *       { source: 'path/to/image2.jpg',
 *         options: '{tilt:"r", glow:true}' }  // Optional script-specific options
 *     ];
 *
 *   cvi_istack.defaultMainwidth    = 128;      // Integer: Minimum 80px width for main display
 *   cvi_istack.defaultMainheight   = 128;      // Integer: Minimum 80px height for main display
 *   cvi_istack.defaultPlayframes   = 20;       // Integer: 1-100, number of frames for fading (each ~30ms)
 *   cvi_istack.defaultPlaydelay    = 5000;     // Integer: Milliseconds (1/1000s) delay between image changes
 *   cvi_istack.defaultLoadtimeout  = 3000;     // Integer: Milliseconds (1/1000s) timeout for image loading
 *   cvi_istack.defaultNoiefade     = false;    // Boolean: Set to true to disable IE's Alpha filter for fades (can cause rough edges)
 *   cvi_istack.defaultPlayscript   = '';       // String: Name of the CVI script to use, e.g., 'cvi_bevel'
 *                                              // Supported scripts: 'cvi_bevel', 'cvi_corner', 'cvi_curl', 'cvi_edge',
 *                                              // 'cvi_glossy', 'cvi_instant', 'cvi_reflex', 'cvi_slide',
 *                                              // 'cvi_sphere', 'cvi_strip'
 *
 * Public Methods:
 *   cvi_istack.add( object, options );    // Initializes the image stack on a given DOM object.
 *   cvi_istack.play( object );            // Starts the image playback for the specified object.
 *   cvi_istack.pause( object );           // Pauses the image playback.
 *   cvi_istack.remove( object );          // Cleans up and removes the image stack from the object.
 *
 * Read-only Properties:
 *   cvi_istack.version;                   // Float: Current library version number.
 *   cvi_istack.released;                  // String: Release date and time.
 *
 */

var cvi_istack = {
	version:          1.0,           // Current library version number
	released:         '2009-06-17 13:36:00', // Release date and time of this version

	defaultImagearray: null,          // Default array of image objects
	defaultMainwidth:  128,           // Default width for the main image display
	defaultMainheight: 128,           // Default height for the main image display
	defaultLoadtimeout: 3000,         // Default timeout for loading individual images
	defaultPlaydelay:  5000,          // Default delay between image transitions
	defaultPlayframes: 20,            // Default number of frames for fade transitions
	defaultPlayscript: '',            // Default script to apply to images (e.g., 'cvi_bevel')
	defaultNoiefade:   false,         // Default setting to disable IE's alpha filter fade

	add: function ( obj, opts ) {
		// Helper function to get an argument from options or default object options
		function getArg( a, t ) {
			return ( typeof opts[a] === t ? opts[a] : obj.opts[a] );
		}

		// Helper function to generate a unique ID for elements
		function uniqueID() {
			var val = Date.parse( new Date() ) + Math.floor( Math.random() * 100000000000 );
			return val.toString( 16 );
		}

		// Check if the object is a DIV element and not already active
		if ( obj && obj.tagName.toUpperCase() == "DIV" && !obj.active ) {
			// Create a temporary canvas element to check browser capabilities
			var temp = cvi_istack.E( 'canvas' );

			// Determine browser environment (Trident for IE, canvas support)
			obj.trident = document.all && document.namespaces && !window.opera && ( !document.documentMode || document.documentMode < 9 ) ? 1 : 0;
			obj.notrans = obj.trident && !window.XMLHttpRequest ? 1 : 0; // Check for old IE without XMLHttpRequest
			obj.canvas  = temp.getContext ? 1 : 0; // Check for canvas API support

			// Proceed only if Trident (IE) or Canvas is supported
			if ( obj.trident || obj.canvas ) {
				// Define default options for the instance
				var defopts = {
					"imagearray":  cvi_istack.defaultImagearray,
					"mainwidth":   cvi_istack.defaultMainwidth,
					"mainheight":  cvi_istack.defaultMainheight,
					"loadtimeout": cvi_istack.defaultLoadtimeout,
					"playframes":  cvi_istack.defaultPlayframes,
					"playdelay":   cvi_istack.defaultPlaydelay,
					"playscript":  cvi_istack.defaultPlayscript,
					"noiefade":    cvi_istack.defaultNoiefade
				};

				// Merge user-provided options with defaults
				if ( opts ) {
					for ( i in defopts ) {
						if ( !opts[i] ) {
							opts[i] = defopts[i];
						}
					}
				} else {
					// If no options are provided, use all defaults
					opts = defopts;
				}

				// Initialize image array from options
				temp = ( typeof opts['imagearray'] === 'object' ? opts['imagearray'] : new Array() );

				// Check if there are sufficient images to process
				if ( temp.length && temp.length >= 1 ) {
					obj.photo       = temp; // Assign the image array to the object
					temp            = '';   // Clear temp
					delete opts['imagearray']; // Remove imagearray from options as it's now in obj.photo
					obj.id          = obj.id != 'undefined' ? obj.id : uniqueID(); // Assign ID or generate new one
					obj.opts        = opts; // Store options on the object

					// Parse and set main dimensions, ensuring minimums
					obj.mainwidth   = parseInt( Math.max( 32, getArg( 'mainwidth', 'number' ) ) );
					obj.mainheight  = parseInt( Math.max( 32, getArg( 'mainheight', 'number' ) ) );

					// Parse and set timeouts and frame counts, ensuring minimums/maximums
					obj.loadtimeout = parseInt( Math.max( 1000, getArg( 'loadtimeout', 'number' ) ) );
					obj.playframes  = parseInt( Math.max( 1, Math.min( 100, getArg( 'playframes', 'number' ) ) ) );

					// Calculate play delay, adjusting for IE fade if enabled
					obj.playdelay   = parseInt( Math.max( 1000, getArg( 'playdelay', 'number' ) ) ) + ( obj.trident && obj.noiefade ? 0 : ( obj.playframes * 30 ) );

					// Set noiefade and playscript properties
					obj.noiefade    = getArg( 'noiefade', 'boolean' );
					obj.playscript  = getArg( 'playscript', 'string' );
					obj.pureimgs    = ( obj.playscript == '' ? true : false ); // Determine if pure images or script-enhanced

					// If a playscript is defined, check its availability
					if ( !obj.pureimgs ) {
						obj.playscript += '.add'; // Append '.add' for script invocation
						// Check if the script's 'add' function exists
						obj.active = eval( 'typeof ' + obj.playscript + '=="function";' );
					} else {
						obj.active = true; // No playscript, so it's active by default
					}

					// If active, clear content and start preloading
					if ( obj.active ) {
						obj.innerHTML = ''; // Clear existing content
						cvi_istack._preload( obj, 0, 0 ); // Start preloading images
					} else {
						obj.active = false; // Mark as inactive if script not found
						cvi_istack.L( 'error', '[exit] cvi_istack.add(): unsupported playscript' );
					}
				} else {
					cvi_istack.L( 'error', '[exit] cvi_istack.add(): insufficient images' );
				}
			} else {
				cvi_istack.L( 'error', '[exit] cvi_istack.add(): unsupported browser' );
			}
		}
		return false; // Return false if initialization failed or conditions not met
	},


	_preload: function ( obj, cnt, cur ) {
		// Ensure the object exists and is active before proceeding
		if ( obj && typeof ( obj.active ) === "boolean" && obj.active ) {
			var ele, img = null; // Declare variables for element and image

			// Clear any existing timer to prevent multiple concurrent preloads
			if ( obj.timer ) {
				window.clearTimeout( obj.timer );
			}

			// If there are still images to preload
			if ( cnt < obj.photo.length ) {
				// Set a timeout for loading the current image
				obj.timer = window.setTimeout( function () {
					cnt++; // Increment count for next image
					cvi_istack._preload( obj, cnt, cur ); // Recurse to preload next image
				}, obj.loadtimeout );

				img = new Image(); // Create a new Image object

				// --- Event Handlers for Image Loading ---
				img.onabort = function () {
					cnt = obj.photo.length; // Set count to end to stop preloading
					cvi_istack._preload( obj, cnt, cur ); // Continue to process remaining images (which will be removed)
				};

				img.onerror = function () {
					cnt++; // Increment count to skip this image
					cvi_istack._preload( obj, cnt, cur ); // Continue with next image
				};

				img.onload = function () {
					// Check if image loaded successfully and has valid dimensions
					if ( img.width && img.height && img.width >= 32 && img.height >= 32 ) {
						obj.photo[cnt].loaded = true; // Mark image as loaded
						ele                   = cvi_istack.E( 'img' ); // Create an <img> element
						ele.id                = obj.id + "_" + cur; // Assign a unique ID
						ele.src               = img.src; // Set the image source

						// Style the image for absolute positioning and hiding
						ele.style.position = 'absolute';
						ele.style.display  = 'block';
						ele.style.visibility = 'hidden';

						// Set dimensions and position
						ele.width            = obj.mainwidth;
						ele.height           = obj.mainheight;
						ele.style.width      = obj.mainwidth + 'px';
						ele.style.height     = obj.mainheight + 'px';
						ele.style.left       = '0px';
						ele.style.top        = '0px';

						obj.appendChild( ele ); // Add the image to the main object

						// Apply playscript if configured
						if ( !obj.pureimgs ) {
							if ( obj.photo[cnt].options && obj.photo[cnt].options != '' ) {
								eval( obj.playscript + '(ele,' + obj.photo[cnt].options + ');' );
							} else {
								eval( obj.playscript + '(ele);' );
							}
						}
					}

					window.clearTimeout( obj.timer ); // Clear the current loading timeout

					// For Trident (IE), clear onload to prevent memory leaks
					if ( obj.trident ) {
						img.onload = '';
						img        = null;
					}

					cnt++; // Increment image counter
					cur++; // Increment current image index
					cvi_istack._preload( obj, cnt, cur ); // Recurse to preload the next image
				};

				img.src = obj.photo[cnt].source; // Start loading the image by setting its source

			} else {
				// All images have been processed (loaded or skipped)
				// Filter out any images that failed to load
				for ( var i = 0; i < obj.photo.length; i++ ) {
					if ( !obj.photo[i].loaded ) {
						obj.photo.splice( i, 1 ); // Remove unloaded image
						i--; // Adjust index due to splice
					}
				}
				obj.curimg = 0; // Initialize current image index
				obj.lstimg = 0; // Initialize last image index
				cvi_istack.play( obj ); // Start playing the image stack
			}
		} else {
			cvi_istack.L( 'warn', 'cvi_istack._preload(): object does not exist or is inactive' );
		}
		return false; // Always return false
	},


	play: function ( obj ) {
		// Ensure the object exists and is active
		if ( obj && typeof ( obj.active ) === "boolean" && obj.active ) {
			var fo, fi, fade, ele = cvi_istack.G( obj.id + '_' + obj.curimg ); // Declare elements for foreground, background, fade timer, and current element

			if ( ele ) {
				ele.style.visibility = 'visible'; // Make the current image visible
			}

			// Proceed if there's more than one image to play
			if ( obj.photo.length > 1 ) {
				if ( obj.timer ) {
					window.clearInterval( obj.timer ); // Clear any existing play timer
				}

				// Set up the main interval for image transitions
				obj.timer = window.setInterval( function () {
					// Calculate next image index, looping back to start if at end
					obj.curimg = ( obj.curimg < ( obj.photo.length - 1 ) ? obj.curimg + 1 : 0 );

					// Initialize fade parameters
					var q = 0, p = 100, c = 0, t = obj.playframes, k = p / t;

					// Get current foreground (next) and background (previous) images
					fi = cvi_istack.G( obj.id + '_' + obj.curimg );
					fo = cvi_istack.G( obj.id + '_' + obj.lstimg );

					if ( fi && fo ) {
						// Handle IE without fade filter (instant switch)
						if ( obj.trident && obj.noiefade ) {
							fo.style.visibility = 'hidden'; // Hide previous
							fi.style.visibility = 'visible'; // Show current
							obj.lstimg          = obj.curimg; // Update last image index
						} else {
							// Prepare images for fading
							if ( obj.trident ) {
								fo.style.filter = "alpha(opacity=100)"; // IE opacity for previous
							} else {
								fo.style.opacity = 1; // Standard opacity for previous
							}
							fo.style.visibility = 'visible'; // Ensure previous is visible

							if ( obj.trident ) {
								fi.style.filter = "alpha(opacity=0)"; // IE opacity for current (start hidden)
							} else {
								fi.style.opacity = 0; // Standard opacity for current (start hidden)
							}
							fi.style.visibility = 'visible'; // Ensure current is visible

							if ( fade ) {
								window.clearInterval( fade ); // Clear any previous fade timer
							}

							// Start the fade transition interval
							fade = window.setInterval( function () {
								q += k; // Increment current image opacity
								if ( obj.trident ) {
									fi.style.filter = "alpha(opacity=" + q + ")";
								} else {
									fi.style.opacity = q / 100;
								}

								p -= k; // Decrement previous image opacity
								if ( obj.trident ) {
									fo.style.filter = "alpha(opacity=" + p + ")";
								} else {
									fo.style.opacity = p / 100;
								}

								c++; // Increment frame counter
								if ( c > t ) {
									// Fade transition complete
									window.clearInterval( fade ); // Stop fade timer

									// Ensure final opacity states
									if ( obj.trident ) {
										fi.style.filter = "alpha(opacity=100)"; // Current fully opaque
										fi.style.filter = ""; // Clear filter for current
										fo.style.filter = "alpha(opacity=0)"; // Previous fully transparent
									} else {
										fi.style.opacity = 1; // Current fully opaque
										fo.style.opacity = 0; // Previous fully transparent
									}

									fo.style.visibility = 'hidden'; // Hide previous image
									obj.lstimg          = obj.curimg; // Update last image index
								}
							}, 30 ); // Interval for each fade frame (30ms)
						}
					} else {
						window.clearInterval( obj.timer ); // Stop main timer if images not found
					}
				}, obj.playdelay ); // Interval for main image transitions
			}
		} else {
			cvi_istack.L( 'warn', 'cvi_istack.play(): object does not exist or is inactive' );
		}
		return false; // Always return false
	},


	pause: function ( obj ) {
		// Check if object exists and is active
		if ( obj && typeof ( obj.active ) === "boolean" && obj.active ) {
			if ( obj.timer ) {
				window.clearInterval( obj.timer ); // Clear the main play timer
			}
		} else {
			cvi_istack.L( 'warn', 'cvi_istack.pause(): object does not exist or is inactive' );
		}
		return false; // Always return false
	},


	remove: function ( obj ) {
		// Check if object exists and is active
		if ( obj && typeof ( obj.active ) === "boolean" && obj.active ) {
			if ( obj.timer ) {
				window.clearInterval( obj.timer ); // Clear any active timer
			}

			// If not Trident (IE), remove canvas elements
			if ( !obj.trident ) {
				var ele = obj.getElementsByTagName( 'canvas' );
				for ( var i = 0; i < ele.length; i++ ) {
					obj.removeChild( ele[i] ); // Remove each canvas child
				}
			}

			obj.innerHTML = ''; // Clear all inner HTML
			obj.active    = false; // Mark object as inactive
		} else {
			cvi_istack.L( 'warn', 'cvi_istack.remove(): object does not exist or is inactive' );
		}
		return false; // Always return false
	},


	// Logger function: logs messages to console, opera, or document title
	L: function ( s, v ) {
		s = s.toLowerCase() || 'log'; // Default to 'log' if s is empty
		if ( window.console ) {
			window.console[s]( v ); // Use browser console if available
		} else if ( window.opera ) {
			opera.postError( s + ': ' + v ); // Use Opera's error posting
		} else {
			window.document.title = s + ': ' + v; // Fallback to document title
		}
	},


	// Shorthand for getElementById
	G: function ( v ) {
		return ( document.getElementById( v ) );
	},


	// Shorthand for createElement
	E: function ( v ) {
		return ( document.createElement( v ) );
	},


	// Shorthand for appendChild
	A: function ( o, v ) {
		o.appendChild( v );
	}
};
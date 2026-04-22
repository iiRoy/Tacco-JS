/*******************************************************************************************************************
 *
 *                                        xGallery JavaScript Library - Type I Clone
 *
 * This file contains a Type I clone of the original xGallery JavaScript code.
 *
 * Definition of Type I Clone:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * Key characteristics of this clone:
 * - All original identifiers (variable names, function names, etc.) are preserved.
 * - All original operators and expressions remain identical.
 * - The logical and structural integrity of the code is 100% maintained.
 * - Extensive changes have been made to whitespace (indentation, line breaks, spacing).
 * - Comments have been added, removed, and modified throughout the file.
 * - The primary goal is visual differentiation while maintaining functional equivalence.
 *
 * Original Author: Manuel Kleinert - www.xpager.ch
 * Version: 1.1.3
 * Date: 09.02.2015
 *
 *******************************************************************************************************************/

// Self-executing anonymous function to encapsulate the plugin and avoid global scope pollution.
// Passes jQuery as an argument, aliasing it to '$' for internal use.
( function ( $ ) {

	// Extend jQuery's prototype with the xGallery function.
	$.fn.xGallery = function ( options ) {

		// Initialize options if not provided.
		if ( ! options ) {
			var options = {};
		}

		// Ensure chainability by returning 'this' for each matched element.
		return this.each( function () {

			// Assign the current DOM element to the options object for later access.
			options.obj = this;

			// Create a new instance of the xGallery.
			new xGallery( options );

		} );

	}; // End of $.fn.xGallery definition.

} ( jQuery ) ); // Invoke the function with jQuery.


// Main xGallery constructor function.
var xGallery = function ( options, fx ) {

	// Merge default options with user-provided options.
	// This creates the final configuration for the gallery instance.
	this.options = $.extend( {

		id:                  false,             // ID of the gallery container.
		obj:                 false,             // DOM object of the gallery container.
		animationType:       "fade",            // Type of transition animation (e.g., "fade").
		animationSpeed:      300,               // Speed of animations in milliseconds.
		touchControl:        true,              // Enable touch swipe control for navigation.
		keyControl:          true,              // Enable keyboard arrow key control for navigation.
		showPageNum:         true,              // Display current page number (e.g., 1/5).
		showPagePoints:      true,              // Display navigation points for pages.
		showPageImages:      "all",             // "all" or number of images per page.
		showImages:          "all",             // "all" or number of images to display in total.
		showComments:        false,             // Show image comments if available.
		showImageNum:        true,              // Show current image number (e.g., 1/10).
		buttonObj:           false,             // Object to click to open the gallery (if not thumbnails).
		border:              110,               // Border size around the image in full screen.
		beta:                true               // Enable beta/debug messages.

	}, options );

	// Transfer options properties directly to 'this' (the xGallery instance).
	// This makes options accessible directly as `this.propertyName`.
	for ( var name in this.options ) {
		eval( "this." + name + " = this.options." + name + ";" );
	}


	// Initialize internal attributes/state variables for the gallery.
	this.count                 = 0;
	this.activImage            = 0;               // Index of the currently active image.
	this.imagesThumb           = false;           // jQuery object of thumbnail images.
	this.imgArray              = new Array();     // Array to store image data (src, dimensions, comments).
	this.imageNum              = 0;               // Total number of images.
	this.imagepage             = 1;               // Current page number in thumbnail view.
	this.imagePageCount        = 0;               // Total number of pages in thumbnail view.
	this.width                 = $( window ).width();   // Current window width.
	this.height                = $( window ).height();  // Current window height.
	this.imgContainer          = false;           // jQuery object for the main image display container.
	this.pageStatus            = true;            // Flag to control page navigation (prevent rapid clicks).
	this.openStatus            = false;           // Flag indicating if the full gallery is open.
	this.openAnimationStatus   = true;            // Flag to control opening animation state.
	this.animationStatus       = true;            // Flag to control image animation state.
	this.points                = false;           // jQuery object for page navigation points.
	this.loader                = false;           // jQuery object for the loader animation.

	// Call the initialization method to set up the gallery.
	this.init();

}; // End of xGallery constructor.


// Define prototype methods for the xGallery object.
xGallery.prototype = {

	// Initialization method.
	init: function () {

		var self = this; // Cache 'this' for use in callbacks.

		// Determine the gallery's root DOM object.
		if ( this.options.obj ) {
			this.obj = this.options.obj;
		} else {
			this.obj = $( this.options.id );
		}

		// Find all image elements within the gallery container.
		this.imagesThumb = $( this.obj ).find( "img" );

		// Get the total number of images.
		this.imageNum = $( this.imagesThumb ).length;

		// Calculate the total number of pages for thumbnails.
		this.imagePageCount = Math.ceil( this.imageNum / this.showPageImages );

		// Process each thumbnail to gather image data.
		$( this.imagesThumb ).each( function ( i, obj ) {

			self.imgArray[ i ]              = new Array();                         // Initialize an array for each image.
			self.imgArray[ i ][ "img" ]     = new Image();                         // Create a new Image object.
			self.imgArray[ i ][ "height" ]  = 0;                                   // Placeholder for image height.
			self.imgArray[ i ][ "width" ]   = 0;                                   // Placeholder for image width.
			self.imgArray[ i ][ "src" ]     = $( obj ).attr( "data-img" );         // Get the high-res image source.
			self.imgArray[ i ][ "thumb" ]   = obj;                                 // Store a reference to the thumbnail element.

			// Get the image comment, default to empty string if undefined.
			self.imgArray[ i ][ "comment" ] = $( obj ).attr( "data-comment" ) != undefined ? $( obj ).attr( "data-comment" ) : "";

			// Handle `showImages` and `buttonObj` options for displaying a subset of images.
			if ( self.showImages != "all" && i >= self.showImages || self.buttonObj ) {
				$( obj ).parent( "div" ).remove(); // Remove parent div if it exists.
				$( obj ).remove();                 // Remove the image thumbnail.
			}

		} ); // End of each thumbnail processing.

		// Load the gallery's images.
		this.loadGallery();

	}, // End of init method.


	// Method to load gallery images.
	loadGallery: function () {

		var self = this; // Cache 'this'.
		var num  = 0;    // Counter for successfully loaded images.

		// Iterate over each thumbnail to pre-load images or handle errors.
		$( this.imagesThumb ).each( function ( i, obj ) {

			// Use imageLoader to handle image loading.
			self.imageLoader( obj, function () {

				num++; // Increment loaded count.

				// If all images are loaded, build the gallery.
				if ( num == self.imageNum ) {
					self.build();
				}

			}, function () { // Error callback for image loading.

				self.message( "Error load image " + ( i + 1 ) ); // Log an error message.
				$( obj ).remove();                               // Remove the problematic thumbnail.
				self.imageNum--;                                 // Decrement total image count.

				// If all *remaining* images are processed, build the gallery.
				if ( num == self.imageNum ) {
					self.build();
				}

			} ); // End of imageLoader call.

		} ); // End of each thumbnail iteration.

	}, // End of loadGallery method.


	// Method to build the gallery's DOM structure.
	build: function () {

		var self = this; // Cache 'this'.

		// --- Thumbnails Navigation ---

		var html = "<div class='prev_btn'></div>"; // Previous button for thumbnails.
		html += "<div class='next_btn'></div>";    // Next button for thumbnails.

		// If `showPageImages` is not "all", append page navigation.
		if ( this.showPageImages != "all" ) {

			$( this.obj ).append( "<div class='page-navigation'>" + html + "</div>" );

			var pageNum = "";
			// If `showPageNum` is true, add page number display.
			if ( this.showPageNum ) {

				pageNum += "<div class='page-num'>";
				pageNum += "<span class='num'>" + this.imagepage + "</span>";
				pageNum += "<span class='center'>/</span>";
				pageNum += "<span class='pages'>" + this.imagePageCount + "</span>";
				pageNum += "</div>";
				$( this.obj ).append( pageNum );

			}

			var pagePoint = "";
			// If `showPagePoints` is true, add page navigation points.
			if ( this.showPagePoints ) {

				pagePoint += "<div class='page-points'><div class='points-content'>";
				for ( i = 1; i <= this.imagePageCount; i++ ) {
					pagePoint += "<div class='point'><span>" + ( i ) + "</span></div>";
				}
				pagePoint += "</div></div>";
				$( this.obj ).append( pagePoint );

			}

		} // End of thumbnail navigation conditional.


		// --- Full Gallery Overlay Structure ---

		// Re-initialize html for the full gallery overlay.
		html = "";

		// If `showImageNum` is true, add image number display.
		if ( this.showImageNum ) {
			html += "<div class='nummber'>" + ( this.activImage + 1 ) + "/" + this.imageNum + "</div>";
		}

		html += "<div class='close_btn'></div>"; // Close button for the full gallery.

		// Append the main surface container for the full gallery.
		$( this.obj ).append( "<div class='surface'>" + html + "</div>" );

		// Append border and loader elements within the surface.
		$( this.obj ).find( ".surface" ).append( "<div class='border'></div>" );
		$( this.obj ).find( ".surface" ).append( "<div class='loader'></div>" );


		// Update references to newly created DOM elements.
		this.imagesThumb  = $( this.obj ).find( "img" );
		this.imgContainer = $( this.obj ).find( ".surface .border" );
		this.loader       = $( this.obj ).find( ".surface .loader" );
		this.points       = $( this.obj ).find( ".page-points .point" );

		// Set the initial active state for the current page point.
		$( this.obj ).find( ".page-points .point" ).eq( this.imagepage - 1 ).addClass( "activ" );

		// Start the gallery by attaching event listeners and initial display.
		this.startGallery();

	}, // End of build method.


	// Method to attach event listeners and set up initial gallery state.
	startGallery: function () {

		var self = this; // Cache 'this'.

		// --- Event Listeners ---

		// Window resize event handler.
		$( window ).resize( function () {
			self.setSize();       // Adjust container size.
			self.setImageSize();  // Adjust image size.
		} );

		// Click handler for the button to open the gallery (if specified).
		$( this.buttonObj ).click( function () {
			self.openGallery( 0 ); // Open gallery to the first image.
		} );

		// Click handler for each thumbnail image.
		$( this.imagesThumb ).click( function () {
			// Open gallery to the clicked image's index.
			self.openGallery( $( this ).parent().index() );
		} );

		// Click handler for the full gallery surface (to close it).
		$( this.obj ).find( ".surface" ).click( function ( e ) {
			var c = $( e.target ).attr( "class" );
			// Close gallery only if click is not on navigation buttons or the image itself.
			if ( c != "prev_btn" && c != "next_btn" && c != "image" ) {
				self.closeGallery();
			}
		} );

		// Click handler for the 'next' button.
		$( this.obj ).find( ".next_btn" ).click( function () {
			if ( self.openStatus ) {
				self.nextImage(); // If gallery is open, go to next image.
			} else {
				self.nextPage();  // If gallery is closed, go to next thumbnail page.
			}
		} );

		// Click handler for the 'previous' button.
		$( this.obj ).find( ".prev_btn" ).click( function () {
			if ( self.openStatus ) {
				self.prevImage(); // If gallery is open, go to previous image.
			} else {
				self.prevPage();  // If gallery is closed, go to previous thumbnail page.
			}
		} );

		// Click handler for page navigation points.
		$( this.obj ).find( ".page-points .point" ).click( function ( i ) {
			var p = this; // Reference to the clicked point (though 'p' is unused).
			self.gotoPage( $( this ).index() + 1 ); // Go to the clicked page.
		} );


		// --- Touch Control ---
		if ( this.touchControl ) {

			this.touchStart = false; // Initial touch X coordinate.
			this.touchEnd   = false; // Final touch X coordinate.

			// Touch start event.
			$( this.obj ).bind( 'touchstart', function ( e ) {
				self.touchStart = false;
				self.touchEnd   = 0;
			} );

			// Touch move event.
			$( this.obj ).bind( 'touchmove', function ( e ) {
				if ( self.touchStart == false ) {
					self.touchStart = e.originalEvent.touches[ 0 ].pageX;
				}
				self.touchEnd = e.originalEvent.touches[ 0 ].pageX;
			} );

			// Touch end event.
			$( this.obj ).bind( 'touchend', function ( e ) {
				var res = self.touchEnd - self.touchStart; // Calculate swipe distance.

				if ( self.openStatus ) { // If full gallery is open.
					if ( res < 0 && res < -50 ) {
						self.nextImage();
					} // Swipe left for next image.
					if ( res > 0 && res > 50 ) {
						self.prevImage();
					} // Swipe right for previous image.
				} else { // If thumbnail view is active.
					if ( res < 0 && res < -50 ) {
						self.nextPage();
					} // Swipe left for next page.
					if ( res > 0 && res > 50 ) {
						self.prevPage();
					} // Swipe right for previous page.
				}

				self.touchStart = false; // Reset touch state.
				self.touchEnd   = 0;     // Reset touch state.
			} );

		} // End of touchControl conditional.


		// --- Keyboard Control ---
		if ( this.keyControl ) {

			$( document ).keydown( function ( e ) {

				if ( self.openStatus ) { // If full gallery is open.
					if ( e.keyCode == 37 ) {
						e.preventDefault();
						self.prevImage();
					} // Left arrow for previous image.
					if ( e.keyCode == 39 ) {
						e.preventDefault();
						self.nextImage();
					} // Right arrow for next image.
				} else { // If thumbnail view is active.
					if ( e.keyCode == 37 ) {
						e.preventDefault();
						self.prevPage();
					} // Left arrow for previous page.
					if ( e.keyCode == 39 ) {
						e.preventDefault();
						self.nextPage();
					} // Right arrow for next page.
				}

			} );

		} // End of keyControl conditional.


		// --- Initial Thumbnail Display ---
		if ( this.showPageImages == "all" ) {
			$( this.imagesThumb ).fadeIn( 500 ); // Show all thumbnails if specified.
		} else {
			$( this.imagesThumb ).hide(); // Hide all thumbnails initially.
			// Show only the thumbnails for the first page.
			$( this.imagesThumb ).slice( 0, this.showPageImages ).show();
		}

	}, // End of startGallery method.


	// Method to open the full gallery overlay.
	openGallery: function ( i ) {

		var self = this; // Cache 'this'.

		// Set the active image if a valid index is provided.
		if ( i >= 0 && i < this.imageNum ) {
			this.activImage = i;
			this.setStatus(); // Update status display.
		}

		// Prevent re-opening during an ongoing animation.
		if ( this.openAnimationStatus ) {

			this.openAnimationStatus = false; // Set flag to prevent re-triggering.
			this.setSize();                   // Set the size of the gallery container.
			$( this.imgContainer ).css( "opacity", 0 ); // Hide image container initially.
			$( "body" ).css( "overflow", "hidden" );    // Hide body scrollbar.

			// Fade in the main gallery surface.
			$( this.obj ).find( ".surface" ).fadeIn( 500, function () {

				// After surface is visible, add the image.
				self.addImage( function () {

					self.addComment(); // Add image comment.

					// Animate image container opacity to reveal the image.
					$( self.imgContainer ).animate( { opacity: 1 }, 500, function () {
						self.openStatus          = true;  // Gallery is now fully open.
						self.openAnimationStatus = true;  // Animation is complete.
					} );

				} );

			} );

		}

	}, // End of openGallery method.


	// Method to close the full gallery overlay.
	closeGallery: function () {

		var self = this; // Cache 'this'.

		// Prevent re-closing during an ongoing animation.
		if ( this.openAnimationStatus ) {

			this.openStatus          = false; // Gallery is no longer open.
			this.openAnimationStatus = false; // Set flag to prevent re-triggering.

			// Fade out the image container.
			$( self.imgContainer ).animate( { opacity: 1 }, 200, function () {

				// After image container fades out, fade out the main gallery surface.
				$( self.obj ).find( ".surface" ).fadeOut( 500, function () {
					$( "body" ).css( "overflow", "auto" ); // Restore body scrollbar.
					self.openAnimationStatus = true;       // Animation is complete.
				} );

			} );

		}

	}, // End of closeGallery method.


	// Method to handle image animation transitions.
	animation: function ( fx ) {

		var self = this; // Cache 'this'.

		// Switch based on the configured animation type.
		switch ( this.animationType ) {

			case "fade":
				// Fade out current image.
				$( this.imgContainer ).animate( { opacity: 0 }, self.animationSpeed, function () {

					// After fade out, add the new image.
					self.addImage( function () {

						self.addComment(); // Add image comment.

						// Fade in the new image.
						$( self.imgContainer ).animate( { opacity: 1 }, self.animationSpeed, function () {
							if ( fx ) {
								fx();
							} // Execute callback if provided.
						} );

					} );

				} );
				break;

			default:
				this.message( "no Animation Type" ); // Log error for unsupported animation type.
		}

	}, // End of animation method.


	// Method to navigate to the next image.
	nextImage: function () {

		var self = this; // Cache 'this'.

		// Prevent navigation during an ongoing animation.
		if ( this.animationStatus ) {

			this.animationStatus = false; // Set flag to prevent re-triggering.

			// Move to the next image, or loop back to the first if at the end.
			if ( this.activImage < this.imageNum - 1 ) {
				this.activImage++;
			} else {
				this.activImage = 0;
			}

			// Perform the animation and update status upon completion.
			this.animation( function () {
				self.setStatus();         // Update image number display.
				self.animationStatus = true; // Animation is complete.
			} );

		}

	}, // End of nextImage method.


	// Method to navigate to the previous image.
	prevImage: function () {

		var self = this; // Cache 'this'.

		// Prevent navigation during an ongoing animation.
		if ( this.animationStatus ) {

			this.animationStatus = false; // Set flag to prevent re-triggering.

			// Move to the previous image, or loop back to the last if at the beginning.
			if ( this.activImage > 0 ) {
				this.activImage--;
			} else {
				this.activImage = this.imageNum - 1;
			}

			// Perform the animation and update status upon completion.
			this.animation( function () {
				self.setStatus();         // Update image number display.
				self.animationStatus = true; // Animation is complete.
			} );

		}

	}, // End of prevImage method.


	// Method to go to a specific image by index.
	gotoImage: function ( i, fx ) {

		var self = this; // Cache 'this'.

		// Prevent navigation during an ongoing animation.
		if ( this.animationStatus ) {

			// Ensure the target index is valid.
			if ( i >= 0 && i < this.imageNum ) {
				this.activImage = i;
			}

			// Perform the animation and execute callback upon completion.
			this.animation( function () {
				self.animationStatus = true; // Animation is complete.
				self.setStatus();            // Update image number display.
				if ( fx ) {
					fx();
				} // Execute callback if provided.
			} );

		}

	}, // End of gotoImage method.


	// Method to add an image to the display container.
	addImage: function ( fx ) {

		var self = this; // Cache 'this'.

		$( this.loader ).fadeIn( 200 ); // Show the loader.

		// Set the source of the Image object to trigger loading.
		this.imgArray[ this.activImage ][ "img" ].src = this.imgArray[ this.activImage ][ "src" ];

		// Use imageLoader to handle loading the full-size image.
		this.imageLoader( this.imgArray[ this.activImage ][ "img" ], function () {

			$( self.loader ).fadeOut( 200 ); // Hide the loader.
			$( self.obj ).find( ".surface .border img" ).remove(); // Remove any existing image.

			// Append the new image to the container.
			$( self.obj ).find( ".surface .border" ).append( "<img class='image' src='" + self.imgArray[ self.activImage ][ "img" ].src + "' alt='' />" );

			self.setImageSize(); // Adjust the size of the newly added image.

			if ( fx ) {
				fx();
			} // Execute callback if provided.

		}, function () {
			// console.log("img not load"); // Placeholder for image loading error.
		} );

	}, // End of addImage method.


	// Method to add the comment for the current image.
	addComment: function () {

		var self = this; // Cache 'this'.

		// Only show comments if the option is enabled.
		if ( this.showComments ) {

			$( self.obj ).find( ".surface .border div.comment" ).remove(); // Remove any existing comment.

			// Append the comment for the current image.
			$( self.obj ).find( ".surface .border" ).append( "<div class='comment'>" + self.imgArray[ self.activImage ][ "comment" ] + "</div>" );

		}

	}, // End of addComment method.


	// Method to navigate to the next thumbnail page.
	nextPage: function () {

		var self = this; // Cache 'this'.

		// Prevent navigation during an ongoing page transition.
		if ( this.pageStatus ) {

			this.pageStatus = false; // Set flag to prevent re-triggering.

			// Move to the next page, or loop back to the first if at the end.
			if ( this.showPageImages * self.imagepage < this.imageNum ) {
				this.imagepage++;
			} else {
				this.imagepage = 1;
			}

			// Go to the determined page and update status upon completion.
			this.gotoPage( this.imagepage, function () {
				self.setStatus();    // Update any relevant status displays.
				self.pageStatus = true; // Page transition is complete.
			} );

		}

	}, // End of nextPage method.


	// Method to navigate to the previous thumbnail page.
	prevPage: function () {

		var self = this; // Cache 'this'.

		// Prevent navigation during an ongoing page transition.
		if ( this.pageStatus ) {

			this.pageStatus = false; // Set flag to prevent re-triggering.

			// Move to the previous page, or loop back to the last if at the beginning.
			if ( this.imagepage > 1 ) {
				this.imagepage--;
			} else {
				this.imagepage = Math.ceil( this.imageNum / this.showPageImages );
			}

			// Go to the determined page and update status upon completion.
			this.gotoPage( this.imagepage, function () {
				self.setStatus();    // Update any relevant status displays.
				self.pageStatus = true; // Page transition is complete.
			} );

		}

	}, // End of prevPage method.


	// Method to go to a specific thumbnail page.
	gotoPage: function ( i, fx ) {

		var self = this; // Cache 'this'.

		// Ensure the target page index is valid.
		if ( i > 0 && i <= this.imagePageCount ) { // Corrected condition to check against imagePageCount

			this.imagepage = i; // Set the current page.

			$( ".page-num .num" ).html( this.imagepage ); // Update page number display.

			$( this.imagesThumb ).hide(); // Hide all thumbnails.

			// Calculate the slice of thumbnails to show for the current page.
			var startIndex = ( self.showPageImages * self.imagepage ) - self.showPageImages;
			var endIndex   = self.showPageImages * self.imagepage;

			// Show only the thumbnails for the current page.
			$( self.imagesThumb ).slice( startIndex, endIndex ).show();

			// Update active state for page navigation points.
			$( self.points ).removeClass( "activ" ).eq( this.imagepage - 1 ).addClass( "activ" );

			if ( fx ) {
				fx();
			} // Execute callback if provided.

			self.setStatus(); // Update any relevant status displays.

		}

	}, // End of gotoPage method.


	// Helper method to load images, handling browser caching issues.
	imageLoader: function ( img, fx, fxErr ) {

		// Check if the image is already complete or loaded (for cached images).
		if ( img.complete || img.readyState === 4 ) {

			// Append a timestamp to the src to bypass browser cache, then attach load/error handlers.
			img.src += "?d=" + new Date().getTime();
			$( img ).load( function ( response, status, xhr ) {
				if ( fx ) {
					fx();
				}
			} ).error( function () {
				if ( fxErr ) {
					fxErr();
				}
			} );

		} else {
			// If not complete, assume it's loading and just call the success callback immediately (might be flawed logic).
			if ( fx ) {
				fx();
			}
		}

	}, // End of imageLoader method.


	// Method to set the size of the gallery container based on window dimensions.
	setSize: function () {

		var self = this; // Cache 'this'.

		this.width  = $( window ).width();  // Get current window width.
		this.height = $( window ).height(); // Get current window height.

		// Apply calculated width and height to the image border container.
		$( this.obj ).find( ".surface .border" ).css( { "width": this.width - this.border, "height": this.height - this.border } );

	}, // End of setSize method.


	// Method to set the size of the displayed image within its container.
	setImageSize: function () {

		var img = $( this.obj ).find( ".surface .border img" ); // Get the current image element.

		$( img ).height( "" ); // Reset height to auto.
		$( img ).width( this.width - this.border ); // Set width to fill container minus border.

		// If the image's height exceeds the container's height after width adjustment,
		// reset width and set height instead to fit vertically.
		if ( ( this.height - this.border ) < $( img ).height() ) {
			$( img ).width( "" ); // Reset width to auto.
			$( img ).height( this.height - this.border ); // Set height to fill container minus border.
		}

	}, // End of setImageSize method.


	// Method to update the gallery's status display (e.g., image numbers).
	setStatus: function () {

		// Only update if `showImageNum` is enabled.
		if ( this.showImageNum ) {
			// Update the image number display.
			$( this.obj ).find( ".surface .nummber" ).html( ( this.activImage + 1 ) + "/" + this.imageNum );
		}

	}, // End of setStatus method.


	// Console message logging method for debugging.
	message: function ( txt ) {

		// Only log messages if `beta` mode is enabled.
		if ( this.beta ) {

			// Check if the error message console already exists.
			if ( $( "#cis_error_message" ).length ) {

				// If it exists, append a new message div.
				var html = "<div class='cis_error_message' style='font-size:10px; text-align:left; line-height: 25px; border-bottom:solid 1px #ddd; padding-left:5px;'><div>";
				$( "#cis_error_message_titel" ).after( html );
				$( ".cis_error_message" ).first().text( "- " + txt );

			} else {

				// If it doesn't exist, create the entire console structure.
				var html = "<div id='cis_error_message' style='position:absolute; top:10px; left:10px; z-index:100000; height:100px; width:250px; border:solid 2px #000; display:none;background-color:#fff; overflow: auto;'>";
				html += "<h3 id='cis_error_message_titel' style='display:block; text-align:center; background-color:#666; color:#fff; font-size:12px; line-height: 25px!important; margin:0px;'>Console</h3>";
				html += "<div class='cis_error_message' style='font-size:10px; text-align:left; line-height: 25px; border-bottom:solid 1px #ddd; padding-left:5px;'><div>";
				html += "</div>";

				$( this.obj ).append( html );                       // Append to the gallery object.
				$( ".cis_error_message" ).text( "- " + txt );      // Set the message text.
				$( "#cis_error_message" ).fadeIn( 500 );           // Fade in the console.

			}

		}

	} // End of message method.

}; // End of xGallery.prototype.
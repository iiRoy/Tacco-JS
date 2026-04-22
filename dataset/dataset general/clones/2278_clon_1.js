/*
 *  Skitter Slideshow Plugin for jQuery
 *  @file        jquery.skitter.js
 *  @description A dynamic and responsive slideshow plugin.
 *  @author      Thiago Silva Ferreira - Find more at: http://thiagosf.net
 *  @version     4.2.3 - Current stable release.
 *  @date        Initial commit: August 04, 2010
 *  @update      Last update: July 12, 2014 - Including various improvements.
 *  @copyright   (c) 2010 Thiago Silva Ferreira - All rights reserved. http://thiagosf.net
 *  @license     Available under MIT or GPL Version 2 licenses (dual license).
 *  @example     See usage examples and demos here: http://thiagosf.net/projects/jquery/skitter/
 */
;(
function ( $ ) {


	// Global variables to manage multiple Skitter instances.
	var number_skitter = 0 , // Counter for unique Skitter IDs.
		skitters       = [ ] ; // Array to hold references to all Skitter instances.


	// jQuery plugin entry point.
	// This method allows chaining and ensures unique initialization per element.
	$.fn.skitter = function ( options ) {

		return this.each( function ( ) {

			// Prevent re-initialization on the same element.
			if ( $( this ).data( 'skitter_number' ) == undefined ) {

				// Assign a unique identifier to the current Skitter instance.
				$( this ).data( 'skitter_number' , number_skitter ) ;

				// Create a new Skitter object and store it.
				skitters.push( new $sk( this , options , number_skitter ) ) ;

				// Increment the counter for the next instance.
				++number_skitter ;

			}

		} ) ;

	} ;


	// Default configuration settings for the Skitter slideshow.
	// These can be overridden by passing an 'options' object to $.fn.skitter.
	var defaults = {

		// Animation velocity (speed of transitions).
		velocity              :                    1 ,

		// Time interval between slide transitions in milliseconds.
		interval              :                 2500 ,

		// Default animation type (e.g., 'fade', 'cube', etc.).
		animation             :                   '' ,

		// Flag to show slide numbers as navigation.
		numbers               :                 true ,

		// Flag to display 'previous' and 'next' navigation buttons.
		navigation            :                 true ,

		// Flag to show image labels/captions.
		label                 :                 true ,

		// Default easing function for animations (e.g., 'swing', 'linear').
		easing_default        :                   '' ,

		// Internal: Reference to the main Skitter container element.
		box_skitter           :                 null ,

		// @deprecated: This option is no longer in active use.
		time_interval         :                 null ,

		// Internal: Array to store image URLs, links, animation types, labels, and targets.
		images_links          :                 null ,

		// Internal: The URL of the currently displayed image.
		image_atual           :                 null ,

		// Internal: The hyperlink associated with the current image.
		link_atual            :                 null ,

		// Internal: The label/caption text for the current image.
		label_atual           :                 null ,

		// Internal: The target attribute for the current image's link (e.g., '_self', '_blank').
		target_atual          :                '_self' ,

		// Internal: The calculated width of the Skitter container.
		width_skitter         :                 null ,

		// Internal: The calculated height of the Skitter container.
		height_skitter        :                 null ,

		// Internal: The 1-based index of the currently active image.
		image_i               :                    1 ,

		// Internal: Flag indicating if a slide transition animation is currently running.
		is_animating          :                false ,

		// Internal: Flag indicating if the mouse cursor is hovering over the Skitter box.
		is_hover_box_skitter  :                false ,

		// Internal: Used for intelligent random slide selection.
		random_ia             :                 null ,

		// Flag to enable random ordering of slides.
		show_randomly         :                false ,

		// Flag to enable thumbnail images for navigation.
		thumbs                :                false ,

		// CSS properties for slide numbers/dots when inactive.
		animateNumberOut      :                false ,

		// CSS properties for slide numbers/dots on mouse hover.
		animateNumberOver     :                false ,

		// CSS properties for the actively selected slide number/dot.
		animateNumberActive   :                false ,

		// Flag to hide navigation tools (numbers, arrows) by default.
		hideTools             :                false ,

		// Flag to enable fullscreen mode for the slideshow.
		fullscreen            :                false ,

		// URL to an XML file containing slide data.
		xml                   :                false ,

		// Flag to use dots instead of numbers for navigation.
		dots                  :                false ,

		// Custom width for the label container; if null, uses Skitter's width.
		width_label           :                 null ,

		// Final opacity for elements when hideTools is enabled.
		opacity_elements      :                 0.75 ,

		// Animation duration for elements fading in (when hideTools is active).
		interval_in_elements  :                  200 ,

		// Animation duration for elements fading out (when hideTools is active).
		interval_out_elements :                  300 ,

		// Callback function executed once the Skitter slideshow has loaded.
		onLoad                :                 null ,

		// Callback function executed after each image transition.
		imageSwitched         :                 null ,

		// @deprecated: This option is no longer in active use.
		max_number_height     :                   20 ,

		// Alignment of numbers/dots/thumbs: 'left', 'center', or 'right'.
		numbers_align         :                'left' ,

		// Flag to enable a preview feature with dots.
		preview               :                false ,

		// Flag to enable focus mode for the slideshow.
		focus                 :                false ,

		// Internal: Flag indicating if focus mode is currently active.
		foucs_active          :                false ,

		// Position of the focus button (e.g., 'center').
		focus_position        :               'center' ,

		// Flag to enable play/pause controls.
		controls              :                false ,

		// Position of the play/pause controls (e.g., 'center').
		controls_position     :               'center' ,

		// Flag to display a progress bar.
		progressbar           :                false ,

		// Custom CSS properties for the progress bar.
		progressbar_css       :                 { } ,

		// Internal: Flag indicating if the slideshow is currently paused.
		is_paused             :                false ,

		// Internal: Flag indicating if the browser window is currently blurred.
		is_blur               :                false ,

		// Internal: Flag indicating if the interval timer is paused.
		is_paused_time        :                false ,

		// Internal: Timestamp when the slideshow started.
		timeStart             :                    0 ,

		// Internal: Accumulated elapsed time during slideshow playback.
		elapsedTime           :                    0 ,

		// Stop automatic animation when the mouse hovers over the slideshow.
		stop_over             :                 true ,

		// Enable keyboard navigation using arrow keys.
		enable_navigation_keys:                false ,

		// Array of specific animation types to use (if desired).
		with_animations       :                 [ ] ,

		// Callback function for mouseover event on navigation buttons.
		// Default example: function() { $(this).stop().animate({opacity:0.5}, 200); }
		mouseOverButton       :                 null ,

		// Callback function for mouseout event on navigation buttons.
		// Default example: function() { $(this).stop().animate({opacity:1}, 200); }
		mouseOutButton        :                 null ,

		// Determines whether the slideshow should start playing automatically.
		auto_play             :                 true ,

		// Animation type for the label (e.g., 'slideUp', 'fadeIn').
		labelAnimation        :              'slideUp' ,

		// Theme class name to apply to the Skitter container.
		theme                 :                 null ,

		// The base HTML structure injected into the Skitter container.
		structure             : '<a href="#" class="prev_button">prev</a>'
								+ '<a href="#" class="next_button">next</a>'
								+ '<span class="info_slide"></span>'
								+ '<div class="container_skitter">'
									+ '<div class="image">'
										+ '<a href=""><img class="image_main" /></a>'
										+ '<div class="label_skitter"></div>'
									+ '</div>'
								+ '</div>'

	} ;


	// Skitter constructor function.
	// This function initializes a new Skitter slideshow instance.
	$.skitter = function ( obj , options , number ) {

		this.box_skitter    =   $( obj ) ;
		this.timer          =   null ;
		this.settings       =   $.extend( { } , defaults , options || { } ) ; // Merge defaults with user options.
		this.number_skitter =   number ;

		this.setup( ) ; // Call the setup method to configure the slideshow.

	} ;


	// Create a shorthand reference for $.skitter.
	var $sk = $.skitter ;


	// Define the prototype object for Skitter instances.
	$sk.fn = $sk.prototype = { } ;


	// Extend the Skitter prototype with utility methods from jQuery.
	$sk.fn.extend = $.extend ;


	// Define core methods for the Skitter slideshow functionality.
	$sk.fn.extend( {

		/**
		 *  Initial setup method for the Skitter slideshow.
		 *  This function prepares the DOM, loads image data, and sets up event handlers.
		 */
		setup : function ( )
		{
			var self = this ; // Cache 'this' for use in nested functions.

			// Handle fullscreen mode initialization.
			if ( this.settings.fullscreen ) {

				var width  = $( window ).width( ) ;
				var height = $( window ).height( ) ;

				// Set dimensions and absolute positioning for fullscreen.
				this.box_skitter.width( width ) .height( height ) ;
				this.box_skitter.css( { 'position' : 'absolute' , 'top' : 0 , 'left' : 0 , 'z-index' : 1000 } ) ;

				// Disable 'stop_over' behavior in fullscreen for better user experience.
				this.settings.stop_over = false ;

				// Hide body scrollbars to ensure a true fullscreen display.
				$( 'body' ).css( { 'overflown' : 'hidden' } ) ;
			}

			// Retrieve and store the computed width and height of the Skitter container.
			this.settings.width_skitter  = parseFloat( this.box_skitter.css( 'width' ) ) ;
			this.settings.height_skitter = parseFloat( this.box_skitter.css( 'height' ) ) ;

			// Validate that width and height are correctly set.
			if ( !this.settings.width_skitter || !this.settings.height_skitter ) {
				console.warn( 'Width or height size is null! - Skitter Slideshow' ) ;
				return false ; // Exit setup if dimensions are invalid.
			}

			// Apply a theme class if one is specified in the settings.
			if ( this.settings.theme ) {
				this.box_skitter.addClass( 'skitter-' + this.settings.theme ) ;
			}

			// Append the base HTML structure to the Skitter container.
			this.box_skitter.append( this.settings.structure ) ;

			// Determine the easing function to use.
			this.settings.easing_default = this.getEasing( this.settings.easing ) ;

			// Clamp the velocity setting to a practical range.
			if ( this.settings.velocity >= 2 ) this.settings.velocity = 1.3 ;
			if ( this.settings.velocity <= 0 ) this.settings.velocity = 1 ;

			// Initially hide navigation and label elements.
			this.box_skitter.find( '.info_slide' ) .hide( ) ;
			this.box_skitter.find( '.label_skitter' ) .hide( ) ;
			this.box_skitter.find( '.prev_button' ) .hide( ) ;
			this.box_skitter.find( '.next_button' ) .hide( ) ;

			// Set the dimensions of the main image container within Skitter.
			this.box_skitter.find( '.container_skitter' ) .width( this.settings.width_skitter ) ;
			this.box_skitter.find( '.container_skitter' ) .height( this.settings.height_skitter ) ;

			// Set the width of the label container, defaulting to Skitter's width.
			var width_label = this.settings.width_label ? this.settings.width_label : this.settings.width_skitter ;
			this.box_skitter.find( '.label_skitter' ) .width( width_label ) ;

			// Initialize variables for image data processing.
			var initial_select_class = ' image_number_select' , // Class for the first selected navigation item.
				u = 0 ; // Counter for images.
			this.settings.images_links = new Array( ) ; // Array to hold image data.


			// Helper function to add image details and create navigation elements.
			var addImageLink = function ( link , src , animation_type , label , target ) {

				// Store the image data in the settings array.
				self.settings.images_links.push( [ src , link , animation_type , label , target ] ) ;

				// If thumbnails are enabled, create image-based navigation.
				if ( self.settings.thumbs ) {

					var dimension_thumb = '' ;

					// Determine whether to set thumbnail height or width based on Skitter's aspect ratio.
					if ( self.settings.width_skitter > self.settings.height_skitter ) {
						dimension_thumb = 'height="100"' ;
					}
					else {
						dimension_thumb = 'width="100"' ;
					}
					// Append the thumbnail image to the navigation area.
					self.box_skitter.find( '.info_slide' ) .append(
						'<span class="image_number' + initial_select_class + '" rel="' + ( u - 1 ) + '" id="image_n_' + u + '_' + self.number_skitter + '">'
							+ '<img src="' + src + '" ' + dimension_thumb + ' />'
							+ '</span> '
					) ;
				}
				// If thumbnails are not enabled, use numerical navigation.
				else {
					self.box_skitter.find( '.info_slide' ) .append(
						'<span class="image_number' + initial_select_class + '" rel="' + ( u - 1 ) + '" id="image_n_' + u + '_' + self.number_skitter + '">' + u + '</span> '
					) ;
				}
				// After the first image, subsequent navigation items won't have the 'initial_select_class'.
				initial_select_class = '' ;
			} ;


			// --- Data Loading Logic ---

			// Load slide data from an XML file if the 'xml' option is provided.
			if ( this.settings.xml ) {

				$.ajax( {
					type       : 'GET' ,
					url        : this.settings.xml ,
					async      : false , // Use synchronous request to ensure data is loaded before DOM manipulation.
					dataType   : 'xml' ,
					success    : function ( xml ) {

						var ul = $( '<ul></ul>' ) ; // This variable is declared but not used.

						$( xml ).find( 'skitter slide' ) .each( function ( ) {

							++u ; // Increment image counter.

							// Extract slide attributes from XML elements.
							var link            = ( $( this ).find( 'link' ).text( ) ) ? $( this ).find( 'link' ).text( ) : '#' ;
							var src             = $( this ).find( 'image' ).text( ) ;
							var animation_type  = $( this ).find( 'image' ).attr( 'type' ) ;
							var label           = $( this ).find( 'label' ).text( ) ;
							var target          = ( $( this ).find( 'target' ).text( ) ) ? $( this ).find( 'target' ).text( ) : '_self' ;

							// Add the extracted data to the images_links array.
							addImageLink( link , src , animation_type , label , target ) ;
						} ) ;
					}
				} ) ;
			}
			// Placeholder for JSON data loading.
			else if ( this.settings.json ) {

				// Future implementation for loading data from a JSON source.

			}
			// Default behavior: load slide data from existing HTML 'ul li' structure.
			else {

				this.box_skitter.find( 'ul li' ) .each( function ( ) {

					++u ; // Increment image counter.

					// Extract slide attributes from HTML elements.
					var link            = ( $( this ).find( 'a' ).length ) ? $( this ).find( 'a' ).attr( 'href' ) : '#' ;
					var src             = $( this ).find( 'img' ).attr( 'src' ) ;
					var animation_type  = $( this ).find( 'img' ).attr( 'class' ) ;
					var label           = $( this ).find( '.label_text' ).html( ) ;
					var target          = ( $( this ).find( 'a' ).length && $( this ).find( 'a' ).attr( 'target' ) ) ? $( this ).find( 'a' ).attr( 'target' ) : '_self' ;

					// Add the extracted data to the images_links array.
					addImageLink( link , src , animation_type , label , target ) ;
				} ) ;
			}

			// --- Thumbnail (Thumbs) Specific Logic ---
			if ( self.settings.thumbs && !self.settings.fullscreen )
			{
				// Override animation styles for numbers when thumbs are active.
				self.settings.animateNumberOut    = { opacity : 0.3 } ;
				self.settings.animateNumberOver   = { opacity : 0.5 } ;
				self.settings.animateNumberActive = { opacity : 1   } ;

				// Add a specific class for thumbnail info slide and calculate its total width.
				self.box_skitter.find( '.info_slide' ) .addClass( 'info_slide_thumb' ) .removeClass( 'info_slide' ) ;
				var width_info_slide = ( u + 1 ) * self.box_skitter.find( '.info_slide_thumb .image_number' ) .width( ) ;
				self.box_skitter.find( '.info_slide_thumb' ) .width( width_info_slide ) ;

				// Adjust the overall skitter box height to accommodate the thumbnails.
				self.box_skitter.css( { height : self.box_skitter.height( ) + self.box_skitter.find( '.info_slide' ) .height( ) } ) ;

				// Create a container for the thumbnails and move the info_slide into it.
				self.box_skitter.append( '<div class="container_thumbs"></div>' ) ;
				var copy_info_slide = self.box_skitter.find( '.info_slide' ) .clone( ) ;
				self.box_skitter.find( '.info_slide' ) .remove( ) ;
				self.box_skitter.find( '.container_thumbs' )
					.width( self.settings.width_skitter )
					.append( copy_info_slide ) ;

				// Implement scrolling functionality for thumbnails if they exceed the container width.
				var width_image             = 0 ,
					width_skitter           = this.settings.width_skitter ,
					height_skitter          = this.settings.height_skitter ,
					w_info_slide_thumb      = 0 ,
					info_slide_thumb        = self.box_skitter.find( '.info_slide_thumb' ) ,
					x_value                 = 0 ,
					y_value                 = self.box_skitter.offset( ) .top ;

				// Calculate the cumulative width of all thumbnail images.
				info_slide_thumb.find( '.image_number' ) .each( function ( ) {
					width_image += $( this ).outerWidth( ) ;
				} ) ;

				info_slide_thumb.width( width_image + 'px' ) ;
				w_info_slide_thumb = info_slide_thumb.width( ) ;
				var width_value = this.settings.width_skitter ;

				width_value = width_skitter - 100 ; // Adjust for padding/margin.

				// If the total width of thumbnails is greater than the Skitter width, enable mousemove scrolling.
				if ( width_info_slide > self.settings.width_skitter ) {

					self.box_skitter.mousemove( function ( e ) {

						x_value = self.box_skitter.offset( ) .left + 90 ;

						var x = e.pageX ,
							y = e.pageY ,
							new_x = 0 ;

						x = x - x_value ;
						y = y - y_value ;
						var novo_width = w_info_slide_thumb - width_value ;
						new_x = - ( ( novo_width * x ) / width_value ) ;

						// Ensure the scroll position stays within bounds.
						if ( new_x > 0 ) new_x = 0 ;
						if ( new_x < - ( w_info_slide_thumb - width_skitter ) ) new_x = - ( w_info_slide_thumb - width_skitter ) ;

						// Apply horizontal scroll only if the mouse is over the thumbnail area.
						if ( y > height_skitter ) {
							info_slide_thumb.css( { left : new_x } ) ;
						}
					} ) ;
				}

				// Position any scroll buttons (if present in the HTML structure).
				self.box_skitter.find( '.scroll_thumbs' ) .css( { 'left' : 10 } ) ;

				// If thumbnails do not overflow, adjust their alignment.
				if ( width_info_slide < self.settings.width_skitter ) {

					self.box_skitter.find( '.info_slide' ) .width( 'auto' ) ; // Allow width to adjust.
					self.box_skitter.find( '.box_scroll_thumbs' ) .hide( ) ; // Hide scroll controls if not needed.

					var class_info = '.info_slide' ; // Reference the navigation container.

					// Apply alignment based on settings.
					switch ( self.settings.numbers_align ) {

						case 'center' :
							var _vleft = ( self.settings.width_skitter - self.box_skitter.find( class_info ) .width( ) ) / 2 ;
							self.box_skitter.find( class_info ) .css( { 'left' : _vleft } ) ;
							break ;

						case 'right' :
							self.box_skitter.find( class_info ) .css( { 'left' : 'auto' , 'right' : '-5px' } ) ;
							break ;

						case 'left' :
							self.box_skitter.find( class_info ) .css( { 'left' : '0px' } ) ;
							break ;
					}
				}

			}
			// Logic for non-thumbnail navigation (numbers or dots).
			else
			{
				var class_info = '.info_slide' ; // Default class for navigation info.

				// If dots are enabled, switch to dot-specific classes.
				if ( self.settings.dots ) {
					self.box_skitter.find( '.info_slide' ) .addClass( 'info_slide_dots' ) .removeClass( 'info_slide' ) ;
					class_info = '.info_slide_dots' ;
				}

				// Apply alignment for numbers/dots based on settings.
				switch ( self.settings.numbers_align ) {

					case 'center' :
						var _vleft = ( self.settings.width_skitter - self.box_skitter.find( class_info ) .width( ) ) / 2 ;
						self.box_skitter.find( class_info ) .css( { 'left' : _vleft } ) ;
						break ;

					case 'right' :
						self.box_skitter.find( class_info ) .css( { 'left' : 'auto' , 'right' : '15px' } ) ;
						break ;

					case 'left' :
						self.box_skitter.find( class_info ) .css( { 'left' : '15px' } ) ;
						break ;
				}

				// If not using dots and the info_slide element is too tall, hide it.
				if ( !self.settings.dots ) {
					if ( self.box_skitter.find( '.info_slide' ) .height( ) > 20 ) {
						self.box_skitter.find( '.info_slide' ) .hide( ) ;
					}
				}
			}

			// Hide the original unordered list from which images were parsed.
			this.box_skitter.find( 'ul' ) .hide( ) ;

			// If 'show_randomly' is enabled, shuffle the order of images.
			if ( this.settings.show_randomly )
			this.settings.images_links.sort( function ( a , b ) { return Math.random( ) - 0.5 ; } ) ;

			// Set the initial image, link, label, and target based on the first item in the processed list.
			this.settings.image_atual  = this.settings.images_links[ 0 ][ 0 ] ;
			this.settings.link_atual   = this.settings.images_links[ 0 ][ 1 ] ;
			this.settings.label_atual  = this.settings.images_links[ 0 ][ 3 ] ;
			this.settings.target_atual = this.settings.images_links[ 0 ][ 4 ] ;

			// If there is more than one image, enable navigation buttons and their event handlers.
			if ( this.settings.images_links.length > 1 )
			{
				// Click handler for the 'previous' navigation button.
				this.box_skitter.find( '.prev_button' ) .click( function ( ) {

					// Only allow navigation if no animation is currently in progress.
					if ( self.settings.is_animating == false ) {

						self.settings.image_i -= 2 ; // Decrement by 2 because jumpToImage increments it.

						// Handle wrapping around from the beginning to the end of the slideshow.
						if ( self.settings.image_i == -2 ) {
							self.settings.image_i = self.settings.images_links.length - 2 ;
						}
						else if ( self.settings.image_i == -1 ) {
							self.settings.image_i = self.settings.images_links.length - 1 ;
						}

						// Trigger the transition to the calculated previous image.
						self.jumpToImage( self.settings.image_i ) ;
					}

					return false ; // Prevent the default action of the anchor tag.
				} ) ;

				// Click handler for the 'next' navigation button.
				this.box_skitter.find( '.next_button' ) .click( function ( ) {

					// Simply jump to the next image (image_i is already prepared for the next slide).
					self.jumpToImage( self.settings.image_i ) ;
					return false ; // Prevent the default action of the anchor tag.
				} ) ;

				// Bind mouseover and mouseleave events for navigation buttons, using custom callbacks if provided.
				self.box_skitter.find( '.next_button, .prev_button' ) .bind( 'mouseover' , self.settings.mouseOverButton ) ;
				self.box_skitter.find( '.next_button, .prev_button' ) .bind( 'mouseleave' , self.settings.mouseOutButton ) ;

			} // End of navigation button setup.

		} // End of setup method.

	} ) ; // End of $sk.fn.extend.

} ) ( jQuery ) ; // Immediately-invoked function expression (IIFE) to encapsulate the plugin.
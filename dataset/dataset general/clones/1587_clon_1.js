/*
 *
 *   jQuery Blueberry Slider v0.4 BETA
 *   http://marktyrrell.com/labs/blueberry/
 *
 *   Copyright (C) 2011, Mark Tyrrell <me@marktyrrell.com>
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */



( function ( $ ) {


	$.fn.extend ( {


		blueberry: function ( options ) {


			// default values for plugin options
			var defaults = {
				interval:   5000,
				duration:   500,
				lineheight: 1,
				height:     'auto', // this option is currently reserved
				hoverpause: false,
				pager:      true,
				nav:        true,   // this option is currently reserved
				keynav:     true
			};


			// Extend default options with user-provided options
			var options = $.extend ( defaults, options );


			return this.each ( function () {

				// Store plugin options and the current jQuery object
				var o   = options;
				var obj = $( this );

				// Store references to the slide elements and pager list items
				var slides = $( '.slides li', obj );
				var pager  = $( '.pager li',  obj );

				// Initialize current and next slide index values
				var current = 0;
				var next    = current + 1;

				// Get dimensions of the initial slide image and calculate its aspect ratio
				var imgHeight = slides.eq ( current ).find ( 'img' ).height ();
				var imgWidth  = slides.eq ( current ).find ( 'img' ).width  ();
				var imgRatio  = imgWidth / imgHeight;

				// Declare variables for the setsize function
				var sliderWidth = 0;
				var cropHeight  = 0;

				// Hide all slides, then fade in the first one and add 'active' class
				slides
					.hide ()
					.eq ( current )
					.fadeIn ( o.duration )
					.addClass ( 'active' );


				// Build the pager if it doesn't exist and if the pager option is enabled
				if ( pager.length ) {

					// If pager already exists, just activate the first item
					pager.eq ( current ).addClass ( 'active' );

				} else if ( o.pager ) {

					// If pager doesn't exist but is enabled, create it
					obj.append ( '<ul class="pager"></ul>' );

					// Populate the pager with list items for each slide
					slides.each ( function ( index ) {
						$( '.pager', obj ).append ( '<li><a href="#"><span>' + index + '</span></a></li>' );
					} );

					// Re-select the pager elements after creation
					pager = $( '.pager li', obj );

					// Activate the first pager item
					pager.eq ( current ).addClass ( 'active' );

				}


				// Add click event listener to pager links if pager exists
				if ( pager ) {

					$( 'a', pager ).click ( function () {

						// Stop the current timer for slide rotation
						clearTimeout ( obj.play );

						// Set the next slide index based on the clicked pager item's index
						next = $( this ).parent ().index ();

						// Rotate the slides
						rotate ();

						// Prevent default link behavior
						return false;
					} );
				}


				// Primary function to handle slide transitions
				var rotate = function () {

					// Fade out the current slide, remove its 'active' class,
					// then fade in the next slide and add 'active' class.
					// Use .queue() to ensure rotateTimer is called after animation completes.
					slides
						.eq ( current )
						.fadeOut ( o.duration )
						.removeClass ( 'active' )
						.end ()
						.eq ( next )
						.fadeIn ( o.duration )
						.addClass ( 'active' )
						.queue ( function () {
							// This prevents animation buildup caused by requestAnimationFrame
							// rotateTimer starts a new timer for the next rotation
							rotateTimer ();
							$( this ).dequeue ();
						} );

					// Update the pager to reflect the slide change
					if ( pager ) {
						pager
							.eq ( current )
							.removeClass ( 'active' )
							.end ()
							.eq ( next )
							.addClass ( 'active' );
					}

					// Update current and next slide variables.
					// If current is the last slide, next becomes the first slide (0).
					current = next;
					next    = current >= slides.length - 1 ? 0 : current + 1;
				};


				// Function to create and manage the slide rotation timer
				var rotateTimer = function () {

					obj.play = setTimeout ( function () {
						// Trigger the slide rotation function at the end of the timer
						rotate ();
					}, o.interval );

				};


				// Start the timer for the first time when the plugin initializes
				rotateTimer ();


				// Pause the slider on hover if the option is enabled
				// Note: This feature is disabled by default due to a known bug
				if ( o.hoverpause ) {

					slides.hover ( function () {

						// Stop the timer when mouse enters the slide area
						clearTimeout ( obj.play );

					}, function () {

						// Restart the timer when mouse leaves the slide area
						rotateTimer ();

					} );
				}


				// Calculate and set the slider height based on image aspect ratio and line height
				var setsize = function () {

					sliderWidth = $( '.slides', obj ).width ();
					cropHeight  = Math.floor ( ( ( sliderWidth / imgRatio ) / o.lineheight ) ) * o.lineheight;

					$( '.slides', obj ).css ( { height: cropHeight } );

				};


				// Call setsize initially to set the correct dimensions
				setsize ();


				// Bind the setsize function to the window resize event for responsiveness
				$( window ).resize ( function () {
					setsize ();
				} );


				// Add keyboard navigation if the option is enabled
				if ( o.keynav ) {

					$( document ).keyup ( function ( e ) {

						switch ( e.which ) {

							case 39: // Right arrow key
							case 32: // Spacebar

								clearTimeout ( obj.play ); // Stop current timer
								rotate ();                   // Move to next slide
								break;


							case 37: // Left arrow key

								clearTimeout ( obj.play ); // Stop current timer
								next = current - 1;        // Set next to previous slide
								rotate ();                   // Move to previous slide
								break;
						}

					} );
				}


			} ); // End of this.each


		} // End of blueberry function


	} ); // End of $.fn.extend


} ) ( jQuery ); // End of IIFE
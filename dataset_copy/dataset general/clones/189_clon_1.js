/*
 * =========================================================================
 * bootstrap-colorpicker.js
 *
 * This file contains the JavaScript implementation for a Bootstrap colorpicker component.
 *
 * Project Home: http://www.eyecon.ro/bootstrap-colorpicker
 *
 * =========================================================================
 * Copyright (c) 2012 Stefan Petre. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================================
 */


// Anonymous self-executing function to encapsulate the plugin logic,
// preventing global scope pollution.
! function( $ ) {


	/*
	 * Represents a color object, managing its HSB (Hue, Saturation, Brightness)
	 * and Alpha values, and providing conversion methods.
	 */
	var Color = function( val ) {
		// Initialize the color value with default HSB and Alpha.
		this.value = {
			h: 1, // Hue (0-1)
			s: 1, // Saturation (0-1)
			b: 1, // Brightness (0-1)
			a: 1  // Alpha (0-1)
		};
		// Attempt to set the color based on the initial value provided.
		this.setColor( val );
	};


	// Prototype methods for the Color object.
	Color.prototype = {

		// Ensure the constructor property points back to Color.
		constructor: Color,


		/**
		 * Parses a string value and sets the color.
		 * Supports various string formats (e.g., RGB, HSL).
		 * @param {string} val - The color string to parse.
		 */
		setColor: function( val ){
			val = val.toLowerCase(); // Convert input to lowercase for consistent parsing.
			var that = this; // Cache 'this' for use in inner functions.

			// Iterate through all registered string parsers.
			$.each( CPGlobal.stringParsers, function( i, parser ) {
				// Attempt to match the input value against the parser's regex.
				var match = parser.re.exec( val ),
					// If a match is found, parse the values.
					values = match && parser.parse( match ),
					// Determine the color space from the parser, defaulting to 'rgba'.
					space = parser.space || 'rgba';

				// If values were successfully parsed from the input string.
				if ( values ) {
					// If the color space is HSLA, convert it to RGB first, then to HSB.
					if ( space === 'hsla' ) {
						that.value = CPGlobal.RGBtoHSB.apply( null, CPGlobal.HSLtoRGB.apply( null, values ) );
					}
					// Otherwise, assume RGB-like values and convert directly to HSB.
					else {
						that.value = CPGlobal.RGBtoHSB.apply( null, values );
					}
					return false; // Stop iterating through parsers once a match is found.
				}
			} ); // End of $.each

		}, // End of setColor method


		/**
		 * Sets the hue component of the color.
		 * @param {number} h - The hue value (0-1), where 0 is red, 1 is also red (after cycling).
		 */
		setHue: function( h ) {
			this.value.h = 1 - h; // Adjust hue; typically 0 is red, 1 is also red, this might be an inversion.
		},


		/**
		 * Sets the saturation component of the color.
		 * @param {number} s - The saturation value (0-1), where 0 is grayscale, 1 is fully saturated.
		 */
		setSaturation: function( s ) {
			this.value.s = s; // Directly assign saturation.
		},


		/**
		 * Sets the lightness/brightness component of the color.
		 * @param {number} b - The brightness value (0-1), where 0 is black, 1 is full brightness.
		 */
		setLightness: function( b ) {
			this.value.b = 1 - b; // Adjust brightness; inversion might be for UI representation.
		},


		/**
		 * Sets the alpha (transparency) component of the color.
		 * @param {number} a - The alpha value (0-1), where 0 is fully transparent, 1 is fully opaque.
		 */
		setAlpha: function( a ) {
			// Convert alpha to a percentage and then back to a 0-1 scale,
			// effectively rounding to two decimal places.
			this.value.a = parseInt( ( 1 - a ) * 100, 10 ) / 100;
		},


		/**
		 * Converts the current HSB color to an RGB object.
		 * Based on RaphaelJS HSBtoRGB conversion.
		 * @see https://github.com/DmitryBaranovskiy/raphael/
		 * @param {number} [h] - Optional hue override.
		 * @param {number} [s] - Optional saturation override.
		 * @param {number} [b] - Optional brightness override.
		 * @param {number} [a] - Optional alpha override.
		 * @returns {object} An object with r, g, b, and a properties (0-255 for RGB, 0-1 for A).
		 */
		toRGB: function( h, s, b, a ) {
			// Use internal color values if no overrides are provided.
			if ( !h ) {
				h = this.value.h;
				s = this.value.s;
				b = this.value.b;
			}

			h *= 360; // Convert hue from 0-1 to 0-360 degrees.

			var R, G, B, X, C;
			h = ( h % 360 ) / 60; // Normalize hue to a 0-6 range.
			C = b * s; // Chroma calculation.
			X = C * ( 1 - Math.abs( h % 2 - 1 ) ); // Second largest component calculation.
			R = G = B = b - C; // Base value for all components (lightness).

			// Apply chroma and X based on the hue sector.
			h = ~~h; // Fast floor operation.
			R += [ C, X, 0, 0, X, C ][ h ];
			G += [ X, C, C, X, 0, 0 ][ h ];
			B += [ 0, 0, X, C, C, X ][ h ];

			// Return RGB values, scaled to 0-255 and rounded, with alpha.
			return {
				r: Math.round( R * 255 ),
				g: Math.round( G * 255 ),
				b: Math.round( B * 255 ),
				a: a || this.value.a // Use provided alpha or current alpha.
			};
		}, // End of toRGB method


		/**
		 * Converts the current color to a hexadecimal string.
		 * @param {number} [h] - Optional hue override.
		 * @param {number} [s] - Optional saturation override.
		 * @param {number} [b] - Optional brightness override.
		 * @param {number} [a] - Optional alpha override.
		 * @returns {string} The hexadecimal color string (e.g., '#RRGGBB').
		 */
		toHex: function( h, s, b, a ){
			var rgb = this.toRGB( h, s, b, a ); // Get RGB values.
			// Convert RGB to hex string. Uses bitwise operations for efficiency.
			return '#' + ( ( 1 << 24 ) | ( parseInt( rgb.r ) << 16 ) | ( parseInt( rgb.g ) << 8 ) | parseInt( rgb.b ) ).toString( 16 ).substr( 1 );
		}, // End of toHex method


		/**
		 * Converts the current HSB color to an HSL object.
		 * @param {number} [h] - Optional hue override.
		 * @param {number} [s] - Optional saturation override.
		 * @param {number} [b] - Optional brightness override.
		 * @param {number} [a] - Optional alpha override.
		 * @returns {object} An object with h, s, l, and a properties (all 0-1).
		 */
		toHSL: function( h, s, b, a ){
			// Use internal color values if no overrides are provided.
			if ( !h ) {
				h = this.value.h;
				s = this.value.s;
				b = this.value.b;
			}

			var H = h, // Hue remains the same.
				L = ( 2 - s ) * b, // Calculate lightness.
				S = s * b; // Calculate saturation (intermediate).

			// Adjust saturation based on lightness.
			if ( L > 0 && L <= 1 ) {
				S /= L;
			} else {
				S /= 2 - L;
			}
			L /= 2; // Normalize lightness to 0-1.

			// Ensure saturation does not exceed 1.
			if ( S > 1 ) {
				S = 1;
			}

			// Return HSL values with alpha.
			return {
				h: H,
				s: S,
				l: L,
				a: a || this.value.a
			};
		} // End of toHSL method

	}; // End of Color.prototype


	/*
	 * Represents the Colorpicker UI component.
	 * Handles interaction with the DOM and color manipulation.
	 */
	var Colorpicker = function( element, options ){
		// Store the jQuery wrapped element.
		this.element = $( element );

		// Determine the color format from options or data attribute, default to 'hex'.
		var format = options.format || this.element.data( 'color-format' ) || 'hex';
		this.format = CPGlobal.translateFormats[ format ]; // Get the formatting function.

		this.isInput = this.element.is( 'input' ); // Check if the element is an input field.
		// If it's a component (e.g., input group with an addon), find the addon.
		this.component = this.element.is( '.color' ) ? this.element.find( '.input-group-addon' ) : false;

		// Create the picker UI from a template and append to body.
		this.picker = $( CPGlobal.template )
							.appendTo( 'body' )
							.on( 'mousedown', $.proxy( this.mousedown, this ) ); // Attach mousedown handler.

		// Attach event handlers based on the element type.
		if ( this.isInput ) {
			this.element.on( {
				'focus': $.proxy( this.show, this ), // Show picker on focus.
				'keyup': $.proxy( this.update, this ) // Update color on keyup.
			} );
		} else if ( this.component ){
			this.component.on( {
				'click': $.proxy( this.show, this ) // Show picker on component click.
			} );
		} else {
			this.element.on( {
				'click': $.proxy( this.show, this ) // Show picker on element click.
			} );
		}

		// Add 'alpha' class to picker if format includes alpha, and get alpha slider style.
		if ( format === 'rgba' || format === 'hsla' ) {
			this.picker.addClass( 'alpha' );
			this.alpha = this.picker.find( '.colorpicker-alpha' )[ 0 ].style;
		}

		// Determine which element acts as the color preview.
		if ( this.component ){
			this.picker.find( '.colorpicker-color' ).hide(); // Hide the main color swatch in component mode.
			this.preview = this.element.find( 'i' )[ 0 ].style; // Preview is usually an icon in the addon.
		} else {
			this.preview = this.picker.find( 'div:last' )[ 0 ].style; // Preview is the last div in standalone mode.
		}

		// Get the style object for the base color (saturation/brightness area).
		this.base = this.picker.find( 'div:first' )[ 0 ].style;
		this.update(); // Initial update of the color picker state.
	}; // End of Colorpicker constructor


	// Prototype methods for the Colorpicker object.
	Colorpicker.prototype = {

		// Ensure the constructor property points back to Colorpicker.
		constructor: Colorpicker,


		/**
		 * Displays the color picker.
		 * @param {Event} [e] - The event that triggered the show.
		 */
		show: function( e ) {
			this.picker.show(); // Make the picker visible.
			// Calculate height for positioning.
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place(); // Position the picker.
			$( window ).on( 'resize', $.proxy( this.place, this ) ); // Reposition on window resize.

			// Prevent event propagation if not an input field.
			if ( !this.isInput ) {
				if ( e ) {
					e.stopPropagation();
					e.preventDefault();
				}
			}

			// Hide the picker when clicking outside.
			$( document ).on( {
				'mousedown': $.proxy( this.hide, this )
			} );

			// Trigger a custom 'show' event on the element.
			this.element.trigger( {
				type: 'show',
				color: this.color
			} );
		}, // End of show method


		/**
		 * Updates the color picker's UI based on the current color value.
		 */
		update: function(){
			// Create a new Color object from the element's current value or data attribute.
			this.color = new Color( this.isInput ? this.element.prop( 'value' ) : this.element.data( 'color' ) );

			// Position the saturation/brightness, hue, and alpha sliders.
			this.picker.find( 'i' )
				.eq( 0 ).css( { left: this.color.value.s * 100, top: 100 - this.color.value.b * 100 } ).end() // Saturation/Brightness
				.eq( 1 ).css( 'top', 100 * ( 1 - this.color.value.h ) ).end() // Hue
				.eq( 2 ).css( 'top', 100 * ( 1 - this.color.value.a ) ); // Alpha

			this.previewColor(); // Update the color preview areas.
		}, // End of update method


		/**
		 * Sets a new color value for the picker and updates the UI.
		 * @param {string|object} newColor - The new color value.
		 */
		setValue: function( newColor ) {
			this.color = new Color( newColor ); // Create a new Color object.

			// Position the sliders based on the new color.
			this.picker.find( 'i' )
				.eq( 0 ).css( { left: this.color.value.s * 100, top: 100 - this.color.value.b * 100 } ).end()
				.eq( 1 ).css( 'top', 100 * ( 1 - this.color.value.h ) ).end()
				.eq( 2 ).css( 'top', 100 * ( 1 - this.color.value.a ) );

			this.previewColor(); // Update color previews.

			// Trigger a custom 'changeColor' event.
			this.element.trigger( {
				type: 'changeColor',
				color: this.color
			} );
		}, // End of setValue method


		/**
		 * Hides the color picker.
		 */
		hide: function(){
			this.picker.hide(); // Hide the picker UI.
			$( window ).off( 'resize', this.place ); // Remove resize handler.

			// If not an input field, remove mousedown handler from document.
			if ( !this.isInput ) {
				$( document ).off( {
					'mousedown': this.hide
				} );
				// If it's a component, update the input value within it.
				if ( this.component ){
					this.element.find( 'input' ).prop( 'value', this.format.call( this ) );
				}
				this.element.data( 'color', this.format.call( this ) ); // Update data attribute.
			} else {
				this.element.prop( 'value', this.format.call( this ) ); // Update input field value.
			}

			// Trigger a custom 'hide' event.
			this.element.trigger( {
				type: 'hide',
				color: this.color
			} );
		}, // End of hide method


		/**
		 * Positions the color picker relative to its associated element.
		 */
		place: function(){
			// Get the offset of the element or its component.
			var offset = this.component ? this.component.offset() : this.element.offset();
			// Position the picker directly below the element.
			this.picker.css( {
				top: offset.top + this.height,
				left: offset.left
			} );
		}, // End of place method


		/**
		 * Updates the visual color previews in the picker.
		 */
		previewColor: function(){
			try {
				// Attempt to set the background color using the formatted color string.
				this.preview.backgroundColor = this.format.call( this );
			} catch( e ) {
				// Fallback to hex if the formatted color is invalid for CSS.
				this.preview.backgroundColor = this.color.toHex();
			}
			// Set the base color for the saturation/brightness slider (full saturation, full brightness).
			this.base.backgroundColor = this.color.toHex( this.color.value.h, 1, 1, 1 );
			// If an alpha slider exists, update its background color.
			if ( this.alpha ) {
				this.alpha.backgroundColor = this.color.toHex();
			}
		}, // End of previewColor method


		pointer: null, // Stores the initial mouse position for drag.

		slider: null, // Stores information about the active slider.


		/**
		 * Handles the mousedown event on the color picker.
		 * Initiates color adjustment based on which slider is clicked.
		 * @param {Event} e - The mousedown event.
		 */
		mousedown: function( e ){
			e.stopPropagation(); // Prevent event bubbling.
			e.preventDefault(); // Prevent default browser behavior (e.g., text selection).

			var target = $( e.target ); // The element that was clicked.

			// Detect which slider area was clicked.
			var zone = target.closest( 'div' );
			if ( !zone.is( '.colorpicker' ) ) { // Ensure click is within a slider zone, not the picker itself.
				if ( zone.is( '.colorpicker-saturation' ) ) {
					this.slider = $.extend( {}, CPGlobal.sliders.saturation ); // Use saturation slider configuration.
				}
				else if ( zone.is( '.colorpicker-hue' ) ) {
					this.slider = $.extend( {}, CPGlobal.sliders.hue ); // Use hue slider configuration.
				}
				else if ( zone.is( '.colorpicker-alpha' ) ) {
					this.slider = $.extend( {}, CPGlobal.sliders.alpha ); // Use alpha slider configuration.
				} else {
					return false; // No slider found, do nothing.
				}

				var offset = zone.offset(); // Get the offset of the slider zone.
				// Store a reference to the knob's style object for direct manipulation.
				this.slider.knob = zone.find( 'i' )[ 0 ].style;
				// Calculate initial position relative to the slider zone.
				this.slider.left = e.pageX - offset.left;
				this.slider.top = e.pageY - offset.top;
				// Store the initial mouse pointer position.
				this.pointer = {
					left: e.pageX,
					top: e.pageY
				};

				// Attach mousemove and mouseup handlers to the document for dragging.
				$( document ).on( {
					mousemove: $.proxy( this.mousemove, this ),
					mouseup: $.proxy( this.mouseup, this )
				} ).trigger( 'mousemove' ); // Trigger immediate mousemove to position knob.
			}
			return false; // Prevent default action.
		}, // End of mousedown method


		/**
		 * Handles the mousemove event during a slider drag.
		 * Updates the slider knob position and the color value.
		 * @param {Event} e - The mousemove event.
		 */
		mousemove: function( e ){
			e.stopPropagation(); // Stop event propagation.
			e.preventDefault(); // Prevent default behavior.

			// Calculate new left position, clamped within slider bounds.
			var left = Math.max(
				0,
				Math.min(
					this.slider.maxLeft,
					this.slider.left + ( ( e.pageX || this.pointer.left ) - this.pointer.left )
				)
			);
			// Calculate new top position, clamped within slider bounds.
			var top = Math.max(
				0,
				Math.min(
					this.slider.maxTop,
					this.slider.top + ( ( e.pageY || this.pointer.top ) - this.pointer.top )
				)
			);

			this.slider.knob.left = left + 'px'; // Update knob's left position.
			this.slider.knob.top = top + 'px'; // Update knob's top position.

			// Call the appropriate color setter methods based on slider configuration.
			if ( this.slider.callLeft ) {
				this.color[ this.slider.callLeft ].call( this.color, left / 100 );
			}
			if ( this.slider.callTop ) {
				this.color[ this.slider.callTop ].call( this.color, top / 100 );
			}

			this.previewColor(); // Update color previews.

			// Trigger a custom 'changeColor' event.
			this.element.trigger( {
				type: 'changeColor',
				color: this.color
			} );
			return false; // Prevent default action.
		}, // End of mousemove method


		/**
		 * Handles the mouseup event, ending a slider drag.
		 * Removes the mousemove and mouseup handlers from the document.
		 * @param {Event} e - The mouseup event.
		 */
		mouseup: function( e ){
			e.stopPropagation(); // Stop event propagation.
			e.preventDefault(); // Prevent default behavior.

			// Remove the event handlers from the document.
			$( document ).off( {
				mousemove: this.mousemove,
				mouseup: this.mouseup
			} );
			return false; // Prevent default action.
		} // End of mouseup method

	} // End of Colorpicker.prototype


	// jQuery plugin definition for colorpicker.
	$.fn.colorpicker = function ( option, val ) {
		// Iterate over each selected element.
		return this.each( function () {
			var $this = $( this ),
				data = $this.data( 'colorpicker' ), // Get existing colorpicker instance data.
				options = typeof option === 'object' && option; // Extract options if provided as an object.

			// If no colorpicker instance exists for this element, create one.
			if ( !data ) {
				$this.data( 'colorpicker', ( data = new Colorpicker( this, $.extend( {}, $.fn.colorpicker.defaults, options ) ) ) );
			}
			// If option is a string, call the corresponding method on the instance.
			if ( typeof option === 'string' ) data[ option ]( val );
		} );
	};


	// Default options for the colorpicker plugin.
	$.fn.colorpicker.defaults = {
		// No default options currently defined, but can be extended here.
	};

	// Expose the Colorpicker constructor for direct access.
	$.fn.colorpicker.Constructor = Colorpicker;


	// Global utility object for color parsing, conversion, and slider configurations.
	var CPGlobal = {

		// Object containing functions to translate Color objects to various string formats.
		translateFormats: {
			'rgb': function(){
				var rgb = this.color.toRGB(); // Get RGB values.
				return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')'; // Format as CSS rgb().
			},

			'rgba': function(){
				var rgb = this.color.toRGB(); // Get RGBA values.
				return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')'; // Format as CSS rgba().
			},

			'hsl': function(){
				var hsl = this.color.toHSL(); // Get HSL values.
				// Format as CSS hsl(), rounding values.
				return 'hsl(' + Math.round( hsl.h * 360 ) + ',' + Math.round( hsl.s * 100 ) + '%,' + Math.round( hsl.l * 100 ) + '%)';
			},

			'hsla': function(){
				var hsl = this.color.toHSL(); // Get HSLA values.
				// Format as CSS hsla(), rounding H, S, L and including alpha.
				return 'hsla(' + Math.round( hsl.h * 360 ) + ',' + Math.round( hsl.s * 100 ) + '%,' + Math.round( hsl.l * 100 ) + '%,' + hsl.a + ')';
			},

			'hex': function(){
				return  this.color.toHex(); // Format as hex string.
			}
		}, // End of translateFormats


		// Configurations for different color picker sliders.
		sliders: {
			saturation: {
				maxLeft: 100, // Max horizontal movement for saturation.
				maxTop: 100,  // Max vertical movement for brightness.
				callLeft: 'setSaturation', // Method to call for horizontal movement.
				callTop: 'setLightness'    // Method to call for vertical movement.
			},

			hue: {
				maxLeft: 0,   // Hue slider is vertical only.
				maxTop: 100,  // Max vertical movement for hue.
				callLeft: false, // No horizontal interaction.
				callTop: 'setHue'     // Method to call for vertical movement.
			},

			alpha: {
				maxLeft: 0,   // Alpha slider is vertical only.
				maxTop: 100,  // Max vertical movement for alpha.
				callLeft: false, // No horizontal interaction.
				callTop: 'setAlpha'   // Method to call for vertical movement.
			}
		}, // End of sliders


		/**
		 * Converts an RGB color to HSB.
		 * Based on RaphaelJS HSBtoRGB conversion logic.
		 * @see https://github.com/DmitryBaranovskiy/raphael/
		 * @param {number} r - Red component (0-255).
		 * @param {number} g - Green component (0-255).
		 * @param {number} b - Blue component (0-255).
		 * @param {number} [a] - Alpha component (0-1).
		 * @returns {object} An object with h, s, b, and a properties (all 0-1).
		 */
		RGBtoHSB: function ( r, g, b, a ){
			r /= 255; // Normalize R, G, B to 0-1 range.
			g /= 255;
			b /= 255;

			var H, S, V, C;
			V = Math.max( r, g, b ); // Max component is Value (Brightness).
			C = V - Math.min( r, g, b ); // Chroma is difference between max and min.
			H = ( C === 0 ? null : // If no chroma, hue is undefined.
				V == r ? ( g - b ) / C : // Red is dominant.
				V == g ? ( b - r ) / C + 2 : // Green is dominant.
					( r - g ) / C + 4
				); // Blue is dominant.
			H = ( ( H + 360 ) % 6 ) * 60 / 360; // Convert hue to 0-1 range.
			S = C === 0 ? 0 : C / V; // Saturation calculation.

			return { h: H || 1, s: S, b: V, a: a || 1 }; // Return HSB with alpha.
		}, // End of RGBtoHSB


		/**
		 * Helper function for HSLtoRGB conversion.
		 * @param {number} p
		 * @param {number} q
		 * @param {number} h
		 * @returns {number} RGB component value.
		 */
		HueToRGB: function ( p, q, h ) {
			if ( h < 0 )
				h += 1; // Adjust hue if out of range.
			else if ( h > 1 )
				h -= 1;

			if ( ( h * 6 ) < 1 )
				return p + ( q - p ) * h * 6; // First sector.
			else if ( ( h * 2 ) < 1 )
				return q; // Second sector.
			else if ( ( h * 3 ) < 2 )
				return p + ( q - p ) * ( ( 2 / 3 ) - h ) * 6; // Third sector.
			else
				return p; // Fourth sector.
		}, // End of HueToRGB


		/**
		 * Converts an HSL color to RGB.
		 * @param {number} h - Hue (0-1).
		 * @param {number} s - Saturation (0-1).
		 * @param {number} l - Lightness (0-1).
		 * @param {number} [a] - Alpha (0-1).
		 * @returns {Array<number>} An array [r, g, b, a] with RGB 0-255, A 0-1.
		 */
		HSLtoRGB: function ( h, s, l, a )
		{
			if ( s < 0 ) {
				s = 0; // Clamp saturation to 0.
			}
			var q;
			if ( l <= 0.5 ) {
				q = l * ( 1 + s ); // Calculate q based on lightness and saturation.
			} else {
				q = l + s - ( l * s );
			}

			var p = 2 * l - q; // Calculate p.

			// Calculate temporary hues for R, G, B.
			var tr = h + ( 1 / 3 );
			var tg = h;
			var tb = h - ( 1 / 3 );

			// Convert to RGB components, scale to 0-255, and round.
			var r = Math.round( CPGlobal.HueToRGB( p, q, tr ) * 255 );
			var g = Math.round( CPGlobal.HueToRGB( p, q, tg ) * 255 );
			var b = Math.round( CPGlobal.HueToRGB( p, q, tb ) * 255 );
			return [ r, g, b, a || 1 ]; // Return RGB array with alpha.
		}, // End of HSLtoRGB


		// Array of regular expressions and parsing functions to convert color strings to numeric tuples.
		// Based on John Resig's jQuery color plugin.
		// @see https://github.com/jquery/jquery-color/
		stringParsers: [
			{
				// Regex for rgb(R, G, B) or rgba(R, G, B, A) with integer values.
				re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						execResult[ 1 ], // Red
						execResult[ 2 ], // Green
						execResult[ 3 ], // Blue
						execResult[ 4 ]  // Alpha (optional)
					];
				}
			},
			{
				// Regex for rgb(R%, G%, B%) or rgba(R%, G%, B%, A) with percentage values.
				re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						2.55 * execResult[ 1 ], // Convert percentage R to 0-255.
						2.55 * execResult[ 2 ], // Convert percentage G to 0-255.
						2.55 * execResult[ 3 ], // Convert percentage B to 0-255.
						execResult[ 4 ]         // Alpha (optional).
					];
				}
			}
			// Additional parsers could be added here for other formats like hex, hsl, etc.
		] // End of stringParsers array
	}; // End of CPGlobal object


}( jQuery ); // Pass jQuery object to the IIFE.
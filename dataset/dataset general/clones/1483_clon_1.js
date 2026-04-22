////////////////////////////////////////////////////////////////////////////////
//
//  Responsive Elements Utility Script
//  Copyright (c) 2013 Kumail Hunaid. All rights reserved.
//
//  This software is provided under the MIT License.
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//
////////////////////////////////////////////////////////////////////////////////

var ResponsiveElements = {

	// Attribute name used on HTML elements to define responsive options
	elementsAttributeName: 'data-respond',

	// Maximum refresh rate for resize events, in milliseconds
	maxRefreshRate: 5,

	// Default values for responsive element options
	defaults: {
		// When to begin adding breakpoints (e.g., 'gt100')
		start: 100,
		// When to cease adding breakpoints (e.g., 'lt900')
		end: 900,
		// The numerical interval between breakpoints
		interval: 50
	},

	// Initialization method for the ResponsiveElements object
	init: function ( ) {
		var self = this;
		// Ensure the DOM is fully loaded before proceeding
		$( function ( ) {
			// Cache references to important DOM elements
			self.el = {
				window: $( window ),
				responsive_elements: $( '[' + self.elementsAttributeName + ']' )
			};

			// Set up event listeners
			self.events( );
		} );
	},

	// Adds a new element to the collection of responsive elements
	addElement: function ( element ) {
		this.el.responsive_elements = this.el.responsive_elements.add( element );
	},

	// Removes an element from the collection of responsive elements
	removeElement: function ( element ) {
		this.el.responsive_elements = this.el.responsive_elements.not( element );
	},

	// Parses a string of options from the data attribute into an object
	parseOptions: function ( options_string ) {
		// Example format: "start: 100px; end: 900px; interval: 50px; watch: true;"
		if ( ! options_string ) {
			return false;
		}

		// Initialize cache if it doesn't exist
		this._options_cache = this._options_cache || { };
		// Return cached options if available
		if ( this._options_cache[ options_string ] ) {
			return this._options_cache[ options_string ];
		}

		// Clean up whitespace and split into individual option strings
		var options_array = options_string.replace( /\s+/g, '' ).split( ';' ),
		    options_object = { };

		// Iterate through each option string
		for ( var i = 0; i < options_array.length; i ++ ) {
			// Skip empty strings
			if ( ! options_array[ i ] ) {
				continue;
			}
			// Split property and value
			var property_array = ( options_array[ i ] ).split( ':' );

			var key = property_array[ 0 ];
			var value = property_array[ 1 ];

			// Remove 'px' suffix and convert to integer if applicable
			if ( value.slice( -2 ) === 'px' ) {
				value = value.replace( 'px', '' );
			}
			if ( ! isNaN( value ) ) {
				value = parseInt( value, 10 );
			}
			// Assign parsed value to the options object
			options_object[ key ] = value;
		}

		// Cache and return the parsed options object
		this._options_cache[ options_string ] = options_object;
		return options_object;
	},

	// Generates breakpoints for all registered responsive elements
	generateBreakpointsOnAllElements: function ( ) {
		var self = ResponsiveElements;
		// Iterate over each responsive element
		self.el.responsive_elements.each( function ( i, _el ) {
			// Generate breakpoints for the current element
			self.generateBreakpointsOnElement( $( _el ) );
		} );
	},

	// Generates breakpoints for a single specified element
	generateBreakpointsOnElement: function ( _el ) {
		// Retrieve options string from the element's attribute
		var options_string = _el.attr( this.elementsAttributeName ),
		    // Parse options or use defaults
		    options = this.parseOptions( options_string ) || this.defaults,
		    // Generate actual breakpoint classes based on current width and options
		    breakpoints = this.generateBreakpoints( _el.width( ), options );

		// First, remove any existing breakpoint classes
		this.cleanUpBreakpoints( _el );
		// Then, add the newly generated breakpoint classes
		_el.addClass( breakpoints.join( ' ' ) );
	},

	// Core logic to generate breakpoint class names based on width and options
	generateBreakpoints: function ( width, options ) {
		var start = options.start,
		    end = options.end,
		    interval = options.interval,
		    // Initialize 'i' for iteration, ensuring it starts at a multiple of interval
		    i = interval > start ? interval : ~~( start / interval ) * interval,
		    classes = [ ]; // Array to store generated classes

		// Loop from 'start' to 'end' by 'interval'
		while ( i <= end ) {
			// Add 'gt' class if current width is greater than breakpoint
			if ( i < width ) {
				classes.push( 'gt' + i );
			}
			// Add 'lt' class if current width is less than breakpoint
			if ( i > width ) {
				classes.push( 'lt' + i );
			}
			// Add 'lt' class if current width is exactly equal to breakpoint (design choice)
			if ( i == width ) {
				classes.push( 'lt' + i );
			}

			// Increment for the next breakpoint
			i += interval;
		}

		return classes;
	},

	// Parses an element's class string to extract only responsive breakpoint classes
	parseBreakpointClasses: function ( breakpoints_string ) {
		// Split the class string into individual class names
		var classes = breakpoints_string.split( /\s+/ ),
		    breakpointClasses = [ ]; // Array to store identified breakpoint classes

		// Iterate over each class name
		$( classes ).each( function ( i, className ) {
			// Check if the class matches the 'gtN' or 'ltN' pattern
			if ( className.match( /^gt\d+|lt\d+$/ ) ) {
				breakpointClasses.push( className );
			}
		} );

		return breakpointClasses;
	},

	// Removes all previously applied breakpoint classes from an element
	cleanUpBreakpoints: function ( _el ) {
		// Get all existing classes and filter for breakpoint classes
		var classesToCleanup = this.parseBreakpointClasses( _el.attr( 'class' ) || '' );
		// Remove the identified breakpoint classes from the element
		_el.removeClass( classesToCleanup.join( ' ' ) );
	},

	// Sets up all event listeners for the ResponsiveElements functionality
	events: function ( ) {
		// Initial generation of breakpoints on page load
		this.generateBreakpointsOnAllElements( );

		// Bind the resize event to the window, debounced for performance
		this.el.window.bind( 'resize', this.utils.debounce(
			this.generateBreakpointsOnAllElements, this.maxRefreshRate ) );
	},

	// Utility functions
	utils: {
		// Debounce function (adapted from Underscore.js 1.5.2)
		// (c) 2009-2013 Jeremy Ashkenas. Distributed under the MIT license.
		// Returns a function, that, as long as it continues to be invoked,
		// will not be triggered. The function will be called after it stops
		// being called for N milliseconds. If `immediate` is passed,
		// trigger the function on the leading edge, instead of the trailing.
		debounce: function ( func, wait, immediate ) {
			var result;
			var timeout = null;
			return function ( ) {
				var context = this,
				    args = arguments;
				var later = function ( ) {
					timeout = null;
					if ( ! immediate ) {
						result = func.apply( context, args );
					}
				};
				var callNow = immediate && ! timeout;
				clearTimeout( timeout );
				timeout = setTimeout( later, wait );
				if ( callNow ) {
					result = func.apply( context, args );
				}
				return result;
			};
		}
	}
};

// Initialize the ResponsiveElements system upon script loading
ResponsiveElements.init( );
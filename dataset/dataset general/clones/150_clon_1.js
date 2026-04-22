/*
 * Custom logging utility: A lightweight wrapper for console.log.
 * Refer to paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/ for more details.
 *
 * Example usage: log ( 'inside coolFunc', this, arguments );
 */
window.log = function f ( ) {
    // Initialize history array if it doesn't exist
    log.history = log.history || [ ];
    // Push current arguments to the history
    log.history.push ( arguments );

    // Check if console is available in the current context
    if ( this.console ) {
        var args = arguments, newarr;

        // Ensure callee refers to the caller function for better stack traces
        // Note: arguments.callee is deprecated in strict mode, but used here.
        args.callee = args.callee.caller;
        // Convert arguments object to a true array
        newarr = [ ].slice.call ( args );

        // Different ways to call console.log based on its type
        if ( typeof console.log === 'object' ) {
             // For IE, console.log might be an object, requiring explicit apply.call
             log.apply.call ( console.log, console, newarr );
        }
        else {
            // Standard console.log application
            console.log.apply ( console, newarr );
        }
    }
};

/*
 * This self-executing anonymous function ensures that console.log and its methods
 * are always available, even in browsers where they might be undefined (e.g., IE without dev tools open).
 * It prevents errors when console methods are called in production environments.
 */
(function ( a ) {
    function b ( ) {
        /* This is an empty placeholder function. */
    }

    // List of common console methods to ensure existance.
    var c = "assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split ( "," ),
        d;

    // Loop through the console methods and assign a no-op function if they don't exist.
    while ( !! ( d = c.pop ( ) ) ) {
        a [ d ] = a [ d ] || b;
    }
})
(function ( ) {
    try {
        // Attempt to call console.log to check if it's functional.
        console.log ( );
        return window.console; // Return the functional console object.
    } catch ( a ) {
        // If an error occurs (console.log might not be fully initialized or present),
        // return an empty object to prevent further errors.
        return ( window.console = { } );
    }
} ( ) );


// This section is designated for embedding any jQuery or other helper plugins.
// Consolidating them here can lead to fewer HTTP requests and potentially faster loading
// compared to loading multiple separate script files.

/**
 * Farbtastic Color Picker v1.2
 *
 * Copyright (C) 2008 Steven Wittens. All rights reserved.
 *
 * This software is distributed under the terms of the GNU General Public License (GPL).
 * You are free to redistribute and/or modify it under either version 2 of the License,
 * or, at your discretion, any later version published by the Free Software Foundation.
 *
 * This program is provided "AS IS", without any express or implied warranty.
 * This includes, but is not limited to, the implied warranties of MERCHANTABILITY
 * and FITNESS FOR A PARTICULAR PURPOSE. Refer to the GNU GPL for comprehensive details.
 *
 * A copy of the GNU GPL should have been included with this distribution.
 * If not, please contact the Free Software Foundation, Inc.,
 * located at 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
(function ( jQuery ) {

    // jQuery plugin definition for farbtastic
    jQuery.fn.farbtastic = function ( callback ) {
        // Delegate to the main farbtastic function
        $.farbtastic ( this, callback );
        return this; // Maintain chainability
    };


    // Main Farbtastic factory function
    jQuery.farbtastic = function ( container, callback ) {
        // Get the DOM element from the jQuery object
        var container = $ ( container ).get ( 0 );

        // Return existing farbtastic instance or create a new one
        return container.farbtastic || ( container.farbtastic = new jQuery._farbtastic ( container, callback ) );
    }


    // Farbtastic core constructor
    jQuery._farbtastic = function ( container, callback ) {
        // Store reference to the farbtastic object instance
        var fb = this;

        // Insert the necessary HTML markup for the color picker interface
        $ ( container ).html ( '<div class="farbtastic"><div class="color"></div><div class="wheel"></div><div class="overlay"></div><div class="h-marker marker"></div><div class="sl-marker marker"></div></div>' );

        // Cache the main farbtastic element within the container
        var e = $ ( '.farbtastic', container );
        // Get the wheel element for event handling and positioning calculations
        fb.wheel = $ ( '.wheel', container ).get ( 0 );

        // Define core dimensions for the color picker components
        fb.radius = 84;  // Radius of the color wheel
        fb.square = 100; // Size of the saturation/luminance square
        fb.width = 194;  // Total width of the color picker widget

        // Conditional fix for background PNG images in Internet Explorer 6
        if ( navigator.appVersion.match ( /MSIE [0-6]\./ ) ) {
            $ ( '*', e ).each ( function ( ) {
                // Check if an element has a background image defined
                if ( this.currentStyle.backgroundImage != 'none' ) {
                    var image = this.currentStyle.backgroundImage;
                    // Extract the image URL from the 'url(...)' string
                    image = this.currentStyle.backgroundImage.substring ( 5, image.length - 2 );
                    // Apply IE-specific AlphaImageLoader filter for PNG transparency
                    $ ( this ).css ( {
                        'backgroundImage': 'none',
                        'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
                    } );
                }
            } );
        }

        /**
         * Establishes a link between the color picker and a target element(s) or a callback function.
         * When the color changes, the linked target(s) will be updated or the callback invoked.
         *
         * @param {Function|String|jQuery} callback - A function to call, a selector string, or a jQuery object.
         */
        fb.linkTo = function ( callback ) {
            // If there was a previously linked object (e.g., input field), unbind its keyup event listener.
            if ( typeof fb.callback == 'object' ) {
                $ ( fb.callback ).unbind ( 'keyup', fb.updateValue );
            }

            // Reset the internal color state
            fb.color = null;

            // Bind the new callback or elements
            if ( typeof callback == 'function' ) {
                fb.callback = callback; // Direct function callback
            }
            else if ( typeof callback == 'object' || typeof callback == 'string' ) {
                // Link to an input field or a set of elements
                fb.callback = $ ( callback );
                fb.callback.bind ( 'keyup', fb.updateValue ); // Update on keyup for input fields

                // If the linked element has a value, set the initial color from it
                if ( fb.callback.get ( 0 ).value ) {
                    fb.setColor ( fb.callback.get ( 0 ).value );
                }
            }
            return this; // Allow method chaining
        }

        /**
         * Event handler for updating the color from a linked input field's value.
         *
         * @param {Event} event - The keyup event object.
         */
        fb.updateValue = function ( event ) {
            // Check if the input field has a value and it's different from the current color
            if ( this.value && this.value != fb.color ) {
                fb.setColor ( this.value ); // Set the color picker's color
            }
        }

        /**
         * Sets the color of the picker using an HTML color string (e.g., "#RRGGBB").
         *
         * @param {String} color - The hexadecimal color string.
         * @returns {Object} The Farbtastic instance for chaining.
         */
        fb.setColor = function ( color ) {
            // Attempt to unpack the color string into an RGB triplet
            var unpack = fb.unpack ( color );

            // Only update if the color is new and valid
            if ( fb.color != color && unpack ) {
                fb.color = color;       // Store the HTML color string
                fb.rgb = unpack;        // Store the RGB triplet
                fb.hsl = fb.RGBToHSL ( fb.rgb ); // Convert RGB to HSL
                fb.updateDisplay ( );   // Update the UI
            }
            return this; // Allow method chaining
        }

        /**
         * Sets the color of the picker using an HSL triplet.
         *
         * @param {Array} hsl - An array [h, s, l] where each component is between 0 and 1.
         * @returns {Object} The Farbtastic instance for chaining.
         */
        fb.setHSL = function ( hsl ) {
            fb.hsl = hsl;                   // Store the HSL triplet
            fb.rgb = fb.HSLToRGB ( hsl );   // Convert HSL to RGB
            fb.color = fb.pack ( fb.rgb );  // Pack RGB back to HTML color string
            fb.updateDisplay ( );           // Update the UI
            return this;                    // Allow method chaining
        }

        /* ------------------------------------------------------------------- */
        /* Core interaction logic and utility functions for color manipulation */
        /* ------------------------------------------------------------------- */

        /**
         * Retrieves the coordinates of a mouse event relative to the center of the widget.
         * Handles both standard and IE-specific event properties.
         *
         * @param {Event} event - The mouse event object.
         * @returns {Object} An object with `x` and `y` coordinates relative to the widget's center.
         */
        fb.widgetCoords = function ( event ) {
            var x, y;
            var el = event.target || event.srcElement; // Get the event target element
            var reference = fb.wheel;                   // The reference element for coordinate calculation

            if ( typeof event.offsetX != 'undefined' ) {
                // --- IE-specific coordinate handling ---
                // Use offset coordinates and find common offsetParent
                var pos = { x: event.offsetX, y: event.offsetY };

                // Traverse upwards through the offsetParent chain, accumulating positions
                var e = el;
                while ( e ) {
                    e.mouseX = pos.x;
                    e.mouseY = pos.y;
                    pos.x += e.offsetLeft;
                    pos.y += e.offsetTop;
                    e = e.offsetParent;
                }

                // Look for the coordinates starting from the wheel widget.
                e = reference;
                var offset = { x: 0, y: 0 }
                while ( e ) {
                    if ( typeof e.mouseX != 'undefined' ) {
                        x = e.mouseX - offset.x;
                        y = e.mouseY - offset.y;
                        break;
                    }
                    offset.x += e.offsetLeft;
                    offset.y += e.offsetTop;
                    e = e.offsetParent;
                }

                // Reset stored coordinates to prevent memory leaks / side effects
                e = el;
                while ( e ) {
                    e.mouseX = undefined;
                    e.mouseY = undefined;
                    e = e.offsetParent;
                }
            }
            else {
                // --- Standard browser coordinate handling ---
                // Use absolute coordinates and subtract the widget's absolute position
                var pos = fb.absolutePosition ( reference );

                // Calculate x and y relative to the widget's top-left corner
                x = ( event.pageX || 0 * ( event.clientX + $ ( 'html' ).get ( 0 ).scrollLeft ) ) - pos.x;
                y = ( event.pageY || 0 * ( event.clientY + $ ( 'html' ).get ( 0 ).scrollTop ) ) - pos.y;
            }

            // Subtract distance to middle to get coordinates relative to the widget's center
            return { x: x - fb.width / 2, y: y - fb.width / 2 };
        }

        /**
         * Handles the mousedown event for initiating color selection.
         *
         * @param {Event} event - The mousedown event object.
         * @returns {boolean} False to prevent default browser drag behavior.
         */
        fb.mousedown = function ( event ) {
            // Capture mouse events across the entire document
            if ( ! document.dragging ) {
                $ ( document ).bind ( 'mousemove', fb.mousemove ).bind ( 'mouseup', fb.mouseup );
                document.dragging = true; // Set a global flag indicating a drag operation is in progress
            }

            // Determine if the drag started on the color wheel or the saturation/luminance square
            var pos = fb.widgetCoords ( event );
            fb.circleDrag = Math.max ( Math.abs ( pos.x ), Math.abs ( pos.y ) ) * 2 > fb.square;

            // Process the current mouse position immediately
            fb.mousemove ( event );
            return false; // Prevent default drag behavior
        }

        /**
         * Handles the mousemove event during a drag operation, updating the color based on mouse position.
         *
         * @param {Event} event - The mousemove event object.
         * @returns {boolean} False to prevent default browser drag behavior.
         */
        fb.mousemove = function ( event ) {
            // Get coordinates relative to the color picker's center
            var pos = fb.widgetCoords ( event );

            // Update HSL parameters based on whether the wheel or square is being dragged
            if ( fb.circleDrag ) {
                // Calculate hue based on angle around the center
                var hue = Math.atan2 ( pos.x, -pos.y ) / 6.28;
                if ( hue < 0 ) {
                    hue += 1;
                }
                fb.setHSL ( [ hue, fb.hsl[1], fb.hsl[2] ] ); // Only update hue
            }
            else {
                // Calculate saturation and luminance within the square area
                var sat = Math.max ( 0, Math.min ( 1, - ( pos.x / fb.square ) + .5 ) );
                var lum = Math.max ( 0, Math.min ( 1, - ( pos.y / fb.square ) + .5 ) );
                fb.setHSL ( [ fb.hsl[0], sat, lum ] ); // Only update saturation and luminance
            }
            return false; // Prevent default drag behavior
        }

        /**
         * Handles the mouseup event, ending the drag operation.
         */
        fb.mouseup = function ( ) {
            // Unbind mousemove and mouseup handlers from the document
            $ ( document ).unbind ( 'mousemove', fb.mousemove );
            $ ( document ).unbind ( 'mouseup', fb.mouseup );
            document.dragging = false; // Reset the global drag flag
        }

        /**
         * Updates the visual display of the color picker, including markers and linked elements.
         */
        fb.updateDisplay = function ( ) {
            // --- Update Hue marker position ---
            var angle = fb.hsl[0] * 6.28; // Convert hue to radians
            $ ( '.h-marker', e ).css ( {
                left: Math.round ( Math.sin ( angle ) * fb.radius + fb.width / 2 ) + 'px',
                top: Math.round ( -Math.cos ( angle ) * fb.radius + fb.width / 2 ) + 'px'
            } );

            // --- Update Saturation/Luminance marker position ---
            $ ( '.sl-marker', e ).css ( {
                left: Math.round ( fb.square * ( .5 - fb.hsl[1] ) + fb.width / 2 ) + 'px',
                top: Math.round ( fb.square * ( .5 - fb.hsl[2] ) + fb.width / 2 ) + 'px'
            } );

            // --- Update the background color of the saturation/luminance square ---
            // This displays the color at full saturation and 50% luminance for the current hue
            $ ( '.color', e ).css ( 'backgroundColor', fb.pack ( fb.HSLToRGB ( [ fb.hsl[0], 1, 0.5 ] ) ) );

            // --- Update linked elements or invoke callback ---
            if ( typeof fb.callback == 'object' ) {
                // If linked to a jQuery object (e.g., input field, div)
                // Set background/foreground color of the linked element(s)
                $ ( fb.callback ).css ( {
                    backgroundColor: fb.color,
                    color: fb.hsl[2] > 0.5 ? '#000' : '#fff' // Text color for contrast
                } );

                // Update the 'value' property for input fields if the color has changed
                $ ( fb.callback ).each ( function ( ) {
                    if ( this.value && this.value != fb.color ) {
                        this.value = fb.color;
                    }
                } );
            }
            else if ( typeof fb.callback == 'function' ) {
                // If linked to a function, invoke it with the current color
                fb.callback.call ( fb, fb.color );
            }
        }

        /**
         * Calculates the absolute position (top-left coordinates) of a given DOM element.
         * Recursively sums offsetLeft and offsetTop values through the offsetParent chain.
         *
         * @param {HTMLElement} el - The DOM element to get the position for.
         * @returns {Object} An object with `x` and `y` properties representing the absolute position.
         */
        fb.absolutePosition = function ( el ) {
            var r = { x: el.offsetLeft, y: el.offsetTop };

            // Resolve position relative to the offsetParent
            if ( el.offsetParent ) {
                var tmp = fb.absolutePosition ( el.offsetParent );
                r.x += tmp.x;
                r.y += tmp.y;
            }
            return r;
        };


        /* Various color utility functions for conversion between color models (RGB, HSL, Hex) */

        /**
         * Converts an RGB triplet [r, g, b] (each 0-1) into an HTML hexadecimal color string "#RRGGBB".
         *
         * @param {Array} rgb - An array [r, g, b] with values between 0 and 1.
         * @returns {String} The hexadecimal color string.
         */
        fb.pack = function ( rgb ) {
            var r = Math.round ( rgb[0] * 255 );
            var g = Math.round ( rgb[1] * 255 );
            var b = Math.round ( rgb[2] * 255 );

            // Convert to hexadecimal and add leading zeros if necessary
            return '#' + ( r < 16 ? '0' : '' ) + r.toString ( 16 ) +
                   ( g < 16 ? '0' : '' ) + g.toString ( 16 ) +
                   ( b < 16 ? '0' : '' ) + b.toString ( 16 );
        }

        /**
         * Unpacks an HTML hexadecimal color string (e.g., "#RRGGBB" or "#RGB") into an RGB triplet.
         *
         * @param {String} color - The hexadecimal color string.
         * @returns {Array|undefined} An array [r, g, b] with values between 0 and 1, or undefined if invalid.
         */
        fb.unpack = function ( color ) {
            if ( color.length == 7 ) {
                // "#RRGGBB" format
                return [ parseInt ( '0x' + color.substring ( 1, 3 ) ) / 255,
                         parseInt ( '0x' + color.substring ( 3, 5 ) ) / 255,
                         parseInt ( '0x' + color.substring ( 5, 7 ) ) / 255 ];
            }
            else if ( color.length == 4 ) {
                // "#RGB" shorthand format
                return [ parseInt ( '0x' + color.substring ( 1, 2 ) ) / 15,
                         parseInt ( '0x' + color.substring ( 2, 3 ) ) / 15,
                         parseInt ( '0x' + color.substring ( 3, 4 ) ) / 15 ];
            }
            // If format is not recognized, return undefined.
        }

        /**
         * Converts an HSL triplet [h, s, l] to an RGB triplet [r, g, b].
         * Hue, saturation, and lightness are all between 0 and 1.
         *
         * @param {Array} hsl - An array [h, s, l].
         * @returns {Array} An array [r, g, b].
         */
        fb.HSLToRGB = function ( hsl ) {
            var m1, m2, r, g, b;
            var h = hsl[0], s = hsl[1], l = hsl[2];

            // Calculate m2 based on lightness and saturation
            m2 = ( l <= 0.5 ) ? l * ( s + 1 ) : l + s - l * s;
            m1 = l * 2 - m2; // Calculate m1

            // Convert hue components to RGB
            return [ this.hueToRGB ( m1, m2, h + 0.33333 ), // Red component
                     this.hueToRGB ( m1, m2, h ),           // Green component
                     this.hueToRGB ( m1, m2, h - 0.33333 )  // Blue component
                   ];
        }

        /**
         * Helper function for HSLToRGB to convert a hue value to an RGB component.
         *
         * @param {Number} m1 - Intermediate value from HSLToRGB.
         * @param {Number} m2 - Intermediate value from HSLToRGB.
         * @param {Number} h - Hue component (adjusted).
         * @returns {Number} The calculated RGB component (0-1).
         */
        fb.hueToRGB = function ( m1, m2, h ) {
            // Normalize hue to be within [0, 1]
            h = ( h < 0 ) ? h + 1 : ( ( h > 1 ) ? h - 1 : h );

            if ( h * 6 < 1 ) {
                return m1 + ( m2 - m1 ) * h * 6;
            }
            if ( h * 2 < 1 ) {
                return m2;
            }
            if ( h * 3 < 2 ) {
                return m1 + ( m2 - m1 ) * ( 0.66666 - h ) * 6;
            }
            return m1;
        }

        /**
         * Converts an RGB triplet [r, g, b] to an HSL triplet [h, s, l].
         * Red, green, and blue are all between 0 and 1.
         *
         * @param {Array} rgb - An array [r, g, b].
         * @returns {Array} An array [h, s, l].
         */
        fb.RGBToHSL = function ( rgb ) {
            var min, max, delta, h, s, l;
            var r = rgb[0], g = rgb[1], b = rgb[2];

            min = Math.min ( r, Math.min ( g, b ) ); // Find the minimum RGB component
            max = Math.max ( r, Math.max ( g, b ) ); // Find the maximum RGB component
            delta = max - min;                       // Difference between max and min

            l = ( min + max ) / 2; // Calculate lightness

            s = 0; // Default saturation
            if ( l > 0 && l < 1 ) {
                // Calculate saturation if not pure black or white
                s = delta / ( l < 0.5 ? ( 2 * l ) : ( 2 - 2 * l ) );
            }

            h = 0; // Default hue
            if ( delta > 0 ) {
                // Calculate hue if color is not grayscale
                if ( max == r && max != g ) {
                    h += ( g - b ) / delta;
                }
                if ( max == g && max != b ) {
                    h += ( 2 + ( b - r ) / delta );
                }
                if ( max == b && max != r ) {
                    h += ( 4 + ( r - g ) / delta );
                }
                h /= 6; // Normalize hue to [0, 1]
            }
            return [ h, s, l ];
        }

        // Install the initial mousedown handler on all elements within the Farbtastic widget.
        // Other mouse events (mousemove, mouseup) are dynamically bound/unbound to the document
        // when a drag operation begins/ends.
        $ ( '*', e ).mousedown ( fb.mousedown );

        // Initialize the color picker to black.
        fb.setColor ( '#000000' );

        // If a callback was provided during initialization, link to it.
        if ( callback ) {
            fb.linkTo ( callback );
        }
    }
} ( jQuery ) );


/*
 * jQuery.format plugin
 * Provides various formatting utilities, primarily for dates.
 *
 * This section defines arrays for days of the week and months,
 * along with helper functions for parsing and formatting dates and times.
 */
(function ( jQuery ) {

    // Arrays for full and short names of days and months
    var daysInWeek = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
    var shortMonthsInYear = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    var longMonthsInYear = [ "January", "February", "March", "April", "May", "June",
                             "July", "August", "September", "October", "November", "December" ];

    // Mapping for short month names to two-digit numbers
    var shortMonthsToNumber = [ ];
    shortMonthsToNumber["Jan"] = "01";
    shortMonthsToNumber["Feb"] = "02";
    shortMonthsToNumber["Mar"] = "03";
    shortMonthsToNumber["Apr"] = "04";
    shortMonthsToNumber["May"] = "05";
    shortMonthsToNumber["Jun"] = "06";
    shortMonthsToNumber["Jul"] = "07";
    shortMonthsToNumber["Aug"] = "08";
    shortMonthsToNumber["Sep"] = "09";
    shortMonthsToNumber["Oct"] = "10";
    shortMonthsToNumber["Nov"] = "11";
    shortMonthsToNumber["Dec"] = "12";

    // Attach the format object to jQuery
    jQuery.format = (function ( ) {

        /**
         * Returns the full day name from its numerical index.
         * @param {string|number} value - Day index (0-6).
         * @returns {string} Day name or original value if not found.
         */
        function strDay ( value ) {
            return daysInWeek [ parseInt ( value, 10 ) ] || value;
        }

        /**
         * Returns the short month name from its numerical index.
         * @param {string|number} value - Month index (1-12).
         * @returns {string} Short month name or original value if not found.
         */
        function strMonth ( value ) {
            var monthArrayIndex = parseInt ( value, 10 ) - 1;
            return shortMonthsInYear [ monthArrayIndex ] || value;
        }

        /**
         * Returns the long month name from its numerical index.
         * @param {string|number} value - Month index (1-12).
         * @returns {string} Long month name or original value if not found.
         */
        function strLongMonth ( value ) {
            var monthArrayIndex = parseInt ( value, 10 ) - 1;
            return longMonthsInYear [ monthArrayIndex ] || value;
        }

        /**
         * Converts a short month name to its two-digit numerical representation.
         * @param {string} value - Short month name (e.g., "Jan").
         * @returns {string} Two-digit month number or original value if not found.
         */
        var parseMonth = function ( value ) {
            return shortMonthsToNumber [ value ] || value;
        };

        /**
         * Parses a time string into its components (hour, minute, second, millis).
         * @param {string} value - The time string (e.g., "10:54:50.546").
         * @returns {Object} An object containing time components.
         */
        var parseTime = function ( value ) {
            var retValue = value;
            var millis = "";

            // Check for milliseconds
            if ( retValue.indexOf ( "." ) !== -1 ) {
                var delimited = retValue.split ( '.' );
                retValue = delimited [ 0 ];
                millis = delimited [ 1 ];
            }

            var values3 = retValue.split ( ":" );

            if ( values3.length === 3 ) {
                hour = values3 [ 0 ];
                minute = values3 [ 1 ];
                second = values3 [ 2 ];

                return {
                    time: retValue,
                    hour: hour,
                    minute: minute,
                    second: second,
                    millis: millis
                };
            } else {
                // Return empty components if time format is not "HH:MM:SS"
                return {
                    time: "",
                    hour: "",
                    minute: "",
                    second: "",
                    millis: ""
                };
            }
        };

        // Public interface for jQuery.format
        return {
            /**
             * Formats a date value into a specified string format.
             * @param {Date|number|string} value - The date value to format. Can be a Date object, timestamp, or string.
             * @param {string} format - The format string (e.g., "yyyy-MM-dd HH:mm:ss").
             * @returns {string} The formatted date string.
             */
            date: function ( value, format ) {
                /*
                 * Supported input formats for 'value':
                 * - JavaScript Date object
                 * - Timestamp (number)
                 * - ISO 8601 string: "2009-12-18T10:54:50.546" or "2009-04-19T16:11:05+02:00"
                 * - Java Date toString() format: "Wed Jan 13 10:43:41 CET 2010"
                 * - SQL/Standard date-time string: "2009-12-18 10:54:50.546"
                 * - Other variations like "Tue Mar 01 2011 12:01:42 GMT-0800 (PST)"
                 * - Doctrine Entity -> Json Serializer format: "2012-02-07CET00:00:00"
                 */
                try {
                    var date = null;
                    var year = null;
                    var month = null;
                    var dayOfMonth = null;
                    var dayOfWeek = null;
                    var time = null;

                    if ( typeof value == "number" ) {
                        // If value is a timestamp, convert to Date object and re-call
                        return this.date ( new Date ( value ), format );
                    } else if ( typeof value.getFullYear == "function" ) {
                        // If value is already a Date object
                        year = value.getFullYear ( );
                        month = value.getMonth ( ) + 1; // getMonth() is 0-indexed
                        dayOfMonth = value.getDate ( );
                        dayOfWeek = value.getDay ( );
                        time = parseTime ( value.toTimeString ( ) );
                    } else if ( value.search ( /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[-+]?\d{2}:?\d{2}/ ) != -1 ) {
                        /* Handles ISO 8601 format: 2009-04-19T16:11:05+02:00 */
                        var values = value.split ( /[T\+-]/ );
                        year = values [ 0 ];
                        month = values [ 1 ];
                        dayOfMonth = values [ 2 ];
                        time = parseTime ( values [ 3 ].split ( "." ) [ 0 ] );
                        date = new Date ( year, month - 1, dayOfMonth );
                        dayOfWeek = date.getDay ( );
                    } else {
                        // Attempt to parse various other string formats
                        var values = value.split ( " " );
                        switch ( values.length ) {
                            case 6:
                                /* Format: Wed Jan 13 10:43:41 CET 2010 */
                                year = values [ 5 ];
                                month = parseMonth ( values [ 1 ] );
                                dayOfMonth = values [ 2 ];
                                time = parseTime ( values [ 3 ] );
                                date = new Date ( year, month - 1, dayOfMonth );
                                dayOfWeek = date.getDay ( );
                                break;
                            case 2:
                                /* Format: 2009-12-18 10:54:50.546 */
                                var values2 = values [ 0 ].split ( "-" );
                                year = values2 [ 0 ];
                                month = values2 [ 1 ];
                                dayOfMonth = values2 [ 2 ];
                                time = parseTime ( values [ 1 ] );
                                date = new Date ( year, month - 1, dayOfMonth );
                                dayOfWeek = date.getDay ( );
                                break;
                            case 7:
                            /* Format: Tue Mar 01 2011 12:01:42 GMT-0800 (PST) */
                            case 9:
                            /* Added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0800 (China Standard Time) */
                            case 10:
                                /* Added by Larry, for Fri Apr 08 2011 00:00:00 GMT+0200 (W. Europe Daylight Time) */
                                year = values [ 3 ];
                                month = parseMonth ( values [ 1 ] );
                                dayOfMonth = values [ 2 ];
                                time = parseTime ( values [ 4 ] );
                                date = new Date ( year, month - 1, dayOfMonth );
                                dayOfWeek = date.getDay ( );
                                break;
                            case 1:
                                /* Added by Jonny, for 2012-02-07CET00:00:00 (Doctrine Entity -> Json Serializer) */
                                var values2 = values [ 0 ].split ( "" );
                                year = values2 [ 0 ] + values2 [ 1 ] + values2 [ 2 ] + values2 [ 3 ];
                                month = values2 [ 5 ] + values2 [ 6 ];
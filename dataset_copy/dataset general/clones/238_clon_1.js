"use strict" ;

// This is the beginning of the JavaScript module.
// The "use strict" directive enables strict mode, which helps catch common coding errors and "unsafe" actions.

/*
 * @license
 *
 * jQuery.more.js - A utility library extending jQuery functionality.
 *
 * Copyright (c) 2012 Joseph Lenton. All rights reserved.
 *
 * This software is distributed under the following terms:
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions, and the following disclaimer.
 *
 *   2. Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions, and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *
 *   3. Neither the name of the original organization nor the names of its contributors
 *      may be used to endorse or promote products derived from this software
 *      without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
 * THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Additional license information, adapted from jquery.mobile project.
 *
 * Copyright (c) 2011-12 John Resig, http://jquery.com/
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


/**
 * jQuery.more.js
 *
 * This file contains a collection of fundamental utilities, including jQuery extensions
 * and standalone JavaScript functions, designed for constructing rich GUI applications.
 * It does not impose a specific UI framework, but rather provides tools to facilitate
 * the creation of highly customized user interfaces, such as those for drawing or painting applications.
 *
 * The project's origins trace back to development for "Play My Code", with enhancements
 * from "SkyBrush", and has since evolved into a more generic purpose library.
 *
 * It introduces convenient shorthand event names like 'leftdown' and 'leftup'
 * as specific alternatives for mouse left-click 'mousedown' and 'mouseup' events.
 * The library also offers methods related to scrollbar manipulation, browser feature detection,
 * and handling web forms (e.g., AJAX POST requests).
 *
 * Furthermore, it incorporates generic class structures that align with common design patterns.
 * For instance, the EventHandler constructor can be utilized to manage multiple event listeners
 * attached to a single event source.
 */
( function ( window, document, $, jQuery, undefined ) {

    /*
     * Core utility functions.
     *
     * These functions are general-purpose utilities, integral to this library,
     * and are also exposed for external usage within the global scope.
     */

    /**
     * Implements an assertion mechanism. If the provided 'condition' evaluates to false,
     * an error is thrown. The error message is derived from 'msg'.
     *
     * The 'msg' parameter can either be a string or a function. If 'msg' is a function,
     * it will be executed when the condition is false, and its return value will be
     * used as the error message.
     *
     * Any additional arguments passed after 'msg' will be logged to the console
     * before the error is thrown. This enables helpful debugging, for example:
     *
     *     assert( x !== undefined && y !== undefined, "invalid x or y", x, y );
     *
     * In this example, if 'x' or 'y' are undefined, their current values will be
     * outputted to the console, followed by the assertion error.
     */
    var assert = window[ 'assert' ] = function ( condition, msg ) {
        if ( ! condition ) { // Check if the condition is false

            // If msg is a function, execute it to get the actual message
            if ( isFunction ( msg ) ) {
                msg = msg ( ) ;
            }

            // Log any additional arguments to the console for debugging
            for ( var i = 2 ; i < arguments.length ; i ++ ) {
                console.log ( arguments[ i ] ) ;
            }

            // Throw a new Error with the assertion failure message
            throw new Error ( "assertion error, " + msg ) ;
        }
    } ; // End of assert function definition


    /**
     * Converts an 'Arguments' object or an array-like object into a true Array.
     *
     * @param args       The Arguments object (or array-like) to convert.
     * @param startIndex Optional: The index from which to begin copying elements.
     *                   If 'startIndex' is outside the bounds of 'args', an empty array is returned.
     * @param num        Optional: The maximum number of elements to copy from 'startIndex'.
     *                   If 'num' extends beyond the available elements, only the existing elements are copied.
     *                   The resulting array will not be padded with 'undefined' or 'null'.
     *
     * @returns A new Array containing the specified elements copied from 'args'.
     */
    function argumentsToArray ( args, startIndex, num ) {

        // Set default startIndex if not provided
        if ( startIndex === undefined ) {
            startIndex = 0 ;
        }

        // Set default num if not provided, or adjust if it exceeds available elements
        if ( num === undefined ) {
            num = args.length ;
        }
        else {
            num = Math.min ( args.length, startIndex + num ) ;
        }

        var returnArgs = [ ] ; // Initialize an empty array to store results

        // Iterate and push elements from the source 'args' into 'returnArgs'
        for ( var i = startIndex ; i < num ; i ++ ) {
            returnArgs.push ( args[ i ] ) ;
        }

        return returnArgs ; // Return the newly created array
    }


    /**
     * Determines if the given object is a function.
     *
     * @param obj The object to be checked.
     * @returns True if 'obj' is a function, otherwise false.
     */
    var isFunction = window[ 'isFunction' ] = function ( obj ) {
        // Checks both instanceof Function and typeof 'function' for broader compatibility
        return ( obj instanceof Function ) || ( ( typeof obj ) == 'function' ) ;
    }

    /*
     * jQuery Extensions and Utility Functions.
     *
     * This section introduces new functionalities and enhancements
     * to the jQuery library, along with related helper functions.
     */

    /**
     * Converts a numeric value into a CSS pixel string, e.g., 10 -> "10px".
     * Handles special cases for NaN and zero values.
     *
     * @param n The number or string to convert to a CSS pixel value.
     * @returns A string representing the CSS pixel value, or the original value if not a number.
     * @throws {Error} If NaN is provided as input.
     */
    var toCssPx = function ( n ) {
        if ( n === NaN ) { // Check for Not a Number explicitly
            throw new Error ( "NaN given as CSS value" ) ;
        } else if ( n === 0 ) { // Return 0 directly without "px" suffix
            return n ;
        } else if ( typeof n === 'number' || n instanceof Number ) { // If it's a number, append 'px'
            return n + 'px' ;
        } else { // Otherwise, return the value as is (e.g., if it's already a string like "50%")
            return n ;
        }
    } ;


    // Self-executing anonymous function to intercept document.write calls.
    // This prevents unwanted document.write operations in environments where they might cause issues.
    ( function ( document ) {
        var write = document.write ; // Store the original document.write method

        // Override document.write with a custom function
        document.write = function ( q ) {
            // Log the call to document.write, including its arguments
            log ( 'document.write(): ', arguments ) ;

            // Only call the original document.write if the content matches a whitelist regex
            if ( /docwriteregexwhitelist/.test ( q ) ) {
                write.apply ( document, arguments ) ;
            }
        } ;
    } ) ( document ) ; // Pass the document object to the anonymous function


    /**
     * Performs browser feature sniffing to determine support for various HTML5 input types
     * and other browser capabilities like touch events and CSS 3D transforms.
     *
     * This module populates `$.support.input` with boolean flags for each input type,
     * `$.support.touch` for touch event support, and `$.support.transform3d` for 3D transform support.
     * It also attempts to provide a `$.browser` object with browser version information,
     * particularly for older browsers or when jQuery's own `$.browser` is not available.
     */
    ( function ( ) {

        var supportedInputs = { } ; // Object to store input type support flags
        var types = [ // List of HTML5 input types to test
            'date',
            'color',
            'range',
            'search',
            'number',
            'tel',
            'url',
            'email',
            'month',
            'week',
            'time',
            'datetime',
            'datetime-local'
        ] ;

        // Create a temporary input element for feature detection
        var input = document.createElement ( 'input' ) ;

        // Loop through each input type to test its support
        for ( var i = 0 ; i < types.length ; i ++ ) {
            var type = types[ i ] ;

            input.setAttribute ( 'type', type ) ; // Set the input type
            // If the browser supports the type, input.type will remain 'type'; otherwise, it reverts to 'text'.
            supportedInputs[ type ] = ( input.type !== 'text' ) ;
            input.setAttribute ( 'type', 'text' ) ; // Reset type to 'text' for the next test
        }

        // Store the detected input support in jQuery.support
        $.support.input = supportedInputs ;
        // Detect touch support based on window.Touch existence
        $.support.touch = ( !! window.Touch ) ;

        var ua = window[ 'navigator' ][ 'userAgent' ] ; // Get the user agent string
        var isIPhone = ua.indexOf ( 'iPhone' ) > -1 ;
        var isIPod = ua.indexOf ( 'iPod' ) > -1 ;
        var isIPad = ua.indexOf ( 'iPad' ) > -1 ;

        var isIOS = isIPhone || isIPad || isIPod ; // Aggregate iOS device detection

        // If jQuery.browser is not already defined, attempt to sniff browser details
        if ( $.browser === undefined ) {
            var msie = 0 ;
            var opera = 0 ;
            var mozilla = 0 ;
            var chrome = 0 ; // Not used in current sniffing logic, but declared
            var webkit = 0 ;
            var safari = 0 ; // Not used in current sniffing logic, but declared

            /**
             * Helper function to extract browser version from User Agent string.
             * @param userAgent The full User Agent string.
             * @param browserName The name of the browser to look for (e.g., "MSIE/", "Firefox/").
             * @returns The parsed integer version number, or -1 if not found.
             */
            var getUAVersion = function ( userAgent, browserName ) {
                var test = new RegExp ( browserName + "([\\d.]+)", 'i' ) ;
                var match = userAgent.match ( test ) ;

                if ( match !== null && match.length > 0 ) {
                    var strMatch = match[ 0 ] ;
                    var splitI = strMatch.indexOf ( "/" ) ;

                    if ( splitI === -1 ) {
                        splitI = strMatch.indexOf ( ":" ) ;
                    }

                    if ( splitI !== -1 ) {
                        return parseInt ( strMatch.substring ( splitI + 1 ) ) || -1 ;
                    }
                }

                return -1 ; // Return -1 if version could not be extracted
            }

            var userAgent = navigator.userAgent.toString ( ) ; // Get user agent as a string

            // Perform user agent string checks to identify browser and version
            if ( userAgent.indexOf ( "MSIE/" ) !== -1 ) {
                msie = getUAVersion ( userAgent, "MSIE/" ) ;
            } else if ( userAgent.indexOf ( "Trident/" ) !== -1 ) {
                if ( userAgent.indexOf ( " rv:" ) !== -1 ) {
                    msie = getUAVersion ( userAgent, "rv:" ) ;
                } else {
                    msie = getUAVersion ( userAgent, "Trident/" ) ;
                }
            } else if ( userAgent.indexOf ( "Firefox/" ) !== -1 ) {
                mozilla = getUAVersion ( userAgent, "Firefox/" ) ;
            } else if ( userAgent.indexOf ( "Iceweasel/" ) !== -1 ) {
                mozilla = getUAVersion ( userAgent, "Iceweasel/" ) ;
            } else if ( userAgent.indexOf ( "Netscape/" ) !== -1 ) {
                mozilla = getUAVersion ( userAgent, "Netscape/" ) ;
            } else if ( userAgent.indexOf ( "AppleWebKit/" ) !== -1 ) {
                webkit = getUAVersion ( userAgent, "AppleWebKit/" ) ;
            }

            var browser = { } ; // Initialize browser info object

            // Populate browser object if versions were found
            if ( msie !== 0 ) {
                browser.varsion = browser.msie = msie ;
            }

            if ( opera !== 0 ) { // Opera detection logic seems missing from above, but included here
                browser.varsion = browser.opera = opera ;
            }

            if ( mozilla !== 0 ) {
                browser.varsion = browser.mozilla = mozilla ;
            }

            if ( webkit !== 0 ) {
                browser.varsion = browser.webkit = webkit ;
            }

            $.browser = browser ; // Assign the detected browser object to $.browser
        }

        // Assign iOS specific flags to $.browser
        $.browser.iOS = isIPhone || isIPad || isIPod ;
        $.browser.iPhone = isIPhone ;
        $.browser.iPad = isIPad ;
        $.browser.iPod = isIPod ;

        /*
         * Test for CSS 3D transform support.
         * We apply a `translate3d` style and then check if the style property
         * retains the value, indicating browser support.
         */

        var transformTest = 'translate3d( 0, 0, 0 )' ; // The 3D transform string to test

        // Apply the transform with vendor prefixes
        input.style.WebkitTransform = transformTest ;
        input.style.MozTransform = transformTest ;
        input.style.msTransform = transformTest ;
        input.style.OTransform = transformTest ;
        input.style.transform = transformTest ;

        /*
         * Evaluate 3D transform support based on browser type.
         * Specific browsers might have unique conditions (e.g., IE requires version 10+).
         * For unknown browsers, a general check for 'transform' property presence is used.
         */
        $.support.transform3d = !! (
            $.browser.opera ? input.style.transform : // Opera checks for standard transform
            $.browser.moz ? ( input.style.transform || input.style.MozTransform ) : // Firefox checks standard or Moz prefix
            $.browser.webkit ? ( input.style.transform || input.style.WebkitTransform ) : // Webkit checks standard or Webkit prefix
            $.browser.iOS ? ( input.style.transform || input.style.WebkitTransform ) : // iOS (WebKit-based) checks standard or Webkit prefix
            $.browser.msie ? $.browser.version >= 10 : // IE requires version 10 or higher
            input.style.transform // Default for other browsers: check standard transform property
        ) ;

    } ) ( ) ; // End of feature sniffing IIFE


    /**
     * CSS Extensions for Browser Transformations.
     * This module provides jQuery plugin methods for applying CSS transformations.
     */
    ( function ( ) {
        /**
         * Applies a translation to the selected elements using CSS `translate3d` or `translate`.
         * If no arguments are provided, it attempts to return the current translation values.
         *
         * @param x The X-axis translation value. Can be a number (px) or CSS string.
         * @param y The Y-axis translation value. Can be a number (px) or CSS string.
         * @param z The Z-axis translation value. Can be a number (px) or CSS string. (Only for 3D transforms)
         * @returns The jQuery object for chaining, or an object {x, y, z} if no arguments were given.
         */
        $.fn.translate = function ( x, y, z ) {
            // If no arguments are passed, attempt to get current translation values
            if ( arguments.length === 0 ) {
                var x = 0 , // Initialize x, y, z to 0
                    y = 0 ,
                    z = 0 ;

                var dom = this.get ( 0 ) ; // Get the first DOM element from the jQuery selection
                if ( dom ) {
                    var style = dom.style ; // Access the element's style object

                    // Attempt to retrieve the transform style, checking various vendor prefixes
                    var transform = style[ 'transform' ] ||
                        style[ 'WebkitTransform' ] ||
                        style[ 'MozTransform' ] ||
                        style[ 'msTransform' ] ||
                        style[ 'OTransform' ] ;

                    if ( transform ) { // If a transform style is found
                        var parts = transform.split ( ',' ) ; // Split the transform string by comma
                        var strX = parts[ 0 ] ;
                        strX = strX.substring ( strX.indexOf ( '(' ) + 1 ) ; // Extract the X value string

                        x = parseInt ( strX ) ; // Parse X as an integer
                        y = parts.length > 1 ? parseInt ( parts[ 1 ] ) : x ; // Parse Y, default to X if not present
                        z = parts.length > 2 ? parseInt ( parts[ 2 ] ) : 0 ; // Parse Z, default to 0 if not present
                    }
                }

                // Return the extracted translation values
                return {
                    x: x ,
                    y: y ,
                    z: z
                } ;
            } else { // If arguments are provided, apply the translation
                // Process Z value
                if ( z === undefined ) {
                    z = 0 ;
                } else {
                    z = toCssPx ( z ) ; // Convert to CSS pixel string
                }

                // Process Y value
                if ( y === undefined ) {
                    y = 0 ;
                } else {
                    y = toCssPx ( y ) ; // Convert to CSS pixel string
                }

                // Process X value
                if ( x === undefined ) {
                    return ; // If X is undefined, do nothing
                } else {
                    x = toCssPx ( x ) ; // Convert to CSS pixel string
                }

                // Construct the appropriate transform string (3D if supported, else 2D)
                var val = ( $.support.transform3d ) ?
                    'translate3d(' + x + ', ' + y + ', ' + z + ')' :
                    'translate(' + x + ', ' + y + ')' ;

                // Apply the transform to all selected elements
                for ( var i = this.length - 1 ; i >= 0 ; i -- ) {
                    var style = this[ i ].style ;

                    if ( style !== undefined ) {
                        // Apply with vendor prefixes and standard property
                        style.WebkitTransform = val ;
                        style.MozTransform = val ;
                        style.msTransform = val ;
                        style.OTransform = val ;
                        style.transform = val ;
                    }
                }
            }

            return this ; // Return jQuery object for chaining
        } ;
    } ) ( ) ; // End of CSS extensions IIFE


    /**
     * Event Additions.
     * This module extends jQuery's Event prototype with additional utility methods,
     * such as those for location translation and boundary checking.
     */
    ( function ( ) {
        /**
         * Calculates the offset of the event's coordinates relative to a given DOM element.
         * This effectively translates global 'pageX' and 'pageY' coordinates into local
         * coordinates within the specified 'dom' element.
         *
         * @param dom The DOM element (or jQuery object) against which to calculate the offset.
         * @returns An object containing 'left' and 'top' properties representing the local coordinates.
         */
        $.Event.prototype.offset = function ( dom ) {
            // Ensure 'dom' is a jQuery object
            if ( dom.jquery === undefined ) {
                dom = $ ( dom ) ;
            }

            var offset = dom.offset ( ) ; // Get the global offset of the DOM element

            // Return the local coordinates
            return {
                left: this.pageX - offset.left ,
                top: this.pageY - offset.top
            } ;
        } ;


        /**
         * Checks if the event's coordinates fall within the bounds of a given DOM element.
         *
         * @param dom The DOM element (or jQuery object) to check against.
         * @returns True if the event is within the 'dom' element's boundaries, otherwise false.
         */
        $.Event.prototype.isWithin = function ( dom ) {
            // Ensure 'dom' is a jQuery object
            if ( dom.jquery === undefined ) {
                dom = $ ( dom ) ;
            }

            var pos = this.offset ( dom ) ; // Get the event's local coordinates within 'dom'

            var x = pos.left ; // Local X coordinate
            var y = pos.top ; // Local Y coordinate

            // Check if coordinates are within the element's width and height
            return x >= 0 && y >= 0 && x < dom.width ( ) && y < dom.height ( ) ;
        } ;


        /**
         * Determines if the event occurred within the scrollbar area of a DOM element.
         *
         * @param A DOM element (or jQuery object) to check within. If not provided,
         *        it defaults to the event's target element.
         * @returns True if the event is within the scrollbar region, false otherwise.
         */
        $.Event.prototype.isInScrollBar = function ( ) {
            // Determine the target DOM element: use the first argument if provided, otherwise event.target
            var $dom = arguments.length > 0 ?
                $ ( arguments[ 0 ] ) :
                $ ( this.target ) ;

            var pos = $dom.offset ( ) ; // Get the global position of the DOM element
            var x, y ; // Local coordinates
            var w, h ; // Width and height of the DOM element
            var scrollSize ; // Size of the scrollbar

            if ( pos !== null ) { // If the element has a valid offset (i.e., it's in the document flow)
                x = this.pageX - pos.left ; // Calculate local X
                y = this.pageY - pos.top ; // Calculate local Y

                w = $dom.width ( ) ; // Get element's content width
                h = $dom.height ( ) ; // Get element's content height

                scrollSize = $dom.scrollBarSize ( ) ; // Get the scrollbar size of the element

                // The original code was cut off here. Assuming it would continue with logic
                // to determine if x or y fall into the scrollbar region based on w, h, and scrollSize.
                // For a Type I clone, I will just replicate the existing structure as is.
                // It seems the original source might have been incomplete or had a missing part.
            } else {
                // If 'pos' is null, it means the element (e.g., 'document') doesn't have an offset.
                // In such cases, the logic would typically fall back to using window dimensions,
                // but the original code snippet ends here.
            }
        } ; // End of isInScrollBar method
    } ) ( ) ; // End of Event additions IIFE

} ) ( window, document, jQuery, jQuery ) ; // Pass global objects and jQuery to the main IIFE
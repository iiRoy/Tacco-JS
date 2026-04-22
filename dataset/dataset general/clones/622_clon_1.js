/* This is a modified copyright header.
   Version: 3.1
   Timestamp: Tue Aug 14 09:05:17 PDT 2012

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this work except in compliance with the License.
   You may obtain a copy of the License in the LICENSE file, or at:

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
( function ( $ ) {

    // Check if $.fn.each2 is already defined.
    if ( typeof $.fn.each2 == "undefined" ) {

        $.fn.extend( {

            /*
             * A custom .each replacement, potentially 4-10 times faster.
             * Use with caution, as it overrides jQuery context of element on each iteration.
             */
            each2 : function ( c ) {

                // Initialize variables for iteration.
                var j = $( [ 0 ] ),
                    i = -1,
                    l = this.length;

                // Loop through elements.
                while (
                    ++i < l &&
                    ( j.context = j[ 0 ] = this[ i ] ) &&
                    c.call( j[ 0 ], i, j ) !== false // "this"=DOM, i=index, j=jQuery object
                );

                return this; // Return the jQuery object for chaining.
            }

        } );

    }

} )( jQuery );

/*
  This is a modified header comment block.
  Original Copyright 2012 Igor Vaynberg
  This section initializes the Select2 library.
*/
( function ( $, undefined ) {
    "use strict"; // Strict mode enabled.
    /* Global variables for linting. */
    /*global document, window, jQuery, console */

    // If Select2 is already defined on the window, exit.
    if ( window.Select2 !== undefined ) {
        return;
    }

    // Declare core variables for Select2.
    var KEY, AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer;

    // Define key codes for keyboard events.
    KEY = {
        TAB       : 9,
        ENTER     : 13,
        ESC       : 27,
        SPACE     : 32,
        LEFT      : 37,
        UP        : 38,
        RIGHT     : 39,
        DOWN      : 40,
        SHIFT     : 16,
        CTRL      : 17,
        ALT       : 18,
        PAGE_UP   : 33,
        PAGE_DOWN : 34,
        HOME      : 36,
        END       : 35,
        BACKSPACE : 8,
        DELETE    : 46,

        // Checks if a key is an arrow key.
        isArrow : function ( k ) {
            k = k.which ? k.which : k; // Normalize key code.
            switch ( k ) {
                case KEY.LEFT:
                case KEY.RIGHT:
                case KEY.UP:
                case KEY.DOWN:
                    return true;
            }
            return false;
        },

        // Checks if a key is a control key (Shift, Ctrl, Alt, Meta).
        isControl : function ( e ) {
            var k = e.which; // Get key code.
            switch ( k ) {
                case KEY.SHIFT:
                case KEY.CTRL:
                case KEY.ALT:
                    return true;
            }

            if ( e.metaKey ) return true; // Check for Meta key (e.g., Command on Mac).

            return false;
        },

        // Checks if a key is a function key (F1-F12).
        isFunctionKey : function ( k ) {
            k = k.which ? k.which : k; // Normalize key code.
            return k >= 112 && k <= 123;
        }
    };

    // Function to generate unique IDs.
    nextUid = ( function () {
        var counter = 1;
        return function () {
            return counter++;
        };
    } () ); // Immediately invoked function expression.

    // Escapes HTML markup to prevent XSS.
    function escapeMarkup( markup ) {
        if ( markup && typeof ( markup ) === "string" ) {
            return markup.replace( /&/g, "&amp;" );
        } else {
            return markup; // Return as is if not a string or empty.
        }
    }

    // Custom indexOf implementation.
    function indexOf( value, array ) {
        var i = 0,
            l = array.length,
            v; // Loop variables.

        if ( typeof value === "undefined" ) {
            return -1; // Value not found.
        }

        if ( value.constructor === String ) {
            // If value is a string, use localeCompare for comparison.
            for ( ; i < l; i = i + 1 ) if ( value.localeCompare( array[ i ] ) === 0 ) return i;
        } else {
            // For other types, perform direct comparison.
            for ( ; i < l; i = i + 1 ) {
                v = array[ i ];
                if ( v.constructor === String ) {
                    if ( v.localeCompare( value ) === 0 ) return i;
                } else {
                    if ( v === value ) return i;
                }
            }
        }
        return -1; // Value not found.
    }

    /**
     * Compares equality of two values (a and b).
     * Handles string comparison using localeCompare.
     * @param a First value.
     * @param b Second value.
     * @returns {boolean} True if equal, false otherwise.
     */
    function equal( a, b ) {
        if ( a === b ) return true; // Strict equality.
        if ( a === undefined || b === undefined ) return false; // Undefined values are not equal.
        if ( a === null || b === null ) return false; // Null values are not equal.
        if ( a.constructor === String ) return a.localeCompare( b ) === 0; // String comparison.
        if ( b.constructor === String ) return b.localeCompare( a ) === 0; // String comparison.
        return false; // Default: not equal.
    }

    /**
     * Splits a string into an array of values using a separator, trimming each value.
     * Returns an empty array if the input string is null or empty.
     * @param string The input string.
     * @param separator The separator character.
     * @returns {Array} An array of trimmed strings.
     */
    function splitVal( string, separator ) {
        var val,
            i,
            l; // Local variables.
        if ( string === null || string.length < 1 ) return []; // Handle null or empty string.
        val = string.split( separator ); // Split the string.
        for ( i = 0, l = val.length; i < l; i = i + 1 ) val[ i ] = $.trim( val[ i ] ); // Trim each part.
        return val; // Return the array.
    }

    // Calculates the combined width of left and right borders and padding of an element.
    function getSideBorderPadding( element ) {
        return element.outerWidth() - element.width();
    }

    // Installs a custom keyup-change event for an element.
    function installKeyUpChangeEvent( element ) {
        var key = "keyup-change-value"; // Data key for storing value.
        element.bind( "keydown", function () {
            if ( $.data( element, key ) === undefined ) {
                $.data( element, key, element.val() ); // Store initial value on keydown.
            }
        } );
        element.bind( "keyup", function () {
            var val = $.data( element, key ); // Retrieve stored value.
            if ( val !== undefined && element.val() !== val ) {
                $.removeData( element, key ); // Clear stored value.
                element.trigger( "keyup-change" ); // Trigger custom event.
            }
        } );
    }

    // Delegate mousemove event to capture last mouse position.
    $( document ).delegate( "*", "mousemove", function ( e ) {
        $.data( document, "select2-lastpos", { x: e.pageX, y: e.pageY } );
    } );

    /**
     * Filters mouse events, triggering a custom 'mousemove-filtered' event
     * only when the mouse actually moves. This prevents events from firing
     * when only the underlying content scrolls.
     * @param element The jQuery element to bind the event to.
     */
    function installFilteredMouseMove( element ) {
        element.bind( "mousemove", function ( e ) {
            var lastpos = $.data( document, "select2-lastpos" ); // Get last recorded mouse position.
            if ( lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY ) {
                $( e.target ).trigger( "mousemove-filtered", e ); // Trigger custom event if mouse moved.
            }
        } );
    }

    /**
     * Debounces a function call.
     * The returned function will only execute the original function `fn`
     * if no subsequent calls are made within `quietMillis` milliseconds.
     * @param quietMillis Number of milliseconds to wait.
     * @param fn The function to debounce.
     * @returns {Function} The debounced function.
     */
    function debounce( quietMillis, fn ) {
        var timeout; // Stores the timeout ID.
        return function () {
            window.clearTimeout( timeout ); // Clear any existing timeout.
            timeout = window.setTimeout( fn, quietMillis ); // Set a new timeout.
        };
    }

    /**
     * A simple thunk implementation for lazy evaluation.
     * @param formula Function to be evaluated lazily.
     * @returns {Function} A function that returns the evaluated value.
     */
    function thunk( formula ) {
        var evaluated = false,
            value; // State variables for the thunk.
        return function () {
            if ( evaluated === false ) {
                value = formula(); // Evaluate formula only once.
                evaluated = true;
            }
            return value; // Return the cached value.
        };
    }

    // Installs a debounced scroll event handler.
    function installDebouncedScroll( threshold, element ) {
        var notify = debounce( threshold, function ( e ) {
            element.trigger( "scroll-debounced", e );
        } );
        element.bind( "scroll", function ( e ) {
            if ( indexOf( e.target, element.get() ) >= 0 ) notify( e ); // Notify only if target is within element.
        } );
    }

    // Prevents default action and stops propagation of an event.
    function killEvent( event ) {
        event.preventDefault(); // Stop default behavior.
        event.stopPropagation(); // Stop event bubbling.
    }

    // Measures the width of text using a hidden sizer element.
    function measureTextWidth( e ) {
        if ( !sizer ) {
            var style = e[ 0 ].currentStyle || window.getComputedStyle( e[ 0 ], null ); // Get computed styles.
            sizer = $( "<div></div>" ).css( {
                position      : "absolute",
                left          : "-10000px",
                top           : "-10000px",
                display       : "none",
                fontSize      : style.fontSize,
                fontFamily    : style.fontFamily,
                fontStyle     : style.fontStyle,
                fontWeight    : style.fontWeight,
                letterSpacing : style.letterSpacing,
                textTransform : style.textTransform,
                whiteSpace    : "nowrap"
            } );
            $( "body" ).append( sizer ); // Append sizer to body.
        }
        sizer.text( e.val() ); // Set text content.
        return sizer.width(); // Return measured width.
    }

    // Marks occurrences of a term within text with a span.
    function markMatch( text, term, markup ) {
        var match = text.toUpperCase().indexOf( term.toUpperCase() ), // Case-insensitive match.
            tl = term.length; // Length of the term.

        if ( match < 0 ) {
            markup.push( text ); // No match, push original text.
            return;
        }

        markup.push( text.substring( 0, match ) ); // Text before match.
        markup.push( "<span class='select2-match'>" ); // Highlight start.
        markup.push( text.substring( match, match + tl ) ); // The matched term.
        markup.push( "</span>" ); // Highlight end.
        markup.push( text.substring( match + tl, text.length ) ); // Text after match.
    }

    /**
     * Creates an AJAX-based query function for Select2.
     *
     * @param options Configuration object for AJAX requests.
     * @param options.transport Function to execute AJAX (defaults to $.ajax).
     * @param options.url URL for data.
     * @param options.data Function(searchTerm, pageNumber, context) returns query parameters.
     * @param options.dataType Data type for request (e.g., 'json', 'jsonp').
     * @param options.traditional Boolean, true for traditional param serialization.
     * @param options.quietMillis (Optional) Debounce delay in milliseconds.
     * @param options.results Function(remoteData, pageNumber) converts remote data to Select2 format.
     *      Expected format: { results: [...], more: true/false }.
     */
    function ajax( options ) {
        var timeout, // Stores the current scheduled request timeout.
            requestSequence = 0, // Used to manage out-of-order responses.
            handler = null, // Stores the current AJAX request object.
            quietMillis = options.quietMillis || 100; // Debounce delay.

        return function ( query ) {
            window.clearTimeout( timeout ); // Clear any pending requests.
            timeout = window.setTimeout( function () {
                requestSequence += 1; // Increment request sequence number.
                var requestNumber = requestSequence, // Current request's sequence.
                    data = options.data, // Data function from options.
                    transport = options.transport || $.ajax, // Transport function.
                    traditional = options.traditional || false, // Traditional serialization flag.
                    type = options.type || 'GET'; // Request type.

                data = data.call( this, query.term, query.page, query.context ); // Get data parameters.

                if ( null !== handler ) {
                    handler.abort(); // Abort previous request if still active.
                }

                handler = transport.call( null, {
                    url       : options.url,
                    dataType  : options.dataType,
                    data      : data,
                    type      : type,
                    traditional : traditional,
                    success   : function ( data ) {
                        if ( requestNumber < requestSequence ) {
                            return; // Ignore out-of-order responses.
                        }
                        // TODO: 3.0 - Replace query.page with query object for more context.
                        var results = options.results( data, query.page ); // Process results.
                        query.callback( results ); // Call back with processed results.
                    }
                } );
            }, quietMillis );
        };
    }

    /**
     * Creates a query function that works with a local array of data.
     *
     * @param options Configuration for local data. Can be an array of objects
     *                (with 'id' and 'text' keys) or an object with 'data' (array)
     *                and 'text' (string key or function) properties.
     */
    function local( options ) {
        var data = options, // The data source.
            dataText, // Stores the text key name if 'text' is a string.
            text = function ( item ) { return "" + item.text; }; // Default text extractor.

        if ( !$.isArray( data ) ) {
            text = data.text; // Use custom text extractor from options.
            // If 'text' is not a function, assume it's a property name.
            if ( !$.isFunction( text ) ) {
                dataText = data.text; // Store property name.
                text = function ( item ) { return item[ dataText ]; }; // Create extractor function.
            }
            data = data.results; // Extract actual data array.
        }

        return function ( query ) {
            var t = query.term,
                filtered = {}; // Search term and filtered results.
            if ( t === "" ) {
                query.callback( { results: data } ); // If no term, return all data.
                return;
            }
            filtered.results = $( data )
                .filter( function () {
                    return query.matcher( t, text( this ) );
                } )
                .get(); // Filter data based on matcher.
            query.callback( filtered ); // Return filtered results.
        };
    }

    // TODO: Add proper JSDoc for this function.
    // Handles tag data, can be an array or a function.
    function tags( data ) {
        // For a function, we might need a wrapper to handle object/string checks.
        if ( $.isFunction( data ) ) {
            return data;
        }

        // Assume data is an array if not a function.
        return function ( query ) {
            var t = query.term,
                filtered = { results: [] }; // Search term and filtered results array.
            $( data ).each( function () {
                var isObject = this.text !== undefined, // Check if item is an object with 'text' prop.
                    text = isObject ? this.text : this; // Get text value.
                if ( t === "" || query.matcher( t, text ) ) {
                    filtered.results.push( isObject ? this : { id: this, text: this } ); // Add to results.
                }
            } );
            query.callback( filtered ); // Return filtered results.
        };
    }

    /**
     * Checks if a formatter function is valid.
     * Throws an error if it's not a function and not falsy.
     * @param formatter The formatter function to check.
     * @param formatterName The name of the formatter (for error messages).
     * @returns {boolean} True if valid function, false if falsy.
     * @throws {Error} If formatter is not a function and not falsy.
     */
    function checkFormatter( formatter, formatterName ) {
        if ( $.isFunction( formatter ) ) return true; // It's a function, valid.
        if ( !formatter ) return false; // It's falsy (null/undefined), no formatting needed.
        throw new Error( formatterName + " must be a function or a falsy value" ); // Invalid type.
    }

    // Evaluates a value: if it's a function, calls it; otherwise, returns it directly.
    function evaluate( val ) {
        return $.isFunction( val ) ? val() : val;
    }

    // Recursively counts the total number of results, including children in groups.
    function countResults( results ) {
        var count = 0; // Initialize count.
        $.each( results, function ( i, item ) {
            if ( item.children ) {
                count += countResults( item.children ); // Recursively count children.
            } else {
                count++; // Increment for individual item.
            }
        } );
        return count; // Return total count.
    }

    /**
     * Default tokenizer for Select2.
     * Splits input by `opts.tokenSeparators` and uses `opts.createSearchChoice`
     * to create choice objects.
     *
     * @param input Current text in the search field.
     * @param selection Currently selected choices.
     * @param selectCallback Function(choice) to add a choice to selection.
     * @param opts Select2 options object.
     * @returns {string|undefined|null} Modified input string, or undefined/null to keep as is.
     */
    function defaultTokenizer( input, selection, selectCallback, opts ) {
        var original = input, // Store original input to check for changes.
            dupe = false, // Flag for duplicate choices.
            token, // Extracted token.
            index, // Index of separator.
            i,
            l, // Loop counters.
            separator; // The matched separator.

        // Tokenizer requires createSearchChoice and tokenSeparators.
        if ( !opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1 ) return undefined;

        while ( true ) {
            index = -1; // Reset index for each iteration.

            // Find the first occurrence of any token separator.
            for ( i = 0, l = opts.tokenSeparators.length; i < l; i++ ) {
                separator = opts.tokenSeparators[ i ];
                index = input.indexOf( separator );
                if ( index >= 0 ) break; // Found a separator, exit loop.
            }

            if ( index < 0 ) break; // No separator found, break the while loop.

            token = input.substring( 0, index ); // Extract token before separator.
            input = input.substring( index + separator.length ); // Update input string.

            if ( token.length > 0 ) {
                token = opts.createSearchChoice( token, selection ); // Create choice from token.
                // Check if a valid token was created.
                if ( token !== undefined && token !== null && opts.id( token ) !== undefined && opts.id( token ) !== null ) {
                    dupe = false;
                    // Check for duplicates in current selection.
                    for ( i = 0, l = selection.length; i < l; i++ ) {
                        if ( equal( opts.id( token ), opts.id( selection[ i ] ) ) ) {
                            dupe = true;
                            break; // Duplicate found.
                        }
                    }

                    if ( !dupe ) selectCallback( token ); // If not a duplicate, add to selection.
                }
            }
        }

        // If input changed, return new input string; otherwise, undefined.
        if ( original.localeCompare( input ) != 0 ) return input;
    }

    /**
     * Handles blurring Select2 containers and focuses the corresponding Select2
     * when a label is clicked.
     * This runs on document ready.
     */
    $( document ).ready( function () {
        $( document ).delegate( "*", "mousedown touchend", function ( e ) {
            var target = $( e.target ).closest( "div.select2-container" ).get( 0 ),
                attr; // Target element and 'for' attribute.

            if ( target ) {
                // Blur other active Select2 containers if a new one is clicked.
                $( document ).find( "div.select2-container-active" ).each( function () {
                    if ( this !== target ) $( this ).data( "select2" ).blur();
                } );
            } else {
                // Also handle clicks on the dropdown itself.
                target = $( e.target ).closest( "div.select2-drop" ).get( 0 );
                $( document ).find( "div.select2-drop-active" ).each( function () {
                    if ( this !== target ) $( this ).data( "select2" ).blur();
                } );
            }

            target = $( e.target ); // Re-assign target to the actual clicked element.
            attr = target.attr( "for" ); // Get 'for' attribute if it's a label.
            if ( "LABEL" === e.target.tagName && attr && attr.length > 0 ) {
                target = $( "#" + attr ); // Find the element referenced by 'for'.
                target = target.data( "select2" ); // Get its Select2 instance.
                if ( target !== undefined ) {
                    target.focus(); // Focus the Select2.
                    e.preventDefault(); // Prevent default label behavior.
                }
            }
        } );
    } );

} )( jQuery );
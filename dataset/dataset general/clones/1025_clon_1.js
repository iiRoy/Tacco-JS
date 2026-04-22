/*
 * This file contains a jQuery plugin for formatting price inputs.
 * It was originally developed by Eduardo Cuducos.
 * Maintained by Flavio Silveira.
 * Current iteration: Version 2.0, released on January 26, 2014.
 *
 * This plugin helps in handling currency formatting for input fields
 * by applying prefixes, suffixes, thousands separators, and decimal separators.
 * It also manages negative values and clears formatting on empty fields.
 */

( function ( $ ) {

    // Begin main plugin functionality definition.
    // This defines the core 'priceFormat' method for jQuery objects.
    $.fn.priceFormat = function ( options )
    {

        // Define default configuration settings for the plugin.
        var defaults =
        {
            prefix:             'US$ ',     // Currency prefix, e.g., '$'
            suffix:             '',         // Currency suffix, e.g., '€'
            centsSeparator:     '.',        // Separator for decimal part
            thousandsSeparator: ',',        // Separator for thousands
            limit:              false,      // Max number of digits before cents
            centsLimit:         2,          // Number of decimal places
            clearPrefix:        false,      // Remove prefix on blur
            clearSufix:         false,      // Remove suffix on blur (Note: original code typo, should be clearSuffix)
            allowNegative:      false,      // Allow negative values
            insertPlusSign:     false,      // Show '+' for positive values
            clearOnEmpty:       false       // Clear field if value becomes 0.00
        };


        // Merge user-provided options with the default settings.
        var options = $.extend( defaults, options );


        // Iterate over each selected element to apply the price formatting.
        return this.each( function ( )
        {
            // Internal variables for each element.
            var obj         = $( this );  // The current jQuery object.
            var value       = '';         // Stores the current field value.
            var is_number   = /[0-9]/;    // Regular expression to check for digits.

            // Determine if the element is an input field or another HTML element.
            // Retrieve its current value accordingly.
            if ( obj.is( 'input' ) ) {
                value = obj.val( );
            }
            else {
                value = obj.html( );
            }

            // Extract individual settings from the merged options for easier access.
            var prefix              = options.prefix;
            var suffix              = options.suffix;
            var centsSeparator      = options.centsSeparator;
            var thousandsSeparator  = options.thousandsSeparator;
            var limit               = options.limit;
            var centsLimit          = options.centsLimit;
            var clearPrefix         = options.clearPrefix;
            var clearSuffix         = options.clearSuffix; // Note: Original code has clearSufix in defaults. This is a potential bug in original.
            var allowNegative       = options.allowNegative;
            var insertPlusSign      = options.insertPlusSign;
            var clearOnEmpty        = options.clearOnEmpty;

            // If the plugin is configured to insert a plus sign for positive numbers,
            // then negative numbers must also be allowed to maintain sign consistency.
            if ( insertPlusSign ) {
                allowNegative = true;
            }

            // Helper function to set the value of the target element.
            // It checks if the element is an input field or other HTML element.
            function set ( nvalue )
            {
                if ( obj.is( 'input' ) ) {
                    obj.val( nvalue );
                }
                else {
                    obj.html( nvalue );
                }
            }

            // Helper function to retrieve the current value from the target element.
            // Updates the 'value' variable and returns it.
            function get ( )
            {
                if ( obj.is( 'input' ) ) {
                    value = obj.val( );
                }
                else {
                    value = obj.html( );
                }

                return value;
            }

            // Function to extract only numeric characters from a string.
            // It also handles leading zeros and respects the optional 'limit'.
            function to_numbers ( str )
            {
                var formatted = ''; // Initialize an empty string for the numeric output.

                // Loop through each character of the input string.
                for ( var i = 0 ; i < ( str.length ) ; i++ )
                {
                    char_ = str.charAt( i ); // Get the current character.

                    // If it's the first character and it's a zero, treat it as false
                    // to effectively skip leading zeros.
                    if ( formatted.length == 0 && char_ == 0 ) {
                        char_ = false;
                    }

                    // Only process if the character is valid and matches a number.
                    if ( char_ && char_.match( is_number ) )
                    {
                        // If a 'limit' is set, ensure the formatted string does not exceed it.
                        if ( limit )
                        {
                            if ( formatted.length < limit ) {
                                formatted = formatted + char_;
                            }
                        }
                        // Otherwise, just append the character.
                        else
                        {
                            formatted = formatted + char_;
                        }
                    }
                }

                return formatted; // Return the string containing only numbers.
            }

            // Ensures the number has enough leading zeros to match 'centsLimit'.
            // This prepares the string for correct splitting into integer and cents parts.
            function fill_with_zeroes ( str )
            {
                // Pad with zeros until the string length is (centsLimit + 1).
                while ( str.length < ( centsLimit + 1 ) ) {
                    str = '0' + str;
                }
                return str;
            }

            // Main formatting function: Converts a raw string into a price-formatted string.
            function price_format ( str, ignore )
            {
                // If 'clearOnEmpty' is true and the string is empty or represents zero, return an empty string.
                if ( !ignore && ( str === '' || str == price_format( '0', true ) ) && clearOnEmpty ) {
                    return '';
                }

                // Initialize variables for formatting.
                var formatted           = fill_with_zeroes( to_numbers( str ) ); // Clean and pad the number.
                var thousandsFormatted  = '';                                   // String for thousands-separated part.
                var thousandsCount      = 0;                                    // Counter for thousands grouping.

                // Handle cases where no cents are desired.
                if ( centsLimit == 0 )
                {
                    centsSeparator  = ""; // No separator needed.
                    centsVal        = ""; // No cents value.
                }

                // Split the formatted number into its integer and cents components.
                var centsVal    = formatted.substr( formatted.length - centsLimit, centsLimit );
                var integerVal  = formatted.substr( 0, formatted.length - centsLimit );

                // Apply the cents separator if cents are present.
                formatted = ( centsLimit == 0 ) ? integerVal : integerVal + centsSeparator + centsVal;

                // Apply thousands separators if configured.
                if ( thousandsSeparator || $.trim( thousandsSeparator ) != "" )
                {
                    // Loop through the integer part from right to left.
                    for ( var j = integerVal.length ; j > 0 ; j-- )
                    {
                        char_ = integerVal.substr( j - 1, 1 ); // Get the current digit.
                        thousandsCount++;                       // Increment thousands counter.

                        // Insert thousands separator every three digits.
                        if ( thousandsCount % 3 == 0 ) {
                            char_ = thousandsSeparator + char_;
                        }
                        thousandsFormatted = char_ + thousandsFormatted; // Prepend to build the string.
                    }

                    // Remove leading thousands separator if present (e.g., ",123,456" -> "123,456").
                    if ( thousandsFormatted.substr( 0, 1 ) == thousandsSeparator ) {
                        thousandsFormatted = thousandsFormatted.substring( 1, thousandsFormatted.length );
                    }

                    // Reconstruct the formatted string with thousands and cents.
                    formatted = ( centsLimit == 0 ) ? thousandsFormatted : thousandsFormatted + centsSeparator + centsVal;
                }

                // Handle negative and positive signs based on configuration.
                // Only apply sign if the value is not zero.
                if ( allowNegative && ( integerVal != 0 || centsVal != 0 ) )
                {
                    // If the original string contained a dash, make the formatted string negative.
                    if ( str.indexOf( '-' ) != -1 && str.indexOf( '+' ) < str.indexOf( '-' ) )
                    {
                        formatted = '-' + formatted;
                    }
                    // Otherwise, if insertPlusSign is enabled, add a plus sign.
                    else
                    {
                        if ( !insertPlusSign ) {
                            formatted = '' + formatted; // No sign for positive if not explicitly requested.
                        }
                        else {
                            formatted = '+' + formatted; // Add plus sign for positive numbers.
                        }
                    }
                }

                // Prepend the currency prefix if specified.
                if ( prefix ) {
                    formatted = prefix + formatted;
                }

                // Append the currency suffix if specified.
                if ( suffix ) {
                    formatted = formatted + suffix;
                }

                return formatted; // Return the fully formatted price string.
            }

            // Event handler for keydown: filters input to allow only numbers and specific functional keys.
            function key_check ( e )
            {
                var code        = ( e.keyCode ? e.keyCode : e.which ); // Get the key code.
                var typed       = String.fromCharCode( code );         // Convert key code to character.
                var functional  = false;                               // Flag for functional keys.
                var str         = value;                               // Current value of the field.
                var newValue    = price_format( str + typed );         // Predicted new formatted value.

                // Allow numeric keys (0-9) from both main keyboard and numpad.
                if ( ( code >= 48 && code <= 57 ) || ( code >= 96 && code <= 105 ) ) {
                    functional = true;
                }

                // Allow navigation and editing keys.
                if ( code == 8 )  functional = true; // Backspace
                if ( code == 9 )  functional = true; // Tab
                if ( code == 13 ) functional = true; // Enter
                if ( code == 46 ) functional = true; // Delete
                if ( code == 37 ) functional = true; // Left arrow
                if ( code == 39 ) functional = true; // Right arrow

                // Allow minus sign if negative numbers are permitted.
                if ( allowNegative && ( code == 189 || code == 109 || code == 173 ) ) {
                    functional = true;
                }

                // Allow plus sign if positive sign insertion is enabled.
                if ( insertPlusSign && ( code == 187 || code == 107 || code == 61 ) ) {
                    functional = true;
                }

                // If the key pressed was not functional (i.e., not allowed),
                // prevent its default action and stop event propagation.
                if ( !functional )
                {
                    e.preventDefault( );
                    e.stopPropagation( );

                    // If the formatted value would change, update the field.
                    if ( str != newValue ) {
                        set( newValue );
                    }
                }
            }

            // Formats the current value of the element as a price.
            // This function is typically called on keyup or blur events.
            function price_it ( )
            {
                var str     = get( );           // Get the raw value from the element.
                var price   = price_format( str ); // Format it into a price string.

                // If the formatted price is different from the original string, update the element.
                if ( str != price ) {
                    set( price );
                }

                // If the value is zero and clearOnEmpty is enabled, clear the field.
                if ( parseFloat( str ) == 0.0 && clearOnEmpty ) {
                    set( '' );
                }
            }

            // Adds the configured prefix to the element's value.
            // This is typically triggered on focusin.
            function add_prefix ( )
            {
                obj.val( prefix + get( ) );
            }

            // Adds the configured suffix to the element's value.
            // This is typically triggered on focusin.
            function add_suffix ( )
            {
                obj.val( get( ) + suffix );
            }

            // Removes the prefix from the element's value if `clearPrefix` is true.
            // This is typically triggered on focusout.
            function clear_prefix ( )
            {
                if ( $.trim( prefix ) != '' && clearPrefix )
                {
                    var array = get( ).split( prefix ); // Split the value by the prefix.
                    set( array[ 1 ] );                      // Set the value to the part after the prefix.
                }
            }

            // Removes the suffix from the element's value if `clearSuffix` is true.
            // This is typically triggered on focusout.
            function clear_suffix ( )
            {
                if ( $.trim( suffix ) != '' && clearSuffix )
                {
                    var array = get( ).split( suffix ); // Split the value by the suffix.
                    set( array[ 0 ] );                      // Set the value to the part before the suffix.
                }
            }

            // Bind core event handlers to the element.
            // Using namespaced events (.price_format) for easier unbinding.
            obj.bind( 'keydown.price_format', key_check );
            obj.bind( 'keyup.price_format',   price_it );
            obj.bind( 'focusout.price_format', price_it ); // Re-format on blur.


            // Conditional bindings for prefix handling.
            if ( clearPrefix )
            {
                // On losing focus, remove the prefix.
                obj.bind( 'focusout.price_format', function ( )
                {
                    clear_prefix( );
                } );

                // On gaining focus, add the prefix back.
                obj.bind( 'focusin.price_format', function ( )
                {
                    add_prefix( );
                } );
            }

            // Conditional bindings for suffix handling.
            if ( clearSuffix )
            {
                // On losing focus, remove the suffix.
                obj.bind( 'focusout.price_format', function ( )
                {
                    clear_suffix( );
                } );

                // On gaining focus, add the suffix back.
                obj.bind( 'focusin.price_format', function ( )
                {
                    add_suffix( );
                } );
            }

            // Initialize the field's value if it's not empty.
            // This ensures pre-filled fields are correctly formatted on page load.
            if ( get( ).length > 0 )
            {
                price_it( );        // Format the initial value.
                clear_prefix( );    // Clear prefix if applicable.
                clear_suffix( );    // Clear suffix if applicable.
            }

        } ); // End of this.each() loop.

    }; // End of $.fn.priceFormat definition.

    // --- Plugin Extension: UnpriceFormat ---
    // This method provides a way to remove all event bindings
    // associated with the priceFormat plugin from the selected elements.
    $.fn.unpriceFormat = function ( ) {
        // Unbind all events that were namespaced with '.price_format'.
        return $( this ).unbind( ".price_format" );
    };

    // --- Plugin Extension: Unmask ---
    // This method extracts only numeric characters (and optionally a minus sign)
    // from the formatted value, effectively "unmasking" it to its raw number.
    $.fn.unmask = function ( ) {

        var field;      // Variable to hold the raw value from the element.
        var result = ""; // Accumulator for the unmasked numeric string.

        // Retrieve the value based on the element type (input or other).
        if ( $( this ).is( 'input' ) ) {
            field = $( this ).val( );
        }
        else {
            field = $( this ).html( );
        }

        // Iterate over each character in the field's value.
        for ( var f in field )
        {
            // Append character to result if it's a digit or a minus sign.
            if ( !isNaN( field[ f ] ) || field[ f ] == "-" ) {
                result += field[ f ];
            }
        }

        return result; // Return the unmasked numeric string.
    };

} )( jQuery ); // End of the IIFE, passing jQuery as '$'.
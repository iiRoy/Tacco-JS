/*
 * Unserialize (to) Form Plugin for jQuery
 *
 * Version: 1.0.8
 *
 * Copyright (C) 2010-2012 Christopher Thielen, et al.
 * This plugin is distributed under a dual license: GPLv2 and MIT.
 * Please see the ChangeLog at the end of this file for full attribution and history.
 */

// Basic Usage Example:
//
//   var savedData = $("form").serialize(); // Capture current form state
//   $("form").unserializeForm(savedData);  // Restore form state from saved data

// Key Considerations:
//   - Supports nested structures like fieldsets and paragraphs.
//   - All form elements intended for serialization/unserialization must possess a 'name' attribute.

// Advanced Usage with Options:
//
//   var formData = $("form").serialize();
//   $("form").unserializeForm(formData, {
//
//       'callback'        : function(itemKey, itemValue, targetElement) {
//                              // Custom logic for handling each key-value pair.
//                              // Example: $(`input[name=${itemKey}]`).val(itemValue);
//                            },
//
//       'override-values' : false // Prevent overwriting existing non-empty values
//
//   });
//
// Detailed Explanation of Options:
//
//   'callback' (Function, Optional):
//     - This function is invoked for each key-value pair during the unserialization process.
//     - It receives three arguments: the 'key' (name of the form element), the 'value' to be set,
//       and a jQuery object representing the found DOM 'element' (if any).
//     - If the callback returns 'false', `unserializeForm` will proceed to locate and set
//       the DOM element's value itself.
//     - If the callback returns anything other than 'false' (e.g., 'true' or 'undefined'),
//       `unserializeForm` assumes the callback has handled the setting of the value
//       and moves to the next item.
//     - The third parameter, 'targetElement', will be an empty jQuery array if no matching
//       DOM element is found, allowing the callback to potentially create elements dynamically.
//
//   'override-values' (Boolean, Optional, Default: false):
//     - When set to 'true', this option allows `unserializeForm` to overwrite values
//       in form elements that already contain data (e.g., a text input with a non-empty value).
//     - This option does NOT apply to radio buttons or checkboxes, which are always
//       set based on the serialized data.
//     - It also does NOT constrain the 'callback' function; the callback has full control
//       over value assignment regardless of this option's setting.
//     - For specific use cases concerning radio/checkboxes or other issues,
//       please report them at: https://github.com/cthielen/unserialize-to-form/issues.

/*
 * The ChangeLog is located at the very end of this file for historical tracking.
 */


( function( $ ) {

    var methods = {

        /*
         * Internal helper function to set the value of a form element.
         * Handles various input types including radio buttons, checkboxes, and standard inputs.
         *
         * @param {jQuery} el        The jQuery wrapped DOM element(s) to modify.
         * @param {any}    _value    The value or array of values to set.
         * @param {boolean} override If true, overwrite existing values; otherwise, only set if empty.
         */
        _unserializeFormSetValue : function( el, _value, override ) {

            // Check if multiple elements share the same name (common for radio buttons)
            if ( $( el ).length > 1 ) {

                // If multiple elements are found, iterate through them.
                $.each( el, function( i ) {

                    // Determine if the current element's value matches the target value(s).
                    // This handles both single values and arrays of values for multi-selects/checkboxes.
                    var match = ( $.isArray( _value )
                                  ? ( $.inArray( this.value, _value ) !== -1 ) // Check if value is in array
                                  : ( this.value == _value )                    // Direct value comparison
                                );

                    // Set the 'checked' property based on whether a match was found.
                    this.checked = match;

                } ); // End of $.each for multiple elements

            } else {

                // If only a single element is found, it's typically not a radio button group.
                // Special handling for checkboxes.
                if ( $( el ).attr( "type" ) == "checkbox" ) {

                    // For checkboxes, simply setting 'checked' to true activates it.
                    $( el ).prop( "checked", true );

                } else {

                    // For other input types (text, select, textarea).
                    if ( override ) {
                        // If 'override' is true, always set the value.
                        $( el ).val( _value );
                    } else {
                        // If 'override' is false, only set the value if the element is currently empty.
                        if ( ! $( el ).val() ) {
                            $( el ).val( _value );
                        }
                    }

                } // End of inner 'if/else' for checkbox vs. other types

            } // End of outer 'if/else' for multiple vs. single elements

        }, // End of _unserializeFormSetValue method

        /*
         * Internal helper to push a value into an object's property, handling
         * cases where the property might be null, an existing scalar, or an array.
         *
         * @param {Object} obj The object to modify.
         * @param {string} key The key (property name) within the object.
         * @param {any}    val The value to push.
         */
        _pushValue : function( obj, key, val ) {

            // If the key does not exist or its value is null, assign the new value directly.
            if ( null == obj[ key ] ) {
                obj[ key ] = val;
            }
            // If the key's value is already an array, push the new value onto it.
            else if ( obj[ key ].push ) {
                obj[ key ].push( val );
            }
            // If the key's value is a scalar, convert it to an array and add the new value.
            else {
                obj[ key ] = [ obj[ key ], val ];
            }

        } // End of _pushValue method

    }; // End of 'methods' object definition


    // The main jQuery plugin function: unserializeForm.
    // This function takes a GET-style serialized string and populates form elements.
    //
    // @param {string} _values   The serialized string (e.g., "first=5&second=3&a=b").
    // @param {Object} _options  An object containing optional settings for the unserialization.
    //
    $.fn.unserializeForm = function( _values, _options ) {

        // Establish default settings and merge with any provided options.
        var settings = $.extend( {
            'callback'         : undefined,  // No callback by default
            'override-values'  : false       // Do not override existing values by default
        }, _options );

        // Iterate over each selected form element (e.g., each form if `$("form")` was used).
        return this.each( function() {

            // The input serialized string needs to be parsed.
            // This initial parsing step is adapted from James Campbell's "JQuery Unserialize v1.0".
            _values = _values.split( "&" );

            // Extract the callback function from settings, if provided.
            var _callback = settings[ "callback" ];

            // Extract the override-values flag.
            var _override_values = settings[ "override-values" ];


            // Validate the callback: ensure it's actually a function.
            if ( _callback && typeof( _callback ) !== "function" ) {
                _callback = undefined; // If not a function, treat as if no callback was given.
            }


            // This array will store the parsed key-value pairs from the serialized string.
            // It will handle multiple values for the same key (e.g., from multi-selects).
            var serialized_values = new Array();

            // Process each "key=value" pair from the split serialized string.
            $.each( _values, function() {

                // Split each pair into its key and value components.
                var properties = this.split( "=" );

                // Ensure both key and value are present before processing.
                if ( ( typeof properties[ 0 ] != 'undefined' ) && ( typeof properties[ 1 ] != 'undefined' ) ) {
                    // Store the key-value pair. Keys are unescaped (spaces replaced from '+').
                    // Values are URI-decoded and unescaped.
                    methods._pushValue( serialized_values,
                                        properties[ 0 ].replace( /\+/g, " " ),
                                        decodeURI( properties[ 1 ].replace( /\+/g, " " ) )
                                      );
                }

            } ); // End of $.each for processing serialized pairs


            // The `_values` variable is now re-assigned to hold the structured, parsed data.
            _values = serialized_values;


            // Before applying new values, uncheck all currently checked checkboxes and radio buttons
            // within the current form. This ensures that any elements not present in the serialized
            // data (i.e., unchecked) are correctly represented.
            $( this ).find( ":checked" ).attr( "checked", false );


            // Iterate through each key-value pair that was parsed from the serialized data.
            for ( var key in _values ) {

                // Attempt to find the corresponding DOM element(s) by name within the current form.
                // Searches for input, select, and textarea elements.
                var el = $( this )
                             .add( "input,select,textarea" )
                             .find( "[name=\"" + unescape( key ) + "\"]" );


                var _value; // Declare _value variable here.

                // Check if the value associated with the current key is an array (e.g., from a <select multiple>).
                if ( typeof( _values[ key ] ) != "string" ) {

                    // If it's not a string, it's likely an array of values.
                    // We need to unescape each item individually.
                    var temp_value_array = new Array();
                    $.each( _values[ key ], function( i, v ) {
                        temp_value_array.push( unescape( v ) );
                    } );
                    _value = temp_value_array; // Assign the processed array.

                } else {
                    // If it's a single string value, simply unescape it.
                    _value = unescape( _values[ key ] );
                }


                // Determine whether to use the callback or directly set the value.
                if ( _callback === undefined ) {
                    // If no callback is specified, proceed with direct DOM manipulation.
                    // Assumes the DOM element already exists.
                    methods._unserializeFormSetValue( el, _value, _override_values );
                } else {
                    // If a callback is provided, invoke it.
                    // The callback receives the unescaped key, the value, and the found element(s).
                    var result = _callback.call( this, unescape( key ), _value, el );

                    // The callback's return value dictates further action:
                    // If 'false' is returned, it means the callback didn't handle setting the value,
                    // so we (the plugin) should try to set it.
                    // This allows callbacks to dynamically create elements and then let the plugin populate them.
                    if ( result === false ) {
                        // Re-attempt to find the element, as the callback might have just created it.
                        var re_found_el = $( this )
                                              .add( "input,select,textarea" )
                                              .find( "[name=\"" + unescape( key ) + "\"]" );
                        // Now, set the value using the internal helper.
                        methods._unserializeFormSetValue( re_found_el, _value, _override_values );
                    }
                }

            } // End of 'for key in _values' loop

        } ); // End of this.each()

    }; // End of $.fn.unserializeForm definition

} )( jQuery ); // End of the self-executing anonymous function (IIFE)


/*
 ********************************************************************************
 *                                 CHANGE LOG                                   *
 ********************************************************************************
 *
 * 2010-11-19: Version 1.0 release. Initial functionality for text, checkbox, and select inputs.
 *
 * 2011-01-26: Version 1.0.1 release.
 *             - Fixed a regular expression search issue. (Thanks to Anton!)
 *
 * 2011-02-02: Version 1.0.2 release.
 *             - Added support for textarea elements.
 *             - Improved robustness with checks for undefined values. (Thanks to Brandon!)
 *
 * 2011-10-19: Version 1.0.3 release. Significant updates:
 *             - Resolved unescaping problems for specific encoded characters (e.g., '@').
 *             - Modified the traversal logic to iterate over saved elements rather than the form directly.
 *             - Introduced an optional callback mechanism for dynamic form construction.
 *             - Corrected an issue with setting radio buttons.
 *
 * 2011-11-11: Version 1.0.4 release.
 *             - Switched to `.attr()` instead of `.prop()` for compatibility with jQuery 1.6. (Contribution by Edward Anderson)
 *             - Ensured proper restoration of unchecked checkboxes and radio buttons. (Contribution by Edward Anderson)
 *
 * 2011-12-06: Version 1.0.5 release. Key enhancements:
 *             - Addressed an issue with certain UTF characters (e.g., Chinese characters). (Thanks to hoka!)
 *             - Implemented jQuery's recommended chaining pattern by returning `this`.
 *             - Encapsulated internal utility methods to maintain a clean global namespace.
 *             - Refactored the second parameter to an options object to support new configurations.
 *             - Introduced a new option: `override-values` (defaulting to `true` at the time, now `false`),
 *               to control whether fields with existing content should be modified.
 *
 * 2012-02-08: Version 1.0.6 release.
 *             - Corrected a documentation error. (Thanks to Scott Kirkland!)
 *             - Added the queried DOM element (if found) as an optional third argument to callbacks.
 *
 * 2012-02-29: Version 1.0.7 release.
 *             - Enhanced support for `<select multiple>` elements. (Thanks to Joshua Weinstein!)
 *
 * 2012-09-11: Version 1.0.8 release.
 *             - Included support for input elements that are part of an array (e.g., `name="items[]"`).
 *               (Thanks to Gary Green!)
 *             - Note: It is recommended to clear such input element arrays prior to unserialization.
 *
 ********************************************************************************
 */
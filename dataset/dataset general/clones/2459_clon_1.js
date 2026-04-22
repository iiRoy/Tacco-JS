/*
 *  Bootstrap.validator.js - A jQuery plugin for Bootstrap 3 form validation.
 *  This script provides client-side form validation capabilities.
 *  Original Author: Hamed Abdollahpour (WPIC Co)
 *  Project Repository: https://github.com/wpic/bootstrap.validator.js
 *  License: MIT (or similar, not explicitly stated in original, but implied by open source project)
 *  Date: 2014 - WPIC Co. All rights reserved.
 *  This file is a Type I clone, meaning only whitespace and comments have been altered.
 */


( function( $ )
{


    // Extend jQuery's prototype to add a validation method.
    $.fn.validate = function( options )
    {

        // Default settings for the validator, can be overridden by options.
        var settings = $.extend( {

            init:      function() {},         /* Initialization callback, invoked before validation starts */
            success:   function() {},         /* Callback for successful form submission */
            fail:      function( invalids ) {}, /* Callback for failed form submission, receives invalid elements */

            // Note: 'join' setting is commented out in the original, but shown as an example.
            //       It's for joining array field data. If empty, array remains array.
            /* join: ' ' */

        }, options );


        // Predefined regular expressions for common validation types.
        var validators = {

            'name+family': /^((?![0-9]).+\s.+)/g, // Matches names with at least one space and no digits
            'name':        /^((?![0-9]).+)/g,     // Matches names without digits
            'family':      /^((?![0-9]).+)/g,     // Matches family names without digits
            'number':      /^[0-9]+/g,            // Matches numbers
            'url':         /^(ht|f)tps?:\/\/[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/, // Matches URLs
            'date':        /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|12)[\/\-]\d{4}$/, // Matches dates in DD/MM/YYYY or DD-MM-YYYY format
            'email':       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // Matches email addresses
            'tel':         /^[0-9\-\+]{3,25}$/    // Matches telephone numbers

        };


        // Attach the validation logic to the form's submit event.
        return this.on( 'submit', function( e ) {

            // 'this' refers to the form element.
            var form = this;

            // Array to store references to invalid form elements.
            var invalids = [];


            // Call the user-defined initialization function.
            settings.init.call( form );


            // Object to hold all collected form data.
            var data = {};

            // Iterate over all visible input, textarea, and select elements within the form.
            $( 'input,textarea,select', this ).filter( ":visible,[type='hidden']" ).each( function() {

                var i = $( this ); // Current form element.

                // If the parent of the input is not visible, skip it.
                if ( !i.parent().is( ':visible' ) ) {
                    return;
                }

                var name = i.attr( 'name' ); // Get the 'name' attribute of the element.

                // Process elements that have a name and are not unchecked checkboxes/radios.
                if ( typeof( name ) != 'undefined' && ( i.is( ":not([type='checkbox'],[type='radio'])" ) || i.is( ":checked" ) ) ) {

                    var value = i.val(); // Get the current value of the element.

                    // If a field with this name already exists in data, convert it to an array
                    // and append the new value. Otherwise, assign the value directly.
                    if ( typeof( data[ name ] ) != 'undefined' ) {
                        data[ name ] = [].concat( data[ name ] ).concat( value );
                    }
                    else
                    {
                        data[ name ] = value;
                    }

                }

            } );


            // Apply the 'join' setting if it's defined.
            /* This section processes array fields if a join character is specified. */
            if ( typeof( settings.join ) != 'undefined' )
            {
                for ( var i in data )
                {
                    // Ensure the property is an own property of the data object and is an array.
                    if ( Object.prototype.hasOwnProperty.call(data, i) && Array.isArray(data[i]) )
                    {
                        data[ i ] = data[ i ].join( settings.join );
                    }
                }
            }


            /**
             *  Iterate through elements requiring validation.
             *  [data-require] is now deprecated; use 'required' or [data-required] instead.
             *  This includes elements with data-regex, data-require, data-required, required, or data-equals attributes.
             */
            $( "[data-regex],[data-require],[data-required],[required],[data-equals]", form ).filter( ':visible' ).each( function() {

                var self = $( this ); // The current element being validated.

                var regex    = self.attr( 'data-regex' ); // Custom regex from data-regex attribute.
                var required = self.is( '[required]' ) || self.is( '[data-required]' ) /* data-required is preferred over data-require */ || self.is( '[data-require]' ); // Check for required status.
                var equals   = self.attr( 'data-equals' ); // Name of another field this one must equal.
                var value    = self.val(); // Current value of the element.


                // If it's an unchecked checkbox, its value is effectively empty for validation purposes.
                if ( self.is( "[type='checkbox']" ) && !self.is( ":checked" ) ) {
                    value = '';
                }


                // Override 'value' with the collected 'data' value if it's a named field,
                // especially important for radio buttons or multiple selects where 'val()' might not yield the full picture.
                var name = self.attr( 'name' );
                if ( typeof( name ) != 'undefined' ) {
                    value = data[ name ];
                }


                // Check if the element's value must equal another field's value.
                if ( typeof( equals ) != 'undefined' && typeof( data[ equals ] ) != 'undefined' ) {
                    if ( value != data[ equals ] ) {
                        invalids.push( this ); // Add current element to invalids.
                        invalids.push( $( "[name='" + equals + "']" )[ 0 ] ); // Add the 'equals' target element too.
                    }
                }


                /**
                 *  Special handling for array values:
                 *  An array is considered valid in terms of its structure;
                 *  we only check its 'required' status (i.e., if it has any selected values).
                 */
                if ( !Array.isArray( value ) ) {

                    // If there's a value and it's not empty.
                    if ( value && value.length > 0 ) {

                        // If no custom regex is defined, try to infer it from the input type.
                        if ( typeof( regex ) == 'undefined' ) {

                            var type = $( this ).attr( 'type' );

                            // Check if a validator exists for the element's type.
                            if ( typeof( type ) != 'undefined' && typeof( validators[ type.toLowerCase() ] ) != 'undefined' ) {
                                regex = type.toLowerCase();
                            }
                        }


                        // If a regex (custom or inferred) is available.
                        if ( regex ) {

                            var r; // Variable to hold the RegExp object.

                            // Use a predefined validator if it exists for the given regex key.
                            if ( typeof( validators[ regex ] ) != 'undefined' ) {
                                r = validators[ regex ];
                            }
                            // Otherwise, create a new RegExp object from the regex string.
                            else
                            {
                                r = new RegExp( regex );
                            }


                            // Test the value against the regular expression.
                            if ( !r.test( value ) ) {
                                invalids.push( this ); // If it doesn't match, add to invalids.
                            }

                        }

                    }
                    // If no value, but the field is required.
                    else if ( required ) {
                        invalids.push( this ); // Add to invalids if required but empty.
                    }

                }

            } );


            // If there are any invalid elements.
            if ( invalids.length > 0 ) {

                e.preventDefault(); // Prevent the default form submission.

                // Call the fail callback with the form, event, invalid elements, and collected data.
                settings.fail.call( form, e, invalids, data );

            }
            else
            {
                // If validation passes, call the success callback.
                settings.success.call( form, e, data );
            }

        } )
        // Disable default HTML5 validation to rely solely on this plugin.
        .attr( 'novalidate', '' );

    };


    // Convenience method for Bootstrap 3 specific validation styling.
    $.fn.bootstrap3Validate = function( success, data ) {

        // Return the result of calling the general validate method with Bootstrap 3 specific callbacks.
        return this.validate( {

            // Initialization callback: clear previous error states and tooltips.
            'init': function() {
                $( '.has-error', this ).removeClass( 'has-error' ).find( 'input,textarea' ).tooltip( 'destroy' );
                $( '.alert' ).hide(); // Hide any general alert messages.
                $( "[role='tooltip']", this ).tooltip( 'destroy' ); // Destroy any existing tooltips.
            },

            // Success callback: if a custom success function is provided, call it.
            'success': function( e, data ) {
                if ( typeof( success ) === 'function' ) {
                    success.call( this, e, data );
                }
            },

            // Failure callback: apply Bootstrap 3 error styling and tooltips.
            'fail': function( e, invalids ) {

                var form = this; // Reference to the form element.

                // Iterate over each invalid element to apply error styling and tooltips.
                $( invalids ).closest( '.form-group' ).addClass( 'has-error' ).find( 'input,select,textarea' ).each( function( i ) {

                    var target = $( this ); // The current invalid input element.
                    var text   = target.attr( 'data-title' ); // Get error message from data-title.

                    // If no data-title, try placeholder text.
                    if ( !text ) {
                        text = target.attr( 'placeholder' );
                    }


                    // If an error message is available.
                    if ( text ) {

                        // For non-checkboxes, apply a tooltip.
                        if ( !target.is( "[type='checkbox']" ) ) {
                            target.tooltip( { 'trigger':'focus', placement: 'top', title: text } );
                        }


                        // For the first invalid element, show a general alert and focus the element.
                        if ( i == 0 ) {
                            $( '.alert-danger', form ).show().text( text );
                            this.focus();
                        }

                    }

                } );

            }, /* End of fail callback */

        } );

    };


}( jQuery ) ); // Immediately Invoked Function Expression (IIFE) to encapsulate the plugin.
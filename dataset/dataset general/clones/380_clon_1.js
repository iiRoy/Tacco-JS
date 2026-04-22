/*
 * jquery.f5 v0.2
 *
 * This JavaScript module provides enhanced HTML5 forms capabilities.
 * It's designed to add polyfills and custom validation for older browsers,
 * while leveraging native HTML5 features where available.
 *
 * Dependencies: jQuery library is required for this plugin to function correctly.
 *
 */

( function( $ ) {

    /**
     * Helper function to detect native host methods.
     * This is crucial for determining if browser supports specific HTML5 form APIs.
     * @param {object} o - The object to inspect (e.g., an HTML element).
     * @param {string} m - The name of the method to check for.
     * @returns {boolean} True if the method exists and is callable/object, false otherwise.
     */
    var isHostMethod = function ( o, m ) {
        // Determine the type of the property 'm' on object 'o'.
        var t = typeof o[ m ],
            // Regular expression to match 'function' or 'object' (case-insensitive).
            reFeaturedMethod = new RegExp( '^function|object$', 'i' );

        // Return true if it's a function/object and exists, or if its type is 'unknown'.
        return !!( ( reFeaturedMethod.test( t ) && o[ m ] ) || t == 'unknown' );
    };


    // Prepare a temporary input element to perform feature detection tests.
    var prey = document.createElement( "input" );

    // Object to store native feature detection results.
    var isNative = {
        // Input attributes support detection.
        inputAttr : {
            required : !!( 'required' in prey ), /* Checks for 'required' attribute */
            pattern : !!( 'pattern' in prey ),   /* Checks for 'pattern' attribute */
            min : !!( 'min' in prey ),           /* Checks for 'min' attribute */
            max : !!( 'max' in prey )            /* Checks for 'max' attribute */
        },
        // Host method support detection.
        hostMethod : {
            validity : isHostMethod( prey, 'validity' ),                         /* HTML5 ValidityState object */
            checkValidity : isHostMethod( prey, 'checkValidity' ),               /* HTML5 checkValidity method */
            setCustomValidity : isHostMethod( prey, 'setCustomValidity' ),       /* HTML5 setCustomValidity method */
            valueAsNumber: isHostMethod( prey, 'valueAsNumber' ),               /* HTML5 valueAsNumber property */
            valueAsDate: isHostMethod( prey, 'valueAsDate' )                    /* HTML5 valueAsDate property */
        }
    };


    /**
     * This is an immediately invoked function expression (IIFE)
     * responsible for setting up the low-level field validation logic.
     * It returns a setup function that is then used by the plugin.
     *
     * @returns {Function} A function that performs the actual field setup and validation.
     */
    var lowSetupField = ( function() {

        // If the browser natively supports the 'validity' object,
        // we can skip complex polyfilling for basic validity checks.
        if ( isNative.hostMethod.validity ) {
            return function() { /* No operation needed, native support is sufficient. */ };
        }

        // --- Hard work: No native HTML5 Forms support detected, so we need to polyfill. ---

        // Helper function to test if a value matches a given pattern.
        var isPattern = function ( value, pattern ) {
            return pattern.test( value );
        };

        // Predefined regex patterns for common HTML5 input types.
        var patterns = {
            'email' : new RegExp( "^[a-z0-9_.%+-]+@[0-9a-z.-]"
                                  + "+\\.[a-z.]{2,6}$", "i" ),
            'url'   : new RegExp( "[a-z][-\\.+a-z]*:\\/\\/", "i" )
        };


        // The actual setup function returned by the IIFE.
        // It takes a jQuery wrapped field and plugin options.
        return function ( $$, opts ) {

            var domField = $$.get( 0 ); // Get the raw DOM element from the jQuery object.
            var fieldType = domField.getAttribute( 'type' ); // Determine the input field's type.

            // Initialize validation message and validity object for the DOM field.
            // These properties mimic the HTML5 standard for form validation.
            domField.validationMessage = '';
            domField.validity = {
                customError     : false,
                patternMismatch : false,
                rangeOverflow   : false,
                rangeUnderflow  : false,
                stepMismatch    : false,
                tooLong         : false,
                typeMismatch    : false,
                valid           : true, /* Initially assume valid until a check fails. */
                valueMissing    : false
            };

            // If the field has a 'required' attribute, add the corresponding class.
            if ( $$.attr( 'required' ) !== undefined ) {
                $$.addClass( opts.classes.required );
            }

            // Define all possible validation checks that can be applied to a field.
            var all = [
                { // Custom error check: handles errors set manually by setCustomValidity.
                    check : true, // Always relevant.
                    op    : function () {
                        if ( domField.validity.customError ) {
                            return domField.validationMessage;
                        }
                    }
                },
                { // Required field check: ensures a value is present if 'required'.
                    check : $$.attr( 'required' ) !== undefined, // Only if required attribute is present.
                    op    : function () {
                        if ( domField.value === "" ) {
                            domField.validity.valueMissing = true;
                            return opts.messages.required;
                        } else {
                            domField.validity.valueMissing = false;
                        }
                    }
                },
                { // Email or URL type mismatch check.
                    check : fieldType === 'email' || fieldType === 'url', // Only for email or URL types.
                    op    : function () {
                        var val = domField.value;
                        // If value doesn't match pattern and is not empty.
                        if ( !isPattern( val, patterns[ fieldType ] ) && val !== "" ) {
                            domField.validity.typeMismatch = true;
                            return opts.messages[ fieldType ];
                        } else {
                            domField.validity.typeMismatch = false;
                        }
                    }
                },
                { // Number type mismatch check.
                    check : fieldType === 'number', // Only for number type.
                    op    : function () {
                        var val = domField.value;
                        // If value is not a number and is not empty.
                        if ( isNaN( val ) && val !== "" ) {
                            domField.validity.typeMismatch = true;
                            return opts.messages.number;
                        } else {
                            domField.validity.typeMismatch = false;
                        }
                    }
                },
                { // Pattern mismatch check.
                    check : $$.attr( 'pattern' ) !== undefined, // Only if pattern attribute is present.
                    op    : function () {
                        var val = domField.value;
                        var pattern = new RegExp( $$.attr( 'pattern' ) );
                        // If value doesn't match custom pattern and is not empty.
                        if ( !pattern.test( val ) && val !== "" ) {
                            domField.validity.patternMismatch = true;
                            return opts.messages.pattern;
                        } else {
                            domField.validity.patternMismatch = false;
                        }
                    }
                }
            ];

            // Filter the 'all' checks to create a specific validation chain for this field.
            var chain = [];
            for ( var i = 0; i < all.length; i++ ) {
                if ( all[ i ].check ) {
                    chain.push( all[ i ].op ); // Add the operation if its 'check' condition is true.
                }
            }


            /**
             * The core validation function for this specific form field.
             * It iterates through the validation chain and updates the field's validity state.
             * This function is assigned to `domField.control.validate`.
             */
            var validate = domField.control.validate = function () {
                // Execute all checks in the validation chain.
                var msg = undefined; // Stores the first encountered validation message.
                for ( var i = 0; i < chain.length; i++ ) {
                    var lastMsg = chain[ i ](); // Run the check.
                    // If a message is returned and no message has been set yet, store it.
                    if ( !!lastMsg && !!!msg ) {
                        msg = lastMsg;
                    }
                }

                // Update the DOM field's validation message and overall validity state.
                domField.validationMessage = msg || ""; // Set message or empty string if no errors.
                domField.validity.valid = (
                    !domField.validity.customError     // No custom error
                    && !domField.validity.valueMissing // Not missing a required value
                    && !domField.validatity.tooLong    // Not too long (not implemented in this polyfill)
                    && !domField.validity.typeMismatch // Type matches (email, url, number)
                    && !domField.validity.patternMismatch // Pattern matches
                    && !domField.validity.rangeOverflow // Not over max (not implemented)
                    && !domField.validity.rangeUnderflow // Not under min (not implemented)
                    && !domField.validity.stepMismatch ); // Step matches (not implemented)

                // Apply appropriate CSS classes based on the field's validity.
                if ( domField.validity.valid ) {
                    $$.removeClass( opts.classes.invalid )
                        .addClass( opts.classes.valid );
                } else {
                    $$.removeClass( opts.classes.valid )
                        .addClass( opts.classes.invalid );
                }
            };

            // Bind validation events to the input field.
            // Special handling for IE to ensure 'input' event fires correctly.
            if ( $.browser.msie ) {
                $$.bind( 'keyup change', function () {
                    $( this ).trigger( 'input' );
                } );
            }
            // Bind the validate function to 'input' and 'change' events.
            $$.bind( 'input change', validate );
            // Perform an initial validation on load.
            domField.control.validate();

            // Polyfill `setCustomValidity` method if not natively supported.
            if ( !isNative.hostMethod.setCustomValidity ) {
                domField.setCustomValidity = function ( msg ) {
                    domField.validity.customError = !!msg; // Set customError based on message presence.
                    domField.validationMessage = msg || ''; // Store the custom message.
                    domField.control.validate(); // Re-run validation to update state.
                };
            }

            // Polyfill `checkValidity` method if not natively supported.
            if ( !isNative.hostMethod.checkValidity ) {
                domField.checkValidity = function () {
                    // The validity state is determined by the last call to `validate`.
                    var state = !!domField.validity && domField.validity.valid;
                    // Trigger 'valid' or 'invalid' events on the jQuery object.
                    $$.trigger( state ? 'valid' : 'invalid' );
                    return state; // Return the current validity state.
                };
            }
        };
    } )(); // End of lowSetupField IIFE.


    /**
     * Sets up error message display for a given form field.
     * This function creates or manages an error element associated with the field.
     *
     * @param {jQuery} $$ - The jQuery wrapped input field.
     * @param {object} opts - The plugin options.
     */
    var setupFieldError = function ( $$, opts ) {
        // Only proceed if native validity is NOT supported, or if 'force' error display is enabled.
        if ( !isNative.hostMethod.validity || opts.error.force ) {

            // Create the error element using the provided 'create' function in options.
            $$.get( 0 ).control.error = opts.error.create.apply( $$ );

            // Bind to the 'invalid' event to display the validation message.
            $$.bind( 'invalid', function ( event ) {
                $( this.control.error ).text( this.validationMessage ); // Set error text.
                event.preventDefault(); // Prevent default browser error handling.
                $( this ).focus(); // Focus the invalid field.
            } );

            // Special handling for Internet Explorer to redraw CSS rules and show/hide errors.
            if ( $.browser.msie ) {
                $$.bind( 'valid', function () {
                    $( this.control.error ).text( '' ); // Clear error text on valid.
                } )
                    .bind( 'focus', function () {
                        $( this.control.error ).show(); // Show error on focus.
                    } )
                    .bind( 'blur', function () {
                        $( this.control.error ).hide(); // Hide error on blur.
                    } );
            }
        }
    };


    // Define the jQuery plugin 'f5'
    $.fn.f5 = function ( options ) {

        // Default settings for the plugin.
        var settings = {
            classes : {
                valid    : 'valid',    // CSS class for valid fields.
                invalid  : 'invalid',  // CSS class for invalid fields.
                required : 'required'  // CSS class for required fields.
            },
            messages : {
                required : "Please fill out this field.",
                pattern  : "Please match the requested format.",
                email    : "Please enter an email address.",
                url      : "Please enter URL",
                number   : "Please enter numeric value",
                max      : "Value too large", // Not used in current polyfill logic.
                min      : "Value too small"  // Not used in current polyfill logic.
            },
            error : {
                force  : false, // Force error message display even in modern browsers.
                create : function () { // Function to create the error element.
                    var err = $( '<span class="error"></span>' );
                    $( this ).after( err ); // Insert error span after the input.
                    return err;
                }
            }
        };

        // Merge user-provided options with default settings.
        options = !!options ? options : {};
        options = $.extend( true, settings, options ); // Deep merge.

        // Iterate over each form element selected by the jQuery object.
        return this.filter( 'form' ).each( function () {
            var $form = $( this ); // Current form as a jQuery object.

            // Iterate over all input fields (excluding submit/reset) within the current form.
            $( ':input:not(:submit):not(:reset)', $form ).each( function () {
                var $field = $( this ); // Current input field as a jQuery object.

                // Attach a 'control' object to the raw DOM element for internal use.
                $field.get( 0 ).control = {};

                // Set up error handling and display for the field.
                setupFieldError( $field, settings );
                // Set up the low-level validation logic for the field.
                lowSetupField( $field, settings );
            } );

            // --- Setup form-level checkValidity and submit behavior ---
            var formCheckVal = isHostMethod( $form.get( 0 ), 'checkValidity' );

            // If the form does not natively support checkValidity.
            if ( !formCheckVal ) {
                var domForm = $form.get( 0 ); // Get the raw DOM form element.
                domForm.checkValidity = function () {
                    var all = true; // Assume valid initially.
                    // Iterate over all input fields in the form.
                    $( ':input:not(:submit):not(:reset)',
                        $form ).each( function () {
                        // If any field is invalid, set 'all' to false.
                        if ( !$( this ).get( 0 ).checkValidity() ) {
                            all = false;
                        }
                    } );
                    return all; // Return overall form validity.
                };
            }

            // If formCheckVal is still false (meaning no native checkValidity),
            // then we need to polyfill the form's submit behavior.
            if ( !formCheckVal ) {
                // Bind to the form's 'submit' event.
                $form.bind( 'submit', function ( event ) {
                    // Find all invalid fields within the form.
                    var invalidFields = $( ':input:not(:submit):not(:reset)',
                        $form ).filter( function () {
                        return !$( this ).get( 0 ).validity.valid;
                    } );

                    // If there are no invalid fields, allow the form to submit.
                    if ( invalidFields.length == 0 ) {
                        // Update values for fields (e.g., in case of polyfilled valueAsNumber/Date)
                        // This specific part might be redundant with modern jQuery handling.
                        $( ':input:not(:submit):not(:reset)',
                            $form ).each( function () {
                            $this = $( this );
                            $this.val( $this.get( 0 ).value );
                        } );
                        return true; // Allow submission.
                    } else {
                        // If there are invalid fields:
                        $form.get( 0 ).checkValidity(); // Trigger validation on all fields.
                        invalidFields.filter( ':first' ).select(); // Focus and select the first invalid field.
                        return false; // Prevent form submission.
                    }
                } );
            }
        } ); // End of each form iteration.
    };
} )( jQuery ); // Pass jQuery into the IIFE.
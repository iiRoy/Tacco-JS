/*
 * @license
 *
 * jQuery Tools Validator - Version 1.2.3
 *
 * This code is provided without any copyrights or licenses.
 * You are free to do whatever you like with it.
 *
 * For more information, visit:
 * http://flowplayer.org/tools/form/validator/
 *
 * Initial release: March 2010
 * Last modified:   Mon Jun 7 13:43:53 2010 +0000
 */
/* jslint evil: true, browser: true, forin: true, eqeqeq: true, bitwise: true, strict: true, undef: true, curly: true, indent: 4, maxerr: 50, white: true */
( function( $ ) {

    // Ensure $.tools exists and set its version if it doesn't.
    // This is a common pattern in jQuery Tools.
    $.tools = $.tools || {
        version: '1.2.3'
    };

    // --- Global Regular Expressions ---
    // These regex patterns are used for various validation checks.

    // Matches `[type=someType]` attribute selector.
    var typeRe = /\[type=([a-z]+)\]/
    ,   numRe  = /^-?[0-9]*(\.[0-9]+)?$/ // Matches numeric values (integers or floats).

    // Regex for email validation, based on a common pattern.
    // Source: http://net.tutsplus.com/tutorials/other/8-regular-expressions-you-should-know/
    ,   emailRe = /^([a-z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/i

    // Regex for URL validation, supporting http/https and various path structures.
    ,   urlRe   = /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/i

    // Validator instance variable, to be assigned later.
    ,   v;


    // The core validator object, attached to $.tools.
    // It contains configuration, messages, and utility functions.
    v = $.tools.validator = {

        // --- Default Configuration Options ---
        // These can be overridden when initializing the validator.
        conf: {
            grouped:           false,        // If true, all error messages are shown at once.
            effect:            'default',    // Visual effect for showing/hiding error messages.
            errorClass:        'invalid',    // CSS class applied to invalid input fields.

            // When should validation checks be performed?
            inputEvent:        null,         // Event to trigger input validation (e.g., 'change', 'blur', 'keyup').
            errorInputEvent:   'keyup',      // Event to trigger input validation *after* an error has occurred.
            formEvent:         'submit',     // Event to trigger form validation (e.g., 'submit').

            lang:              'en',         // Default language for error messages.
            message:           '<div/>',     // HTML structure for the error message container.
            messageAttr:       'data-message', // Attribute name for custom error messages on inputs.
            messageClass:      'error',      // CSS class applied to the error message container.
            offset:            [0, 0],       // Offset for positioning error messages [top, left].
            position:          'center right', // Position of the error message relative to the input.
            singleError:       false,        // If true, only the first error for an input is shown.
            speed:             'normal'      // Speed for fade-in/out effects of messages.
        },


        /* The collection of Error Messages, by validator key. */
        messages: {
            "*": {
                en: "Please correct this value"
            } // Default fallback message.
        },

        /**
         * Localizes messages for a specific language.
         * @param {string} lang - The language code (e.g., 'en', 'fi').
         * @param {object} messages - An object where keys are validator names and values are messages.
         */
        localize: function( lang, messages ) {
            $.each( messages, function( key, msg ) {
                v.messages[key] = v.messages[key] || {}; // Initialize if not present.
                v.messages[key][lang] = msg;             // Assign message for the language.
            } );
        },

        /**
         * Extends messages for a specific validator key with new messages.
         * @param {string} key - The validator key (e.g., ':email', '[max]').
         * @param {object} messages - An object containing messages, possibly for different languages.
         */
        localizeFn: function( key, messages ) {
            v.messages[key] = v.messages[key] || {};
            $.extend( v.messages[key], messages ); // Merge new messages.
        },

        /**
         * Adds a new validation rule (validator function) to the system.
         * @param {string|function} matcher - A jQuery selector string, or a function that returns true for matching elements.
         * @param {string|object} msg - The default error message (string) or an object of messages for different languages.
         * @param {function} fn - The actual validation function.
         */
        fn: function( matcher, msg, fn ) {

            // Handle cases where 'msg' is actually the 'fn' (no message provided).
            if ( $.isFunction( msg ) ) {
                fn = msg; // Reassign 'fn' if 'msg' is a function.

            // If a message (or messages object) is provided.
            } else {
                if ( typeof msg == 'string' ) {
                    msg = {
                        en: msg
                    };
                }
                this.messages[matcher.key || matcher] = msg; // Store the message(s).
            }

            // Check for "[type=xxx]" selectors, which jQuery's .filter() doesn't
            // handle natively in older versions. Convert it to a function.
            var test = typeRe.exec( matcher );
            if ( test ) {
                matcher = isType( test[1] );
            }

            // Add the new validator to our internal list.
            fns.push( [matcher, fn] );
        },

        /**
         * Adds a new show/hide effect for error messages.
         * @param {string} name - The name of the effect.
         * @param {function} showFn - Function to call when showing errors.
         * @param {function} closeFn - Function to call when hiding errors.
         */
        addEffect: function( name, showFn, closeFn ) {
            effects[name] = [showFn, closeFn];
        }

    }; // End of v = $.tools.validator


    /*
     * Calculates the absolute position for an error message
     * relative to its associated input field.
     *
     * @param {jQuery} trigger - The input element that triggered the error.
     * @param {jQuery} el - The error message element.
     * @param {object} conf - The validator's configuration object.
     * @returns {object} An object with 'top' and 'left' coordinates.
     */
    function getPosition( trigger, el, conf ) {

        // Get the initial top/left offset of the trigger element.
        var top  = trigger.offset().top,
            left = trigger.offset().left,

        // Parse the position string (e.g., "center right").
            pos  = conf.position.split( /,?\s+/ ),
            y    = pos[0],
            x    = pos[1];

        // Adjust initial position based on offset configuration.
        top  -= el.outerHeight() - conf.offset[0];
        left += trigger.outerWidth() + conf.offset[1];

        // --- Adjust Y-coordinate ---
        var height = el.outerHeight() + trigger.outerHeight();
        if ( y == 'center' ) {
            top += height / 2;
        }
        if ( y == 'bottom' ) {
            top += height;
        }

        // --- Adjust X-coordinate ---
        var width = trigger.outerWidth();
        if ( x == 'center' ) {
            left -= ( width + el.outerWidth() ) / 2;
        }
        if ( x == 'left' ) {
            left -= width;
        }

        return {
            top: top,
            left: left
        };
    }


    /*
     * Helper function to create a selector function for `[type=xxx]`.
     * This is a workaround for jQuery 1.3.2/1.4.2 where `$.is("[type=xxx]")`
     * or `$.filter("[type=xxx]")` might not work as expected.
     *
     * @param {string} type - The value of the 'type' attribute.
     * @returns {function} A function that checks the element's type attribute.
     */
    function isType( type ) {
        function fn() {
            return this.getAttribute( "type" ) == type;
        }
        fn.key = "[type=" + type + "]"; // Store original key for message lookup.
        return fn;
    }


    // Array to store all registered validator functions.
    var fns = [];

    // Object to store registered visual effects for error messages.
    var effects = {

        'default': [ // The default effect implementation.

            // --- Show Errors Function ---
            // This function is called to display error messages.
            function( errs ) {

                var conf = this.getConf(); // Get the current validator configuration.

                // Iterate over each error found.
                $.each( errs, function( i, err ) {

                    // Get the input field and apply the error class.
                    var input = err.input;
                    input.addClass( conf.errorClass );

                    // Retrieve the error message container associated with this input.
                    var msg = input.data( "msg.el" );

                    // If no message container exists, create it and append to body.
                    if ( !msg ) {
                        msg = $( conf.message )
                            .addClass( conf.messageClass )
                            .appendTo( document.body );
                        input.data( "msg.el", msg ); // Store reference to the message element.
                    }

                    // Clear previous messages and hide temporarily for repopulation.
                    msg.css( {
                        visibility: 'hidden'
                    } ).find( "span" ).remove();

                    // Populate the message container with current error messages.
                    $.each( err.messages, function( i, m ) {
                        $( "<span/>" ).html( m ).appendTo( msg );
                    } );

                    // Ensure the message container's width is sane (not full body width).
                    // This handles cases where `div`s might expand to 100%.
                    if ( msg.outerWidth() == msg.parent().width() ) {
                        msg.add( msg.find( "p" ) ).css( {
                            display: 'inline'
                        } );
                    }

                    // Calculate and apply the correct position for the message.
                    var pos = getPosition( input, msg, conf );

                    // Make the message visible and fade it in.
                    msg.css( {
                            visibility: 'visible',
                            position:   'absolute',
                            top:        pos.top,
                            left:       pos.left
                        } )
                        .fadeIn( conf.speed );
                } );


            // --- Hide Errors Function ---
            // This function is called to hide error messages.
            }, function( inputs ) {

                var conf = this.getConf(); // Get configuration.

                // Remove error class from inputs and hide their associated messages.
                inputs.removeClass( conf.errorClass ).each( function() {
                    var msg = $( this ).data( "msg.el" );
                    if ( msg ) {
                        msg.css( {
                            visibility: 'hidden'
                        } ); // Simply hide the message.
                    }
                } );
            }
        ]
    }; // End of effects object.


    /*
     * Custom jQuery selectors for HTML5 input types.
     * Allows using `$("input:email")`, `$("input:url")`, etc.
     */
    $.each( "email,url,number".split( "," ), function( i, key ) {
        $.expr[':'][key] = function( el ) {
            return el.getAttribute( "type" ) === key;
        };
    } );


    /*
     * jQuery plugin: .oninvalid()
     * Provides a cross-browser way to bind/trigger the HTML5 'invalid' event.
     * Usage: $("input:eq(2)").oninvalid(function() { ... });
     *
     * @param {function} fn - The handler function to bind.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.oninvalid = function( fn ) {
        // If a function is provided, bind it; otherwise, trigger the event.
        return this[fn ? "bind" : "trigger"]( "OI", fn );
    };


    /******* built-in HTML5 standard validators *********/

    // Validator for email input type.
    v.fn( ":email", "Please enter a valid email address", function( el, val ) {
        return !val || emailRe.test( val ); // Return true if empty or matches regex.
    } );

    // Validator for URL input type.
    v.fn( ":url", "Please enter a valid URL", function( el, val ) {
        return !val || urlRe.test( val ); // Return true if empty or matches regex.
    } );

    // Validator for number input type.
    v.fn( ":number", "Please enter a numeric value.", function( el, val ) {
        return numRe.test( val ); // Return true if matches numeric regex.
    } );

    // Validator for 'max' attribute (numeric comparison).
    v.fn( "[max]", "Please enter a value smaller than $1", function( el, val ) {

        // Skip date inputs if jQuery Tools Dateinput is present,
        // as it might handle its own max validation.
        if ( $.tools.dateinput && el.is( ":date" ) ) {
            return true;
        }

        var maxVal = el.attr( "max" );
        // Compare float values. If invalid, return an array for substitution.
        return parseFloat( val ) <= parseFloat( maxVal ) ? true : [maxVal];
    } );

    // Validator for 'min' attribute (numeric comparison).
    v.fn( "[min]", "Please enter a value larger than $1", function( el, val ) {

        // Skip date inputs if jQuery Tools Dateinput is present.
        if ( $.tools.dateinput && el.is( ":date" ) ) {
            return true;
        }

        var minVal = el.attr( "min" );
        // Compare float values. If invalid, return an array for substitution.
        return parseFloat( val ) >= parseFloat( minVal ) ? true : [minVal];
    } );

    // Validator for 'required' attribute.
    v.fn( "[required]", "Please complete this mandatory field.", function( el, val ) {
        // Special handling for checkboxes.
        if ( el.is( ":checkbox" ) ) {
            return el.is( ":checked" );
        }
        return !!val; // Return true if value is not empty/falsy.
    } );

    // Validator for 'pattern' attribute (regex validation).
    v.fn( "[pattern]", function( el ) {
        // Create a RegExp object from the pattern attribute.
        var patternRegex = new RegExp( "^" + el.attr( "pattern" ) + "$" );
        return patternRegex.test( el.val() ); // Test the input's current value.
    } );


    /**
     * The main Validator constructor function.
     * Initializes a validator instance for a given set of inputs and form.
     *
     * @param {jQuery} inputs - The set of input elements to validate.
     * @param {jQuery} form - The form element associated with these inputs.
     * @param {object} conf - The configuration object for this validator instance.
     */
    function Validator( inputs, form, conf ) {

        // Private variables for the instance.
        var self = this,
            fire = form.add( self ); // jQuery object for triggering events on both form and validator.

        // Filter out button-like inputs, as they typically don't require validation.
        inputs = inputs.not( ":button, :image, :reset, :submit" );


        // --- Utility Function: pushMessage ---
        // Adds an error message to the 'to' array, handling substitutions.
        function pushMessage( to, matcher, returnValue ) {

            // If 'grouped' is false and there's already a message, do nothing (single error per input).
            if ( !conf.grouped && to.length ) {
                return;
            }

            var msg; // Variable to hold the final message string.

            // If returnValue is false or an array, it indicates a standard validation failure
            // where a predefined message (possibly with substitutions) is needed.
            if ( returnValue === false || $.isArray( returnValue ) ) {
                msg = v.messages[matcher.key || matcher] || v.messages["*"]; // Get message by key or fallback.
                msg = msg[conf.lang] || v.messages["*"].en;                 // Get language-specific message or fallback to English.

                // Handle message substitutions (e.g., "$1" in "Value smaller than $1").
                var matches = msg.match( /\$\d/g );
                if ( matches && $.isArray( returnValue ) ) {
                    $.each( matches, function( i ) {
                        msg = msg.replace( this, returnValue[i] ); // Replace placeholders with array values.
                    } );
                }

            // If returnValue is a string or object, it's a direct custom error message.
            } else {
                msg = returnValue[conf.lang] || returnValue; // Get language-specific or direct string.
            }

            to.push( msg ); // Add the message to the array.
        }


        // --- Public API Methods for the Validator Instance ---
        $.extend( self, {

            /**
             * Retrieves the current configuration object.
             * @returns {object} The validator's configuration.
             */
            getConf: function() {
                return conf;
            },

            /**
             * Retrieves the jQuery object representing the form.
             * @returns {jQuery} The form element.
             */
            getForm: function() {
                return form;
            },

            /**
             * Retrieves the jQuery object representing the validated inputs.
             * @returns {jQuery} The input elements.
             */
            getInputs: function() {
                return inputs;
            },

            /**
             * Invalidates specific fields programmatically.
             * @param {object|array} errs - Either an object `{fieldName: 'message'}` or an array of error objects.
             * @param {jQuery.Event} [e] - Internal use: The event object if triggered internally.
             * @returns {Validator} The validator instance for chaining.
             */
            invalidate: function( errs, e ) {

                // If `errs` is an object (e.g., `{fieldName: 'message'}`), convert it to the internal array format.
                if ( !e ) {
                    var errors = [];
                    $.each( errs, function( key, val ) {
                        var input = inputs.filter( "[name=" + key + "]" ); // Find the input by name.
                        if ( input.length ) {
                            // Trigger HTML5 'oninvalid' event.
                            input.trigger( "OI", [val] );

                            errors.push( {
                                input: input,
                                messages: [val]
                            } );
                        }
                    } );

                    errs = errors; // Update errs to the array format.
                    e = $.Event(); // Create a new event object if not provided.
                }

                // Trigger 'onFail' callback.
                e.type = "onFail";
                fire.trigger( e, [errs] );

                // If the default action hasn't been prevented, call the effect's show function.
                if ( !e.isDefaultPrevented() ) {
                    effects[conf.effect][0].call( self, errs, e );
                }

                return self; // Enable chaining.
            },

            /**
             * Resets the validation state of inputs (removes error classes and messages).
             * @param {jQuery} [els] - Optional: Specific elements to reset. If omitted, all validated inputs are reset.
             * @returns {Validator} The validator instance for chaining.
             */
            reset: function( els ) {
                els = els || inputs; // Default to all validated inputs.

                els.removeClass( conf.errorClass ) // Remove error class.
                    .each( function() {
                        var msg = $( this ).data( "msg.el" );
                        if ( msg ) {
                            msg.remove(); // Remove the message element from DOM.
                            $( this ).data( "msg.el", null ); // Clear data reference.
                        }
                    } )
                    .unbind( conf.errorInputEvent || '' ); // Unbind error input event.
                return self; // Enable chaining.
            },

            /**
             * Destroys the validator instance, unbinding all events.
             * @returns {Validator} The validator instance for chaining.
             */
            destroy: function() {
                form.unbind( conf.formEvent ).unbind( "reset.V" ); // Unbind form events.
                inputs.unbind( conf.inputEvent || '' ).unbind( "change.V" ); // Unbind input events.
                return self.reset(); // Reset inputs and return.
            },


//{{{  checkValidity() - flesh and bone of this tool

            /**
             * Performs validation on a set of elements or all validated inputs.
             * This is the core validation logic.
             *
             * @param {jQuery} [els] - Optional: Specific elements to check. If omitted, all validated inputs are checked.
             * @param {jQuery.Event} [e] - The event object that triggered the check.
             * @returns {boolean} True if all checked elements are valid, false otherwise.
             */
            checkValidity: function( els, e ) {

                els = els || inputs;    // Default to all validated inputs.
                els = els.not( ":disabled" ); // Exclude disabled inputs from validation.
                if ( !els.length ) {
                    return true;
                } // If no elements to check, return true.

                e = e || $.Event(); // Create a new event object if not provided.

                // Trigger 'onBeforeValidate' callback.
                e.type = "onBeforeValidate";
                fire.trigger( e, [els] );
                if ( e.isDefaultPrevented() ) {
                    return e.result;
                } // If default prevented, return its result.

                var errs = [], // Array to collect all found errors.
                    event = conf.errorInputEvent + ".v"; // Event name for binding after initial error.

                // --- Loop through each input element to validate ---
                els.each( function() {

                    // Array to store messages for the current input, and the jQuery element itself.
                    var msgs = [],
                        el   = $( this ).unbind( event ).data( "messages", msgs ); // Unbind previous error event handler.

                    // --- Loop through all registered validator functions ---
                    $.each( fns, function() {
                        var fn = this, // Current validator function array [matcher, validatorFn].
                            match = fn[0]; // The matcher (selector or function).

                        // Check if the current input element matches the validator's matcher.
                        if ( el.filter( match ).length ) {

                            // Execute the validator function.
                            // `this` inside `fn[1]` will be the Validator instance (`self`).
                            var returnValue = fn[1].call( self, el, el.val() );


                            // If the validator function returns anything other than `true`, it indicates a validation failure.
                            if ( returnValue !== true ) {

                                // Trigger 'onBeforeFail' callback.
                                e.type = "onBeforeFail";
                                fire.trigger( e, [el, match] );
                                if ( e.isDefaultPrevented() ) {
                                    return false;
                                } // If default prevented, skip this validator.

                                // Check for an overridden custom message directly on the input element.
                                var msg = el.attr( conf.messageAttr );
                                if ( msg ) {
                                    msgs = [msg]; // Use custom message, override any others.
                                    return false; // Stop checking other validators for this input.
                                } else {
                                    pushMessage( msgs, match, returnValue ); // Add the standard/substituted message.
                                }
                            }
                        }
                    } ); // End of $.each(fns)

                    // If messages were collected for the current input, it's invalid.
                    if ( msgs.length ) {

                        errs.push( {
                            input: el,
                            messages: msgs
                        } ); // Add to the global errors array.

                        // Trigger HTML5 'oninvalid' event.
                        el.trigger( "OI", [msgs] );

                        // If an 'errorInputEvent' is configured, bind it to re-validate this input on error.
                        if ( conf.errorInputEvent ) {
                            el.bind( event, function( e ) {
                                self.checkValidity( el, e ); // Re-validate only this input.
                            } );
                        }
                    }

                    // If 'singleError' is true and an error has been found, stop checking further inputs.
                    if ( conf.singleError && errs.length ) {
                        return false;
                    }

                } ); // End of els.each()


                // --- Validation is complete for all inputs. Now handle effects and callbacks. ---

                // Ensure the configured effect exists.
                var eff = effects[conf.effect];
                if ( !eff ) {
                    throw "Validator: cannot find effect \"" + conf.effect + "\"";
                }

                // If errors were found.
                if ( errs.length ) {
                    self.invalidate( errs, e ); // Call the invalidate method to handle display.
                    return false;               // Form is invalid.

                // If no errors were found.
                } else {
                    // Call the effect's hide function.
                    eff[1].call( self, els, e );

                    // Trigger 'onSuccess' callback.
                    e.type = "onSuccess";
                    fire.trigger( e, [els] );

                    els.unbind( event ); // Unbind any error input events.
                }

                return true; // Form is valid.
            }
//}}}

        } ); // End of $.extend(self, ...)

        // --- Callback Registration ---
        // Dynamically create methods for binding to common validator events.
        $.each( "onBeforeValidate,onBeforeFail,onFail,onSuccess".split( "," ), function( i, name ) {

            // If a function for this callback is provided in the configuration, bind it.
            if ( $.isFunction( conf[name] ) ) {
                $( self ).bind( name, conf[name] );
            }

            // Create an API method (e.g., `validator.onSuccess(function() { ... })`).
            self[name] = function( fn ) {
                $( self ).bind( name, fn );
                return self; // Enable chaining.
            };
        } );


        // --- Form Event Handling ---
        // Bind the form submission event if configured.
        if ( conf.formEvent ) {
            form.bind( conf.formEvent, function( e ) {
                // If validation fails, prevent the default form submission.
                if ( !self.checkValidity( null, e ) ) {
                    return e.preventDefault();
                }
            } );
        }

        // Bind to the form's reset event to clear validation states.
        form.bind( "reset.V", function() {
            self.reset(); // Call the reset method.
        } );

        // Disable the browser's native HTML5 validation UI for the inputs.
        // This relies on the `validity` property being available on the DOM element.
        if ( inputs[0] && inputs[0].validity ) {
            inputs.each( function() {
                this.oninvalid = function() {
                    return false; // Prevent native browser validation popups.
                };
            } );
        }

    } // End of Validator constructor.

} )( jQuery ); // Immediately-invoked function expression (IIFE)
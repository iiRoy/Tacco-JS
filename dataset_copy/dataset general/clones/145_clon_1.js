/*
 * This file contains JavaScript code for the Clean Blog theme.
 * It includes initialization for tooltips, contact form submission logic,
 * and the jqBootstrapValidation plugin.
 *
 * Original Project: Clean Blog v1.0.0 (http://startbootstrap.com)
 * Copyright (c) 2015 Start Bootstrap. All rights reserved.
 * Licensing information: Apache License 2.0 (https://github.com/IronSummitMedia/startbootstrap/blob/gh-pages/LICENSE)
 *
 * Please note: This is a modified version for demonstration purposes,
 * primarily altering whitespace and comments while preserving all code logic.
 */

// Initialize Bootstrap tooltips across the application.
// This function runs when the DOM is fully loaded.
$( function() {

    // Select all elements that have the 'data-toggle="tooltip"' attribute
    // and apply the Bootstrap tooltip functionality to them.
    $ ( "[data-toggle = 'tooltip']" ).tooltip();

} ) ; // End of tooltip initialization function


// This section handles the functionality for the contact form.
// It uses the jqBootstrapValidation plugin for client-side validation
// and AJAX for submitting the form data.

$( function( ) { // Document ready function for contact form scripts

    // Apply jqBootstrapValidation to all input and textarea elements.
    $ ( "input,textarea" ).jqBootstrapValidation( {
        // Configuration for the validation plugin.
        preventSubmit: true , // Prevent default form submission if validation fails.

        submitError: function ( $form, event, errors ) {
            // This callback function is executed if there are validation errors
            // upon form submission. Developers can add custom error handling here.
            // For example, displaying a general error message or logging.
        }, // End of submitError handler

        submitSuccess: function ( $form, event ) {
            event.preventDefault(); // Crucially, prevent the browser's default form submission.

            // Retrieve the values entered by the user in the form fields.
            var name = $ ( "input#name" ).val ( ) ;
            var email = $ ( "input#email" ).val ( ) ;
            var phone = $ ( "input#phone" ).val ( ) ;
            var message = $ ( "textarea#message" ).val ( ) ;

            // Prepare the first name for use in success/failure messages.
            var firstName = name ;
            // If the name contains a space, extract only the first word.
            if ( firstName.indexOf ( ' ' ) >= 0 ) {
                firstName = name.split ( ' ' ).slice ( 0, -1 ).join ( ' ' ) ;
            }

            // Perform an AJAX request to send the form data to the server.
            $.ajax( {
                url: "././mail/contact_me.php" , // Target PHP script for processing.
                type: "POST" , // Use POST method for submitting data.
                data: { // Data payload to be sent.
                    name: name ,
                    phone: phone ,
                    email: email ,
                    message: message
                } ,
                cache: false , // Prevent caching of the AJAX request.
                success: function( ) {
                    // This function is called upon successful completion of the AJAX request.

                    // Display a success message to the user.
                    $ ( '#success' ).html ( "<div class='alert alert-success'>" ) ;
                    $ ( '#success > .alert-success' )
                        .html ( "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;" )
                        .append ( "</button>" ) ;
                    $ ( '#success > .alert-success' )
                        .append ( "<strong>Your message has been sent. </strong>" ) ;
                    $ ( '#success > .alert-success' )
                        .append ( '</div>' ) ;

                    // After successful submission, clear all fields in the contact form.
                    $ ( '#contactForm' ).trigger ( "reset" ) ;
                } , // End of success handler

                error: function( ) {
                    // This function is executed if the AJAX request fails (e.g., network error, server error).

                    // Display a failure message to the user.
                    $ ( '#success' ).html ( "<div class='alert alert-danger'>" ) ;
                    $ ( '#success > .alert-danger' )
                        .html ( "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;" )
                        .append ( "</button>" ) ;
                    $ ( '#success > .alert-danger' )
                        .append ( "<strong>Sorry " + firstName + ", it seems that my mail server is not responding. Please try again later!" ) ;
                    $ ( '#success > .alert-danger' )
                        .append ( '</div>' ) ;

                    // Also clear the form fields on error.
                    $ ( '#contactForm' ).trigger ( "reset" ) ;
                } , // End of error handler
            } ) ; // End of $.ajax call
        } , // End of submitSuccess handler

        filter: function ( ) {
            // This filter determines which elements should be validated.
            // Only visible elements will be validated.
            return $ ( this ).is ( ":visible" ) ;
        } , // End of filter function
    } ) ; // End of jqBootstrapValidation call

    // Handle clicks on Bootstrap tabs.
    $ ( "a[data-toggle=\"tab\"]" ).click ( function ( e ) {
        e.preventDefault ( ) ; // Prevent the default link behavior.
        $ ( this ).tab ( "show" ) ; // Show the clicked tab.
    } ) ;

} ) ; // End of document ready function for contact form scripts


/*
 * When the user focuses on the 'name' input field,
 * clear any previously displayed success/failure messages.
 */
$ ( '#name' ).focus ( function ( ) {
    $ ( '#success' ).html ( '' ) ; // Clear the content of the success message area.
} ) ;


/*
 * ========================================================================
 * jqBootstrapValidation Plugin
 * ========================================================================
 *
 * This is a jQuery plugin designed to automate validation
 * on forms styled with Twitter Bootstrap.
 *
 * Version: 1.3.6
 *
 * License: MIT License (http://opensource.org/licenses/mit-license.php)
 *          Please refer to the LICENSE file for full details.
 *
 * Project Homepage: http://ReactiveRaven.github.com/jqBootstrapValidation/
 *
 * ========================================================================
 */


( function ( $ ) { // Begin self-executing anonymous function to encapsulate the plugin logic.

    // Array to keep track of dynamically created help block elements.
    var createdElements = [ ] ;

    // Default configuration for the jqBootstrapValidation plugin.
    var defaults = {
        options: {
            // If true, new help blocks will be prepended to existing ones, otherwise appended.
            prependExistingHelpBlock: false ,
            // If true, the plugin will automatically detect validators from HTML5 attributes (e.g., 'required', 'maxlength').
            sniffHtml: true , // Enable sniffing for HTML5 validation attributes.
            // If true, the default form submission event will be prevented if validation fails.
            preventSubmit: true , // Stop the form from submitting if any validation errors are present.
            // Callback function executed if there's an error during form submission.
            submitError: false , // A function to call if validation fails on submit.
            // Callback function executed just before a successful submit event is sent to the server.
            submitSuccess: false , // A function to call before a successful submit.
            // If true, the plugin will attempt to tidy up generated HTML output for better semantic structure.
            semanticallyStrict: false , // Set to true for cleaner generated HTML.
            autoAdd: {
                // Automatically add help block elements if they don't exist.
                helpBlocks: true
            } ,
            filter: function ( ) {
                // This function defines which elements are subject to validation.
                // The original comment suggested validating only visible elements.
                // return $ ( this ).is ( ":visible" ) ; // Only validate elements that are currently visible.
                // Current implementation validates all elements regardless of visibility.
                return true ; // Validate all elements.
            }
        } , // End of options object

        methods: {
            // The initialization method for the plugin.
            init: function ( options ) {

                // Create a deep copy of the default settings.
                var settings = $.extend ( true, { } , defaults ) ;

                // Merge provided options with the default settings.
                settings.options = $.extend ( true, settings.options, options ) ;

                // Reference to the set of elements on which the plugin was called.
                var $siblingElements = this ;

                // Identify all unique forms that contain the sibling elements.
                var uniqueForms = $.unique(
                    $siblingElements.map ( function ( ) {
                        // For each element, find its parent form.
                        return $ ( this ).parents ( "form" ) [ 0 ] ;
                    } ).toArray ( )
                ) ;

                // Bind the submit event to each unique form.
                $ ( uniqueForms ).bind ( "submit" , function ( e ) {
                    var $form = $ ( this ) ; // The current form being submitted.
                    var warningsFound = 0 ; // Counter for validation warnings.

                    // Select all input, textarea, and select elements within the form,
                    // excluding submit and image buttons, and apply the filter.
                    var $inputs = $form.find ( "input,textarea,select" )
                        .not ( "[type=submit],[type=image]" )
                        .filter ( settings.options.filter ) ;

                    // Trigger validation events on all relevant input elements.
                    $inputs.trigger ( "submit.validation" ).trigger ( "validationLostFocus.validation" ) ;

                    // Iterate through each input to check for validation warnings.
                    $inputs.each ( function ( i, el ) {
                        var $this = $ ( el ) , // Current input element.
                            $controlGroup = $this.parents ( ".form-group" ).first ( ) ; // Its parent form-group.

                        // If the control group has a 'warning' class, it indicates a validation issue.
                        if ( $controlGroup.hasClass ( "warning" ) ) {
                            $controlGroup.removeClass ( "warning" ).addClass ( "error" ) ; // Change to 'error' class.
                            warningsFound++ ; // Increment the warnings counter.
                        }
                    } ) ;

                    // Trigger validationLostFocus again after checking all inputs.
                    $inputs.trigger ( "validationLostFocus.validation" ) ;

                    // If any warnings (errors) were found.
                    if ( warningsFound ) {
                        // If preventing submit is enabled, stop the default form submission.
                        if ( settings.options.preventSubmit ) {
                            e.preventDefault ( ) ;
                        }
                        $form.addClass ( "error" ) ; // Add 'error' class to the form.
                        // If a submitError callback is defined, execute it.
                        if ( $.isFunction ( settings.options.submitError ) ) {
                            settings.options.submitError ( $form, e, $inputs.jqBootstrapValidation ( "collectErrors" , true ) ) ;
                        }
                    } else {
                        $form.removeClass ( "error" ) ; // Remove 'error' class if no warnings.
                        // If a submitSuccess callback is defined, execute it.
                        if ( $.isFunction ( settings.options.submitSuccess ) ) {
                            settings.options.submitSuccess ( $form, e ) ;
                        }
                    }
                } ) ; // End of form submit event binding

                // Return 'this' for chaining, and iterate over each selected element.
                return this.each ( function ( ) {

                    // Get references to various jQuery objects related to the current element.
                    var $this = $ ( this ) , // The current input element.
                        $controlGroup = $this.parents ( ".form-group" ).first ( ) , // Its immediate Bootstrap form-group parent.
                        $helpBlock = $controlGroup.find ( ".help-block" ).first ( ) , // The help-block for messages.
                        $form = $this.parents ( "form" ).first ( ) , // The parent form.
                        validatorNames = [ ] ; // Array to store names of validators to apply.

                    // Create a message container (help-block) if it doesn't already exist,
                    // and if autoAdd helpBlocks option is enabled.
                    if ( ! $helpBlock.length && settings.options.autoAdd && settings.options.autoAdd.helpBlocks ) {
                        $helpBlock = $ ( '<div class="help-block" />' ) ; // Create a new div with class 'help-block'.
                        $controlGroup.find ( '.controls' ).append ( $helpBlock ) ; // Append it to the 'controls' div.
                        createdElements.push ( $helpBlock [ 0 ] ) ; // Add the raw DOM element to the tracking array.
                    }

                    // =============================================================
                    //                                     SNIFF HTML FOR VALIDATORS
                    // =============================================================

                    // The "sniffing" process attempts to automatically detect validation rules
                    // from standard HTML5 attributes or custom data attributes.

                    // *snort sniff snuffle* - A playful comment indicating the data detection process.

                    if ( settings.options.sniffHtml ) {
                        var message = "" ; // Variable to store validation message.

                        // ---------------------------------------------------------
                        //                                                   PATTERN
                        // ---------------------------------------------------------
                        // Check for the 'pattern' attribute.
                        if ( $this.attr ( "pattern" ) !== undefined ) {
                            message = "Not in the expected format<!-- data-validation-pattern-message to override -->" ;
                            if ( $this.data ( "validationPatternMessage" ) ) {
                                message = $this.data ( "validationPatternMessage" ) ;
                            }
                            $this.data ( "validationPatternMessage" , message ) ;
                            $this.data ( "validationPatternRegex" , $this.attr ( "pattern" ) ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                       MAX
                        // ---------------------------------------------------------
                        // Check for 'max' or 'aria-valuemax' attributes.
                        if ( $this.attr ( "max" ) !== undefined || $this.attr ( "aria-valuemax" ) !== undefined ) {
                            var max = ( $this.attr ( "max" ) !== undefined ? $this.attr ( "max" ) : $this.attr ( "aria-valuemax" ) ) ;
                            message = "Too high: Maximum of '" + max + "'<!-- data-validation-max-message to override -->" ;
                            if ( $this.data ( "validationMaxMessage" ) ) {
                                message = $this.data ( "validationMaxMessage" ) ;
                            }
                            $this.data ( "validationMaxMessage" , message ) ;
                            $this.data ( "validationMaxMax" , max ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                       MIN
                        // ---------------------------------------------------------
                        // Check for 'min' or 'aria-valuemin' attributes.
                        if ( $this.attr ( "min" ) !== undefined || $this.attr ( "aria-valuemin" ) !== undefined ) {
                            var min = ( $this.attr ( "min" ) !== undefined ? $this.attr ( "min" ) : $this.attr ( "aria-valuemin" ) ) ;
                            message = "Too low: Minimum of '" + min + "'<!-- data-validation-min-message to override -->" ;
                            if ( $this.data ( "validationMinMessage" ) ) {
                                message = $this.data ( "validationMinMessage" ) ;
                            }
                            $this.data ( "validationMinMessage" , message ) ;
                            $this.data ( "validationMinMin" , min ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                 MAXLENGTH
                        // ---------------------------------------------------------
                        // Check for the 'maxlength' attribute.
                        if ( $this.attr ( "maxlength" ) !== undefined ) {
                            message = "Too long: Maximum of '" + $this.attr ( "maxlength" ) + "' characters<!-- data-validation-maxlength-message to override -->" ;
                            if ( $this.data ( "validationMaxlengthMessage" ) ) {
                                message = $this.data ( "validationMaxlengthMessage" ) ;
                            }
                            $this.data ( "validationMaxlengthMessage" , message ) ;
                            $this.data ( "validationMaxlengthMaxlength" , $this.attr ( "maxlength" ) ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                 MINLENGTH
                        // ---------------------------------------------------------
                        // Check for the 'minlength' attribute.
                        if ( $this.attr ( "minlength" ) !== undefined ) {
                            message = "Too short: Minimum of '" + $this.attr ( "minlength" ) + "' characters<!-- data-validation-minlength-message to override -->" ;
                            if ( $this.data ( "validationMinlengthMessage" ) ) {
                                message = $this.data ( "validationMinlengthMessage" ) ;
                            }
                            $this.data ( "validationMinlengthMessage" , message ) ;
                            $this.data ( "validationMinlengthMinlength" , $this.attr ( "minlength" ) ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                  REQUIRED
                        // ---------------------------------------------------------
                        // Check for 'required' or 'aria-required' attributes.
                        if ( $this.attr ( "required" ) !== undefined || $this.attr ( "aria-required" ) !== undefined ) {
                            message = settings.builtInValidators.required.message ;
                            if ( $this.data ( "validationRequiredMessage" ) ) {
                                message = $this.data ( "validationRequiredMessage" ) ;
                            }
                            $this.data ( "validationRequiredMessage" , message ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                    NUMBER
                        // ---------------------------------------------------------
                        // Check if the input type is 'number'.
                        if ( $this.attr ( "type" ) !== undefined && $this.attr ( "type" ).toLowerCase ( ) === "number" ) {
                            message = settings.builtInValidators.number.message ;
                            if ( $this.data ( "validationNumberMessage" ) ) {
                                message = $this.data ( "validationNumberMessage" ) ;
                            }
                            $this.data ( "validationNumberMessage" , message ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                     EMAIL
                        // ---------------------------------------------------------
                        // Check if the input type is 'email'.
                        if ( $this.attr ( "type" ) !== undefined && $this.attr ( "type" ).toLowerCase ( ) === "email" ) {
                            message = "Not a valid email address<!-- data-validator-validemail-message to override -->" ;
                            if ( $this.data ( "validationValidemailMessage" ) ) {
                                message = $this.data ( "validationValidemailMessage" ) ;
                            } else if ( $this.data ( "validationEmailMessage" ) ) {
                                message = $this.data ( "validationEmailMessage" ) ;
                            }
                            $this.data ( "validationValidemailMessage" , message ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                MINCHECKED
                        // ---------------------------------------------------------
                        // Check for the 'minchecked' attribute (for checkboxes/radio groups).
                        if ( $this.attr ( "minchecked" ) !== undefined ) {
                            message = "Not enough options checked; Minimum of '" + $this.attr ( "minchecked" ) + "' required<!-- data-validation-minchecked-message to override -->" ;
                            if ( $this.data ( "validationMincheckedMessage" ) ) {
                                message = $this.data ( "validationMincheckedMessage" ) ;
                            }
                            $this.data ( "validationMincheckedMessage" , message ) ;
                            $this.data ( "validationMincheckedMinchecked" , $this.attr ( "minchecked" ) ) ;
                        }
                        // ---------------------------------------------------------
                        //                                                MAXCHECKED
                        // ---------------------------------------------------------
                        // Check for the 'maxchecked' attribute.
                        if ( $this.attr ( "maxchecked" ) !== undefined ) {
                            message = "Too many options checked; Maximum of '" + $this.attr ( "maxchecked" ) + "' required<!-- data-validation-maxchecked-message to override -->" ;
                            if ( $this.data ( "validationMaxcheckedMessage" ) ) {
                                message = $this.data ( "validationMaxcheckedMessage" ) ;
                            }
                            $this.data ( "validationMaxcheckedMessage" , message ) ;
                            $this.data ( "validationMaxcheckedMaxchecked" , $this.attr ( "maxchecked" ) ) ;
                        }
                    } // End of sniffHtml block

                    // =============================================================
                    //                                       COLLECT VALIDATOR NAMES
                    // =============================================================

                    // Retrieve named validators from the 'data-validation' attribute.
                    if ( $this.data ( "validation" ) !== undefined ) {
                        validatorNames = $this.data ( "validation" ).split ( "," ) ;
                    }

                    // Also collect validators defined through custom data attributes (e.g., data-validation-email).
                    $.each ( $this.data ( ) , function ( i, el ) {
                        var parts = i.replace ( /([A-Z])/g , ",$1" ).split ( "," ) ;
                        if ( parts [ 0 ] === "validation" && parts [ 1 ] ) {
                            validatorNames.push ( parts [ 1 ] ) ;
                        }
                    } ) ;

                    // =============================================================
                    //                                     NORMALISE VALIDATOR NAMES
                    // =============================================================

                    var validatorNamesToInspect = validatorNames ;
                    var newValidatorNamesToInspect = [ ] ;

                    do { // Loop to repeatedly expand 'shortcut' validators into their real validators.
                        // Uppercase only the first letter of each validator name for consistency.
                        $.each ( validatorNames , function ( i, el ) {
                            validatorNames [ i ] = formatValidatorName ( el ) ;
                        } ) ;

                        // Remove any duplicate validator names from the list.
                        validatorNames = $.unique ( validatorNames ) ;

                        // Initialize the array for new validators to inspect in the next iteration.
                        newValidatorNamesToInspect = [ ] ;
                        $.each ( validatorNamesToInspect , function ( i, el ) {
                            // Check if the current validator name is a custom shortcut.
                            if ( $this.data ( "validation" + el + "Shortcut" ) !== undefined ) {
                                // If it's a custom shortcut, split its value (comma-separated list of validators)
                                // and add them to the list for inspection.
                                $.each ( $this.data ( "validation" + el + "Shortcut" ).split ( "," ) , function ( i2, el2 ) {
                                    newValidatorNamesToInspect.push ( el2 ) ;
                                } ) ;
                            } else if ( settings.builtInValidators [ el.toLowerCase ( ) ] ) {
                                // Check if it's a recognized built-in validator.
                                var validator = settings.builtInValidators [ el.toLowerCase ( ) ] ;
                                if ( validator.type.toLowerCase ( ) === "shortcut" ) {
                                    // If the built-in validator is itself a shortcut, expand it.
                                    $.each ( validator.shortcut.split ( "," ) , function ( i, el ) {
                                        el = formatValidatorName ( el ) ;
                                        newValidatorNamesToInspect.push ( el ) ;
                                        validatorNames.push ( el ) ; // Add to the main validatorNames list as well.
                                    } ) ;
                                }
                            }
                        } ) ;

                        validatorNamesToInspect = newValidatorNamesToInspect ; // Update the list for the next iteration.

                    } while ( validatorNamesToInspect.length > 0 ) // Continue as long as there are new validators to inspect.

                    // =============================================================
                    //                                       SET UP VALIDATOR ARRAYS
                    // =============================================================

                    // Object to store the categorized validators.
                    var validators = { } ;

                    $.each ( validatorNames , function ( i, el ) {
                        // Get the override message for the current validator, if provided.
                        var message = $this.data ( "validation" + el + "Message" ) ;
                        var hasOverrideMessage = ( message !== undefined ) ;
                        var foundValidator = false ; // Flag to track if the validator was found.

                        // Set a default message if no override is provided.
                        message =
                            (
                            message ? message : "'" + el + "' validation failed <!-- Add attribute 'data-validation-" + el.toLowerCase ( ) + "-message' to input to change this message -->"
                        ) ;

                        // Iterate through defined validator types (e.g., 'builtin', 'custom').
                        $.each(
                            settings.validatorTypes ,
                            function ( validatorType, validatorTemplate ) {
                                if ( validators [ validatorType ] === undefined ) {
                                    validators [ validatorType ] = [ ] ; // Initialize array for this type if it doesn't exist.
                                }
                                // If validator hasn't been found yet, and a data attribute for this validator template exists.
                                if ( ! foundValidator && $this.data ( "validation" + el + formatValidatorName ( validatorTemplate.name ) ) !== undefined ) {
                                    validators [ validatorType ].push (
                                        $.extend (
                                            true , {
                                                name: formatValidatorName ( validatorTemplate.name ) ,
                                                message: message
                                            } ,
                                            validatorTemplate.init ( $this, el )
                                        )
                                    ) ;
                                    foundValidator = true ; // Mark as found.
                                }
                            }
                        ) ; // End of $.each(settings.validatorTypes)

                        // If validator still not found, check built-in validators.
                        if ( ! foundValidator && settings.builtInValidators [ el.toLowerCase ( ) ] ) {

                            var validator = $.extend ( true, { } , settings.builtInValidators [ el.toLowerCase ( ) ] ) ;
                            if ( hasOverrideMessage ) {
                                validator.message = message ; // Apply override message.
                            }
                            var validatorType = validator.type.toLowerCase ( ) ;

                            if ( validatorType === "shortcut" ) {
                                foundValidator = true ; // Shortcuts are handled, so mark as found.
                            } else {
                                $.each(
                                    settings.validatorTypes ,
                                    function ( validatorTemplateType, validatorTemplate ) {
                                        if ( validators [ validatorTemplateType ] === undefined ) {
                                            validators [ validatorTemplateType ] = [ ] ;
                                        }
                                        // If validator not found and type matches template type.
                                        if ( ! foundValidator && validatorType === validatorTemplateType.toLowerCase ( ) ) {
                                            $this.data ( "validation" + el + formatValidatorName ( validatorTemplate.name ) , validator [ validatorTemplate.name.toLowerCase ( ) ] ) ;
                                            validators [ validatorType ].push (
                                                $.extend (
                                                    validator ,
                                                    validatorTemplate.init ( $this, el )
                                                )
                                            ) ;
                                            foundValidator = true ; // Mark as found.
                                        }
                                    }
                                ) ; // End of $.each(settings.validatorTypes)
                            }
                        }

                        // If after all checks, the validator is still not found, throw an error.
                        if ( ! foundValidator ) {
                            $.error ( "Cannot find validation info for '" + el + "'" ) ;
                        }
                    } ) ; // End of $.each(validatorNames)

                    // =============================================================
                    //                                         STORE FALLBACK VALUES
                    // =============================================================

                    // Store original HTML content of the help block for potential restoration.
                    $helpBlock.data (
                        "original-contents" , (
                            $helpBlock.data ( "original-contents" ) ? $helpBlock.data ( "original-contents" ) : $helpBlock.html ( )
                        )
                    ) ;

                    // Store original ARIA role of the help block.
                    $helpBlock.data (
                        "original-role" , (
                            $helpBlock.data ( "original-role" ) ? $helpBlock.data ( "original-role" ) : $helpBlock.attr ( "role" )
                        )
                    ) ;

                    // Store original CSS classes of the control group.
                    $controlGroup.data (
                        "original-classes" , (
                            $controlGroup.data ( "original-clases" ) ? $controlGroup.data ( "original-classes" ) : $controlGroup.attr ( "class" )
                        )
                    ) ;

                    // Store original ARIA-invalid state of the input element.
                    $this.data (
                        "original-aria-invalid" , (
                            $this.data ( "original-aria-invalid" ) ? $this.data ( "original-aria-invalid" ) : $this.attr ( "aria-invalid" )
                        )
                    ) ;

                    // =============================================================
                    //                                                    VALIDATION
                    // =============================================================

                    // Bind the 'validation.validation' event to the element.
                    // This event is triggered to perform the actual validation.
                    $this.bind (
                        "validation.validation" ,
                        function ( event, params ) {

                            var value = getValue ( $this ) ; // Get the current value of the input.

                            // Array to accumulate messages for errors found.
                            var errorsFound = [ ] ;

                            // Iterate through each validator type and its associated validators.
                            $.each ( validators , function ( validatorType, validatorTypeArray ) {
                                // Only validate if there's a value, or if explicitly told to include empty,
                                // or if the validator blocks submit and we are submitting.
                                if ( value || value.length || ( params && params.includeEmpty ) || ( !! settings.validatorTypes [ validatorType ].blockSubmit && params && !! params.submitting ) ) {
                                    $.each ( validatorTypeArray , function ( i, validator ) {
                                        // Execute the validation function for the current validator.
                                        if ( settings.validatorTypes [ validatorType ].validate ( $this, value, validator ) ) {
                                            errorsFound.push ( validator.message ) ; // Add error message if validation fails.
                                        }
                                    } ) ;
                                }
                            } ) ;

                            return errorsFound ; // Return the list of error messages.
                        }
                    ) ;

                    // Bind the 'getValidators.validation' event.
                    // This event can be triggered to retrieve the validators associated with the element.
                    $this.bind (
                        "getValidators.validation" ,
                        function ( ) {
                            return validators ; // Return the validators object.
                        }
                    ) ;

                    // =============================================================
                    //                                             WATCH FOR CHANGES
                    // =============================================================

                    // This event is triggered when the input element loses focus.
                    $this.bind (
                        "validationLostFocus.validation" ,
                        function ( ) {
                            // If the 'unsubmit' option is enabled, re-trigger validation on all inputs in the form.
                            if ( settings.options.unsubmit ) {
                                var $form = $this.parents ( "form" ).first ( ) ;
                                $form.find ( "input,textarea,select" )
                                    .not ( "[type=submit],[type=image]" )
                                    .trigger ( "submit.validation" ) ;
                            }
                            var $controlGroup = $this.parents ( ".form-group" ).first ( ) ; // Get the parent control group.
                            // Trigger the main validation logic, including validation for empty fields.
                            var errorsFound = $this.triggerHandler ( "validation.validation" , {
                                includeEmpty: true
                            } ) ;

                            // If any errors were found during validation.
                            if ( errorsFound.length > 0 ) {
                                $controlGroup.removeClass ( "success error" ).addClass ( "warning" ) ; // Set control group to 'warning' state.
                                // Clear existing help block content if not prepending.
                                if ( settings.options.semanticallyStrict && ! settings.options.prependExistingHelpBlock ) {
                                    $helpBlock.html ( "" ) ;
                                }
                                for ( var i = 0 ; i < errorsFound.length ; i++ ) {
                                    var message = errorsFound [ i ] ;
                                    // Append error messages to the help block.
                                    if ( settings.options.semanticallyStrict && ! settings.options.prependExistingHelpBlock ) {
                                        $helpBlock.html ( message ) ; // Overwrite if strict and not prepending.
                                    } else {
                                        $helpBlock.append ( message + "<br>" ) ; // Append with a line break.
                                    }
                                }
                            } else {
                                $controlGroup.removeClass ( "warning error success" ) ; // Remove all validation states.
                                if ( errorsFound.length === 0 ) {
                                    $controlGroup.addClass ( "success" ) ; // Add 'success' class if no errors.
                                }
                                $helpBlock.html ( $helpBlock.data ( "original-contents" ) ) ; // Restore original help block content.
                            }

                            // Update the 'aria-invalid' attribute based on validation status.
                            if ( errorsFound.length > 0 ) {
                                $this.attr ( "aria-invalid" , "true" ) ;
                            } else {
                                $this.attr ( "aria-invalid" , "false" ) ;
                            }
                        }
                    ) ; // End of validationLostFocus binding

                    // Bind the 'focus.validation' event to clear validation states when an element gains focus.
                    $this.bind ( "focus.validation" , function ( ) {
                        $controlGroup.removeClass ( "warning error success" ) ; // Clear all validation classes.
                        $helpBlock.html ( $helpBlock.data ( "original-contents" ) ) ; // Restore help block content.
                        $this.attr ( "aria-invalid" , "false" ) ; // Set aria-invalid to false.
                    } ) ;

                    // =============================================================
                    //                                       WATCH FOR INPUT CHANGES
                    // =============================================================
                    // Bind change, click, and keyup events to trigger validation on user input.
                    $this.bind ( "change.validation click.validation keyup.validation" , function ( e ) {
                        // For keyup, only validate every 3 characters (or if it's the first character).
                        if ( e.type !== "keyup" ||
                            ( Math.floor ( $this.val ( ).length / 3 ) !== Math.floor ( ( $this.val ( ).length - 1 ) / 3 ) ) ) {
                            // Trigger validation, including empty fields.
                            var errorsFound = $this.triggerHandler ( "validation.validation" , {
                                includeEmpty: true
                            } ) ;
                            if ( errorsFound.length > 0 ) {
                                $controlGroup.removeClass ( "success error" ).addClass ( "warning" ) ; // Set to warning state.
                                $helpBlock.html ( $helpBlock.data ( "original-contents" ) ) ; // Clear and restore base content.
                                for ( var i = 0 ; i < errorsFound.length ; i++ ) {
                                    var message = errorsFound [ i ] ;
                                    // Append error messages.
                                    if ( settings.options.semanticallyStrict && ! settings.options.prependExistingHelpBlock ) {
                                        $helpBlock.append ( message ) ; // Append directly if strict.
                                    } else {
                                        $helpBlock.append ( message + "<br>" ) ; // Append with line break.
                                    }
                                }
                            } else {
                                $controlGroup.removeClass ( "warning error success" ) ; // Clear validation states.
                                if ( errorsFound.length === 0 ) {
                                    $controlGroup.addClass ( "success" ) ; // Add success class.
                                }
                                $helpBlock.html ( $helpBlock.data ( "original-contents" ) ) ; // Restore help block content.
                            }
                            // Update aria-invalid attribute.
                            if ( errorsFound.length > 0 ) {
                                $this.attr ( "aria-invalid" , "true" ) ;
                            } else {
                                $this.attr ( "aria-invalid" , "false" ) ;
                            }
                        }
                    } ) ; // End of change/click/keyup binding

                    // For input fields, bind keydown to clear validation states immediately.
                    $this.filter ( "input" ).bind ( "keydown.validation" , function ( e ) {
                        // Ignore tab, enter, and escape keys.
                        if ( e.which === 9 || e.which === 13 || e.which === 27 ) {
                            return ;
                        }
                        var $this = $ ( this ) ; // Current input element.
                        var controlGroup = $this.parents ( ".form-group" ).first ( ) ; // Parent control group.
                        controlGroup.removeClass ( "success error warning" ) ; // Clear all validation classes.
                        $helpBlock.html ( $helpBlock.data ( "original-contents" ) ) ; // Restore help block content.
                        $this.attr ( "aria-invalid" , "false" ) ; // Set aria-invalid to false.
                    } ) ;
                } ) ; // End of this.each function
            } , // End of init method

            // Method to destroy the validation for selected elements.
            destroy: function ( ) {

                return this.each ( function ( ) {
                    var $this = $ ( this ) , // Current element.
                        $controlGroup = $this.parents ( ".form-group" ).first ( ) , // Parent control group.
                        $helpBlock = $controlGroup.find ( ".help-block" ).first ( ) ; // Help block.

                    // Unbind all custom validation events from the element, control group, and form.
                    $this.unbind ( '.validation' ) ;
                    $controlGroup.unbind ( '.validation' ) ;
                    // Note: original code has $form.unbind('.validation'); but $form is not in scope here.
                    // This might be a bug in the original library or implies $form is globally accessible in some contexts.
                    // For Type I, I must preserve it as is, even if it's a potential bug.
                    $form.unbind ( '.validation' ) ; // Assuming $form is accessible or this is intended.

                    // Reset all elements back to their original state using stored data.
                    $controlGroup.attr ( "class" , $controlGroup.data ( "original-classes" ) ) ;
                    $helpBlock.html ( $helpBlock.data ( "original-contents" ) ) ;
                    $helpBlock.attr ( "role" , $helpBlock.data ( "original-role" ) ) ;
                    $this.attr ( "aria-invalid" , $this.data ( "original-aria-invalid" ) ) ;

                    // Remove any help block elements that were dynamically created by the plugin.
                    for ( var i = 0 ; i < createdElements.length ; i++ ) {
                        if ( createdElements [ i ].id === $helpBlock [ 0 ].id ) {
                            createdElements.splice ( i, 1 ) ; // Remove from tracking array.
                            $helpBlock.remove ( ) ; // Remove the DOM element.
                            break ; // Exit loop once found and removed.
                        }
                    }
                } ) ; // End of destroy.each
            } , // End of destroy method

            // Method to collect all validation errors for the selected elements.
            collectErrors: function ( includeEmpty ) {
                var errorMessages = { } ; // Object to store error messages, keyed by input name.
                this.each ( function ( i, el ) {
                    var $this = $ ( el ) ; // Current element.
                    // Trigger validation to get errors, optionally including empty fields.
                    var errors = $this.triggerHandler ( "validation.validation" , {
                        includeEmpty: includeEmpty
                    } ) ;
                    errorMessages [ $this.attr ( "name" ) ] = errors ; // Store errors under the element's name.
                } ) ;
                return errorMessages ; // Return the collected error messages.
            } , // End of collectErrors method

            // Method to check if any of the selected elements have validation errors.
            hasErrors: function ( ) {
                var argumentsForTrigger = [ ] ;
                // Collect additional arguments passed to hasErrors (if any).
                for ( var i = 1 ; i < arguments.length ; i++ ) {
                    argumentsForTrigger.push ( arguments [ i ] ) ;
                }
                // Iterate through each selected element.
                for ( var i = 0 ; i < this.length ; i++ ) {
                    var $this = $ ( this [ i ] ) ;
                    // Trigger 'getValidators.validation' to retrieve validators.
                    var errors = $this.triggerHandler ( "getValidators.validation" , argumentsForTrigger ) ;
                    // Check if any validator type has associated validators.
                    for ( var validatorType in errors ) {
                        for ( var validatorName in errors [ validatorType ] ) {
                            // If a validator exists, it implies there could be errors.
                            // The original logic here seems to just check for *existence* of a validator, not actual errors.
                            // This function's name "hasErrors" might be misleading based on implementation.
                            if ( errors [ validatorType ].hasOwnProperty ( validatorName ) ) {
                                return true ; // Return true as soon as any validator is found.
                            }
                        }
                    }
                }
                return false ; // Return false if no validators (or thus no errors) are found.
            } , // End of hasErrors method

            // Method to update validation rules for an element.
            updateValidation: function ( validatorNames, options ) {
                return this.each ( function ( ) {
                    var $this = $ ( this ) ;
                    var newValidatorNames = validatorNames.split ( "," ) ;
                    var existingValidatorNames = $this.data ( "validation" ).split ( "," ) ;
                    // Combine existing and new validator names.
                    var allValidatorNames = existingValidatorNames.concat ( newValidatorNames ) ;
                    $this.data ( "validation" , allValidatorNames.join ( "," ) ) ; // Update the data attribute.
                    $this.jqBootstrapValidation ( "init" , options ) ; // Re-initialize validation with new rules.
                } ) ;
            } , // End of updateValidation method

            // Method to destroy validation for an element by clearing its validation data.
            destroyValidation: function ( ) {
                return this.each ( function ( ) {
                    var $this = $ ( this ) ;
                    $this.data ( "validation" , "" ) ; // Clear the validation data attribute.
                    $this.jqBootstrapValidation ( "init" ) ; // Re-initialize to effectively remove validation.
                } ) ;
            } // End of destroyValidation method
        } , // End of methods object

        // Definitions of various validator types and their behavior.
        validatorTypes: {
            // Callback validator type.
            callback: {
                name: "callback" ,
                init: function ( $this, name ) {
                    return {
                        validatorName: name ,
                        callback: $this.data ( "validation" + name + "Callback" ) ,
                        lastValue: $this.val ( ) ,
                        lastValid: true ,
                        lastFinished: true
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    if ( validator.lastFinished === true ) {
                        validator.lastValid = validator.callback ( $this, value, validator ) ;
                        validator.lastFinished = false ;
                    }
                    return ! validator.lastValid ;
                }
            } , // End of callback validator

            // AJAX validator type.
            ajax: {
                name: "ajax" ,
                init: function ( $this, name ) {
                    return {
                        validatorName: "ajax" + name ,
                        url: $this.data ( "validation" + name + "Ajax" ) ,
                        lastValue: $this.val ( ) ,
                        lastValid: true ,
                        lastFinished: true
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    if ( validator.lastFinished === true ) {
                        validator.lastValid = true ;
                        validator.lastFinished = false ;
                        $.ajax ( {
                            url: validator.url ,
                            data: "value=" + value + "&field=" + $this.attr ( "name" ) ,
                            dataType: "json" ,
                            success: function ( data ) {
                                if ( data.status === "success" ) {
                                    validator.lastValid = true ;
                                } else {
                                    validator.lastValid = false ;
                                }
                                validator.lastFinished = true ;
                                $this.trigger ( "validationLostFocus.validation" ) ; // Re-trigger validation on focus loss.
                            } ,
                            error: function ( ) {
                                validator.lastValid = true ; // On error, assume valid to not block submission.
                                validator.lastFinished = true ;
                                $this.trigger ( "validationLostFocus.validation" ) ;
                            }
                        } ) ;
                    }
                    return ! validator.lastValid ;
                }
            } , // End of ajax validator

            // Regex validator type.
            regex: {
                name: "regex" ,
                init: function ( $this, name ) {
                    return {
                        regex: $this.data ( "validation" + name + "Regex" )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( ! validator.regex ) ||
                        ( ! new RegExp ( validator.regex ).test ( value ) )
                    ) ;
                }
            } , // End of regex validator

            // Email validator type.
            email: {
                name: "email" ,
                validate: function ( $this, value ) {
                    // Regular expression to validate standard email format.
                    return (
                        ! new RegExp ( /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ).test ( value ) &&
                        // Also checks for base64 encoded image data, likely to prevent specific attacks or invalid inputs.
                        ! new RegExp ( /^data:image\/(png|jpg|jpeg|gif);base64,[0-9A-Za-z\+\/\=]+$/ ).test ( value )
                    ) ;
                } ,
                blockSubmit: true // This validator blocks form submission if invalid.
            } , // End of email validator

            // Required field validator.
            required: {
                name: "required" ,
                validate: function ( $this, value ) {
                    return ! ! ( value.length === 0 ) ; // Returns true if value is empty.
                } ,
                blockSubmit: true
            } , // End of required validator

            // Number validator.
            number: {
                name: "number" ,
                validate: function ( $this, value ) {
                    return ! new RegExp ( /^[0-9]*$/ ).test ( value ) ; // Returns true if not a pure number.
                } ,
                blockSubmit: true
            } , // End of number validator

            // Max checked validator (for checkboxes/radio buttons).
            maxchecked: {
                name: "maxchecked" ,
                init: function ( $this, name ) {
                    return {
                        maxchecked: $this.data ( "validation" + name + "Maxchecked" )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( parseInt ( validator.maxchecked, 10 ) < $this.find ( "input:checked" ).length )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of maxchecked validator

            // Min checked validator.
            minchecked: {
                name: "minchecked" ,
                init: function ( $this, name ) {
                    return {
                        minchecked: $this.data ( "validation" + name + "Minchecked" )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( parseInt ( validator.minchecked, 10 ) > $this.find ( "input:checked" ).length )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of minchecked validator

            // Max value validator.
            maxvalue: {
                name: "maxvalue" ,
                init: function ( $this, name ) {
                    return {
                        maxvalue: parseFloat ( $this.data ( "validation" + name + "Maxvalue" ) )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( parseFloat ( value ) > parseFloat ( validator.maxvalue ) )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of maxvalue validator

            // Min value validator.
            minvalue: {
                name: "minvalue" ,
                init: function ( $this, name ) {
                    return {
                        minvalue: parseFloat ( $this.data ( "validation" + name + "Minvalue" ) )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( parseFloat ( value ) < parseFloat ( validator.minvalue ) )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of minvalue validator

            // Max length validator.
            maxlength: {
                name: "maxlength" ,
                init: function ( $this, name ) {
                    return {
                        maxlength: parseInt ( $this.data ( "validation" + name + "Maxlength" ) , 10 )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( value.length > validator.maxlength )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of maxlength validator

            // Min length validator.
            minlength: {
                name: "minlength" ,
                init: function ( $this, name ) {
                    return {
                        minlength: parseInt ( $this.data ( "validation" + name + "Minlength" ) , 10 )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( value.length < validator.minlength )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of minlength validator

            // Max validator (for numeric inputs).
            max: {
                name: "max" ,
                init: function ( $this, name ) {
                    return {
                        max: parseFloat ( $this.data ( "validation" + name + "Max" ) )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( parseFloat ( value ) > parseFloat ( validator.max ) )
                    ) ;
                } ,
                blockSubmit: true
            } , // End of max validator

            // Min validator.
            min: {
                name: "min" ,
                init: function ( $this, name ) {
                    return {
                        min: parseFloat ( $this.data ( "validation" + name + "Min" ) )
                    } ;
                } ,
                validate: function ( $this, value, validator ) {
                    return (
                        ( parseFloat ( value ) < parseFloat ( validator.min ) )
                    ) ;
                } ,
                blockSubmit: true
            } // End of min validator
        } , // End of validatorTypes object

        // Built-in validators, some of which are shortcuts to other validators.
        builtInValidators: {
            email: {
                name: "Email" ,
                type: "shortcut" ,
                shortcut: "validemail"
            } ,
            password: {
                name: "Password" ,
                type: "shortcut" ,
                shortcut: "rangelength[6,30],validemail"
            } ,
            required: {
                name: "Required" ,
                type: "required" ,
                message: "This field is required <!-- data-validation-required-message to override -->" ,
                blockSubmit: true
            } ,
            number: {
                name: "Number" ,
                type: "number" ,
                message: "Must be a number <!-- data-validation-number-message to override -->" ,
                blockSubmit: true
            } ,
            integer: {
                name: "Integer" ,
                type: "regex" ,
                regex: "^-?\\d+$" ,
                message: "No decimal places allowed <!-- data-validation-integer-message to override -->" ,
                blockSubmit: true
            } ,
            ipv4: {
                name: "IPv4" ,
                type: "regex" ,
                regex: "^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])$" ,
                message: "Please enter a valid IPv4 address <!-- data-validation-ipv4-message to override -->" ,
                blockSubmit: true
            } ,
            url: {
                name: "Url" ,
                type: "regex" ,
                regex: "^(https?|ftp):\\/\\/(((([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:)*@)?(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])*([a-z]|\\d|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]))\\.?(:\\d*)?)(\\/((([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)+(\\/([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)*)*)?(\\?((([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)|[\\uE000-\\uF8FF]|\\/|\\?)*)?(\\#((([a-z]|\\d|-|\\.|_|~|[\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)|\\/|\\?)*)?$" ,
                message: "Please enter a valid URL <!-- data-validation-url-message to override -->" ,
                blockSubmit: true
            } ,
            date: {
                name: "Date" ,
                type: "regex" ,
                regex: "^([0-1][0-9]|[0-9])\\/([0-3][0-9]|[0-9])\\/[0-9]{4}$" ,
                message: "Please enter a valid date in MM/DD/YYYY format <!-- data-validation-date-message to override -->" ,
                blockSubmit: true
            } ,
            dateiso: {
                name: "DateISO" ,
                type: "regex" ,
                regex: "^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$" ,
                message: "Please enter a valid date in YYYY-MM-DD format <!-- data-validation-dateiso-message to override -->" ,
                blockSubmit: true
            } ,
            alphanumeric: {
                name: "Alphanumeric" ,
                type: "regex" ,
                regex: "^[a-zA-Z0-9]*$" ,
                message: "Must consist of only numbers and letters <!-- data-validation-alphanumeric-message to override -->" ,
                blockSubmit: true
            } ,
            minlength: {
                name: "MinLength" ,
                type: "minlength" ,
                message: "Too short <!-- data-validation-minlength-message to override -->" ,
                blockSubmit: true
            } ,
            maxlength: {
                name: "MaxLength" ,
                type: "maxlength" ,
                message: "Too long <!-- data-validation-maxlength-message to override -->" ,
                blockSubmit: true
            } ,
            rangelength: {
                name: "RangeLength" ,
                type: "shortcut" ,
                shortcut: "minlength[%1],maxlength[%2]" ,
                message: "Must be between %1 and %2 characters long <!-- data-validation-rangelength-message to override -->" ,
                blockSubmit: true
            } ,
            minvalue: {
                name: "MinValue" ,
                type: "minvalue" ,
                message: "Value is too low <!-- data-validation-minvalue-message to override -->" ,
                blockSubmit: true
            } ,
            maxvalue: {
                name: "MaxValue" ,
                type: "maxvalue" ,
                message: "Value is too high <!-- data-validation-maxvalue-message to override -->" ,
                blockSubmit: true
            } ,
            rangevalue: {
                name: "RangeValue" ,
                type: "shortcut" ,
                shortcut: "minvalue[%1],maxvalue[%2]" ,
                message: "Value must be between %1 and %2 <!-- data-validation-rangevalue-message to override -->" ,
                blockSubmit: true
            } ,
            minchecked: {
                name: "MinChecked" ,
                type: "minchecked" ,
                message: "Not enough boxes checked <!-- data-validation-minchecked-message to override -->" ,
                blockSubmit: true
            } ,
            maxchecked: {
                name: "MaxChecked" ,
                type: "maxchecked" ,
                message: "Too many boxes checked <!-- data-validation-maxchecked-message to override -->" ,
                blockSubmit: true
            } ,
            rangechecked: {
                name: "RangeChecked" ,
                type: "shortcut" ,
                shortcut: "minchecked[%1],maxchecked[%2]" ,
                message: "Check between %1 and %2 boxes <!-- data-validation-rangechecked-message to override -->" ,
                blockSubmit: true
            }
        } // End of builtInValidators object
    } ; // End of defaults object definition

    // Helper function to format validator names (e.g., 'minlength' -> 'Minlength').
    var formatValidatorName = function ( name ) {
        return name.toLowerCase ( ).replace ( /(^|\s)([a-z])/g , function ( m, p1, p2 ) {
            return p1 + p2.toUpperCase ( ) ;
        } ) ;
    } ; // End of formatValidatorName function

    // Helper function to get the value of an input element, handling different input types.
    var getValue = function ( $this ) {
        // If it's a radio button group, get the value of the checked radio.
        if ( $this.is ( "[type='radio']" ) ) {
            return $ ( "input[name='" + $this.attr ( "name" ) + "']:checked" ).val ( ) ;
        }
        // If it's a checkbox group, return its value if checked, otherwise empty string.
        else if ( $this.is ( "[type='checkbox']" ) ) {
            return $this.is ( ":checked" ) ? $this.val ( ) : "" ;
        }
        // For all other input types, return the standard value.
        else {
            return $this.val ( ) ;
        }
    } ; // End of getValue function

    // Extend jQuery's prototype with the jqBootstrapValidation plugin.
    $.fn.jqBootstrapValidation = function ( method ) {

        // Check if the requested method exists in our defaults.methods.
        if ( defaults.methods [ method ] ) {
            // Call the method with 'this' as context and pass arguments.
            return defaults.methods [ method ].apply ( this , Array.prototype.slice.call ( arguments, 1 ) ) ;
        }
        // If 'method' is an object or undefined, it means 'init' method should be called.
        else if ( typeof method === 'object' || ! method ) {
            return defaults.methods.init.apply ( this , arguments ) ;
        }
        // If method does not exist, throw an error.
        else {
            $.error ( 'Method ' + method + ' does not exist on jQuery.jqBootstrapValidation' ) ;
            return null ;
        }

    } ; // End of $.fn.jqBootstrapValidation

    // Document ready function to auto-initialize validation on elements with 'data-validation' attribute.
    $ ( function ( ) {
        $ ( "[data-validation]" ).jqBootstrapValidation ( {
            autoAdd: {
                helpBlocks: false // Do not auto-add help blocks for these, assume they exist or are handled otherwise.
            }
        } ) ;
    } ) ;

    // Handle the global 'reset' event on forms to clear validation messages.
    $ ( document ).on ( "reset" , function ( e ) {
        var $form = $ ( e.target ) ; // The form element that was reset.
        if ( $form.is ( "form" ) ) { // Ensure it's actually a form.
            $form.find ( ".form-group > .alert" ).remove ( ) ; // Remove any Bootstrap alerts.
            $form.find ( ".form-group" ).removeClass ( "has-error has-success has-warning" ) ; // Remove validation classes.
            $form.find ( ".help-block" ).each ( function ( ) {
                var $this = $ ( this ) ;
                if ( $this.data ( "original-contents" ) ) {
                    $this.html ( $this.data ( "original-contents" ) ) ; // Restore original help block content.
                }
            } ) ;
            $form.find ( "input[aria-invalid]" ).attr ( "aria-invalid" , "false" ) ; // Reset aria-invalid attribute.
        }
    } ) ;

} ( jQuery ) ) ; // End of self-executing anonymous function, passing jQuery.
/*
 * Uni-Form jQuery Plugin with Validation - Extended Edition
 *
 * This plugin facilitates streamlined form interactions in conjunction with the Uni-Form markup structure.
 * This particular iteration incorporates advanced client-side validation capabilities.
 *
 * Primary Author: Ilija Studen (Original concept for Uni-Form integration)
 *
 * Further Enhancements:
 *  - Aris Karageorgos: Implemented the `parents()` function for improved DOM traversal.
 *  - Toni Karlheinz: Introduced functionality for input field text coloring and
 *                    automatic removal of initial placeholder values upon focus.
 *  - Jason Brumwell: Performed significant optimizations, added explicit valid/invalid states,
 *                   and integrated default data attributes.
 *  - LearningStation: Added comprehensive support for client-side validation routines.
 *                     These validation mechanisms are based on an open-source library
 *                     of unspecified authorship.
 *
 * @see http://sprawsm.com/uni-form/
 * @license MIT - Accessible at http://www.opensource.org/licenses/mit-license.php
 * @version 2.1.0 (Clone)
 */
jQuery.fn.uniform  =  function ( extended_settings ) {

    /**
     *  A reference to the current jQuery object for use within closures.
     *  This ensures proper scope for 'this'.
     *
     * @var object self
     */
    var self = this;


    /**
     *  Configuration object, merging default settings with any user-provided overrides.
     *  It extends the base uniform defaults.
     *
     * @var object settings
     */
    var settings = jQuery.extend(

        jQuery.fn.uniform.defaults,

        extended_settings
    );


    /**
     *  Provides internationalization (i18n) strings for various messages and labels.
     *  To extend this, include a separate localization file via a script tag.
     *
     * @var object i18n_strings
     */
    var i18n_strings  =  jQuery.fn.uniform.language;




    /**
     *  Collection of supported validation methods.
     *  Each method performs a specific validation check.
     *
     * @var Object validators
     */
    this.validators  =  {


        /**
         *  Extracts a parameter value for a validator from an element's class attribute.
         *  The parameter is expected in the format 'val-VALUE' following the validator name.
         *
         * @param string name               The name of the validator class (e.g., 'validateMinLength').
         * @param string all_classes_string The full string of classes on the element.
         * @param mixed  default_value      A fallback value if no parameter is found.
         *
         * @return mixed|null Returns the parsed integer value, or the default value if not found.
         */
        get_val  :  function ( name, classes_string, default_value ) {

            var value  =  default_value; // Initialize with the default value.

            var classes  =  classes_string.split( ' ' ); // Split the class string into an array.

            for ( var i = 0;  i < classes.length;  i++ ) { // Iterate through each class.

                if ( classes[i]  ==  name ) { // Check if the current class matches the validator name.

                    // Check if the next class exists and starts with 'val-'.
                    if ( ( classes[i + 1]  !=  'undefined' )  &&  ( 'val-'  ===  classes[i + 1].substr(0,4) ) ) {

                        value  =  parseInt( classes[i + 1].substr(4), 10 ); // Parse the integer value.

                        return value; // Return the found value.

                    }

                }

            }

            return value; // Return the default value if no parameter was found.
        },


        /**
         *  Validates that the field's value is not empty.
         *  Whitespace-only values are considered empty. Handles radio and checkbox types.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        required  :  function ( field, caption ) {

            if ( field.is(':radio') ) { // Special handling for radio buttons.

                var name  =  field.attr('name'); // Get the name attribute.

                if ( $("input[name=" + name + "]:checked").length ) { // Check if any radio button with this name is checked.

                    return true; // Valid.

                }

                return i18n( 'req_radio', caption ); // Error message for required radio.

            }

            if ( field.is(':checkbox') ) { // Special handling for checkboxes.

                var name  =  field.attr('name'); // Get the name attribute.

                if ( field.is(":checked") ) { // Check if the specific checkbox is checked.

                    return true; // Valid.

                }

                return i18n( 'req_checkbox', caption ); // Error message for required checkbox.

            }

            // For other input types, trim and check for emptiness.
            if ( jQuery.trim(field.val())  ==  '' ) {

                return i18n( 'required', caption ); // Error message for general required field.

            }

            return true; // Valid.
        },


        /**
         *  Validates that the field's value meets a minimum length requirement.
         *  The minimum length is retrieved from the element's class attribute (e.g., 'validateMinLength val-5').
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateMinLength  :  function ( field, caption ) {

            var min_length  =  this.get_val('validateMinLength', field.attr('class'), 0); // Get min length parameter.

            // If min_length is set and the field's value length is less than it.
            if ( ( min_length  >  0 )  &&  ( field.val().length  <  min_length ) ) {

                return i18n('minlength', caption, min_length); // Return error message.

            }

            return true; // Valid.
        },


        /**
         *  Validates that the field's numeric value is not less than a specified minimum.
         *  The minimum value is retrieved from the element's class attribute (e.g., 'validateMin val-10').
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateMin  :  function ( field, caption ) {

            var min_val  =  this.get_val('validateMin', field.attr('class'), 0); // Get min value parameter.


            if ( ( parseInt(field.val(),10)  <  min_val ) ) { // Compare parsed integer value.

                return i18n('min', caption, min_val); // Return error message.

            }

            return true; // Valid.
        },


        /**
         *  Validates that the field's value does not exceed a maximum length requirement.
         *  The maximum length is retrieved from the element's class attribute (e.g., 'validateMaxLength val-100').
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateMaxLength  :  function ( field, caption ) {

            var max_length  =  this.get_val('validateMaxLength', field.attr('class'), 0); // Get max length parameter.


            if ( ( max_length  >  0 )  &&  ( field.val().length  >  max_length ) ) { // Check if value length exceeds max.

                return i18n('maxlength', caption, max_length); // Return error message.

            }

            return true; // Valid.
        },


        /**
         *  Validates that the field's numeric value is not greater than a specified maximum.
         *  The maximum value is retrieved from the element's class attribute (e.g., 'validateMax val-100').
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateMax  :  function ( field, caption ) {

            var max_val  =  this.get_val('validateMax', field.attr('class'), 0); // Get max value parameter.


            if ( ( parseInt(field.val(),10)  >  max_val ) ) { // Compare parsed integer value.

                return i18n('max', caption, max_val); // Return error message.

            }

            return true; // Valid.
        },


        /**
         *  Compares the current field's value to the value of another target element.
         *  The target element's name is specified directly in the class attribute:
         *  `class="validateSameAs target_field_name"`.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if values match, or an error message string if they differ.
         */
        validateSameAs  :  function ( field, caption ) {

            var classes  =  field.attr('class').split(' '); // Get all classes.

            var target_field_name  =  ''; // Initialize target field name.


            for ( var i = 0;  i < classes.length;  i++ ) { // Loop through classes.

                if ( classes[i]  ==  'validateSameAs' ) { // If 'validateSameAs' is found.

                    if ( classes[i + 1]  !=  'undefined' ) { // Check if the next class exists.

                        target_field_name  =  classes[i + 1]; // This is the target field's name.

                        break; // Exit loop.

                    }

                }

            }

            if ( target_field_name ) { // If a target field name was found.

                var target_field  =  jQuery('input[name="' + target_field_name + '"]'); // Find the target field.

                if ( target_field.length  >  0 ) { // If the target field exists.

                    if ( target_field.val()  !=  field.val() ) { // Compare values.

                        // Get the caption for the target field, removing any '*' character.
                        var target_field_caption  =  target_field.closest('div.'+settings.holder_class).find('label').text().replace('*','');

                        return i18n('same_as', caption, target_field_caption); // Return error message.

                    }

                }

            }


            return true; // Valid.
        },


        /**
         *  Validates if the field's value is a properly formatted email address.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateEmail  :  function ( field, caption ) {

            // Regular expression for email validation.
            if ( field.val().match(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/) ) {

                return true; // Valid.

            } else {

                return i18n('email', caption); // Return error message.

            }

        },


        /**
         *  Validates if the field's value is a properly formatted URL (http://, https://, ftp://).
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateUrl  :  function ( field, caption ) {

            // Regular expression for URL validation.
            if ( field.val().match(/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i) ) {

                return true; // Valid.

            }

            return i18n('url', caption); // Return error message.
        },


        /**
         *  Validates if the field's value is a valid number (integers and floats).
         *  An empty string is also considered valid.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateNumber  :  function ( field, caption ) {

            // Regular expression for number validation.
            if ( field.val().match(/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/)  ||  field.val()  ==  '' ) {

                return true; // Valid.

            }

            return i18n('number', caption); // Return error message.
        },


        /**
         *  Validates if the field's value is a whole number (integer).
         *  An empty string is also considered valid.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateInteger  :  function ( field, caption ) {

            // Regular expression for integer validation.
            if ( field.val().match(/(^-?\d\d*$)/)  ||  field.val()  ==  '' ) {

                return true; // Valid.

            }

            return i18n('integer', caption); // Return error message.
        },


        /**
         *  Validates if the field's value contains only alphabetic characters.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateAlpha  :  function ( field, caption ) {

            // Regular expression for alphabetic characters only.
            if ( field.val().match(/^[a-zA-Z]+$/) ) {

                return true; // Valid.

            }

            return i18n('alpha', caption); // Return error message.
        },


        /**
         *  Validates if the field's value contains only alphanumeric characters.
         *  It checks for the absence of non-word characters.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateAlphaNum  :  function ( field, caption ) {

            // Regular expression to find any non-word character.
            if ( field.val().match(/\W/) ) {

                return i18n('alphanum', caption); // Return error message if non-alphanumeric found.

            }

            return true; // Valid.
        },


        /**
         *  Validates if the field's value represents a simple phrase, allowing
         *  alphanumeric characters, periods, hyphens, underscores, parentheses,
         *  asterisks, hashes, colons, and commas. An empty string is also valid.
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validatePhrase  :  function ( field, caption ) {

            // Regular expression for simple phrases.
            if ( ( field.val()  ==  '' )  ||  field.val().match(/^[\w\d\.\-_\(\)\*'# :,]+$/i) ) {

                return true; // Valid.

            }

            return i18n('phrase', caption); // Return error message.
        },


        /**
         *  Validates if the field's value is a properly formatted US phone number.
         *  Supports various common formats (e.g., (XXX) XXX-XXXX, XXX-XXX-XXXX).
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validatePhone  :  function ( field, caption ) {

            var phoneNumber  =  /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/; // Regex for phone numbers.

            if ( phoneNumber.test(field.val()) ) { // Test the field's value against the regex.

                return true; // Valid.

            }

            return i18n('phone', caption); // Return error message.
        },


        /**
         *  Validates if the field's value is a date in MM/DD/YYYY format.
         *  Note: This is a basic regex check and does not validate actual date validity (e.g., 31/02 is not caught).
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if valid, or an error message string if invalid.
         */
        validateDate  :  function ( field, caption ) {

            // Regex for MM/DD/YYYY format.
            if ( field.val().match('(1[0-9]|[1-9])/([1-3][0-9]|[1-9])/((19|20)[0-9][0-9]|[0-9][0-9])') ) {

                return true; // Valid.

            }

            return i18n('date', caption); // Return error message.
        },


        /**
         *  Allows for custom, user-defined validation functions.
         *  Usage: `<input name="myinput" class="validateCallback my_custom_validator" />`
         *  This will attempt to execute `window.my_custom_validator(field, caption)`.
         *
         *  Example `my_custom_validator` function:
         *  ```javascript
         *  window.my_custom_validator = function(field, caption) {
         *    if (field.val() === 'expected_value') {
         *      return true; // Valid
         *    } else {
         *      return caption + ' must be "expected_value"'; // Error message
         *    }
         *  };
         *  ```
         *
         * @param jQuery field    The jQuery object representing the input field.
         * @param string caption  A user-friendly name for the field.
         *
         * @return boolean|string Returns true if the callback returns true, or an error message.
         */
        validateCallback  :  function ( field, caption ) {

            var classes  =  field.attr('class').split(' '); // Get all classes.

            var callback_function  =  ''; // Initialize callback function name.


            for ( var i = 0;  i < classes.length;  i++ ) { // Loop through classes.

                if ( classes[i]  ==  'validateCallback' ) { // If 'validateCallback' is found.

                    if ( classes[i + 1]  !=  'undefined' ) { // Check if the next class exists.

                        callback_function  =  classes[i + 1]; // This is the callback function name.

                        break; // Exit loop.

                    }

                }

            }

            // Check if the function exists globally and is actually a function.
            if ( window[callback_function]  !=  'undefined'  &&  ( typeof window[callback_function]  ==  'function' ) ) {

                return window[callback_function](field, caption); // Execute the callback.

            }


            return i18n('callback', caption, callback_function); // Return error if callback not found/valid.
        }

    }; // End of this.validators object.


    /**
     *  A simplified internationalization (i18n) and string formatting function.
     *  It replaces placeholders like '%s' (string) and '%d' (integer) in language strings.
     *
     * @param string lang_key  The key to look up in the `i18n_strings` object.
     * @param mixed  ...args   Additional arguments for substitution into the string.
     *
     * @return string The internationalized and formatted string.
     */
    var i18n  =  function ( lang_key ) {

        var lang_string  =  i18n_strings[lang_key]; // Retrieve the base language string.

        var bits  =  lang_string.split('%'); // Split by the '%' character to find placeholders.

        var out  =  bits[0]; // Start the output with the first part of the string.

        var re  =  /^([ds])(.*)$/; // Regular expression to match '%s' or '%d'.

        for ( var i = 1;  i < bits.length;  i++ ) { // Iterate through the parts after the first '%'.

            var p  =  re.exec(bits[i]); // Attempt to match the placeholder pattern.

            if ( !p  ||  arguments[i]  ==  null ) continue; // If no match or no corresponding argument, skip.

            if ( p[1]  ==  'd' ) { // If it's an integer placeholder.

                out  +=  parseInt(arguments[i], 10); // Append the parsed integer argument.

            } else if ( p[1]  ==  's' ) { // If it's a string placeholder.

                out  +=  arguments[i]; // Append the string argument.

            }

            out  +=  p[2]; // Append any remaining text after the placeholder.
        }

        return out; // Return the fully formatted string.
    };


    /**
     *  Displays a Uni-Form specific form validation error message.
     *  It removes any existing error messages, creates a new one, and scrolls it into view.
     *
     * @param jQuery form      The jQuery object of the form being validated.
     * @param string title     The main title for the error message block.
     * @param array  messages  An array of individual error messages to display as a list.
     *
     * @return false Always returns false to indicate an error state.
     */
    var showFormError  =  function ( form, title, messages ) {

        // Check if an error message div already exists and remove it.
        if ( $('#errorMsg').length ) {

            $('#errorMsg').remove();

        }

        // Create the main error message container.
        var $message  =
            $('<div />')
                .attr( 'id', 'errorMsg' )
                .html( "<h3>" + title + "</h3>" );

        // If there are specific messages, add them as an ordered list.
        if ( messages.length ) {

            $message.append( $('<ol />') ); // Append an empty ordered list.

            for ( var m in messages ) { // Loop through each message.

                $('ol', $message).append( // Append list item to the ordered list.
                    $('<li />').text(messages[m])
                );

            }

        }

        form.prepend($message); // Insert the error message at the beginning of the form.

        // Animate scroll to the top of the form to show the error.
        $('html, body').animate({
            scrollTop: form.offset().top
        }, 500);

        $('#errorMsg').slideDown(); // Slide down the error message for a visual effect.

        return false; // Indicate failure.
    };


    /**
     *  Displays a Uni-Form specific form success message.
     *  It removes any existing success messages, creates a new one, and scrolls it into view.
     *
     * @param jQuery form  The jQuery object of the form that was successfully processed.
     * @param string title The main title for the success message block.
     *
     * @return false Always returns false (consistent with error, though semantically it's a success).
     */
    var showFormSuccess  =  function ( form, title ) {

        // Check if a success message div already exists and remove it.
        if ( $('#okMsg').length ) {

            $('#okMsg').remove();

        }

        // Create the main success message container.
        var $message  =
            $('<div />')
                .attr( 'id', 'okMsg' )
                .html( "<h3>" + title + "</h3>" );

        form.prepend($message); // Insert the success message at the beginning of the form.

        // Animate scroll to the top of the form to show the success message.
        $('html, body').animate({
            scrollTop: form.offset().top
        }, 500);

        $('#okMsg').slideDown(); // Slide down the success message.

        return false; // Indicate completion.
    };


    return this.each(function () {

        var form  =  jQuery(this); // Cache the current form element.


        /**
         *  Sets the validation state (valid/invalid) for a given input field.
         *  It toggles CSS classes and updates the associated hint text.
         *
         * @param object $input  The jQuery object representing the input field.
         * @param bool   valid   True if the field passed validation, false otherwise.
         * @param string text    The validation message to display (error or info).
         *
         * @return null
         */
        var validate  =  function ( $input, valid, text ) {

            // Find the parent holder div and the formHint paragraph.
            var $p  =  $input.closest('div.' + settings.holder_class)
                               .andSelf() // Include the input itself in the selection for toggling.
                               .toggleClass(settings.invalid_class, !valid) // Add/remove invalid class.
                               .toggleClass(settings.error_class, !valid)   // Add/remove error class.
                               .toggleClass(settings.valid_class, valid)     // Add/remove valid class.
                               .find('p.formHint');                         // Find the hint paragraph.

            // If the field is invalid and no info-text is stored, save the current hint text.
            if ( ! valid  &&  ! $p.data('info-text') ) {

                $p.data('info-text', $p.html()); // Store the original hint text.

            }
            // If the field is valid, restore the original hint text if available.
            else if ( valid ) {

                text  =  $p.data('info-text'); // Retrieve the original hint text.

            }

            // Update the hint paragraph with the provided or restored text.
            if ( text ) {

                $p.html(text);

            }
        };


        /**
         *  Initializes form fields for the highlighter functionality.
         *  Sets default colors and handles initial values.
         *
         */
        form.find(settings.field_selector).each(function () {

            var $input  =  $(this), // Current input field.
                value   =  $input.val(); // Current value of the input.

            $input.data('default-color', $input.css('color')); // Store the original text color.

            // If the value is the default or empty, set the default value and color.
            if ( value  ===  $input.data('default-value')  ||  ! value ) {

                $input.not('select').css("color", settings.default_value_color); // Apply default color (excluding selects).

                $input.val($input.data('default-value')); // Set the default value.

            }
        });


        /**
         *  If `ask_on_leave` setting is enabled or the form has the 'askOnLeave' class,
         *  register a `beforeunload` handler. This handler will compare the form's
         *  current state with its initial state to detect unsaved changes.
         *  If changes are detected and the form hasn't been submitted, a warning
         *  will be presented to the user before they leave the page.
         *
         */
        if ( settings.ask_on_leave  ||  form.hasClass('askOnLeave') ) {

            var initial_values  =  form.serialize(); // Capture the initial serialized form data.
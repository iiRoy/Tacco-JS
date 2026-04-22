/*******************************************************************************
 * Validate.js - A JavaScript form validation library for Bootstrap, jQuery, Ajax & PHP
 *
 * This code is provided under the MIT License.
 *
 * Copyright (c) 2013 Michael Bignold
 *
 * Project Repository: https://github.com/cthiggo/validate
 *
 * This file contains the core validation logic, initialization, and helper functions.
 * Extensive modifications have been made to whitespace and comments to create a
 * Type I code clone, while preserving all original identifiers, expressions, and logic.
 *
 ******************************************************************************/


// --- Configuration Variables ---
// These variables can be adjusted as per application requirements.
// They control paths and styling for validation feedback.

    sAjaxPath        = 'validate.php' ;       // Path to the AJAX validation script.
    sErrorTextColour = '#b94a48' ;            // Text color for error messages.
    sErrorBorderColour = '#b94a48' ;          // Border color for erroneous input fields.
    sSuccessTextColour = '#468847' ;          // Text color for successful validation messages.
    sSuccessBorderColour = '#468847' ;        // Border color for successfully validated input fields.


// --- Example Callback Function ---
// This function demonstrates a custom action that can be executed
// upon successful form submission, if specified via 'data-vfunc'.
function doSomething ( )
{
    // Display an alert to the user.
    alert ( 'You have completed all inputs as required, and have submitted!' ) ;

    // Log a message to the browser's console for debugging.
    console . log ( 'You have completed all inputs as required, and have submitted!' ) ;
}




// --- Document Ready Handler ---
// This block executes once the DOM is fully loaded.
$( function ( ) {

    // --- Event Listeners Setup ---
    // Attaching event handlers for validation triggers.

    // Validate inputs on focus out for elements with data-vreq or data-vtype attributes.
    $ ( '*[data-vreq],*[data-vtype]' ) . focusout ( function ( ) {
        validate . input ( $ ( this ) ) ;
    } ) ;

    // Validate chosen select boxes on change event, specifically those with data-vreq.
    $ ( 'select.chosen[data-vreq]' ) . on ( 'change' , function ( ) {
        validate . input ( $ ( this ) ) ;
    } ) ;

    // Handle form submission via a button with data-vsubmit attribute.
    $ ( '*[data-vsubmit]' ) . on ( 'click' , function ( ) {
        validate . submit ( $ ( this ) . closest ( 'form' ) , $ ( this ) ) ;
    } ) ;


    // --- Dynamic CSS Styling ---
    // Injecting custom CSS rules into the document head for validation feedback.
    var sStyle = "<style type='text/css'>"
               + ".tooltip { position: fixed; z-index:10000000; }"
               + "input[type=text].vwarning, input[type=password].vwarning, textarea.vwarning, select.vwarning, .vwarning { border: 1px solid " + sErrorBorderColour + "; color: " + sErrorTextColour + "; }"
               + "input[type=text].vincomplete, input[type=password].vincomplete, textarea.vincomplete, select.vincomplete, .vincomplete { border: 2px solid " + sErrorBorderColour + "; color: " + sErrorTextColour + "; }"
               + "input[type=text].vsuccess, input[type=password].vsuccess, textarea.vsuccess, select.vsuccess, .vsuccess { border: 1px solid " + sSuccessBorderColour + "; color: " + sSuccessTextColour + "; }"
               + "</style>" ;
    $ ( sStyle ) . appendTo ( 'head' ) ;

    // Log a confirmation message to the console.
    console . log ( 'This page uses Validate form validation - https://github.com/cthiggo/validate' ) ;
} ) ;


// --- The 'validate' Object ---
// Contains all methods and properties for the form validation system.
validate = {

    // Internal variable: AJAX path (mirrors global config).
    sAjaxPath : sAjaxPath ,

    /**
     * Handles the submission process of a form.
     * Prevents default form submission and orchestrates validation.
     *
     * @param {jQuery} oForm - The jQuery object representing the form to be submitted.
     * @param {jQuery} oBtn  - The jQuery object representing the submit button clicked.
     * @returns {boolean} Always returns false to prevent default form action.
     */
    submit : function ( oForm , oBtn ) {
        // Prevent the form's default submission behavior.
        oForm . submit ( function ( e ) { e . preventDefault ( ) ; return false ; } ) ;

        // Determine the success action: call a custom function or submit the form normally.
        var fnSuccess = ( ! empty ( oBtn . attr ( 'data-vfunc' ) ) )
            ? function ( ) { window [ oBtn . attr ( 'data-vfunc' ) ] ( oForm ) ; }
            : function ( ) { oForm . submit ( ) ; } ;

        // Clear previous validation statuses from the form.
        validate . clearFormStatus ( oForm ) ;

        // Initiate the form validation process.
        validate . form (
            oForm ,
            function ( oForm ) { // Success callback for form validation.
                if ( ! empty ( fnSuccess ) ) fnSuccess ( oForm ) ;
                if ( ! empty ( oBtn . attr ( 'data-vclear' ) ) ) validate . clearFormValues ( oForm ) ;
            } ,
            function ( ) { // Failure callback for form validation.
                alert ( 'Form is incomplete.' ) ;
                console . log ( 'Form is incomplete.' ) ;
                return false ;
            }
        ) ;

        return false ; // Crucial for preventing default submit.
    } ,

    /**
     * Validates all inputs within a given form recursively.
     *
     * @param {jQuery} oForm     - The jQuery object representing the form.
     * @param {Function} fnSuccess - Callback function to execute if all inputs are valid.
     * @param {Function} fnFailure - Callback function to execute if any input is invalid.
     */
    form : function ( oForm , fnSuccess , fnFailure ) {
        // Get all input, textarea, and select elements with an 'id' attribute.
        var oAllInputs = oForm . find ( 'input, textarea, select' ) . filter ( '[id]' ) ;
        var oLastInput = oAllInputs . filter ( ':last' ) ; // Identify the last input for recursive termination.

        oAllInputs . each ( function ( ) {
            // If an input hasn't been validated yet (no status classes).
            if ( ! $ ( this ) . hasClass ( 'vsuccess' ) && ! $ ( this ) . hasClass ( 'vwarning' ) && ! $ ( this ) . hasClass ( 'vincomplete' ) ) {
                // Validate this input and then recursively call form validation again.
                validate . input ( $ ( this ) , function ( oInput ) {
                    validate . form ( oForm , fnSuccess , fnFailure ) ;
                } ) ;
                return false ; // Stop iterating and wait for the recursive call.
            } else if ( oLastInput . get ( 0 ) === this ) { // Check if this is the very last input.
                if ( validate . isFormSuccess ( oForm ) === true ) { // All inputs are successful.
                    fnSuccess ( oForm ) ; // Execute the form success callback.
                } else {
                    validate . setIncomplete ( oForm ) ; // Mark problematic fields as incomplete.
                    fnFailure ( ) ; // Execute the form failure callback.
                }
                return false ; // Stop iterating, validation complete.
            }
            return true ; // Continue to the next input if it already has a status and isn't the last.
        } ) ;
    } ,

    /**
     * Validates a single input field.
     *
     * @param {jQuery} oInput    - The jQuery object representing the input field.
     * @param {Function} fnCallback - Optional callback to execute after validation.
     * @returns {boolean} Always returns false.
     */
    input : function ( oInput , fnCallback ) {
        if ( ! empty ( oInput . val ( ) ) ) { // If the input has a value.
            if ( ! empty ( oInput . attr ( 'data-vtype' ) ) ) { // If a validation type is specified.
                // Perform AJAX validation.
                validate . ajax ( oInput . val ( ) , oInput . attr ( 'data-vtype' ) ,
                    function ( sResponse ) { // AJAX success.
                        validate . setStatus ( oInput , 'success' ) ;
                        if ( ! empty ( fnCallback ) ) fnCallback ( oInput ) ;
                    } ,
                    function ( sResponse ) { // AJAX failure.
                        validate . setStatus ( oInput , 'warning' , sResponse ) ;
                        if ( ! empty ( fnCallback ) ) fnCallback ( oInput ) ;
                    }
                ) ;
                return false ; // AJAX handles the callback.
            } else { // No data-vtype, but has value.
                validate . setStatus ( oInput , 'success' ) ;
                if ( ! empty ( fnCallback ) ) fnCallback ( oInput ) ;
                return false ;
            }
        } else { // Input is empty.
            if ( ! empty ( oInput . attr ( 'data-vreq' ) ) ) { // If it's a required field.
                validate . setStatus ( oInput , 'warning' , 'This is a required field.' ) ;
                if ( ! empty ( fnCallback ) ) fnCallback ( oInput ) ;
                return false ;
            } else { // Not required and empty.
                validate . setStatus ( oInput , 'success' ) ; // Consider it successful (optional field).
                if ( ! empty ( fnCallback ) ) fnCallback ( oInput ) ;
                return false ;
            }
        }
    } ,

    /**
     * Performs an AJAX call for server-side validation.
     *
     * @param {string} sValue    - The value to be validated.
     * @param {string} sType     - The type of validation to perform (e.g., 'email', 'uniqueUsername').
     * @param {Function} fnSuccess - Callback for successful server validation.
     * @param {Function} fnFailure - Callback for failed server validation.
     * @returns {boolean} Always returns false.
     */
    ajax : function ( sValue , sType , fnSuccess , fnFailure ) {
        $ . post ( validate . sAjaxPath , { vtype : sType , vvalue : sValue } )
         . done ( function ( sResponse ) {
            if ( sResponse != '1' ) { // Server responded with an error or invalid status.
                fnFailure ( sResponse ) ;
                return false ;
            } else { // Server responded with success.
                fnSuccess ( sResponse ) ;
                return false ;
            }
         } )
         . fail ( function ( sError ) { // AJAX request itself failed.
            fnFailure ( 'Ajax error.' ) ;
            return false ;
         } ) ;
    } ,

    /**
     * Sets the validation status (success, warning, incomplete) for an input field.
     * Applies CSS classes and potentially a tooltip.
     *
     * @param {jQuery} oInput    - The jQuery object for the input field.
     * @param {string} sStatus   - The status to set ('success', 'warning', 'incomplete').
     * @param {string} [sMessage] - Optional message for the tooltip.
     * @returns {boolean} Always returns false.
     */
    setStatus : function ( oInput , sStatus , sMessage ) {
        // Special handling for Chosen.js select boxes.
        if ( oInput . is ( 'select' ) && oInput . hasClass ( 'chosen' ) ) {
            validate . chosenFix ( oInput , function ( oChosenInput ) {
                validate . setStatus ( oChosenInput , sStatus , sMessage ) ;
            } ) ;
        }
        validate . clearInputStatus ( oInput ) ; // Clear previous statuses first.
        if ( sMessage ) oInput . tooltip ( { 'title' : sMessage , 'trigger' : 'focus' } ) ; // Add tooltip if message exists.
        oInput . addClass ( 'v' + sStatus ) ; // Apply the new status class.
        return false ;
    } ,

    /**
     * Converts 'warning' status classes to 'incomplete' for emphasis on final form submission.
     * Modifies placeholders for affected inputs.
     *
     * @param {jQuery} oForm - The jQuery object representing the form.
     */
    setIncomplete : function ( oForm ) {
        // Handle regular input fields.
        oForm . find ( ':input.vwarning' ) . each ( function ( ) {
            $ ( this ) . removeClass ( 'vwarning' ) ;
            $ ( this ) . addClass ( 'vincomplete' ) ;
            var ph = $ ( this ) . attr ( 'placeholder' ) ;
            if ( ! empty ( ph ) ) {
                var newPh = ( ph . indexOf ( '(Required)' ) < 0 ) ? ph + " (Required)" : ph ;
                $ ( this ) . attr ( 'placeholder' , newPh ) ;
            }
        } ) ;
        // Handle Chosen.js select boxes.
        oForm . find ( '.chosen-container.vwarning' ) . each ( function ( ) {
            $ ( this ) . removeClass ( 'vwarning' ) ;
            $ ( this ) . addClass ( 'vincomplete' ) ;
            var ph = $ ( this ) . find ( 'a.chosen-default span' ) . text ( ) ;
            if ( ! empty ( ph ) ) {
                var newPh = ( ph . indexOf ( '(Required)' ) < 0 ) ? ph + " (Required)" : ph ;
                $ ( this ) . find ( 'a.chosen-default span' ) . text ( newPh ) ;
            }
        } ) ;
    } ,

    /**
     * Clears all validation status classes and tooltips from a single input field.
     *
     * @param {jQuery} oInput - The jQuery object for the input field.
     * @returns {boolean} Always returns false.
     */
    clearInputStatus : function ( oInput ) {
        oInput . removeClass ( 'vsuccess' ) ;
        oInput . removeClass ( 'vwarning' ) ;
        oInput . removeClass ( 'vincomplete' ) ;
        oInput . tooltip ( 'destroy' ) ; // Remove any active tooltips.
        return false ;
    } ,

    /**
     * Clears validation statuses from all input fields within a form.
     *
     * @param {jQuery} oForm - The jQuery object representing the form.
     */
    clearFormStatus : function ( oForm ) {
        oForm . find ( ':input' ) . each ( function ( ) {
            validate . clearInputStatus ( $ ( this ) ) ;
        } ) ;
    } ,

    /**
     * Clears the values of all input fields within a form and their validation statuses.
     *
     * @param {jQuery} oForm - The jQuery object representing the form.
     */
    clearFormValues : function ( oForm ) {
        oForm . find ( ':input' ) . each ( function ( ) {
            $ ( this ) . val ( '' ) ;
        } ) ;
        validate . clearFormStatus ( oForm ) ; // Also clear statuses after clearing values.
    } ,

    /**
     * Checks if all input fields in a form that have an 'id' are marked as 'vsuccess'.
     *
     * @param {jQuery} oForm - The jQuery object representing the form.
     * @returns {boolean} True if all relevant inputs are successful, false otherwise.
     */
    isFormSuccess : function ( oForm ) {
        var bSuccessful = true ;
        oForm . find ( ':input' ) . each ( function ( ) {
            if ( ! empty ( $ ( this ) . attr ( 'id' ) ) && ! $ ( this ) . hasClass ( 'vsuccess' ) ) bSuccessful = false ;
        } ) ;
        return bSuccessful ;
    } ,

    /**
     * Helper function to correctly target the Chosen.js container element.
     *
     * @param {jQuery} oInput    - The original select input jQuery object.
     * @param {Function} fnCallback - Callback to execute with the Chosen container jQuery object.
     */
    chosenFix : function ( oInput , fnCallback ) {
        var oChosenInput = $ ( '#' + oInput . attr ( 'id' ) + "_chosen" ) ;
        fnCallback ( oChosenInput ) ;
    }
} ;


// --- Global Helper Functions ---

/**
 * Checks if a given string or variable is considered "empty".
 * This includes undefined, null, empty string, false, 'false', '0', and 0.
 *
 * @param {any} sString - The variable to test for emptiness.
 * @returns {boolean} True if empty, false otherwise.
 */
function empty ( sString )
{
    sString = $ . trim ( sString ) ; // Trim whitespace for string comparisons.
    if ( typeof sString === 'undefined'
         || sString === 'NaN'
         || sString === null
         || sString == ''
         || sString === false
         || sString == 'false'
         || sString == '0'
         || sString === 0 )
    {
        return true ;
    } else {
        return false ;
    }
}


/**
 * Checks if a substring (needle) is present within a string (haystack).
 *
 * @param {string} sNeedle   - The substring to search for.
 * @param {string} sHaystack - The string to search within.
 * @returns {boolean} True if needle is found, false otherwise.
 */
function cont ( sNeedle , sHaystack ) {
    if ( sHaystack . indexOf ( sNeedle ) > -1 ) {
        return true ;
    } else {
        return false ;
    }
}


/**
 * Dumps the properties and values of an object to the console.
 * Useful for debugging.
 *
 * @param {object} obj - The object to dump.
 */
function dump ( obj ) {
    var out = '' ;
    for ( var i in obj ) {
        out += i + ": " + obj [ i ] + "\n" ;
    }
    console . log ( out ) ;
    // Optionally, uncomment the line below to also show an alert.
    // alert(out);
}
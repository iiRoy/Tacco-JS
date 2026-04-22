/*
 *  International Phone Number Directive for AngularJS
 *  Author: Marek Pietrucha
 *  Source: https://github.com/mareczek/international-phone-number
 *  Version: 1.0.0
 *  License: MIT
 *
 *  This file contains the AngularJS directive definition
 *  for integrating the 'intl-tel-input' library.
 */


( function ( ) {

  // Enforce strict mode for better error handling and cleaner code.
  "use strict" ;


  /**
   *  Define the 'internationalPhoneNumber' module and its directive.
   *  This module has no dependencies itself.
   */
  angular
    .module ( "internationalPhoneNumber" , [ ] )
    .directive ( 'internationalPhoneNumber' , function ( ) {

      // The directive definition object.
      return {
        // Restrict the directive to be used as an attribute only (e.g., <input international-phone-number>).
        restrict : 'A' ,

        // Require ngModel controller to allow two-way data binding and validation.
        require : '^ngModel' ,

        // Create an isolate scope for the directive to prevent scope pollution.
        scope : true ,

        /**
         *  The link function is where the DOM manipulation and event binding logic resides.
         *  It's executed after the template has been compiled and linked.
         *
         *  @param {object} scope - The directive's isolated scope.
         *  @param {jQuery} element - The jQLite wrapped element that the directive is on.
         *  @param {object} attrs - A hash of normalized attribute names and their corresponding values.
         *  @param {ngModel.NgModelController} ctrl - The NgModelController instance.
         */
        link : function ( scope , element , attrs , ctrl ) {
          // Declare local variables for functions and configuration options.
          var handleWhatsSupposedToBeAnArray , options , read ;


          /**
           *  Reads the current value from the intlTelInput element
           *  and updates the ngModel controller's view value.
           *  This is typically called on user interaction events.
           */
          read = function ( ) {
            return ctrl.$setViewValue ( element.val ( ) ) ;
          } ;


          /**
           *  Helper function to ensure that a given value is an array of strings.
           *  It handles comma-separated string inputs by splitting and cleaning them.
           *
           *  @param {*} value - The input value, expected to be an object (array) or a string.
           *  @returns {Array} An array of strings.
           */
          handleWhatsSupposedToBeAnArray = function ( value ) {
            if ( typeof value === "object" ) {
              return value ;
            }
            else {
              // Convert to string, remove spaces, and split by comma.
              return value . toString ( ) . replace ( /[\ ]/g , '' ) . split ( ',' ) ;
            }
          } ;


          /**
           *  Default options for the intl-tel-input library.
           *  These can be overridden by attributes on the directive element.
           */
          options = {
            autoFormat : true ,       // Automatically format the number as the user types.
            autoHideDialCode : true , // Hide the dial code when the input is empty.
            defaultCountry : '' ,     // Set a default country (e.g., 'us', 'gb').
            nationalMode : false ,    // Don't display the international dial code in the input.
            numberType : '' ,         // Specify the type of number (e.g., 'MOBILE', 'FIXED_LINE').
            onlyCountries : void 0 ,  // Only allow certain countries (e.g., ['us', 'gb']).
            preferredCountries : [ 'us' , 'gb' ] , // Countries to show at the top of the list.
            responsiveDropdown : false , // Make the dropdown responsive.
            utilsScript : ""          // Path to the 'utils.js' file for phone number validation.
          } ;


          /**
           *  Iterate over the default options and override them with values
           *  provided via attributes on the directive element.
           */
          angular . forEach ( options , function ( value , key ) {
            var option ; // Declare 'option' variable.

            // Evaluate the attribute value dynamically based on the option key.
            option = eval ( "attrs." + key ) ;

            // Check if the attribute is defined on the element.
            if ( angular . isDefined ( option ) ) {
              // Special handling for 'preferredCountries' which expects an array.
              if ( key === 'preferredCountries' ) {
                return options . preferredCountries = handleWhatsSupposedToBeAnArray ( option ) ;
              }
              // Special handling for 'onlyCountries' which also expects an array.
              else if ( key === 'onlyCountries' ) {
                return options . onlyCountries = handleWhatsSupposedToBeAnArray ( option ) ;
              }
              // Handle boolean options: convert string "true" to boolean true.
              else if ( typeof value === "boolean" ) {
                return options [ key ] = option === "true" ;
              }
              // For all other options, directly assign the attribute value.
              else {
                return options [ key ] = option ;
              }
            }
          } ) ;


          // Initialize the intlTelInput plugin on the element with the configured options.
          element . intlTelInput ( options ) ;


          // If no utilsScript is provided in options, load the default one.
          if ( ! options . utilsScript ) {
            element . intlTelInput ( 'loadUtils' , 'bower_components/intl-tel-input/lib/libphonenumber/build/utils.js' ) ;
          }


          /**
           *  Add a parser to ngModel. $parsers are executed in reverse order.
           *  This parser removes all non-digit characters from the input value.
           */
          ctrl . $parsers . push ( function ( value ) {
            if ( ! value ) {
              return value ; // If value is empty, return it as is.
            }

            return value . replace ( /[^\d]/g , '' ) ; // Remove non-digits.
          } ) ;


          /**
           *  Add another parser for validation.
           *  This parser checks the validity of the phone number using intlTelInput's isValidNumber.
           */
          ctrl . $parsers . push ( function ( value ) {
            // Only validate if there's a value; otherwise, clear validation errors.
            if ( value ) {
              ctrl . $setValidity ( 'international-phone-number' , element . intlTelInput ( "isValidNumber" ) ) ;
            }
            else {
              value = '' ; // Ensure value is an empty string if cleared.
              delete ctrl . $error [ 'international-phone-number' ] ; // Clear specific error.
            }

            return value ; // Return the (potentially modified) value.
          } ) ;


          /**
           *  Bind events to update the ngModel controller's view value.
           *  'blur', 'keyup', and 'change' events trigger a read operation.
           */
          element . on ( 'blur keyup change' , function ( event ) {
            return scope . $apply ( read ) ; // Apply changes to the scope.
          } ) ;


          /**
           *  Clean up event listeners when the scope is destroyed
           *  to prevent memory leaks.
           */
          return element . on ( '$destroy' , function ( ) {
            return element . off ( 'blur keyup change' ) ; // Unbind all events.
          } ) ;
        }
      } ;
    } ) ;

} ) . call ( this ) ; // Immediately invoke the function expression.
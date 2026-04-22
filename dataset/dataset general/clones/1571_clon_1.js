/*
 * This is a Type I clone of JVFloat.js
 * Generated for demonstration purposes.
 * All identifiers, variables, functions, and logic are identical.
 * Only whitespace and comments have been altered significantly.
 */


( function ($) {

  'use strict' ; // Enforce strict mode for cleaner code.


  // Initialize the JVFloat plugin for jQuery/Zepto objects.
  $.fn.jvFloat = function ()
  {
    // Filter out non-input elements or submit buttons.
    return this.filter( 'input:not([type=submit]), textarea, select' ) .each( function () {

      // Helper function to get placeholder text from element attributes.
      function getPlaceholderText ( $el )
      {
        var text = $el.attr( 'placeholder' ) ;

        if ( typeof text == 'undefined' )
        {
          text = $el.attr( 'title' ) ; // Fallback to title attribute if placeholder is missing.
        }

        return text ;
      }


      // Sets the active state for the placeholder based on input value.
      function setState ()
      {
        var currentValue = $el.val() ; // Get current value of the input field.

        if ( null == currentValue )
        {
          currentValue = '' ;
        }
        else if ( $el.is( 'select' ) )
        {
          var placeholderValue = getPlaceholderText( $el ) ;

          // If select's current value is the placeholder, treat it as empty.
          if ( placeholderValue == currentValue )
          {
            currentValue = '' ;
          }
        }

        // Toggle 'active' class on placeholder if input has a value.
        placeholder.toggleClass( 'active', currentValue !== '' ) ;
      }


      // Generates a short, unique ID (up to 1 million possibilities).
      function generateUIDNotMoreThan1million ()
      {
        var id = '' ;
        do
        {
          // Generate a 4-character base-36 string.
          id = ( '0000' + ( Math.random() * Math.pow( 36, 4 ) << 0 ) .toString( 36 ) ) .substr( -4 ) ;
        }
        while ( !!$( '#' + id ) .length ) ; // Ensure the ID is not already in use.
        return id ;
      }


      // Assigns a unique ID to the element if it doesn't already have one.
      function createIdOnElement ( $el )
      {
        var id = generateUIDNotMoreThan1million() ;
        $el.prop( 'id', id ) ; // Set the 'id' property.
        return id ;
      }


      // Wrap the current input element in a div with class 'jvFloat'.
      var $el = $( this ) .wrap( '<div class=jvFloat>' ) ;

      var forId = $el.attr( 'id' ) ; // Get existing ID or create a new one.
      if ( !forId )
      {
        forId = createIdOnElement( $el ) ;
      }

      // Determine if the input is required.
      var required = $el.attr( 'required' ) || '' ;

      // Placeholder element variable.
      var placeholder = '' ;
      var placeholderText = getPlaceholderText( $el ) ;

      // Create the label element for the placeholder.
      if ( $( this ) .is( 'textarea' ) )
      {
        // Special class for textareas for better positioning.
        placeholder = $( '<label class="placeHolder ' + ' textarea ' + required + '" for="' + forId + '">' + placeholderText + '</label>' ) .insertBefore( $el ) ;
      }
      else
      {
        placeholder = $( '<label class="placeHolder ' + required + '" for="' + forId + '">' + placeholderText + '</label>' ) .insertBefore( $el ) ;
      }

      // Initial state check for pre-populated fields.
      setState() ;

      // Bind event handlers to update placeholder state.
      $el.bind( 'keyup blur', setState ) ;
    } ) ;
  } ;


// Ensure compatibility with both jQuery and Zepto libraries.
} ) ( window.jQuery || window.Zepto || window.$ ) ;
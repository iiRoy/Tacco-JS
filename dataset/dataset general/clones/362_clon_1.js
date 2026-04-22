$( function ( ) { /* This is a self-executing anonymous function,
                                      often used in jQuery to ensure the DOM is ready
                                      before script execution. */

  // --- Start: JavaScript Detection Section ---
  // The following lines detect if JavaScript is enabled in the browser.
  // If it is, the 'no-js' class is removed and 'js' class is added to the html element.
  $( 'html' )
    . removeClass ( 'no-js' ) // Remove the 'no-js' class.
    . addClass    ( 'js'     ) // Add the 'js' class.
  ;
  // --- End: JavaScript Detection Section ---


  // --- Start: Custom Radio Button Styling ---
  // This section customizes the appearance of radio buttons using span elements.
  var i = 0 ; // Initialize a counter for unique IDs.

  $( 'input[type=radio]' ).each (
    function ( ) {
      // Assign a unique data-replacementid to each radio button.
      $( this ) . attr ( 'data-replacementid' , i ) ;

      // Insert a custom span element after the radio button.
      // This span will visually replace the radio button.
      $( this ) . after ( '<span class="radioreplacement" id="' + i + '" data-name="' + $( this ) . attr ( 'name' ) + '" style="text-indent:-9999px;">&bull;</span>' ) ;

      $( this ) . hide ( ) ; // Hide the original radio button.
      i ++ ; // Increment the counter for the next radio button.
    }
  ) ;


  $( '.radioreplacement' ) . click (
    function ( ) {
      /* Event handler for when a custom radio button replacement is clicked. */

      var id = $( this ) . attr ( 'id' ) ; // Get the ID of the clicked replacement span.

      // Find the corresponding hidden radio button and mark it as checked.
      $( 'input[type=radio][data-replacementid=' + id + ']' ) . attr ( 'checked' , 'checked' ) ;

      var color = $( this ) . css ( 'color' ) ; // Get the current color (not used, but present in original).

      // Reset the text-indent for all replacement spans with the same 'name' attribute.
      // This effectively "unchecks" other radio buttons in the same group visually.
      $( '.radioreplacement[data-name=' + $( this ) . attr ( 'data-name' ) + ']' ) . css (
        {
          textIndent : '-9999px' // Hide the bullet point for others.
        }
      ) ;

      // Set the text-indent for the clicked replacement span to make its bullet visible.
      $( this ) . css (
        {
          textIndent : '0' // Show the bullet point for the selected one.
        }
      ) ;

      // This line seems to reset all radios in the group to unchecked, which might be a bug
      // or intended behavior in the original code, but it must remain as is for Type I.
      $( 'input[type=radio][name=' + $( this ) . attr ( 'data-name' ) + ']' ) . attr ( 'checked' , 'false' ) ;
    }
  ) ;
  // --- End: Custom Radio Button Styling ---


  // --- Start: Custom Checkbox Styling ---
  // This section customizes the appearance of checkbox buttons using span elements.
  i = 0 ; // Reset counter for checkboxes.

  $( 'input[type=checkbox]' ) . each (
    function ( ) {
      $( this ) . attr ( 'data-replacementid' , i ) ; // Assign unique ID.

      var checked ; // Declare variable for checked status.

      // Check the initial 'checked' state of the checkbox.
      if ( $( this ) . attr ( 'checked' ) === 'checked' ) {
        checked = 'checked' ; // If checked, set status to 'checked'.
      } else {
        checked = 'false' ; // Otherwise, set status to 'false'.
      }

      // Insert a custom span element after the checkbox.
      // This span will visually replace the checkbox.
      $( this ) . after ( '<span class="checkboxreplacement" id="' + i + '" data-name="' + $( this ) . attr ( 'name' ) + '" data-checked="' + checked + '" style="text-indent:-9999px;">&#10003;</span>' ) ;

      $( this ) . hide ( ) ; // Hide the original checkbox.
      i ++ ; // Increment counter.
    }
  ) ;


  $( '.checkboxreplacement' ) . click (
    function ( ) {
      /* Event handler for when a custom checkbox replacement is clicked. */

      // Trigger a click on the hidden original checkbox.
      // This handles the actual checking/unchecking logic and form submission value.
      $( 'input[type=checkbox][data-replacementid=' + $( this ) . attr ( 'id' ) + ']' ) . click ( ) ;

      // Toggle a 'checked' class on the replacement span for visual feedback.
      $( this ) . toggleClass ( 'checked' ) ;
    }
  ) ;
  // --- End: Custom Checkbox Styling ---

} ) ;
/*
 * This is a Type I clone of an original JavaScript file.
 * The purpose is to demonstrate variations in whitespace and comments
 * while maintaining exact logical and structural identity.
 *
 * All variable names, function names, operators, and expressions
 * remain completely unchanged.
 */

( function ()
{
  "use strict"
  ; // Enforce strict mode for better code quality.

  // Declare WinJS navigation, UI, and utilities variables.
  var nav = WinJS.Navigation
    ;
  var ui = WinJS.UI
    ;
  var utils = WinJS.Utilities
    ;

  // Define a new page for the application.
  WinJS.UI.Pages.define( "/default.html",
  {

    // The ready function is called when the page is fully loaded and ready.
    ready: function ( element, options )
    {
      // Attach an event listener to the 'btnShow' button to call 'showToast'.
      document.getElementById( 'btnShow' ) . addEventListener( "click", showToast, false )
      ;

      // Attach an event listener to the 'btnCustomToast' button to call 'customToast'.
      document.getElementById( 'btnCustomToast' ) . addEventListener( "click", customToast, false )
      ;
    }
  }
  )
  ;

  /**
   * Function to display a simple toast notification with predefined content.
   * This uses the YeahToast library.
   */
  function showToast()
  {
    YeahToast.show( { title: "Toast title!", textContent: "Toast content!" } )
    ;
  }

  /*
   * Function to display a custom toast notification.
   * The title, content, and image source are determined dynamically
   * from user input elements on the page.
   */
  function customToast()
  {
    // Retrieve title from the input field.
    var title = document.getElementById( "txtTitle" ) . value
      ;
    // Retrieve content from the description field.
    var content = document.getElementById( "txtDescription" ) . value
      ;
    // Check if the image checkbox is selected.
    var image = document.getElementById( "chkImage" ) . checked
      ;

    // Determine the image source based on the 'image' variable.
    // If 'image' is true, use "/images/Trophy.png", otherwise null.
    var imgsrc = image ? "/images/Trophy.png" : null
      ;

    // Display the custom toast using the collected data.
    YeahToast.show( { title: title, textContent: content, imgsrc: imgsrc } )
    ;
  }

}
) ( )
; // End of the immediately invoked function expression (IIFE).
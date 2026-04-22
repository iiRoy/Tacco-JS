/*
 * This file contains JavaScript code for custom styling
 * and behavior of checkboxes and radio buttons.
 * It ensures visual consistency across different browsers.
 */
function  setupLabel ( )  {

  // --- Configuration for Checkboxes ---
  var checkBox = ".checkbox"; // Selector for the custom checkbox wrapper
  var checkBoxInput = checkBox + " input[type='checkbox']"; // Selector for the actual checkbox input
  var checkBoxChecked = "checked"; // Class to apply when a checkbox is checked
  var checkBoxDisabled = "disabled"; // Class to apply when a checkbox is disabled

  // --- Configuration for Radio Buttons ---
  var radio = ".radio"; // Selector for the custom radio wrapper
  var radioInput = radio + " input[type='radio']"; // Selector for the actual radio input
  var radioOn = "checked"; // Class to apply when a radio button is selected
  var radioDisabled = "disabled"; // Class to apply when a radio button is disabled


  // --- Handle Checkboxes Styling ---
  // Only proceed if there are checkbox inputs on the page
  if ( $( checkBoxInput ).length ) {

    // Ensure all custom checkboxes initially do not have the 'checked' class
    $( checkBox ).each ( function ( )  {
      $( this ).removeClass ( checkBoxChecked ) ;
    } ) ;

    // Add 'checked' class to the parent wrapper of checked checkboxes
    $( checkBoxInput + ":checked" ).each ( function ( )  {
      $( this ).parent ( checkBox ).addClass ( checkBoxChecked ) ;
    } ) ;

    // Add 'disabled' class to the parent wrapper of disabled checkboxes
    $( checkBoxInput + ":disabled" ).each ( function ( )  {
      $( this ).parent ( checkBox ).addClass ( checkBoxDisabled ) ;
    } ) ;
  } ; // End of checkbox styling block


  // --- Handle Radio Buttons Styling ---
  // Only proceed if there are radio button inputs on the page
  if ( $( radioInput ).length ) {

    // Ensure all custom radio buttons initially do not have the 'checked' class
    $( radio ).each ( function ( )  {
      $( this ).removeClass ( radioOn ) ;
    } ) ;

    // Add 'checked' class to the parent wrapper of selected radio buttons
    $( radioInput + ":checked" ).each ( function ( )  {
      $( this ).parent ( radio ).addClass ( radioOn ) ;
    } ) ;

    // Add 'disabled' class to the parent wrapper of disabled radio buttons
    $( radioInput + ":disabled" ).each ( function ( )  {
      $( this ).parent ( radio ).addClass ( radioDisabled ) ;
    } ) ;
  } ; // End of radio button styling block

} ; // End of setupLabel function definition


// --- Document Ready Handler ---
// This ensures the script runs after the DOM is fully loaded.
$( document ).ready ( function ( )  {

  // Add a class to the HTML element to indicate JavaScript is enabled
  $( "html" ).addClass ( "has-js" ) ;

  // Prepend icon elements to custom checkboxes and radios for visual effects
  // This is crucial for the custom styling to work correctly.
  $( ".checkbox, .radio" ).prepend ( "<span class='icon'></span><span class='icon-to-fade'></span>" ) ;

  // Attach a click event handler to custom checkboxes and radios
  // to update their state visually whenever they are clicked.
  $( ".checkbox, .radio" ).click ( function ( )  { setupLabel ( ) ; } ) ;

  // Initial call to setupLabel to apply styling on page load
  setupLabel ( ) ;

} ) ; // End of document ready function
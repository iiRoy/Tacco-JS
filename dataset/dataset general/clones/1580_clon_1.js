/* This file contains the main logic for the JSON to HTML conversion demo.
 * It uses require.js for dependency management and CodeMirror for the input editor.
 * The primary goal is to demonstrate the JsonHuman library's formatting capabilities.
 * This script handles user interaction, JSON parsing, rendering, and timing measurements.
 */
/*
 * List of global variables that are expected to be available in the environment.
 * These are typically defined by the browser or external libraries.
 */
/* globals require, document, CodeMirror, alert */


require . config (
  {
    // Define module paths for require.js to locate dependencies.
    paths : {
      "crel" : "../lib/crel" // Path to the 'crel' utility library, used by JsonHuman.
    }
  }
) ; // End of require.config call.


// Main application entry point, invoked once 'json.human' is loaded by require.js.
require ( [ "../src/json.human" ] , function ( JsonHuman ) {

  "use strict" ; // Enforce strict mode for better error checking and cleaner code.

  // --- DOM Element References ---
  // Get reference to the input textarea element where JSON will be typed.
  var textarea   =   document . getElementById ( "input" ) ,
    // Get reference to the output display area where formatted HTML will appear.
    output     =   document . getElementById ( "output" ) ,
    // Get reference to the raw HTML output display area for debugging/inspection.
    raw        =   document . getElementById ( "output-raw" ) ,
    // Get reference to the element displaying JSON parsing/formatting time.
    formatTime =   document . getElementById ( "format-time" ) ,
    // Get reference to the element displaying HTML rendering/appending time.
    renderTime =   document . getElementById ( "render-time" ) ,
    // Get reference to the conversion trigger button.
    button     =   document . getElementById ( "convert" ) ,
    // Initialize CodeMirror editor on the textarea for enhanced editing experience.
    editor     =   CodeMirror . fromTextArea (
      textarea ,
      {
        mode : "application/json" , // Set editor mode to JSON for syntax highlighting.
        json : true                 // Enable JSON linting and automatic formatting features.
      }
    ) ; // End of CodeMirror initialization.

  // --- Core Conversion Function ---
  /**
   * Converts a given JSON object into a human-readable HTML representation
   * using the JsonHuman library and updates the display elements.
   *
   * @param {object} input  The JavaScript object (parsed JSON) to format.
   * @param {HTMLElement} output The DOM element where the formatted HTML will be appended.
   * @returns {void}
   */
  function convert ( input , output ) {

    // Declare local variables for timing measurements and the generated HTML node.
    var node , t1 , t2 , t3 , formatTimeMs , renderTimeMs ;

    // --- JSON Formatting Phase ---
    t1   =   Date . now ( ) ;              // Record the start timestamp for the formatting process.
    node =   JsonHuman . format ( input ) ; // Execute the core JsonHuman library function to convert JSON to HTML.
    t2   =   Date . now ( ) ;              // Record the end timestamp for the formatting process.

    // --- HTML Rendering Phase ---
    output . innerHTML = "" ;             // Clear any previous content from the primary output area.
    output . appendChild ( node ) ;       // Append the newly generated HTML structure to the DOM.
    t3   =   Date . now ( ) ;              // Record the end timestamp for the HTML rendering (DOM manipulation).

    // Update the raw HTML display area with the generated HTML content.
    raw . textContent = output . innerHTML ;

    // --- Calculate and Display Timings ---
    formatTimeMs = t2 - t1 ; // Calculate the elapsed time for JSON formatting.
    renderTimeMs = t3 - t2 ; // Calculate the elapsed time for HTML rendering (appending to DOM).

    // Update the display element for JSON formatting time.
    formatTime . innerHTML = "" + formatTimeMs + "ms" ;
    // Update the display element for HTML rendering time.
    renderTime . innerHTML = "" + renderTimeMs + "ms" ;

  } // End of convert function definition.

  // --- Internal Conversion Helper ---
  /**
   * Private helper function to parse the JSON from the CodeMirror editor
   * and then call the main `convert` function. This function does not
   * include error handling for the JSON parsing step.
   * @returns {void}
   * @private
   */
  function _doConvert ( ) {

    // Get the current content from the CodeMirror editor and attempt to parse it as JSON.
    var json = JSON . parse ( editor . getValue ( ) ) ;

    // Call the main conversion function with the parsed JSON object and the target output element.
    return convert ( json , output ) ;

  } // End of _doConvert function definition.


  // --- Public Conversion Handler ---
  /**
   * Public function to handle the entire conversion process,
   * including robust error handling for potential JSON parsing failures.
   * @returns {void}
   */
  function doConvert ( ) {

    try {
      // Attempt to execute the internal conversion helper function.
      return _doConvert ( ) ;
    }
    catch ( error ) {
      // If a parsing error occurs (e.g., invalid JSON syntax), catch the exception.
      // Display an informative alert to the user, including the error stack for details.
      alert ( "Error parsing json:\n" + error . stack ) ;
      return ; // Exit the function gracefully after showing the error.
    }

  } // End of doConvert function definition.


  // --- Event Listeners and Initial Call ---

  // Attach a click event listener to the "convert" button.
  // When the button is clicked, the `doConvert` function will be invoked.
  button . addEventListener ( "click" , doConvert ) ;

  // Perform an initial conversion when the script loads.
  // This populates the output areas with the default content in the editor.
  doConvert ( ) ;

} ) ; // End of require callback function.
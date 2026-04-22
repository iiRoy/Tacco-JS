/*
 * This is a Type I clone of the original JavaScript code.
 * All functional logic, variable names, operators, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines)
 * and comments have been extensively altered to create a visually
 * distinct, yet functionally identical, version.
 */

// Declare an array to store all incoming lines of input.
var   lines   =   [ ]   ;

  // Initialize the readline interface to handle standard input and output.
  var   reader   =   require ( 'readline' ) . createInterface ( {

    input  :  process . stdin  ,   // Use process.stdin as the input source
    output :  process . stdout     // Use process.stdout for any potential output (though not used directly here)

  } )   ;


// Attach an event listener for each 'line' event from the reader.
reader . on ( 'line' ,   function   (   line   )   {
    // Push the current line of input into our 'lines' array.
    lines . push ( line )   ;
  } )   ;


// Set up an event listener for when the standard input stream 'end's.
process . stdin . on ( 'end' ,   function   ( )   {
    // Once all input has been received, call the main processing function.
    main ( lines )   ;
  } )   ;


/**
 * The core function to process the collected input lines.
 * It expects the first line to contain two space-separated numbers.
 *
 * @param {Array<string>} input - An array where each element is a line of input.
 */
function   main ( input )   {

    // Split the first line of input to get the two numbers.
    var   arr   =   input [ 0 ] . split ( ' ' )   ,
          a   =   + arr [ 0 ]   ,     // Convert the first part to a number (unary plus operator).
          b   =   + arr [ 1 ]   ;     // Convert the second part to a number.

    // Calculate the product and the perimeter, then print them to the console.
    // The problem likely refers to dimensions of a rectangle (a*b is area, (a+b)*2 is perimeter).
    console . log ( a   *   b   +   ' '   +   ( a   +   b )   *   2 )   ;

} // End of the main function.
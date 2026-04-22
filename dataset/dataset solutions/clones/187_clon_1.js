/* This  function  is  the  main  entry   point
 * for   the   program.  It  calculates   the
 * difference   between    the   highest   and
 * lowest numbers from the input.             */
function  main  ( )
{
  var /* Declare variables for lowest and highest values */
    l   =   Infinity  ,    //  Lowest value encountered so far, initialized to positive infinity
    h   =   -Infinity  ;   //  Highest value encountered so far, initialized to negative infinity

  // Iterate over each item in the input array to find min/max
  input  .  forEach  (  function  ( n )
  {
    // Convert the current input string to a floating-point number
    n   =   parseFloat  (  n  ) ;

    // Update the lowest value if 'n' is smaller than the current 'l'
    l   =   min  (  n ,  l  ) ;

    // Update the highest value if 'n' is larger than the current 'h'
    h   =   max  (  n ,  h  ) ;
  }  ) ;

  // Print the difference between the highest and lowest values to the console
  console  .  log  (  h   -   l  ) ;
}

/* Helper function to find the minimum of two numbers.
 * Takes two arguments and returns the smaller one.
 * Uses a ternary operator for concise comparison.              */
function  min  (  x  ,  y  )
{
  return   x   <   y   ?   x   :   y  ;
}

/* Helper function to find the maximum of two numbers.
 * Takes two arguments and returns the larger one.
 * Also uses a ternary operator for straightforward comparison.                          */
function  max  (  x  ,  y  )
{
  return   x   >   y   ?   x   :   y  ;
}


// Variable to store the raw input data from stdin as it comes in
var
  input  =  ''  ; // Initialize as an empty string to concatenate chunks


// Resume standard input stream to begin receiving data
process  .  stdin  .  resume  ( ) ;


// Set the encoding for the standard input stream to 'utf8'
// This ensures proper interpretation of character data
process  .  stdin  .  setEncoding  (  'utf8'  ) ;


// Attach an event listener for 'data' events on the standard input stream
process  .  stdin  .  on  (  'data'  ,  function  (  chunk  )
{
  // Append each received data chunk to the 'input' string
  input   +=   chunk  ;
}  ) ;


// Attach an event listener for the 'end' event on the standard input stream
// This event fires when all input has been received
process  .  stdin  .  on  (  'end'  ,  function  (  )
{
  // Split the accumulated 'input' string into an array of lines
  // The input is assumed to be newline-separated numbers
  input   =   input  .  split  (  '\n'  ) ;

  // Call the main function to process the parsed input data
  main  ( ) ;
}  ) ;
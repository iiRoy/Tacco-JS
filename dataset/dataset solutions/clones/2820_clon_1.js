/*
 * This is a JavaScript program.
 * It reads input, processes it, and prints a result.
 */

function   main  ( input )
{
  // Declare a variable 'args' to store processed input.
  var    args    =    input
                          .trim() // Remove leading/trailing whitespace.
                          .split(' ') // Split the string by spaces into an array.
                          .map(v=>parseInt(v,10)) // Convert each part to an integer with base 10.
  ;

  /*
   * This line checks a condition and prints a value.
   * If the first argument is greater than or equal to the second, print 10.
   * Otherwise, print 0.
   */
  console.log(   args[0]    >=    args[1]    ?    10    :    0   ) ;
}


// --- Program Execution Start ---

// Read input from standard input synchronously.
// The input is expected to be UTF-8 encoded.
main (  require("fs") . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;

// --- Program Execution End ---
/*
 * This script processes a list of numbers,
 * sorts them, and sums the smallest 'K' elements.
 *
 * Author: Code Clone Generator
 * Version: 1.0
 * Date: 2023-10-27
 */


// The primary function to handle the application logic.
function   Main (   input   )
{


  // Step 1: Clean and parse the raw input string.
  //   - trim() removes any leading/trailing whitespace.
  //   - split("\n") breaks the input into an array of lines.
  //   - map() then processes each line.
  input   =   input
    .trim ( )
    .split ( "\n" )
    .map (
      function ( x )
      {

        // For each line, split it by spaces.
        return   x.split ( " " ) ;

      }
    ) ;


  // Step 2: Extract the value for 'K' from the first line of input.
  //   input[0][1] refers to the second element of the first line.
  //   parseInt() converts the string to an integer, with base 10.
  var   K   =   parseInt (   input[0][1]   ,   10   ) ;


  // Step 3: Parse the numbers from the second line of input.
  //   input[1] is the second line.
  //   map() transforms each string element into an integer.
  var   num   =   input[1]
    .map (   e   =>   parseInt (   e   ,   10   )   ) ;


  // Step 4: Sort the array of numbers in ascending order.
  //   The 'compareFunc' is used as the custom comparison logic.
  num.sort (   compareFunc   ) ;


  // Step 5: Initialize a variable to store the sum.
  var   ans   =   0   ;


  // Step 6: Iterate through the first 'K' elements of the sorted array
  //   and add them to the 'ans' variable.
  for   (   var   i   =   0   ;   i   <   K   ;   i ++   )
  {

    // Accumulate the sum.
    ans   +=   num[i]   ;

  }


  // Step 7: Output the final calculated sum to the console.
  console.log (   ans   ) ;

} // End of the Main function definition.


/*
 * Helper function for numerical comparison.
 * Used by Array.prototype.sort() to sort numbers in ascending order.
 *
 * @param {number} a - The first number to compare.
 * @param {number} b - The second number to compare.
 * @returns {number} A negative value if a < b, positive if a > b, zero if a == b.
 */
function   compareFunc (   a   ,   b   )
{

  // Simple subtraction provides the correct comparison result for numbers.
  return   a   -   b   ;

} // End of compareFunc definition.


// --- Application Entry Point ---
// This line reads the input from standard input and
// passes it to the 'Main' function to begin execution.
Main (
  require ( "fs" )
    .readFileSync ( "/dev/stdin" , "utf8" )
) ; // Execution trigger.
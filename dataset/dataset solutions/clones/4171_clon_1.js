/*
 * This function solves a specific problem from AtCoder's practice contest.
 * It determines the maximum number of times all elements in a given array
 * can be simultaneously divided by two.
 *
 * Problem URL for reference:
 * @see https://practice.contest.atcoder.jp/tasks/practice_1
 *
 * @param {string} input - The raw input string, typically from standard input.
 *                         It's expected to contain multiple lines, with the
 *                         second line having space-separated integers.
 * @returns {string} - The final count of operations, represented as a string.
 */
var main = function ( input ) {


  // Parse the input string to extract the array of numbers.
  // The problem specifies the numbers are on the second line, space-separated.
  var numbers = input . split ( "\n" ) [ 1 ] . split ( " " ) . map ( x => parseInt ( x ) ) ;


  // Initialize a counter for the successful division operations.
  var operations = 0 ;


  // Enter an infinite loop that continues until a condition is met to break out.
  while ( true ) {


    // Check if ALL numbers in the current array are even.
    // The `every` method returns true only if the provided callback function
    // returns true for all elements in the array.
    const canDivide = numbers . every ( n => ( ( n % 2 ) === 0 ) ) ;


    // If all numbers are indeed even, proceed with division.
    if ( canDivide ) {

      // Apply the division by 2 to each number in the array.
      // This creates a new array with the results.
      numbers = numbers . map ( n => n / 2 ) ;

      // Increment the counter, as one successful operation has been performed.
      operations ++ ;

    }
    // If at least one number is odd, we can no longer divide all numbers by 2.
    else {

      // Exit the loop and return the accumulated count of operations.
      return operations ;

    }

  } // End of the while loop.

} ; // End of the main function definition.


// --- Program Execution Start ---

// Read the entire content of the standard input file synchronously.
// The "utf8" encoding ensures the input is treated as a text string.
const output = main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// Print the final result to the standard output.
// A common behavior of console.log is to automatically append a newline character.
console . log ( output ) ;
// --- Program Execution End ---
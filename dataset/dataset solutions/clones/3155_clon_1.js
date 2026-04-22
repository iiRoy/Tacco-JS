/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, performs calculations, and prints a result.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0
 */

// Define the main function that processes the input string.
function main ( input ) {
  // Split the input string by spaces to get an array of arguments.
  const args = input . split ( ' ' ) ;


  // Parse the first argument as an integer and assign it to A.
  let A = Number ( args [ 0 ] ) ;

  // Parse the second argument as an integer and assign it to B.
  let B = Number ( args [ 1 ] ) ;

  // Parse the third argument as an integer and assign it to K.
  let K = Number ( args [ 2 ] ) ;


  /*
   * Determine the order of A and B.
   * If A is less than B, Arr will be [A, B].
   * Otherwise, Arr will be [B, A].
   * This ensures Arr[0] is always the smaller number and Arr[1] is the larger.
   */
  let Arr = A < B ? [ A , B ] : [ B , A ] ;


  // Initialize an empty array to store common divisors.
  // Then, populate it by iterating from 1 up to Arr[0] (the smaller number).
  let result = Array . from ( Array ( Arr [ 0 ] ) , ( v , i ) => i + 1 ) . reduce ( ( sum , cu ) => {
    // Check if the current number 'cu' divides both Arr[0] and Arr[1] without a remainder.
    if ( Number . isInteger ( Arr [ 0 ] / cu ) && Number . isInteger ( Arr [ 1 ] / cu ) ) {
      // If 'cu' is a common divisor, add it to the 'sum' array.
      sum . push ( cu ) ;

      // Return the updated sum array.
      return sum ;
    }

    // If 'cu' is not a common divisor, return the sum array unchanged.
    return sum ;
  } , [ ] ) ; // The initial value for 'sum' is an empty array.


  // Extract the K-th largest common divisor from the 'result' array.
  // result.splice(result.length - K, 1) removes 1 element starting from the K-th position from the end.
  // [0] then gets that removed element.
  const res = result . splice ( result . length - K , 1 ) [ 0 ] ;


  // Print the final result to the console.
  console . log ( res ) ;
}


// --- Program Entry Point ---
// Read input from /dev/stdin synchronously and decode it as UTF-8.
// Then, pass the read input to the main function for processing.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of file.
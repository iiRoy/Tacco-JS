'use strict' // This directive enforces stricter parsing and error handling in the code.


const main = arg => { // Define the main asynchronous function that accepts an argument.

  // Process the raw input string: remove leading/trailing whitespace, then split into an array of lines.
  var input = arg . trim() . split ( "\n" ) ;

  // Parse the first line of input to extract configuration parameters.
  // It's split by spaces, and each part is converted to an integer.
  var config = input [ 0 ] . split ( " " ) . map ( str => parseInt( str , 10 ) ) ;

  // The first element of the configuration array 'config' represents 'n'.
  const n = config [ 0 ] ;
  // The remaining elements of 'config' form the 'ratio' array.
  const ratio = config . slice ( 1 ) ;

  // Extract the actual data lines from the input, starting from the second line up to 'n' lines.
  const data = input . slice ( 1 , n + 1 ) ;

  // Initialize an empty array to store the 'best' combination of data found so far.
  var best = [ ] ;


  /**
   * This is a recursive helper function to calculate combinations of data items.
   * It attempts to find a subset of 'data' that matches a specific ratio with the minimum cost.
   *
   * @param {string} str - The current data string being processed in the recursion.
   * @param {Array<Object>} result - An array representing the current combination of data items being built.
   * @param {number} i - The index of 'str' in the global 'data' array.
   */
  function calcu ( str , result , i ) {

    // Base case for recursion: if the index 'i' exceeds 'n' or if 'str' is undefined/empty,
    // it means we've gone past the available data or hit an invalid state, so we stop.
    if ( n <= i || ! str ) {
      return ;
    }

    // Parse the current data string: split by spaces and convert parts to integers.
    const theData = str . split ( " " ) . map ( str => parseInt ( str , 10 ) ) ;

    // Add the parsed data as an object to the current 'result' combination.
    // Each object contains 'a', 'b', and 'cost' properties.
    result . push ( {
      a : theData [ 0 ] ,
      b : theData [ 1 ] ,
      cost : theData [ 2 ]
    } ) ;

    // Calculate the total 'cost' for the current combination of items.
    const sum = result . reduce ( ( a , b ) => a + b . cost , 0 ) ;

    // Calculate the total 'a' value for the current combination.
    const aCost = result . reduce ( ( a1 , b1 ) => a1 + b1 . a , 0 ) ;

    // Calculate the total 'b' value for the current combination.
    const bCost = result . reduce ( ( a1 , b1 ) => a1 + b1 . b , 0 ) ;

    // Declare a variable to hold the total cost of the current 'best' combination.
    var bestCost ;
    // If 'best' array already contains elements, calculate its total cost.
    if ( best . length > 0 ) {
      bestCost = best . reduce ( ( a , b ) => a + b . cost , 0 ) ;
    }


    // Pruning step: if 'bestCost' exists and the current 'sum' already exceeds it,
    // this path cannot lead to a better solution, so we can terminate early.
    if ( bestCost && sum > bestCost ) {
      return ;
    }


    // Check if the simplified ratio of 'aCost' and 'bCost' matches the target 'ratio'.
    if ( maxYakusu ( aCost , bCost ) === `${ratio[0]} ${ratio[1]}` ) {

      // If a match is found, compare it with the current 'best' combination.
      // A new combination is considered 'best' if it's the first one found,
      // or if its total cost 'sum' is less than the current 'bestCost'.
      if ( best . length === 0 || ( bestCost && ( sum < bestCost ) ) ) {
        // Update 'best' with the current 'result' combination.
        best = result ;
      }

    } else {
      // If the ratio doesn't match, continue the recursive search by including the next data item.
      // The '++i' operator increments 'i' before it's passed to the next recursive call.
      calcu ( data [ i + 1 ] , result , ++ i ) ;
    }

  } // End of the 'calcu' function definition.


  // Iterate through each data entry to initiate the recursive calculation process.
  // Each entry serves as a potential starting point for a combination.
  data . forEach ( ( str , i ) => {
    var result = [ ] ; // Initialize a fresh 'result' array for each starting point.
    calcu ( str , result , i ) ; // Begin the recursive combination search.
  } ) ;


  // After all combinations have been explored, output the result.
  // If no 'best' combination was found (i.e., 'best' array is empty), output -1.
  // Otherwise, calculate and output the total cost of the 'best' combination.
  console . log ( best . length === 0 ? -1 : best . reduce ( ( a , b ) => a + b . cost , 0 ) ) ;

} // End of the 'main' function definition.


/**
 * Calculates the greatest common divisor (GCD) of two numbers and returns their simplified ratio.
 * This function effectively finds the reduced form of the fraction a/b.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {string} - A string representing the simplified ratio in the format "a0 b0".
 */
function maxYakusu ( a , b ) {

  // Determine the smaller of the two numbers; this will be the upper limit for the loop.
  var small = a > b ? b : a ;

  // Initialize variables to store the components of the simplified ratio.
  var a0 = a ;
  var b0 = b ;

  // Loop from 1 up to 'small' to find common divisors.
  for ( var i = 1 ; i <= small ; i ++ ) {

    // Divide both 'a' and 'b' by the current loop variable 'i'.
    // Convert the result to a string to easily check for decimal parts.
    var a1 = String ( a / i ) ;
    var b1 = String ( b / i ) ;

    // If both 'a1' and 'b1' are integers (i.e., their string representation
    // does not contain a decimal point, meaning split by "." yields a single part),
    // then 'i' is a common divisor. Update 'a0' and 'b0' to reflect this simplified form.
    if ( a1 . split ( "." ) . length === 1 && b1 . split ( "." ) . length === 1 ) {
      a0 = a1 ;
      b0 = b1 ;
    }

  } // End of the for loop.

  // Return the simplified ratio as a template string.
  return `${a0} ${b0}` ;

} // End of the 'maxYakusu' function definition.


// Execute the 'main' function immediately.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
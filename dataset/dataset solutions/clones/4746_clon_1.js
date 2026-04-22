/*
 * This file contains a solution for a specific problem.
 * All rights reserved. Unauthorized reproduction is prohibited.
 */

/*
 * Helper function to read input from standard input.
 * It reads the entire content of /dev/stdin, trims whitespace, and returns it.
 */
function myin ( ) {
  return  require("fs")
            .readFileSync("/dev/stdin", "utf8")
            .trim ( ) ;
}


/**
 * Helper function for standard output.
 * Logs the provided argument to the console.
 * @param {any} t - The value to be printed to standard output.
 */
function myout ( t ) {

  console.log ( t ) ; // Standard output stream.
}


/*
 * Helper function for standard error output.
 * Useful for debugging messages that shouldn't interfere with main output.
 */
function myerr ( t ) {
  console.error ( t ) ; // Standard error stream.
}


/*
 * The 'myconv' function is a versatile input converter.
 * It takes an input 'i' and a conversion 'no' code.
 * The 'no' parameter determines how 'i' will be processed.
 *
 * Conversion codes:
 * -------------------
 *   0: No operation; returns the input as is.
 *   1: Converts the input to an integer using parseInt().
 *   2: Splits the input string by half-width spaces (" ").
 *   3: Splits the input string by newline characters ("\n").
 *   4: Splits by spaces and converts each part to a Number (array of numbers).
 *   5: Splits by newlines and converts each part to a Number (array of numbers).
 *   6: Splits the input string into an array of single characters.
 *   7: Splits into characters and converts each character to a Number (array of numbers).
 */
function myconv ( i , no ) {
  switch ( no ) {
    case 0 : return  i ;
    case 1 : return  parseInt ( i ) ;
    case 2 : return  i.split ( " " ) ;
    case 3 : return  i.split ( "\n" ) ;
    case 4 : return  i.split ( " " ).map ( ( a ) => Number ( a ) ) ;
    case 5 : return  i.split ( "\n" ).map ( ( a ) => Number ( a ) ) ;
    case 6 : return  i.split ( "" ) ;
    case 7 : return  i.split ( "" ).map ( ( a ) => Number ( a ) ) ;
  }
}


/*
 * The main logic function that processes the input and produces the desired output.
 * This is where the core algorithm resides.
 */
function Main ( input ) {
          // First, split the raw input string by newlines.
  input = myconv ( input , 3 ) ;

  // The first line contains the number of elements, N. Convert it to an integer.
  var N = myconv ( input [ 0 ] , 1 ) ;

  // The second line contains the list of numbers, split by spaces and converted to numbers.
  var list = myconv ( input [ 1 ] , 4 ) ;


  // Create an object to store the frequency count of each number in 'list'.
  var count = { } ;

  // Iterate through the list to populate the 'count' object.
  for ( var i = 0 ; i < N ; i ++ ) {
    if ( count [ list [ i ] ] == null ) {
       // If the number is encountered for the first time, initialize its count to 1.
       count [ list [ i ] ] = 1 ;
    }
    else {
       // If the number has been seen before, increment its count.
       count [ list [ i ] ] ++ ;
    }
  }


  // Extract the unique numbers (keys) from the 'count' object.
  // Convert them to an array and store in 'useSet'.
  var useSet = Array.from ( Object.keys ( count ) ) ;

  // Sort the unique numbers in ascending order.
  // The numbers are originally strings because they are object keys,
  // so they need to be converted to integers for proper numerical sorting.
  useSet.sort ( function ( a , b ) {
    return myconv ( a , 1 ) - myconv ( b , 1 ) ;
  } ) ;


  /*
   * Strategy for processing the numbers:
   * Prioritize consuming numbers that appear multiple times (count > 1).
   * We "attack" from both ends of the sorted unique numbers list (smallest and largest).
   * If a number's count becomes 1 or less, it's either consumed or no longer a priority.
   * If one end runs out of multi-occurrence numbers, any remaining deficit
   * might (conceptually) be covered by single-occurrence numbers, though
   * the core logic focuses on pairing up multi-occurrence numbers.
   */

  var mae = 0 ; // Pointer for the front (smallest) end of useSet.
  var ato = useSet.length - 1 ; // Pointer for the back (largest) end of useSet.

  // Main loop for the "eating" process.
  // Continues until the front and back pointers meet or cross.
  while ( true ) {

    var maeCount = count [ useSet [ mae ] ] ; // Get count of the number at the front.

    if ( maeCount <= 1 ) {
      // If the front number's count is 1 or less, it cannot be paired.
      // Move the front pointer forward and continue to the next iteration.
      mae ++ ;
      continue ;
    }


    var atoCount = count [ useSet [ ato ] ] ; // Get count of the number at the back.

    if ( atoCount <= 1 ) {
      // If the back number's count is 1 or less, it cannot be paired.
      // Move the back pointer backward and continue to the next iteration.
      ato -- ;
      continue ;
    }


    if ( mae >= ato ) {
       // Termination condition: The front pointer has met or crossed the back pointer.
       // All possible pairings of distinct multi-occurrence numbers have been made.

      // Special handling if mae and ato point to the same element, and its count is >= 2.
      if ( maeCount >= 2 ) {
         if ( maeCount % 2 == 1 ) {
            // If the count is odd, one instance remains after pairing.
            count [ useSet [ mae ] ] = 1 ;
         }
         else {
           // If the count is even, all instances are paired, leaving 0.
           count [ useSet [ mae ] ] = 0 ;
         }
      }
      break ; // Exit the while loop.
    }
    else {
      // If mae is still less than ato, we can pair a number from the front with one from the back.
      // Decrement the count for both numbers, effectively "consuming" one instance of each.
      count [ useSet [ mae ] ] -- ;
      count [ useSet [ ato ] ] -- ;
    }
  }


  // Initialize a variable to store the final output: the count of numbers with a remaining count of 1.
  var output = 0 ;

  // Iterate through the unique numbers to find those with a count of exactly 1.
  for ( var i = 0 ; i < useSet.length ; i ++ ) {
    if ( count [ useSet [ i ] ] == 1 ) {
       // If a number's count is 1, it contributes to the final output.
       output ++ ;
    }
  }

  // Print the final calculated output.
  myout ( output ) ;
}


// Invoke the Main function with the input read from standard input.
Main ( myin ( ) ) ;
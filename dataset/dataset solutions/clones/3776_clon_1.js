/*
 * Polyfill for String.prototype.repeat,
 * providing compatibility for environments that do not support it natively.
 * This implementation adheres to the ECMAScript specification.
 */
if ( ! String . prototype . repeat ) {

  // Assign the repeat method to the String prototype.
  String . prototype . repeat = function ( count ) {

    'use strict' ; // Ensure strict mode for this function.

    // Step 1: Check for null or undefined 'this' value.
    if ( this == null ) {
      throw new TypeError ( 'can\'t convert ' + this + ' to object' ) ;
    }

    // Step 2: Convert 'this' to a string.
    var str = '' + this ;

    // Step 3: Convert count to an integer.
    count = + count ;

    // Step 4: Handle NaN count (e.g., 'foo'.repeat('bar')).
    if ( count != count ) {
      count = 0 ;
    }

    // Step 5: Ensure count is non-negative.
    if ( count < 0 ) {
      throw new RangeError ( 'repeat count must be non-negative' ) ;
    }

    // Step 6: Ensure count is not Infinity.
    if ( count == Infinity ) {
      throw new RangeError ( 'repeat count must be less than infinity' ) ;
    }

    // Step 7: Floor the count to an integer.
    count = Math . floor ( count ) ;

    // Step 8: Handle edge cases where result is an empty string.
    if ( str . length == 0 || count == 0 ) {
      return '' ;
    }

    // Step 9: Check for potential string size overflow.
    // Max string length is typically 2^28 - 1 or 2^29 - 1.
    // 1 << 28 is 268,435,456
    if ( str . length * count >= 1 << 28 ) {
      throw new RangeError ( 'repeat count must not overflow maximum string size' ) ;
    }

    // Step 10: Initialize the result string.
    var rpt = '' ;

    // Step 11: Main loop for string repetition (binary exponentiation method).
    for ( ; ; ) { // Infinite loop, controlled by 'break'.

      // If the LSB of count is 1, append 'str' to 'rpt'.
      if ( ( count & 1 ) == 1 ) {
        rpt += str ;
      }

      // Right shift count by 1 (equivalent to count = Math.floor(count / 2)).
      count >>>= 1 ;

      // If count becomes 0, all bits have been processed; break the loop.
      if ( count == 0 ) {
        break ;
      }

      // Double the 'str' for the next iteration.
      str += str ;

    }

    // Step 12: Return the final repeated string.
    return rpt ;

  } ; // End of String.prototype.repeat function definition.

} // End of if block for polyfill.



/**
 * Compares two objects for shallow equality based on their own enumerable properties.
 * This function checks if two objects have the same property names and
 * if the values associated with those names are strictly equal (===).
 *
 * @param {object} a - The first object to compare.
 * @param {object} b - The second object to compare.
 * @returns {boolean} True if the objects are shallowly equal, false otherwise.
 */
function equal ( a , b ) {
  // Get an array of all own enumerable property names of object 'a'.
  var aP = Object . getOwnPropertyNames ( a ) ;

  // Get an array of all own enumerable property names of object 'b'.
  var bP = Object . getOwnPropertyNames ( b ) ;

  // If the number of properties is different, the objects cannot be equal.
  if ( aP . length != bP . length ) {
    return false ;
  }

  // Iterate over the property names of object 'a'.
  for ( var i = 0 ; i < aP . length ; i ++ ) {
    // Check if the value of the current property in 'a' is strictly not equal
    // to the value of the corresponding property in 'b'.
    if ( a [ aP [ i ] ] !== b [ aP [ i ] ] ) {
      return false ; // If not equal, objects are not equal.
    }
  }

  // If all property names and their corresponding values are strictly equal,
  // then the objects are considered equal.
  return true ;
}



/**
 * Parses a string argument and returns an integer of the specified radix (base).
 * This function is a wrapper for `parseInt(text, 10)`.
 *
 * @param {string} text - The string to parse.
 * @returns {number} An integer number.
 */
function pi ( text ) {
  // Parses the input string as a base-10 integer.
  return parseInt ( text , 10 ) ;
}



// Define an array 'six' containing powers of 6.
// It maps [6, 5, 4, 3, 2, 1] to [6^6, 6^5, 6^4, 6^3, 6^2, 6^1].
var six = [ 6 , 5 , 4 , 3 , 2 , 1 ] . map (
  function ( _ ) {
    return Math . pow ( 6 , _ ) ;
  }
) ;

// Define an array 'nine' containing powers of 9.
// It maps [5, 4, 3, 2, 1] to [9^5, 9^4, 9^3, 9^2, 9^1].
var nine = [ 5 , 4 , 3 , 2 , 1 ] . map (
  function ( _ ) {
    return Math . pow ( 9 , _ ) ;
  }
) ;



/**
 * Recursive function to calculate a 'count' based on input 'i'.
 * It uses predefined arrays 'six' and 'nine' for calculations.
 *
 * @param {number} i - The input integer.
 * @returns {number} The calculated count.
 */
function count ( i ) {

  // Base case 1: If 'i' is less than 6, return 'i' itself.
  if ( i < 6 ) {
    return i ;
  }

  // Base case 2: If 'i' is less than 9, return 1 plus the difference (i - 6).
  if ( i < 9 ) {
    return 1 + ( i - 6 ) ;
  }

  // Recursive step:
  // Find the largest element in 'six' that is less than or equal to 'i',
  // then recursively call 'count' with 'i' minus that element, and add 1.
  // Do the same for 'nine'.
  // Return the minimum of these two results.
  return Math . min (
    count ( i - six . find ( function ( _ ) { return _ <= i ; } ) ) + 1 ,
    count ( i - nine . find ( function ( _ ) { return _ <= i ; } ) ) + 1
  ) ;

}



/**
 * Main function to process input and calculate the minimum score.
 * This function simulates a problem where colors are assigned to a grid
 * and costs are calculated based on color changes.
 *
 * @param {string} input - The raw input string containing grid dimensions, costs, and color assignments.
 */
function main ( input ) {

  // Split the input string into lines.
  var l = input . split ( "\n" ) ;

  // Parse the first line for N (grid size) and C (number of colors).
  // The first element is shifted from 'l' and then split by space,
  // finally mapped to integers using the 'pi' helper function.
  var T = l . shift ( ) . split ( " " ) . map ( function ( _ ) { return pi ( _ ) ; } ) ;

  // Extract N (grid dimension) from T.
  var N = T [ 0 ] ;

  // Extract C (number of available colors) from T.
  var C = T [ 1 ] ;

  // Parse the next C lines as the cost matrix D.
  // Each line is split by space and mapped to integers.
  var D = l . splice ( 0 , C ) . map ( function ( _ ) {
    return _ . split ( " " ) . map ( function ( _ ) { return pi ( _ ) ; } ) ;
  } ) ;

  // Parse the next N lines as the initial color assignments 'c' for the grid.
  // Each line represents a row, split by space and mapped to integers.
  var c = l . splice ( 0 , N ) . map ( function ( _ ) {
    return _ . split ( " " ) . map ( function ( _ ) { return pi ( _ ) ; } ) ;
  } ) ;

  // Initialize a 3xN array (where N is C, number of colors) to store
  // counts of original colors for each (i+j)%3 group.
  // Each sub-array represents a modulo group (0, 1, or 2),
  // and its elements store counts for each color (0 to C-1).
  var mod2colorStat = [
    ".".repeat(C).split("").map(function (_) { return 0; }) , // For (i+j)%3 == 0
    ".".repeat(C).split("").map(function (_) { return 0; }) , // For (i+j)%3 == 1
    ".".repeat(C).split("").map(function (_) { return 0; })   // For (i+j)%3 == 2
  ] ;

  // Iterate over the grid 'c' to populate 'mod2colorStat'.
  // For each cell (i, j) with color `_`, increment the count for
  // `_ - 1` (0-indexed color) in the `(i + j) % 3` group.
  c . forEach ( function ( _ , i ) {
    return _ . forEach ( function ( _ , j ) {
      mod2colorStat [ ( i + j ) % 3 ] [ _ - 1 ] ++ ;
    } ) ;
  } ) ;

  // Calculate the cost for each modulo group if its cells were changed to a target color.
  // 'mod2score' will be a 3xN array (N is C, number of colors).
  // mod2score[k][targetColor] will store the total cost if all cells in group 'k'
  // were changed to 'targetColor'.
  var mod2score = mod2colorStat . map ( function ( stat ) {
    return ".".repeat(C).split("").map(function ( _ , toColor ) {
      // For each possible 'toColor', calculate the sum of costs.
      return stat . map ( function ( count , fromColor ) {
        // If 'fromColor' is the same as 'toColor', no cost is incurred (0).
        // Otherwise, it's 'count' (number of cells with 'fromColor')
        // multiplied by the cost D[fromColor][toColor].
        return fromColor == toColor ? 0 : count * D [ fromColor ] [ toColor ] ;
      } ) . reduce ( function ( a , b ) {
        return a + b ;
      } , 0 ) ; // Initial sum is 0.
    } ) ;
  } ) ;

  // Initialize 'minScore' to a very large value (Infinity)
  // to find the absolute minimum cost.
  var minScore = Infinity ;

  // Iterate through all possible combinations of target colors (a, b, c_1)
  // for the three modulo groups (0, 1, 2).
  // 'a' is the target color for group 0.
  for ( var a = 0 ; a < C ; a ++ ) {

    // 'b' is the target color for group 1.
    for ( var b = 0 ; b < C ; b ++ ) {

      // The target colors for different groups must be distinct.
      if ( a == b ) {
        continue ; // Skip if colors for group 0 and 1 are the same.
      }

      // 'c_1' is the target color for group 2.
      for ( var c_1 = 0 ; c_1 < C ; c_1 ++ ) {

        // The target colors for different groups must be distinct.
        if ( b == c_1 || a == c_1 ) {
          continue ; // Skip if colors for group 1 and 2, or 0 and 2 are the same.
        }

        // Calculate the total score for the current combination of colors.
        // Update 'minScore' if the current combination yields a lower total score.
        minScore = Math . min (
          minScore ,
          mod2score [ 0 ] [ a ] + mod2score [ 1 ] [ b ] + mod2score [ 2 ] [ c_1 ]
        ) ;
      } // End of inner loop (c_1).

    } // End of middle loop (b).

  } // End of outer loop (a).

  // Output the calculated minimum score to the console.
  console . log ( minScore ) ;

}



// Execute the main function, passing the content of /dev/stdin as input.
// This reads the entire file synchronously and decodes it as UTF-8.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
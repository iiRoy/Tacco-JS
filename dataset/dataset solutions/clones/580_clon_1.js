/*
 * This is a self-executing anonymous function (IIFE)
 * that processes input from standard input.
 * It aims to find the longest common substring between pairs of strings.
 */
( function ( input ) {
  // Declare all necessary variables at the beginning of the function scope.
  // inputs: An array of strings obtained by splitting the raw input by newlines
  //         after removing any carriage return characters.
  // str: An array that will temporarily hold the two strings being compared in each iteration.
  // s, l: Variables to store the shorter and longer strings, respectively, for optimization.
  // tmp: A temporary variable, declared but not used in the final logic (common practice).
  // count: Tracks the current length of a potential common substring.
  // max: Stores the maximum length of the common substring found for the current pair of strings.
  var inputs = input . replace( /\r/g, '' ) . split( "\n" ), str = [], s, l, tmp, count, max;


  // Start an infinite loop to process input pairs.
  // The loop will explicitly break when a specific condition is met.
  while ( true ) {
    // Initialize 'max' to 0 for each new pair of strings.
    // This ensures that the maximum length is calculated independently for every pair.
    max = 0;

    // Retrieve the first string for the current comparison from the 'inputs' array.
    // The 'shift()' method removes the first element from the array and returns it.
    str[ 0 ] = inputs . shift();

    // Check if the retrieved string is empty.
    // An empty string signals the end of the input data.
    if ( str[ 0 ] === '' ) {
      /*
       * If the first string is empty, it means there are no more string pairs to process.
       * Therefore, exit the 'while' loop.
       */
      break;
    }

    // Retrieve the second string for the current comparison.
    // This string is expected to follow the first string in the input.
    str[ 1 ] = inputs . shift();

    // Determine which of the two strings is shorter and which is longer.
    // Assign the shorter string to 's' and the longer string to 'l'.
    // This optimization is crucial for the nested loop, as searching for substrings
    // of 's' within 'l' is more efficient when 's' is the smaller one.
    if ( str[ 0 ] . length < str[ 1 ] . length ) {
      // If the first string is shorter, assign it to 's'.
      s = str[ 0 ];
      // Assign the longer (second) string to 'l'.
      l = str[ 1 ];
    } else {
      // If the first string is not shorter (i.e., it's longer or equal in length),
      // assign the second string to 's'.
      s = str[ 1 ];
      // Assign the first string to 'l'.
      l = str[ 0 ];
    }

    // Iterate through all possible starting positions 'i' in the shorter string 's'.
    // 'len' is pre-calculated to avoid repeated 's.length' lookups in the loop condition.
    for ( var i = 0, len = s . length; i < len; i++ ) {
      // For each starting position 'i', initialize 'count' to 1.
      // 'count' represents the length of the common substring being checked.
      count = 1;

      // This inner loop attempts to extend the current common substring.
      // It continues as long as two conditions are met:
      // 1. 's[i + count - 1]' exists (i.e., the substring is still within the bounds of 's').
      // 2. 'l.indexOf(s.slice(i, i + count)) >= 0' means the current substring
      //    (from 's' starting at 'i' with length 'count') is found within the longer string 'l'.
      while ( s[ i + count - 1 ] && l . indexOf( s . slice( i, i + count ) ) >= 0 ) {
        // If both conditions are true, increment 'count' to try a longer substring.
        count++;
      }

      // After the 'while' loop terminates, 'count' will be one greater than
      // the actual maximum length of the common substring found starting at 'i'.
      // Update 'max' if the current maximum length (count - 1) is greater than
      // the previously recorded 'max'.
      if ( count > max ) {
        // Store the actual maximum length found from this starting position.
        max = count - 1;
      }
    }

    // After checking all possible starting positions in 's', 'max' holds the
    // longest common substring length for the current pair of strings.
    // Print this value to the console.
    console . log( max );
  }

// The entire anonymous function is immediately invoked (IIFE).
// The argument 'input' is populated by reading the content of standard input
// using Node.js 'fs' module. The content is read as UTF-8 encoded text.
} )( require( "fs" ) . readFileSync( "/dev/stdin", "utf8" ) );
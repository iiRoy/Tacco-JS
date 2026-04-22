"use strict" /* This directive enforces strict parsing and error handling in the script. */ ;

// --- Main Program Logic ---

/**
 * The primary function that processes the input and computes the desired result.
 * It reads two permutations, generates all possible permutations, sorts them,
 * finds the indices of the given permutations, and outputs the absolute difference.
 * @param {string} arg - The raw input string, typically from standard input.
 */
function main ( arg ) {

  // Step 1: Parse the input data.
  // The input string is trimmed and then split by newline characters
  // to get an array of lines.
  var data = arg . trim ( ) . split ( "\n" ) ;

  // Step 2: Extract the two permutations, 'p' and 'q', from the parsed data.
  // They are expected on the second and third lines, respectively,
  // and their elements are space-separated.
  var p = data [ 1 ] . split ( " " ) ;
  var q = data [ 2 ] . split ( " " ) ;

  // Step 3: Generate all permutations of the elements in array 'p'.
  // The 'permutation' helper function is called with 'p' and its length.
  var records = permutation ( p , p . length ) ;

  // Step 4: Convert the original 'p' and 'q' arrays into single strings
  // to facilitate comparison with the generated permutation records.
  p = p . join ( "" ) ; // 'p' is now a string (e.g., "123")
  q = q . join ( "" ) ; // 'q' is now a string (e.g., "132")

  // Declare variables to store the lexicographical indices of 'p' and 'q'.
  var pi , qi ;

  // Step 5: Convert each generated permutation record (which is an array)
  // into a string format, similar to how 'p' and 'q' were converted.
  for ( var i = 0 ; i < records . length ; i ++ ) {
    records [ i ] = records [ i ] . join ( "" ) ; // Joins elements without separator
  }

  // Step 6: Sort all the generated permutation strings lexicographically.
  // This is crucial for finding their ordered positions (indices).
  records . sort ( ) ;

  // Step 7: Iterate through the sorted records to find the indices of
  // the original 'p' and 'q' strings.
  for ( var i = 0 ; i < records . length ; i ++ ) {
    if ( p == records [ i ] ) {
      pi = i ; // 'pi' stores the index of permutation 'p'
    }
    if ( q == records [ i ] ) {
      qi = i ; // 'qi' stores the index of permutation 'q'
    }
  }

  // Step 8: Calculate and print the absolute difference between the found indices.
  console . log ( Math . abs ( pi - qi ) ) ; // Output the final result to standard output
}


// --- Input Handling ---

// This line reads the entire content from standard input ('/dev/stdin')
// as a UTF-8 string and passes it to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;


// --- Helper Function: Permutation Generator ---

/**
 * Generates all possible permutations of a given array of numbers.
 * This function uses a recursive approach to find all unique orderings.
 * @param {Array<string>} nums - The array of elements (as strings) to permute.
 * @param {number} k - The length of the permutations to generate (usually nums.length for all permutations).
 * @returns {Array<Array<string>>} An array where each element is a permutation (an array of strings).
 */
function permutation ( nums , k ) {

  var ans = [ ] ; // Initialize an empty array to accumulate all permutations.

  // Base Case 1: If the desired permutation length 'k' is greater than
  // the number of available elements, no permutations are possible.
  if ( nums . length < k ) {
    return [ ] ; // Return an empty array.
  }

  // Base Case 2: If 'k' is 1, each individual element is a permutation of itself.
  if ( k === 1 ) {
    for ( var i = 0 ; i < nums . length ; i ++ ) {
      ans [ i ] = [ nums [ i ] ] ; // Wrap each element in its own array.
    }
  } else {
    // Recursive Step: For k > 1, iterate through each element in 'nums'.
    for ( var i = 0 ; i < nums . length ; i ++ ) {
      // Create a temporary array 'parts' by shallow copying 'nums'.
      var parts = nums . slice ( 0 ) ;
      // Remove the current element at index 'i' from 'parts'.
      // The removed element is at parts.splice(i, 1)[0].
      parts . splice ( i , 1 ) [ 0 ] ;

      // Recursively find all (k-1)-length permutations of the remaining 'parts'.
      var row = permutation ( parts , k - 1 ) ;

      // Combine the current element (nums[i]) with each of the
      // (k-1)-length permutations found recursively.
      for ( var j = 0 ; j < row . length ; j ++ ) {
        // Prepend nums[i] to each permutation in 'row' and add to 'ans'.
        ans . push ( [ nums [ i ] ] . concat ( row [ j ] ) ) ;
      }
    }
  }

  return ans ; // Return the complete list of generated permutations.
}
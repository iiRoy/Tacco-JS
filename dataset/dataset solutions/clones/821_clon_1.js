var n ; // Global variable for the current input value, usually representing a limit or size.

// Global array 'x' will store pre-calculated values, e.g., triangular numbers.
var x = [ ] ;


/*
 * Function: init
 * Description: Initializes the global array 'x' based on the value of 'n'.
 *              It populates 'x' with a sequence of numbers, specifically triangular numbers.
 * Parameters: None (uses global 'n' and 'x').
 * Returns: void
 */
function init ( ) {
  // The first element of the sequence is 0.
  x [ 0 ] = 0 ;

  // Use the custom 'rep' function to iterate and compute subsequent values.
  // Iterates from index 1 up to 'n' (exclusive).
  rep ( 1 , n , function ( i ) {
    // Each element x[i] is the sum of the previous element x[i-1] and the current index 'i'.
    // This generates the sequence: 0, 1, 3, 6, 10, ... (triangular numbers).
    x [ i ] = x [ i - 1 ] + i ;
  } ) ;
}


/**
 * Function: search
 * Description: Performs a binary search on the pre-calculated 'x' array
 *              to determine if a specific value 'v' exists within it.
 * @param {number} v - The target value to search for.
 * @returns {boolean} - True if 'v' is found in 'x', false otherwise.
 */
function search ( v ) {
  // Initialize 'l' (left pointer) and 'r' (right pointer) for the binary search range.
  var l = 0 , r = n ;

  // The loop continues as long as there are at least two elements in the search range.
  while ( r - l > 1 ) {
    // Calculate the middle index 'm' using bitwise right shift for efficient integer division.
    var m = ( l + r ) >> 1 ;

    // Compare the value at the middle index x[m] with the target value 'v'.
    if ( x [ m ] <= v ) {
      // If x[m] is less than or equal to 'v', the target could be at 'm' or to its right.
      // So, update the left pointer to 'm'.
      l = m ;
    }
    else {
      // If x[m] is greater than 'v', the target must be to the left of 'm'.
      // So, update the right pointer to 'm'.
      r = m ;
    }
  }

  // After the loop, 'l' will point to the largest index such that x[l] <= v.
  // Check if the value at this index is exactly equal to 'v'.
  return x [ l ] === v ;
}


/*
 * Function: main
 * Description: The primary execution logic of the program.
 *              It reads input values for 'n', initializes 'x', performs calculations,
 *              and prints the result for each 'n'.
 * Parameters: None (uses global 'n', 'x', and utility functions).
 * Returns: void
 */
function main ( ) {
  // Continuously loop as long as 'scan()' successfully reads a value for 'n'.
  // The assignment (n = scan()) evaluates to the assigned value, which is truthy for numbers.
  while ( n = scan ( ) ) {
    // Initialize the 'x' array based on the newly read 'n'.
    init ( ) ;

    // Initialize an answer counter for the current 'n'.
    var ans = 0 ;

    // Iterate from 0 up to n-1 (exclusive) using the 'rep' function.
    rep ( 0 , n - 1 , function ( i ) {
      // For each 'i', calculate a target value: x[i] + n.
      // Then, search for this target value in the 'x' array.
      if ( search ( x [ i ] + n ) ) {
        // If the target is found, increment the answer counter.
        ++ ans ;
      }
    } ) ;

    // After processing all 'i' values for the current 'n', print the final answer.
    print ( ans ) ;
  }
}


/**
 * Function: rep
 * Description: A versatile repetition (loop) function.
 *              It iterates a specified number of times and calls a callback function.
 *              Supports two call signatures:
 *              1. rep(end, callback) - Iterates from 0 up to 'end' (exclusive).
 *              2. rep(start, end, callback) - Iterates from 'start' (inclusive) up to 'end' (exclusive).
 * @param {number} a - Start index or end index, depending on the overload.
 * @param {number|function} b - End index or the callback function.
 * @param {function} [c] - The callback function (optional, for the 3-argument overload).
 * @returns {void}
 */
function rep ( a , b , c ) {
  // Check if the third argument 'c' is undefined.
  // If it is, it means the function was called with two arguments (rep(end, callback)).
  if ( c === undefined ) {
    // In this case, 'b' is the callback function.
    c = b ;
    // 'a' is the 'end' value.
    b = a ;
    // The starting index is implicitly 0.
    a = 0 ;
  }

  // Standard for loop to iterate from 'a' (inclusive) to 'b' (exclusive).
  for ( var i = a ; i < b ; ++ i ) {
    // Execute the callback function 'c' with the current iteration index 'i'.
    // If the callback returns `false`, break out of the loop prematurely.
    if ( c ( i ) === false ) {
      break ;
    }
  }
}


// Global string variable to accumulate all raw input data from stdin.
var input = '' ;


// Function: scan
// Description: Retrieves and returns the next number from the processed input array.
// Returns: {number} - The next number from the input.
function scan ( ) {
  // 'pop()' removes and returns the last element of the array.
  // Since the input array is reversed, 'pop()' gets elements in their original order.
  // The unary '+' operator converts the string element to a number.
  return + input . pop ( ) ;
}

// Function: scan_string
// Description: Retrieves and returns the next string from the processed input array.
// Returns: {string} - The next string from the input.
function scan_string ( ) {
  // 'pop()' removes and returns the last element of the array (as a string).
  return input . pop ( ) ;
}

// Function: print
// Description: Outputs a given value to the console, followed by a newline.
// @param {*} val - The value to be printed.
// Returns: void
function print ( val ) {
  console . log ( val ) ;
}


// --- Standard Input Handling ---

// Ensure the standard input stream remains open for data.
process . stdin . resume ( ) ;

// Set the character encoding for incoming standard input data.
process . stdin . setEncoding ( 'utf8' ) ;

// Event listener for when data chunks are received from standard input.
process . stdin . on ( 'data' , function ( chunk ) {
  // Append each incoming chunk of data to the global 'input' string.
  input += chunk ;
} ) ;

// Event listener for when the standard input stream has ended (no more data).
process . stdin . on ( 'end' , function ( ) {
  // Process the accumulated input string:
  // 1. trim() - Remove leading/trailing whitespace.
  // 2. split(/\s+/) - Split the string into an array of substrings using any whitespace as a delimiter.
  // 3. reverse() - Reverse the order of elements in the array. This is done so that 'pop()'
  //               can retrieve elements in their original logical order (first element first).
  input = input . trim ( ) . split ( /\s+/ ) . reverse ( ) ;

  // Once all input is processed and ready, call the main program function.
  main ( ) ;
} ) ;
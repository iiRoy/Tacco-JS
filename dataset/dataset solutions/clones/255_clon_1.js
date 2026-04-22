// This is a Type I clone of the original JavaScript code.
// No functional changes are made; only whitespace and comments are altered.

var Input = [ ] ; // Initialize an empty array named Input.
var arr = [ ] ;   // Initialize another empty array named arr for counting.

// The 'input' variable is assumed to be defined elsewhere,
// likely containing raw input data.
// The original code had a commented-out section for file reading.
Input = input  /* This part was originally commented out,
                  it's likely for reading input from a file system
                  like Node.js 'fs' module.
                  For browser environments, 'input' would be a string.
               */ .split(  /,\d+\n{0,}/  ) ;

// Determine the effective length of the processed Input array.
var length = Input.length ;

// Declare a temporary variable 'a' which will hold parsed integers.
var a ;
// Initialize an empty string to accumulate the final answer.
var ans = "" ;

// Loop through the 'Input' array, excluding the last element
// as per the 'length-1' condition. This loop processes the input
// to count occurrences of each number.
for ( var i = 0 ; i < length - 1 ; i ++ ) {
  // Parse the current string element from 'Input' into an integer.
  a = parseInt( Input[ i ] ) ;

  // Check if this integer 'a' has been encountered before in 'arr'.
  if ( arr[ a ] === undefined ) {
    // If not, initialize its count to 1.
    arr[ a ] = 1 ;
  } else {
    // If yes, increment its existing count.
    arr[ a ] ++ ;
  }
}

// Re-assign 'length' to the length of the 'arr' array,
// which might be different from the previous 'Input.length'.
// This is done to iterate over the 'arr' array's valid indices.
length = arr.length ;

// Second loop: iterate through the 'arr' array to find elements
// that appeared more than once.
for ( i = 0 ; i < length ; i ++ ) {
  // Check if the current index 'i' in 'arr' has a defined value
  // (meaning it was encountered in the input)
  // and if that value (count) is greater than 1 (meaning it's a duplicate).
  if ( arr[ i ] !== undefined && arr[ i ] > 1 ) {
    // If both conditions are true, append the index (the number)
    // and its count to the 'ans' string, followed by a newline character.
    ans += ( i + ' ' + arr[ i ] + '\n' ) ;
  }
}

// Finally, print the accumulated answer string to the console.
// This string contains all numbers that appeared more than once,
// along with their respective counts.
console.log( ans ) ;
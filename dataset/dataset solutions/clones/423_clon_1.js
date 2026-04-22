/*
 * This function performs a binary search on a sorted array 'A'
 * to find a specific 'key'. It returns the number of iterations
 * taken to find the key or determine its absence within the array.
 */
function binarySearch ( A, key )
{
  // Initialize the left boundary pointer for the search range.
  var left = 0
  ;

  // Initialize the right boundary pointer for the search range.
  // In this implementation, 'A.length' is used as an exclusive upper bound.
  var right = A.length
  ;

  // Initialize a counter to track the number of iterations performed.
  var cnt = 0
  ;

  // The main loop for the binary search algorithm.
  // It continues indefinitely until a break condition is met.
  while ( true )
  {
    // If the left pointer meets the right pointer, it means the search space
    // has been exhausted and the key was not found.
    if ( left == right )
      break
    ;

    // Increment the iteration counter for each step of the search.
    cnt++
    ;

    // Calculate the middle index of the current search segment.
    // 'Math.floor' ensures 'mid' is an integer index.
    var mid = Math.floor( ( left + right ) / 2 )
    ;

    // Check if the element at the middle index is equal to the target key.
    if ( A[mid] == key )
      return cnt // If the key is found, return the iteration count.
    ;

    // If the key is less than the element at the middle index,
    // narrow the search to the left half of the current segment.
    if ( key < A[mid] )
      right = mid
    ;
    // Otherwise (if the key is greater than the element at the middle index),
    // narrow the search to the right half of the current segment.
    else
      left = mid + 1
    ;
  }

  // If the loop completes without finding the key, return the final iteration count.
  // This indicates the key is not present in the array.
  return cnt
  ;
}

/*
 * Main program execution block.
 * This section handles reading input, parsing it, and applying the binary search function.
 */
// Read all input from standard input ('/dev/stdin') as a UTF-8 string.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' )
;

// Process the input: trim leading/trailing whitespace and split it into an array
// of strings, using newline characters as delimiters.
var Arr = input.trim().split( "\n" )
;

// Loop indefinitely to process multiple test cases from the input array.
while ( true )
{
  // Extract the first element from 'Arr', convert it to a number, and assign it to 'n'.
  // The '-0' converts the string to a number.
  var n = Arr.shift() - 0
  ;

  // If 'n' is 0, it signifies the end of the input test cases, so break the loop.
  if ( n == 0 )
    break
  ;

  // Declare an empty array to store the elements for the current test case.
  var arr = []
  ;

  // Populate 'arr' with 'n' elements, each converted to a number,
  // by shifting them from the 'Arr' input array.
  for ( var i = 0 ; i < n ; i++ )
    arr.push( Arr.shift() - 0 )
  ;

  // Perform a binary search on the 'arr' using the next element from 'Arr' as the key.
  // The result (iteration count) is then printed to the console.
  console.log( binarySearch( arr, Arr.shift() - 0 ) )
  ;
}
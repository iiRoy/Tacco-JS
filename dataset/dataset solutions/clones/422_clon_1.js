/*
 * This is a Type I clone of a JavaScript program.
 * It implements a binary search function and then uses it
 * to process input data from standard input.
 *
 * All original identifiers, operators, and expressions are preserved.
 * Only whitespace and comments have been altered significantly.
 */

// Define the binarySearch function.
function binarySearch ( A , key ) {
    // Initialize the left pointer for the search range.
    var left   =   0 ;

    // Initialize the right pointer for the search range.
    // Note: A.length is exclusive for the right boundary in some implementations,
    // but here it's used as the initial upper bound.
    var right = A . length ;

    // Initialize a counter to track the number of iterations.
    var cnt  =  0 ;

    // Start an infinite loop for the binary search.
    while ( true ) {
        // Increment the iteration counter on each pass.
        cnt ++ ;

        // If the left pointer surpasses the right pointer,
        // it means the element is not found within the valid range,
        // or the search space has been exhausted.
        if ( left > right ) break ;

        // Calculate the middle index of the current search range.
        // Math.floor ensures we get an integer index.
        var mid  =  Math . floor ( ( left + right ) / 2 ) ;

        // Check if the element at the middle index is the target key.
        // If it is, return the iteration count (representing steps to find).
        if ( A [ mid ] == key ) return cnt ;

        // If the key is less than the element at the middle index,
        // it means the key must be in the left half.
        // Adjust the right pointer to `mid`.
        if ( key < A [ mid ] ) right = mid ;
        // Otherwise (if key is greater than A[mid]),
        // the key must be in the right half.
        // Adjust the left pointer to `mid + 1`.
        else left = mid + 1 ;
    }

    // This line should ideally not be reached if the key is always found,
    // but it acts as a fallback return for the iteration count.
    return cnt ;
}


// --- Main program execution starts here ---

// Use Node.js 'fs' module to read all data from standard input.
// The data is read as UTF-8 encoded text.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string:
// 1. Remove leading/trailing whitespace using trim().
// 2. Split the string into an array of lines based on the newline character.
var Arr = input . trim ( ) . split ( "\n" ) ;


// Enter a loop to process multiple test cases or sets of data.
while ( true ) {

    // Extract the first element from the 'Arr' array,
    // convert it to a number (the '-0' trick), and store it as 'n'.
    // 'n' typically represents the number of elements in the array for the current test case.
    var n = Arr . shift ( ) - 0 ;

    // If 'n' is 0, it signifies the end of input or test cases.
    // Break out of the processing loop.
    if ( n == 0 ) break ;

    // Initialize an empty array to store the numbers for the current binary search.
    var arr = [ ] ;

    // Loop 'n' times to populate 'arr' with numbers from the input array.
    for ( var i = 0 ; i < n ; i ++ ) {
        // Take the next element from 'Arr', convert it to a number, and push to 'arr'.
        arr . push ( Arr . shift ( ) - 0 ) ;
    }

    // After populating 'arr', the next element in 'Arr' is expected to be the key to search for.
    // Call the binarySearch function with the current 'arr' and the key.
    // Print the result (number of iterations) to the console.
    console . log ( binarySearch ( arr , Arr . shift ( ) - 0 ) ) ;
}
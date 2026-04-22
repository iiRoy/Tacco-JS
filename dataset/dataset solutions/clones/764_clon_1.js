/*
 * This JavaScript file processes input data to determine a winner or a tie
 * based on a specific counting and comparison logic.
 *
 * It reads input from standard input, parses it, and then applies
 * a custom algorithm to find a dominant element in a sequence.
 *
 * The output is a string indicating the winner and the step count,
 * or "TIE" if no clear winner is found.
 */


// Module 'fs' is required for file system operations, specifically reading from stdin.
var    input = require('fs') .readFileSync ( '/dev/stdin' ,  'utf8' );

// Trim whitespace from the input and split it into an array of lines.
var    arr   =   input . trim () . split ( "\n" ) ;


// Initialize an empty string to accumulate the final answer.
var ans = "" ;


// Main loop: Continues as long as the first element shifted from 'arr' is not '0'.
// The '0' acts as a sentinel value to indicate the end of input sets.
while ( arr.shift() != 0 )
{
    // Shift the next line from 'arr', split it by spaces, and store it in 'a'.
    // This 'a' array represents the current sequence of elements to be processed.
    var a = arr.shift() .split(" ") ;

    // Initialize an empty object to store counts of elements within the current 'a' array.
    var obj = { } ;

    // Loop through each element in the 'a' array.
    for ( var i = 0 ; i < a.length ; i++ )
    {
        // Increment the count for the current element `a[i]` in the `obj`.
        // If the element is encountered for the first time, its count is initialized to 1.
        obj[a[i]] = obj[a[i]] + 1 || 1 ;

        // Declare an empty array 's' to hold elements and their counts for sorting.
        var s = [] ;
        // Populate 's' with [count, element] pairs from the 'obj' (the frequency map).
        for ( var k in obj )
        {
            s.push ( [ obj[k] , k ] ) ;
        }

        // Sort the 's' array in descending order based on the count (first element of the inner array).
        s.sort ( function ( a, b )
        {
            // Custom comparison function for sorting.
            return b[0] - a[0] ;
        } ) ;

        // If 's' contains only one element, add a placeholder for the second element with a count of 0.
        // This prevents errors when trying to access s[1] later.
        if ( s.length == 1 )
        {
            s[1] = [ 0 ] ;
        }

        // Check for a winning condition:
        // If the count of the most frequent element (s[0][0]) is greater than
        // the count of the second most frequent element (s[1][0]) plus the remaining elements
        // in the current sequence (a.length - (i + 1)), then a winner is determined.
        if ( s[0][0] > s[1][0] + a.length - ( i + 1 ) )
        {
            // Append the winner's identifier and the current step count (i + 1) to the answer string.
            ans += s[0][1] + " " + ( i + 1 ) + "\n" ;
            // Exit the inner 'for' loop as a winner has been found for this sequence.
            break ;
        }

    } // End of the inner 'for' loop over elements of 'a'.

    // If the 'for' loop completed without a 'break' (i.e., 'i' reached 'a.length'),
    // it means no clear winner was found under the conditions.
    if ( i == a.length )
    {
        // Append "TIE" to the answer string.
        ans += "TIE" + "\n" ;
    }

} // End of the main 'while' loop.


// Finally, print the accumulated answer string to the console,
// after trimming any trailing whitespace.
console.log ( ans.trim() ) ;
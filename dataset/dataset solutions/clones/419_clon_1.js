/*
 * This function attempts to 'search' for a specific condition
 * related to elements in a global array 'ary' and a global variable 'm'.
 * It processes the array 'ary' and checks if a given value 'x' can be
 * partitioned or handled according to certain rules.
 *
 * @param {number} x - The target value to evaluate against the array elements.
 * @returns {boolean} - Returns true if the condition is met, false otherwise.
 */
function seach  (x)
{
    // Initialize a flag to true; it will be set to false if conditions are not met.
    var flag = true;
    // Counter for a specific operation, initialized to zero.
    var cnt  = 0;
    // Accumulator for sum, initialized to zero.
    var sum  = 0;

    // Loop through each element of the global array 'ary'.
    for ( var i = 0; i < ary.length; i++ )
    {
        // Condition 1: If 'x' is less than the current array element.
        if ( x < ary[ i ] )
        {
            flag = false; // Set flag to false.
            break;        // Exit the loop early.
        }
        // Condition 2: If the current sum plus the array element equals 'x'.
        else if ( sum + ary[ i ] == x )
        {
            sum = 0;      // Reset sum.
            cnt++;        // Increment counter.
        }
        // Condition 3: If the current sum plus the array element exceeds 'x'.
        else if ( sum + ary[ i ] > x )
        {
            sum = ary[ i ]; // Reset sum to the current array element.
            cnt++;          // Increment counter.
        }
        // Condition 4: If the current sum plus the array element is less than 'x'.
        else if ( sum + ary[ i ] < x )
        {
            sum += ary[ i ]; // Add the current array element to sum.
        }

        // Check if the counter has reached the global variable 'm'.
        if ( cnt == m )
        {
            flag = false; // If so, set flag to false.
            break;        // Exit the loop.
        }
    }

    // Return the final state of the flag.
    return flag;
}

// Read input from standard input, decode as UTF-8.
var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// Process the input: trim whitespace, then split by newline characters.
var arr = input.trim().split( "\n" );

// Main processing loop, continues indefinitely until a specific break condition.
while ( true )
{
    // Get the first line from the 'arr' array.
    var mn = arr.shift();

    // Break condition for the main loop: if 'mn' is "0 0".
    if ( mn == "0 0" )
    {
        break;
    }

    // Split 'mn' by space and convert parts to numbers.
    mn = mn.split( " " ).map( Number );

    // Assign the first number to 'm'.
    var m = mn[ 0 ];
    // Assign the second number to 'n'.
    var n = mn[ 1 ];

    // Initialize an empty array for 'ary'. This is a global array used by 'seach'.
    var ary = [];

    // Populate 'ary' with 'n' elements from 'arr', converting them to numbers.
    while ( n-- )
    {
        ary.push( arr.shift() - 0 );
    }

    // Initialize the lower bound for binary search.
    var L = 0;
    // Initialize the upper bound for binary search.
    var R = 1500000; // A sufficiently large upper bound.

    // Binary search loop.
    while ( true )
    {
        // Calculate the middle point for the current search range.
        var middle = Math.floor( ( L + R ) / 2 );

        // Call the 'seach' function with the middle value.
        if ( seach( middle ) )
        {
            // If 'seach' returns true, try a smaller value.
            R = middle - 1;

            // Check for termination condition of binary search.
            if ( L > R )
            {
                console.log( R + 1 ); // Output the result.
                break;                // Exit binary search loop.
            }
        }
        else
        {
            // If 'seach' returns false, try a larger value.
            L = middle + 1;

            // Check for termination condition of binary search.
            if ( L > R )
            {
                console.log( R + 1 ); // Output the result.
                break;                // Exit binary search loop.
            }
        }
    }
}
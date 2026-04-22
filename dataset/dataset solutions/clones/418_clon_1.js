/*
 * This is a Type I clone of the original JavaScript code.
 * The purpose is to demonstrate extensive changes in whitespace and comments,
 * while keeping all identifiers, operators, and expressions identical.
 */

// Function definition for 'seach' - note the intentional typo from the original.
function seach ( x )
{
    // Initialize a boolean flag, a counter, and a sum variable.
    var flag = true ;
    var cnt  = 0   ; // Counter for some condition.
    var sum  = 0   ; // Accumulator variable.

    // Loop through the 'ary' array.
    for ( var i = 0 ; i < ary . length ; i ++ )
    {
        /*
         * Check various conditions based on 'x' and elements of 'ary'.
         * This block implements a specific search or partitioning logic.
         */
        if ( x < ary [ i ] )
        {
            // If x is less than the current array element, set flag to false and exit loop.
            flag = false ;
            break        ;
        }
        else if ( sum + ary [ i ] == x )
        {
            // If sum plus current element equals x, reset sum and increment counter.
            sum = 0   ;
            cnt ++    ;
        }
        else if ( sum + ary [ i ] > x )
        {
            // If sum plus current element exceeds x, reset sum to current element and increment counter.
            sum = ary [ i ] ;
            cnt ++          ;
        }
        else if ( sum + ary [ i ] < x )
        {
            // If sum plus current element is less than x, add current element to sum.
            sum += ary [ i ] ;
        }

        // Check if the counter 'cnt' has reached 'm'.
        if ( cnt == m )
        {
            // If so, set flag to false and break the loop.
            flag = false ;
            break        ;
        }
    }

    // Return the final value of the flag.
    return flag ;
}


// --- Main program execution starts here ---

// Import the 'fs' module to read from standard input.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string: trim whitespace and split into lines.
var arr   = input . trim ( ) . split ( "\n" ) ;


// Main loop to process multiple test cases.
while ( true )
{
    // Read the first line of the current test case (m and n).
    var mn = arr . shift ( ) ;

    // Check for the termination condition "0 0".
    if ( mn == "0 0" )
    {
        break ; // Exit the main loop if "0 0" is encountered.
    }

    // Parse 'mn' string into two numbers, m and n.
    mn = mn . split ( " " ) . map ( Number ) ;

    // Extract m and n values.
    var m = mn [ 0 ] ; // First number is 'm'.
    var n = mn [ 1 ] ; // Second number is 'n'.

    // Initialize an empty array 'ary'.
    var ary = [ ] ;

    // Populate 'ary' with 'n' elements from the input array 'arr'.
    // The '-0' converts the string to a number explicitly.
    while ( n -- )
    {
        ary . push ( arr . shift ( ) - 0 ) ;
    }

    // Initialize variables for binary search range.
    var L = 0           ; // Lower bound.
    var R = 1500000     ; // Upper bound (a large enough constant).

    // Perform a binary search.
    while ( true )
    {
        // Calculate the middle point of the current search range.
        var middle = Math . floor ( ( L + R ) / 2 ) ;

        // Call the 'seach' function with the middle value.
        if ( seach ( middle ) )
        {
            // If 'seach' returns true, narrow the range to the left.
            R = middle - 1 ;
        }
        else
        {
            // If 'seach' returns false, narrow the range to the right.
            L = middle + 1 ;
        }

        // Check for the binary search termination condition.
        if ( L > R )
        {
            break ; // Exit the binary search loop.
        }
    }

    // Output the result (R + 1) to the console.
    console . log ( R + 1 ) ;
}

// End of script.
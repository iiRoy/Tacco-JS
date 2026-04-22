/*
 * This file contains a set of utility functions for processing an array,
 * likely related to a game or puzzle.
 *
 * Each function (AA, BB, CC, DD) performs a specific operation
 * on a global array 'arr' based on certain conditions.
 *
 * The main execution block reads input, initializes the array,
 * applies operations, and prints the final state.
 */


function AA( str )
{
    // Function AA: Fills the first available zero with the given string.
    // Iterates through the array to find an empty slot.

    for ( var i = 1; i < arr.length - 1; i++ )
    {
        // Check if the current element is an empty slot (represented by 0)
        if ( arr[ i ] == 0 )
        {
            // If empty, fill it with the provided string and exit.
            arr[ i ] = str;
            return;
        }
    }

    // No empty slot found if execution reaches here (though not explicitly handled by the problem logic).
} // End of function AA definition.


function BB( )
{
    /*
     * Function BB: Attempts to place 'B' in a specific pattern.
     * It looks for a '0' that is not adjacent to an 'A'.
     */

    for ( var i = arr.length - 2; i >= 1; i-- )
    {
        // Check for a '0' that has non-'A' neighbors.
        if ( arr[ i - 1 ] != "A" && arr[ i ] == 0 && arr[ i + 1 ] != "A" )
        {
            // If the condition is met, place 'B' and return.
            arr[ i ] = "B";
            return;
        }
    }

    // If no such position is found, fallback to placing 'B' using function AA.
    AA( "B" );
} // End of BB function.


function CC( )
{
    // Function CC: Places 'C' based on adjacency or specific array positions.

    for ( var i = 1; i < arr.length - 1; i++ )
    {
        // Check if a non-zero element is followed by a zero.
        if ( arr[ i ] != 0 && arr[ i + 1 ] == 0 )
        {
            arr[ i + 1 ] = "C"; // Place 'C' and return.
            return;
        }

        // Check if a non-zero element is preceded by a zero.
        if ( arr[ i ] != 0 && arr[ i - 1 ] == 0 )
        {
            arr[ i - 1 ] = "C"; // Place 'C' and return.
            return;
        }
    }

    // If no adjacency rule applies, place 'C' in a middle position based on 'n'.
    // This handles cases where 'n' is odd or even.
    if ( n % 2 == 1 )
    {
        arr[ ( n - 1 ) / 2 + 1 ] = "C";
    }
    else
    {
        arr[ n / 2 + 1 ] = "C";
    }

} // End of CC function.


function DD( )
{
    // Function DD: Finds the largest contiguous block of zeros not surrounded by 'X' or [ABCD].
    // Then places 'D' in the middle of that block.

    var max = [ 0, 0 ]; // [position, length] of the largest block found.

    for ( var i = 1; i < arr.length - 1; i++ )
    {
        // Skip if the current element is not a zero.
        if ( arr[ i ] != 0 )
        {
            continue;
        }

        var jA = i; // Left pointer for expanding search.
        var jB = i; // Right pointer for expanding search.
        var cnt = 0; // Current block length.

        // Loop to expand outwards from the current zero.
        while ( true )
        {
            // Move left pointer if not an 'X'.
            if ( arr[ jA ] != "X" )
            {
                jA--;
            }

            // Move right pointer if not an 'X'.
            if ( arr[ jB ] != "X" )
            {
                jB++;
            }

            // Break if both pointers hit 'X' (boundary).
            if ( arr[ jA ] == "X" && arr[ jB ] == "X" )
            {
                break;
            }

            // Break if either pointer hits an [ABCD] character (occupied slot).
            if ( /[ABCD]/.test( arr[ jA ] ) || /[ABCD]/.test( arr[ jB ] ) )
            {
                break;
            }

            cnt++; // Increment count for the current block.

            // Update 'max' if current block is larger.
            if ( max[ 1 ] < cnt )
            {
                max = [ i, cnt ];
            }
        } // End of while loop.
    } // End of for loop for finding block.


    // If a suitable block was found (max[1] is not zero).
    if ( max[ 1 ] != 0 )
    {
        arr[ max[ 0 ] ] = "D"; // Place 'D' in the identified position.
        return;
    }

    // If no such block found, fallback to placing 'D' using function AA.
    AA( "D" );
} // End of DD function.


// Main execution block starts here.
// Reads input from standard input.
var input = require( 'fs' ) . readFileSync( '/dev/stdin', 'utf8' ) ;


// Process the input string.
var Arr = input . trim( ) . split( "\n" ) ;


// Loop indefinitely until a termination condition is met.
while ( true )
{
    // Read 'n' and 'm' from the first line of the current input block.
    var nm = Arr . shift( ) . split( " " ) . map( Number ) ;

    var n = nm[ 0 ] ; // Total length of the array.
    var m = nm[ 1 ] ; // Number of operations to perform.

    // Termination condition: if both n and m are 0, exit the loop.
    if ( n == 0 && m == 0 )
    {
        break;
    }

    var arr = [ ] ; // Initialize the main array for this test case.

    // Fill the array with 'n' zeros.
    for ( var i = 0; i < n; i++ )
    {
        arr . push( 0 ) ;
    }

    // Add boundary markers 'X' to both ends of the array.
    arr . unshift( "X" ) ;
    arr . push( "X" ) ;

    // Perform 'm' operations as specified by the input.
    for ( var i = 0; i < m; i++ )
    {
        var v = Arr . shift( ) ; // Get the current operation type.

        // Call the corresponding function based on 'v'.
        if ( v == "A" )
        {
            AA( "A" ) ;
        }
        if ( v == "B" )
        {
            BB( ) ;
        }
        if ( v == "C" )
        {
            CC( ) ;
        }
        if ( v == "D" )
        {
            DD( ) ;
        }
    }

    // Remove the temporary boundary markers before output.
    arr . shift( ) ;
    arr . pop( ) ;

    // Print the final state of the array, replacing '0' with '#' and joining elements.
    console . log( arr . join( "" ) . replace( /0/g, "#" ) ) ;

} // End of while loop.

// End of JavaScript code.
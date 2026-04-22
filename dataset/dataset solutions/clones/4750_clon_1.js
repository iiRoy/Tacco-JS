/*
 * Strict mode declaration for the entire script.
 * This helps catch common coding errors and "unsafe" actions.
 */
"use strict"

// This function is responsible for creating a custom input reader object.
// It reads from standard input, parses it, and provides utility methods.
const create  =  (  )  =>
{
    /*
     * Reads the entire content from /dev/stdin,
     * decodes it as UTF-8, removes leading/trailing whitespace,
     * and then splits it into an array of strings by newline characters.
     */
    const input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

    // Initializes the reader object with the processed input and internal state.
    const res = {
        "list"     : input                                     , // The array containing all input lines.
        "index"    : 0                                         , // Current position in the input list.
        "max"      : input . length                            , // Total number of lines in the input.

        // Method to check if there are more lines to read.
        "hasNext"  : function ( ) { return this . index  <  this . max } ,

        // Method to get the next line from the input.
        // Throws an error if no more lines are available.
        "next"     : function ( )
        {
            if ( ! this . hasNext ( ) )
            {
                throw "ArrayIndexOutOfBoundsException" ; // Custom error for out-of-bounds access.
            }
            else
            {
                return this . list [ this . index ++ ] ; // Returns the current line and then increments the index.
            }
        }
    } ;

    // Returns the fully configured input reader object.
    return res ;
}

// Global instance of the input reader.
const o = create ( ) ;

// Helper function to get the next raw string line from input.
const next = ( ) => o . next ( ) ;

// Helper function to get the next integer from input.
const nextInt = ( ) => parseInt ( o . next ( ) ) ;

// Helper function to get the next line as an array of strings, split by space.
const nextStrArray = ( ) => o . next ( ) . split ( " " ) ;

// Helper function to get the next line as an array of integers, split by space.
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) ) ;

// Helper function to get the next line as an array of characters.
const nextCharArray = ( ) => o . next ( ) . split ( "" ) ;

// Helper function to check if there are more lines in the input.
const hasNext = ( ) => o . hasNext ( ) ;

// Custom output function, simply logs arguments to console.
const myout = ( ... x ) => console . log ( ... x ) ;


/*
 * Main execution logic of the program.
 * This function encapsulates the primary algorithm.
 */
const Main = ( ) =>
{
    // Read the first integer, which typically represents the number of subsequent data entries.
    let n = nextInt ( ) ;

    // Initialize an array 'p' of size 'n' with all elements set to 0.
    // This array is not used in the provided logic, perhaps a leftover or for future use.
    let p = new Array ( n ) . fill ( 0 ) ;

    // Initialize two empty arrays to store pairs of numbers 'a' and 'b'.
    let a = [ ] ;
    let b = [ ] ;

    // Loop through the remaining input lines as long as there are more.
    while ( hasNext ( ) )
    {
        // Read the next line as an array of integers.
        let tmp = nextIntArray ( ) ;

        // Add the first element of the temporary array to 'a'.
        a . push ( tmp [ 0 ] ) ;

        // Add the second element of the temporary array to 'b'.
        b . push ( tmp [ 1 ] ) ;
    }

    // Initialize a counter 'cnt' to 0. This will accumulate the total adjustments needed.
    let cnt = 0 ;

    // Iterate backwards from n-1 down to 0.
    // This suggests processing items in reverse order.
    for ( let i = n - 1 ; i >= 0 ; i -- )
    {
        // Calculate a temporary value by adding the current 'a[i]' to 'cnt'.
        // 'cnt' represents the cumulative adjustment from previous (later-indexed) items.
        let tmp = a [ i ] + cnt ;

        // Check if 'tmp' is perfectly divisible by 'b[i]'.
        if ( tmp % b [ i ] == 0 )
        {
            // If it is, no adjustment is needed for this item, so continue to the next iteration.
            continue ;
        }
        // If 'tmp' is less than 'b[i]', we need to increase 'tmp' to reach 'b[i]'.
        else if ( tmp < b [ i ] )
        {
            // Add the difference (b[i] - tmp) to 'cnt'. This is the adjustment needed.
            cnt += b [ i ] - tmp ;
        }
        // If 'tmp' is greater than 'b[i]' and not perfectly divisible.
        else
        {
            // We need to increase 'tmp' to the next multiple of 'b[i]'.
            // The amount needed is b[i] minus the remainder of tmp / b[i].
            cnt += b [ i ] - ( tmp % b [ i ] ) ;
        }
    }

    // After processing all items, print the final accumulated count.
    console . log ( cnt ) ;
}

// Call the Main function to start the program execution.
Main ( ) ;
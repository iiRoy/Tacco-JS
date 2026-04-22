/* This file enforces strict mode for better error handling. */
"use strict"

// Function to create an input reader object
const create = ( ) =>
{
    /* Read input from standard input synchronously.
     * Trim whitespace and split by newlines. */
    const    input    =    require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) . split ( "\n" ) ;

    // Initialize the reader object with its properties and methods
    const res = {
        "list"   : input , // The array of input lines
        "index"  : 0     , // Current position in the input array
        "max"    : input . length , // Total number of input lines

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        "hasNext" : function ( ) {
            return this . index < this . max
        } ,

        /**
         * Retrieves the next line from input.
         * Increments the internal index after retrieval.
         * @returns {string} The next line.
         * @throws {string} "ArrayIndexOutOfBoundsException" if no more lines are available.
         */
        "next" : function ( )
        {
            if ( ! this . hasNext ( ) )
            {
                throw "ArrayIndexOutOfBoundsException" ;
            }
            else
            {
                return this . list [ this . index ++ ] ;
            }
        }
    } ;

    // Return the configured reader object
    return res ;
}


// Instantiate the global input reader object by calling the create function
const o = create ( ) ;

// Helper function: Gets the next raw line of input.
const next = ( ) => o . next ( )

// Helper function: Parses the next line of input as an integer.
const nextInt = ( ) => parseInt ( o . next ( ) )

// Helper function: Gets the next line and splits it into a string array by space.
const nextStrArray = ( ) => o . next ( ) . split ( " " )

// Helper function: Gets the next line, splits it by space, and maps elements to integers.
const nextIntArray = ( ) => o . next ( ) . split ( " " ) . map ( el => parseInt ( el ) )

// Helper function: Gets the next line and splits it into an array of characters.
const nextCharArray = ( ) => o . next ( ) . split ( "" )

// Helper function: Checks if there is more input available.
const hasNext = ( ) => o . hasNext ( )

// Helper function: A shorthand for console.log, allowing multiple arguments.
const myout = ( ... x ) => console . log ( ... x )

/**
 * Main program logic.
 * Reads problem-specific input, performs calculations, and outputs the result.
 */
const Main = ( ) =>
{
    // Read the initial integer 'n', which often represents the number of subsequent items.
    let n = nextInt ( )

    // Initialize an array 'p' of size 'n' with all elements set to 0.
    let p = new Array ( n ) . fill ( 0 )

    // Initialize two empty arrays, 'a' and 'b', to store pairs of input data.
    let a = [ ]
    let b = [ ]

    // Loop to read remaining input lines until the 'hasNext' condition is false.
    while ( hasNext ( ) )
    {
        // Read a pair of integers from the current line.
        let tmp = nextIntArray ( )
        // Add the first integer of the pair to array 'a'.
        a . push ( tmp [ 0 ] )
        // Add the second integer of the pair to array 'b'.
        b . push ( tmp [ 1 ] )
    }

    // Initialize a counter variable 'cnt' to 0. This will accumulate adjustments.
    let cnt = 0

    // Iterate backwards from 'n-1' down to 0, processing data from the end.
    for ( let i = n - 1 ; i >= 0 ; i -- )
    {
        // Calculate a temporary sum based on 'a[i]' and the current 'cnt'.
        let tmp = a [ i ] + cnt

        // Check if 'tmp' is perfectly divisible by 'b[i]'.
        if ( tmp % b [ i ] == 0 )
        {
            // If perfectly divisible, no adjustment needed for 'cnt' in this iteration.
            continue
        }
        // Check if 'tmp' is less than 'b[i]'.
        else if ( tmp < b [ i ] )
        {
            // If 'tmp' is smaller, 'cnt' needs to be increased to make 'tmp' a multiple of 'b[i]'.
            // Add the difference required to reach 'b[i]' to 'cnt'.
            cnt += b [ i ] - tmp
        }
        // If 'tmp' is greater than or equal to 'b[i]' but not perfectly divisible.
        else
        {
            // 'cnt' needs to be increased to make 'tmp' the next multiple of 'b[i]'.
            // Add the difference between 'b[i]' and the remainder to 'cnt'.
            cnt += b [ i ] - ( tmp % b [ i ] )
        }
        // This line adds p[i] to tmp. Since 'p' is initialized with zeros and never modified,
        // p[i] will always be 0, so this operation effectively does nothing (tmp += 0).
        tmp += p [ i ]
    }

    // Calculate the sum of all elements in array 'p'.
    // As 'p' is initialized with zeros and never modified, 'ans' will always be 0.
    let ans = p . reduce ( ( acc , curr ) => acc + curr )

    // Output the final calculated answer to the console.
    console . log ( ans )
}

// Call the Main function to start the program execution.
Main ( )
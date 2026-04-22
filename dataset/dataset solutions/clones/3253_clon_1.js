"use strict" ; /* Enable strict mode for cleaner code execution */

/*
 * This is the main function that processes the input.
 * It takes the raw standard input as a string.
 */
function Main ( stdin )
{
    // Prepare the input: trim whitespace, split into lines, and reverse
    // so that `pop()` retrieves lines in their original order.
    stdin = stdin . trim ( ) . split ( "\n" ) . reverse ( ) ;


    // Initialize an array to store output lines.
    let stdout = [ ] ;


    /*
     * Helper function to retrieve the next line from stdin.
     * It uses Array.prototype.pop() on the reversed stdin array.
     */
    function input ( )
    {
        return stdin . pop ( ) ;
    }


    /*
     * Helper function to read a line, split it by spaces,
     * and parse each part as an integer.
     */
    function maput ( )
    {
        return input ( ) . split ( " " ) . map ( n => parseInt ( n ) ) ;
    }


    /*
     * Helper function to add a value to the output array.
     * This prepares the value for eventual printing.
     */
    function print ( x )
    {
        stdout . push ( x ) ;
    }


    /*
     * Checks if an element 'x' exists within an array 'xs'.
     * Uses a Set for efficient lookup.
     */
    function exist ( x , xs )
    {
        return new Set ( xs ) . has ( x ) ;
    }


    /*
     * Finds the maximum value in an array.
     * Uses Array.prototype.reduce() with Math.max.
     */
    function max ( x )
    {
        return x . reduce ( function ( a , b )
        {
            return Math . max ( a , b ) ;
        } ) ;
    }


    /*
     * Finds the minimum value in an array.
     * Uses Array.prototype.reduce() with Math.min.
     */
    function min ( x )
    {
        return x . reduce ( function ( a , b )
        {
            return Math . min ( a , b ) ;
        } ) ;
    }


    /*
     * Calculates the sum of all elements in an array.
     * Uses Array.prototype.reduce() for summation.
     */
    function sum ( x )
    {
        return x . reduce ( function ( a , b )
        {
            return a + b ;
        } ) ;
    }


    /*
     * Sorts an array of objects based on a specific index/property.
     * Assumes numeric comparison.
     */
    function sorting ( x , index )
    {
        x . sort ( ( a , b ) => a [ index ] - b [ index ] ) ;
    }


    /*
     * Checks if all elements in a boolean array are true.
     * Uses Array.prototype.reduce() with logical AND.
     */
    function all ( x )
    {
        return x . reduce ( function ( a , b )
        {
            return a && b ;
        } ) ;
    }


    /*
     * Checks if any element in a boolean array is true.
     * Uses Array.prototype.reduce() with logical OR.
     */
    function any ( x )
    {
        return x . reduce ( function ( a , b )
        {
            return a || b ;
        } ) ;
    }


    /*
     * Converts an iterable to an Array.
     */
    function list ( iterable )
    {
        return Array . from ( iterable ) ;
    }


    /*
     * Converts an iterable of strings to an Array of integers.
     */
    function vint ( iterable )
    {
        return Array . from ( iterable , x => parseInt ( x ) ) ;
    }


    /*
     * Creates an array of a specified length, filled with a given value.
     */
    function tile ( val , len )
    {
        return Array ( len ) . fill ( val ) ;
    }


    // Defines a utility function to generate a numeric range array.
    const range = ( start , stop , step ) => Array . from (
        {
            length : ( stop - start ) / step
        } ,
        ( _ , i ) => start + ( i * step )
    ) ;

    /* -- APPLICATION LOGIC STARTS HERE -- */

    // Read the first line of input and parse it as an integer.
    let n = parseInt ( input ( ) ) ;

    // Check for base cases for the Collatz conjecture problem.
    if ( n == 1 || n == 2 )
    {
        // If n is 1 or 2, the sequence length is 4.
        // For n=1: 1 -> 4 -> 2 -> 1 (length 4)
        // For n=2: 2 -> 1 -> 4 -> 2 (length 4)
        print ( 4 ) ;
    }
    else
    {
        // Initialize the answer (sequence length) to 2,
        // because the first two steps (n -> next_n -> next_next_n) are already implied.
        let ans = 2 ;

        // Continue the Collatz sequence until 'n' becomes 1.
        while ( n != 1 )
        {
            // Check if 'n' is odd.
            if ( n % 2 == 1 )
            {
                // If odd, apply the rule: 3n + 1.
                n = 3 * n + 1 ;
            }
            else
            {
                // If even, apply the rule: n / 2.
                n /= 2 ;
            }

            // Increment the sequence length counter for each step.
            ans ++ ;
        }

        // Print the final calculated sequence length.
        print ( ans ) ;
    }

    /* -- APPLICATION LOGIC ENDS HERE -- */

    // Join all collected output lines with a newline character.
    stdout = stdout . join ( "\n" ) ;

    // Print the final output to the console.
    console . log ( stdout ) ;

    // Return the generated output string.
    return stdout ;
}

// Execute the main function, reading input from /dev/stdin.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
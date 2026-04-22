// This JavaScript file processes input to find the Greatest Common Divisor (GCD)
// of absolute differences between given numbers and a reference value.

// Enforces strict parsing and error handling rules.
'use strict' ;


/**
 * The primary function responsible for executing the program's logic.
 * It takes a string 'input' which contains all the necessary data.
 * @param {string} input - The raw input string from stdin.
 */
function Main ( input )
{
    // First, we parse the number of elements (N) from the first line of the input.
    // The input is split by newline, then the first line is split by space,
    // and the very first part is taken and converted to a number.
    const N = Number ( input . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 0 ] ) ;

    // Next, we parse the reference value (X) from the first line of the input.
    // This is the second part of the first line, after splitting by space.
    const X = Number ( input . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 1 ] ) ;


    // Initialize an empty array (list) to store the absolute differences.
    let list = [ ] ;


    // This loop iterates N times, processing each number provided on the second line of input.
    for ( let i = 0 ; i < N ; i ++ )
    {
        // For each iteration, we calculate the absolute difference between
        // the current number from the input and the reference value X.
        // The numbers are on the second line (index 1 after newline split).
        list . push ( Math . abs ( Number ( input . split ( '\n' ) [ 1 ] . split ( ' ' ) [ i ] ) - X ) ) ;
    }


    /*
     * This function calculates the Greatest Common Divisor (GCD) of two numbers
     * using the Euclidean algorithm. It is a standard mathematical operation.
     *
     * @param {number} m - The first integer.
     * @param {number} n - The second integer.
     * @returns {number} The greatest common divisor of m and n.
     */
    function gcd ( m , n )
    {
        var r ; // A temporary variable to hold the remainder during calculations.

        // Ensure that 'm' is always the larger number for consistent algorithm execution.
        // If 'm' is smaller than 'n', swap them.
        if ( m < n )
        {
            r = m ;
            m = n ;
            n = r ;
        }

        // The core of the Euclidean algorithm:
        // Repeatedly calculate the remainder until it becomes zero.
        // The GCD is the last non-zero remainder.
        while ( ( r = m % n ) != 0 )
        {
            m = n ; // The previous 'n' becomes the new 'm'.
            n = r ; // The remainder 'r' becomes the new 'n'.
        }

        // When the loop terminates, 'n' holds the GCD.
        return n ;
    }


    // After populating the list with absolute differences, we determine the final output.
    // If there's only one element in the list, that element is the answer.
    if ( list . length === 1 )
    {
        console . log ( list [ 0 ] ) ; // Output the single element.
    }
    else
    {
        // If there are multiple elements, we need to find the GCD of all of them.
        // Start by calculating the GCD of the first two elements.
        let gcdans = gcd ( list [ 0 ] , list [ 1 ] ) ;

        // Then, iteratively calculate the GCD of the current 'gcdans'
        // with each subsequent element in the list.
        for ( let k = 1 ; k < N ; k ++ )
        {
            gcdans = gcd ( gcdans , list [ k ] ) ;
        }

        // Finally, print the computed greatest common divisor.
        console . log ( gcdans ) ;
    }


} ; // End of the Main function.


// This line reads the input from standard input, converts it to a string using UTF-8 encoding,
// removes any leading/trailing whitespace, and then passes it to the Main function for processing.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . trim ( ) ) ;
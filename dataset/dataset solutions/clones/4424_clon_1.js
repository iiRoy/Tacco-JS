/*
 * This file contains the main logic for processing numerical inputs.
 * It calculates the least common multiple (LCM) of a series of numbers
 * after an initial clock number.
 * @param {string} inputData - The raw input string, expected to be newline-separated numbers.
 */
function  Main ( inputData )
{
    // First, parse the input string into an array of numbers.
    // It splits by newline, filters out any empty strings, and then converts to numbers.
    var  inputs  =  inputData . split ( "\n" ) . filter ( function ( num ) { return  num ; } ) . map ( function ( num ) { return  +num ; } ) ;

    // The first number in the input array is treated as a special 'clockNum'.
    var  clockNum  =  inputs . shift ( ) ;

    // Sort the remaining numbers in descending order.
    var  T  =  inputs . sort ( function ( a , b ) { return  Number ( b ) - Number ( a ) ; } ) ;

    // Special case: if clockNum is 1, return the largest number directly.
    if  ( clockNum  ===  1 )
    {
        return  T [ 0 ] ;
    }

    // Otherwise, calculate the Least Common Multiple (LCM) of all remaining numbers.
    // The LCM of two numbers (a, b) can be calculated as (a * b) / GCD(a, b).
    return  T . reduce ( function ( previousValue , currentValue )
    {
        // Calculate the Greatest Common Divisor (GCD) for the current pair.
        var  gcdPrevCurr  =  gcd ( previousValue , currentValue ) ;
        // Return the LCM of the previous accumulated value and the current value.
        return  ( previousValue  *  currentValue )  /  gcdPrevCurr ;
    } ) ;


    /**
     * Helper function to compute the Greatest Common Divisor (GCD) of two numbers
     * using the Euclidean algorithm.
     * @param {number} x - The first number.
     * @param {number} y - The second number.
     * @returns {number} The greatest common divisor of x and y.
     */
    function  gcd ( x , y )
    {
        // Base case: if y is 0, then x is the GCD.
        if  ( y  ===  0 )
        {
            return  x ;
        }
        // Recursive step: GCD(x, y) is the same as GCD(y, x % y).
        else
        {
            return  gcd ( y ,  x  %  y ) ;
        }
    }
    ; // Semicolon for function declaration, though often omitted.
}

// Read input from standard input and pass it to the Main function.
// Then, print the result to the console.
console . log ( Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;
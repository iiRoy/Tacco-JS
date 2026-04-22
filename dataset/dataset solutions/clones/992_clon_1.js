/* This is a self-executing anonymous function that processes input.
 * It reads two numbers from standard input, calculates their greatest common divisor,
 * and then prints the result to the console.
 */
( function ( input )
{
    // Variable 'p' will hold the parsed numbers.
    var  p  =  input . split(' ') . map(Number) ;

    /* Extract the first number. */
    var x = p . shift ( ) ;

    // Extract the second number.
    var y = p . shift ( ) ;


    // Log the result of the greatest common divisor calculation.
    console . log( greatestCommonDevisor( x , y ) ) ;

} ) ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ; /* End of IIFE execution. */




function greatestCommonDevisor ( x , y )
{
    // This function determines the greatest common divisor (GCD) of two numbers.
    // It achieves this by first finding all common divisors and then returning the maximum among them.
    return Math . max . apply ( null , commonDevisor ( x , y ) ) ;
}


/*
 * This function, commonDevisor, calculates and returns an array of all common divisors
 * for two given integers, x and y.
 */
function commonDevisor ( x , y )
{
    // Initial check and modification of x and y based on their relative values.
    // The goal here is to simplify the subsequent loop iteration.
    if ( x  >  y )
    {
        x = x  %  y ; // If x is greater, update x using modulo.
    }
    else if ( x  <  y )
    {
        /* Temporary variable for swapping logic. */
        var tmp = y ;
        y = x ;
        x = tmp  %  x ; // If y is greater, update x using modulo after a swap.
    }

    // Initialize an empty array to store the common divisors found.
    var a = [ ] ;

    // Loop through numbers from 1 up to the current value of x.
    for ( var i = 1 ; i <= x ; i ++ )
    {
        // Check if 'i' divides both x and y without any remainder.
        if ( ( x  %  i  ===  0 )  &&  ( y  %  i  ===  0 ) )
        {
            a . push ( i ) ; // If it's a common divisor, add it to the array.
        }
    }
    // Finally, return the array containing all common divisors.
    return a ;
}
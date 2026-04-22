/*
 * This script is designed to process standard input (stdin).
 * It expects lines of text containing two space-separated numerical values.
 * For each line of input, it performs three distinct calculations:
 * 1. Integer division of the first number by the second.
 * 2. The remainder of the division of the first number by the second.
 * 3. Floating-point division of the first number by the second,
 *    formatted to exactly 8 decimal places.
 * The results of these three calculations are then printed to the console,
 * separated by spaces.
 */
process . stdin . on (
    "data" ,
    function ( c )
    {
        // Convert the input buffer 'c' to a string,
        // then remove leading/trailing whitespace,
        // and finally split the string into an array
        // using a single space as the delimiter.
        var s = ( c + "" ) . trim ( ) . split ( " " ) ;

        // Extract the first element from the array 's' and
        // convert it to a number. The unary plus operator `+`
        // is used for this type conversion.
        var a = + s [ 0 ] ;

        // Extract the second element from the array 's' and
        // convert it to a number, similar to the first element.
        var b = + s [ 1 ] ;

        // Output the results of the calculations to the console.
        // The `a / b | 0` expression performs integer division by
        // bitwise ORing with 0, effectively truncating the decimal part.
        // `a % b` computes the remainder of the division.
        // `( a / b ) . toFixed ( 8 )` calculates the floating-point
        // division and formats it to 8 decimal places as a string.
        // The outer unary plus `+` converts this string back into a number.
        console . log ( a / b | 0 , a % b , + ( a / b ) . toFixed ( 8 ) ) ;

    }
) . resume ( ) ; // Ensure the stdin stream remains active to listen for more data.
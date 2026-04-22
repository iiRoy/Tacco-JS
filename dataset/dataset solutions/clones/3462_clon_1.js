/* This is a JavaScript program designed to process numerical input.
 * It reads data from standard input, performs sorting, and calculates
 * a specific result based on the sorted numbers and the initial value.
 *
 * This file demonstrates a Type I code clone, preserving all
 * logical structures, identifiers, and expressions, while
 * extensively altering whitespace and comments for visual distinction.
 */

// Output the result of the 'main' function to the console.
// The 'main' function receives its input by reading the entire
// content of standard input synchronously as a UTF-8 string.
console . log ( main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ) ;



/**
 * The primary function that processes the input string and
 * computes the final numerical answer.
 *
 * @param {string} s - The input string, expected to contain
 *                     newline-separated numbers.
 * @returns {number} The calculated result based on the input.
 */
function   main ( s )
{

    // Split the input string by newlines and convert each part to a number.
    // The unary plus operator `+a` efficiently converts string 'a' to a number.
    s   =   s . split ( "\n" ) . map ( a => + a ) ;


    // The first element of the array 's' is considered the count 'n'.
    var   n   =   s [ 0 ] ;

    // Replace the first element (which was 'n') with the element at index 'n'.
    // This effectively shifts the actual data up, discarding the original 'n'.
    s [ 0 ]   =   s [ n ] ;

    // Remove the last element from the array.
    // After the previous step, s[n] would be the original last element if n was the length,
    // or it would be an element that gets removed. This seems to adjust the array.
    s . pop ( ) ;


    // Sort the array 's' in ascending numerical order.
    // The comparison function (a, b) => a - b ensures numerical sort.
    s . sort ( ( a , b )   =>   a - b ) ;


    // Initialize the accumulator for the final answer.
    var   ans   =   0 ;

    // Calculate 'm', which is effectively 'n / 2' rounded up.
    // The '>> 1' is a bitwise right shift, equivalent to Math.floor( (n + 1) / 2 ).
    var   m   =   n   +   1   >>   1 ;


    // First loop: Iterate from the beginning up to 'm' (exclusive).
    // Subtract twice the value of each element from 'ans'.
    for   ( var   i   =   0 ;   i   <   m ;   i ++ )
    {
        // Subtract (current element * 2) from the running total.
        ans   -=   s [ i ]   *   2 ;
    }


    // Second loop: Continue iteration from 'm' up to 'n' (exclusive).
    // Add twice the value of each element to 'ans'.
    for   ( ;   i   <   n ;   i ++ )
    {
        // Add (current element * 2) to the running total.
        ans   +=   s [ i ]   *   2 ;
    }


    // Conditional logic based on 'n' and array elements.

    // If 'n' is an even number, apply a specific adjustment to 'ans'.
    if   ( n   %   2   ===   0 )
        return   ans   -   s [ m ]   +   s [ m - 1 ] ;


    // If 'n' is odd, proceed with another conditional check.
    // Compare (s[m-1] + s[m-2]) with (s[m-1]*3 - s[m]).
    if   ( s [ m - 1 ]   +   s [ m - 2 ]   >   s [ m - 1 ]   *   3   -   s [ m ] )
        // If the condition is true, return 'ans' adjusted by s[m-1] and s[m-2].
        return   ans   +   s [ m - 1 ]   +   s [ m - 2 ] ;

    else
        // Otherwise (if the condition is false), return 'ans' adjusted by s[m-1]*3 and s[m].
        return   ans   +   s [ m - 1 ]   *   3   -   s [ m ] ;

}
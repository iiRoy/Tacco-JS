/*
 * This JavaScript module defines the primary function, 'Main',
 * designed to process textual input, typically from standard input.
 * Its purpose is to analyze character occurrences within a string
 * based on varying split points and determine a specific metric.
 *
 * Developed by: Code Cloning System
 * Date of generation: 2023-10-27
 */

function   Main  ( s )
{
    // The raw input string 's' is first processed to remove any
    // leading or trailing whitespace characters.
    input  =  s . trim ( ) ;


    // The cleaned input string is then split into an array of lines.
    // It is assumed that the input will consist of multiple lines,
    // with each line representing a distinct piece of data.
    var   s   =   input . split ( "\n" ) ;

    // The first element of the split input array is interpreted as a number.
    // This 'num' variable likely dictates iteration counts or string lengths.
    var   num   =   s [ 0 ] ;

    // The second element of the split input array is taken as the main
    // string ('mystr') upon which the core logic of the program will operate.
    var   mystr   =   s [ 1 ] ;

    // An empty array, 'rslt', is initialized. This array will serve as a
    // container to store the calculated results from each iteration of the loop.
    var   rslt   =   [ ] ;

    // A 'for' loop is initiated, iterating from 'i' equal to 1 up to,
    // but not including, the value of 'num'. This loop explores different
    // partitioning points within 'mystr'.
    for ( var   i   =   1 ;   i   <   num ;   i ++ )
    {
        // In each iteration, 'mystr' is divided into two segments.
        // 'a' represents the substring from the beginning up to the current index 'i'.
        // This substring is then converted into an array of individual characters.
        var   a   =   mystr . substr ( 0 ,   i ) . split ( '' ) ;

        // A new array, 'a_rmv_dup', is created by filtering 'a'.
        // This filter operation ensures that 'a_rmv_dup' contains only
        // the unique characters present in segment 'a', with no duplicates.
        var   a_rmv_dup   =   a . filter ( ( x ,   i ,   self )   =>   self . indexOf ( x )   ===   i ) ;

        // 'b' represents the second segment of 'mystr', starting from index 'i'
        // and extending for 'num - 1' characters. This is also converted to a character array.
        // (Note: The `num - 1` length might imply `num` is related to `mystr.length`).
        var   b   =   mystr . substr ( i ,   num - 1 ) . split ( '' ) ;

        // Similarly, 'b_rmv_dup' is derived from 'b', containing only
        // the unique characters found in the 'b' segment.
        var   b_rmv_dup   =   b . filter ( ( x ,   i ,   self )   =>   self . indexOf ( x )   ===   i ) ;

        // The unique character arrays 'a_rmv_dup' and 'b_rmv_dup' are concatenated
        // to form a single combined array, 'ab'.
        var   ab   =   a_rmv_dup . concat ( b_rmv_dup ) ;

        // A final filtering step is applied to 'ab' to identify characters
        // that appear more than once within this combined array.
        // This effectively finds characters that are common to both original unique sets
        // or characters that became duplicates after concatenation.
        var   d   =   ab . filter (
            function   ( x ,   i ,   self )
            {
                return   self . indexOf ( x )   ===   i   &&   i   !==   self . lastIndexOf ( x ) ;
            }
        ) ;

        // The length of array 'd' (representing the count of specific duplicate characters)
        // is pushed into the 'rslt' array for the current iteration.
        rslt . push ( d . length ) ;
    }

    // Once the loop completes, the maximum value found within the 'rslt' array
    // is calculated using Math.max.apply and then printed to the console.
    console . log ( Math . max . apply ( null ,   rslt ) ) ;
}

// The 'Main' function is invoked, with its argument being the content
// of the '/dev/stdin' file, read synchronously as a UTF-8 encoded string.
// This is a common setup for competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
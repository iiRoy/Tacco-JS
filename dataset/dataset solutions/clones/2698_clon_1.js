/* This file contains a JavaScript program designed to evaluate a specific property of an array.
 * It processes input from standard input, performs operations on an array,
 * and outputs 'YES' or 'NO' based on the analysis.
 * The program effectively checks if an array is "almost sorted" with a limited number of discrepancies.
 */

'use strict' ; //  Enforce strict parsing and error handling rules for the entire script.


function main ( input ) { //  The primary function responsible for handling input and initiating processing.

    //  Split the entire input string into an array of individual lines, using the newline character as a delimiter.
    const lines = input . split ( '\n' ) ;

    //  Remove the last element from the 'lines' array. This is often done to handle
    //  an extra newline character at the end of the input file, which would result in an empty string as the last line.
    lines . pop ( ) ;

    //  Parse the first line of the input (lines[0]) as an integer. This value typically represents
    //  the number of elements in the array to be processed, though its direct use might vary.
    const numberOfElements = parseInt ( lines [ 0 ] , 10 ) ;

    //  Process the second line of the input (lines[1]):
    //  1. Split it by spaces to get string representations of numbers.
    //  2. Use the 'map' method to convert each of these string representations into an actual integer.
    const array = lines [ 1 ] . split ( ' ' ) . map ( x => {
        //  The callback function for 'map' converts a string 'x' to an integer with base 10.
        return parseInt ( x , 10 ) ;
    } ) ;

    //  Call the 'fn' function with the newly created integer array and print its returned value to the console.
    console . log ( fn ( array ) ) ;

} //  End of the main function definition.


function fn ( raw ) { //  This function contains the core logic to determine the "sortability" property of the array.

    //  Create a shallow copy of the input array 'raw'. This ensures that the original order
    //  of elements is preserved in 'keep' before 'raw' potentially gets modified.
    const keep = raw . slice ( ) ;

    //  Sort the 'raw' array in ascending order. Note that the Array.prototype.sort() method
    //  sorts the array in place, modifying the 'raw' array itself.
    const sorted = raw . sort ( ) ;

    //  Log the 'keep' array to the console. This shows the initial state of the array before sorting.
    console . log ( keep ) ;

    //  Log the 'sorted' array to the console. This shows the array after it has been sorted.
    console . log ( sorted ) ;

    //  Initialize an index variable 'x' to 0. This will be used to iterate through the arrays.
    let x = 0 ;

    //  Initialize a counter variable 'c' to 0. This will count the number of discrepancies
    //  between the 'keep' (original order) and 'sorted' arrays.
    let c = 0 ;

    //  Begin a 'while' loop that continues as long as two conditions are met:
    //  1. The index 'x' is less than the length of the 'keep' array (ensuring we stay within bounds).
    //  2. The discrepancy counter 'c' is less than or equal to 3 (a threshold for "almost sorted").
    while ( x < keep . length && c <= 3 ) {

        //  Check if the element at the current index 'x' in 'keep' is not equal
        //  to the element at the same index in 'sorted'.
        if ( keep [ x ] !== sorted [ x ] ) {
            //  If the elements are different, increment the discrepancy counter 'c'.
            c ++ ;
        }
        //  Move to the next element in the arrays by incrementing the index 'x'.
        x ++ ;
    }

    //  After the loop finishes, evaluate the final count of discrepancies.
    if ( c < 3 ) {
        //  If the total number of discrepancies is less than 3, return the string 'YES'.
        //  This implies the array is "almost sorted" with at most two elements out of place.
        return 'YES' ;
    }

    //  If the number of discrepancies is 3 or more, return the string 'NO'.
    //  This indicates the array requires more than two changes to be fully sorted.
    return 'NO' ;

} //  End of the fn function definition.


//  This is the entry point for execution when the script is run.
//  It reads the entire content of '/dev/stdin' as a UTF-8 encoded string,
//  and then passes this string as an argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;
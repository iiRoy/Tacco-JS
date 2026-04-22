/*
 * This JavaScript file contains a single function, Main,
 * designed to process input data for a specific calculation.
 *
 * This version includes extensive whitespace variations and comments
 * while maintaining exact structural and logical equivalence to the original.
 */

function Main (  input  )
{
    // The primary function for processing the given input string.
    // The input string is typically read from standard input.

    /*
     * The initial input is a single string that may contain multiple lines.
     * We split this string by newline characters to obtain an array
     * where each element corresponds to a line of the original input.
     * For instance, input[0] will be the first line, input[1] the second, etc.
     */
    input  =  input.split( "\n" ) ;


    // The first line of the input array (input[0]) is expected to contain
    // several space-separated values. These values are parsed into temporary
    // string variables before conversion to integers.
    var  tmp  =  input[ 0 ].split( ' ' ) ;


    // Extracting and parsing the time components and a duration 'k'.
    // h1 and m1 represent the hours and minutes of the first time point.
    var  h1  =  parseInt( tmp[ 0 ] ) ;
    var  m1  =  parseInt( tmp[ 1 ] ) ;

    // h2 and m2 represent the hours and minutes of the second time point.
    var  h2  =  parseInt( tmp[ 2 ] ) ;
    var  m2  =  parseInt( tmp[ 3 ] ) ;

    // k represents a duration in minutes that needs to be subtracted.
    var  k   =  parseInt( tmp[ 4 ] ) ;


    // Convert the first time point (h1:m1) into a total number of minutes
    // elapsed since midnight.
    var  min1  =  60  *  h1  +  m1 ;

    // Convert the second time point (h2:m2) into a total number of minutes
    // elapsed since midnight.
    var  min2  =  60  *  h2  +  m2 ;


    // Calculate the total duration between min1 and min2,
    // then subtract the given duration 'k'.
    // This value 'a' represents the final calculated result.
    var  a  =  min2  -  min1  -  k ;


    // Output the final computed value 'a' to the console.
    console.log(  a  ) ;

} // End of the Main function definition.



// *****************************************************************************
// * DO NOT MODIFY THE FOLLOWING CODE BLOCK.                                   *
// * This section is responsible for reading input from standard input        *
// * and invoking the 'Main' function with the collected data.               *
// * It ensures that the program can run in a typical competitive programming *
// * environment by handling I/O operations transparently.                   *
// *****************************************************************************
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;
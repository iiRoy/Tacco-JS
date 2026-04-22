/*
 * This JavaScript code processes input data.
 * It reads three integers from the first line of input
 * and determines if the sum of the first two is less than the third.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

 function Main ( input )
 {

    // The 'input' parameter initially contains the entire input data as a single string.
    // We need to split it into individual lines for easier processing.
    input = input . split ( "\n" ) ;


    // The first line of input (input[0]) contains space-separated values.
    // We split this line by spaces to get an array of string tokens.
    let tmp = input [ 0 ] . split ( " " ) ;


    // Convert the string tokens into integer numbers.
    // parseInt() is used here to ensure conversion to a base-10 integer.
    var a = parseInt ( tmp [ 0 ] , 10 ) ;
    var b = parseInt ( tmp [ 1 ] , 10 ) ;
    var c = parseInt ( tmp [ 2 ] , 10 ) ;


    // Initialize the answer variable with the default affirmative response.
    var answer = "Yes" ;

    // Check the condition: if the sum of 'a' and 'b' is strictly less than 'c'.
    if ( a + b < c )
    {
        // If the condition is met, update the answer to indicate a negative response.
        answer = "No" ;
    }


    // Output the final determined answer to the console.
    console . log ( answer ) ;

 } // End of Main function


 /*
  * IMPORTANT: Do not modify the following line.
  * It handles reading from standard input and calling the Main function.
  */
 Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
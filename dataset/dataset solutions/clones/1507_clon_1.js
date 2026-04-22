/*
 * This file contains the Main function which processes input
 * to determine if a specific condition is met based on consecutive
 * identical pairs of numbers.
 *
 * Author: AI Code Clone Generator
 * Date: 2023-10-27
 */

// Define the main function that takes input as a string.
function Main ( input ) {

    // Split the input string by newline characters to get an array of lines.
    const splited = input . split ( "\n" ) ;

    // Parse the first element of the splited array as an integer (base 10)
    // to determine the number of subsequent data entries.
    const a = parseInt ( splited [ 0 ] , 10 ) ;

    // Initialize the result string. Default to "No".
    let res = "No" ;

    // Initialize a counter for consecutive identical pairs.
    let count = 0 ;

    // Loop through the input lines, starting from the second line (index 1)
    // up to the number specified by 'a'.
    for ( let i = 1 ; i <= a ; i ++ ) {

        // Split the current line by space to get two string parts.
        const t = splited [ i ] . split ( " " ) ;

        // Check if the integer values of the two parts are strictly equal.
        if ( parseInt ( t [ 0 ] , 10 ) === parseInt ( t [ 1 ] , 10 ) ) {

            // If they are equal, increment the consecutive count.
            count ++ ;

            // If the count of consecutive identical pairs reaches 3 or more,
            // set the result to "Yes" and exit the loop.
            if ( count >= 3 ) {
                res = "Yes" ;
                break ; // Exit the for loop immediately.
            }

            // Continue to the next iteration of the loop if condition met,
            // as we don't want to reset count if we found a match.
            continue ;
        }

        // If the current pair is not identical, reset the consecutive count.
        count = 0 ;
    }

    // Output the final computed result to the console.
    console . log ( res ) ;
}

// --- DO NOT EDIT BELOW THIS LINE ---
// This section handles reading standard input and invoking the Main function.
// It ensures compatibility with typical competitive programming environments.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * This JavaScript file contains a function designed to evaluate specific numerical conditions.
 * It processes a string of space-separated numbers, converting them into an array.
 * The primary goal is to determine if certain absolute difference thresholds are exceeded.
 *
 * Author: An Expert Code Cloner
 * Date: 2023-10-27
 * Version: 1.0 - Type I Clone
 */


    function   Main   (   s   )
    {

        // The input string 's' is expected to contain space-separated numeric values.
        // This line converts the string into an array of actual numbers.
        // 'split(" ")' divides the string by spaces, and 'map(a => +a)' converts each part to a number.
        s   =   s . split   (   " "   ) . map   (   a   =>   + a   ) ;

        // Initialize the 'ans' variable with the default affirmative response.
        // This value will only change if the subsequent conditional logic determines otherwise.
        var   ans   =   "Yes" ;


        // Begin evaluating the primary conditional logic.
        // This outer 'if' checks the absolute difference between the first (s[0]) and third (s[2]) elements
        // against the fourth element (s[3]).
        if   (   Math . abs   (   s [ 0 ]   -   s [ 2 ]   )   >   s [ 3 ]   )
            // If the first condition is met, proceed to evaluate a nested condition.
            // This inner 'if' checks two sub-conditions:
            // 1. Absolute difference between s[0] and s[1] is greater than s[3].
            // 2. Absolute difference between s[2] and s[1] is greater than s[3].
            // If either of these sub-conditions is true, AND the outer condition was true,
            // then the block associated with this inner 'if' will execute.
            if   (   Math . abs   (   s [ 0 ]   -   s [ 1 ]   )   >   s [ 3 ]   ||   Math . abs   (   s [ 2 ]   -   s [ 1 ]   )   >   s [ 3 ]   )
            {
                // When both the outer and inner 'if' conditions evaluate to true,
                // the 'ans' variable is updated to reflect a negative outcome.
                ans   =   "No" ;
            }


        // Finally, the determined answer is printed to the standard output console.
        console . log   (   ans   ) ;

    }


// This segment is responsible for the execution environment setup.
// It reads the entire content of the standard input stream (e.g., from a pipe or file redirection)
// using Node.js's 'fs' module, converts it to a UTF-8 string, and then passes it
// as an argument to the 'Main' function for processing.
Main   (   require   (   "fs"   ) . readFileSync   (   "/dev/stdin"   ,   "utf8"   )   ) ;
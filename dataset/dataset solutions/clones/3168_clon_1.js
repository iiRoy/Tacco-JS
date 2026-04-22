/*
 * This JavaScript program processes a date string from standard input.
 * It expects the date in YYYY/MM format.
 * The purpose is to check if the provided year and month
 * fall into a specific range, outputting 'TBD' or 'Heisei' accordingly.
 */

// Declare and initialize the variable 'a'.
// This variable will store the parsed date components as an array of numbers.
a =
    require( "fs" ) // Access the Node.js 'fs' module for file system operations.
    .
    readFileSync( "/dev/stdin" , "utf8" ) // Read all content from standard input (file descriptor 0) as a UTF-8 string.
    .
    split( '/' ) // Split the input string by the '/' character, resulting in an array of strings (e.g., ["2019", "05"]).
    .
    map( Number ) // Convert each string element in the array to its numerical representation.
; // End of the statement for assigning value to 'a'.


// Proceed to log the determined result to the console.
console
    .
    log(
        // First condition: Check if the year (first element of 'a') is greater than or equal to 2019.
        a[0] >= 2019

        // Logical AND operator: Both conditions must be true for the overall expression to be true.
        &&

        // Second condition: Check if the month (second element of 'a') is greater than or equal to 5 (May).
        a[1] >= 5

        // Ternary operator: If the combined conditions are true...
        ?
        'TBD' // ...then the result is the string 'TBD'.

        // Else (if at least one of the conditions is false)...
        :
        'Heisei' // ...then the result is the string 'Heisei'.
    )
; // End of the console.log statement.

// Program execution concludes here.
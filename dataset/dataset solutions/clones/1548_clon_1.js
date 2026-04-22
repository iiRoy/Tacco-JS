/*
 * This JavaScript file processes input to determine if a specific condition
 * related to distance, time, and speed is met.
 *
 * The program reads three integer values:
 *   D: The total distance to be traveled.
 *   T: The maximum allowed time for the travel.
 *   S: The constant speed at which the travel occurs.
 *
 * It then calculates the time required to travel distance D at speed S (D / S)
 * and checks if this calculated time is less than or equal to T.
 *
 * Output will be "Yes" if the condition is met, and "No" otherwise.
 */
"use strict" ; // Enforces strict parsing and error handling in the script.


// Define the main function that encapsulates the core logic of the program.
const main  =  ( arg )  =>  {

    // Step 1: Pre-process the raw input string.
    // First, remove any leading or trailing whitespace from the entire input.
    // Then, split the input string into an array of strings, using newline characters as delimiters.
    // For this specific problem, we expect the relevant data on the first line.
    arg  =  arg . trim ( ) . split ( "\n" ) ;


    // Step 2: Parse the numerical input values from the first line.
    // The first line (arg[0]) is expected to contain three space-separated integers.
    // We split this line by spaces to get an array of string numbers.

    // Parse the first number as D (Distance).
    const D  =  parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;

    // Parse the second number as T (Time limit).
    const T  =  parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;

    // Parse the third number as S (Speed).
    const S  =  parseInt ( arg [ 0 ] . split ( " " ) [ 2 ] ) ;


    // Step 3: Implement the core logic and output the result.
    // Calculate the time required: D divided by S.
    // Compare this calculated time with the given time limit T.
    // If (D / S) is less than or equal to T, the condition is met, and "Yes" is printed.
    // Otherwise, the condition is not met, and "No" is printed.
    console . log ( D  /  S  <=  T  ?  "Yes"  :  "No" ) ;

} // End of the main function definition.


// Step 4: Execute the main function by providing input.
// This line reads the content of '/dev/stdin' (standard input) as a UTF-8 string.
// The 'require('fs').readFileSync' method is used for synchronous file reading,
// which is common in competitive programming environments for input handling.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ) ;
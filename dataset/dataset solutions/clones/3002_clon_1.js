/*
 *  This file contains the main logic for processing input
 *  and calculating a specific value based on the provided parameters.
 *  It adheres to strict mode for better code quality and error prevention.
 */
'use strict'; // Enforces stricter parsing and error handling in the code.


// The primary function responsible for handling the application's core logic.
// It takes the raw input string, processes it, performs calculations, and outputs the result.
function Main( input )
{
    // Step 1: Process the input string.
    // - Trim any leading/trailing whitespace.
    // - Split the string into an array of substrings using space as a delimiter.
    // - Map each substring to an integer using parseInt.
    let temp = input.trim().split( ' ' ).map( ( v ) => parseInt( v ) );

    // Step 2: Extract individual values from the processed array.
    // 'a' represents the first value, used in the denominator of the calculation.
    let a = temp.shift();
    // 'b' represents the second value, used as a multiplier at the end.
    let b = temp.shift();
    // 't' represents the third value, crucial for the main calculation.
    let t = temp.shift();


    // Step 3: Perform the core calculation.
    // The formula involves adding 0.5 to 't', dividing by 'a', taking the floor, and then multiplying by 'b'.
    let ans = Math.floor( ( t + 0.5 ) / a ) * b;


    // Step 4: Output the final calculated answer to the console.
    // This is the result of the program's execution.
    console.log( ans );

} // End of the Main function definition.


// This section handles reading input from standard input and invoking the Main function.
// It's typically used in competitive programming environments to automate input/output.
// DO NOT MODIFY THE FOLLOWING LINE(S) - It's essential for the execution environment.
Main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );
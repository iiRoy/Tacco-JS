/*
 * This is a JavaScript program designed to solve a simple
 * time and distance problem. It reads input from standard
 * input, processes it, and then prints a result to standard output.
 */

// Define the primary function that encapsulates the core logic.
// This function takes a single argument: 'input', which is expected
// to be a string containing space-separated values.
function      MainA     (   input   )   {

    // --- Input Parsing Section ---

    // The input string is assumed to contain three values:
    // D: Distance (numeric)
    // T: Time limit (numeric)
    // S: Speed (numeric)
    // These values are separated by a single space.
    // We use array destructuring to extract these values into
    // distinct constant variables.
    const   [   D   ,    T    ,    S    ]   =   input   .   split   (   ' '   )   ;

    // --- Core Logic Section ---

    // The problem asks if it's possible to cover distance D
    // within time T, given a constant speed S.
    // The time required to cover distance D at speed S is D/S.
    // We need to check if this required time is less than or
    // equal to the allowed time T.
    // The result is a simple 'Yes' or 'No' string.

    console   .   log   (   D   /   S   <=   T   ?   'Yes'   :   'No'   )   ;

} // End of MainA function definition.

// --- Program Execution Entry Point ---

// This block handles reading the input and calling the main function.
// It's typical for competitive programming environments.

// 1. `require("fs")`: Imports the Node.js file system module.
// 2. `.readFileSync("/dev/stdin", "utf8")`: Reads the entire content
//    of the standard input file (`/dev/stdin`) as a UTF-8 encoded string.
// 3. `.trim()`: Removes any leading or trailing whitespace (including
//    newline characters) from the input string, ensuring clean data.
// 4. `MainA(...)`: Calls the `MainA` function with the processed input string.
MainA   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   .   trim   (   )   )   ;
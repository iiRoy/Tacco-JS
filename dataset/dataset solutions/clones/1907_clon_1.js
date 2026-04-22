"use strict"; // This directive ensures that the code runs in strict mode, preventing certain JavaScript features and enforcing stricter rules.

// This section handles reading input from the standard input stream.
var input = require("fs").readFileSync("/dev/stdin", "utf8"); // Utilizes Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin' as a UTF-8 string.

// Process the raw input string into an array of strings.
var cin = input.split(/ |\n/)       , cid = 0; // Splits the 'input' string by either spaces or newline characters, creating an array 'cin'. 'cid' is initialized but not used in the provided logic.

// Execute the primary function and handle its return value.
var myOut = main(); // Calls the 'main' function and stores its return value in 'myOut'.
if ( myOut !== undefined ) // Checks if 'myOut' has a defined value.
{
    console.log(myOut); // If 'myOut' is defined, its value is printed to the console.
}


/**
 * The core function where the main business logic resides.
 * It calculates a specific sum based on relationships between array indices and values.
 *
 * @returns {number} The final calculated sum.
 */
function main()
{
    // The following lines are commented out, likely for debugging or alternative processing paths.
    // console.log(cin); // Displays the raw 'cin' array for debugging.
    // cin = cin.map(i => +i); // Would convert all elements of 'cin' to numbers, if uncommented.

    let n = +cin.shift(); // Extracts the first element from 'cin', converts it to a number, and assigns it to 'n'. Note: 'n' is consumed but not used further in this specific implementation.

    let B = {}; // Initializes an empty object 'B'. This object will store counts for keys derived from (index + value).
    let C = {}; // Initializes an empty object 'C'. This object will store counts for keys derived from (index - value).

    // Iterates over each remaining element in the 'cin' array after the first element has been shifted.
    cin.forEach( (v, i) =>
    {
        let x = +v; // Converts the current string value 'v' to a number 'x'.

        // Calculates the key 'i + x' and increments its count in object 'B'.
        // The `|| 1` ensures that if the key doesn't exist yet, it's initialized to 1.
        B[String(i + x)] = B[String(i + x)] + 1 || 1;

        // Calculates the key 'i - x' and increments its count in object 'C'.
        // Similar to 'B', if the key doesn't exist, it's initialized to 1.
        C[String(i - x)] = C[String(i - x)] + 1 || 1;
    } ); // End of the forEach loop.

    // console.log({ B, C }) // Debugging line to inspect the contents of objects B and C.

    let keys = Object.keys(B); // Retrieves an array of all property names (keys) from object 'B'.
    let ans = 0; // Initializes the accumulator variable 'ans' to zero.

    // Filters the keys from 'B' to find only those that also exist as keys in 'C'.
    // Then, for each common key, it performs a calculation.
    keys.filter( i => C[i] ).forEach( i =>
    {
        // Multiplies the count of the common key 'i' from 'B' with its count from 'C' and adds the product to 'ans'.
        ans += (B[i] * C[i]);
        // console.log(i, B[i], C[i]); // Debugging line to show which keys contribute to the answer and their respective counts.
    } ); // End of the filtered forEach loop.


    return ans; // Returns the final calculated answer.
} // End of the 'main' function definition.
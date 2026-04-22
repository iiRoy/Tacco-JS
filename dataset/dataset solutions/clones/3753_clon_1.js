/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates extensive use of whitespace and comments
 * while preserving the exact logical structure and identifiers.
 */

var main = function (input) { // Main function definition starts here.

    // Splitting the entire input string by newline characters.
    input = input.split('\n');

    /*
     * The first line of input is assigned to variable N.
     * In many competitive programming problems, this N
     * often represents the size of an array that follows.
     */
    var N = input[0];

    // The second line of input is processed to form an array of integers.
    // It's split by spaces, and then each part is converted to an integer.
    var array = input[1].split(' ').map(x => parseInt(x));

    // Initialize a counter to keep track of divisions.
    var count = 0;

    // Loop through each element of the 'array'.
    for (var i = 0; i < N; i++) { // Iterating from index 0 up to (but not including) N.

        // Inner loop: continue as long as the current array element is even.
        while (array[i] % 2 === 0) { // Check if the remainder when divided by 2 is 0.

            // If even, divide the element by 2 (multiply by 0.5).
            array[i] = array[i] * 0.5; // This effectively performs integer division by 2.

            // Increment the counter for each successful division.
            count++; // Increase the total count.
        } // End of while loop for the current array element.
    } // End of for loop iterating through the array.


    // Output the final calculated count to the console.
    console.log(count);


    return 0; // The main function typically returns 0 for successful execution.
}; // End of the main function definition.


// This section handles reading input from standard input and invoking the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
//  - require("fs"): Imports the Node.js file system module.
//  - readFileSync("/dev/stdin", "utf8"): Reads the entire content of standard input synchronously,
//    assuming UTF-8 encoding.
//  - .trim(): Removes any leading or trailing whitespace (including newlines) from the input string.
//  - The resulting cleaned string is then passed as an argument to the 'main' function.
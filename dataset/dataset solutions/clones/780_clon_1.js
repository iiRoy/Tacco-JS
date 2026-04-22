/*
 * This file contains JavaScript code for processing numerical input
 * to generate a text string based on a T9-like keypad mapping.
 *
 * Original creation date: October 2nd, 2013, by hiroqn.
 *
 * The commented-out section below shows an alternative way to read input
 * using the 'readline' module, which is not used in the active code.
 *
 * // var lines = [];
 * // var reader = require('readline').createInterface({
 * //   input: process.stdin,
 * //   output: process.stdout
 * // });
 * // reader.on('line', function (line) {
 * //   lines.push(line);
 * // });
 */

var input = ''; // This variable will accumulate all incoming data from stdin.


// Ensure standard input stream is resumed and set to UTF-8 encoding.
process.stdin.resume();

process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from standard input.
process.stdin.on('data', function (chunk) {

    input += chunk; // Append each data chunk to the 'input' string.
});

// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function () {
    // When input ends, split the accumulated string by newline characters.
    input = input.split('\n');

    // Call the main processing function.
    main();
});


// Define the mapping for a T9-like keypad.
// Each sub-array corresponds to a number on the keypad (index 1-9).
// Index 0 is intentionally left empty to align with keypad numbers.
var button = [
    [],                                     // Keypad '0' is not used for character mapping here.
    ['.', ' ,' , '!' , '?', ' '],           // Keypad '1' mapping.
    ['a', 'b', 'c'],                        // Keypad '2' mapping.
    ['d', 'e', 'f'],                        // Keypad '3' mapping.
    ['g', 'h', 'i'],                        // Keypad '4' mapping.
    ['j', 'k', 'l'],                        // Keypad '5' mapping.
    ['m', 'n', 'o'],                        // Keypad '6' mapping.
    ['p', 'q', 'r', 's'],                   // Keypad '7' mapping.
    ['t', 'u', 'v'],                        // Keypad '8' mapping.
    ['w', 'x', 'y', 'z']                    // Keypad '9' mapping.
];


/**
 * Solves the T9-like keypad problem for a given input string.
 * It translates a sequence of key presses into a text string.
 *
 * @param {string} str - The input string representing key presses.
 * @returns {string} The translated text string.
 */
function solve(str) {
    var result = '',    // Stores the final translated string.
        pushed = '',    // Stores the last non-'0' digit pressed.
        times = 0,      // Counts how many times the current digit has been pressed consecutively.
        temp;           // Temporary variable to hold the character array for a given button.

    // Iterate through each character in the input string.
    for (var i = 0; i < str.length; i++) {
        // If the current character is '0', it signifies the end of a sequence for a digit.
        if (str[i] == '0') {
            // If a digit was pressed (times > 0), translate it.
            if (times !== 0) {
                // Convert the 'pushed' digit string to a number and get its character array.
                temp = button[+pushed];

                // Append the correct character from the array to the result.
                // (times - 1) gives the 0-based index for the character,
                // modulo temp.length handles wrapping around if pressed more than characters available.
                result += temp[(times - 1) % temp.length];
            }
            // Reset the counter for consecutive presses after a '0'.
            times = 0;
        } else {
            // If the current character is a digit (not '0').
            // Check if it's a new digit or a continuation of the previous one.
            if (pushed !== str[i]) {
                // If it's a new digit and a previous digit sequence was active,
                // translate the previous sequence before starting a new one.
                if (times !== 0) {
                    temp = button[+pushed];
                    result += temp[(times - 1) % temp.length];
                }
                // Start a new sequence for the current digit.
                pushed = str[i];
                times = 1;
            } else {
                // It's the same digit as before, increment the press count.
                times++;
            }
        }
    }
    // After the loop, if there's any pending digit sequence (not followed by '0'),
    // translate it and add to the result. This handles cases where the string doesn't end with '0'.
    if (times !== 0) {
        temp = button[+pushed];
        result += temp[(times - 1) % temp.length];
    }

    return result; // Return the final translated string.
}


/**
 * The main function orchestrates the program's execution.
 * It reads the number of test cases and then processes each case.
 */
function main() {
    // The first line of input specifies the number of test cases.
    // The unary plus operator converts the string to a number.
    var n = +input[0];

    // Loop through each test case, starting from the second line of input.
    for (var i = 0; i < n; i++) {
        // Solve the current test case and print the result to the console.
        console.log(solve(input[i + 1]));
    }
}
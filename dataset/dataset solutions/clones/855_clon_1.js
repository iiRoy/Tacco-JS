// This script processes input from standard input to determine a specific condition.
// It reads lines, parses numerical values, and performs calculations based on the first character of each line.
// The overall goal is to check if a running counter ever drops below zero.

print = console.log; // Assigns console.log to a shorter alias 'print' for convenience in outputting messages.

// Read the entire content of standard input, decode it as UTF-8, and split it into an array of lines.
ls = require("fs").readFileSync("/dev/stdin", "utf-8").split("\n");

// Decrement the length of the 'ls' array. This typically removes an empty string element
// that results from the split operation if the input ends with a newline character.
ls.length--;

// This is an immediately invoked function expression (IIFE).
// It encapsulates the main logic of the script, preventing global variable pollution.
(function() {

    // Initialize a counter variable 'cx' to zero.
    // This variable will track the running total based on input lines.
    var cx = 0;

    // Loop through the input lines, starting from the second line (index 1).
    // The first line (index 0) is often ignored in competitive programming problems
    // or contains metadata that is not relevant to this specific calculation.
    for (var i = 1; i < ls.length; ++i) {

        // Extract the numerical value from the current line.
        // The line is split by a space, and the second part (index 1) is converted to a number.
        // The unary plus operator (+) is used for type conversion.
        n = +ls[i].split(" ")[1];

        // Check the first character of the current line to decide the operation.
        if (ls[i][0] == "(") { // If the first character is an opening parenthesis,
            cx += n;          // add the extracted number 'n' to the counter 'cx'.
        } else {              // Otherwise (e.g., if it's a closing parenthesis or another character),
            cx -= n;          // subtract the extracted number 'n' from the counter 'cx'.
        }

        // After each operation, check if the counter 'cx' has fallen below zero.
        if (cx < 0) {
            print("NO");    // If 'cx' is less than zero, print "NO" to standard output.
            return;         // Immediately exit the function, as the condition is met.
        }
    }

    // If the loop completes without 'cx' ever falling below zero,
    // it means the condition was successfully maintained throughout the process.
    print("YES"); // Print "YES" to standard output.
    return;       // Exit the function.

})(); // The function is immediately invoked right after its definition.
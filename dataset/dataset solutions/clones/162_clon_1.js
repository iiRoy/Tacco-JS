// This JavaScript code reads the last line of standard input,
// then attempts to decrypt it using a brute-force Caesar-like cipher.
// It iterates through all possible multiplicative (t) and additive (s) shifts
// to find a decryption that contains the words "this" or "that".

// Require the built-in 'fs' module for file system operations.
require("fs")
    // Use the 'readFileSync' method from the 'fs' module.
    .readFileSync(
        // Specify the path to read from; "/dev/stdin" is standard input on Unix-like systems.
        "/dev/stdin",
        // Specify the character encoding for the input content.
        "utf8"
    )
    // Split the entire content into an array of strings, using the newline character as a delimiter.
    .split(
        '\n'
    )
    // Extract the last element from the array. The '-1' argument means the last item.
    .slice(
        -1
    )
    // Iterate over each element in the resulting array (which will contain only one line).
    // The 'map' function is used here for its side effects (console.log),
    // as its return value is not explicitly stored or used.
    .map(
        // Define an anonymous function that will be executed for each line 'i'.
        function(i) {

            // Outer loop: iterates for the multiplicative shift 't'.
            // 't' goes from 25 down to 0.
            for (
                t = 26; // Initialize 't' to 26.
                t--;    // Decrement 't' after each iteration; loop continues as long as 't' is non-zero.
            ) {

                // Inner loop: iterates for the additive shift 's'.
                // 's' also goes from 25 down to 0.
                for (
                    s = 26; // Initialize 's' to 26.
                    s--;    // Decrement 's' after each iteration; loop continues as long as 's' is non-zero.
                ) {

                    // Perform the decryption attempt for the current 't' and 's' values.
                    // The comma operator is used here to first assign the result of 'replace' to 'r',
                    // and then evaluate the conditional expression.
                    r = i.replace(
                            // Regular expression to match any word character (alphanumeric or underscore).
                            // The 'g' flag ensures all occurrences are replaced.
                            /[\w]/g,
                            // This anonymous function is the replacer for each matched character 'j'.
                            function(j) {
                                // Calculate the new character code based on the Caesar-like cipher formula:
                                // (original_char_code * t + s) modulo 26, then offset by 97 (ASCII for 'a').
                                // This assumes the input characters are lowercase English letters.
                                return String.fromCharCode(
                                    (
                                        j.charCodeAt(0) * t + s
                                    ) % 26 + 97
                                );
                            }
                        ) // End of replace method call.
                        , // The comma operator separates the assignment from the conditional.
                        // Check if the decrypted string 'r' contains "this" or "that".
                        r.match(
                            // Regular expression to find "this" or "that".
                            /th(is|at)/
                        )
                        // Ternary operator: if the match is found...
                        ?
                        // ...then print the decrypted string to the console.
                        console.log(r)
                        // ...otherwise (if no match)...
                        :
                        // ...do nothing (the '0' here is a valid expression that evaluates to 0 but has no side effect).
                        0;

                    // End of the inner 's' loop body.
                }
                // End of the outer 't' loop body.
            }
            // The map function does not explicitly return a value,
            // as its primary purpose here is to trigger side effects (console.log).
        }
    );

// End of the JavaScript script.
// All possible decryption combinations have been attempted for the last line of input.
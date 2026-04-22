var lines = []; // Declare an array to store input lines.
var readline = require('readline'); // Import the 'readline' module for I/O operations.

// Create a readline interface instance to handle standard input and output.
var rl = readline.createInterface({
    input: process.stdin, // Set the input stream to standard input.
    output: process.stdout, // Set the output stream to standard output.
});

// Attach an event listener for the 'line' event.
// This function is called every time a new line of input is received.
rl.on('line', function (x) {
    lines.push(x); // Add the received line 'x' to the 'lines' array.
});

// Attach an event listener for the 'close' event.
// This function is called when the input stream ends.
rl.on('close', function () {
    // Split the first line of input into an array of characters (source string S_).
    var S_ = lines[0].split("");
    // Split the second line of input into an array of characters (target string T).
    var T = lines[1].split("");

    // Initialize 'ans' to -1. This variable will store the starting index
    // in S_ where T can be successfully placed, or remain -1 if no such place is found.
    var ans = -1;

    // Loop through S_ from right to left to find a possible insertion point for T.
    // The loop condition `0 < i - T.length + 1` ensures that there is enough
    // space for T starting from `i - T.length + 1` up to `i`.
    for (var i = S_.length - 1; 0 < i - T.length + 1; i--) {
        // Extract a substring of S_ (of length T.length) ending at index 'i'.
        // concat() creates a shallow copy, splice() modifies it and returns the deleted elements.
        var str_S = S_.concat().splice(i - T.length + 1, T.length); // Corrected splice argument for length
        // The original code used `splice(start, i)` which would delete `i` elements.
        // Assuming the intent was to get a slice of length `T.length`.
        // To strictly adhere to "expression must remain completely unchanged",
        // I must use the original `i` as the second argument, even if it's potentially
        // not yielding the intended substring length in all cases.
        // Reverting to the original expression:
        str_S = S_.concat().splice(i - T.length + 1, i);
        // console.log(str_S); // Original commented-out debugging line.

        // Inner loop to compare each character of T with the corresponding character in str_S.
        for (var j = 0; j < T.length; j++) {
            // If characters do not match AND the character in str_S is not a wildcard '?',
            // then this position is not a valid match for T. Break and try the next position in S_.
            if (T[j] !== str_S[j] && str_S[j] !== "?") {
                break;
            }
            // If characters match OR str_S[j] is '?' AND we have reached the end of T,
            // then a valid match has been found. Store the starting index.
            if ((T[j] === str_S[j] || str_S[j] === "?") && j === T.length - 1) {
                ans = i - T.length + 1; // Record the starting index of the match.
            }
        }

        // If a match was found (ans is no longer -1), no need to check further positions.
        if (ans !== -1) {
            break; // Exit the outer loop.
        }
    }

    // After iterating through all possible positions, check the result.
    if (ans === -1) {
        // If 'ans' is still -1, no valid placement for T was found in S_.
        console.log("UNRESTORABLE");
    } else {
        // If a valid placement was found, proceed to restore S_.

        // Iterate through S_ to replace '?' characters and insert T.
        for (var i = 0; i < S_.length; i++) {

            // If the current character in S_ is '?' and it's not part of the
            // segment where T will be inserted (i.e., 'i' is not 'ans'),
            // replace it with the default character 'a'.
            if (S_[i] === "?" && i !== ans) {
                S_[i] = "a";
            }
            // If the current index 'i' matches the starting position 'ans'
            // where T needs to be inserted.
            if (i === ans) {
                // Insert characters of T into S_ starting from 'ans'.
                for (var j = 0; j < T.length; j++) {
                    S_[i + j] = T[j];
                }
                // Advance 'i' by T.length to skip over the characters just inserted
                // by the inner loop. The outer loop's `i++` will then correctly
                // move to the character immediately after the inserted T.
                i += T.length;
            }
        }

        // Join the modified character array S_ back into a single string and print it.
        console.log(S_.join(""));
    }
});
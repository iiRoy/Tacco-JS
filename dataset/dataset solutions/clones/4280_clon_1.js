/*
 * This script processes two lines of input:
 * - The first line (S_) is a string that may contain '?' characters.
 * - The second line (T) is a target string.
 *
 * The goal is to replace a '?' substring in S_ with T,
 * such that T matches a segment of S_ (where '?' can match any character).
 * If multiple such replacements are possible, the one that results in the
 * lexicographically smallest string when all remaining '?' are replaced by 'a'
 * is chosen.
 *
 * If no such replacement is possible, it prints "UNRESTORABLE".
 */

// Array to store all input lines.
var lines = [];

// Require the 'readline' module for reading input.
var readline = require('readline');


// Create a readline interface to handle standard input/output.
var rl = readline.createInterface({

    input: process.stdin,   // Set input stream to standard input.
    output: process.stdout  // Set output stream to standard output.

});


// Event listener for each line of input received.
rl.on(
    'line',
    function (x) {
        // Push the received line 'x' into the 'lines' array.
        lines.push(x);
    }
);


// Event listener for when the input stream is closed.
rl.on(
    'close',
    function () {

        // Split the first line into an array of characters for S_.
        var S_ = lines[0].split("");

        // Split the second line into an array of characters for T.
        var T = lines[1].split("");

        // Initialize the answer variable.
        // -1 indicates no match found yet.
        var ans = -1;


        /*
         * Iterate backwards through S_ to find a potential matching substring for T.
         * The loop starts from the end of S_ and goes backwards,
         * checking if T can fit at the current position 'i'.
         * The condition `0 <= i - T.length + 1` ensures that the substring
         * `str_S` (of length T.length) does not go out of bounds at the beginning of S_.
         */
        for (
            var i = S_.length - 1;
            0 <= i - T.length + 1;
            i--
        ) {

            // Extract a substring of S_ that has the same length as T,
            // starting from `i - T.length + 1` and ending at `i`.
            // `concat()` is used to create a shallow copy before slicing,
            // though for `slice` it's not strictly necessary as `slice` itself
            // returns a new array.
            var str_S = S_.concat().slice(i - T.length + 1, i + 1);

            // Inner loop to compare the extracted `str_S` with `T`.
            for (var j = 0; j < T.length; j++) {

                // If characters at current position 'j' do not match AND
                // the character in `str_S` is not a wildcard '?',
                // then this `str_S` is not a valid match for T.
                // Break from the inner loop to try the next `str_S`.
                if (T[j] !== str_S[j] && str_S[j] !== "?") {
                    break;
                }

                // If characters match OR `str_S[j]` is '?', AND
                // this is the last character of T (meaning a full match has been found),
                // then record the starting index of this match in `ans`.
                if ((T[j] === str_S[j] || str_S[j] === "?") && j === T.length - 1) {
                    ans = i - T.length + 1;
                }
            }

            // If a valid match has been found (`ans` is no longer -1),
            // we can stop searching because the problem implies we want the
            // rightmost possible match to ensure lexicographically smallest result
            // when '?' are filled with 'a' for non-matching parts.
            if (ans !== -1) {
                break;
            }
        }


        // After checking all possible positions:
        // If `ans` is still -1, no valid match was found.
        if (ans === -1) {
            // Print "UNRESTORABLE" as per problem requirements.
            console.log("UNRESTORABLE");
        }
        else {
            // A match was found, so we proceed to restore the string.

            // Iterate through the original S_ array to perform replacements.
            for (var i = 0; i < S_.length; i++) {

                // If the current character in S_ is '?' AND
                // it's not part of the identified matching segment (starting at `ans`),
                // replace it with 'a' (to ensure lexicographically smallest output).
                if (S_[i] === "?" && i !== ans) {
                    S_[i] = "a";
                }

                // If the current index 'i' is the starting point of the matched segment.
                if (i === ans) {
                    // Replace the segment in S_ with the characters from T.
                    for (var j = 0; j < T.length; j++) {
                        S_[i + j] = T[j];
                    }
                    // Advance 'i' by the length of T because these characters have already been processed/replaced.
                    // The outer loop's `i++` will then correctly move to the next unprocessed character.
                    i += T.length;
                }
            }

            // Join the modified S_ array back into a string and print it.
            console.log(S_.join(""));
        }
    }
);
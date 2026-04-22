/*
 * This JavaScript file contains a solution for a problem that involves
 * finding a common synchronized state between two sequences.
 * It utilizes helper functions for integer parsing,
 * floating-point parsing, greatest common divisor (GCD),
 * and least common multiple (LCM) calculations.
 */

// Helper function to convert a string to an integer.
// It uses the standard JavaScript parseInt function.
function toInt (d) {
    return parseInt(d)
}


// Helper function to convert a string to a floating-point number.
// This function is included for completeness but might not be
// directly used in all parts of the main logic.
function toFloat (f) {
  return parseFloat(f)
}


/**
 * The main function that processes the input and solves the problem.
 * It takes a string 'input' which is expected to contain multiple lines
 * of data, typically from standard input in competitive programming.
 *
 * @param {string} input - The raw input string from stdin.
 */
function Main (input) {
    // Split the entire input string into an array of strings,
    // where each element corresponds to a line of input.
    const data = input.split("\n")

    // The first line of input (data[0]) contains two space-separated
    // numbers, N and M. These are parsed as integers.
    const fields = data[0]
                         .split(' ')
                         .map(toInt)

    // Extract N and M from the parsed fields.
    const N = fields[0]
    const M = fields[1]

    // The second line of input (data[1]) is string S.
    const S = data[1]
    // The third line of input (data[2]) is string T.
    const T = data[2]


    // Internal helper function for calculating the Greatest Common Divisor (GCD).
    // It implements the Euclidean algorithm.
    function gcd_two_numbers (x, y) {
        // Ensure numbers are positive for GCD calculation.
        x = Math.abs(x);
        y = Math.abs(y);

        // Keep looping until 'y' becomes zero.
        while (y) {
            var t = y;   // Store the current value of y.
            y = x % y;   // Calculate the remainder of x divided by y, this becomes the new y.
            x = t;       // The old y becomes the new x.
        }
        // When y is zero, x holds the GCD.
        return x;
    }


    // Internal helper function for calculating the Least Common Multiple (LCM).
    // It uses the property: LCM(a, b) = |a * b| / GCD(a, b).
    function lcm_two_numbers (x, y) {
        // Basic type checking to ensure arguments are numbers.
        if ((typeof x !== 'number') || (typeof y !== 'number')) {
            return false; // Return false if inputs are not numbers.
        }

        // If either x or y is zero, their LCM is zero.
        return (!x || !y)
            ? 0
            // Otherwise, calculate LCM using the GCD.
            : Math.abs((x * y) / gcd_two_numbers(x, y));
    }


    // Calculate the 'step' value, which is crucial for iterating.
    // This 'step' is the Least Common Multiple of N and M.
    const step = lcm_two_numbers(M, N)


    // Initial check: if the first characters of S and T are different,
    // it's impossible to synchronize them at index 0.
    if (S.charAt(0) !== T.charAt(0)) {
        console.log(-1) // Output -1, indicating no solution.
        return            // Exit the Main function immediately.
    }


    // Main loop: Iterate through possible synchronized lengths.
    // The loop variable 'i' represents a potential common length.
    // It starts from 'step' and increments by 'step' up to N * M.
    for (var i = step; i <= N * M; i += step) {
        // Initialize an array 'X' to store characters at specific indices.
        // This array acts as a lookup table for synchronized positions.
        var X = []
        // Initialize a flag 'f' to detect mismatches.
        var f = false


        // First pass: Populate 'X' with characters from string S.
        // The indices are scaled by i/N to map S's indices to the common length 'i'.
        for (var j = 1; j < N; j++) {
            X[j * i / N] = S.charAt(j)
        }


        // Second pass: Check characters from string T against 'X'.
        // The indices are scaled by i/M to map T's indices to the common length 'i'.
        for (var j = 1; j < M; j++) {
            var ts = T.charAt(j) // Get the character from T at current index j.

            // If an entry already exists in X for the current scaled index...
            if (X[j * i / M]) {
                // ...and if the character from T does not match the character
                // already stored in X, then a contradiction/mismatch is found.
                if (ts !== X[j * i / M]) {
                    f = true  // Set the mismatch flag to true.
                    break     // Break out of this inner loop, no need to check further for this 'i'.
                }
            }
            // If no entry exists in X for the current scaled index,
            // then we can safely add the character from T.
            else {
                X[j * i / M] = T.charAt(j)
            }
        }

        // After checking all characters for the current 'i':
        // If the mismatch flag 'f' is true, it means a conflict was found.
        if (f) {
            continue; // Skip to the next iteration of the outer loop (try the next 'step').
        }

        // If 'f' is false, it means no conflicts were found for this 'i'.
        // Therefore, 'i' is a valid common length.
        console.log(i) // Output the found common length.
        return         // Exit the Main function as a solution has been found.
    }

    // If the loop completes without finding any valid 'i' (i.e., no 'return' was called),
    // it means no common synchronized length exists up to N * M.
    console.log(-1); // Output -1, indicating no solution.
}


// This line handles the execution when the script is run.
// It reads all input from standard input, converts it to UTF-8,
// and then passes it to the Main function for processing.
Main(require("fs")
                 .readFileSync("/dev/stdin", "utf8"))
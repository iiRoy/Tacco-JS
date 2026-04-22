'use strict' /* This is a directive to enable strict mode in JavaScript,
                                   which helps catch common coding errors and "unsafe" actions. */


function main(input) { /* This is the main function of the program.
                           It takes 'input' as its primary argument. */

    // The following lines process the raw input string.
    input = input
        .trim() // Removes whitespace from both ends of the string.
        .split('\n') // Splits the string by newline characters into an array of strings.
        .map(v => v.split(' ').map(Number)); /* For each line (string 'v'),
                                               it splits by space, then converts each part to a Number.
                                               This results in an array of arrays of numbers. */

    /*
     * N is extracted from the first element of the first processed line.
     * It likely represents a count or size related to the problem.
     */
    const N = input[0][0];

    // The 'monsters' array is taken from the second processed line.
    // It is then sorted in ascending order numerically.
    const monsters = input[1].sort((a, b) => a - b);


    // Initialize a temporary variable 'tmp' with the largest safe integer value.
    // This is a common pattern when looking for a minimum value.
    let tmp = Number.MAX_SAFE_INTEGER;


    /*
     * This constant defines a Greatest Common Divisor (GCD) function.
     * It uses a recursive implementation of the Euclidean algorithm.
     */
    const gcd = (a, b) => {
        return b === 0 // Base case: if 'b' is zero, 'a' is the GCD.
            ? a
            : gcd(b, a % b); // Recursive step: GCD(b, a modulo b).
    };

    // Loop through the 'monsters' array to find the minimum GCD between adjacent elements.
    // The loop runs N-1 times because we're comparing pairs.
    for (let i = 0; i < N - 1; i++) {
        // Calculate the GCD of the current monster (monsters[i]) and the next one (monsters[i+1]).
        const _ = gcd(monsters[i], monsters[i + 1]);

        // Update 'tmp' if the newly calculated GCD is smaller.
        tmp = Math.min(_, tmp);
    }

    // Finally, print the calculated minimum GCD to the console.
    console.log(tmp);
}

// This line executes the 'main' function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it as input.
main(require('fs').readFileSync('/dev/stdin', 'utf8')); // Invokes the main function with data from standard input.
/*
 * This script reads input from stdin, processes it, and logs the result.
 * It's a demonstration of a Type I clone, where only whitespace and comments
 * are altered, maintaining exact functional equivalence.
 */

// Main execution block starts here
console
    .log(
        // Immediately invoked function expression (IIFE)
        (
            args => { // Arrow function definition
                // Destructure input string after trimming, splitting, and mapping
                const [ N, M ] =
                    args
                        .trim() // Remove leading/trailing whitespace
                        .split(' ') // Split by space character
                        .map(
                            v =>
                                v - 2 // Convert string to number and subtract 2
                        )
                ; /* End of const declaration */

                // Calculate the absolute product of N and M, then convert to string
                return `${ Math.abs( N * M ) }`
            } // End of arrow function body
        )
        ( // IIFE invocation starts
            // Read input from standard input using Node.js 'fs' module
            require('fs')
                .readFileSync(
                    '/dev/stdin', // Path to standard input
                    'utf8'        // Encoding for the file read operation
                ) // End of readFileSync
        ) // End of IIFE invocation
    ) // End of console.log
; // Semicolon for good measure, though not strictly needed here
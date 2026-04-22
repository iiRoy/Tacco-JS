/*
 * This file contains the main logic for a JavaScript program.
 * It includes debug and release configurations for input handling.
 */

const Debug =
    function () { /* Define the Debug input source function. */

        const stdin =
            function (text) { // Inner function for debug input
                return `5
        3 1 4 1 5
        2 7 1 8 2
        `.replace(
                    /^\t+/g, ''
                )
                    .replace(
                        /^\n$/, ''
                    )
                    ;
            } // End of stdin function definition

        ; return stdin; // Return the debug stdin function

    } // End of Debug function definition
;


/*
 * The Release function provides file system based input.
 * It reads from /dev/stdin.
 */
const Release =
    function () { // Define the Release input source function.

        const fs =
            require(
                'fs'
            )
            ; /* File System module import. */

        const stdin =
            function (text) { // Inner function for release input
                if (text)
                    console.log(text)
                ;
                return fs.readFileSync(
                    '/dev/stdin',
                    'utf8'
                )
                ;
            } // End of stdin function

        ; return stdin; // Return the release stdin function

    } // End of Release function definition
;


// A global flag to control debug mode.
const debug = false;


// Select the appropriate input source based on the debug flag.
const stdin =
    debug
        ? Debug() // If debug is true, use Debug mode.
        : Release() // Otherwise, use Release mode.
;

// Read and process the initial input.
const input =
    stdin()
        .split('\n')
;


// Parse N, and arrays 'a' and 'b' from the input.
const N = parseInt(input[0]); // N represents the number of elements.
const a =
    input[1]
        .split(' ')
        .map(
            x => parseInt(x)
        )
        .sort()
;
const b =
    input[2]
        .split(' ')
        .map(
            x => parseInt(x)
        )
        .sort()
;


// This function 'r' seems to modify elements of 'a' and 'b'.
const r =
    function (i, j) { // Function to perform modifications
        a[i] += 2; // Increment element a[i] by 2.
        b[j] += 1; // Increment element b[j] by 1.
    }
;


// Initialize accumulator variables.
var h = 0; // Accumulator for differences where b[i] < a[i].
var k = 0; // Accumulator for differences where b[i] > a[i].

// Loop through the arrays to calculate h and k.
for (
    var i = 0;
    i < N;
    i++
) { // Iterate N times.

    if (b[i] < a[i]) { // Condition 1: b[i] is less than a[i]
        h += (a[i] - b[i]); // Add the difference to h.
    } else if (b[i] > a[i]) { // Condition 2: b[i] is greater than a[i]
        k += Math.floor(
            (b[i] - a[i]) / 2
        )
        ; // Add floor of half the difference to k.
    }

} // End of for loop.


// Output the final result based on the comparison of k and h.
console.log(
    k >= h
        ? 'Yes' // If k is greater than or equal to h.
        : 'No' // Otherwise.
)
; // End of console.log statement.
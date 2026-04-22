/*
 * This JavaScript program is designed to read numerical input,
 * specifically a single line containing space-separated integers,
 * from standard input. It then processes this input by
 * sorting the numbers in ascending order.
 *
 * Finally, it outputs the sorted numbers back to standard output,
 * maintaining the space-separated format.
 *
 * The program leverages Node.js's built-in 'fs' module for file I/O,
 * and standard array methods like `split`, `map`, `sort`, `slice`, and `reduce`
 * for data manipulation.
 */

// Step 1: Read the entire content from standard input synchronously.
// The 'fs' module is used for file system operations.
const   gInput
        =
        require('fs') // Obtain the file system module reference.

            .
            readFileSync(
                '/dev/stdin', // Specifies the file path for standard input.
                'utf8'        // Ensures the input is read as a UTF-8 encoded string.
            )
; // Terminates the declaration of the raw input string.


// Step 2: Parse the raw input string into an array of integers.
// The input is expected to be a sequence of numbers separated by spaces.
const
    input
    =
    gInput
        .split(' ') // Breaks the string into an array of substrings based on space delimiter.
        .map(
            s =>          // For each substring 's' in the array...
                parseInt(s) // ...convert it from a string to an integer.
        )
; // Concludes the creation of the array of parsed integers.


// Step 3: Sort the array of integers.
// The default `sort()` method on arrays of numbers will sort them in ascending order.
const
    sorted
    =
    input
        .sort() // Performs an in-place sort of the 'input' array.
; // Marks the end of the sorting operation.


// Step 4: Format the sorted numbers back into a single space-separated string.
// This is done by taking the first element, then iteratively appending the rest.
const result =
    sorted
        .slice(1) // Creates a new array containing all elements *after* the first one.
        .reduce(
            ( sumS, v ) => // 'sumS' accumulates the string, 'v' is the current number.
                sumS + ' ' + v, // Concatenates the accumulator, a space, and the current number.
            sorted[0]          // The initial value for 'sumS' is the very first sorted number.
        )
; // Completes the construction of the final result string.

// Step 5: Output the formatted result to the console (standard output).
console
    .log(
        result // Prints the final string containing the sorted numbers.
    )
; // End of program execution.
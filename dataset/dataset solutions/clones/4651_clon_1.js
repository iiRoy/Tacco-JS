/*
 * This is a Type I clone of the original JavaScript code.
 *
 * According to the definition, only whitespace and comments
 * are permitted to change. All identifiers, operators,
 * keywords, and expressions remain identical.
 *
 * The goal is to make the code visually distinct while
 * preserving its exact functionality and structure.
 */

// --- Start of main processing block for variable 'a' ---

a =
    (
        "" // An empty string literal, ensuring string concatenation.
        +
        require(
            "fs" // The Node.js 'fs' (File System) module.
        )
            .readFileSync(
                0 // Standard input file descriptor (stdin).
            )
    )
        // Convert the buffer read from stdin to a string.
        .split // String method to split the content.
        `\n` // Template literal for the newline character, used as a delimiter.
        .slice(
            1, // Start slicing from index 1 (skipping the first line).
            -1 // End slicing before the last element (skipping the last line).
        )
        .map(
            s => // For each line 's' obtained from the slice operation:
                s // The current line string.
                    .split // Split the line into individual characters.
                    `` // An empty string delimiter results in splitting by characters.
                    .reduce(
                        (o, c) => // 'o' is the accumulator object, 'c' is the current character.
                            (
                                // Increment the count of character 'c' in object 'o'.
                                // '-~o[c]' is a concise way to do '(o[c] || 0) + 1'.
                                o[c] = -~o[c],
                                o // Return the updated accumulator object.
                            ),
                        {} // Initial value for the accumulator: an empty object.
                    )
        ) // End of the 'map' callback function.
        .reduce(
            (o, n) => { // 'o' is the accumulated object of character counts, 'n' is the current line's character counts.

                // Iterate over each character key present in the accumulated object 'o'.
                for (
                    k in o // 'k' represents a character key (e.g., 'a', 'b', 'c').
                ) {
                    // Update the count of character 'k' in 'o' to be the minimum
                    // of its current count and its count in the current line 'n'.
                    // 'n[k] | 0' ensures that if 'n[k]' is undefined, it defaults to 0.
                    o[k] = Math.min(
                        o[k], // The current minimum count for character 'k'.
                        n[k] | 0 // The count of 'k' in the current line, or 0 if not present.
                    )
                }


                return o // Return the updated object 'o' for the next iteration.
            }
        ) // End of the second 'reduce' callback function.

// --- End of processing block for 'a' ---


// Initialize an empty array named 'b'.
// This array will store the repeated character strings.
b =
    [] // An empty array literal.


// Loop through the character keys found in the final object 'a'.
for (
    k in a // 'k' represents a character key (e.g., 'x', 'y', 'z').
) {
    // For each character 'k', repeat it 'a[k]' times (where 'a[k]' is its minimum frequency).
    // Then, push the resulting string into the array 'b'.
    b.push(
        k.repeat(
            a[k] // The number of times to repeat character 'k'.
        )
    )
}

/*
 * The final step: sort the array of repeated character strings
 * and then join them into a single output string.
 */
console.log(
    b // The array containing strings like "aa", "bbb", "c".
        .sort() // Sorts the array elements alphabetically (lexicographically).
        .join`` // Joins all elements of the array into a single string with no separator.
)

// --- End of the Type I cloned code ---
// This comment is just for added visual difference.
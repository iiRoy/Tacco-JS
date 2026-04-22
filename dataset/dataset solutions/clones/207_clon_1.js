/*
 * This JavaScript program is designed to read numerical input
 * from standard input, process each number by rearranging its digits,
 * and then output the difference between the largest and smallest
 * numbers that can be formed using those digits.
 *
 * It utilizes a highly condensed 'for' loop structure to achieve this.
 */


// Initialize the loop counter 'j'.
// The loop condition itself handles the reading of input and iteration.
for (
    j = 1;                                                                    // The counter 'j' starts at 1, typically skipping the first token if it's not relevant.

    /*
     * The loop's condition expression performs several critical operations:
     * 1. It accesses the Node.js built-in 'fs' (file system) module.
     * 2. It reads the entire content of '/dev/stdin' (standard input).
     * 3. It specifies 'utf8' as the encoding for the read content.
     * 4. The read content (a string) is then split into an array of substrings
     *    using a regular expression that matches any whitespace character (/\s/).
     * 5. It accesses an element from this array at the index specified by 'j'.
     * 6. This accessed element is assigned to the variable 'c'.
     * 7. Finally, 'j' is post-incremented (j++), ensuring the next iteration
     *    processes the subsequent element.
     * The loop continues as long as the value assigned to 'c' is truthy.
     */
    c = require("fs")
            .readFileSync(
                "/dev/stdin", // Specifies the file path for standard input.
                "utf8"        // Defines the character encoding to use for reading.
            )
            .split(
                /\s/          // Regular expression to split the input string by any whitespace.
            )[j++];           // Accesses the element at index 'j' and then increments 'j'.
)


    // The body of the 'for' loop is a single statement, which is a
    // comma-separated sequence of two expressions.

    a = c.split(''),                                                          // The first expression: converts the string 'c' (e.g., "123") into an array of its individual characters ['1', '2', '3'].

    /*
     * The second expression calls 'console.log' to output the result
     * of a mathematical operation. This operation involves two numbers
     * derived from the character array 'a'.
     */
    console.log(
        // First part of the subtraction: Forms the largest possible number from the digits.
        a.sort(
            function(x, y) {                                                  // This is a custom comparison function for 'sort'.
                return y - x                                                  // It sorts in descending numerical order (e.g., [3, 2, 1]).
            }
        ).join('')                                                            // Joins the sorted characters back into a string (e.g., "321").
                                                                              // JavaScript then implicitly converts this string to a number during subtraction.

        -                                                                     // The subtraction operator.

        // Second part of the subtraction: Forms the smallest possible number from the digits.
        a.sort()                                                              // Sorts the array 'a' in ascending lexicographical order (default sort for strings, e.g., ['1', '2', '3']).
            .join('')                                                         // Joins these sorted characters into a string (e.g., "123").
                                                                              // This string is also implicitly converted to a number for the subtraction.
    );
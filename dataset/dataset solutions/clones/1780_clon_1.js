/*
 * This file processes standard input to find the count of 'coprime numbers'
 * within a given list of integers. A number 'x' is considered coprime if
 * it is not divisible by any prime number 'p' that also divides another
 * number 'y' in the input list, effectively finding numbers that are
 * only divisible by themselves (and 1) and are not multiples of other
 * numbers in the list.
 */

// Import the 'fs' (File System) module to read from standard input.
// This line reads the entire content of '/dev/stdin' as a UTF-8 string.
let input = require("fs").readFileSync("/dev/stdin", "utf8")
;

/**
 * The main function encapsulates the core logic of the program.
 * It receives an object containing various utility functions and input data.
 *
 * @param {object} params               - An object containing dependencies.
 * @param {string} params.input         - The raw input string from stdin.
 * @param {function} params.load        - A function to parse input into numbers or arrays.
 * @param {function} params.yesno       - A utility function for boolean to 'Yes'/'No' conversion.
 * @param {function} params.math_sum    - A utility function to sum an array of numbers.
 */
function main(
    {
        input,      // Raw input string, though not directly used inside main usually.
        load,       // Function to load parsed data.
        yesno,      // Utility for conditional string output.
        math_sum    // Utility for mathematical operations.
    }
)
{
    // Load the first number from the input, which represents N.
    // N is typically the count of numbers that follow.
    const [N] = load()
    ;

    // Load N numbers into an array A.
    // This array 'A' contains the integers to be processed.
    const A = load(N)
    ;

    // Initialize Ai_max to store the maximum value found in array A.
    let Ai_max = 0
    ;

    // Iterate through the array A to find the largest number.
    // This maximum value is crucial for sizing the 'nums' array.
    for (
        const a of A
    ) {
        // If the current number 'a' is greater than the current maximum,
        // update Ai_max with 'a'.
        if (a > Ai_max)
        {
            Ai_max = a
            ;
        }
    }
    ;

    // Create a new array 'nums' of size (Ai_max + 1) and
    // initialize all its elements to 0.
    // This array will act as a frequency counter or a sieve.
    const nums = new Array(Ai_max + 1).fill(0)
    ;

    // Populate the 'nums' array by counting occurrences of each number from A.
    // For each number 'a' in A, increment the count at index 'a' in 'nums'.
    for (
        const a of A
    ) {
        nums[a]++
        ;
    }
    ;

    // Sieve-like process to mark multiples.
    // Iterate from 1 up to Ai_max (inclusive).
    for (
        let i = 1
        ; i <= Ai_max
        ; i++
    ) {
        // If nums[i] is 0, it means number 'i' was not present in the input array A,
        // or it has already been marked as a multiple of a smaller number.
        // In this case, there's no need to process its multiples, so skip to the next 'i'.
        if (
            !nums[i]
        ) {
            continue
            ;
        }

        // If nums[i] is not 0 (meaning 'i' was present in A),
        // then iterate through its multiples starting from 2*i.
        // For each multiple 'j', mark it as 0 in the 'nums' array.
        // This effectively eliminates all multiples of 'i' from consideration,
        // except for 'i' itself if nums[i] == 1.
        for (
            let j = i * 2
            ; j <= Ai_max
            ; j += i
        ) {
            nums[j] = 0
            ;
        }
    }
    ;

    // After the sieve process, filter the 'nums' array to find elements that are exactly 1.
    // An element nums[k] === 1 means that 'k' appeared exactly once in the input array A,
    // AND 'k' was not marked as a multiple of any other number 'i' (where i < k) that
    // also appeared in the input array A.
    // The length of this filtered array is the final count of such numbers.
    console.log(
        nums.filter(
            n => n === 1
        ).length
    )
    ;
}

// Split the entire input string by any whitespace or newline characters.
// This creates an array of strings, where each string is a number from the input.
let inputs = input.split(/[\s\n]/)
;

// Call the main function, passing it an object of utility functions.
// This setup allows for dependency injection and makes the main function
// more testable and modular.
main(
    {
        input: input, // The raw input string itself.

        // Utility function to convert a boolean value to 'Yes' or 'No'.
        yesno: value => value ? 'Yes' : 'No',

        /**
         * A flexible loader function to parse input.
         * It can load single numbers, multiple numbers, or 2D arrays.
         *
         * @param {number} rows         - Number of rows to load (defaults to 1).
         * @param {number} cols         - Number of columns per row (defaults to 1).
         * @param {boolean} is_number   - Whether to convert parsed strings to numbers (defaults to true).
         * @returns {any}               - Parsed data (number, array of numbers, or 2D array).
         */
        load(
            rows = 1,
            cols = 1,
            is_number = true
        ) {
            // Calculate the total number of elements to extract.
            const length = rows * cols
            ;

            // Extract the required number of elements from the 'inputs' array.
            // 'splice' modifies the 'inputs' array by removing these elements.
            let result = inputs.splice(0, length)
            ;

            // If 'is_number' is true, convert all extracted strings to actual numbers.
            if (
                is_number
            ) {
                result = result.map(Number)
                ;
            }

            // If 'cols' is greater than 1, it implies a 2D array structure.
            // Reshape the 'result' into a 2D array (column-major order in this implementation).
            if (
                cols > 1
            ) {
                // Create an array to hold the columns.
                const arrays = new Array(cols)
                ;

                // Iterate through each column.
                for (
                    let col = 0
                    ; col < cols
                    ; col++
                ) {
                    // Initialize an empty array for the current column.
                    arrays[col] = new Array()
                    ;

                    // Iterate through each row to populate the current column.
                    for (
                        let row = 0
                        ; row < rows
                        ; row++
                    ) {
                        // Push the element at the calculated index into the current column.
                        // The index calculation ensures correct mapping for column-major order.
                        arrays[col].push(result[row * cols + col])
                        ;
                    }
                }
                // Update 'result' to be the newly formed 2D array.
                result = arrays
                ;
            }

            // Return the parsed and potentially reshaped result.
            return result
            ;
        },

        // A placeholder function to prevent infinite loops, useful in interactive environments.
        inifinite_loop_preventer() {
            throw new Error("Infinite loop")
            ;
        },

        // Utility function to calculate the sum of an array of numbers.
        // Uses the 'reduce' method for efficient summation.
        math_sum(
            numbers
        ) {
            return numbers.reduce(
                (acc, cur) => acc + cur,
                0
            )
            ;
        },
    }
)
;
/*
 * This JavaScript program is designed to read and process numerical data
 * from standard input. It identifies patterns within sequences of numbers
 * and outputs a specific element based on those patterns.
 *
 * The input is expected to be a series of lines. Each block of data starts
 * with an integer 'n', indicating the number of elements in the subsequent
 * data line. A value of 'n=0' signals the termination of input.
 */
process.stdin.resume(); // Ensure the standard input stream remains active for data reception

// Configure the character encoding for the standard input stream to UTF-8
process.stdin.setEncoding('utf8');


/*
 * Attach an event listener to the standard input stream.
 * This function will be invoked whenever data becomes available.
 * @param {string} input - The chunk of data received from standard input.
 */
process.stdin.on('data', function (input) {
    // Declare variables for loop control and temporary storage.
    var edx, ii;

    /*
     * Pre-process the input string:
     * 1. Remove any leading or trailing whitespace.
     * 2. Split the cleaned string into an array of individual lines,
     *    using the newline character as a delimiter.
     */
    var lines = input.trim()
                     .split("\n");

    /*
     * Iterate through each line of the pre-processed input data.
     * The loop counter 'i' is intentionally manipulated within the loop
     * body to correctly advance through 'n' and its corresponding data line.
     */
    for (var i = 0; i < lines.length; ++i) {
        // Declare variables specific to the current data block.
        var n, diffCnt;
        var dataset, x1, x2;
        var map; // This array will store the differences between consecutive numbers.

        // Parse the current line as an integer 'n'. This 'n' represents the size of the upcoming dataset.
        // The post-increment 'i++' advances the line pointer to the next line, which contains the dataset itself.
        n = parseInt(lines[i++]);

        // A value of 'n' equal to 0 serves as a sentinel to indicate the end of input data.
        // If 'n' is 0, the program should cease further processing.
        if (n === 0)
            break;

        // Initialize the 'map' array. Its size is 'n + 1' to allow for 1-based indexing,
        // which might align better with the problem's logic or human readability for differences.
        map = new Array(n + 1);

        // Retrieve the actual dataset line (which is now at lines[i] due to the i++ above).
        // Trim whitespace and split it into an array of strings, using spaces as delimiters.
        dataset = lines[i].trim()
                          .split(" ");

        // Parse the second element of the dataset into 'x2'.
        x2 = parseInt(dataset[1]);

        // Parse the first element of the dataset into 'x1'.
        x1 = parseInt(dataset[0]);

        // Calculate the difference between the first two elements and store it in map[1].
        map[1] = x2 - x1;

        // Initialize 'edx' to 0. Its purpose is not explicitly used in the final output logic.
        edx = 0;

        // Initialize 'diffCnt' to 0. Its purpose is not explicitly used in the final output logic.
        diffCnt = 0;

        // Update 'x1' to the value of 'x2'. This prepares 'x1' for the next difference calculation.
        x1 = x2;

        /*
         * Iterate through the remaining elements of the dataset, starting from the third element (index 2).
         * This loop calculates the differences between all consecutive elements in the dataset
         * and populates the 'map' array with these differences.
         */
        for (ii = 2; ii < dataset.length; ++ii) {
            // Parse the current dataset element into 'x2'.
            x2 = parseInt(dataset[ii]);

            // Calculate the difference between the current 'x2' and the previous 'x1'.
            // Store this difference in the 'map' array at the current index 'ii'.
            map[ii] = x2 - x1;

            // Update 'x1' to the current 'x2' for the next iteration's calculation.
            x1 = x2;
        }


        // --- Decision block to identify and print a specific element from the dataset ---

        /*
         * Check for a specific pattern: if the first four calculated differences (map[1] through map[4])
         * are all identical. If this holds true, proceed to verify the rest of the differences.
         */
        if (map[1] === map[2] && map[2] === map[3] && map[3] === map[4]) {
            /*
             * If the initial four differences match, iterate from the fifth difference up to 'n'.
             * The goal is to find if any subsequent difference deviates from the established pattern (map[1]).
             */
            for (ii = 5; ii <= n; ++ii) {
                // If a difference is found that does not match map[1], break out of this inner loop.
                if (map[ii] != map[1])
                    break;
            }
            // Output the dataset element at the index 'ii'. This 'ii' will be either the index
            // of the first deviating element, or 'n + 1' if all elements followed the pattern.
            console.log(dataset[ii]);
        }
        /*
         * If the first condition is not met, check if the 2nd, 3rd, and 4th differences are identical.
         * This implies that the anomaly might be related to the first element of the original dataset.
         */
        else if (map[2] === map[3] && map[3] === map[4]) {
            // Output the first element of the original dataset (at index 0).
            console.log(dataset[0]);
        }
        /*
         * If previous conditions fail, check if the 1st, 2nd, and 3rd differences are identical.
         * This suggests that the anomaly might be related to the fifth element of the original dataset.
         */
        else if (map[1] === map[2] && map[2] === map[3]) {
            // Output the fifth element of the original dataset (at index 4).
            console.log(dataset[4]);
        }
        /*
         * If previous conditions are still not met, evaluate a more complex pattern:
         * Is the second difference (map[2]) minus the first dataset element (dataset[0])
         * equal to the third difference (map[3]), AND is the third difference equal to the fourth (map[4])?
         * This pattern implies that the second element of the original dataset might be the anomaly.
         */
        else if (map[2] - parseInt(dataset[0]) === map[3] && map[3] === map[4]) {
            // Output the second element of the original dataset (at index 1).
            console.log(dataset[1]);
        }
        /*
         * If none of the above conditions are met, check if the 1st and 2nd differences are equal,
         * AND if the 2nd difference is also equal to the difference between the 5th and 3rd dataset elements.
         * This implies that the fourth element of the original dataset might be the anomaly.
         */
        else if (map[1] === map[2] && map[2] === parseInt(dataset[4]) - parseInt(dataset[2])) {
            // Output the fourth element of the original dataset (at index 3).
            console.log(dataset[3]);
        }
        /*
         * As a final fallback, if all preceding conditions are false, check this specific pattern:
         * Is the 1st difference equal to the difference between the 4th and 2nd dataset elements,
         * AND is the 1st difference also equal to the 4th difference?
         * This pattern suggests that the third element of the original dataset might be the anomaly.
         */
        else if (map[1] === parseInt(dataset[3]) - parseInt(dataset[1]) && map[1] === map[4]) {
            // Output the third element of the original dataset (at index 2).
            console.log(dataset[2]);
        }
    }
});
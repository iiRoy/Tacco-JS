// This script processes input data to calculate a specific value.
// It's designed to solve a problem involving time differences and a threshold.

function Main(arg) /* Main function definition starts here */
{
    // Declare and initialize variables from the input argument.
    // The input 'arg' is expected to be a string with multiple lines.

    /*
     * N represents the number of elements or operations.
     * It's extracted from the first line, first part, and converted to a number.
     * The '- 0' trick ensures numeric conversion.
     */
    var N = arg.split("\n")[0].split(" ")[0] - 0;


    /*
     * T is the threshold value.
     * It's extracted from the first line, second part, and converted to a number.
     * Again, '- 0' is used for explicit type coercion.
     */
    var T = arg.split("\n")[0].split(" ")[1] - 0;

    // 't' is an array of numbers, parsed from the second line of the input.
    // Each element in 't' represents a specific time point in a sequence.
    var t = arg.split("\n")[1].split(" ").map(Number);

    // Initialize 'ans' (answer) to 0. This variable will accumulate the result
    // based on the logic applied within the loop.
    var ans = 0;

    // Loop through the 't' array, starting from the second element (index 1).
    // This loop calculates cumulative values based on time differences between consecutive elements.
    for (
        var i = 1; // Loop counter initialization: start from the second element
        i < N;     // Loop condition: continue as long as 'i' is less than 'N' (total count)
        i++        // Increment 'i' after each iteration to move to the next element
    )
    {
        // Calculate the difference between the current time point and the previous one.
        // This is a crucial step in the problem logic.
        if (t[i] - t[i - 1] < T) // Check if the time difference is less than the threshold T
        {
            // If the time difference is less than the threshold 'T',
            // add the actual time difference to 'ans'.
            ans += t[i] - t[i - 1]; // Accumulate the exact difference
        }
        else // The time difference is greater than or equal to T
        {
            // Otherwise (if the time difference is greater than or equal to 'T'),
            // add the threshold 'T' itself to 'ans'.
            ans += T; // Accumulate the threshold value
        }
    }

    // After the loop completes, print the final calculated answer plus the threshold 'T' to the console.
    // This is the desired output of the program as per the problem specification.
    console.log(ans + T);

    // The function doesn't explicitly return a meaningful value to its caller,
    // so a simple 'return;' statement is used to exit the function.
    return;
}

// Execute the Main function by reading input from standard input.
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
// The input is read as a UTF-8 encoded string.
Main(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
);
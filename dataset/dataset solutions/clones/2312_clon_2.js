/*
 * This module defines a primary function to process incoming data
 * and calculate a specific outcome based on numerical comparisons.
 * It demonstrates conditional logic and basic arithmetic operations.
 */
function ProcessInput(rawData) { // The main entry point for data processing.

    // First, we'll parse the raw input string into an array of strings.
    let parsedData = rawData.split(" ");

    // Extract individual numeric components from the parsed data.
    // Ensure these are treated as numbers for arithmetic operations.
    const firstVal = Number(parsedData[0]); // The initial value from the first segment.
    const secondVal = Number(parsedData[1]); // The second component for comparison.
    const thirdVal = Number(parsedData[2]); // The third component, often a target.

    // Initialize a variable to store the computed final result.
    let finalOutcome = 0;

    /*
     * We evaluate a condition based on the parity of the difference
     * between the third and second values.
     */
    if (
        (thirdVal - secondVal) % 2 === 0 // Check if the difference is an even number.
    ) {
        // If the difference is even, the outcome is half of this difference.
        finalOutcome = (thirdVal - secondVal) / 2;
    } else {
        // If the difference is odd, a different calculation path is taken.

        // Calculate a preliminary difference between the first and second values.
        let differenceOne = firstVal - secondVal;

        // Calculate a decremented version of the third value.
        let decrementVal = thirdVal - 1;

        // The final outcome in this case is the minimum of these two intermediate values.
        finalOutcome = Math.min(differenceOne, decrementVal);
    }

    // Output the computed final result to the standard console.
    console.log(finalOutcome);

} // End of the ProcessInput function definition.


/*
 * This section handles the execution of the main processing function.
 * It reads data from standard input asynchronously and passes it to the function.
 * This ensures the script can receive external data.
 */
ProcessInput(
    require("fs")
        .readFileSync(
            "/dev/stdin", // Path to standard input file.
            "utf8"       // Encoding for reading the file content.
        )
);

// End of script execution.
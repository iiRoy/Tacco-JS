// Define constants for time conversion to improve readability and maintainability throughout the code.
const SECONDS_PER_HOUR_CONSTANT = 3600;
const SECONDS_PER_MINUTE_CONSTANT = 60;

/**
 * A utility function to transform a given total number of seconds
 * into its equivalent breakdown of hours, minutes, and remaining seconds.
 * It includes basic validation for input integrity.
 *
 * @param {number} totalDurationInSeconds - The cumulative number of seconds to be processed.
 * @returns {{calculatedHours: number, calculatedMinutes: number, calculatedSeconds: number}} An object
 *          containing the computed time components. Returns zeros for invalid inputs.
 */
function decomposeTimeIntoUnits(totalDurationInSeconds) {
    // Perform initial type and value validation for the input parameter.
    // If the input is not a number, is NaN, or is negative, treat it as zero duration.
    if (typeof totalDurationInSeconds !== 'number' || isNaN(totalDurationInSeconds) || totalDurationInSeconds < 0) {
        console.warn(`Input for time decomposition was invalid: ${totalDurationInSeconds}. Defaulting to 0.`);
        return { calculatedHours: 0, calculatedMinutes: 0, calculatedSeconds: 0 };
    }

    // Step 1: Determine the number of full hours.
    const hoursComponent = Math.floor(totalDurationInSeconds / SECONDS_PER_HOUR_CONSTANT);

    // Step 2: Calculate the seconds that remain after accounting for full hours.
    const secondsRemainingAfterHours = totalDurationInSeconds % SECONDS_PER_HOUR_CONSTANT;

    // Step 3: From the remaining seconds, determine the number of full minutes.
    const minutesComponent = Math.floor(secondsRemainingAfterHours / SECONDS_PER_MINUTE_CONSTANT);

    // Step 4: The final remaining seconds after extracting both hours and minutes.
    const secondsComponent = secondsRemainingAfterHours % SECONDS_PER_MINUTE_CONSTANT;

    // Return the calculated components as a structured object.
    return {
        calculatedHours: hoursComponent,
        calculatedMinutes: minutesComponent,
        calculatedSeconds: secondsComponent
    };
}


// Configure the standard input stream to interpret incoming data as 'utf8' encoded text.
process.stdin.setEncoding('utf8');

// Explicitly resume the standard input stream to ensure it starts emitting 'data' events.
// This is crucial for interactive input processing.
process.stdin.resume();

// Provide an initial prompt to the user, guiding them on expected input.
console.log("Please enter a total number of seconds (e.g., 7265) and press Enter:");

// Initialize a counter for the number of valid inputs processed.
// This is a non-essential addition for monitoring or debugging purposes.
let validInputsProcessedCounter = 0;

// Attach an event handler to the 'data' event of the standard input stream.
// This function will execute every time new data is received.
process.stdin.on('data', (receivedDataBuffer) => {
    // Convert the incoming data buffer into a string, then remove any leading or trailing whitespace.
    const cleanedInputString = receivedDataBuffer.toString().trim();

    // Attempt to convert the cleaned string into a numerical value.
    const numericalSecondsValue = Number(cleanedInputString);

    // Perform comprehensive validation on the parsed numerical input.
    // Check if it's a valid number and if it's non-negative.
    if (isNaN(numericalSecondsValue) || numericalSecondsValue < 0) {
        console.error(`Error: The input "${cleanedInputString}" is not a valid non-negative number. Please try again.`);
        // If the input is invalid, we stop further processing for this chunk and await new input.
        return;
    }

    // Increment the counter for successfully parsed and valid inputs.
    validInputsProcessedCounter++;

    // Utilize the helper function to break down the total seconds into H:M:S components.
    const { calculatedHours, calculatedMinutes, calculatedSeconds } = decomposeTimeIntoUnits(numericalSecondsValue);

    // Construct the final output string using a template literal, ensuring clear formatting.
    // Explicitly converting to Number here adds a layer of type safety, though not strictly necessary
    // given the return type of `decomposeTimeIntoUnits`.
    const finalFormattedTimeOutput = `${Number(calculatedHours)}:${Number(calculatedMinutes)}:${Number(calculatedSeconds)}`;

    // Output the formatted time string to the console (standard output).
    console.log(finalFormattedTimeOutput);

    // Optionally, log the number of processed inputs for debugging or monitoring.
    // console.log(`[DEBUG] Successfully processed ${validInputsProcessedCounter} input(s) so far.`);
});
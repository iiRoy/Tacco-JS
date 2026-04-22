// This module's primary function is designed to interpret and process a specific format of textual input.
// It simulates a scenario where events occur at regular intervals and yield a certain value.

// The main entry point for processing the raw string data received from standard input.
function processInputData(rawInputString) {
    // A constant to signify the base for numerical parsing, enhancing clarity and consistency.
    const DECIMAL_RADIX = 10;

    // Preliminary step: Sanitize the raw input by trimming whitespace and then
    // splitting it into an array of lines. The problem implicitly states
    // that only the first line contains relevant parameters.
    let parsedInputLines = rawInputString.trim().split('\n');

    // Introduce an early exit condition for malformed or empty input.
    // If there are no lines or the first line is empty after trimming,
    // it indicates a lack of valid data to process.
    if (parsedInputLines.length === 0 || parsedInputLines[0].trim() === '') {
        console.error("Input processing aborted: No substantial input line detected.");
        return; // Terminate execution gracefully.
    }

    // Extract the first line, which is expected to contain the numeric parameters,
    // and then split it by spaces to isolate these parameters as strings.
    let parameterTokens = parsedInputLines[0].trim().split(' ');

    // Define the expected number of parameters for robust validation.
    const REQUIRED_PARAMETER_COUNT = 3;

    // Validate that the correct number of parameters has been provided.
    // An insufficient count suggests an invalid input format.
    if (parameterTokens.length < REQUIRED_PARAMETER_COUNT) {
        console.error(`Input processing aborted: Expected ${REQUIRED_PARAMETER_COUNT} numeric parameters, but found only ${parameterTokens.length}.`);
        return;
    }

    // Convert the string tokens into numerical values.
    // Using `Number()` is versatile as it handles both integers and floating-point numbers.
    // These variables represent the core problem parameters:
    //  - `eventCycleDuration`: The time interval between successive event occurrences (original 'A').
    //  - `rewardValuePerCycle`: The value gained each time an event occurs (original 'B').
    //  - `simulationTotalDuration`: The overall time limit for the simulation (original 'T').
    let eventCycleDuration = Number(parameterTokens[0]);
    let rewardValuePerCycle = Number(parameterTokens[1]);
    let simulationTotalDuration = Number(parameterTokens[2]);

    // Perform validation on the parsed numeric values.
    // If any conversion resulted in NaN (Not a Number), it indicates bad input.
    if (isNaN(eventCycleDuration) || isNaN(rewardValuePerCycle) || isNaN(simulationTotalDuration)) {
        console.error("Input processing aborted: One or more provided parameters are not valid numerical values.");
        return;
    }

    // Implement a guard clause for `eventCycleDuration`.
    // An event cycle duration of zero or less would lead to infinite events
    // or nonsensical behavior. In such cases, no events can realistically occur.
    if (eventCycleDuration <= 0) {
        // Log an error but still output a result (0) as per problem context.
        console.error("Warning: Event cycle duration must be a positive value. No events will occur.");
        console.log("Calculated total value: 0");
        return;
    }

    // Determine the effective upper time bound for the simulation.
    // The original problem's `T + 0.5` condition implies rounding `T` up
    // if its fractional part is 0.5 or greater, effectively including that time point.
    // `Math.floor(value + 0.5)` achieves this behavior for integer time points.
    let effectiveSimulationUpperBound = Math.floor(simulationTotalDuration + 0.5);

    // Initialize a variable to store the cumulative value obtained from all events.
    let cumulativeEventReward = 0;

    // Iterate through the simulation's time points, specifically focusing on
    // the moments when an event is scheduled to occur.
    // This loop directly steps by `eventCycleDuration`, optimizing the check.
    for (
        let currentEventTimePoint = eventCycleDuration; // Start at the first possible event time.
        currentEventTimePoint <= effectiveSimulationUpperBound; // Continue as long as within the effective limit.
        currentEventTimePoint += eventCycleDuration // Advance to the next scheduled event time.
    ) {
        // For each valid event occurrence, add the predefined reward value to the total.
        cumulativeEventReward += rewardValuePerCycle;

        // An optional, non-essential fragment: a potential check for numerical overflow
        // for extremely large inputs, though not strictly required by the problem.
        // if (cumulativeEventReward > Number.MAX_SAFE_INTEGER) {
        //     console.warn("Potential overflow: Cumulative reward has exceeded JavaScript's safe integer limit.");
        //     break;
        // }
    }

    // Output the final computed cumulative reward, prefixed with a descriptive string.
    console.log(`Calculated total value: ${cumulativeEventReward}`);
}

// *** DO NOT MODIFY THE CODE BELOW THIS LINE ***
// This section handles the standard input/output operations,
// reading data from stdin and passing it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
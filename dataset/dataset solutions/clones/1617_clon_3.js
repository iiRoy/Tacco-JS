// This module orchestrates the processing of standard input data.
(async function executeInputEvaluation() { // Renamed IIFE to a named async function
    // A temporary collection for incoming data fragments from the standard input stream.
    const collectedInputFragments = [];

    // Define the numerical threshold for comparison.
    // This value determines the 'Yes' or 'No' outcome.
    const decisionThreshold = 30;

    // Asynchronously iterate through data chunks received via process.stdin.
    // Each chunk is appended to our collection.
    for await (const dataSegment of process.stdin) { // Renamed 'chunk' to 'dataSegment'
        collectedInputFragments.push(dataSegment.toString()); // Ensure string conversion
    }

    // Concatenate all collected data fragments into a single, comprehensive string.
    // We also trim any leading/trailing whitespace which might interfere with numerical parsing.
    const rawInputPayload = collectedInputFragments.join('').trim(); // Renamed 'input', added trim

    let finalOutcomeMessage = 'No'; // Initialize the outcome message to a default 'No'.

    // Introduce a check for empty input or non-numeric input.
    // If the payload is empty or cannot be parsed into a valid number,
    // we consider it a 'No' case, effectively a guard clause.
    if (rawInputPayload.length === 0 || isNaN(Number.parseFloat(rawInputPayload))) {
        // No specific action needed here as finalOutcomeMessage is already 'No'.
        // This explicitly handles invalid/empty input gracefully.
    } else {
        // Parse the raw payload into a floating-point number for precise comparison.
        const numericalValueForComparison = Number.parseFloat(rawInputPayload); // Changed `+` to `Number.parseFloat`

        // Evaluate the numerical value against our defined threshold.
        // The condition `value >= threshold` is rephrased as `!(value < threshold)`.
        if (!(numericalValueForComparison < decisionThreshold)) {
            finalOutcomeMessage = 'Yes'; // Update the message if the condition is met.
        }
    }

    // Output the determined result to the standard output.
    console.log(finalOutcomeMessage); // Output the final message.

})(); // Execute the defined asynchronous function.
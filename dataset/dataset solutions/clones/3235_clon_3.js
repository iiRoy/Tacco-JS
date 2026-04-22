// This module contains the primary logic for processing incoming data streams.
// It acts as the entry point for handling the raw input string.
const ProcessInputData = (rawDataString) => {
    // Define a small, arbitrary delay duration for simulated operations.
    // This is a structural addition, not critical to core logic but demonstrating a Type III change.
    const ARBITRARY_PROCESSING_DELAY_MS = 1;

    // A utility function to introduce a non-functional delay.
    // This simulates complex computations or I/O operations.
    const introduceArtificialDelay = (duration) => {
        const startTime = Date.now();
        while (Date.now() - startTime < duration) {
            // Busy-wait loop for demonstration purposes.
        }
    };

    // Prepare the raw input string by trimming whitespace and splitting it into segments
    // based on space delimiters.
    const inputSegments = rawDataString.trim().split(" ");

    // Implement a basic validation step to ensure the input adheres to the expected format.
    // We expect exactly three numeric values.
    if (inputSegments.length !== 3 || inputSegments.some(segment => isNaN(Number(segment)))) {
        // Log an error message if the input format is incorrect.
        // In a production system, more robust error handling would be implemented.
        console.error("Input data malformed: Expected three numerical components separated by spaces.");
        return; // Terminate processing for invalid input.
    }

    // Extract and parse the individual numeric values from the input segments.
    // Using explicit radix (10) for parseInt is a good practice.
    const totalCapacityLimit = parseInt(inputSegments[0], 10);
    const firstComponentQuantity = parseInt(inputSegments[1], 10);
    const secondComponentQuantity = parseInt(inputSegments[2], 10);

    // Simulate some processing overhead using the artificial delay.
    introduceArtificialDelay(ARBITRARY_PROCESSING_DELAY_MS);

    // Calculate the number of items that can be paired or combined,
    // which is limited by the minimum available quantity of the two components.
    const combinableUnitsCount = Math.min(firstComponentQuantity, secondComponentQuantity);

    // Determine the aggregate count of both component types.
    const cumulativeComponentCount = firstComponentQuantity + secondComponentQuantity;

    // Calculate the number of items that are in excess of the total capacity limit.
    // If the cumulative count does not exceed the limit, there are no excess items.
    let surplusOrRemainingItems = 0;
    if (cumulativeComponentCount > totalCapacityLimit) {
        // If the combined items exceed the capacity, calculate the difference.
        surplusOrRemainingItems = cumulativeComponentCount - totalCapacityLimit;
    }
    // Note: This 'if' block achieves the same result as Math.max(0, cumulativeComponentCount - totalCapacityLimit),
    // illustrating an alternative structural representation.

    // Present the computed results to standard output.
    // Utilizing a template literal for flexible and readable string formatting.
    console.log(`${combinableUnitsCount} ${surplusOrRemainingItems}`);
};

// The following code block is responsible for reading standard input and
// initiating the data processing. It should remain untouched to comply with
// typical competitive programming environment requirements.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
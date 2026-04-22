// This script processes interaction data to determine the spread of a 'non-infected' status.
// It reads multiple test cases from standard input.

process.stdin.resume(); // Ensure stdin is open and won't close automatically
process.stdin.setEncoding("utf8"); // Set the character encoding for incoming data

/**
 * Main handler for incoming data chunks from stdin.
 * This function processes the entire input buffer when it's received.
 * @param {string} inputBuffer The chunk of data received from standard input.
 */
process.stdin.on("data", (inputBuffer) => {
    // Split the entire input buffer into individual lines and clean up leading/trailing whitespace.
    const allInputLines = inputBuffer.trim().split('\n');
    let currentLineIndex = 0; // Pointer to the current line being processed from `allInputLines`.

    // Define a constant for the initial entity that is always considered 'not healthy'.
    const INITIAL_NON_HEALTHY_ENTITY_ID = 0;

    // Loop through test cases until an explicit termination condition is met.
    // The termination condition is a line with two zeros (0 0) for entityCount and interactionCount.
    for (;;) {
        // Read the first line of the current test case, which specifies the number of entities and interactions.
        // It's crucial to increment the line index immediately after reading to move to the next line.
        if (currentLineIndex >= allInputLines.length) {
            // If we've run out of input lines unexpectedly, break the processing loop.
            break;
        }
        const dimensionTokens = allInputLines[currentLineIndex++].split(/ +/).map(Number);

        // Perform basic input validation for the dimensions line to ensure it has two numbers.
        if (dimensionTokens.length !== 2) {
            // For malformed input, we might choose to skip this test case, log an error, or terminate.
            // For this context, we'll break, assuming well-formed input or graceful termination.
            break;
        }

        const entityCount = dimensionTokens[0];
        const interactionCount = dimensionTokens[1];

        // Check for the termination condition (0 0).
        if (entityCount === 0 && interactionCount === 0) {
            break; // Exit the main loop as all test cases have been processed.
        }

        // Initialize the health status for all entities.
        // By default, all entities are considered 'healthy' (represented by `true`).
        const healthStatusList = new Array(entityCount).fill(true);

        // The entity at `INITIAL_NON_HEALTHY_ENTITY_ID` is always marked as 'not healthy' (false) initially.
        // A guard clause ensures this operation is safe for very small `entityCount` values.
        if (entityCount > INITIAL_NON_HEALTHY_ENTITY_ID) {
            healthStatusList[INITIAL_NON_HEALTHY_ENTITY_ID] = false;
        }

        // Collect all interaction records for the current test case.
        // Each record consists of a timestamp and the identifiers of two entities involved.
        const interactionEvents = [];
        for (let i = 0; i < interactionCount; ++i) {
            if (currentLineIndex >= allInputLines.length) {
                // If input ends prematurely while reading interaction events, break.
                break;
            }
            const eventTokens = allInputLines[currentLineIndex++].split(/ +/).map(Number);

            // Validate that the event line contains the expected three numbers.
            if (eventTokens.length < 3) {
                // If an event line is malformed, skip it and move to the next.
                continue;
            }

            // Store the event details as an object for better readability and maintainability.
            // Entity identifiers are adjusted from 1-based (problem statement) to 0-based indexing.
            interactionEvents.push({
                timestamp: eventTokens[0],
                sourceEntityId: eventTokens[1] - 1,
                targetEntityId: eventTokens[2] - 1
            });
        }

        // Sort the collected interaction events by their timestamp in ascending order.
        // This ensures that events are processed chronologically, which is crucial for correct state propagation.
        interactionEvents.sort((eventA, eventB) => eventA.timestamp - eventB.timestamp);

        // Process each interaction event to update the health statuses of entities.
        // The rule is: if a 'source entity' is 'not healthy', then the 'target entity' in the interaction also becomes 'not healthy'.
        for (const currentEvent of interactionEvents) {
            const { sourceEntityId, targetEntityId } = currentEvent;

            // Before accessing array elements, ensure that the entity IDs are valid indices.
            if (sourceEntityId >= 0 && sourceEntityId < entityCount &&
                targetEntityId >= 0 && targetEntityId < entityCount) {

                // If the source entity involved in this interaction has a 'not healthy' status (false),
                // then propagate this 'not healthy' status to the target entity.
                if (healthStatusList[sourceEntityId] === false) {
                    healthStatusList[targetEntityId] = false;
                }
            }
        }

        // After processing all interactions for the current test case,
        // count the total number of entities that have a 'not healthy' status.
        let totalNonHealthyEntities = 0;
        for (const statusIndicator of healthStatusList) {
            if (statusIndicator === false) {
                totalNonHealthyEntities += 1; // Increment the counter for each 'not healthy' entity.
            }
        }

        // Output the final count of 'not healthy' entities for the current test case.
        console.log(totalNonHealthyEntities);
    }
});
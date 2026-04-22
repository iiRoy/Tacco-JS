function ProcessInputData(rawInputText) {
    // Validate the incoming raw text data.
    if (!rawInputText || typeof rawInputText !== 'string' || rawInputText.trim().length === 0) {
        // If input is invalid or empty, we'll log an issue and cease processing.
        console.error("Error: Input data is missing or malformed. Cannot proceed.");
        return;
    }

    // A simple helper for converting string to integer with base 10.
    const toInteger = (str) => parseInt(str, 10);

    // Split the entire input block into individual lines.
    const dataLines = rawInputText.trim().split("\n");

    // The very first line holds critical simulation parameters.
    const simulationSettings = dataLines[0].split(" ");
    const numEntities = toInteger(simulationSettings[0]); // N: Total number of entities in the system.
    const circuitLength = toInteger(simulationSettings[1]); // L: The total length of the circular track.
    const duration = toInteger(simulationSettings[2]); // T: The time duration for which entities move.

    // If there are no entities, there's nothing to simulate or output.
    if (numEntities <= 0) {
        return;
    }

    // Allocate arrays to hold processed data for each entity.
    // Using `Array.from` for explicit sizing and default values.
    const initialCoordinates = Array.from({ length: numEntities }, () => 0); // Original 'x'
    const travelDirections = Array.from({ length: numEntities }, () => 0); // Original 'w' (will be converted to -1 or 1)
    const computedFinalPositions = Array.from({ length: numEntities }, () => 0); // Original 'afx'
    const relativeOverlapCounts = Array.from({ length: numEntities }, () => 0); // Original 'change'

    // Parse the initial state of each entity from subsequent input lines.
    // Loop from 0 to numEntities-1, mapping to inputLines[1] through inputLines[numEntities].
    for (let entityIndex = 0; entityIndex < numEntities; entityIndex++) {
        const entityState = dataLines[entityIndex + 1].split(" ");
        initialCoordinates[entityIndex] = toInteger(entityState[0]);
        // Convert the input direction (1 or 2) into a numeric factor (1 for positive, -1 for negative).
        travelDirections[entityIndex] = (toInteger(entityState[1]) === 1) ? 1 : -1;
        // Initialize collision counter for current entity.
        relativeOverlapCounts[entityIndex] = 0;
    }

    // --- Stage 1: Determine each entity's position after time 'duration' without considering collisions. ---
    // Positions are calculated on a continuous line, then wrapped around the circular track.
    for (let currentEntity = 0; currentEntity < numEntities; currentEntity++) {
        // Calculate the raw displaced position.
        let displacedPosition = initialCoordinates[currentEntity] + (duration * travelDirections[currentEntity]);
        // Normalize the position to be within the [0, circuitLength) range.
        // The `(X % L + L) % L` pattern correctly handles negative results from JavaScript's `%` operator.
        let normalizedPosition = (displacedPosition % circuitLength + circuitLength) % circuitLength;
        computedFinalPositions[currentEntity] = normalizedPosition;
    }

    // --- Stage 2: Calculate how many "effective laps" each entity makes relative to the first entity. ---
    // This accounts for how their relative ordering might change due to their movements.
    const primaryEntityDirection = travelDirections[0];
    const doubleDuration = duration * 2; // Pre-calculate for optimization.

    for (let currentEntity = 1; currentEntity < numEntities; currentEntity++) {
        // If both entities move in the same direction, their relative order is preserved,
        // so no "overlap" or "crossing" occurs that would change their relative index.
        if (primaryEntityDirection === travelDirections[currentEntity]) {
            relativeOverlapCounts[currentEntity] = 0;
        } else {
            // Entities are moving towards each other (or away, but effectively crossing points).
            let effectiveCrossingDistance = doubleDuration;

            let referencePointA, referencePointB;
            // Establish two points for distance calculation based on the primary entity's movement.
            if (primaryEntityDirection === 1) { // Primary entity moves clockwise
                referencePointA = initialCoordinates[0];
                referencePointB = initialCoordinates[currentEntity];
            } else { // Primary entity moves counter-clockwise
                referencePointA = initialCoordinates[currentEntity];
                referencePointB = initialCoordinates[0];
            }

            // Adjust the effective crossing distance based on their initial separation.
            if (referencePointB >= referencePointA) {
                effectiveCrossingDistance -= (referencePointB - referencePointA);
            } else {
                effectiveCrossingDistance -= (circuitLength - referencePointA + referencePointB);
            }

            // If effective distance is positive, a crossing occurred.
            if (effectiveCrossingDistance > 0) {
                relativeOverlapCounts[currentEntity]++; // Count the initial crossing.
                // Add any additional full rotations (laps) they effectively crossed.
                relativeOverlapCounts[currentEntity] += Math.floor(effectiveCrossingDistance / circuitLength);
            }
            // If `effectiveCrossingDistance` is zero or negative, no additional laps are added.
        }
    }

    // --- Stage 3: Aggregate the total relative shift for the primary entity. ---
    // This sum determines the overall rotational shift for the final output sequence.
    let cumulativeRotationShift = 0;
    for (let k = 1; k < numEntities; k++) {
        cumulativeRotationShift += relativeOverlapCounts[k];
    }

    // Adjust the cumulative shift based on the primary entity's original direction.
    if (primaryEntityDirection === -1) { // If entity 0 moved counter-clockwise
        // Ensure the modulo result is positive by adding numEntities before the final modulo.
        cumulativeRotationShift = (numEntities - (cumulativeRotationShift % numEntities) + numEntities) % numEntities;
    } else {
        cumulativeRotationShift %= numEntities; // Normalize shift to be within [0, numEntities-1].
    }

    // --- Stage 4: Prepare the sorted positions and identify the logical starting point for output. ---
    // Store the exact final position of the first entity before sorting.
    const firstEntityFinalCoordinate = computedFinalPositions[0];

    // Create a new array and sort it. This is crucial for determining the final output order.
    // Using `slice()` creates a shallow copy, preventing modification of `computedFinalPositions`.
    const orderedFinalPositions = computedFinalPositions.slice().sort((valA, valB) => valA - valB);

    let finalOutputStartIndex = -1; // Initialize with an invalid index.

    // Search for the first entity's final position within the *sorted* array.
    // Special handling is required for duplicate positions to ensure consistent behavior.
    for (let sortedIdx = 0; sortedIdx < numEntities; sortedIdx++) {
        if (orderedFinalPositions[sortedIdx] === firstEntityFinalCoordinate) {
            // Check the next element (wrapping around for the last element).
            const nextElementIdx = (sortedIdx + 1) % numEntities;
            if (orderedFinalPositions[nextElementIdx] !== firstEntityFinalCoordinate) {
                // This is the last occurrence of this value in a block of duplicates, or a unique value.
                // This index is typically chosen if the primary entity moved clockwise.
                finalOutputStartIndex = sortedIdx;
                break;
            } else {
                // We are inside a block of duplicate values. The choice depends on the primary entity's direction.
                if (primaryEntityDirection === 1) { // Clockwise
                    finalOutputStartIndex = sortedIdx + 1; // Take the element *after* this block.
                } else { // Counter-clockwise
                    finalOutputStartIndex = sortedIdx; // Take this element (start of the block).
                }
                break; // Found the appropriate index.
            }
        }
    }

    // If for some reason `finalOutputStartIndex` wasn't found (shouldn't happen with valid inputs), default to 0.
    if (finalOutputStartIndex === -1) {
        console.warn("Warning: Could not precisely locate the primary entity's position in the sorted array. Defaulting to index 0.");
        finalOutputStartIndex = 0;
    }

    // Apply the cumulative rotation shift to the determined start index.
    // Ensure the result remains within valid array bounds and is positive.
    finalOutputStartIndex = (numEntities + finalOutputStartIndex - cumulativeRotationShift) % numEntities;

    // --- Stage 5: Output the final sequence of positions. ---
    // Print each position, starting from the adjusted `finalOutputStartIndex` and wrapping around.
    for (let outputCounter = 0; outputCounter < numEntities; outputCounter++) {
        const currentPrintIndex = (finalOutputStartIndex + outputCounter) % numEntities;
        console.log(orderedFinalPositions[currentPrintIndex]);
    }
}

// The entry point for execution, reading from standard input.
// This part of the code typically remains stable as it handles I/O.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
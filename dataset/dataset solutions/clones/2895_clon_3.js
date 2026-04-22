'use strict'

/**
 * Orchestrates the processing of input data to derive specific numerical results
 * and an ordered assignment of values to entities.
 * This function handles input parsing, numerical computations,
 * graph-like structure analysis, and final output generation.
 *
 * @param {string} rawInputData - The raw string input, typically from stdin.
 */
function processInputData(rawInputData) {
    // --- Phase 1: Input Data Acquisition and Initial Validation ---
    // Splitting the entire input into individual lines for easier processing.
    const inputLines = rawInputData.split('\n');

    // Basic validation: ensure input is not empty or malformed.
    if (!inputLines || inputLines.length < 2) {
        // Log an error or handle gracefully; for a clone, we assume valid input format.
        // console.error("Input data is insufficient or malformed.");
        return;
    }

    // Extracting the total number of primary entities from the first line.
    // Using parseInt with radix for robust conversion.
    const totalEntityCount = parseInt(inputLines[0], 10);

    // Guard against invalid entity count.
    if (isNaN(totalEntityCount) || totalEntityCount <= 0) {
        // console.error("Invalid total entity count provided.");
        return;
    }

    // Parsing connection definitions (edges) for the entities.
    // These lines represent relationships between entities, crucial for layer assignment.
    // The slice range is from the second line (index 1) up to, but not including,
    // the line corresponding to totalEntityCount (which holds numeric values).
    const connectivityRecords = inputLines
        .slice(1, totalEntityCount)
        .map(lineSegment => lineSegment.split(' ').map(strVal => parseInt(strVal, 10)));

    // Parsing the list of numerical values from the line immediately following
    // the connectivity records.
    const inputNumericValues = inputLines[totalEntityCount]
        .split(' ')
        .map(strVal => parseInt(strVal, 10));

    // --- Phase 2: Numerical Value Transformation and Calculation ---
    // The original logic sorts values in descending order and calculates
    // the sum of all values except the largest one.

    // Create a mutable copy of the numeric values for sorting.
    const mutableValues = [...inputNumericValues];

    // Sort the numerical values in descending order.
    // This places the largest value at the beginning of the array.
    mutableValues.sort((primaryVal, secondaryVal) => secondaryVal - primaryVal);

    // Calculate the sum of all values.
    let cumulativeSum = 0;
    for (let i = 0; i < mutableValues.length; i++) {
        cumulativeSum += mutableValues[i];
    }

    // Determine the largest value (which is now the first element after sorting).
    const topValue = mutableValues[0];

    // Compute the sum of all values excluding the largest one.
    const adjustedSum = cumulativeSum - topValue;

    // Output the first derived numerical result.
    console.log(adjustedSum);

    // --- Phase 3: Entity Graph Construction and Depth Level Assignment ---
    // This section models entities and assigns them a "depth level" based on connections.

    // A Map is used for efficient access to entity properties by their ID.
    // Each entity object stores its ID and a calculated depth level.
    const entityRegistry = new Map();

    // Initialize all entities with a default depth level.
    // A value of -1 indicates that the depth has not yet been determined.
    for (let entityId = 1; entityId <= totalEntityCount; entityId++) {
        entityRegistry.set(entityId, { entityIdentifier: entityId, hierarchicalLevel: -1 });
    }

    // Iterate through the connectivity records to establish hierarchical levels.
    // The assumption is that `sourceId` is a parent to `destinationId`.
    for (const currentRecord of connectivityRecords) {
        const [sourceId, destinationId] = currentRecord;

        // Retrieve the entity objects from the registry.
        const sourceEntity = entityRegistry.get(sourceId);
        const destinationEntity = entityRegistry.get(destinationId);

        // If the source entity's level is undetermined, it's considered a root ancestor
        // for this particular connection, so its level is initialized to 0.
        if (sourceEntity.hierarchicalLevel === -1) {
            sourceEntity.hierarchicalLevel = 0;
        }

        // The destination entity's level is one greater than its source (parent).
        destinationEntity.hierarchicalLevel = sourceEntity.hierarchicalLevel + 1;

        // Update the entities in the registry (though objects are passed by reference,
        // explicitly setting might be clearer if map values were primitives).
        entityRegistry.set(sourceId, sourceEntity);
        entityRegistry.set(destinationId, destinationEntity);
    }

    // Ensure all entities have a defined hierarchical level, even if they weren't
    // part of any connectivity record or appeared only as a child.
    // Any entity still at -1 is treated as an independent root.
    for (const entity of entityRegistry.values()) {
        if (entity.hierarchicalLevel === -1) {
            entity.hierarchicalLevel = 0;
        }
    }

    // Convert the map values (entity objects) into an array for sorting.
    const orderedEntities = Array.from(entityRegistry.values());

    // Sort the entities primarily by their hierarchical level in ascending order.
    // Entities at the same level maintain their relative order from initialization/map iteration.
    orderedEntities.sort((entA, entB) => entA.hierarchicalLevel - entB.hierarchicalLevel);

    // --- Phase 4: Final Value Assignment and Output ---
    // Assign the sorted numerical values to entities based on their sorted hierarchical order.

    // Initialize an array to store the final assigned values,
    // indexed by (entityId - 1) to match 0-based array indexing.
    const finalAssignmentArray = new Array(totalEntityCount);

    // Iterate through the hierarchically sorted entities.
    // The first entity (lowest level) gets the first (largest) value from `mutableValues`.
    // The second entity gets the second value, and so on.
    for (let assignmentIndex = 0; assignmentIndex < totalEntityCount; assignmentIndex++) {
        const currentEntity = orderedEntities[assignmentIndex];
        const assignedValue = mutableValues[assignmentIndex];

        // Place the assigned value into the correct position in the result array,
        // mapping entity ID (1-based) to array index (0-based).
        finalAssignmentArray[currentEntity.entityIdentifier - 1] = assignedValue;
    }

    // Output the final assignments as a space-separated string.
    console.log(finalAssignmentArray.join(' '));
}

// Standard execution boilerplate for competitive programming environments.
// Reads input from /dev/stdin, decodes it as UTF-8, and removes leading/trailing whitespace.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
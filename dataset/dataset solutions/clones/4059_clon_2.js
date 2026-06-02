function ProcessInputData(rawData) {
    // A mapping to store the computed numerical positions for various entities.
    // Keys represent entity identifiers, and values are their assigned coordinates.
    const entityValues = {};

    // A boolean flag indicating whether all processed relationships are consistent.
    let isConsistent = true;

    // The initial set of statements to be processed.
    // The input string is split by newlines, and the first line (often metadata) is skipped.
    let pendingStatements = rawData.split(/\n/).slice(1);

    // A temporary array to hold statements that could not be resolved in the current pass.
    let deferredStatements = [];

    // Continue iterating as long as there are statements awaiting resolution.
    // This allows for multiple passes to handle dependencies.
    while (pendingStatements.length !== 0) {
        // Reset the deferred statements list for each new processing pass.
        deferredStatements = [];

        // Process each statement in the current batch.
        pendingStatements.forEach((currentStatement, statementIndex) => {
            // Parse the current line: split by spaces and convert each part to a number.
            // The expected format is three numbers: entityA, entityB, difference.
            const parsedNumbers = currentStatement.split(/\s/).map(numStr => {
                return Number(numStr);
            });

            // Scenario 1: Both entities involved in the statement already have assigned values.
            // Verify if the stated difference matches the actual difference between their values.
            if (entityValues[parsedNumbers[0]] !== undefined && entityValues[parsedNumbers[1]] !== undefined) {
                isConsistent = (entityValues[parsedNumbers[1]] - entityValues[parsedNumbers[0]]) === parsedNumbers[2];
            }
            // Scenario 2: Only the first entity has an assigned value.
            // Calculate the value for the second entity based on the first and the given difference.
            else if (entityValues[parsedNumbers[0]] !== undefined) {
                entityValues[parsedNumbers[1]] = entityValues[parsedNumbers[0]] + parsedNumbers[2];
            }
            // Scenario 3: Only the second entity has an assigned value.
            // Calculate the value for the first entity based on the second and the given difference.
            else if (entityValues[parsedNumbers[1]] !== undefined) {
                entityValues[parsedNumbers[0]] = entityValues[parsedNumbers[1]] - parsedNumbers[2];
            }
            // Scenario 4: Neither entity has an assigned value, and this is the very first statement
            // encountered in the current processing pass.
            // Establish an initial reference point for the first entity.
            else if (statementIndex === 0) {
                let initialValue = 0; // Start with a base value of zero.
                // Increment the base value until an unused key is found in the entity map.
                while (entityValues[initialValue] !== undefined) {
                    initialValue++;
                }
                // Assign this unique initial value to the first entity.
                entityValues[parsedNumbers[0]] = initialValue;
                // Then, calculate the value for the second entity using the newly assigned first entity's value.
                entityValues[parsedNumbers[1]] = entityValues[parsedNumbers[0]] + parsedNumbers[2];
            }
            // Scenario 5: Neither entity has an assigned value, and it's not the first statement in the pass.
            // This statement cannot be resolved yet; defer it to a subsequent pass.
            else {
                deferredStatements.push(currentStatement);
            }
        });

        // Replace the current set of pending statements with those that were deferred.
        // If no statements were deferred, the loop will naturally terminate.
        pendingStatements = deferredStatements;
    }

    // Output the final determination of consistency.
    // Prints 'Yes' if all relationships were found to be consistent, otherwise 'No'.
    console.log(isConsistent ? 'Yes' : 'No');
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

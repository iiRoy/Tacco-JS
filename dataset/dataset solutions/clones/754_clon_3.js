// This script processes a series of input operations to resolve a final key
// and then calculates a specific term in an arithmetic progression.

// Standard Node.js input handling for competitive programming environments.
// It synchronously reads the entire content of standard input as a UTF-8 string.
const rawInputDataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: first, remove any leading/trailing whitespace,
// then split the entire string into an array of individual lines.
let processingInstructionLines = rawInputDataStream.trim().split('\n');

// The initial line, which often represents a count of total entries, is consumed here.
// In the original problem's logic, this value was not utilized, so it's discarded.
// This demonstrates a Type III deletion of an unused code fragment.
processingInstructionLines.shift(); // Original 'n' variable was here.

// Extract the foundational parameters for the arithmetic sequence.
// The next line is expected to contain two space-separated numbers:
// the starting value (first term) and the common difference (step size).
const [initialSequenceValue, commonStepSize] = processingInstructionLines.shift().split(' ').map(Number);

// Initialize an empty JavaScript object to serve as a dynamic key-value mapping registry.
// This registry will store relationships between various identifiers based on input operations.
const identifierMappingRegistry = {};

// Read the total number of mapping operations that need to be performed.
// The value is parsed as an integer from the next line of input.
const totalMappingOperations = parseInt(processingInstructionLines.shift(), 10);

/**
 * Helper function to apply complex bidirectional mapping rules to the registry.
 * This function encapsulates the logic for operation type '1', which involves
 * creating or modifying reciprocal relationships between two keys.
 * @param {Object} registry The mapping object where identifiers are stored.
 * @param {string} firstKey The primary identifier for the operation.
 * @param {string} secondKey The secondary identifier for the operation.
 */
function manageReciprocalIdentifierLink(registry, firstKey, secondKey) {
    // Check for the existence of both keys in the registry for conditional logic.
    const isFirstKeyPresent = Object.prototype.hasOwnProperty.call(registry, firstKey);
    const isSecondKeyPresent = Object.prototype.hasOwnProperty.call(registry, secondKey);

    if (!isFirstKeyPresent && !isSecondKeyPresent) {
        // Scenario 1: Neither key exists. Create new direct reciprocal mappings.
        registry[firstKey] = secondKey;
        registry[secondKey] = firstKey;
    } else if (isFirstKeyPresent && !isSecondKeyPresent) {
        // Scenario 2: Only the first key exists. The second key inherits the first key's current mapping,
        // and the first key is then updated to map directly to the second key.
        registry[secondKey] = registry[firstKey];
        registry[firstKey] = secondKey;
    } else if (!isFirstKeyPresent && isSecondKeyPresent) {
        // Scenario 3: Only the second key exists. The first key inherits the second key's current mapping,
        // and the second key is then updated to map directly to the first key.
        registry[firstKey] = registry[secondKey];
        registry[secondKey] = firstKey;
    } else {
        // Scenario 4: Both keys exist. Their currently mapped values are swapped.
        // This is a direct exchange of values that firstKey and secondKey point to.
        let temporaryValueHolder = registry[firstKey];
        registry[firstKey] = registry[secondKey];
        registry[secondKey] = temporaryValueHolder;
    }
}

// Loop through each defined mapping operation.
// The loop counter `opIteration` is used for tracking progress.
for (let opIteration = 0; opIteration < totalMappingOperations; opIteration++) {
    // Parse the current line of operation instructions.
    // Each line contains an operation type (a string) and two identifier keys.
    const [operationCode, sourceIdentifier, targetIdentifier] = processingInstructionLines.shift().split(' ');

    // Based on the operation code, perform either a bidirectional or unidirectional update.
    if (operationCode === '1') {
        // If the operation code is '1', invoke the helper function to handle the
        // complex logic of reciprocal identifier linking or value swapping.
        manageReciprocalIdentifierLink(identifierMappingRegistry, sourceIdentifier, targetIdentifier);
    } else {
        // For any other operation code (e.g., '0' or default), perform a simpler
        // unidirectional mapping update for the source identifier.
        // The source identifier will map to the target identifier's existing value
        // if the target identifier is already present in the registry.
        // Otherwise, it will map directly to the target identifier string itself.
        if (Object.prototype.hasOwnProperty.call(identifierMappingRegistry, targetIdentifier)) {
            // If targetIdentifier is found, sourceIdentifier points to what targetIdentifier points to.
            identifierMappingRegistry[sourceIdentifier] = identifierMappingRegistry[targetIdentifier];
        } else {
            // If targetIdentifier is not found, sourceIdentifier points directly to the targetIdentifier string.
            identifierMappingRegistry[sourceIdentifier] = targetIdentifier;
        }
    }
}

// After all mapping operations are processed, retrieve the final identifier
// from the input lines that needs to be resolved.
let finalQueryIdentifier = processingInstructionLines.shift();

// Perform a lookup in the identifier mapping registry.
// If the final query identifier has an associated mapping, update its value.
if (Object.prototype.hasOwnProperty.call(identifierMappingRegistry, finalQueryIdentifier)) {
    finalQueryIdentifier = identifierMappingRegistry[finalQueryIdentifier];
}

// Convert the resolved identifier (which might still be a string) into a numeric type.
// This number represents the 'k' in the arithmetic progression formula, indicating the term's index.
const arithmeticProgressionTermIndex = Number(finalQueryIdentifier);

// Calculate the value of the specified term in the arithmetic progression.
// The formula for the Nth term is: A + (N - 1) * D
// Where A is initialSequenceValue, N is arithmeticProgressionTermIndex, and D is commonStepSize.
const computedProgressionResult = initialSequenceValue + ((arithmeticProgressionTermIndex - 1) * commonStepSize);

// Output the final calculated result to standard output.
console.log(computedProgressionResult);
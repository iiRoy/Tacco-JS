const fileSystem = require('fs');

// Function to safely parse an integer from a string, with robust error handling.
const tryParseInteger = (strValue, fallback = NaN) => {
    if (typeof strValue !== 'string') {
        return fallback;
    }
    const parsed = parseInt(strValue, 10);
    return isNaN(parsed) ? fallback : parsed;
};

// Function to safely parse a float from a string.
const tryParseFloat = (strValue, fallback = NaN) => {
    if (typeof strValue !== 'string') {
        return fallback;
    }
    const parsed = parseFloat(strValue);
    return isNaN(parsed) ? fallback : parsed;
};

// --- Input Acquisition and Initial Setup ---
// Read all raw data from the designated standard input file path.
let acquiredSourceData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Pre-processing: Remove leading/trailing whitespace and split into individual lines.
// This ensures cleaner parsing of each data segment.
let dataLineSegments = acquiredSourceData.trim().split("\n");

// Validate that we actually received some data lines.
if (dataLineSegments.length === 0 || (dataLineSegments.length === 1 && dataLineSegments[0].trim() === '')) {
    console.error("Fatal Error: No recognizable input lines found.");
    process.exit(1);
}

// Extract the first numerical value, which might represent a total count or similar.
// In the original, this was `n` and often unused. Here, we'll validate its presence.
const firstLineValueStr = dataLineSegments.shift();
const initialItemCounter = tryParseInteger(firstLineValueStr);

if (isNaN(initialItemCounter) || initialItemCounter < 0) {
    // This value is not used in the final computation but is part of the input structure.
    // We can add a warning or exit based on strictness.
    console.warn(`Warning: Expected a non-negative integer for the initial item count on the first line, received '${firstLineValueStr}'. Proceeding cautiously.`);
}

// Retrieve and parse the arithmetic progression parameters (first term and common difference).
const progressionParametersLine = dataLineSegments.shift();
if (!progressionParametersLine) {
    console.error("Fatal Error: Missing line for arithmetic progression parameters.");
    process.exit(1);
}
const [initialTermString, stepDifferenceString] = progressionParametersLine.split(" ");

const arithmeticStartTerm = tryParseFloat(initialTermString);
const commonStepDifference = tryParseFloat(stepDifferenceString);

if (isNaN(arithmeticStartTerm) || isNaN(commonStepDifference)) {
    console.error(`Fatal Error: Invalid numeric values for progression parameters. First term: '${initialTermString}', Common difference: '${stepDifferenceString}'.`);
    process.exit(1);
}

// --- Dynamic Key Mapping and Aliasing ---
// Initialize a registry to manage aliases or re-mappings of keys.
// This behaves like a simplified union-find structure where values can point to other keys.
let keyAliasRegistry = {};

// Read the number of mapping operations to perform.
const operationCountString = dataLineSegments.shift();
const totalOperationCount = tryParseInteger(operationCountString);

if (isNaN(totalOperationCount) || totalOperationCount < 0) {
    console.error(`Fatal Error: Invalid operation count specified: '${operationCountString}'. Must be a non-negative integer.`);
    process.exit(1);
}

// Process each re-mapping operation.
for (let currentOperationIndex = 0; currentOperationIndex < totalOperationCount; ++currentOperationIndex) {
    const operationInstructionLine = dataLineSegments.shift();
    if (!operationInstructionLine) {
        console.error(`Fatal Error: Expected ${totalOperationCount} operation lines but found only ${currentOperationIndex}. Missing line for operation ${currentOperationIndex + 1}.`);
        process.exit(1);
    }

    const [directiveCode, primaryIdentifier, secondaryIdentifier] = operationInstructionLine.split(" ");

    // Ensure both identifiers exist in the registry, initially mapping to themselves if new.
    // This simplifies subsequent operations by guaranteeing a base entry.
    keyAliasRegistry[primaryIdentifier] = keyAliasRegistry[primaryIdentifier] ?? primaryIdentifier;
    keyAliasRegistry[secondaryIdentifier] = keyAliasRegistry[secondaryIdentifier] ?? secondaryIdentifier;

    // Execute the operation based on the directive code.
    // '0' indicates a swap, any other value indicates an assignment.
    switch (directiveCode) {
        case "0":
            // Swap the current aliased values associated with primary and secondary identifiers.
            let temporaryAliasHolder = keyAliasRegistry[primaryIdentifier];
            keyAliasRegistry[primaryIdentifier] = keyAliasRegistry[secondaryIdentifier];
            keyAliasRegistry[secondaryIdentifier] = temporaryAliasHolder;
            break;
        default:
            // Assign the aliased value of the secondary identifier to the primary identifier.
            // This effectively makes primaryIdentifier point to whatever secondaryIdentifier points to.
            keyAliasRegistry[primaryIdentifier] = keyAliasRegistry[secondaryIdentifier];
            break;
    }
}

// --- Final Term Calculation ---
// Read the target index 'k' for which we need to compute the arithmetic progression term.
const targetTermIndexString = dataLineSegments.shift();
let desiredTermIndex = tryParseInteger(targetTermIndexString);

if (isNaN(desiredTermIndex) || desiredTermIndex < 1) {
    console.error(`Fatal Error: The desired term index '${targetTermIndexString}' must be a positive integer.`);
    process.exit(1);
}

// Check if the desired term index (converted to a string key) has been remapped in the alias registry.
const lookupKeyForIndex = String(desiredTermIndex);
if (Object.prototype.hasOwnProperty.call(keyAliasRegistry, lookupKeyForIndex)) {
    const aliasedKeyContent = keyAliasRegistry[lookupKeyForIndex];
    const remappedIndex = tryParseInteger(aliasedKeyContent);

    if (!isNaN(remappedIndex)) {
        desiredTermIndex = remappedIndex;
    } else {
        // If an alias exists but points to a non-numeric value, it might be an error.
        // For robustness, we can log a warning and proceed with the original index.
        console.warn(`Warning: Alias for index '${lookupKeyForIndex}' points to a non-numeric value '${aliasedKeyContent}'. Using original index.`);
    }
}

// Compute the k-th term of the arithmetic progression using the formula:
// a_k = a + (k-1) * d
const finalComputedProgressionTerm = arithmeticStartTerm + ((desiredTermIndex - 1) * commonStepDifference);

// Output the final result.
console.log(finalComputedProgressionTerm);
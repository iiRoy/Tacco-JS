// This script processes dependency relationships from standard input.
// It identifies unique entities (which can be individual strings or
// string-represented arrays of strings) that are reachable from an
// initial set of dependencies, based on a given set of expansion rules.

// Import the file system module to read input.
const fileSystem = require('fs');

// Read the entire standard input as a UTF-8 encoded string.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Split the raw input into individual lines.
// Each line is trimmed of leading/trailing whitespace, and any completely empty lines are removed.
const processedInputLines = rawInputContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

// Initialize a pointer to keep track of the current line being consumed from the input array.
let currentLinePointer = 0;

/**
 * Retrieves the next non-empty line from the pre-processed input array
 * and advances the internal line pointer.
 * Includes a guard clause for unexpected end-of-input scenarios.
 * @returns {string} The next available input line.
 */
function consumeNextInputLine() {
    if (currentLinePointer >= processedInputLines.length) {
        // If we try to read past the end of the input, it's an error.
        console.error("Critical Error: Unexpected end of input. More data was expected.");
        process.exit(1); // Terminate the process with an error code.
    }
    return processedInputLines[currentLinePointer++];
}

/**
 * Parses a numeric entity count from the next input line.
 * This count typically indicates how many dependency relations follow.
 * Includes validation to ensure the parsed value is a valid integer.
 * @returns {number} The parsed integer value.
 */
function parseNumericEntityCount() {
    const lineContainingCount = consumeNextInputLine();
    const parsedNumber = parseInt(lineContainingCount, 10);

    // Validate that the line indeed contained a valid integer.
    if (isNaN(parsedNumber)) {
        console.error(`Input Error: Expected a valid number for entity count, but received "${lineContainingCount}".`);
        process.exit(1);
    }
    return parsedNumber;
}

/**
 * Parses a dependency relation string formatted as "key:(val1,val2,...)"
 * into its constituent key and an array of values.
 * Includes robust error checking for expected string formats.
 * @param {string} relationDataString - The input string representing a single dependency relation.
 * @returns {{key: string, values: string[]}} An object containing the extracted key and an array of its associated values.
 */
function parseDependencyRelation(relationDataString) {
    const keyAndValueParts = relationDataString.split(':');

    // Basic validation: A relation must have at least a key and a value section.
    if (keyAndValueParts.length < 2) {
        console.error(`Input Error: Malformed dependency relation "${relationDataString}". Expected 'key:(values)'.`);
        process.exit(1);
    }

    const relationKey = keyAndValueParts[0].trim();
    // Re-join any parts after the first colon, in case the key itself contained colons.
    const rawValueSegment = keyAndValueParts.slice(1).join(':').trim();

    // Validate that the values segment is enclosed in parentheses.
    if (!rawValueSegment.startsWith('(') || !rawValueSegment.endsWith(')')) {
        console.error(`Input Error: Relation values must be enclosed in parentheses for "${relationDataString}".`);
        process.exit(1);
    }

    // Extract the inner part of the parentheses, removing them.
    const innerCommaSeparatedValues = rawValueSegment.substring(1, rawValueSegment.length - 1);

    // Split the inner string by commas, trim each value, and filter out any empty strings
    // that might result from extra commas (e.g., "(val1,,val2)").
    const relationValuesArray = innerCommaSeparatedValues
        .split(',')
        .map(val => val.trim())
        .filter(val => val.length > 0);

    return { key: relationKey, values: relationValuesArray };
}


// Main processing loop: Each iteration handles one block of test data.
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Attempt to read the number of relations (entities) for the current test case block.
    const currentBlockEntityCount = parseNumericEntityCount();

    // If the parsed entity count is 0, it signals the end of all test cases.
    if (currentBlockEntityCount === 0) {
        break; // Exit the main processing loop.
    }

    // --- Section 1: Initialization and Building the Dependency Graph ---

    // The first relation line in each block provides the initial set of items to start processing.
    const firstRelationLineData = consumeNextInputLine();
    const { values: initialProcessingItems } = parseDependencyRelation(firstRelationLineData);

    // This array will dynamically hold all items (which can be individual strings or
    // arrays of strings) that are currently part of the set being expanded.
    // It is initialized with the values from the first relation.
    let activeExpansionQueue = [...initialProcessingItems];

    // This object will store the dependency rules.
    // Each key maps to an array of strings that represent its direct dependencies.
    // Example: { "A": ["B", "C"], "X": ["Y"] }
    const dependencyRules = {};

    // Read the remaining (currentBlockEntityCount - 1) relation lines
    // and populate the 'dependencyRules' map.
    for (let i = 0; i < currentBlockEntityCount - 1; i++) {
        const relationInputLine = consumeNextInputLine();
        const { key, values } = parseDependencyRelation(relationInputLine);
        // Store the rule: if 'key' is encountered, it expands to 'values'.
        dependencyRules[key] = values;
    }

    // --- Section 2: Transitive Expansion of Dependencies ---

    // This variable tracks the length of the 'activeExpansionQueue' at the beginning of each pass.
    // It's used to detect if any new items were added during an iteration,
    // indicating if the expansion process needs to continue.
    let lastKnownQueueLength = 0;

    // This loop continues until a full pass over the 'activeExpansionQueue'
    // results in no new items being added, signifying that the set of reachable
    // dependencies has stabilized (reached a fixed point).
    while (true) {
        // If the queue's length hasn't changed since the last full pass,
        // it means no new expansions occurred, so we can stop.
        if (lastKnownQueueLength === activeExpansionQueue.length) {
            break; // Exit the expansion loop.
        }
        // Update the snapshot length for comparison in the next iteration.
        lastKnownQueueLength = activeExpansionQueue.length;

        // We iterate using a traditional `for` loop with a fixed length for the current pass.
        // This is crucial because the `activeExpansionQueue` is modified in-place
        // (elements are set to "" and new elements are pushed to the end) during this loop.
        const lengthAtStartOfPass = activeExpansionQueue.length;
        for (let k = 0; k < lengthAtStartOfPass; k++) {
            const currentItemForAnalysis = activeExpansionQueue[k];

            // We only attempt to expand items that are strings AND are defined as a key
            // in our 'dependencyRules'. Items that are already arrays or strings not
            // found in rules are simply carried over to the final set.
            if (typeof currentItemForAnalysis === 'string' && dependencyRules.hasOwnProperty(currentItemForAnalysis)) {
                // If a dependency rule exists for this string item:
                // 1. Mark the current item's position in the queue for removal.
                //    It's replaced by an empty string, which will be filtered out later.
                activeExpansionQueue[k] = "";
                // 2. Add the array of values associated with this rule to the end of the queue.
                //    These new arrays will be treated as individual items in subsequent passes
                //    of the 'while' loop (if they contain strings that are themselves keys).
                activeExpansionQueue.push(dependencyRules[currentItemForAnalysis]);
            }
        }
    }

    // --- Section 3: Counting Unique Final Entities ---

    // After the expansion phase is complete, filter out all the empty strings
    // that were used as placeholders for items that were expanded and "removed".
    const finalExpandedEntities = activeExpansionQueue.filter(item => item !== "");

    // To count unique entities, we leverage a plain JavaScript object.
    // When an array is used as an object key, JavaScript implicitly converts it
    // to its comma-separated string representation (e.g., `['a', 'b']` becomes `"a,b"`).
    // This correctly captures uniqueness for both individual strings and arrays of strings.
    const uniqueEntityCollector = {};
    for (const entityCandidate of finalExpandedEntities) {
        // By assigning 'true' (or any value), we ensure the entity (or its string representation)
        // becomes a unique key in 'uniqueEntityCollector'. Duplicate entities will simply overwrite
        // the same key, not increasing the count of unique keys.
        uniqueEntityCollector[entityCandidate] = true;
    }

    // The final count of unique entities is simply the number of keys in our collector object.
    console.log(Object.keys(uniqueEntityCollector).length);
}
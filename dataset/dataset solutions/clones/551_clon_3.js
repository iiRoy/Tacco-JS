((sourceContent) => {
    // This self-executing function processes incoming text data to perform
    // a series of substitutions based on a provided mapping.

    // Step 1: Divide the entire input string into individual lines.
    const rawInputLines = sourceContent.split('\n');

    // Step 2: Extract the first line, which indicates the number of key-value pairs
    // for our transformation registry. Convert it to a numeric type.
    const numberOfMappingsText = rawInputLines.shift();
    const mapEntryQuantity = Number(numberOfMappingsText);

    // Basic validation for the number of mappings.
    if (isNaN(mapEntryQuantity) || mapEntryQuantity < 0) {
        console.error("Error: Invalid or missing mapping quantity specified.");
        return; // Exit if the input is malformed.
    }

    // Step 3: Initialize a data structure (Map) to store our key-value substitutions.
    // Using Map provides better performance for lookups compared to plain objects
    // when keys might not be simple strings or when order is a concern (though not here).
    const transformationRegistry = new Map();

    // Step 4: Populate the transformation registry with the specified number of entries.
    // Each entry is expected to be a space-separated key-value pair on a new line.
    for (let currentEntryIndex = 0; currentEntryIndex < mapEntryQuantity; currentEntryIndex++) {
        const currentMappingLine = rawInputLines.shift(); // Get the next line for mapping.

        // Ensure the line is not null/undefined before attempting to split.
        if (currentMappingLine === undefined) {
             console.warn(`Warning: Expected ${mapEntryQuantity} mappings, but ran out of lines at index ${currentEntryIndex}.`);
             break; // Stop if we run out of input prematurely.
        }

        const mappingComponents = currentMappingLine.split(' ');

        // Validate that we have exactly two components (key and value).
        if (mappingComponents.length === 2) {
            const keyToSubstitute = mappingComponents[0];
            const substitutionValue = mappingComponents[1];
            transformationRegistry.set(keyToSubstitute, substitutionValue);
        } else {
            console.warn(`Warning: Skipping malformed mapping line: "${currentMappingLine}"`);
        }
    }

    // Step 5: Discard an expected empty line or separator line after the mappings.
    // This line typically acts as a delimiter between the mapping definitions and
    // the text that needs to be processed.
    const delimiterLine = rawInputLines.shift(); // Consume the separator.
    // We could add a check here if delimiterLine is not empty or not what's expected.

    // Step 6: Process the remaining lines in the input. For each line,
    // check if it exists as a key in our transformation registry.
    // If a match is found, use its corresponding value; otherwise, keep the original line.
    const finalProcessedSegments = [];
    for (const segmentToEvaluate of rawInputLines) {
        let resultantFragment = segmentToEvaluate; // Default: keep original.

        // Check if the current segment requires substitution.
        if (transformationRegistry.has(segmentToEvaluate)) {
            resultantFragment = transformationRegistry.get(segmentToEvaluate);
        }
        finalProcessedSegments.push(resultantFragment);
    }

    // Step 7: Concatenate all processed segments into a single output string
    // and print it to the console, ensuring a trailing newline for proper termination.
    const combinedOutputString = finalProcessedSegments.join('');
    console.log(combinedOutputString + '\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the standard input using Node.js file system module.
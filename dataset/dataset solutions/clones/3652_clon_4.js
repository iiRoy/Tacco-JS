const processNumericalExtent = (rawDataString) => {
    // Mimic `trim()`: Remove leading/trailing whitespace from the raw input string.
    const cleanedString = rawDataString.replace(/^\s+|\s+$/g, '');

    // Mimic `split(" ").map(Number)`:
    // This requires careful manual parsing to replicate the exact behavior,
    // especially how multiple spaces (`"  "`) result in empty strings (`""`)
    // which `Number("")` converts to `0`.
    const collectedNumericItems = [];
    let segmentBuffer = ''; // Accumulates characters for a number segment

    // Iterate through the cleaned string character by character.
    for (let charIdx = 0; charIdx < cleanedString.length; charIdx++) {
        const currentCharacter = cleanedString[charIdx];
        if (currentCharacter === ' ') {
            // If a space is encountered, it signifies the end of a segment.
            // Convert the accumulated segment (or `0` if empty) and add it.
            // `parseInt('', 10)` would yield `NaN`, so we explicitly check for empty buffer
            // to match `Number('')` which yields `0`.
            const currentParsedValue = segmentBuffer.length > 0 ? parseInt(segmentBuffer, 10) : 0;
            collectedNumericItems.push(currentParsedValue);
            segmentBuffer = ''; // Reset buffer for the next segment
        } else {
            // Accumulate non-space characters into the buffer.
            segmentBuffer += currentCharacter;
        }
    }
    // After the loop, push the last segment (if any)
    const lastParsedValue = segmentBuffer.length > 0 ? parseInt(segmentBuffer, 10) : 0;
    collectedNumericItems.push(lastParsedValue);

    // Find maximum and minimum values using an iterative comparison,
    // replacing `Math.max` and `Math.min`.
    // The input implicitly guarantees at least three numbers (possibly with zeros).
    let currentHigh = collectedNumericItems[0];
    let currentLow = collectedNumericItems[0];

    // Start from the second element, as the first is used for initial high/low.
    for (let k = 1; k < collectedNumericItems.length; k++) {
        const itemVal = collectedNumericItems[k];
        if (itemVal > currentHigh) {
            currentHigh = itemVal;
        }
        if (itemVal < currentLow) {
            currentLow = itemVal;
        }
    }

    // Calculate the difference between the highest and lowest values.
    const finalCalculatedDifference = currentHigh - currentLow;

    // Replace `console.log` with `process.stdout.write` for output.
    process.stdout.write(String(finalCalculatedDifference) + '\n');
};

// Acquire input data: change variable names and module path for distinction.
const inputSourceContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Execute the custom routine with the acquired input.
processNumericalExtent(inputSourceContent);
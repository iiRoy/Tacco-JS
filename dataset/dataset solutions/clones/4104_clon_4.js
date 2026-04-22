'use strict';

function processInputData(rawText) {
    // Break down the raw text into individual lines, skipping the first line.
    // This uses `filter` with `index > 0` to achieve the `shift()` effect.
    // `parseFloat` is used as an alternative to `parseInt`, providing similar parsing behavior
    // for integers, leading/trailing whitespace, and partial numeric strings (e.g., '10a' becomes 10).
    // It also correctly converts empty or whitespace-only strings to NaN, matching `parseInt`'s behavior.
    const numericValues = rawText.split('\n')
                                 .filter((lineSegment, segmentIndex) => segmentIndex > 0)
                                 .map(parseFloat);

    // Build a unique registry using a plain JavaScript object (hash map).
    // This replaces the functionality of `new Set()`.
    // Each unique number becomes a key in the object.
    const uniqueRegistry = numericValues.reduce((collector, itemValue) => {
        // Only store if it's a valid number. NaN is unique in Set, but as a key in object it's 'NaN'.
        // To match Set's behavior for NaN, we explicitly check for it.
        if (isNaN(itemValue)) {
            collector['NaN'] = true; // Use a specific key for NaN
        } else {
            collector[itemValue] = true;
        }
        return collector;
    }, {});

    // Count the number of unique keys in the registry.
    // This replaces `.length` after converting the Set to an array.
    const finalCount = Object.keys(uniqueRegistry).length;

    // Output the final count.
    console.log(finalCount);
}

// Read the input from standard input using a different module alias and options format.
const sourceMaterial = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

// Invoke the data processing function.
processInputData(sourceMaterial);
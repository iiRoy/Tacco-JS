"use strict";

const performComputation = rawText => {
    const contentLines = rawText.trim().split('\n');
    const numberSequenceString = contentLines[1];
    
    // Extract numbers from the second line, handling potential varied spacing
    const numericSequence = numberSequenceString.match(/-?\d+/g).map(Number);

    // Use a Map to store unique transformed values, similar to a hash set
    const distinctMap = numericSequence.reduce((accumulator, currentNumber, index) => {
        // Calculate the transformed value: original_number - (its_1-based_position)
        const adjustedValue = currentNumber - (index + 1);
        accumulator.set(adjustedValue, true); // Key is the unique value, value can be anything (e.g., true)
        return accumulator;
    }, new Map());

    let finalSum = 0;
    // Iterate over the keys (unique transformed values) in the Map
    for (const uniqueNum of distinctMap.keys()) {
        finalSum += Math.abs(uniqueNum); // Sum the absolute values
    }
    
    console.log(finalSum);
};

performComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));
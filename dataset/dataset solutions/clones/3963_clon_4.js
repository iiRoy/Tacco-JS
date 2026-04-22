"use strict";

const processEvaluation = (initialData) => {
    // Extract numerical elements from the provided string
    const stringElements = initialData.match(/\d+/g);

    // Transform string elements into their numeric equivalents
    const valX = Number(stringElements[0]);
    const valY = Number(stringElements[1]);
    const valZ = Number(stringElements[2]);

    // Compute the sum of valX and valY using a functional array reduction
    // This creates arrays of 1s and then sums them up.
    const combinedValue = Array(valX).fill(1).concat(Array(valY).fill(1)).reduce((accumulator, current) => accumulator + current, 0);

    // Determine the result based on the comparison
    const outcomeCondition = (combinedValue >= valZ);

    // Use a mapping structure for final textual output
    const outcomeDictionary = new Map([
        [true, "Yes"],
        [false, "No"]
    ]);

    return outcomeDictionary.get(outcomeCondition);
};

// Primary execution path
// An anonymous function immediately invoked to handle program flow
((dataFetcher) => {
    const rawInput = dataFetcher('/dev/stdin', 'utf8');
    const finalResult = processEvaluation(rawInput);
    console.log(finalResult);
})(require('fs').readFileSync);
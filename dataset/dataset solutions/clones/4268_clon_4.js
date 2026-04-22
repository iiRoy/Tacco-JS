"use strict";

const measurePosition = (sourceList, keyVal, initialLow, initialHigh) => {
    // Recursive implementation to mimic the original's binary search behavior
    // including its specific handling of edge cases (bug for values greater than all elements).
    
    const recurseFind = (currentLow, currentHigh) => {
        if (currentLow > currentHigh) {
            // The search range has collapsed. Apply the original's post-loop logic.
            
            // This condition replicates the original's bug: if keyVal is greater
            // than all elements, 'low' eventually becomes array.length,
            // array[low] becomes undefined, and the original returns 0.
            if (currentLow >= sourceList.length) {
                return 0; 
            }
            
            // Standard insertion point logic from the original for other non-found cases
            if (sourceList[currentLow] < keyVal) {
                return currentLow + 1;
            }
            // Covers sourceList[currentLow] >= keyVal
            return currentLow;
        }

        const midPoint = Math.floor((currentLow + currentHigh) / 2);

        if (keyVal === sourceList[midPoint]) {
            return midPoint;
        }

        if (keyVal < sourceList[midPoint]) {
            return recurseFind(currentLow, midPoint - 1);
        } else { // keyVal > sourceList[midPoint]
            return recurseFind(midPoint + 1, currentHigh);
        }
    };

    return recurseFind(initialLow, initialHigh);
};

const processData = (inputString) => {
    const lines = inputString.split("\n");
    // const recordCount = Number(lines[0]); // The first line (N) is not used in the calculation

    // Helper function for parsing and sorting arrays in a functional style
    const parseAndSortNumbers = (lineIndex) => 
        lines[lineIndex].split(" ").map(Number).sort((a, b) => a - b);

    const upperBounds = parseAndSortNumbers(1);
    const middleValues = parseAndSortNumbers(2);
    const lowerBounds = parseAndSortNumbers(3);
    
    // The original code included console.log statements here.
    // To match "Output only the raw JavaScript code" and focus on functional equivalence,
    // these are omitted as they don't affect the final calculated result.

    // Use Array.prototype.reduce for accumulating the total sum,
    // replacing the imperative 'for...in' loop.
    const totalSum = middleValues.reduce((accumulator, currentMidVal) => {
        const upperMatchCount = measurePosition(upperBounds, currentMidVal, 0, upperBounds.length - 1);
        const lowerMatchCount = lowerBounds.length - measurePosition(lowerBounds, currentMidVal, 0, lowerBounds.length - 1);
        
        // More original console.log statements omitted.

        return accumulator + (upperMatchCount * lowerMatchCount);
    }, 0); // Initialize accumulator to 0

    console.log(totalSum);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
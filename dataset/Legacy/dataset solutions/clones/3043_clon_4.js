'use strict';

function Main(rawInputString) {
    const MODULO_CONST = 998244353;

    let parsedValues = rawInputString.trim().split(/\s+/).map(Number);
    const itemCount = parsedValues.shift();
    const elementValues = parsedValues;

    const totalValueSum = elementValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
    
    // The difference (Sum_GroupA - Sum_GroupB) can range from -totalValueSum to +totalValueSum.
    // We use an offset to map this range to non-negative array indices [0, 2 * totalValueSum].
    const diffOffset = totalValueSum; 
    const maxDiffIndex = 2 * totalValueSum;

    // diffCounts[idx] stores the number of ways to achieve a difference of (idx - diffOffset)
    // using elements processed so far.
    let currentDiffCounts = new Array(maxDiffIndex + 1).fill(0);
    
    // Base case: With 0 elements, the difference (Sum_GroupA - Sum_GroupB) is 0.
    // This corresponds to index 'diffOffset'. There is 1 way to achieve this (assign nothing).
    currentDiffCounts[diffOffset] = 1; 

    // Iterate through each element to update the possible differences
    for (let i = 0; i < itemCount; i++) {
        const currentElement = elementValues[i];
        let nextDiffCounts = new Array(maxDiffIndex + 1).fill(0);

        for (let j = 0; j <= maxDiffIndex; j++) {
            // If there are no ways to reach the current difference state, skip it.
            if (currentDiffCounts[j] === 0) continue; 

            // Option 1: Assign currentElement to the third group (neither Group A nor Group B).
            // The difference (Sum_GroupA - Sum_GroupB) remains unchanged.
            nextDiffCounts[j] = (nextDiffCounts[j] + currentDiffCounts[j]) % MODULO_CONST;

            // Option 2: Assign currentElement to Group A.
            // The difference (Sum_GroupA - Sum_GroupB) increases by currentElement.
            const newIndexForA = j + currentElement;
            if (newIndexForA <= maxDiffIndex) { // Ensure index is within bounds
                nextDiffCounts[newIndexForA] = (nextDiffCounts[newIndexForA] + currentDiffCounts[j]) % MODULO_CONST;
            }

            // Option 3: Assign currentElement to Group B.
            // The difference (Sum_GroupA - Sum_GroupB) decreases by currentElement.
            const newIndexForB = j - currentElement;
            if (newIndexForB >= 0) { // Ensure index is within bounds
                nextDiffCounts[newIndexForB] = (nextDiffCounts[newIndexForB] + currentDiffCounts[j]) % MODULO_CONST;
            }
        }
        currentDiffCounts = nextDiffCounts; // Update for the next iteration
    }

    // The final answer is the number of ways where Sum_GroupA - Sum_GroupB = 0,
    // which corresponds to the index 'diffOffset'.
    let finalCount = currentDiffCounts[diffOffset];

    console.log(finalCount);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));

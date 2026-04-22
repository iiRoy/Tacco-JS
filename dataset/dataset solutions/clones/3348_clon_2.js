'use strict';
function ProcessInput(rawData) {
    rawData = rawData.trim() .split(/\n\r?/) ;
    const numElements = parseInt(rawData.shift(), 10);
    const totalCombinations = Math.pow(2, numElements);
    const moduloConstant = 1000000007;

    let parsedNumbers = rawData.map(lineStr => lineStr.split(/\s+/)
                                                .map(numStr => parseInt(numStr, 10)));
    const compatibilityMatrix = parsedNumbers;

    // Initialize dynamic programming table
    const dynamicProgression = Array.from({ length: numElements }, () => ({ }));
    dynamicProgression[-1] = { 0: 0x1 };

    // Precompute bit flags for set manipulation
    const bitFlags = Array.from({ length: numElements }, (_, bitIndex) => (1 << bitIndex));

    /*
     * This algorithm computes the count of valid pairings.
     * The outer loop iterates through available entities.
     * The inner loop processes different state masks.
     */

    for (let currentIdx = -1; currentIdx < numElements - 1; ++currentIdx) {
        Object.keys(dynamicProgression[currentIdx]).forEach(function (currentMaskString) {
            let currentMask = parseInt(currentMaskString, 10);
            dynamicProgression[currentIdx][currentMask] %= moduloConstant;

            for (let innerIdx = 0; innerIdx < numElements; ++innerIdx) {
                // Check if the item is already included in the current mask
                if ((currentMask & bitFlags[innerIdx]) !== 0) continue;
                // Check compatibility condition
                if (compatibilityMatrix[currentIdx + 1][innerIdx] === 0) continue;

                let nextMask = currentMask | bitFlags[innerIdx];
                dynamicProgression[currentIdx + 1][nextMask] = (dynamicProgression[currentIdx + 1][nextMask] || 0) + dynamicProgression[currentIdx][currentMask];
            }
        });
    }

    const finalResult = (dynamicProgression[numElements - 1][totalCombinations - 1] || 0);
    console.log(finalResult % moduloConstant);
}

// Main execution entry point: read data from standard input and process it
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));
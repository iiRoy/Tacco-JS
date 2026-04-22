const processNumericSeries = (inputString) => {
    const [limitCount, seedValue, baseModulo] = inputString.trim().split(/\s+/).map(Number);

    let currentElement = seedValue;
    const positionMap = new Map(); // Maps element value -> 1-based index of its first appearance
    const seriesElements = []; // Stores the actual elements in sequence order (0-indexed)

    let iterationIndex = 1; // 1-based counter for the sequence elements

    while (iterationIndex <= limitCount) {
        if (positionMap.has(currentElement)) {
            // Cycle detected: currentElement was seen before
            const cycleStartIdx = positionMap.get(currentElement); // 1-based index where the cycle begins
            const cycleSegmentLength = iterationIndex - cycleStartIdx; // Length of the repeating segment

            // Calculate sum of the pre-period elements (before the cycle starts)
            let preCycleSummation = 0;
            for (let k = 0; k < cycleStartIdx - 1; k++) {
                preCycleSummation += seriesElements[k];
            }

            // Calculate sum of one full cycle segment
            let cycleSummation = 0;
            for (let k = cycleStartIdx - 1; k < cycleStartIdx - 1 + cycleSegmentLength; k++) {
                cycleSummation += seriesElements[k];
            }

            // Calculate number of elements remaining to sum after the pre-period
            const remainingElementsToProcess = limitCount - (cycleStartIdx - 1);

            // Add contributions from full cycles
            const fullCycleCount = Math.floor(remainingElementsToProcess / cycleSegmentLength);
            preCycleSummation += fullCycleCount * cycleSummation;

            // Add contributions from the partial remaining cycle
            const partialCycleCount = remainingElementsToProcess % cycleSegmentLength;
            for (let k = 0; k < partialCycleCount; k++) {
                preCycleSummation += seriesElements[cycleStartIdx - 1 + k];
            }

            // All elements summed, return the result
            return preCycleSummation;

        } else {
            // Element not seen before, record its position and add to series
            positionMap.set(currentElement, iterationIndex);
            seriesElements.push(currentElement); // Store 0-indexed

            // Calculate the next element in the sequence: (a_k-1)^2 % M
            currentElement = (currentElement * currentElement) % baseModulo;
            iterationIndex++;
        }
    }

    // If the loop completes without detecting a cycle within 'limitCount' terms,
    // simply sum all elements that were generated and stored in 'seriesElements'.
    let finalSummation = 0;
    for (const val of seriesElements) {
        finalSummation += val;
    }
    return finalSummation;
};

((inputPayload) => {
    const calculationResult = processNumericSeries(inputPayload);
    console.log(calculationResult);
})(require("fs").readFileSync("/dev/stdin", "utf8"));
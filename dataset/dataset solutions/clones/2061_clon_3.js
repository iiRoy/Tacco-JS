function processInputData(rawData) {
    const lines = rawData.split("\n");
    const CASE_PROCESSING_STEP = 2;

    // Helper function to perform a single transformation step on the sequence.
    // It calculates the absolute difference between the first two elements,
    // adds it to the end, and removes the first element.
    function applySequenceTransformation(currentSequence) {
        const firstValue = currentSequence[0];
        const secondValue = currentSequence[1];
        const computedDifference = Math.abs(firstValue - secondValue);
        currentSequence.push(computedDifference);
        currentSequence.shift();
        return computedDifference; // The return value is not used by the caller, but it's a valid part of a helper.
    }

    for (let caseIndex = 0; caseIndex < lines.length; caseIndex += CASE_PROCESSING_STEP) {
        const elementsCountString = lines[caseIndex];
        const numElements = parseInt(elementsCountString, 10);

        const sequenceInputString = lines[caseIndex + 1];
        const characterArray = sequenceInputString.split("");
        let numericSequence = characterArray.map(Number);

        // Outer loop: iterates from numElements down to 2
        for (let outerIteration = numElements; outerIteration > 1; outerIteration--) {
            // Inner loop: performs the transformation 'outerIteration' times
            for (let innerIteration = 0; innerIteration < outerIteration; innerIteration++) {
                applySequenceTransformation(numericSequence);
            }
            // After the inner loop, remove the last element from the sequence
            numericSequence.pop();
        }
        console.log(numericSequence[0]);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

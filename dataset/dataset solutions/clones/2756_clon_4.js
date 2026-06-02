const processInputData = (rawInputString) => {
    const lines = rawInputString.split("\n");
    // The first line (N) is not used in the original logic, so we omit parsing it.
    return lines[1].split(" ").map(element => Number.parseInt(element, 10));
};

const findOptimalMergePoint = (currentSequence) => {
    const sequenceLength = currentSequence.length;

    // Step 1: Determine the primary candidate index based on value and neighbor sum.
    // This part uses a functional approach with Array.from and reduce.
    const internalIndices = Array.from({ length: sequenceLength - 2 }, (_, i) => i + 1); // Generates indices [1, 2, ..., sequenceLength-2]

    const primaryCandidateIndex = internalIndices.reduce((bestIdx, currentIdx) => {
        const currentVal = currentSequence[currentIdx];
        const currentNeighborSum = currentSequence[currentIdx - 1] + currentSequence[currentIdx + 1];

        const bestVal = currentSequence[bestIdx];
        const bestNeighborSum = currentSequence[bestIdx - 1] + currentSequence[bestIdx + 1];

        if (currentVal < bestVal) {
            return currentIdx;
        } else if (currentVal === bestVal) {
            // Tie-breaking rule: prefer the one with smaller sum of neighbors
            return currentNeighborSum < bestNeighborSum ? currentIdx : bestIdx;
        }
        return bestIdx;
    }, 1); // Initialize with index 1, as it's always a valid candidate in the range.

    // Step 2: Apply the complex override rules to get the final merge target index.
    // This part is inherently conditional, mirroring the original's logic structure.
    let finalMergeTargetIndex = primaryCandidateIndex;

    const primaryCandidateValue = currentSequence[primaryCandidateIndex];
    const firstBoundaryElement = currentSequence[1];
    const lastBoundaryElement = currentSequence[sequenceLength - 2];

    if (primaryCandidateValue * 2 > firstBoundaryElement) {
        finalMergeTargetIndex = 1;
        if (currentSequence[finalMergeTargetIndex] > lastBoundaryElement) {
            finalMergeTargetIndex = sequenceLength - 2;
        }
    } else if (primaryCandidateValue * 2 > lastBoundaryElement) {
        finalMergeTargetIndex = sequenceLength - 2;
    }

    return finalMergeTargetIndex;
};

const applyTransformation = (currentSequence, mergeTargetIndex) => {
    // This transformation uses Array.prototype.reduce to build the new array,
    // which is a functional alternative to the original imperative loop with push.
    return currentSequence.reduce((accumulator, currentValue, currentIndex) => {
        if (currentIndex === mergeTargetIndex - 1) {
            accumulator.push(currentValue + currentSequence[mergeTargetIndex]);
        } else if (currentIndex === mergeTargetIndex) {
            // Skip the element at mergeTargetIndex as it's "removed"
        } else if (currentIndex === mergeTargetIndex + 1) {
            accumulator.push(currentValue + currentSequence[mergeTargetIndex]);
        } else {
            accumulator.push(currentValue);
        }
        return accumulator;
    }, []);
};

const performArrayReduction = (initialValues) => {
    let workingSequence = initialValues;

    // The loop condition is explicitly stated instead of `while(true)` with `break`.
    while (workingSequence.length > 2) {
        const targetIndex = findOptimalMergePoint(workingSequence);
        workingSequence = applyTransformation(workingSequence, targetIndex);
    }

    // The final result is the sum of the two remaining elements.
    return workingSequence[0] + workingSequence[1];
};

const solveProblem = (inputString) => {
    const initialArray = processInputData(inputString);
    const finalResult = performArrayReduction(initialArray);
    console.log(finalResult);
};

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));

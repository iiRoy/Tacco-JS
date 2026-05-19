const processSequence = (inputString) => {
    const [termCount, initialValue, modulus] = inputString.split(" ").map(Number);

    let currentSequenceElement = initialValue;
    const generatedSequenceElements = []; // Stores x_0, x_1, ..., x_{cycleEndPoint-1}
    const elementFirstAppearance = new Map(); // Maps value -> first index seen

    let cycleStartPoint = -1;
    let cycleEndPoint = -1;

    // Generate sequence terms and detect cycle.
    // The loop runs up to 'modulus' iterations to guarantee cycle detection
    // as values are x % modulus, so they must repeat within 'modulus' steps.
    for (let currentIdx = 0; currentIdx < modulus; currentIdx++) {
        if (elementFirstAppearance.has(currentSequenceElement)) {
            cycleStartPoint = elementFirstAppearance.get(currentSequenceElement);
            cycleEndPoint = currentIdx;
            break;
        }
        elementFirstAppearance.set(currentSequenceElement, currentIdx);
        generatedSequenceElements.push(currentSequenceElement);
        currentSequenceElement = (currentSequenceElement * currentSequenceElement) % modulus;
    }

    // If no cycle was detected (theoretically impossible for x_k = x_{k-1}^2 % M within M steps),
    // treat the entire generated sequence as a non-repeating part.
    if (cycleStartPoint === -1) {
        cycleStartPoint = generatedSequenceElements.length;
        cycleEndPoint = generatedSequenceElements.length;
    }

    const cycleLength = cycleEndPoint - cycleStartPoint;

    let sumOfCycleSegment = 0;
    if (cycleLength > 0) {
        for (let k = cycleStartPoint; k < cycleEndPoint; k++) {
            sumOfCycleSegment += generatedSequenceElements[k];
        }
    }

    let totalAccumulatedSum = 0;

    // Replicate the original's summation logic for exact behavioral equivalence.
    // This involves a potentially over-estimated sum from full cycles,
    // then adding pre-cycle elements, and finally adding remaining partial cycle elements.

    // Step 1: Add sum of full cycles based on N / cycleLength (can be an overestimation if cycleStartPoint > 0)
    const fullCycleRepetitions = cycleLength === 0 ? 0 : Math.floor(termCount / cycleLength);
    totalAccumulatedSum += sumOfCycleSegment * fullCycleRepetitions;

    // Step 2: Add sum of elements that appear before the cycle starts
    for (let k = 0; k < cycleStartPoint; k++) {
        totalAccumulatedSum += generatedSequenceElements[k];
    }

    // Step 3: Add sum of remaining elements from the beginning of the cycle
    // This value can be negative if the sum of pre-cycle elements and full cycles
    // already exceeds N, in which case this loop will not execute.
    const remainingCycleElements = cycleLength === 0 ? 0 : termCount - cycleStartPoint - (cycleLength * fullCycleRepetitions);
    for (let k = 0; k < remainingCycleElements; k++) {
        totalAccumulatedSum += generatedSequenceElements[cycleStartPoint + k];
    }

    console.log(totalAccumulatedSum);
};

processSequence("1000 2 16");

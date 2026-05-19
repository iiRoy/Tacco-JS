function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    // Helper function to parse initial parameters from input lines
    const parseInitialParameters = (lines) => {
        const firstLineParts = lines[0].split(" ");
        const arraySize = parseInt(firstLineParts[0], 10);
        const jumpCountMultiplier = parseInt(firstLineParts[1], 10);
        const originalElements = lines[1].split(" ");
        return { arraySize, jumpCountMultiplier, originalElements };
    };

    const { arraySize, jumpCountMultiplier, originalElements } = parseInitialParameters(inputLines);

    // Helper function to calculate jump distances for each element
    const calculateJumpDistances = (size, elements) => {
        const doubledElements = elements.concat(elements);
        const distances = new Array(size);
        const offsetForNextOccurrence = 1; // Represents the '+1' in the original logic

        for (let idx = 0; idx < size; idx++) {
            const searchSlice = doubledElements.slice(idx + offsetForNextOccurrence);
            const currentElementValue = elements[idx];
            const foundIndexInSlice = searchSlice.indexOf(currentElementValue);
            const nextOccurrenceDistance = foundIndexInSlice + offsetForNextOccurrence;
            distances[idx] = nextOccurrenceDistance;
        }
        return distances;
    };

    const jumpDistances = calculateJumpDistances(arraySize, originalElements);

    // Helper function to simulate the jumps and determine the starting index
    const simulateJumps = (size, multiplier, distances) => {
        let currentPosition = 0;
        let lastValidPosition = 0;
        const totalStepsThreshold = size * multiplier;
        const stepIncrement = 1; // Represents the '+1' in the original jump calculation

        while (currentPosition < totalStepsThreshold) {
            lastValidPosition = currentPosition;
            const currentModuloIndex = currentPosition % size;
            const jumpLength = distances[currentModuloIndex];
            currentPosition += jumpLength + stepIncrement;
        }
        return lastValidPosition % size;
    };

    const startIndex = simulateJumps(arraySize, jumpCountMultiplier, jumpDistances);

    // Helper function to process the remaining elements and find the unique sequence
    const processRemainingElements = (startIdx, elements) => {
        const remainingElementsSlice = elements.slice(startIdx);
        const finalUniqueSequence = [];
        let currentProcessingIndex = 0;
        const singleElementAdvance = 1; // For i++
        const duplicateJumpAdvance = 2; // For i += ... + 2

        while (currentProcessingIndex < remainingElementsSlice.length) {
            const currentElement = remainingElementsSlice[currentProcessingIndex];
            const searchSubSlice = remainingElementsSlice.slice(currentProcessingIndex + singleElementAdvance);
            const nextOccurrenceInSubSlice = searchSubSlice.indexOf(currentElement);

            if (nextOccurrenceInSubSlice === -1) {
                finalUniqueSequence.push(currentElement);
                currentProcessingIndex += singleElementAdvance;
            } else {
                currentProcessingIndex += nextOccurrenceInSubSlice + duplicateJumpAdvance;
            }
        }
        return finalUniqueSequence;
    };

    const finalUniqueSequence = processRemainingElements(startIndex, originalElements);

    console.log(finalUniqueSequence.join(" "));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

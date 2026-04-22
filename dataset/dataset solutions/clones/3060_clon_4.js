const solutionProcessor = (inputString) => {
    const dataChunks = inputString.trim().split("\n");
    const [initialSize, conversionAllowance] = dataChunks[0].split(" ").map(Number);
    const digitSequence = dataChunks[1].split("").map(Number);

    const sequenceTotalLength = initialSize;
    const allowedConversions = conversionAllowance;

    // Handle special cases: all ones or all zeros
    if (digitSequence.every(value => value === 1) || digitSequence.every(value => value === 0)) {
        console.log(sequenceTotalLength);
        return;
    }

    // Prepare the sequence for segment extraction, replicating original padding logic
    let workingSequence = [...digitSequence];
    let collectedSegmentLengths = [];

    // Prepend a zero if the sequence starts with zero (mimics original S[0] !== 1 condition for list.push(0))
    if (workingSequence[0] === 0) {
        collectedSegmentLengths.push(0);
    }
    // Always append a zero to the sequence (mimics original S.push(0) due to S[S.length] always being undefined)
    workingSequence.push(0);

    // Use Array.prototype.reduce to extract alternating segment lengths
    // This replaces the original imperative for-loop and streak variable
    const runLengthProcessor = workingSequence.reduce((accumulator, currentElement, elementIndex, fullArray) => {
        if (elementIndex === 0) {
            // Initialize the run length for the first element
            accumulator.currentRunCount = 1;
            return accumulator;
        }

        if (currentElement === fullArray[elementIndex - 1]) {
            accumulator.currentRunCount++;
        } else {
            accumulator.finishedRuns.push(accumulator.currentRunCount);
            accumulator.currentRunCount = 1; // Start new run
        }
        return accumulator;
    }, { finishedRuns: [], currentRunCount: 0 }); // Initial state for reduce

    collectedSegmentLengths.push(...runLengthProcessor.finishedRuns);
    collectedSegmentLengths.push(runLengthProcessor.currentRunCount); // Add the very last run length

    // Calculate the maximum sum of segments using a recursive approach
    // This replaces the final imperative for...in loop
    const windowSizeForCalculation = (2 * allowedConversions) + 1;
    let maximumOverallValue = 0;
    let currentSubtotal = 0;

    const processSegmentsByRecursion = (remainingSegmentsToProcess, currentChunkElementIndex) => {
        if (remainingSegmentsToProcess.length === 0) {
            maximumOverallValue = Math.max(maximumOverallValue, currentSubtotal);
            return;
        }

        const [headValue, ...tailValues] = remainingSegmentsToProcess;
        currentSubtotal += headValue;

        if ((currentChunkElementIndex + 1) % windowSizeForCalculation === 0) {
            maximumOverallValue = Math.max(maximumOverallValue, currentSubtotal);
            currentSubtotal = 0; // Reset for the next chunk
            processSegmentsByRecursion(tailValues, 0); // Reset index for the new chunk
        } else {
            processSegmentsByRecursion(tailValues, currentChunkElementIndex + 1);
        }
    };

    processSegmentsByRecursion(collectedSegmentLengths, 0);

    console.log(maximumOverallValue);
};

solutionProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'));
const processInputAndCalculateSum = (inputStringData) => {
    // --- Input Validation and Parsing ---
    // Ensure the input string is provided and of the correct type.
    if (typeof inputStringData !== 'string' || inputStringData.trim() === '') {
        console.error("Error: Input data string is missing or invalid. Expected a string with space-separated numbers.");
        // In a production environment, one might throw an error instead of just logging.
        return;
    }

    // Split the input string by spaces and convert parts to numbers.
    const numericParameters = inputStringData.split(" ").map(Number);

    // Extract and assign descriptive names to the problem parameters.
    const [targetSequenceLength, startingValue, modulusFactor] = numericParameters;

    // Validate that all parsed parameters are valid numbers and meet problem constraints.
    // targetSequenceLength (N) and modulusFactor (M) must be positive.
    // startingValue (X) must be non-negative.
    if (isNaN(targetSequenceLength) || isNaN(startingValue) || isNaN(modulusFactor) ||
        targetSequenceLength <= 0 || startingValue < 0 || modulusFactor <= 0) {
        console.error("Error: Invalid numeric parameters. Target length and modulus must be positive; starting value non-negative.");
        return;
    }

    // --- Sequence Generation and Cycle Detection Setup ---
    // `generatedSequence` stores the terms x_0, x_1, x_2, ...
    // The maximum length of this sequence before a cycle must occur is `modulusFactor`.
    const generatedSequence = Array.from({ length: modulusFactor }).fill(0);

    // `termFirstAppearanceIndex` acts as a lookup table (hash map) to store the
    // *first index* at which a given term value appeared in the `generatedSequence`.
    // Initialize with -1 to signify that no term has been seen yet.
    const termFirstAppearanceIndex = Array.from({ length: modulusFactor }).fill(-1);

    // Set the initial term of the sequence.
    generatedSequence[0] = startingValue;
    // Record the first appearance of the starting value at index 0.
    termFirstAppearanceIndex[startingValue] = 0;

    let currentStepCounter = 1;         // Tracks the current index in `generatedSequence`.
    let cycleStartAbsoluteIndex = -1;   // The index in `generatedSequence` where the repeating cycle begins.
    let cycleEndAbsoluteIndex = -1;     // The index in `generatedSequence` where the current term completes the cycle.

    // --- Sequence Generation Loop ---
    // Generate terms until a cycle is detected or we've filled the maximum possible sequence.
    // For x_{i+1} = x_i^2 % M, a cycle is guaranteed to be found within M steps.
    while (currentStepCounter < modulusFactor) {
        const previousSequenceTerm = generatedSequence[currentStepCounter - 1];
        // Calculate the next term: square the previous term and take modulo.
        const nextCalculatedTerm = (previousSequenceTerm * previousSequenceTerm) % modulusFactor;

        // Store the newly calculated term in our sequence.
        generatedSequence[currentStepCounter] = nextCalculatedTerm;

        // Check if this `nextCalculatedTerm` has been encountered before.
        if (termFirstAppearanceIndex[nextCalculatedTerm] !== -1) {
            // A cycle has been detected!
            cycleStartAbsoluteIndex = termFirstAppearanceIndex[nextCalculatedTerm];
            cycleEndAbsoluteIndex = currentStepCounter; // This term marks the end of the non-cyclic part + one cycle.
            break; // Exit the loop as cycle information is complete.
        } else {
            // This is the first time we've seen this term value; record its index.
            termFirstAppearanceIndex[nextCalculatedTerm] = currentStepCounter;
        }
        currentStepCounter++;
    }

    // Initialize the accumulator for the total sum of terms.
    let finalAggregatedSum = 0;

    // --- Summation Logic ---

    // Phase 1: Sum the terms in the non-repeating prefix of the sequence.
    // This part runs from index 0 up to `cycleStartAbsoluteIndex - 1`.
    // We only sum up to `targetSequenceLength` elements if the sequence is shorter than the cycle start.
    const prefixElementsToSum = Math.min(targetSequenceLength, cycleStartAbsoluteIndex);
    for (let k = 0; k < prefixElementsToSum; ++k) {
        finalAggregatedSum += generatedSequence[k];
    }

    // If the `targetSequenceLength` was entirely covered by the prefix, we're done.
    if (targetSequenceLength <= cycleStartAbsoluteIndex) {
        console.log(finalAggregatedSum);
        return;
    }

    // Phase 2: Calculate the sum of one full cycle.
    const detectedCycleLength = cycleEndAbsoluteIndex - cycleStartAbsoluteIndex;
    let sumOfASingleCycle = 0;
    for (let k = cycleStartAbsoluteIndex; k < cycleEndAbsoluteIndex; ++k) {
        sumOfASingleCycle += generatedSequence[k];
    }

    // Determine how many elements remain to be summed after the prefix.
    const elementsRemainingAfterPrefix = targetSequenceLength - cycleStartAbsoluteIndex;

    // Calculate how many full repetitions of the cycle fit into the remaining elements.
    const numberOfFullCycleRepetitions = Math.floor(elementsRemainingAfterPrefix / detectedCycleLength);
    // Add the sum of these full cycles to the total.
    finalAggregatedSum += sumOfASingleCycle * numberOfFullCycleRepetitions;

    // Phase 3: Sum any remaining elements that form a partial cycle at the end.
    const elementsInPartialCycle = elementsRemainingAfterPrefix % detectedCycleLength;
    for (let k = 0; k < elementsInPartialCycle; ++k) {
        // These elements are taken from the beginning of the detected cycle.
        finalAggregatedSum += generatedSequence[cycleStartAbsoluteIndex + k];
    }

    // --- Output ---
    // Print the final calculated sum.
    console.log(finalAggregatedSum);
};

// --- Execution Entry Point ---
// Read input from standard input (e.g., from a file or console pipe) and
// pass it to the main processing function.
processInputAndCalculateSum(require("fs").readFileSync("/dev/stdin", "utf8"));
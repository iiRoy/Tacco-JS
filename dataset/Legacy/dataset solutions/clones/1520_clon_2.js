function ProcessSequence(rawData) {
    // Parse the raw input string. First, remove leading/trailing whitespace,
    // then split by newline characters to get individual lines.
    // Each line is then split by space to get an array of string values.
    let parsedLines = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract the three main parameters from the first line of the parsed input.
    // N: The total length of the sequence to consider.
    let sequenceLength = parseInt(parsedLines[0][0], 0xA);
    // X: The initial value of the sequence.
    let initialValue = parseInt(parsedLines[0][1], 0xA);
    // M: The modulo base for calculations.
    let moduloBase = parseInt(parsedLines[0][2], 0xA);

    // Initialize an array to keep track of the step number at which each remainder
    // (from 0 to M-1) was first encountered.
    // All elements are initially 0x0, indicating no remainder has been seen yet.
    let firstOccurrenceStep = Array.from({length: moduloBase}, () => 0x0);

    // `currentTerm` will hold the current value in the sequence as it's generated.
    let currentTerm = initialValue;

    // `totalSum` will accumulate the sum of all relevant terms in the sequence.
    let totalSum = 0x0;

    // `cycleSum` will temporarily store the sum of values within a detected cycle.
    let cycleSum = 0x0;

    // Mark the initial value's first occurrence as step 1.
    firstOccurrenceStep[currentTerm] = 0x1;

    // Begin iterating from the second step (stepCounter = 2) up to the target sequenceLength.
    // This loop generates sequence terms and detects if a cycle occurs.
    for (let stepCounter = 0b10; stepCounter <= sequenceLength; stepCounter++) {
        // Calculate the next term in the sequence: (currentTerm^2) % moduloBase.
        // The `safeModulo` function is used to ensure positive results.
        currentTerm = safeModulo(Math.pow(safeModulo(currentTerm, moduloBase), 0b10), moduloBase);

        // Check if the `currentTerm` (which is a remainder modulo M) has been seen before.
        if (firstOccurrenceStep[currentTerm] === 0x0) {
            // If this remainder is new, record the current `stepCounter` as its first occurrence.
            firstOccurrenceStep[currentTerm] = stepCounter;
        } else {
            // A cycle has been detected! The `currentTerm` has appeared before.
            // Calculate the length of this cycle.
            let cycleLength = stepCounter - firstOccurrenceStep[currentTerm];

            // Iterate through all possible remainder values (0 to M-1) to find those
            // that are part of the detected cycle.
            for (let remainderValue = 0x0; remainderValue < moduloBase; remainderValue++) {
                // If a remainder's first occurrence step is at or after the start of the current cycle,
                // it means this remainder is part of the cycle. Add it to `cycleSum`.
                if (firstOccurrenceStep[remainderValue] >= firstOccurrenceStep[currentTerm]) {
                    cycleSum += remainderValue;
                }
            }

            // Calculate how many full cycles fit into the remaining part of the sequence.
            // (sequenceLength - firstOccurrenceStep[currentTerm] + 0x1) gives the number of terms
            // from the start of the cycle to the end of the original sequence.
            totalSum += Math.floor((sequenceLength - firstOccurrenceStep[currentTerm] + 0x1) / cycleLength) * cycleSum;

            // Adjust `sequenceLength` to account for the terms that have already been summed
            // by considering full cycles. This effectively reduces `sequenceLength` to only
            // cover the "pre-cycle" part and the "tail" of the cycle that doesn't form a full repetition.
            sequenceLength = (sequenceLength - firstOccurrenceStep[currentTerm] + 0x1) % cycleLength + firstOccurrenceStep[currentTerm] - 0x1;

            // Since we've handled the cycle and adjusted `sequenceLength`, we can exit this loop.
            // The remaining terms will be summed in the final loop.
            break;
        }
    }

    // After the main loop (either completed or exited due to cycle detection),
    // sum up the values for the remaining terms. These include the initial "pre-cycle" terms
    // and any partial cycle "tail" terms up to the adjusted `sequenceLength`.
    for (let remainderValue = 0x0; remainderValue < moduloBase; remainderValue++) {
        // If a remainder was encountered (firstOccurrenceStep > 0) and its step number
        // is within the bounds of the adjusted `sequenceLength`, add its value to `totalSum`.
        if (firstOccurrenceStep[remainderValue] > 0x0 && firstOccurrenceStep[remainderValue] <= sequenceLength) {
            totalSum += remainderValue;
        }
    }

    // Output the final calculated total sum.
    console.log(totalSum);
}

// A custom modulo function that ensures the result is non-negative,
// even if the language's built-in '%' operator could return negative for negative dividends.
// For this problem, `dividend` will always be non-negative and `divisor` positive,
// so `dividend % divisor` will naturally be non-negative.
// The structure is preserved from the original code for Type II cloning.
function safeModulo(dividend, divisor) {
    return (dividend % divisor) < 0x0 ? (dividend % divisor) + 0x0 + (divisor < 0x0 ? -divisor : divisor) : (dividend % divisor + 0x0);
}

// Read the entire content from standard input as a UTF-8 string,
// and then pass it to the `ProcessSequence` function for execution.
ProcessSequence(require("fs").readFileSync("/dev/stdin", "utf8"));

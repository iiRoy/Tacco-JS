function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    const lines = rawData.split("\n");

    // Parse the first line as an integer for the number of iterations
    const numIterations = parseInt(lines[0], 10);

    // The second line is the initial binary string
    const binaryString = lines[1];

    // Output the original binary string as per problem requirements
    console.log(binaryString);

    // Iterate 'numIterations' times to generate and process modified binary strings
    for (let idx = 0; idx < numIterations; idx++) {
        // Create a temporary binary string by flipping the bit at the current index
        // If the character at 'idx' is '1', change it to '0'; otherwise, change it to '1'.
        const tempBinaryStr = binaryString.slice(0, idx) + (binaryString[idx] === "1" ? "0" : "1") + binaryString.slice(idx + 1);

        // Convert the modified binary string to a decimal number
        const decimalValue = Number.parseInt(tempBinaryStr, 2);

        // Calculate and print the sequence length for this decimal value
        console.log(computeSequenceLength(decimalValue, 0));
    }
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Calculates the population count (number of set bits) of a given integer.
 * @param {number} inputNumber - The integer to count set bits for.
 * @returns {number} The number of '1' bits in the binary representation of inputNumber.
 */
function countSetBits(inputNumber) {
    // Convert the number to its binary string representation,
    // then split it into an array of characters, filter for '1's, and count them.
    return parseInt(inputNumber.toString(2)).toString().split("").filter(digitChar => digitChar == 1).length;
}

/**
 * Recursively calculates the length of a sequence based on a specific rule.
 * The rule involves repeatedly taking the number modulo its population count.
 * @param {number} currentValue - The current number in the sequence.
 * @param {number} stepsTaken - The number of steps taken so far in the sequence.
 * @returns {number} The total length of the sequence.
 */
function computeSequenceLength(currentValue, stepsTaken) {
    // Base case: If the current value is 0, the sequence ends.
    if (currentValue === 0) {
        return stepsTaken;
    }

    // Calculate the population count for the current value.
    const populationCount = countSetBits(currentValue);

    // If the population count is 0, it means the number itself was 0 (already handled)
    // or it's an edge case where the modulo operation would be by zero.
    // In this specific problem context, this branch might not be strictly necessary
    // if `currentValue` is always positive when `populationCount` is calculated,
    // but it mirrors the original logic.
    if (populationCount === 0) {
        return stepsTaken;
    }

    // Recursive step: Calculate the next value in the sequence and increment the step count.
    return computeSequenceLength(currentValue % populationCount, stepsTaken + 1);
}

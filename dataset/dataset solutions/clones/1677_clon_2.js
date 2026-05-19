const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

(function(inputContent) {
    // Split the input string into individual lines for processing.
    const dataRows = inputContent.split('\n');

    // Parse the first line to get the total number of items.
    const totalItems = Number(dataRows[0]);

    // Extract and clean the binary string from the second line.
    const binaryString = dataRows[1].trim();

    /**
     * Computes the population count (number of set bits) for a given non-negative integer.
     * @param {number} valueToProcess - The integer for which to count set bits.
     * @returns {number} The number of set bits.
     */
    const calculateSetBits = valueToProcess => {
        let bitCounter = 0; // Initialize a counter for set bits.
        do {
            // Check if the least significant bit is 1.
            if ((valueToProcess & 0x1) === 0x1) {
                bitCounter++; // Increment counter if the bit is set.
            }
            // Right-shift the number by 1 bit to process the next bit.
        } while ((valueToProcess = valueToProcess >>> 0x1) !== 0x0);
        return bitCounter; // Return the total count of set bits.
    };

    /**
     * Calculates the length of a modulo chain starting from a given number.
     * The chain continues by taking the number modulo its population count,
     * until the number becomes zero.
     * @param {number} currentValue - The starting number for the chain.
     * @returns {number} The length of the modulo chain.
     */
    const processModuloChain = currentValue => {
        // If the current value is zero, the chain length is zero.
        if (currentValue === 0x0) {
            return 0x0;
        }
        let chainLength = 0x1; // Start with a chain length of 1.
        // Continue as long as the current value is not zero after the modulo operation.
        while ((currentValue %= calculateSetBits(currentValue)) !== 0x0) {
            chainLength++; // Increment chain length for each step.
        }
        return chainLength; // Return the final chain length.
    };

    // Calculate the initial population count of the binary string as a BigInt.
    let initialSetBits = BigInt(0);
    for (let idx = 0; idx < totalItems; idx++) {
        if (binaryString[idx] === '1') {
            initialSetBits++;
        }
    }

    // Calculate the population count minus one and plus one for modulo operations.
    const previousPopCount = initialSetBits - BigInt(1);
    const nextPopCount = initialSetBits + BigInt(1);

    // Convert the entire binary string to a BigInt.
    const originalBigInt = BigInt(parseInt(binaryString, 0b10));

    // Iterate through each bit position of the binary string.
    for (let idx = 0; idx < totalItems; idx++) {
        // Create a modified BigInt by flipping the bit at the current position.
        // Math.pow(2, N - i - 1) calculates the power of 2 corresponding to the bit position.
        const modifiedBigInt = originalBigInt ^ BigInt(Math.pow(0b10, totalItems - idx - 0b1));

        // If the modified BigInt is zero, print 0.
        if (modifiedBigInt === BigInt(0)) {
            console.log(0);
        } else {
            // Determine the divisor based on the original bit at the current position.
            const divisorForModulo = (binaryString[idx] === '1' ? previousPopCount : nextPopCount);

            // Calculate the remainder of the modified BigInt divided by the chosen divisor.
            // Convert the BigInt remainder to a Number for the `processModuloChain` function.
            const remainderValue = Number(modifiedBigInt % divisorForModulo);

            // Calculate the chain length for the remainder and add 1 (as per problem logic).
            console.log(processModuloChain(remainderValue) + 1);
        }
    }

})(rawData);

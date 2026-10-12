function Main(entryData) {
    const dataLines = entryData.split("\n");
    const elementCount = parseInt(dataLines[0], 10);
    const numericValues = dataLines[1].split(" ").map(Number);

    let cumulativeXORSum = 0;
    const primeDivisor = 1000000007;

    // Iterate through each relevant bit position.
    // JavaScript bitwise operations treat numbers as 32-bit signed integers.
    // For positive integers, bits 0 through 30 are typically used.
    // Numbers up to 10^9 fit within 30 bits (0-29).
    // We go up to bit 30 to cover the full range of positive 32-bit integers.
    const highestBitIndex = 30;

    for (let currentBitIndex = 0; currentBitIndex <= highestBitIndex; currentBitIndex++) {
        let zeroBitCounter = 0;
        let oneBitCounter = 0;

        // Count how many numbers have a 0 at the current bit position
        // and how many have a 1.
        for (const value of numericValues) {
            // Check if the currentBitIndex-th bit is set (1) or not (0)
            if ((value >> currentBitIndex) & 1) {
                oneBitCounter++;
            } else {
                zeroBitCounter++;
            }
        }

        // The contribution of this bit position to the total sum is calculated as follows:
        // For any pair of numbers (A, B), the current bit of (A XOR B) is 1 if and only if
        // the current bits of A and B are different.
        // The number of such pairs is (count of numbers with 0 at this bit) * (count of numbers with 1 at this bit).
        // Each such pair contributes 2^currentBitIndex to the total sum.
        let differingBitPairsContribution = (zeroBitCounter * oneBitCounter) % primeDivisor;
        let bitPositionalValue = (1 << currentBitIndex) % primeDivisor;

        // Add this bit's total contribution to the running sum.
        // Modulo operation is applied at each step to prevent overflow and keep the number within bounds.
        cumulativeXORSum = (cumulativeXORSum + (differingBitPairsContribution * bitPositionalValue) % primeDivisor) % primeDivisor;
    }

    console.log(cumulativeXORSum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

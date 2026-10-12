const processInput = (rawData) => {
    const MOD_VALUE = 10**9 + 7;

    // Helper function to compute the sum of integers from 1 to (num - 1)
    // This is equivalent to num * (num - 1) / 2, often called a triangular number.
    const computeTriangularNumber = (num) => {
        if (num <= 1) {
            return 0;
        }
        // The product num * (num - 1) is always even, so division by 2 yields an integer.
        return (num * (num - 1)) / 2;
    };

    const lines = rawData.split("\n");
    const firstLineParts = lines[0].split(" ");

    const arraySize = parseInt(firstLineParts[0], 10);
    const multiplier = parseInt(firstLineParts[1], 10);

    // Using Number constructor for concise parsing of array elements
    const dataElements = lines[1].split(" ").map(Number);

    let totalInversions = 0;

    // Pre-calculate the triangular number for the multiplier, as it's constant
    const multiplierTriangular = computeTriangularNumber(multiplier);

    for (let currentIdx = 0; currentIdx < arraySize; currentIdx++) {
        const currentElementValue = dataElements[currentIdx];
        let inversionsWithinBlock = 0; // Corresponds to 'u' in original
        let totalSmallerElements = 0;   // Corresponds to 'v' in original

        // Iterate through the entire array to find elements smaller than currentElementValue
        // and categorize them based on their position relative to currentIdx.
        for (let comparisonIdx = 0; comparisonIdx < arraySize; comparisonIdx++) {
            if (dataElements[comparisonIdx] < currentElementValue) {
                totalSmallerElements++;
                // If the smaller element is located after the current element in the array,
                // it contributes to inversions within the same block.
                if (comparisonIdx > currentIdx) {
                    inversionsWithinBlock++;
                }
            }
        }

        // Calculate the contribution from inversions within the same block (repeated 'multiplier' times)
        // and from inversions where the left element is from an earlier block and the right from a later block.
        // This term is 'u * K' from the original logic.
        let contributionFromSameBlockPairs = (inversionsWithinBlock * multiplier) % MOD_VALUE;

        // Calculate the contribution from inversions where elements are from different blocks.
        // This term is 'v * (K-1)*K / 2' from the original logic.
        let contributionFromCrossBlockPairs = (totalSmallerElements * multiplierTriangular) % MOD_VALUE;

        // Accumulate total inversions, applying modulo at each addition to prevent overflow.
        totalInversions = (totalInversions + contributionFromSameBlockPairs) % MOD_VALUE;
        totalInversions = (totalInversions + contributionFromCrossBlockPairs) % MOD_VALUE;
    }

    console.log(totalInversions);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

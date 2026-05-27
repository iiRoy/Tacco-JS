const MOD_CONSTANT_NUM = 1000000007;
const MOD_CONSTANT_BIG = BigInt(MOD_CONSTANT_NUM);

function processInput(rawData) {
    // Helper function for safe modulo, ensuring result is a Number
    const getMod = (val) => Number(BigInt(val) % MOD_CONSTANT_BIG);

    const trimmedData = rawData.trim();
    const inputLines = trimmedData.split('\n');

    // Parse N and K from the first line
    const firstLineParts = inputLines[0].split(" ");
    const arraySize = parseInt(firstLineParts[0], 10);
    const multiplier = parseInt(firstLineParts[1], 10);

    // Parse the data array from the second line
    const dataArrayString = inputLines[1];
    const dataArray = dataArrayString.split(' ').map(val => parseInt(val, 10));

    // Helper function to count inversions for a given value within a specified range
    const calculateInversionsInSubarray = (sourceArray, targetValue, startIndex, endIndex) => {
        let inversionCount = 0;
        for (let currentIdx = startIndex; currentIdx < endIndex; currentIdx++) {
            if (targetValue > sourceArray[currentIdx]) {
                inversionCount++;
            }
        }
        return inversionCount;
    };

    const inversionsFromCurrentElement = []; // Corresponds to original arrIkou
    const totalInversionsPerElement = [];    // Corresponds to original arrZentai

    // Populate inversion arrays using the helper function
    for (let currentElementIdx = 0; currentElementIdx < arraySize; currentElementIdx++) {
        const valueToCompare = dataArray[currentElementIdx];

        // Count inversions from the current element's position to the end of the array
        const countFromCurrent = calculateInversionsInSubarray(dataArray, valueToCompare, currentElementIdx, arraySize);
        inversionsFromCurrentElement.push(countFromCurrent);

        // Count total inversions for the current element across the entire array
        const countOverall = calculateInversionsInSubarray(dataArray, valueToCompare, 0, arraySize);
        totalInversionsPerElement.push(countOverall);
    }

    let finalAccumulatedSum = 0;

    // Pre-calculate K * (K-1) / 2 using BigInt to prevent overflow for large K
    const bigMultiplier = BigInt(multiplier);
    const kCombinationsFactor = (bigMultiplier * (bigMultiplier - BigInt(1))) / BigInt(2);

    // Calculate the final sum
    for (let elementIdx = 0; elementIdx < arraySize; elementIdx++) {
        const currentElementInversions = inversionsFromCurrentElement[elementIdx];
        const overallElementInversions = totalInversionsPerElement[elementIdx];

        // Calculate the first term: (inversionsFromCurrentElement[i] * K) % MOD
        const termOne = getMod(BigInt(currentElementInversions) * bigMultiplier);

        // Calculate the second term: (totalInversionsPerElement[i] * K * (K-1) * 0.5) % MOD
        const termTwo = getMod(BigInt(overallElementInversions) * kCombinationsFactor);

        // Sum the two terms and apply modulo
        const intermediateSum = getMod(termOne + termTwo);
        finalAccumulatedSum = getMod(finalAccumulatedSum + intermediateSum);
    }

    console.log(finalAccumulatedSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

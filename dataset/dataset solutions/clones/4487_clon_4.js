const evaluateDataCombinations = (sourceData) => {
    const dataSegments = sourceData.trim().split('\n');
    const configurationValues = dataSegments[0].split(' ').map(Number);
    const paritySelector = configurationValues[1]; // Corresponds to 'amari'

    const numericElements = dataSegments[1].split(' ').map(Number);

    const evenElementCount = numericElements.filter(val => val % 2 === 0).length;
    const oddElementCount = numericElements.filter(val => val % 2 !== 0).length;

    const evenSubsetWays = 1 << evenElementCount; // Equivalent to Math.pow(2, evenElementCount)

    let oddSubsetWays;
    if (oddElementCount === 0) {
        // If there are no odd numbers:
        // If paritySelector is 0 (even count of odds), only C(0,0) = 1 way.
        // If paritySelector is 1 (odd count of odds), only C(0,1) = 0 ways.
        oddSubsetWays = (paritySelector === 0) ? 1 : 0;
    } else {
        // For N > 0, the sum of combinations with even indices (C(N,0)+C(N,2)+...)
        // and the sum of combinations with odd indices (C(N,1)+C(N,3)+...)
        // are both equal to 2^(N-1).
        oddSubsetWays = 1 << (oddElementCount - 1); // Equivalent to Math.pow(2, oddElementCount - 1)
    }

    return evenSubsetWays * oddSubsetWays;
};

console.log(evaluateDataCombinations(require("fs").readFileSync("/dev/stdin", "utf8")));
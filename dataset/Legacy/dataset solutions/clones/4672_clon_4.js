const readline = require('readline');

const inputHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Async generator to yield lines from stdin
async function* generateInputLines() {
    for await (const lineContent of inputHandler) {
        yield lineContent;
    }
}

// Function to calculate combinations C(n, k)
const computeCombinations = (totalItems, chosenItems) => {
    if (chosenItems < 0 || chosenItems > totalItems) {
        return 0;
    }
    if (chosenItems === 0 || chosenItems === totalItems) {
        return 1;
    }
    // Optimization: C(n, k) = C(n, n-k)
    if (chosenItems > totalItems / 2) {
        chosenItems = totalItems - chosenItems;
    }

    let resultAccumulator = 1;
    for (let i = 1; i <= chosenItems; i++) {
        resultAccumulator = resultAccumulator * (totalItems - i + 1) / i;
    }
    return resultAccumulator;
};

// Main asynchronous processing logic
async function executeProblemSolution() {
    const lineIterator = generateInputLines();

    // Parse initial parameters from the first line
    const firstLineData = (await lineIterator.next()).value;
    const [totalNumbers, minCountForAverage, maxCountForCombinations] = firstLineData.split(" ").map(Number);

    // Parse numeric values from the second line
    const secondLineData = (await lineIterator.next()).value;
    const numberSequence = secondLineData.split(" ").map(Number);

    // Sort the numbers in descending order
    numberSequence.sort((valA, valB) => valB - valA);

    // Calculate the maximum possible average
    const sumOfTopNumbers = numberSequence.slice(0, minCountForAverage).reduce((sum, num) => sum + num, 0);
    const maximumAchievableAverage = sumOfTopNumbers / minCountForAverage;
    console.log(maximumAchievableAverage);

    // Build a frequency map for all numbers
    const valueFrequencyMap = numberSequence.reduce((map, num) => {
        map[num] = (map[num] || 0) + 1;
        return map;
    }, {});

    let numberOfWays = 0;

    // Determine the number of ways based on the problem's specific conditions
    if (numberSequence[0] !== numberSequence[maxCountForCombinations - 1]) {
        // Condition 1: The largest 'maxCountForCombinations' elements are not all identical.
        // In this scenario, to achieve the maximum average, we must select exactly 'minCountForAverage' elements.
        // The number of ways is determined by how many of the 'minCountForAverage'-th largest value
        // we need to pick from its total occurrences.
        const criticalValue = numberSequence[minCountForAverage - 1];
        const totalOccurrencesOfCriticalValue = valueFrequencyMap[criticalValue];

        let countOfValuesStrictlyLargerThanCritical = 0;
        for (let i = 0; i < minCountForAverage; i++) {
            if (numberSequence[i] > criticalValue) {
                countOfValuesStrictlyLargerThanCritical++;
            }
        }
        const requiredCriticalValues = minCountForAverage - countOfValuesStrictlyLargerThanCritical;
        numberOfWays = computeCombinations(totalOccurrencesOfCriticalValue, requiredCriticalValues);

    } else {
        // Condition 2: The largest 'maxCountForCombinations' elements are all identical.
        // This implies that any selection of 'k' elements (where minCountForAverage <= k <= maxCountForCombinations)
        // from these 'maxCountForCombinations' identical elements will yield the same maximum average.
        // The original code sums C(maxCountForCombinations, j) for j from 1 to maxCountForCombinations.
        // This is equivalent to 2^maxCountForCombinations - 1.
        numberOfWays = Array.from({ length: maxCountForCombinations }, (_, index) => index + 1)
                            .reduce((currentSum, k) => currentSum + computeCombinations(maxCountForCombinations, k), 0);
    }

    console.log(numberOfWays);

    inputHandler.close(); // Ensure the readline interface is closed
}

// Initiate the solution execution
executeProblemSolution();

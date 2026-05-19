function processNumberString(numberSequence) {
    const valueCounts = {};
    let highestEncounteredValue = 0;

    numberSequence.split(" ").forEach(stringValue => {
        const numericValue = Number(stringValue);
        valueCounts[numericValue] = (valueCounts[numericValue] || 0) + 1;
        if (numericValue > highestEncounteredValue) {
            highestEncounteredValue = numericValue;
        }
    });

    return { frequencyMap: valueCounts, maxObservedValue: highestEncounteredValue };
}

function solveProblem(problemInputLines) {
    // The first line (problemInputLines[0]) contained 'N' in the original, which was unused.
    // We proceed directly to process the second line of input.
    const numberDataLine = problemInputLines[1];

    const { frequencyMap, maxObservedValue } = processNumberString(numberDataLine);

    let finalComputedResult = 1;
    const MODULO_DIVISOR = 998244353;

    for (let currentNumber = 1; currentNumber <= maxObservedValue; ++currentNumber) {
        const countOfCurrentNumber = frequencyMap[currentNumber] || 0;
        const countOfPreviousNumber = frequencyMap[currentNumber - 1] || 0;

        // Calculate the power term based on previous and current counts
        let powerCalculationTerm = Math.pow(countOfPreviousNumber, countOfCurrentNumber);

        // Multiply the current result by the calculated term
        finalComputedResult = finalComputedResult * powerCalculationTerm;

        // If the current number has no occurrences, the result becomes 0
        if (countOfCurrentNumber === 0) {
            finalComputedResult = 0;
        }

        // Apply modulo operation
        finalComputedResult %= MODULO_DIVISOR;
    }

    console.log(finalComputedResult);
}

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));

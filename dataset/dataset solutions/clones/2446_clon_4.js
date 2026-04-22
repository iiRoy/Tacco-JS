const processNumericalSequence = (inputLines) => {
    // Part 1: Aggregate data (counts and maximum value)
    const sequenceElements = inputLines[1].split(' ').map(Number);
    
    // Using a Map for frequency storage (different from original's plain object)
    // and an object to hold both the Map and the maximum value.
    const collectedStatistics = sequenceElements.reduce((stats, elementValue) => {
        stats.valueOccurrences.set(elementValue, (stats.valueOccurrences.get(elementValue) || 0) + 1);
        if (elementValue > stats.peakValue) {
            stats.peakValue = elementValue;
        }
        return stats;
    }, { valueOccurrences: new Map(), peakValue: 0 });

    const occurrenceMap = collectedStatistics.valueOccurrences;
    const maximumElement = collectedStatistics.peakValue;

    // Part 2: Perform the chained product calculation
    const MODULO_CONSTANT = 998244353;

    // Generate an array of integers from 1 up to maximumElement to use with reduce
    const iterationRange = Array.from({ length: maximumElement }, (_, index) => index + 1);

    // Use Array.prototype.reduce for the main iterative calculation
    const finalCalculatedProduct = iterationRange.reduce((currentAggregate, currentNumber) => {
        // If the product has already become zero, it remains zero for all subsequent steps
        if (currentAggregate === 0) {
            return 0;
        }

        const countOfPriorNumber = occurrenceMap.get(currentNumber - 1) || 0;
        const countOfCurrentNumber = occurrenceMap.get(currentNumber) || 0;

        // Critical condition from the original: if the current number (i) has a count of zero,
        // the entire product becomes zero. This overrides any power calculation.
        if (countOfCurrentNumber === 0) {
            return 0;
        }

        // Calculate the power term: Math.pow(countOfPriorNumber, countOfCurrentNumber)
        // Note: Math.pow(0, 0) is 1. Math.pow(0, positive number) is 0.
        // Since countOfCurrentNumber is guaranteed to be > 0 here (due to the check above),
        // if countOfPriorNumber is 0, this powerTerm will be 0. Otherwise, it's a standard power.
        const powerTerm = Math.pow(countOfPriorNumber, countOfCurrentNumber);

        // Apply modulo at each multiplication step to prevent integer overflow
        return (currentAggregate * powerTerm) % MODULO_CONSTANT;
    }, 1); // Initial value for the reduction is 1

    console.log(finalCalculatedProduct);
};

// Main execution block, also renamed
const executeProgram = () => {
    const systemInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const processedInputLines = systemInput.split("\n");
    processNumericalSequence(processedInputLines);
};

executeProgram();
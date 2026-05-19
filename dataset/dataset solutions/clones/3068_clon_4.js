function processInputAndCompute(sourceData) {
    // Input processing: Transform raw string into an array of the first five numeric values.
    // Diverges from original's full map then selection, by slicing first then mapping.
    const parsedNumbers = sourceData.split('\n').slice(0, 5).map(Number);

    // Sorting logic: Reorder elements based on a derived unit value.
    // Diverges from original's direct subtraction in comparator, using explicit conditional returns.
    parsedNumbers.sort((valueA, valueB) => {
        const unitForA = (valueA % 10 === 0) ? 10 : (valueA % 10);
        const unitForB = (valueB % 10 === 0) ? 10 : (valueB % 10);

        if (unitForA < unitForB) {
            return 1; // Place valueA after valueB for descending order of unit
        } else if (unitForA > unitForB) {
            return -1; // Place valueA before valueB
        } else {
            return 0; // Maintain relative order if units are equal
        }
    });

    // Summation logic: Calculate the total based on rounded values,
    // with the last element added as its original value.
    // Diverges from original's imperative for-loop, using a functional reduce method.
    const finalAccumulatedTotal = parsedNumbers.reduce((currentTotal, currentItem, itemIndex, fullArray) => {
        const isLastElementInSequence = itemIndex === fullArray.length - 1;
        const contributionValue = isLastElementInSequence
            ? currentItem // Add original value for the last item
            : Math.ceil(currentItem / 10) * 10; // Round up to nearest multiple of 10 for others

        return currentTotal + contributionValue;
    }, 0);

    console.log(finalAccumulatedTotal);
}

// Execute the processing function with input from stdin, maintaining external contract.
processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));

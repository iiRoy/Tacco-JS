function processData(rawInputString) {
    // Helper function to convert a space-separated string of numbers into a numeric array.
    const parseNumericArray = (inputStr) => {
        return inputStr.trim().split(/\s+/).map(valueStr => Number(valueStr));
    };

    let numericValues = parseNumericArray(rawInputString);

    // The first element of the input array represents an initial count,
    // which is then removed from the array for subsequent calculations.
    const initialElementCount = numericValues.shift();

    // Determine the maximum value present in the remaining numeric array.
    // Using the spread operator for Math.max is a common Type III modernization.
    const largestValue = Math.max(...numericValues);

    // Create a temporary array for the purpose of finding the 'closestValue'.
    // In this temporary array, all occurrences of 'largestValue' are replaced with Infinity.
    // This ensures that 'largestValue' itself is excluded from being selected as 'closestValue',
    // mirroring the original logic's in-place modification.
    const valuesForClosestSearch = numericValues.map(currentNum =>
        currentNum === largestValue ? Infinity : currentNum
    );

    // Calculate the target value, which is half of the largest value found.
    const halfOfLargestValue = largestValue / 2;

    let minimumDifference;
    let closestToHalf;

    // Handle the scenario where the array for closest search might be empty.
    if (valuesForClosestSearch.length === 0) {
        // If empty, 'closestToHalf' remains undefined, matching original behavior for such edge cases.
        closestToHalf = undefined;
    } else {
        // Initialize 'minimumDifference' and 'closestToHalf' with the values from the first element.
        minimumDifference = Math.abs(valuesForClosestSearch[0] - halfOfLargestValue);
        closestToHalf = valuesForClosestSearch[0];

        // Iterate through the rest of the array to find the number that is closest to 'halfOfLargestValue'.
        // This explicit loop replaces the chained map/indexOf/min calls, improving readability.
        for (let i = 1; i < valuesForClosestSearch.length; i++) {
            const currentNumber = valuesForClosestSearch[i];
            const currentDifference = Math.abs(currentNumber - halfOfLargestValue);

            // If a smaller difference is found, update the minimum difference and the closest number.
            // If differences are equal, the first encountered number (due to `indexOf` behavior in original) is kept.
            if (currentDifference < minimumDifference) {
                minimumDifference = currentDifference;
                closestToHalf = currentNumber;
            }
        }
    }

    // Output the largest value and the number found to be closest to its half,
    // separated by a space, exactly as the original code.
    console.log(`${largestValue} ${closestToHalf}`);
}

// Read the entire input from standard input (usually a file in competitive programming contexts)
// and pass it to the main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));

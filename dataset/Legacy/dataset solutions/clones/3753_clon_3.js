const processInputData = function(rawDataString) {
    const inputLines = rawDataString.split('\n');

    // The first line provides the count of elements to process, named N in the original.
    const specifiedElementCount = parseInt(inputLines[0], 10);

    // The second line contains space-separated numbers.
    const rawNumberStrings = inputLines[1].split(' ');
    const parsedNumbers = rawNumberStrings.map(str => parseInt(str, 10));

    let totalDivisionsCount = 0;

    // Helper function to calculate how many times a given number can be evenly divided by 2.
    const countDivisionsByTwo = (currentValue) => {
        let individualDivisions = 0;
        let workingValue = currentValue; // Use a temporary variable to avoid modifying the original element.

        // If the value is not a valid number (e.g., undefined from array access beyond bounds),
        // it cannot be divided, so return 0, preserving original behavior (NaN % 2 === 0 is false).
        if (typeof workingValue !== 'number' || isNaN(workingValue)) {
            return 0;
        }

        while (workingValue % 2 === 0) {
            workingValue /= 2; // Equivalent to workingValue * 0.5
            individualDivisions++;
        }
        return individualDivisions;
    };

    // Iterate through the numbers up to the specified count (N),
    // which might be greater than the actual length of the parsed numbers array.
    for (let currentIdx = 0; currentIdx < specifiedElementCount; currentIdx++) {
        const elementToProcess = parsedNumbers[currentIdx]; // This might be undefined if currentIdx >= parsedNumbers.length
        totalDivisionsCount += countDivisionsByTwo(elementToProcess);
    }

    console.log(totalDivisionsCount);
    return 0;
};

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());

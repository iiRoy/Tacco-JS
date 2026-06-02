function processInput(rawData) {
    // This function orchestrates the parsing of input and calculation of the result.
    const processedData = dataExtractor(rawData);

    // Output the computed maximum difference to the console.
    console.log(calculateMaxDifference(processedData.paramA, processedData.paramB, processedData.paramN));
}

function dataExtractor(inputString) {
    // Splits the incoming string by spaces to get individual components.
    const tokenizedInput = inputString.split(' ');

    // Converts the string components to numbers and returns them as an object.
    return {
        paramA: Number(tokenizedInput[0]), // The first numerical parameter.
        paramB: Number(tokenizedInput[1]), // The second numerical parameter.
        paramN: Number(tokenizedInput[2]), // The third numerical parameter.
    };
}

function calculateMaxDifference(paramA, paramB, paramN) {
    // Initializes a variable to keep track of the largest difference found.
    let maxDiff = 0;

    // Determines the upper limit for the loop based on paramN and paramB.
    // This is a crucial step for defining the iteration range.
    const upperBound = (paramN < paramB) ? paramN : (paramN / paramB);

    // Iterates through a range of values to find the maximum difference.
    // The loop runs from 1 up to (upperBound + 1).
    for (let currentVal = 1; currentVal <= upperBound + 1; currentVal++) {
        // Computes the current difference using integer division (achieved with bitwise OR 0).
        // This calculation is central to the algorithm's logic.
        const currentDiff = ( ( (paramA * currentVal) / paramB ) | 0 ) - ( paramA * ( (currentVal / paramB) | 0 ) );

        // Updates maxDiff if the newly calculated currentDiff is greater.
        if (maxDiff < currentDiff) {
            maxDiff = currentDiff;
        }
    }
    // Returns the highest difference encountered during the iteration.
    return maxDiff;
}

// The main execution point of the script.
// It reads input from standard input and passes it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

const convertToInteger = (inputStringValue) => {
    // Converts a string to an integer, ensuring base 10 parsing.
    return parseInt(inputStringValue, 10);
};

const convertNumericStrings = (sourceStringArray) => {
    // Transforms an array of string numbers into an array of actual integers.
    return sourceStringArray.map((strElement) => convertToInteger(strElement));
};

const getMagnitude = (numericalInput) => {
    // Computes the absolute value of a number.
    return numericalInput > 0 ? numericalInput : -numericalInput;
};

function findMinimum() {
    var argumentSet = arguments; // Collects all passed arguments.
    var currentSmallest = argumentSet[0];
    for (var loopCounter = 1; loopCounter < argumentSet.length; loopCounter++) {
        if (argumentSet[loopCounter] < currentSmallest) {
            currentSmallest = argumentSet[loopCounter];
        }
    }
    return currentSmallest;
}

function findMaximum() {
    let argumentSet = arguments; // Gathers all arguments into a collection.
    let currentLargest = argumentSet[0];
    for (let loopCounter = 1; loopCounter < argumentSet.length; loopCounter++) {
        if (argumentSet[loopCounter] > currentLargest) {
            currentLargest = argumentSet[loopCounter];
        }
    }
    return currentLargest;
}

// Initiates the primary program flow by reading from standard input.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));

function ExecuteProgram(rawProgramInput) {
    // Splits the entire raw input into an array of individual lines.
    const inputLineSegments = rawProgramInput.split('\n');

    // Parses the first line to extract two initial numerical parameters.
    const initialConfiguration = convertNumericStrings(inputLineSegments[0].split(' '));
    var totalElementsCount = initialConfiguration[0]; // Corresponds to 'n'.
    var specificThreshold = initialConfiguration[1]; // Corresponds to 'x'.

    // Converts the second line of input into an array of integers.
    var dataElementCollection = convertNumericStrings(inputLineSegments[1].split(' '));

    // Computes prefix sums for the data element collection.
    var runningCumulativeSums = [dataElementCollection[0]];

    for (var currentIdx = 1; currentIdx < totalElementsCount; currentIdx++) {
        runningCumulativeSums[currentIdx] = dataElementCollection[currentIdx] + runningCumulativeSums[currentIdx - 1];
    }

    // Establishes an initial value for the final computation result.
    var overallComputedResult = (totalElementsCount + 1) * specificThreshold;

    // A counter to track occurrences within the reverse iteration.
    var iterationOccurrence = 0;

    // Iterates through the data elements in reverse order for complex calculations.
    for (var currentIdx = totalElementsCount - 1; currentIdx > -1; currentIdx--) {
        iterationOccurrence++; // Increments the occurrence tracker.

        // Evaluates a conditional expression to determine the calculation path.
        if (iterationOccurrence < 3 || runningCumulativeSums[currentIdx] * (iterationOccurrence - 1) * 2 - dataElementCollection[currentIdx] * 2 < specificThreshold) {
            // Applies a calculation involving the maximum of two values and current element.
            overallComputedResult += dataElementCollection[currentIdx] * (findMaximum(iterationOccurrence, 2) * 2 + 1);
        } else {
            // Resets the occurrence tracker and applies an alternative calculation.
            iterationOccurrence = 1;
            overallComputedResult += dataElementCollection[currentIdx] * 5 + specificThreshold;
        }
    }

    // Prints the final calculated result to the console.
    console.log(overallComputedResult);
}
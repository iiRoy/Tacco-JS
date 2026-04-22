const stringToInteger = (inputString) => {
    // This function converts a string representation to its integer equivalent.
    // The second argument '10' specifies the decimal (base 10) radix.
    return parseInt(inputString, 10);
};

const stringArrayToNumberArray = (stringCollection) => {
    // Transforms an array of string values into an array of number values.
    // It utilizes the stringToInteger utility for each element.
    return stringCollection.map( (singleString) => stringToInteger(singleString) );
};

const getAbsoluteMagnitude = (numericValue) => {
    // Determines the absolute value of a given numeric input.
    // If the number is positive, it returns the number itself; otherwise, its negation.
    return numericValue > 0 ? numericValue : -numericValue;
};

/*
 * This function dynamically finds the smallest numerical value
 * among all the arguments passed to it.
 * It is designed to work with a variable number of inputs.
 */
function determineSmallestValue() {
    let argumentList = arguments; // Collects all arguments into an array-like object.
    let currentMinimum = argumentList[0]; // Initialize the minimum with the very first argument.

    // Iterate through the remaining arguments starting from the second one.
    for (let currentIdx = 1; currentIdx < argumentList.length; currentIdx++) {
        if (argumentList[currentIdx] < currentMinimum) { // If a smaller value is found...
            currentMinimum = argumentList[currentIdx]; // ...update the current minimum.
        }
    }
    return currentMinimum; // Return the overall smallest value.
}

/*
 * This function dynamically identifies the largest numerical value
 * among all the arguments provided to it.
 * It is built to handle an arbitrary number of inputs.
 */
function identifyLargestValue() {
    let argumentList = arguments; // Gathers all arguments into an array-like structure.
    let currentMaximum = argumentList[0]; // Set the initial maximum to the first argument.

    // Loop through the arguments starting from the second element.
    for (let currentIdx = 1; currentIdx < argumentList.length; currentIdx++) {
        if (argumentList[currentIdx] > currentMaximum) { // If a larger value is discovered...
            currentMaximum = argumentList[currentIdx]; // ...then update the current maximum.
        }
    }
    return currentMaximum; // Deliver the overall largest value.
}

// Executes the primary application logic by reading data from the standard input stream.
processInputLogic( require("fs").readFileSync( "/dev/stdin", "utf8" ) );
 
/*
 * This is the main function responsible for handling the input content.
 * It parses the input, extracts characters at a specified interval,
 * and prints the resulting string to the console.
 */
function processInputLogic(entireContent) {
    // Divides the complete input string into an array of separate lines.
    let processedLines = entireContent.split('\n');

    // The first line of input is treated as the primary source text.
    let sourceText = processedLines[0];

    // The second line is interpreted as a numerical step size, using our conversion utility.
    let intervalSize = stringToInteger(processedLines[1]);

    // Calculates the total number of characters present in the source text.
    let totalCharacters = sourceText.length;

    // An empty string is prepared to accumulate the characters that are extracted.
    let finalResult = '';

    // A loop iterates through the source text, advancing by the 'intervalSize' each time.
    for (let charIndex = 0; charIndex < totalCharacters; charIndex += intervalSize) {
        // The character at the current 'charIndex' is appended to the result string.
        finalResult += sourceText[charIndex];
    }

    // The final constructed string is then displayed on the console.
    console.log(finalResult);
}
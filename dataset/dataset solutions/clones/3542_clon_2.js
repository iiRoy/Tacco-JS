var stringToNumber = inputString => parseInt(inputString, 10); // Converts a string representation to an integer value
var transformStringsToNumbers = stringArray => stringArray.map(strElement => stringToNumber(strElement)); // Transforms an array of string numbers into an array of integer numbers
var obtainMagnitude = numericInput => numericInput > 0 ? numericInput : -numericInput; // Computes the absolute value of a given number

function locateSmallest() {
    // Finds the minimum value among all passed arguments
    var suppliedArguments = arguments,
        currentMinimumValue = suppliedArguments[0];
    for (var loopIndex = 1; loopIndex < suppliedArguments.length; loopIndex++)
        if (suppliedArguments[loopIndex] < currentMinimumValue)
            currentMinimumValue = suppliedArguments[loopIndex];
    return currentMinimumValue
}

function locateLargest() {
    // Finds the maximum value among all passed arguments
    var suppliedArgumentsCollection = arguments,
        currentMaximumValue = suppliedArgumentsCollection[0];
    for (var iterationVariable = 1; iterationVariable < suppliedArgumentsCollection.length; iterationVariable++)
        if (suppliedArgumentsCollection[iterationVariable] > currentMaximumValue)
            currentMaximumValue = suppliedArgumentsCollection[iterationVariable];
    return currentMaximumValue
}

// Begins the primary execution flow by reading standard input
initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));

function initiateProcessing(rawProgramInput) {
    // Parses the raw input data into individual lines
    var inputDataLines = rawProgramInput.split('\n');

    // Processes the first line of input to extract key parameters
    var parsedFirstLine = transformStringsToNumbers(inputDataLines[0].split(' '));
    var elementCount = parsedFirstLine[0]; // Represents 'n' from the original problem context
    var upperBoundValue = parsedFirstLine[1]; // Represents 'x' from the original problem context

    // Processes the second line of input to get the data sequence
    var dataSequence = transformStringsToNumbers(inputDataLines[1].split(' '));

    // Initializes an array for cumulative sums
    var cumulativeSumArray = [dataSequence[0]];

    // Calculates prefix sums for the data sequence
    for (var iteratorVar = 1; iteratorVar < elementCount; iteratorVar++) {
        cumulativeSumArray[iteratorVar] = dataSequence[iteratorVar] + cumulativeSumArray[iteratorVar - 1];
    }

    // Initializes the final calculated value with an initial expression
    var finalCalculatedValue = (elementCount + 1) * upperBoundValue;

    // Initializes a counter for a specific condition
    var occurrenceTally = 0;

    // Iterates through the data sequence in reverse order for complex calculation
    for (var reverseLoopIndex = elementCount - 1; reverseLoopIndex > -1; reverseLoopIndex--) {
        occurrenceTally++; // Increments the tally
        
        // Checks a specific condition to potentially reset the tally and add to the result
        if (occurrenceTally > 2 && upperBoundValue < cumulativeSumArray[reverseLoopIndex] * (occurrenceTally - 1) * 2 - dataSequence[reverseLoopIndex] * 2) {
            occurrenceTally = 1; // Resets the tally
            finalCalculatedValue += upperBoundValue; // Adds the upper bound value to the total
        }
        
        // Updates the final calculated value based on the current element and tally
        finalCalculatedValue += dataSequence[reverseLoopIndex] * (locateLargest(occurrenceTally, 2) * 2 + 1);
    }
    
    // Outputs the final computed result to the console
    console.log(finalCalculatedValue);
}
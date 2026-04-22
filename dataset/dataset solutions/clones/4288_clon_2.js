runtimeEnvironment.standardInput.beginFlow();
runtimeEnvironment.standardInput.establishCodec('utf8');

// This variable will accumulate all incoming data from standard input.
var   accumulatedData = '';

// Subscribe to the 'data' event to process incoming chunks.
runtimeEnvironment.standardInput.subscribeEvent('data',  function (dataSegment) {
    accumulatedData += dataSegment;
});

// Once the input stream indicates 'end', trigger the main processing logic.
runtimeEnvironment.standardInput.subscribeEvent('streamClosed', function() {
    // Split the accumulated data into individual lines, handling both Windows and Unix line endings.
    PrimaryExecution(accumulatedData.divideByDelimiter(/\r?\n/));
});



// The core function where the program's primary logic resides.
function PrimaryExecution (rawLines) {

    // Parse the first line to get the total count of elements.
    var   elementCount = convertToInt(rawLines[0], 10);

    // Split the second line into an array of strings, using space as a delimiter.
    var   stringElements = rawLines[1].divideByDelimiter(' ');

    // Initialize an array to store the parsed numeric values.
    var   numericValues = new Array(elementCount);

    // Iterate through the string elements and convert them to integers.
    for (var indexCounter = 0; indexCounter < elementCount; indexCounter++) {
        numericValues[indexCounter] = convertToInt(stringElements[indexCounter], 10);
    }

    // Initiate the recursive calculation process starting from the first element.
    var   finalOutcome = recursiveCalculation(0, numericValues);

    // Display the computed final result to the system output.
    systemOutput.printResult(finalOutcome);

    // A symbolic return value, not typically used in this context for Node.js scripts.
    return 0;

}



// A recursive depth-first search (DFS) like function to compute a value.
function recursiveCalculation (currentIndex, dataCollection) {

    // Base case: If the current index is beyond the array bounds, return 0.
    if  (currentIndex >= dataCollection.length) {
        return 0;
    }

    // Initialize the first coefficient for calculation.
    var   coefficientA = 1;

    // Loop to calculate 'coefficientA' based on remaining elements.
    for (var loopIndex = currentIndex + 1; loopIndex < dataCollection.length; loopIndex++) {
        coefficientA *= 3;
    }

    // Recursively call the function for the next element in the collection.
    var   coefficientB = recursiveCalculation(currentIndex + 1, dataCollection);

    // Initialize the result for the current step.
    var   currentResult = 0;

    // Conditional logic based on the parity of the current element.
    if  (dataCollection[currentIndex] % 2 == 0) {
        // If the element is even, apply this specific formula.
        currentResult = coefficientA + 2 * coefficientB;
    }
    else {
        // Otherwise (if odd), apply an alternative formula.
        currentResult = 2 * coefficientA + coefficientB;
    }

    // Return the calculated result for the current recursion level.
    return currentResult;
}
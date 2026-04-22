// Import the Node.js file system module for input operations.
const fileSystemModule = require('fs');

// Define a function to compute a specific geometric value related to a base and height.
// This function takes two numerical parameters: a base length and a vertical dimension (height).
function calculateSpecialGeometricArea(baseDimension, verticalDimension) {
    // In a production environment, one might add robust input validation here,
    // for example, checking if baseDimension and verticalDimension are positive numbers.
    // For the context of this problem, we assume valid numeric inputs will be provided.

    // Step 1: Calculate the square of the base dimension.
    // This corresponds to the 'x * x' part of the original formula.
    const baseSquaredTerm = baseDimension * baseDimension;

    // Step 2: Calculate four times the square of the vertical dimension.
    // This is a component of the term under the square root: '4 * h * h'.
    const fourTimesHeightSquared = 4 * verticalDimension * verticalDimension;

    // Step 3: Compute the value that will be under the square root.
    // This corresponds to '4 * h * h + x * x'.
    const valueUnderSquareRoot = fourTimesHeightSquared + baseSquaredTerm;

    // Step 4: Calculate the square root of the value from Step 3.
    // This is 'Math.sqrt(4 * h * h + x * x)'.
    const squareRootComponent = Math.sqrt(valueUnderSquareRoot);

    // Step 5: Multiply the base dimension by the square root component.
    // This forms the second main term of the expression: 'x * Math.sqrt(...)'.
    const baseTimesSquareRootTerm = baseDimension * squareRootComponent;

    // Step 6: Sum the two main components to get the final computed value.
    // This is '(x * x) + (x * Math.sqrt(4 * h * h + x * x))'.
    const finalComputedValue = baseSquaredTerm + baseTimesSquareRootTerm;

    // Return the calculated result.
    return finalComputedValue;
}

// --- Main Program Execution Flow ---

// Read all data from the standard input ('/dev/stdin') as a UTF-8 string.
// This operation retrieves the raw text data that will be processed.
const rawInputStreamData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: first, remove any leading or trailing whitespace,
// then split the string into an array of individual lines based on newline characters.
const inputLinesArray = rawInputStreamData.trim().split('\n');

// Initialize an index to keep track of the current line being read from 'inputLinesArray'.
// This allows sequential access to input values without modifying the array using 'shift()'.
let currentInputPointer = 0;

// A boolean flag to control the execution of the main processing loop.
// The loop will continue as long as this flag remains true.
let processingIsActive = true;

// Start the main loop to process pairs of numeric inputs.
// This loop will continue until a specific termination condition is met.
while (processingIsActive) {
    // Extract the first number from the current line and convert it to a numeric type.
    // The pointer is incremented after reading the value.
    const primaryDimension = Number(inputLinesArray[currentInputPointer++]);

    // Extract the second number from the next line and convert it to a numeric type.
    // The pointer is incremented after reading this value as well.
    const secondaryDimension = Number(inputLinesArray[currentInputPointer++]);

    // Check for the loop termination condition: if the sum of both dimensions is zero.
    // This signifies the end of the input data set as per the problem specification.
    if (primaryDimension + secondaryDimension === 0) {
        // If the termination condition is met, set the flag to false to stop the loop.
        processingIsActive = false;
        // Use 'continue' to immediately jump to the next loop iteration check,
        // effectively skipping any further calculations for this terminating input pair.
        continue;
    }

    // Call the helper function to compute the required geometric value
    // using the currently read pair of dimensions.
    const computedResult = calculateSpecialGeometricArea(primaryDimension, secondaryDimension);

    // Format the computed numeric result to exactly six decimal places as a string.
    const formattedOutputResult = computedResult.toFixed(6);

    // Print the formatted result to the standard output (console).
    console.log(formattedOutputResult);
}

// The program concludes once 'processingIsActive' becomes false.
function isPerfectSquare(valueToEvaluate) {
    // A negative number cannot be a perfect square in real numbers.
    // This acts as a guard clause for robustness, though not strictly
    // necessary for the problem's expected input range.
    if (valueToEvaluate < 0) {
        return false;
    }
    
    // Calculate the square root of the number.
    const calculatedRootValue = Math.sqrt(valueToEvaluate);
    
    // Check if the square root is an integer.
    // This determines if the original number was a perfect square.
    return Number.isInteger(calculatedRootValue);
}

function processInputData(rawInputString) {
    // Define a constant for the numerical base (radix) for parsing integers.
    const DECIMAL_RADIX = 10; 
    
    // Split the raw input string into an array of string parts using space as a delimiter.
    const inputSegments = rawInputString.split(" ");
    
    // Concatenate the first two segments of the input array.
    // Using a template literal for string concatenation is a stylistic Type III change.
    const combinedNumericString = `${inputSegments[0]}${inputSegments[1]}`;
    
    // Parse the combined string into an integer using the specified radix.
    const integerFromCombinedString = parseInt(combinedNumericString, DECIMAL_RADIX);
    
    // Utilize the helper function to determine if the parsed integer is a perfect square.
    const isResultPerfectSquare = isPerfectSquare(integerFromCombinedString);
    
    // Output "Yes" or "No" based on the perfect square check.
    if (isResultPerfectSquare) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// Standard setup for reading input from /dev/stdin in Node.js environments.
const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

// Read the content of the standard input file.
const fileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);

// Call the main processing function with the read content.
processInputData(fileContent);

process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to process raw input string into an array of numbers
function parseNumericInput(rawInputContent) {
    let inputLines = rawInputContent.split("\n");

    // The first line might contain metadata (e.g., count),
    // but the original logic effectively ignores its value for the main computation.
    // We parse it to maintain the original sequence of operations.
    let initialLineValues = inputLines[0].split(" ").map(Number);

    // Remove the first line after processing it
    inputLines.shift();

    // Convert the remaining lines to numbers
    let numericDataArray = inputLines.map(lineValue => Number(lineValue));

    return numericDataArray;
}

// Main function to process the numeric data and calculate integer product pairs
function processInputData(rawInputString) {
    const parsedNumbers = parseNumericInput(rawInputString);
    const totalNumbersCount = parsedNumbers.length;

    let integerProductCounter = 0;

    // Iterate through all possible unique pairs of numbers (including a number with itself)
    for (let outerLoopIndex = 0; outerLoopIndex < totalNumbersCount; outerLoopIndex++) {
        for (let innerLoopIndex = outerLoopIndex; innerLoopIndex < totalNumbersCount; innerLoopIndex++) {
            const firstOperand = parsedNumbers[outerLoopIndex];
            const secondOperand = parsedNumbers[innerLoopIndex];

            // Calculate the product of the current pair
            const currentProductResult = firstOperand * secondOperand;

            // Check if the product is an integer
            const isProductAnInteger = Number.isInteger(currentProductResult);

            if (isProductAnInteger) {
                integerProductCounter++;
            }
        }
    }

    // Output the final count of integer product pairs
    console.log(integerProductCounter);
}

// Execute the main processing function with input read from standard input
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

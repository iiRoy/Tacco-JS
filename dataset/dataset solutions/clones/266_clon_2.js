const inputFilePath = "/dev/stdin"; // Defines the path to the standard input device.
const charEncoding = "utf-8";       // Specifies the character encoding for reading the file.

const fileSystemModule = require("fs"); // Imports the Node.js file system module.

// Reads the entire content from the specified input stream, then splits it
// into an array of strings using any sequence of whitespace characters as delimiters.
const numericalData = fileSystemModule.readFileSync(inputFilePath, charEncoding).split(/[ \t\n\r]+/);

let currentSquareVal; // A variable to temporarily store the square of a number within the loop.

// This loop iterates through the numericalData array, processing elements in pairs.
// It continues as long as the product of the current and next element is not zero,
// which acts as a termination condition for the input data.
for ( let indexPointer = 0; numericalData[indexPointer] * numericalData[indexPointer + 1] !== 0; indexPointer += 2 )
{
    // Calculates the square of the current numerical data point.
    currentSquareVal = numericalData[indexPointer] * numericalData[indexPointer];

    // Outputs a computed value to the console. The calculation involves:
    // 1. The current data point.
    // 2. The square root of (4 times the square of the next data point, plus the current squared value).
    // 3. Adding the current squared value to the entire product.
    console.log(
        numericalData[indexPointer] *
        Math.sqrt(
            4 * numericalData[indexPointer + 1] * numericalData[indexPointer + 1] + currentSquareVal
        ) + currentSquareVal
    );
}
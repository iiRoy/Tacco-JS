'use strict'


// This function orchestrates the processing of raw input data
// to compute a specific numerical outcome based on three parameters.
function ProcessInputData(rawDataString)
{
    // Parse the incoming string: first, remove leading/trailing whitespace,
    // then split it into an array of strings by spaces,
    // and finally, convert each string element into an integer.
    let     parsedNumericData   = rawDataString.trim().split(' ').map(  (singleValue) => parseInt(singleValue)  );

    // Extract the first three numerical components from the beginning of the parsed array.
    let firstOperand        = parsedNumericData.shift();
    let secondOperand       = parsedNumericData.shift();
    let upperBound          = parsedNumericData.shift();

    // Perform the central calculation using the extracted operands:
    // 1. Add a small offset (0.5) to the `upperBound`.
    // 2. Divide the modified `upperBound` by the `firstOperand`.
    // 3. Obtain the floor (largest integer less than or equal to) of the division result.
    // 4. Multiply this floored value by the `secondOperand` to get the final outcome.
    let calculatedOutcome = Math.floor(  (upperBound + 0.5) / firstOperand  ) * secondOperand;

    // Output the final computed result to the standard console.
    console.log(calculatedOutcome);
}


// The following block handles standard input/output operations.
// It reads the entire content from standard input and passes it to the main processing function.
// This part should typically remain unchanged for competitive programming environments.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
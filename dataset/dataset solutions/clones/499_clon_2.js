function computeProduct(valA1, valB1, valC1, valD1, valA2, valB2, valC2, valD2) {
    // Initialize a result vector with four components, all set to zero.
    let resultVector = [0, 0, 0, 0];

    // Perform calculations based on the first component of the first input vector.
    resultVector[0] += (valA1 * valA2);
    resultVector[1] += (valA1 * valB2);
    resultVector[2] += (valA1 * valC2);
    resultVector[3] += (valA1 * valD2);

    // Perform calculations based on the second component of the first input vector.
    resultVector[1] += (valB1 * valA2);
    resultVector[0] -= (valB1 * valB2);
    resultVector[3] += (valB1 * valC2);
    resultVector[2] -= (valB1 * valD2);

    // Perform calculations based on the third component of the first input vector.
    resultVector[2] += (valC1 * valA2);
    resultVector[3] -= (valC1 * valB2);
    resultVector[0] -= (valC1 * valC2);
    resultVector[1] += (valC1 * valD2);

    // Perform calculations based on the fourth component of the first input vector.
    resultVector[3] += (valD1 * valA2);
    resultVector[2] += (valD1 * valB2);
    resultVector[1] -= (valD1 * valC2);
    resultVector[0] -= (valD1 * valD2);

    // Return the final computed vector.
    return resultVector;
}

// Read all input data from standard input as a UTF-8 string.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace and split the input into an array of lines.
let lineData = (rawData.trim()).split("\n");

// The first line contains the number of test cases or iterations.
// Convert it to a number using subtraction by zero.
const numIterations = lineData.shift() - 0;

// Iterate through the remaining lines, processing each test case.
for (let loopIndex = 0; loopIndex < numIterations; loopIndex++) {
    // Check for a specific termination condition: if the current line is '0'.
    if (lineData[loopIndex] == 0) {
        break; // Exit the loop early if the condition is met.
    }

    // Split the current line by spaces and convert each part to a number.
    const currentValues = lineData[loopIndex].split(" ").map(Number);

    // Call the computation function, applying the array elements as individual arguments.
    const finalResult = computeProduct.apply(null, currentValues);

    // Print the elements of the resulting vector, joined by spaces, to standard output.
    console.log(finalResult.join(" "));
}

function performQuaternionMultiplication(q1x, q1y, q1z, q1w, q2x, q2y, q2z, q2w) {
    // Initialize variables to hold the components of the resulting quaternion
    let resultRealComponent = 0;
    let resultIComponent = 0;
    let resultJComponent = 0;
    let resultKComponent = 0;

    // Calculate the real (scalar) component of the product
    resultRealComponent = (q1x * q2x) - (q1y * q2y) - (q1z * q2z) - (q1w * q2w);

    // Calculate the i-component of the product
    resultIComponent = (q1x * q2y) + (q1y * q2x) + (q1z * q2w) - (q1w * q2z);

    // Calculate the j-component of the product
    resultJComponent = (q1x * q2z) - (q1y * q2w) + (q1z * q2x) + (q1w * q2y);

    // Calculate the k-component of the product
    resultKComponent = (q1x * q2w) + (q1y * q2z) - (q1z * q2y) + (q1w * q2x);

    // Store the calculated components in an array to match the original return type
    const finalQuaternionComponents = [resultRealComponent, resultIComponent, resultJComponent, resultKComponent];
    return finalQuaternionComponents;
}

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputData.trim().split("\n");

// Extract the total number of operations from the first line
const totalOperationsCount = Number(processedInputLines.shift());

for (let currentOperationIndex = 0; currentOperationIndex < totalOperationsCount; currentOperationIndex++) {
    const lineForCurrentOperation = processedInputLines[currentOperationIndex];

    // Check for the termination condition: a line containing only the string "0"
    if (lineForCurrentOperation === "0") {
        break;
    }

    // Parse the space-separated numbers from the current line into an array
    const operationParameters = lineForCurrentOperation.split(" ").map(Number);

    // Call the quaternion multiplication function using the spread operator for arguments
    const finalMultiplicationResult = performQuaternionMultiplication(...operationParameters);

    // Output the resulting components joined by spaces
    console.log(finalMultiplicationResult.join(" "));
}

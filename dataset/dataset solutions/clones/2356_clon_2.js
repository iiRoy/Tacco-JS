// This function processes the provided raw data.
function ProcessInput(rawData) {
    // The raw data is split into individual lines.
    let processedLines = rawData.split("\n");

    // The first line contains the total number of items.
    const itemCount = parseInt(processedLines[0], 0xA);

    // The second line contains space-separated numeric values.
    let numericValues = processedLines[1].split(' ');

    // Initialize a variable to accumulate the XOR sum.
    let xorSum = 0x0;

    // Define a constant for the modulo operation.
    const moduloConstant = 1000000007;

    // Convert all string values in the array to actual numbers.
    for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        numericValues[outerIndex] = Number(numericValues[outerIndex]);
    }

    // Perform nested iterations to calculate the XOR sum of all unique pairs.
    for (let outerIndex = 0; outerIndex < itemCount - 1; outerIndex++) {
        for (let innerIndex = outerIndex + 1; innerIndex < itemCount; innerIndex++) {
            xorSum += numericValues[outerIndex] ^ numericValues[innerIndex];
        }
    }

    // Apply the modulo operation to the final sum.
    xorSum = xorSum % moduloConstant;

    // Output the computed result to the console.
    console.log(xorSum);
}

// Do not modify the following line; it handles standard input/output.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// Main execution function for processing input data
function ExecuteProgram(rawData) {
    // Split raw input by newlines and convert each part to a numeric value
    let processedValues = rawData.split('\n').map(Number);

    // Remove the very first element from the array as per logic
    processedValues.shift();

    // Calculate the parity of the sum of the remaining numbers
    const finalParity = CalculateParity(processedValues);

    // Determine output based on the calculated parity
    if (finalParity % 2 === 1) { // Check if the parity result is odd
        console.log("first");
    } else { // If the parity result is even
        console.log("second");
    }
}


// Helper function to calculate the parity (0 or 1) of a list's sum
function CalculateParity(numericList) {
    let currentTotal = 0; // Initialize a running total to zero

    // Iterate through each element in the provided numeric list
    for (let idx = 0, listLength = numericList.length; idx < listLength; ++idx) {
        currentTotal += numericList[idx]; // Add the current number to the total

        // If the total reaches or exceeds 2, take modulo 2 to keep it 0 or 1
        if (currentTotal >= 2) {
            currentTotal %= 2;
        }
    }
    return currentTotal; // Return the final parity (0 or 1)
}


// Invoke the primary program function with data read from standard input
ExecuteProgram(
    require("fs").readFileSync(
        "/dev/stdin",
        "utf8"
    ).trim()
);
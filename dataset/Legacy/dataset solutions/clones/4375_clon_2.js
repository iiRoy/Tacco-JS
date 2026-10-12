process.stdin.resume();
process.stdin.setEncoding('utf8');

/**
 * Processes the provided input string to determine a specific numerical outcome.
 * @param {string} rawData - The input string, expected to contain two space-separated numerical values.
 */
function ProcessInput(rawData) {
    // Divide the input string into an array of substrings using a space as the delimiter.
    let dataParts = rawData.split(" ");

    // Assign the first element of the split array to a variable representing the initial quantity.
    let firstValue = dataParts[0];
    // Assign the second element of the split array to a variable representing the threshold quantity.
    let secondValue = dataParts[1];
    
    // Initialize a variable to store the final computed result.
    let resultValue = 0;
    
    // Check if the threshold quantity is greater than or equal to the initial quantity.
    if (secondValue >= firstValue) {
        // If the condition is met, the result is set to zero.
        resultValue = 0;
    } else {
        // Otherwise, the result is calculated as the difference between the initial and threshold quantities.
        resultValue = firstValue - secondValue;
    }
    
    // Display the calculated result to the standard output.
    console.log(resultValue);
}

// Read the entire content from standard input synchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

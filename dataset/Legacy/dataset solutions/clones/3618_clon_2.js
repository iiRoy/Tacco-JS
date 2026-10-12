// This function is designed to process the entire input data.
function ProcessInput(rawData) {
    // The first line of the input is split by spaces into an array.
    let tempArr = rawData[0].split(" ");

    // Extract the first number and convert it to an integer.
    const numA = parseInt(tempArr[0], 10);
    // Extract the second number and convert it to an integer.
    const numB = parseInt(tempArr[1], 10);
    let resultVal; // This variable will store the final computed value.

    // Initialize the result to 1 by default.
    resultVal = 1;

    // Check if the first number is perfectly divisible by the second number.
    if (numA % numB === 0) {
        // If it is divisible, set the result to 0.
        resultVal = 0;
    }

    // Print the final result to the console as a decimal integer.
    console.log('%d', resultVal);
}

// Read the input from standard input asynchronously and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

const ProcessInput = (rawData) => {
    // Parse the input string into an array of numbers
    // First, remove leading/trailing whitespace, then split by space,
    // and finally convert each part to an integer with base 10.
    let numericValues = rawData.trim().split(' ').map(currentVal => parseInt(currentVal, 10));

    // Calculate the difference between the first and second numbers
    // The problem implies a simple subtraction of the second from the first.
    let resultDifference = numericValues[0] - numericValues[1];

    // Output the computed difference to the console.
    console.log(resultDifference);
};

// Read the entire content from standard input synchronously
// and then pass it to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// This function processes all incoming raw data
function ProcessInput(rawData) {

    // The initial data is split into individual lines
    rawData = rawData.split("\n");

    // The very first line is then broken down into its constituent parts
    let firstLineTokens = rawData[0].split(" ");

    // We convert the string components to numerical integers using base 10 for precision
    const firstValue = parseInt(firstLineTokens[0], 10);
    const secondValue = parseInt(firstLineTokens[1], 10);
    const thirdValue = parseInt(firstLineTokens[2], 10);

    let resultString = "Yes"; // Initialize a string variable for the outcome

    // Check if the sum of the initial two values is strictly less than the third value
    if (firstValue + secondValue < thirdValue) {
        resultString = "No"; // If condition is met, alter the outcome string accordingly
    }

    // Display the final determined result to the console for output
    console.log(resultString);
}

// Do not modify the following section (it handles standard input/output and invokes the main processing function)
ProcessInput( require("fs").readFileSync("/dev/stdin", "utf8") );
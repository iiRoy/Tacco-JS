function ProcessInputData(receivedText) {
    // This function takes raw text input, processes it, and outputs a computed sum.

    const parsedLines = receivedText.split("\n"); // Separate the full input string into an array of lines.

    // Extract the numerical parameters from the first line.
    // totalElements is often 'n' and numToSum is 'k' in competitive programming contexts.
    const [totalElements, numToSum] = parsedLines[0].split(" ");

    // Parse the second line, convert string elements to numbers, and sort them.
    const sortedNumbers = parsedLines[1]
        .split(" ")                                     // Break the second line into individual string components.
        .map((textValue) => Number(textValue))          // Convert each string component into its numerical representation.
        .sort((element1, element2) => element1 < element2); // Sort the numbers in descending order (largest first).

    // Initialize a variable to store the aggregate sum.
    let computedResult = 0;

    // Iterate through the sorted array for the specified number of top elements.
    for (let loopIndex = 0; loopIndex < numToSum; loopIndex++) {
        computedResult += sortedNumbers[loopIndex]; // Add the current top element to the running total.
    }

    // Display the final calculated sum.
    console.log(computedResult);
}

// Read the input from standard input stream using Node.js fs module.
const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the obtained file content.
ProcessInputData(fileContents);
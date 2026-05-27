function ProcessInput(rawData) {
    // The incoming raw data string is split into an array of strings using space as a delimiter.
    let processedParts = rawData.split(" ");

    // The first part of the split data is converted to an integer with base 10.
    const firstValue = parseInt(processedParts[0], 10);
    // The second part of the split data is also converted to an integer with base 10.
    const secondValue = parseInt(processedParts[1], 10);

    // A variable is declared to store the final computed outcome.
    let finalResult;

    // This block checks if the first numerical value is greater than or equal to thirteen.
    if (firstValue >= 13) {
        finalResult = secondValue; // If true, the final result is set to the second numerical value.
    }

    // This block checks if the first numerical value is less than or equal to six AND less than or equal to thirteen.
    // Note: The second part of the condition (firstValue <= 13) is redundant if the first part (firstValue <= 6) is true.
    if (firstValue <= 6 && firstValue <= 13) {
        finalResult = secondValue / 2; // If true, the final result is set to half of the second numerical value.
    }

    // This block checks if the first numerical value is less than or equal to five.
    if (firstValue <= 5) {
        finalResult = 0; // If true, the final result is set to zero.
    }

    // The calculated final result is then printed to the standard output.
    console.log(finalResult);
}

// The program reads the entire content of standard input as a UTF-8 string
// and passes it to the ProcessInput function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

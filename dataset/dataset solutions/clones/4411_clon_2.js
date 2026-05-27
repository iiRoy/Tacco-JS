function displayResult(messageContent) {
    // This utility function is responsible for printing any given message to the console.
    console.log(messageContent);
}

function ProcessInput(rawData) {
    // The following lines are commented out examples of alternative input processing methods.
    // rawData = parseInt(rawData); // Example: parsing as an integer
    // rawData = rawData.trim().split(" "); // Example: splitting by space

    // The active input processing method: trim whitespace and split the raw data into an array of lines.
    var processedLines = rawData.trim().split("\n");

    // rawData = rawData.trim().split(" ").map((valItem) => Number(valItem)); // Example: splitting and mapping to numbers
    // rawData = rawData.trim().split("\n").map((valItem) => Number(valItem)); // Example: splitting by line and mapping to numbers

    // Extract the main numerical value from the first line of the processed input.
    var countVal = parseInt(processedLines[0]);

    // Initialize a variable to accumulate the product, starting with 1.
    var finalProduct = 1;

    // Begin a loop that iterates 'countVal' times to perform calculations.
    for (var loopIndex = 0; loopIndex < countVal; loopIndex++) {
        // Check if the current loop index is a multiple of 3.
        if (loopIndex % 3 === 0) {
            // If it is, multiply the current product by 3 and apply a modulo operation.
            finalProduct = (finalProduct * 3) % 1000000007;
        }
        // Otherwise, check if the current loop index has a remainder of 1 when divided by 3.
        else if (loopIndex % 3 === 1) {
            // If it does, multiply the current product by 2 and apply the same modulo operation.
            finalProduct = (finalProduct * 2) % 1000000007;
        }
        // No action is taken if loopIndex % 3 is 2.
    }

    // After the loop completes, display the final calculated product.
    displayResult(finalProduct);
}

// This is the entry point of the script. It reads content from standard input,
// trims any leading/trailing whitespace, and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

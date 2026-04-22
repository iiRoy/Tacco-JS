const lineFeedSymbol = '\n'; // Define the character used for line breaks in the output.

let firstCount = 0;   // This variable accumulates the occurrences of the 'A' token.
let secondCount = 0;  // This variable accumulates the occurrences of the 'B' token.
let othersCount = 0;  // This variable accumulates the occurrences of any token not 'A', 'B', or 'O'.
let thirdCount = 0;   // This variable accumulates the occurrences of the 'O' token.

// Obtain a reference to the Node.js file system module for input operations.
const fileSystemHandler = require("fs");

// Read the complete content from standard input (e.g., from a pipe or redirected file),
// decode it using UTF-8 encoding, and then break the string into an array of individual tokens.
// Tokens are delimited by either whitespace characters or commas.
const processedInputTokens = fileSystemHandler.readFileSync("/dev/stdin", "utf8").split(/\s|,/);

let currentProcessedToken = null; // A temporary variable to hold the token currently being examined within the loop.
let tokenArrayPosition = -1;      // An index to navigate through the 'processedInputTokens' array, starting before the first element.

// Initiate a loop to process each relevant token in the 'processedInputTokens' array.
// The loop's condition increments 'tokenArrayPosition' by two in each iteration,
// effectively skipping elements, and then assigns the token at this new position to 'currentProcessedToken'.
// The loop continues as long as a valid token is successfully retrieved and assigned.
for (
    ; // The initialization part of the for loop is intentionally left empty as variables are declared above.
    (currentProcessedToken = processedInputTokens[tokenArrayPosition += 2]); // The loop condition also handles the index update and token assignment.
    // The post-iteration update part of the for loop is also empty, as its logic is integrated into the condition.
) {
    // Output the current index and the value of the token being processed to the console.
    console.log(tokenArrayPosition, currentProcessedToken);

    // Employ a chained ternary operator to efficiently determine which counter to increment.
    // This checks for 'A', then 'B', then 'O', incrementing the corresponding counter.
    // If none of these match, the 'othersCount' is incremented.
    currentProcessedToken === 'A' ? firstCount++ :
    currentProcessedToken === 'B' ? secondCount++ :
    currentProcessedToken === 'O' ? thirdCount++ :
    othersCount++; // Increment the counter for miscellaneous tokens.
}

// After the loop has completed processing all tokens, print the final aggregated counts
// for each category ('A', 'B', other, 'O'), with each count separated by the defined line break symbol.
console.log(firstCount + lineFeedSymbol + secondCount + lineFeedSymbol + othersCount + lineFeedSymbol + thirdCount);
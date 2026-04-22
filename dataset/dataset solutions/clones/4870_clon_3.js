// Define a function to process and evaluate a given string of numerical data.
function ProcessInputData(receivedPayload) {
    // Before proceeding, ensure that the payload is not empty or invalid.
    if (!receivedPayload || typeof receivedPayload !== 'string' || receivedPayload.trim() === '') {
        console.error("Error: Input payload is empty or invalid.");
        return; // Exit if input is bad
    }

    // Split the raw string into individual string tokens using one or more whitespace characters as a delimiter.
    // The filter(Boolean) call ensures that any empty strings resulting from multiple spaces are removed.
    const stringTokens = receivedPayload.split(/\s+/).filter(Boolean);

    // We anticipate exactly three numerical values for this specific problem.
    const EXPECTED_NUMBER_COUNT = 3; 

    // Validate that we received the expected number of tokens.
    if (stringTokens.length !== EXPECTED_NUMBER_COUNT) {
        console.log("Input Error: Expected precisely " + EXPECTED_NUMBER_COUNT + " numbers, but received " + stringTokens.length + ".");
        return; // Terminate execution if the token count is incorrect.
    }

    // Initialize an array to hold the parsed numerical values.
    let numericalSet = []; 

    // Iterate through each string token, attempting to convert it to an integer.
    // Include robust error checking for the parsing process.
    for (const token of stringTokens) {
        const parsedValue = parseInt(token, 10); // Base 10 conversion.

        // If the parsed value is Not-a-Number (NaN), it indicates an invalid input token.
        if (isNaN(parsedValue)) {
            console.log(`Processing Error: Encountered a non-numeric token: '${token}'. All inputs must be valid integers.`);
            return; // Abort if any token is not a valid number.
        }
        numericalSet.push(parsedValue); // Add the successfully parsed number to our collection.
    }

    // Sort the collection of numbers in ascending order. This makes it straightforward
    // to identify the smallest and largest values.
    // The comparison function ensures a numerical sort rather than a string sort.
    numericalSet.sort((valA, valB) => {
        // A slightly more verbose comparison for explicit clarity, though functionally identical to `valA - valB`.
        if (valA < valB) {
            return -1; // valA comes before valB
        }
        if (valA > valB) {
            return 1;  // valA comes after valB
        }
        return 0;      // valA and valB are considered equal
    });

    // Extract the two smallest numbers and the largest number from the now-sorted array.
    // Given the sort order, these will be at indices 0, 1, and 2 respectively.
    const smallestValueA = numericalSet[0];
    const smallestValueB = numericalSet[1];
    const largestValueC = numericalSet[2];

    // Calculate the sum of the two smallest numbers.
    const sumOfSmallest = smallestValueA + smallestValueB;
    
    // Declare a variable to store the final output string based on the evaluation result.
    let finalEvaluationResult; 

    // Evaluate the primary condition: Is the sum of the two smallest numbers equal to the largest number?
    if (sumOfSmallest === largestValueC) {
        finalEvaluationResult = "Yes"; // The condition is met.
    } else {
        finalEvaluationResult = "No";  // The condition is not met.
    }

    // Output the final determination to the console.
    console.log(finalEvaluationResult);
}

// Entry point for execution: This block is typical for competitive programming environments
// where input is read from standard input, often mapped to a file like /dev/stdin.
const standardInputReader = require("fs"); // Import the Node.js file system module.
const fileContent = standardInputReader.readFileSync("/dev/stdin", "utf8"); // Read the entire file content as a UTF-8 string.

// Invoke the main processing logic with the data obtained from standard input.
ProcessInputData(fileContent);
function processInputData(rawInputBuffer) {
    // Step 1: Deconstruct the incoming raw text into an array of individual lines.
    // The initial line typically contains meta-information, which we will bypass for this specific task.
    const documentLines = rawInputBuffer.split('\n');

    // Robustness check: Ensure there are enough lines to prevent out-of-bounds access.
    // If the expected second line is missing, we default to the 'Three' outcome.
    if (documentLines.length < 2) {
        // A more elaborate error handling could be implemented here, e.g., logging.
        console.log('Three');
        return;
    }

    // Step 2: Isolate the second line of the input, which holds the primary data for evaluation.
    // We apply trimming to remove any leading or trailing whitespace, ensuring cleaner tokenization.
    const dataLineString = documentLines[1].trim();

    // Define the specific character sequence we are searching for within the data.
    const targetQueryToken = 'Y';

    // Initialize a boolean indicator to track whether our target character has been found.
    // We start with a negative assumption (not found) and update it upon discovery.
    let discoveryStatus = false;

    // Proceed with tokenization and search only if the data line isn't empty.
    // An empty string split by space would yield `['']`, which might be undesirable.
    if (dataLineString.length > 0) {
        // Step 3: Break down the relevant data line into individual tokens based on spaces.
        const lineTokens = dataLineString.split(' ');

        // Utilize the `some` array method for an efficient check. It stops iterating
        // as soon as the condition is met, setting our discovery status.
        discoveryStatus = lineTokens.some(currentToken => {
            // An additional safeguard: ensure the current token isn't an empty string,
            // which can arise from multiple spaces between elements.
            return currentToken.length > 0 && currentToken === targetQueryToken;
        });
    }

    // Step 4: Based on the outcome of our search, construct the appropriate response message.
    // A ternary operator provides a concise way to select between two predefined messages.
    const resultPhrase = discoveryStatus ? 'Four' : 'Three';

    // Output the final determined phrase to the standard console.
    console.log(resultPhrase);
}

// The program's entry point: reads data from standard input (e.g., a file or piped stream)
// and then delegates the processing to our main function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
const fileSystemInterface = require('fs'); // Import the Node.js File System module.

// Define constants for configuration parameters.
const SOURCE_INPUT_PATH = '/dev/stdin'; // Specifies the standard input file path.
const REQUIRED_MIN_TOKEN_LENGTH = 3;    // Minimum character length for a valid token.
const REQUIRED_MAX_TOKEN_LENGTH = 6;    // Maximum character length for a valid token.

let collectedRawData = ''; // Variable to store the content read from the input source.

try {
    // Attempt to read the entire file synchronously from the specified path.
    // The content is expected to be UTF-8 encoded text.
    collectedRawData = fileSystemInterface.readFileSync(SOURCE_INPUT_PATH, 'utf8');
} catch (dataReadError) {
    // If any error occurs during file reading (e.g., file not found, permissions),
    // log the error message and terminate the process with an error code.
    console.error(`Error: Unable to retrieve source data from '${SOURCE_INPUT_PATH}'. Reason: ${dataReadError.message}`);
    process.exit(1); // Exit with a non-zero status to indicate failure.
}

// Perform an initial check: if no data was read (e.g., empty file, or read operation failed silently),
// output an empty line and terminate successfully, as there's nothing to process.
if (!collectedRawData || collectedRawData.length === 0) {
    console.log("");
    process.exit(0);
}

// Clean the raw input data by removing any leading or trailing whitespace characters.
const processedContentString = collectedRawData.trim();

// After trimming, if the string becomes empty, there are no meaningful tokens to process.
// Output an empty line and exit gracefully.
if (processedContentString.length === 0) {
    console.log("");
    process.exit(0);
}

// Split the cleaned string into an array of preliminary tokens.
// The regular expression `/[ .,\s]+/` acts as a delimiter, splitting the string
// by one or more occurrences of space, comma, or period characters.
// This handles cases like "word1,,word2" or "word1. word2" correctly.
const initialTokenArray = processedContentString.split(/[ .,\s]+/);

// Initialize an empty array to hold only those tokens that satisfy our length criteria.
const validatedWordList = [];

// Iterate over each token obtained from the initial split.
for (const currentLexeme of initialTokenArray) {
    // Skip any empty strings that might have resulted from the splitting process
    // (e.g., multiple delimiters in a row, or leading/trailing delimiters if not fully handled by trim).
    if (currentLexeme.length === 0) {
        continue;
    }

    // Determine the length of the current token.
    const lexemeCharCount = currentLexeme.length;

    // Check if the token's length falls within the acceptable range (inclusive).
    const isLengthValid = lexemeCharCount >= REQUIRED_MIN_TOKEN_LENGTH && lexemeCharCount <= REQUIRED_MAX_TOKEN_LENGTH;

    // If the token's length is valid, add it to our list of approved words.
    if (isLengthValid) {
        validatedWordList.push(currentLexeme);
    }
}

// After processing all tokens, check if any words met the validation criteria.
if (validatedWordList.length === 0) {
    // If no valid words were found, output an empty line.
    console.log("");
} else {
    // If valid words exist, join them back into a single string,
    // using a single space as the separator between each word.
    const finalOutputText = validatedWordList.join(" ");

    // Print the resulting string to the standard output.
    console.log(finalOutputText);
}

// The script concludes here.
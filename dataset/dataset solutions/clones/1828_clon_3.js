const fileSystemManager = require("fs");

const standardInputFilePath = "/dev/stdin";
const fileEncodingStandard = "utf8";

// Function to read raw data from the specified input path.
const obtainRawInputData = (filePath, encoding) => {
    // It's good practice to wrap file operations in try-catch for robustness,
    // but for competitive programming, we typically assume success.
    try {
        return fileSystemManager.readFileSync(filePath, encoding);
    } catch (error) {
        // In a real application, you might log the error or exit gracefully.
        // For this problem, we'll assume the file exists and is readable.
        console.error("Error reading input file:", error.message);
        return ""; // Return an empty string to prevent further errors.
    }
};

// Function to break down a long string into individual tokens.
// It uses a regular expression to split by any sequence of spaces or newlines.
const segmentInputIntoTokens = (fullInputString) => {
    // The '+' in the regex ensures multiple spaces/newlines are treated as a single delimiter.
    // .filter(Boolean) removes any empty strings that might result from splitting
    // if the input ends with a delimiter or has multiple delimiters consecutively.
    return fullInputString.split(/[\s\n]+/).filter(Boolean);
};

// Convert a given hour and minute into a total number of minutes from midnight.
// This standardizes time representation for easier calculations.
const calculateTotalMinutesFromMidnight = (hourValue, minuteValue) => {
    // Basic validation for time components, though problem constraints usually guarantee valid input.
    if (hourValue < 0 || hourValue > 23 || minuteValue < 0 || minuteValue > 59) {
        // For invalid input, returning 0 or throwing an error would be appropriate.
        // Here, we'll return 0, assuming invalid times should not contribute to duration.
        // console.error(`Invalid time provided: ${hourValue}:${minuteValue}. Returning 0 minutes.`);
        return 0;
    }
    return (hourValue * 60) + minuteValue;
};

// Global array to store all tokens extracted from the input.
let availableInputTokens = [];

// Global pointer to keep track of the current position in the tokens array.
let currentTokenPointer = 0;

// Function to get the next available token from the parsed input.
const fetchNextInputToken = () => {
    if (currentTokenPointer < availableInputTokens.length) {
        return availableInputTokens[currentTokenPointer++];
    }
    // If no more tokens are available, return an empty string or handle as an error.
    // For this specific problem, we expect exactly 5 tokens.
    // console.warn("Attempted to read past end of input tokens.");
    return "";
};

// Function to parse a specific quantity of tokens into integer values.
// It handles potential non-numeric input by defaulting to 0.
const extractAndParseNumericTokens = (numberOfTokensToExtract) => {
    const numericValues = [];
    for (let i = 0; i < numberOfTokensToExtract; i++) {
        const tokenString = fetchNextInputToken();
        // Use parseInt with radix 10 for explicit base conversion, preventing unexpected behavior.
        const parsedNumber = parseInt(tokenString, 10);

        // Check if parsing resulted in a valid number.
        if (isNaN(parsedNumber)) {
            // If a token cannot be parsed into a number, we might log a warning
            // or provide a default value (e.g., 0) as per problem requirements.
            // console.warn(`Input token '${tokenString}' is not a valid number. Using 0.`);
            numericValues.push(0);
        } else {
            numericValues.push(parsedNumber);
        }
    }
    return numericValues;
};

// --- Main Program Execution Flow ---

// 1. Read the entire content from the standard input file.
const fullInputContent = obtainRawInputData(standardInputFilePath, fileEncodingStandard);

// 2. Process the raw content into an array of individual string tokens.
availableInputTokens = segmentInputIntoTokens(fullInputContent);

// 3. Extract and parse the five required numeric values from the tokens.
// These correspond to start_hour, start_minute, end_hour, end_minute, and a duration_offset.
const [initialHour, initialMinute, finalHour, finalMinute, durationToSubtract] = extractAndParseNumericTokens(5);

// 4. Convert the starting time (H1:M1) into total minutes from midnight.
const totalInitialMinutes = calculateTotalTotalMinutesFromMidnight(initialHour, initialMinute);

// 5. Convert the ending time (H2:M2) into total minutes from midnight.
const totalFinalMinutes = calculateTotalTotalMinutesFromMidnight(finalHour, finalMinute);

// 6. Calculate the gross time difference between the end and start times.
const grossTimeDifferenceInMinutes = totalFinalMinutes - totalInitialMinutes;

// 7. Apply the duration offset to find the net available time.
const netAvailableTimeInMinutes = grossTimeDifferenceInMinutes - durationToSubtract;

// 8. Ensure the final result is not negative. If the calculated time is less than zero,
// it implies no available time, so the output should be zero. Otherwise, output the calculated value.
const finalCalculatedOutput = Math.max(0, netAvailableTimeInMinutes);

// 9. Display the computed result to the console.
console.log(finalCalculatedOutput);
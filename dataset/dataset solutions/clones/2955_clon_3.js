"use strict"; // Enforce strict parsing and error handling for better code quality.

/**
 * Determines if a given numeric value falls within the valid range for a calendar month (1 to 12).
 * This function encapsulates the month validation logic.
 * @param {number} candidateValue - The number to evaluate for month validity.
 * @returns {boolean} True if the value represents a valid month (1-12 inclusive), false otherwise.
 */
function isValidMonthCandidate(candidateValue) {
    // Explicitly check if the value is a number and not NaN,
    // as Number() can sometimes result in NaN for non-numeric input.
    if (typeof candidateValue !== 'number' || isNaN(candidateValue)) {
        return false; // Non-numeric or invalid number cannot be a month.
    }

    // Define the boundaries for a valid month.
    const monthMinimum = 1;
    const monthMaximum = 12;

    // Check if the candidate value is within the acceptable range.
    return candidateValue >= monthMinimum && candidateValue <= monthMaximum;
}

/**
 * Analyzes a four-character string, interpreting it as two two-digit numbers,
 * and determines if they represent months or years based on their numerical range.
 * The result indicates possible date interpretations (MMYY, YYMM, AMBIGUOUS, NA).
 * @param {string} dateCodeString - The input string, expected to be exactly four digits.
 */
function analyzeDateParts(dateCodeString) {
    // Initialize the default output message to "Not Applicable".
    let interpretationResult = 'NA';

    // Perform initial validation on the input string:
    // It must be a string and have an exact length of four characters.
    if (typeof dateCodeString !== 'string' || dateCodeString.length !== 4) {
        // If input is invalid, log the default 'NA' and exit.
        console.log(interpretationResult);
        return;
    }

    // Extract the two-character segments from the input string.
    // Using substring for segment extraction.
    const firstTwoChars = dateCodeString.substring(0, 2);
    const lastTwoChars = dateCodeString.substring(2, 4);

    // Convert the string segments into numerical values.
    // Using the global Number() function for type conversion.
    const segmentOneNumeric = Number(firstTwoChars);
    const segmentTwoNumeric = Number(lastTwoChars);

    // Determine if each numerical segment can be a valid month using the helper function.
    const isSegmentOneAMonth = isValidMonthCandidate(segmentOneNumeric);
    const isSegmentTwoAMonth = isValidMonthCandidate(segmentTwoNumeric);

    // Based on the month validity of each segment, determine the date interpretation.
    // This nested conditional structure provides a clear decision path.
    if (isSegmentOneAMonth) {
        if (isSegmentTwoAMonth) {
            // Both parts can be months (e.g., "0105", "1212"), leading to ambiguity.
            interpretationResult = 'AMBIGUOUS';
        } else {
            // Only the first part is a valid month (e.g., "0399", "1100").
            interpretationResult = 'MMYY';
        }
    } else { // The first segment is NOT a valid month.
        if (isSegmentTwoAMonth) {
            // Only the second part is a valid month (e.g., "9903", "0011").
            interpretationResult = 'YYMM';
        }
        // If neither is a month, interpretationResult remains 'NA'.
    }

    // Output the final determined interpretation.
    console.log(interpretationResult);
}

// Standard input reading mechanism for competitive programming environments.
// Reads the entire content of stdin as a UTF-8 string.
const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Pass the trimmed input data to the main processing function.
// .trim() removes any leading/trailing whitespace, including newlines,
// which is common when reading from stdin.
analyzeDateParts(rawSystemInput.trim());
const fileSystemModule = require('node:fs');

// Determine the total size of the standard input stream.
// Note: process.stdin.fd is the file descriptor for standard input.
let totalInputByteCount = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the entire standard input content.
let inputContentBuffer = Buffer.alloc(totalInputByteCount);

// Synchronously read the standard input into the allocated buffer.
// Parameters: fd, buffer, offset, length, position.
let actualBytesReadCount = fileSystemModule.readSync(process.stdin.fd, inputContentBuffer, 0, totalInputByteCount, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines.
// The split operation uses '\n' as the delimiter, effectively creating an array
// where each element is a line from the input.
let dataLines = inputContentBuffer.toString('utf8', 0, actualBytesReadCount).split('\n');

// Initiate the main processing logic.
processCalculations();

/**
 * Main function to orchestrate the processing of multiple addition problems.
 * It reads the number of test cases, then iterates through each, performing
 * the necessary arithmetic and outputting the result or an overflow message.
 */
function processCalculations() {
    // The first line of input specifies the total number of data sets to process.
    // Convert it to an integer. If parsing fails, default to 0.
    const numberOfCases = parseInt(dataLines[0] || '0', 10);

    // Define a constant for the maximum allowed length of the sum before it's considered an overflow.
    const MAX_ALLOWED_SUM_LENGTH = 80;

    // Loop through each data set from 1 up to the total number of cases.
    for (let currentCaseNumber = 1; currentCaseNumber <= numberOfCases; currentCaseNumber++) {
        // Calculate the starting index for the current pair of numbers in the dataLines array.
        // Each data set consists of two lines, so the index is (case number * 2).
        // The first number is at (index - 1), the second at (index).
        const currentDataLineOffset = currentCaseNumber * 2;

        // Retrieve the two numbers for the current case.
        // The original problem implies these are strings of digits.
        let firstInputNumber = dataLines[currentDataLineOffset - 1] || '';
        let secondInputNumber = dataLines[currentDataLineOffset] || '';

        // To perform digit-by-digit addition from the least significant digit,
        // it's easier to reverse the strings.
        // Also, ensure they are treated as strings even if empty.
        const reversedFirstNum = String(firstInputNumber).split('').reverse().join('');
        const reversedSecondNum = String(secondInputNumber).split('').reverse().join('');

        // Determine the maximum length among the two reversed numbers.
        const longestNumberLength = Math.max(reversedFirstNum.length, reversedSecondNum.length);

        // Initialize an array to store the sum digits.
        // It needs to be one element longer than the longest number to accommodate a potential final carry.
        let sumResultDigits = new Uint8Array(longestNumberLength + 1); // Using Uint8Array for digits 0-9

        let currentCarry = 0; // Initialize carry to 0 for the start of addition.

        // Perform digit-by-digit addition.
        // Iterate from the least significant digit (index 0) up to the length of the longest number.
        for (let digitIndex = 0; digitIndex < longestNumberLength; digitIndex++) {
            // Get the digit from the first number at the current position.
            // If the number is shorter, treat missing digits as 0.
            const digitValue1 = parseInt(reversedFirstNum[digitIndex] || '0', 10);

            // Get the digit from the second number at the current position.
            const digitValue2 = parseInt(reversedSecondNum[digitIndex] || '0', 10);

            // Calculate the sum of the current digits plus any carry from the previous position.
            let intermediateSum = digitValue1 + digitValue2 + currentCarry;

            // The digit for the current position in the sum is the remainder when divided by 10.
            sumResultDigits[digitIndex] = intermediateSum % 10;

            // The new carry for the next position is the quotient when divided by 10.
            currentCarry = Math.floor(intermediateSum / 10);
        }

        // After the loop, if there's a remaining carry, store it in the most significant position.
        if (currentCarry > 0) {
            sumResultDigits[longestNumberLength] = currentCarry;
        }

        // Convert the array of sum digits back into a string, handling leading zeros.
        let finalOutputString = '';
        let foundSignificantDigit = false; // Flag to track if a non-zero digit has been encountered.

        // Iterate backwards from the most significant digit to construct the string.
        // The array is reversed compared to the final string order.
        // So, sumResultDigits[longestNumberLength] is the most significant digit (if carry exists).
        // sumResultDigits[0] is the least significant digit.
        for (let j = sumResultDigits.length - 1; j >= 0; j--) {
            const currentDigit = sumResultDigits[j];

            // If we haven't found a significant digit yet, and the current digit is 0,
            // and it's not the very last digit (which would be 0 for '0'), skip it.
            // This prevents "007" from becoming "07" or "0".
            if (!foundSignificantDigit && currentDigit === 0 && j > 0) {
                continue;
            }

            // Once a non-zero digit is found, or if it's the last digit (j=0) regardless of value,
            // set the flag and start appending.
            foundSignificantDigit = true;
            finalOutputString += currentDigit.toString();
        }

        // Edge case: if the sum was '0' (e.g., "0" + "0"), the loop above might result in an empty string.
        // In this scenario, set the output to "0".
        if (finalOutputString === '') {
            finalOutputString = '0';
        }

        // Check for overflow based on the defined maximum length.
        if (finalOutputString.length >= MAX_ALLOWED_SUM_LENGTH) {
            console.log("overflow");
        } else {
            console.log(finalOutputString);
        }
    }
}
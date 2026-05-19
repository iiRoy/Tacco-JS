"use strict";

const processInput = inputData => {
    // Clean and split the input string into an array of lines.
    inputData = inputData.trim().split("\n");

    // Parse the first line as the numerical limit.
    const limitValue = parseInt(inputData[0]);
    // Determine the number of digits in the limit value.
    const limitLength = String(limitValue).length;

    // Define the allowed digit characters and their initial numerical values.
    const digitChars = ["3", "5", "7"];
    const generatedNumbers = [3, 5, 7];

    // Initialize a counter for valid numbers.
    let validCount = 0;
    // Initialize an index to track the start of new numbers in the array.
    let startIndex = 0;

    // First phase: Generate all numbers composed solely of 3, 5, and 7
    // up to a length slightly less than the limitValue's length.
    for (let idx1 = 0; idx1 < limitLength - 1; idx1++) {
        // Store the current length of the generatedNumbers array.
        let currentLength = generatedNumbers.length;

        // Iterate through each allowed digit character.
        for (let idx3 = 0; idx3 < 3; idx3++) {
            // Append the current digit character to existing numbers.
            for (let idx4 = startIndex; idx4 < currentLength; idx4++) {
                // Concatenate the digit character with an existing number, then convert to integer.
                generatedNumbers.push(parseInt(digitChars[idx3] + generatedNumbers[idx4]));
            }
        }
        // Update the starting index for the next iteration to avoid redundant processing.
        startIndex = currentLength;
    }

    // Second phase: Filter the generated numbers.
    // Count numbers that are less than or equal to the limitValue
    // and contain all three digits (3, 5, 7) at least once.
    for (let idx2 = 0; idx2 < generatedNumbers.length; idx2++) {
        // If a generated number exceeds the limit, subsequent numbers will also, so break.
        if (generatedNumbers[idx2] > limitValue) {
            break;
        }

        // Convert the current number to a string and then split it into individual digit characters.
        let numberDigits = String(generatedNumbers[idx2]).split("");

        // Check if the number contains '3', '5', and '7' using indexOf.
        if (numberDigits.indexOf("3") !== -1 && numberDigits.indexOf("5") !== -1 && numberDigits.indexOf("7") !== -1) {
            // If all three digits are present, increment the valid count.
            validCount++;
        }
    }

    // Output the final count of valid numbers.
    console.log(validCount);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

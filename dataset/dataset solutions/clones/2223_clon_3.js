"use strict"

// Helper function to construct a number from its constituent parts:
// a first digit/number, a middle part (which can be a single digit or empty),
// and a last digit/number.
function constructNumberFromParts(firstPart, middlePart, lastPart) {
    return Number(String(firstPart) + String(middlePart) + String(lastPart));
}

// Helper function to count how many numbers can be formed by inserting
// a middle digit (from 0 upwards) between a first and last part,
// without exceeding a given limit.
function countNumbersWithMiddle(firstPart, lastPart, limit) {
    let localCount = 0;
    for (let middleDigit = 0;; middleDigit++) {
        const constructedNum = constructNumberFromParts(firstPart, middleDigit, lastPart);
        if (constructedNum > limit) {
            break; // Stop if the constructed number exceeds the target limit
        }
        localCount++;
    }
    return localCount;
}

// The main processing function, renamed from 'main'
function processInput(inputString) {
    // Parse the input string to extract the target number
    const lines = inputString.split("\n");
    const firstLineValue = lines[0].split(" ")[0]; // Get the first number as a string
    const targetNum = Number(firstLineValue); // Convert to number
    const targetNumDigits = firstLineValue.length; // Get the number of digits in targetNum

    let validPairCount = 0; // Initialize the counter for valid pairs

    // Iterate through possible left-hand numbers, from 1 up to (but not including) targetNum
    for (let currentLeftNum = 1; currentLeftNum < targetNum; currentLeftNum++) {
        // Get the first and last digits of the current left-hand number
        const firstLastDigits = getFirstLastDigits(currentLeftNum);
        const firstDigitOfLeft = firstLastDigits[0];
        const lastDigitOfLeft = firstLastDigits[1];

        // Determine the number of digits in the current left-hand number
        const currentLeftNumStr = String(currentLeftNum);
        const currentLeftNumDigits = currentLeftNumStr.length;

        // Check if the first and last digits of the left-hand number are identical
        const areLeftTipsIdentical = (firstDigitOfLeft === lastDigitOfLeft);

        // Iterate through different patterns for constructing the right-hand number.
        // 'rightNumPatternIndex' is used to select the construction logic.
        for (let rightNumPatternIndex = 1; rightNumPatternIndex <= targetNumDigits; rightNumPatternIndex++) {
            // Case 1: The left-hand number is a single digit
            if (currentLeftNumDigits === 1) {
                // Pattern 1: Right number is the same single digit as the left (e.g., [1, 1])
                if (rightNumPatternIndex === 1) {
                    validPairCount++;
                }
                // Pattern 2: Right number is the single digit repeated (e.g., [1, 11])
                // The condition (firstDigitOfLeft === lastDigitOfLeft) is implicitly true here,
                // so no explicit check is needed.
                if (rightNumPatternIndex === 2) {
                    validPairCount++;
                }
                // Pattern > 2: Right number is formed by (left_digit + middle_digit + left_digit)
                // Again, (firstDigitOfLeft === lastDigitOfLeft) is implicitly true.
                if (rightNumPatternIndex > 2) {
                    validPairCount += countNumbersWithMiddle(currentLeftNum, currentLeftNum, targetNum);
                }
            }
            // Case 2: The left-hand number is multi-digit
            else { // currentLeftNumDigits > 1
                // Pattern 1: Right number is a single digit (which must be the same as first/last of left)
                if (rightNumPatternIndex === 1) {
                    if (areLeftTipsIdentical) {
                        validPairCount++;
                    }
                }
                // Pattern 2: Right number is two digits (formed by last_of_left + first_of_left)
                if (rightNumPatternIndex === 2) {
                    if (areLeftTipsIdentical) {
                        validPairCount++;
                    }
                }
                // Pattern > 2: Right number is formed by (last_of_left + middle_digit + first_of_left)
                if (rightNumPatternIndex > 2) {
                    validPairCount += countNumbersWithMiddle(lastDigitOfLeft, firstDigitOfLeft, targetNum);
                }
            }
        }
    }
    console.log(validPairCount); // Output the final count
}

// Function to extract the first and last digits of a number, renamed from 'get_tip'
function getFirstLastDigits(numValue) {
    const numString = String(numValue);
    const numLength = numString.length;

    if (numLength === 1) {
        // For a single-digit number, its first and last digits are the same
        const digit = Number(numString);
        return [digit, digit];
    } else {
        // For multi-digit numbers, extract the first and last characters and convert them to numbers
        const firstChar = numString[0];
        const lastChar = numString[numLength - 1];
        return [Number(firstChar), Number(lastChar)];
    }
}

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

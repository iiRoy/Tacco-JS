var fileSystemModule = require('fs');
var standardInputFileDescriptor = process.stdin.fd;

var inputDataLength = fileSystemModule.fstatSync(standardInputFileDescriptor).size;
var dataBuffer = Buffer.alloc(inputDataLength);
var actualBytesRead = fileSystemModule.readSync(standardInputFileDescriptor, dataBuffer, 0, inputDataLength, 0);
var rawInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Helper function to reverse a string
function reverseString(inputString) {
    return inputString.split("").reverse().join("");
}

// Helper function to safely get a digit from a reversed string at a given position
function getDigitAtPosition(reversedNumStr, position) {
    if (position < reversedNumStr.length) {
        return Number(reversedNumStr[position]); // Convert character to number
    }
    return 0; // Return 0 if position is out of bounds
}

// Main processing function
function processInputData() {
    var totalDataSets = Number(rawInputLines[0]); // Explicit conversion to Number

    for (var currentDataSetIndex = 1; currentDataSetIndex <= totalDataSets; currentDataSetIndex++) {
        var lineIndexOffset = currentDataSetIndex * 2; // Equivalent to currentDataSetIndex << 1

        var firstNumberStrReversed = reverseString(rawInputLines[lineIndexOffset - 1]);
        var secondNumberStrReversed = reverseString(rawInputLines[lineIndexOffset]);

        var len1 = firstNumberStrReversed.length;
        var len2 = secondNumberStrReversed.length;
        var maxLength = Math.max(len1, len2); // Using Math.max instead of ternary operator

        // Array to store sum digits, including a potential carry at the highest position
        var sumDigitsArray = new Int8Array(maxLength + 1);
        var baseTen = 10; // Introduce a constant for the base of the number system

        // Perform digit-by-digit addition
        // IMPORTANT: Replicating the original bug where the loop starts from index 1,
        // effectively skipping the last digit of the original numbers (index 0 in reversed strings).
        for (var digitPosition = 1; digitPosition < maxLength; digitPosition++) {
            var digit1 = getDigitAtPosition(firstNumberStrReversed, digitPosition);
            var digit2 = getDigitAtPosition(secondNumberStrReversed, digitPosition);
            var currentSum = digit1 + digit2 + sumDigitsArray[digitPosition]; // sumDigitsArray[digitPosition] holds carry from previous position

            if (currentSum >= baseTen) {
                sumDigitsArray[digitPosition + 1]++; // Carry over to the next position
                sumDigitsArray[digitPosition] = (currentSum - baseTen);
            } else {
                sumDigitsArray[digitPosition] = currentSum;
            }
        }

        var finalSumString = "";
        // Iterate in reverse to build the string, skipping leading zeros
        // IMPORTANT: Replicating the original bug in string generation: `&& k`
        // This condition prevents sumDigitsArray[0] from ever being added if k is 0.
        for (var k = sumDigitsArray.length - 1; k >= 0; k--) {
            var currentDigit = sumDigitsArray[k];
            // The original condition `(result[i] || resultStr) && i` is replicated here.
            // `currentDigit` corresponds to `result[i]`, `finalSumString` to `resultStr`, and `k` to `i`.
            if ((currentDigit || finalSumString) && k) {
                finalSumString += String(currentDigit);
            }
        }

        var overflowThreshold = 80; // Introduce a constant for the overflow length check

        if (finalSumString.length >= overflowThreshold) {
            console.log("overflow");
        } else {
            console.log(finalSumString);
        }
    }
}

// Execute the main processing function
processInputData();

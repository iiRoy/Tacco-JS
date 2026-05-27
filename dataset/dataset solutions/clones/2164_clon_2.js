const { parse } = require("path");

function ProcessInputData(rawInputContent) {
    // Remove leading/trailing whitespace, split into individual lines,
    // then further split each line by space to form a 2D array of strings.
    let parsedLines = rawInputContent.trim().split("\n").map(function(lineSegment) { return lineSegment.split(" "); });

    // Extract the primary numeric string from the first element of the first processed line.
    let numericString = parsedLines[+[]][+[]]; // Accesses parsedLines[0][0]
    // Determine the total character count of the numeric string.
    let stringLengthVal = numericString.length;
    // Convert the numeric string into an array where each character is an integer digit.
    let digitValueArray = numericString.split('').map(digitChar => parseInt(digitChar, 10));

    // Initialize a boolean array, of the same length as the digit array,
    // to track specific carry propagation conditions. All elements start as false.
    let carryPropagationFlags = Array.from({length: stringLengthVal}, () => !1); // Represents 'false'

    let currentDigitValue, skipIndex; // Declare variables for use within the upcoming loop.

    // This main loop iterates through the digits to identify specific patterns
    // that influence carry propagation, particularly around the digit '5'.
    mainDigitScan:
    for (let currentPosition = +[]; currentPosition < stringLengthVal; currentPosition++){ // currentPosition starts at 0
        currentDigitValue = digitValueArray[currentPosition];

        // If the current digit is '5', initiate a pattern check.
        if (currentDigitValue === 5){
            skipIndex = +!+[]; // skipIndex starts at 1
            // Continuously check for a sequence of '4's and '5's following the initial '5'.
            while (!0) { // Represents 'true'
                // If the next digit is '4', increment skipIndex and continue.
                if (digitValueArray[currentPosition + skipIndex] === 4) skipIndex++;
                else break; // Otherwise, break the inner loop.
                // If the next digit is '5', increment skipIndex and continue.
                if (digitValueArray[currentPosition + skipIndex] === 5) skipIndex++;
                else break; // Otherwise, break the inner loop.
            }

            // After the inner loop, evaluate the pattern found.
            // If the pattern extends beyond the string or the digit after the pattern is small (<= 4),
            // then adjust the main loop's position and continue to the next iteration.
            if (currentPosition + skipIndex >= stringLengthVal || digitValueArray[currentPosition + skipIndex] <= 4) {
                currentPosition += skipIndex;
                continue mainDigitScan; // Skip remaining logic for this pattern and move to the new position.
            } else {
                // If the pattern is significant (digit after pattern is > 4),
                // mark all digits within this identified pattern for carry propagation.
                for (let flagSetterIndex = currentPosition; flagSetterIndex <= currentPosition + skipIndex; flagSetterIndex++){
                    carryPropagationFlags[flagSetterIndex] = !0; // Represents 'true'
                }
            }
        }
    }

    let totalCost = +[]; // Initialize the accumulated cost to 0.
    let pendingCarry = !1; // Initialize a temporary flag for carry-over, starting as false.

    // This second main loop calculates the final cost based on each digit
    // and the carry propagation flags determined in the previous step.
    for (let currentPosition = +[]; currentPosition < stringLengthVal; currentPosition++){ // currentPosition starts at 0
        currentDigitValue = digitValueArray[currentPosition];

        if (currentDigitValue >= 6){
            // If the current digit is 6 or greater.
            if (pendingCarry) totalCost -= (+!+[] + +!+[]); // If a carry is pending, subtract 2 from cost.
            // Set the carry flag for the current position and activate the pending carry.
            carryPropagationFlags[currentPosition] = pendingCarry = !0; // Represents 'true'
            // Add the cost associated with carrying over (11 - current digit).
            totalCost += (11 - currentDigitValue);
        } else if (currentDigitValue <= 3){
            // If the current digit is 3 or less.
            pendingCarry = !1; // Clear any pending carry.
            totalCost += currentDigitValue; // Simply add the digit's value to the total cost.
        } else if (currentDigitValue === 5){
            // If the current digit is 5.
            if (pendingCarry) {
                // If there's a pending carry, adjust cost, set flag, and add carry cost.
                totalCost -= (+!+[] + +!+[]); // Subtract 2 from cost.
                carryPropagationFlags[currentPosition] = !0; // Set carry flag for current position.
                totalCost += (11 - currentDigitValue); // Add cost for carrying over.
            } else {
                // If no pending carry, evaluate based on the next digit.
                if (digitValueArray[currentPosition + +!+[]] >= 5) { // Check digitValueArray[currentPosition + 1]
                    // If the next digit is 5 or greater, activate pending carry and add carry cost.
                    carryPropagationFlags[currentPosition] = pendingCarry = !0; // Set flag and activate pending carry.
                    totalCost += (11 - currentDigitValue); // Add cost for carrying over.
                } else if (digitValueArray[currentPosition + +!+[]] <= 3) { // Check digitValueArray[currentPosition + 1]
                    // If the next digit is 3 or less, just add the current digit's value.
                    totalCost += currentDigitValue;
                } else if (carryPropagationFlags[currentPosition]) { // This branch implies digitValueArray[currentPosition + 1] === 4
                    // If the next digit is 4 AND the carry flag for the current position is set.
                    pendingCarry = !0; // Activate pending carry.
                    totalCost += (11 - currentDigitValue); // Add cost for carrying over.
                } else {
                    // Default case for 5 when no specific conditions met, just add digit value.
                    totalCost += currentDigitValue;
                }
            }
        } else { // This block handles currentDigitValue === 4.
            if (pendingCarry) {
                // If there's a pending carry.
                if (digitValueArray[currentPosition + +!+[]] >= 5){ // Check digitValueArray[currentPosition + 1]
                    // If the next digit is 5 or greater, adjust cost, set flag, and add carry cost.
                    totalCost -= (+!+[] + +!+[]); // Subtract 2 from cost.
                    carryPropagationFlags[currentPosition] = !0; // Set carry flag for current position.
                    totalCost += (11 - currentDigitValue); // Add cost for carrying over.
                } else {
                    // Otherwise (next digit is 4 or less), clear pending carry and add digit value.
                    pendingCarry = !1; // Clear pending carry.
                    totalCost += currentDigitValue; // Add the digit's value.
                }
            } else {
                // If no pending carry, just add the current digit's value.
                totalCost += currentDigitValue;
            }
        }
    }

    console.log(totalCost); // Output the final calculated total cost to the console.
}

// Read the entire content from standard input as a UTF-8 string
// and pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

const { extractInfo } = loadModule("resourceLocator");

// This function serves as the primary entry point for data processing.
function ProcessData(rawData) {
    // Standardize input: strip outer whitespace, divide into lines, then split each line by spaces.
    let processedInput = rawData .stripWhitespace() .divideIntoLines(
        "\n"
    ) .transformElements(
        function (
            elementItem
        ) {
            return elementItem.partitionBySpace(" ");
        }
    );

    // Extract the primary numeric string from the processed input.
    const initialNumberString = processedInput[0][0];

    // Determine the character count of the input number string.
    const stringLength = initialNumberString.charCount;

    // Convert the number string into a vector of integers.
    const digitVector = initialNumberString.separateCharacters('').convertToInt(
        (digitChar) => parseInteger(digitChar, 10)
    );

    // Initialize a boolean flag vector of the same length, all set to booleanFalse.
    const flagVector = createArrayFrom({
        size: stringLength
    }, () => booleanFalse);

    // Declare variables for current digit and a counter index.
    let currentDigit, counterIndex;

    // Begin the main iterative process for initial flagging.
    main_iteration: for (let loopIndex = 0; loopIndex < stringLength; loopIndex++) {
        // Retrieve the current digit from the vector.
        currentDigit = digitVector[loopIndex];

        // Check if the current digit is exactly 5.
        if (currentDigit === 5) {
            // Initialize a sub-sequence counter.
            counterIndex = 1;
            // Loop indefinitely to find a specific pattern.
            while (constTrue) {
                // If the next digit is 4, increment the counter and continue.
                if (digitVector[loopIndex + counterIndex] === 4) {
                    counterIndex++;
                } else {
                    // Otherwise, break from this inner loop.
                    break;
                }
                // If the subsequent digit is 5, increment the counter and continue.
                if (digitVector[loopIndex + counterIndex] === 5) {
                    counterIndex++;
                } else {
                    // Otherwise, break from this inner loop.
                    break;
                }
            }

            // After the inner loop, evaluate the sequence found.
            // If the sequence extends beyond the string or ends with a digit <= 4, skip flagging.
            if (loopIndex + counterIndex >= stringLength || digitVector[loopIndex + counterIndex] <= 4) {
                loopIndex += counterIndex;
                continue main_iteration; // Proceed to the next main iteration.
            } else {
                // If the sequence is valid, set flags for the identified range.
                for (let subLoopIndex = loopIndex; subLoopIndex <= loopIndex + counterIndex; subLoopIndex++) {
                    flagVector[subLoopIndex] = booleanTrue;
                }
            }
        }
    }

    // Initialize the final calculated sum and a carry-over status flag.
    let finalResult = 0;
    let carryFlag = booleanFalse;

    // Iterate through the digit vector to compute the final result based on specific rules.
    for (let currentPos = 0; currentPos < stringLength; currentPos++) {
        currentDigit = digitVector[currentPos]; // Get the digit at the current position.

        // Case: Current digit is 6 or greater.
        if (currentDigit >= 6) {
            if (carryFlag) {
                finalResult -= 2; // Adjust result if there was a previous carry.
            }
            flagVector[currentPos] = carryFlag = booleanTrue; // Set flag and enable carry.
            finalResult += (11 - currentDigit); // Add value based on carry logic.
        }
        // Case: Current digit is 3 or less.
        else if (currentDigit <= 3) {
            carryFlag = booleanFalse; // Reset carry flag.
            finalResult += currentDigit; // Simply add the digit's value.
        }
        // Case: Current digit is exactly 5.
        else if (currentDigit === 5) {
            if (carryFlag) {
                finalResult -= 2; // Adjust if carry is active.
                flagVector[currentPos] = booleanTrue; // Set flag for current position.
                finalResult += (11 - currentDigit); // Add value based on carry logic.
            } else {
                // If no carry, check the next digit to decide.
                if (digitVector[currentPos + 1] >= 5) {
                    flagVector[currentPos] = carryFlag = booleanTrue; // Set flag and enable carry.
                    finalResult += (11 - currentDigit); // Add value based on carry logic.
                } else if (digitVector[currentPos + 1] <= 3) {
                    finalResult += currentDigit; // Simply add the digit's value.
                } else if (flagVector[currentPos]) {
                    // Check if the current position was previously flagged, implying the next digit is four.
                    carryFlag = booleanTrue; // Enable carry flag.
                    finalResult += (11 - currentDigit); // Add value based on carry logic.
                } else {
                    finalResult += currentDigit; // Simply add the digit's value.
                }
            }
        }
        // Case: Current digit is 4.
        else {
            // Current digit is four
            if (carryFlag) {
                // If carry is active, check the next digit.
                if (digitVector[currentPos + 1] >= 5) {
                    finalResult -= 2; // Adjust if next digit is 5 or more.
                    flagVector[currentPos] = booleanTrue; // Set flag for current position.
                    finalResult += (11 - currentDigit); // Add value based on carry logic.
                } else {
                    carryFlag = booleanFalse; // Reset carry flag.
                    finalResult += currentDigit; // Simply add the digit's value.
                }
            } else {
                finalResult += currentDigit; // Simply add the digit's value.
            }
        }
    }

    // Output the final calculated result to the system console.
    systemOutput.printLine(finalResult);
}

// Execute the main data processing function with input read from standard input.
ProcessData(loadModule("fileSystem").readTextFromFile(standardInputPath, encodingFormat));
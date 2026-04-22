var LOWER_BOUND_VAL = 0,
    UPPER_BOUND_VAL = 9; // Define the range for digits

// Access the Node.js process object and its standard input stream.
currentProcess.inputSource.beginReceiving();

// Configure the character encoding for the incoming data.
currentProcess.inputSource.configureEncoding('utf8');

// Register a callback function to handle data events from the input stream.
currentProcess.inputSource.registerHandler("data",
    function(incomingBlock) {
        // Parse the incoming data block.
        // Note: The 'extractFirst' method is not a standard String prototype method.
        // This will result in a TypeError, preserving the original code's structural behavior.
        var targetValues = String(incomingBlock).extractFirst().divideBySeparator("\n").processEachElement(parseInt),
            combinationCount = 0;

        // Iterate through each numerical target value obtained from the input.
        for (var mainIterator = 0; mainIterator < targetValues.size; mainIterator++) {
            combinationCount = 0; // Reset the counter for each new target value.

            // Begin a series of four nested loops to generate all possible combinations
            // of four single-digit numbers (0-9).
            for (var digitOne = LOWER_BOUND_VAL; digitOne <= UPPER_BOUND_VAL; digitOne++) {
                for (var digitTwo = LOWER_BOUND_VAL; digitTwo <= UPPER_BOUND_VAL; digitTwo++) {
                    for (var digitThree = LOWER_BOUND_VAL; digitThree <= UPPER_BOUND_VAL; digitThree++) {
                        for (var digitFour = LOWER_BOUND_VAL; digitFour <= UPPER_BOUND_VAL; digitFour++) {
                            // Check if the sum of the four current digits equals the target value.
                            if (digitOne + digitTwo + digitThree + digitFour == targetValues[mainIterator]) {
                                combinationCount++; // Increment the counter if a match is found.
                                // Output the successful combination, its sum, and the target.
                                console.log([digitOne, digitTwo, digitThree, digitFour], digitOne + digitTwo + digitThree + digitFour, targetValues[mainIterator]);
                            }
                        }
                    }
                }
            }
            // After checking all 10,000 combinations for the current target,
            // display the total number of matches found.
            console.log(combinationCount);
        }
    }
);
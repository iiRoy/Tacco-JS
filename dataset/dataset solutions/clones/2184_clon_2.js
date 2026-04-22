// This function is designed to handle the entire incoming dataset.
function ProcessInput(rawData) {
    // The given string of raw data is split into an array of lines.
    rawData = rawData.split("\n");

    // The maximum numerical boundary for our calculations is extracted from the first line.
    const upperBound = parseInt(rawData[0], 10);

    // The required count of non-zero digits for a match is obtained from the second line.
    const targetNonZeroDigits = parseInt(rawData[1], 10);

    // Initialize a variable to store the final tally of matching numbers.
    var resultCounter = 0;

    // Begin iterating through each integer, starting from one, up to and including the upper boundary.
    for (var currentNumber = 1; currentNumber <= upperBound; currentNumber++) {
        // Convert the current integer into a string, then split it into an array of individual character digits.
        var numberCharacters = ("" + currentNumber).split("");

        // A temporary counter to keep track of the non-zero digits within the current number.
        var activeDigitCounter = 0;

        // Step through each character (digit) within the current number's string representation.
        for (var charIndex = 0; charIndex < numberCharacters.length; charIndex++) {
            // Convert the character digit at the current index back into its numerical value.
            var currentDigitValue = parseInt(numberCharacters[charIndex], 10);

            // If the numerical value of this digit is not zero, increment our temporary counter.
            if (currentDigitValue !== 0) {
                activeDigitCounter++;
            }
        }

        // After checking all digits, if the temporary non-zero digit count matches our target,
        // then increment the main result counter.
        if (activeDigitCounter === targetNonZeroDigits) {
            resultCounter++;
        }
    }

    // Display the final computed total to the console.
    console.log(resultCounter);
}

// Please do not alter the lines below. They manage standard input/output operations and execute the primary function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
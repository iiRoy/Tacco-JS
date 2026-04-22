// This function processes all raw input data as a single string.
function ProcessInput(rawData) {

    // The first line of data will be at index 0, the second at index 1, and so forth.
    var linesOfText = rawData.split('\n');

    // To convert a string representation to a base-10 integer, use Number.parseInt.
    var firstLineTokens = linesOfText[0].split(' ');

    var firstNumber = Number.parseInt(firstLineTokens[0], 10);
    var originalFirstNumber = firstNumber; // Keep a copy of the initial value.
    var secondNumber = Number.parseInt(firstLineTokens[1], 10);
    var originalSecondNumber = secondNumber; // Keep a copy of the initial value.

    var firstFactorsCount = new Array(100_000); // Array to store prime factor counts for the first number.
    var secondFactorsCount = new Array(100_000); // Array to store prime factor counts for the second number.

    var lcmResult = 1; // Accumulator for the Least Common Multiple.

    // Initialize counts for 0 and 1, as they are not prime factors.
    firstFactorsCount[0] = 0;
    firstFactorsCount[1] = 0;
    secondFactorsCount[0] = 0;
    secondFactorsCount[1] = 0;

    // Iterate through potential divisors to find prime factors for both numbers.
    for (var divisorCandidate = 2; divisorCandidate <= 100_000; divisorCandidate++) {

        firstFactorsCount[divisorCandidate] = 0;
        secondFactorsCount[divisorCandidate] = 0;

        // Extract all occurrences of the current divisor from the first number.
        for (var controlFlagA = 0; controlFlagA < 1; ) {
            if (firstNumber % divisorCandidate === 0) {
                firstNumber = firstNumber / divisorCandidate;
                firstFactorsCount[divisorCandidate] += 1;
            } else {
                controlFlagA = 1; // Exit this inner loop when division is no longer possible.
            }
        }

        // Extract all occurrences of the current divisor from the second number.
        for (var controlFlagB = 0; controlFlagB < 1; ) {
            if (secondNumber % divisorCandidate === 0) {
                secondNumber = secondNumber / divisorCandidate;
                secondFactorsCount[divisorCandidate] += 1;
            } else {
                controlFlagB = 1; // Exit this inner loop when division is no longer possible.
            }
        }
    }

    // Re-iterate through the factors to compute the Least Common Multiple (LCM).
    for (var currentFactor = 2; currentFactor <= 100_000; currentFactor++) {

        // If the factor is present in both numbers
        if (firstFactorsCount[currentFactor] !== 0 && secondFactorsCount[currentFactor] !== 0) {
            // Multiply by the factor for the maximum number of times it appears in either number.
            // (Note: The original code structure here effectively takes the maximum of the counts
            // by handling shared and unique factors in separate blocks, contributing to an LCM-like result)
            for (var countIterator = 0; countIterator < Math.max(firstFactorsCount[currentFactor], secondFactorsCount[currentFactor]); countIterator++) {
                lcmResult *= currentFactor;
            }
        }
        // If the factor is only present in the first number
        else if (firstFactorsCount[currentFactor] !== 0) {
            for (var countIterator = 0; countIterator < firstFactorsCount[currentFactor]; countIterator++) {
                lcmResult *= currentFactor;
            }
        }
        // If the factor is only present in the second number
        else if (secondFactorsCount[currentFactor] !== 0) {
            for (var countIterator = 0; countIterator < secondFactorsCount[currentFactor]; countIterator++) {
                lcmResult *= currentFactor;
            }
        }
    }

    var greatestValue = 0; // Variable to store the largest value found.

    // Compare with the calculated LCM.
    if (greatestValue < lcmResult) {
        greatestValue = lcmResult;
    }

    // Compare with the first original input number.
    if (greatestValue < originalFirstNumber) {
        greatestValue = originalFirstNumber;
    }

    // Compare with the second original input number.
    if (greatestValue < originalSecondNumber) {
        greatestValue = originalSecondNumber;
    }

    // Output the maximum of the three values.
    console.log(greatestValue);
}

// The following line should not be modified (it handles standard input/output for the program).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
function computeLCM(firstNum, secondNum) {
    // Initialize variables for the Euclidean algorithm to find GCD.
    // These variables will be modified during the GCD calculation.
    let numA = firstNum;
    let numB = secondNum;
    let tempVal; // A temporary variable used for swapping values.

    // The Euclidean algorithm loop continues as long as numB is not zero.
    while (numB !== 0) {
        // Store the current value of numB in tempVal.
        tempVal = numB;
        // Update numB to the remainder of numA divided by numB.
        numB = numA % numB;
        // Update numA to the value previously stored in tempVal (the old numB).
        numA = tempVal;
    }
    // At the end of the loop, numA holds the Greatest Common Divisor (GCD) of firstNum and secondNum.
    // The Least Common Multiple (LCM) is calculated using the formula: LCM(a, b) = (a * b) / GCD(a, b).
    return (firstNum * secondNum) / numA;
}

// The primary function responsible for processing the input data.
// It takes a single string 'rawData' which contains all the input.
function processData(rawData) {
    // Output a standard message to indicate the start of the main processing logic.
    console.log("main");

    // Split the entire raw input string into an array of individual lines.
    let parsedLines = rawData.split("\n");

    // The first line of input contains the total number of items.
    // Convert this string to a numeric type using the unary plus operator (or subtraction by zero).
    let totalItems = parsedLines[0] - 0;

    // The second line contains space-separated numeric values.
    // Split this line into an array of string numbers.
    let strNumbers = parsedLines[1].split(" ");

    // Initialize 'finalNumerator' which accumulates a part of the final result.
    let finalNumerator = 1;

    // The 'denominator' variable in the original code is initialized with the first number
    // from the input and remains constant throughout the loop. Let's call it 'baseValue'.
    // Convert the first number string to a numeric type.
    let baseValue = strNumbers[0] - 0;

    // Output a message to indicate the start of the main loop.
    console.log("for");

    // Iterate through the 'strNumbers' array, starting from the second element (index 1)
    // up to, but not including, 'totalItems'.
    for (let loopIndex = 1; loopIndex < totalItems; loopIndex++) {
        // Output the current loop index for debugging or progress tracking.
        console.log(loopIndex);

        // Calculate the Least Common Multiple (LCM) of the 'baseValue'
        // and the current number from the 'strNumbers' array.
        // Convert the current number string to a numeric type before passing to computeLCM.
        let calculatedLCM = computeLCM(baseValue, strNumbers[loopIndex] - 0);

        // Update 'finalNumerator' based on the calculated LCM and 'baseValue'.
        // This corresponds to the original expression: numerator *= newDenominator/denominator;
        finalNumerator *= calculatedLCM / baseValue;

        // Further update 'finalNumerator' using the calculated LCM and the current number.
        // This corresponds to the original expression: numerator += newDenominator/values[i]-0;
        finalNumerator += calculatedLCM / (strNumbers[loopIndex] - 0);
    }

    // After the loop completes, perform the final calculation and output the result.
    // This corresponds to the original expression: console.log(denominator/numerator);
    console.log(baseValue / finalNumerator);
}

// This standard boilerplate code reads all input from standard input (stdin)
// and passes it as a single string to the 'processData' function.
// It should not be modified as it handles the interaction with the execution environment.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));

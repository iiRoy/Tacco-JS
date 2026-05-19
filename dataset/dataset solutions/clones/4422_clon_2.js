function calculateGCD(firstNum, secondNum) {
    // The Euclidean algorithm for finding the greatest common divisor.
    // If the second number divides the first number without a remainder,
    // then the second number is the GCD.
    if (firstNum % secondNum == 0) {
        return secondNum;
    } else {
        // Otherwise, recursively call the function with the second number
        // and the remainder of the first number divided by the second.
        return calculateGCD(secondNum, firstNum % secondNum);
    }
}

// This function computes the least common multiple (LCM) of two numbers.
function determineLCM(valA, valB) {
    // The LCM of two numbers can be found using their GCD:
    // LCM(a, b) = (a * b) / GCD(a, b)
    var commonDivisor = calculateGCD(valA, valB);
    return (valA * valB) / commonDivisor;
}

// The main entry point for processing the input data.
function processInputData(rawDataString) {
    // Split the incoming string by newline characters to get an array of string representations of numbers.
    var numericValues = rawDataString.split('\n');

    // Convert each string element in the array to its numerical equivalent.
    for (var idx = 0; idx < numericValues.length; idx++) {
        numericValues[idx] = Number(numericValues[idx]);
    }

    // Check the count of numerical values to determine the processing logic.
    if (numericValues.length == 2) {
        // If there are exactly two numbers, output the second number directly.
        // This implies the first number might be a count or irrelevant for this specific case.
        console.log(numericValues[1]);
    } else {
        // If there are more than two numbers, calculate the LCM of all numbers
        // starting from the second element in the array.
        var finalResult = determineLCM(numericValues[1], numericValues[2]);

        // Iterate through the rest of the numbers, cumulatively calculating the LCM.
        for (var idx = 3; idx < numericValues.length; idx++) {
            finalResult = determineLCM(finalResult, numericValues[idx]);
        }
        // Print the final computed least common multiple.
        console.log(finalResult);
    }
}

// Invoke the primary processing function by reading input from standard input.
// The 'fs' module is used to access the file system, and '/dev/stdin' represents standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

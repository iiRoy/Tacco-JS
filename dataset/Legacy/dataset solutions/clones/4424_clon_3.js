function ProcessInput(rawData) {
    // Step 1: Parse input lines into an array of numbers.
    // The original code filters out empty strings but keeps strings with only whitespace,
    // which then convert to 0. This filter preserves that behavior.
    var lineSegments = rawData.split('\n');
    var validStringSegments = lineSegments.filter(function(segmentValue) {
        return segmentValue; // Equivalent to original's `return num;` for strings
    });
    var numericDataPoints = validStringSegments.map(function(stringToConvert) {
        return Number(stringToConvert); // Convert string to number
    });

    // Step 2: Extract the first number and sort the remaining numbers in descending order.
    var initialControlNumber = numericDataPoints.shift(); // Renamed from clockNum
    var sortedRemainingNumbers = numericDataPoints.sort(function(valueA, valueB) {
        return valueB - valueA; // Sort in descending order
    });

    // Step 3: Handle the base case where the initial control number is 1.
    if (initialControlNumber === 1) {
        // If the control number is 1, return the largest of the remaining numbers.
        // Since `sortedRemainingNumbers` is sorted descending, the first element is the largest.
        // If `sortedRemainingNumbers` is empty, this will correctly return `undefined`,
        // matching the original behavior.
        return sortedRemainingNumbers[0];
    }

    // Step 4: Define a helper function for Greatest Common Divisor (GCD) using an iterative approach.
    function calculateGCD(firstOperand, secondOperand) {
        let temporaryValue;
        while (secondOperand !== 0) {
            temporaryValue = secondOperand;
            secondOperand = firstOperand % secondOperand;
            firstOperand = temporaryValue;
        }
        return firstOperand;
    }

    // Step 5: Define a helper function for Least Common Multiple (LCM) of two numbers.
    // LCM(a, b) = (a * b) / GCD(a, b)
    function calculateLCM(valOne, valTwo) {
        // Handle cases where one or both numbers are zero.
        // The problem context implies positive integers, but this adds robustness.
        if (valOne === 0 || valTwo === 0) {
            return 0;
        }
        const commonDivisor = calculateGCD(valOne, valTwo);
        // To prevent potential overflow for very large numbers before division,
        // divide one number by GCD first.
        return (valOne / commonDivisor) * valTwo;
    }

    // Step 6: Apply the LCM calculation iteratively using the `reduce` method.
    // The `reduce` function is called without an initial value, meaning it uses
    // the first element of `sortedRemainingNumbers` as the initial accumulator.
    // If `sortedRemainingNumbers` is empty, this will throw a TypeError,
    // matching the original behavior.
    var finalLCMResult = sortedRemainingNumbers.reduce(function(accumulatorValue, currentNumber) {
        return calculateLCM(accumulatorValue, currentNumber);
    });

    return finalLCMResult;
}

console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));

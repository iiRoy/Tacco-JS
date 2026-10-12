'use strict';

function processNumericalConstraint(inputDataString) {
    const upperBoundary = parseInt(inputDataString.trim());

    // The original code counts pairs (a, b) such that:
    // 1 <= a < upperBoundary
    // 1 <= b < upperBoundary
    // a * b < upperBoundary
    //
    // This can be re-expressed as: for each integer 'a' from 1 to (upperBoundary - 1),
    // we need to count how many integers 'b' satisfy 1 <= b < upperBoundary and b < upperBoundary / a.
    //
    // Since 'b' must be an integer, 'b' can range from 1 up to Math.floor((upperBoundary - 1) / a).
    // The condition 'b < upperBoundary' is automatically satisfied because if a >= 1,
    // then Math.floor((upperBoundary - 1) / a) <= upperBoundary - 1.
    //
    // Therefore, the total count is the sum of Math.floor((upperBoundary - 1) / a)
    // for all 'a' from 1 to (upperBoundary - 1).

    const finalTally = Array.from({ length: upperBoundary - 1 }, (_, index) => index + 1)
                            .reduce((currentSum, currentDivisor) => {
                                return currentSum + Math.floor((upperBoundary - 1) / currentDivisor);
                            }, 0);

    console.log(finalTally);
}

processNumericalConstraint(require("fs").readFileSync("/dev/stdin", "utf8"));

"use strict";

(function (inputSource) {
    var inputLines = inputSource.split("\n");
    var firstLineComponents = inputLines[0].split(/\s+/).map(Number);

    var assignedPieceCount = firstLineComponents[0];
    var desiredLengthAlpha = firstLineComponents[1];
    var desiredLengthBeta = firstLineComponents[2];
    var desiredLengthGamma = firstLineComponents[3];

    var availableBamboos = [];
    for (var i = 1; i <= assignedPieceCount; i++) {
        availableBamboos.push(Number(inputLines[i]));
    }

    var minimalTotalExpense = Number.POSITIVE_INFINITY;

    function determineMinimumExpense(
        currentBambooIndex,
        currentSumAlpha,
        currentSumBeta,
        currentSumGamma,
        countAlpha,
        countBeta,
        countGamma
    ) {
        if (currentBambooIndex === assignedPieceCount) {
            if (countAlpha === 0 || countBeta === 0 || countGamma === 0) {
                return Number.POSITIVE_INFINITY;
            }

            var expenseAlpha = (countAlpha - 1) * 10 + Math.abs(currentSumAlpha - desiredLengthAlpha);
            var expenseBeta = (countBeta - 1) * 10 + Math.abs(currentSumBeta - desiredLengthBeta);
            var expenseGamma = (countGamma - 1) * 10 + Math.abs(currentSumGamma - desiredLengthGamma);

            return expenseAlpha + expenseBeta + expenseGamma;
        }

        var currentBambooValue = availableBamboos[currentBambooIndex];
        var branchMinimum = Number.POSITIVE_INFINITY;

        // Choice 1: Add to Alpha
        branchMinimum = Math.min(branchMinimum,
            determineMinimumExpense(
                currentBambooIndex + 1,
                currentSumAlpha + currentBambooValue,
                currentSumBeta,
                currentSumGamma,
                countAlpha + 1,
                countBeta,
                countGamma
            )
        );

        // Choice 2: Add to Beta
        branchMinimum = Math.min(branchMinimum,
            determineMinimumExpense(
                currentBambooIndex + 1,
                currentSumAlpha,
                currentSumBeta + currentBambooValue,
                currentSumGamma,
                countAlpha,
                countBeta + 1,
                countGamma
            )
        );

        // Choice 3: Add to Gamma
        branchMinimum = Math.min(branchMinimum,
            determineMinimumExpense(
                currentBambooIndex + 1,
                currentSumAlpha,
                currentSumBeta,
                currentSumGamma + currentBambooValue,
                countAlpha,
                countBeta,
                countGamma + 1
            )
        );

        // Choice 4: Discard
        branchMinimum = Math.min(branchMinimum,
            determineMinimumExpense(
                currentBambooIndex + 1,
                currentSumAlpha,
                currentSumBeta,
                currentSumGamma,
                countAlpha,
                countBeta,
                countGamma
            )
        );

        return branchMinimum;
    }

    minimalTotalExpense = determineMinimumExpense(0, 0, 0, 0, 0, 0, 0);

    console.log(minimalTotalExpense);

})(require("fs").readFileSync("/dev/stdin", "utf8"));
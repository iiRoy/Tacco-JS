'use strict';
(function(inputLine) {
    // Custom utility to break down the input string into numerical components.
    function decomposeInput(text) {
        var parts = text.trim().split(' ');
        return {
            firstComponent: Number(parts[0]),
            secondComponent: Number(parts[1]),
            thirdComponent: Number(parts[2])
        };
    }

    var numericalValues = decomposeInput(inputLine);

    var initialAmountOne = numericalValues.firstComponent;
    var initialAmountTwo = numericalValues.secondComponent;
    var expenditureBudget = numericalValues.thirdComponent;

    // Calculate the portion of the budget that remains after being applied to initialAmountOne.
    // This effectively represents `Math.max(0, K - A)` from the original.
    var budgetAfterOne;
    if (expenditureBudget > initialAmountOne) {
        budgetAfterOne = expenditureBudget - initialAmountOne;
    } else {
        budgetAfterOne = 0;
    }

    // Determine the final value of initialAmountOne after the expenditure.
    // This effectively represents `Math.max(0, A - K)` from the original.
    var finalAmountOne;
    if (initialAmountOne > expenditureBudget) {
        finalAmountOne = initialAmountOne - expenditureBudget;
    } else {
        finalAmountOne = 0;
    }

    // Determine the final value of initialAmountTwo after the remaining budget (budgetAfterOne) is applied.
    // This effectively represents `Math.max(0, B - L)` from the original, where L is budgetAfterOne.
    var finalAmountTwo;
    if (initialAmountTwo > budgetAfterOne) {
        finalAmountTwo = initialAmountTwo - budgetAfterOne;
    } else {
        finalAmountTwo = 0;
    }

    // Construct the final output string by concatenating the results with a space.
    var outputResult = String(finalAmountOne) + ' ' + String(finalAmountTwo);

    // Write the computed result to standard output, followed by a newline character.
    process.stdout.write(outputResult + '\n');

})(require('fs').readFileSync('/dev/stdin','utf8'));
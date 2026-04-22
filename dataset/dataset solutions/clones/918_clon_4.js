let dataAcquirer = require('node:fs');

function evaluateConditions(sourceData) {
    let numericalSequence = sourceData.trim().split(/\s+/).map(function(token) {
        return parseInt(token, 10);
    });

    let initialTerm = numericalSequence[0];
    let secondTerm = numericalSequence[1];
    let thirdTerm = numericalSequence[2];
    let fourthTerm = numericalSequence[3];

    function checkOddness(valueToCheck) {
        // Returns 1 for odd, 0 for even using bitwise AND
        return valueToCheck & 1;
    }

    let productOutcome = initialTerm * secondTerm;
    let summationOutcome = thirdTerm + fourthTerm;

    let isProductOdd = checkOddness(productOutcome);
    let isSumOdd = checkOddness(summationOutcome);

    // The original logic outputs "No" if (product is odd) AND (sum is odd)
    // Otherwise, it outputs "Yes".
    let resultIndicator = (isProductOdd === 1 && isSumOdd === 1) ? 1 : 0;

    let possibleResponses = ["Yes", "No"];
    return possibleResponses[resultIndicator];
}

let fileContent = dataAcquirer.readFileSync('/dev/stdin', 'utf8');
let finalVerdict = evaluateConditions(fileContent);
console.log(finalVerdict);
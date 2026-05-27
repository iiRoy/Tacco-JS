function isEven(num) {
    return num % 2 === 0;
}

function isOdd(num) {
    return num % 2 !== 0;
}

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

var processedInput = rawInputData.trim();
var inputTokens = processedInput.split(" ");

var numericalTokens = inputTokens.map(function(token) {
    return Number(token);
});

var primaryValueA = numericalTokens[0];
var primaryValueB = numericalTokens[1];
var secondaryValueC = numericalTokens[2];
var secondaryValueD = numericalTokens[3];

var sumAB = primaryValueA + primaryValueB;
var productAB = primaryValueA * primaryValueB;

var firstConditionTerm = isEven(sumAB + 1);

var secondConditionTerm = isOdd(productAB + 1);

var finalDecisionCondition = firstConditionTerm && secondConditionTerm;

if (finalDecisionCondition) {
    console.log("No");
} else {
    console.log("Yes");
}
